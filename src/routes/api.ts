import type { Sql } from '../db.ts';
import { Router, HttpError, type Req, type Res } from '../lib/http.ts';
import { obj, str, strList, oneOf, bool, uuidParam, EMAIL, LANG_TAG } from '../lib/validate.ts';
import { hashPassword, verifyPassword, randomToken } from '../lib/crypto.ts';
import { rateLimit } from '../lib/ratelimit.ts';
import { createSession, getSession, requireSession, destroySession, SESSION_COOKIE } from '../auth.ts';
import { requireTenant, slugify } from '../tenancy.ts';
import { getPlan, getUsage, tryConsume, refundUsage } from '../entitlements.ts';
import { normalizeSiteInput, checkVerification, VERIFY_META_NAME, VERIFY_FILE_PATH, VERIFY_DNS_PREFIX, type VerifyMethod } from '../sites.ts';
import { createAuditRun } from '../audit.ts';
import { logActivity } from '../activity.ts';
import { RULES } from '../crawler/checks.ts';
import type { BasePolicy } from '../crawler/crawl.ts';
import { config } from '../config.ts';

export interface ApiDeps {
  sql: Sql;
  policy: BasePolicy;
  resolveTxt?: (host: string) => Promise<string[][]>;
  /** Max audits per domain per hour across ALL tenants (abuse protection for unverified domains). */
  perDomainHourlyAudits?: number;
}

const DUMMY_HASH_PROMISE = hashPassword(randomToken());

function setSessionCookie(res: Res, token: string): void {
  res.setCookie(SESSION_COOKIE, token, { secure: config.isProduction, httpOnly: true, sameSite: 'Lax', maxAgeSeconds: config.sessionTtlDays * 86400 });
}

async function uniqueSlug(sql: Sql, name: string): Promise<string> {
  const base = slugify(name);
  for (let i = 0; i < 20; i++) {
    const slug = i === 0 ? base : `${base}-${randomToken(3).toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const [hit] = await sql`SELECT 1 FROM tenants WHERE slug = ${slug}`;
    if (!hit) return slug;
  }
  throw new HttpError(500, 'slug_failed');
}

async function createTenant(sql: Sql, userId: string, name: string, industry: string): Promise<string> {
  const slug = await uniqueSlug(sql, name);
  return sql.begin(async (tx) => {
    const [t] = await tx<{ id: string }[]>`INSERT INTO tenants (name, slug, industry) VALUES (${name}, ${slug}, ${industry}) RETURNING id`;
    await tx`INSERT INTO tenant_members (tenant_id, user_id, role) VALUES (${t!.id}, ${userId}, 'owner')`;
    await tx`INSERT INTO tenant_subscriptions (tenant_id, plan_id, status) VALUES (${t!.id}, 'free', 'free')`;
    return t!.id;
  });
}

/** Honest, explicit status of every capability the product will have. */
function capabilities(planIntegrations: string[], autonomy: number) {
  return [
    { key: 'technical_audit', name: 'Technical SEO audit', status: 'available', note: 'Read-only crawl with evidence-backed findings.' },
    { key: 'scheduler', name: 'Daily automatic checks', status: 'available', note: 'Verified sites on plans that include scheduling.' },
    { key: 'google_search_console', name: 'Google Search Console', status: 'not_configured', note: planIntegrations.includes('google_search_console') ? 'Included in your plan; the Google connection is not built yet. No search metrics are shown until it is.' : 'Not included in your plan.' },
    { key: 'keyword_research', name: 'Keyword clusters & page mapping', status: 'not_implemented', note: 'Planned. Will label data sources and confidence; no invented search volumes.' },
    { key: 'content_studio', name: 'Content Studio (briefs & article drafts)', status: 'not_implemented', note: 'Planned. Drafts only, with source and fact checks and your approval.' },
    { key: 'wordpress', name: 'WordPress connector', status: 'not_implemented', note: 'Planned. Without it, the product gives recommendations only.' },
    { key: 'github', name: 'GitHub pull-request connector', status: 'not_implemented', note: 'Planned for custom-coded sites (e.g. Next.js).' },
    { key: 'auto_fixes', name: 'Safe automatic fixes', status: 'not_implemented', note: `Your workspace is at autonomy level ${autonomy} (${['audit only', 'recommendations', 'low-risk fixes', 'extended'][autonomy]}).` },
    { key: 'billing', name: 'Billing & payments', status: 'not_configured', note: 'Plans and limits are enforced; no payment provider is connected and no prices are set.' },
    { key: 'reports', name: 'Owner reports (email)', status: 'not_implemented', note: 'Planned. Results are visible in the dashboard today.' },
  ];
}

export function apiRoutes(deps: ApiDeps): Router {
  const { sql } = deps;
  const r = new Router();
  const perDomainLimit = deps.perDomainHourlyAudits ?? 6;

  // ---------- health
  r.get('/api/health', async (_req, res) => {
    await sql`SELECT 1`;
    res.json({ ok: true });
  });

  // ---------- auth
  r.post('/api/auth/register', async (req, res) => {
    rateLimit(`register:${req.ip}`, 10, 60 * 60 * 1000);
    const b = obj(req.body);
    const email = str(b, 'email', { max: 254, pattern: EMAIL }).toLowerCase();
    const password = str(b, 'password', { min: 10, max: 200 });
    const name = str(b, 'name', { min: 1, max: 100 });
    const company = str(b, 'company', { min: 2, max: 100 });
    const industry = str(b, 'industry', { max: 100, optional: true });
    const [exists] = await sql`SELECT 1 FROM users WHERE lower(email) = ${email}`;
    if (exists) throw new HttpError(409, 'email_taken', 'An account with this email already exists. Please sign in.');
    const hash = await hashPassword(password);
    const [u] = await sql<{ id: string }[]>`INSERT INTO users (email, name, password_hash) VALUES (${email}, ${name}, ${hash}) RETURNING id`;
    const tenantId = await createTenant(sql, u!.id, company, industry);
    await logActivity(sql, { tenantId, actorUserId: u!.id, action: 'account.registered', target: `tenant:${tenantId}` });
    setSessionCookie(res, await createSession(sql, u!.id, tenantId));
    res.status(201).json({ ok: true });
  });

  r.post('/api/auth/login', async (req, res) => {
    const b = obj(req.body);
    const email = str(b, 'email', { max: 254 }).toLowerCase();
    const password = str(b, 'password', { max: 200 });
    rateLimit(`login-ip:${req.ip}`, 30, 15 * 60 * 1000);
    rateLimit(`login-email:${email}`, 10, 15 * 60 * 1000);
    const [u] = await sql<{ id: string; password_hash: string }[]>`SELECT id, password_hash FROM users WHERE lower(email) = ${email}`;
    // Compare against a dummy hash when the user doesn't exist, to keep timing similar.
    const ok = await verifyPassword(password, u?.password_hash ?? (await DUMMY_HASH_PROMISE));
    if (!u || !ok) throw new HttpError(401, 'invalid_credentials', 'Email or password is incorrect.');
    const [m] = await sql<{ tenant_id: string }[]>`SELECT tenant_id FROM tenant_members WHERE user_id = ${u.id} ORDER BY created_at LIMIT 1`;
    setSessionCookie(res, await createSession(sql, u.id, m?.tenant_id ?? null));
    res.json({ ok: true });
  });

  r.post('/api/auth/logout', async (req, res) => {
    const s = await getSession(sql, req);
    if (s) await destroySession(sql, s.tokenHash);
    res.setCookie(SESSION_COOKIE, '', { secure: config.isProduction, maxAgeSeconds: 0 });
    res.json({ ok: true });
  });

  r.get('/api/me', async (req, res) => {
    const s = await requireSession(sql, req);
    const memberships = await sql<{ id: string; name: string; role: string }[]>`
      SELECT t.id, t.name, m.role FROM tenant_members m JOIN tenants t ON t.id = m.tenant_id
      WHERE m.user_id = ${s.userId} ORDER BY t.name`;
    const active = memberships.find((m) => m.id === s.activeTenantId) ?? null;
    res.json({ user: { id: s.userId, email: s.email, name: s.name }, activeTenant: active, memberships });
  });

  // ---------- tenants / workspaces
  r.post('/api/tenants', async (req, res) => {
    const s = await requireSession(sql, req);
    rateLimit(`tenant-create:${s.userId}`, 5, 60 * 60 * 1000);
    const b = obj(req.body);
    const name = str(b, 'name', { min: 2, max: 100 });
    const industry = str(b, 'industry', { max: 100, optional: true });
    const tenantId = await createTenant(sql, s.userId, name, industry);
    await sql`UPDATE sessions SET active_tenant_id = ${tenantId} WHERE token_hash = ${s.tokenHash}`;
    await logActivity(sql, { tenantId, actorUserId: s.userId, action: 'tenant.created' });
    res.status(201).json({ id: tenantId });
  });

  r.post('/api/tenants/active', async (req, res) => {
    const s = await requireSession(sql, req);
    const tenantId = uuidParam(String(obj(req.body).tenantId ?? ''));
    const [m] = await sql`SELECT 1 FROM tenant_members WHERE tenant_id = ${tenantId} AND user_id = ${s.userId}`;
    if (!m) throw new HttpError(404, 'not_found'); // same answer as a non-existent workspace
    await sql`UPDATE sessions SET active_tenant_id = ${tenantId} WHERE token_hash = ${s.tokenHash}`;
    res.json({ ok: true });
  });

  r.get('/api/tenant', async (req, res) => {
    const ctx = await requireTenant(sql, req);
    const [t] = await sql<{ id: string; name: string; industry: string; autonomy_level: number }[]>`
      SELECT id, name, industry, autonomy_level FROM tenants WHERE id = ${ctx.tenantId}`;
    const plan = await getPlan(sql, ctx.tenantId);
    const [{ count: sites } = { count: 0 }] = await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM sites WHERE tenant_id = ${ctx.tenantId}`;
    const [{ count: seats } = { count: 0 }] = await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM tenant_members WHERE tenant_id = ${ctx.tenantId}`;
    res.json({
      tenant: t, role: ctx.role,
      plan: { id: plan.planId, name: plan.planName, status: plan.status, price: plan.priceCents === null ? 'not set (billing not configured)' : plan.priceCents, entitlements: plan.entitlements },
      usage: {
        sites, seats,
        manual_audits_today: await getUsage(sql, ctx.tenantId, 'manual_audits'),
        pages_crawled_this_month: await getUsage(sql, ctx.tenantId, 'pages_crawled'),
      },
      capabilities: capabilities(plan.entitlements.integrations, t!.autonomy_level),
    });
  });

  r.get('/api/activity', async (req, res) => {
    const ctx = await requireTenant(sql, req);
    const rows = await sql`
      SELECT a.action, a.target, a.detail, a.actor_kind, u.email AS actor_email, a.created_at
      FROM activity_log a LEFT JOIN users u ON u.id = a.actor_user_id
      WHERE a.tenant_id = ${ctx.tenantId} ORDER BY a.created_at DESC LIMIT 50`;
    res.json({ activity: rows });
  });

  // ---------- sites
  const siteColumns = sql`id, domain, root_url, industry, market, languages, goals, verification_token, verification_method, verified_at, schedule_enabled, created_at`;

  async function loadSite(tenantId: string, rawId: string | undefined) {
    const id = uuidParam(rawId);
    const [site] = await sql`SELECT ${siteColumns} FROM sites WHERE id = ${id} AND tenant_id = ${tenantId}`;
    if (!site) throw new HttpError(404, 'not_found');
    return site as unknown as { id: string; domain: string; root_url: string; verification_token: string; verified_at: Date | null };
  }

  function verificationInstructions(site: { domain: string; verification_token: string }) {
    return {
      meta: `<meta name="${VERIFY_META_NAME}" content="${site.verification_token}">`,
      file: { path: VERIFY_FILE_PATH, content: site.verification_token },
      dns: { host: site.domain.replace(/^www\./, ''), type: 'TXT', value: `${VERIFY_DNS_PREFIX}${site.verification_token}` },
    };
  }

  async function domainBudget(domain: string): Promise<void> {
    const [{ n } = { n: 0 }] = await sql<{ n: number }[]>`
      SELECT count(*)::int AS n FROM audit_runs ar JOIN sites s ON s.id = ar.site_id
      WHERE s.domain = ${domain} AND ar.created_at > now() - interval '1 hour'`;
    if (n >= perDomainLimit) throw new HttpError(429, 'domain_rate_limited', 'This website was checked many times in the last hour. Please try again later.');
  }

  r.get('/api/sites', async (req, res) => {
    const ctx = await requireTenant(sql, req);
    const sites = await sql`
      SELECT s.id, s.domain, s.root_url, s.verified_at, s.schedule_enabled, s.created_at,
        (SELECT row_to_json(x) FROM (SELECT id, kind, status, created_at, finished_at, summary->'health_score' AS health_score
           FROM audit_runs WHERE site_id = s.id ORDER BY created_at DESC LIMIT 1) x) AS last_run,
        (SELECT count(*)::int FROM issues i WHERE i.site_id = s.id AND i.status = 'open') AS open_issues
      FROM sites s WHERE s.tenant_id = ${ctx.tenantId} ORDER BY s.created_at`;
    res.json({ sites });
  });

  r.post('/api/sites', async (req, res) => {
    const ctx = await requireTenant(sql, req, 'editor');
    rateLimit(`site-create:${ctx.tenantId}`, 20, 60 * 60 * 1000);
    const b = obj(req.body);
    const { domain, rootUrl } = normalizeSiteInput(str(b, 'url', { min: 3, max: 300 }));
    const industry = str(b, 'industry', { max: 100, optional: true });
    const market = str(b, 'market', { max: 100, optional: true });
    const goals = str(b, 'goals', { max: 1000, optional: true });
    const languages = strList(b, 'languages', { maxItems: 10, maxLen: 12, pattern: LANG_TAG });
    const startCheck = b.startCheck === undefined ? true : bool(b, 'startCheck');
    const plan = await getPlan(sql, ctx.tenantId);

    const siteId = await sql.begin(async (tx) => {
      // Serialize site creation per tenant so the max_sites limit cannot be raced.
      await tx`SELECT id FROM tenants WHERE id = ${ctx.tenantId} FOR UPDATE`;
      const [{ count } = { count: 0 }] = await tx<{ count: number }[]>`SELECT count(*)::int AS count FROM sites WHERE tenant_id = ${ctx.tenantId}`;
      if (count >= plan.entitlements.max_sites) throw new HttpError(402, 'plan_limit_sites', `Your ${plan.planName} plan allows ${plan.entitlements.max_sites} website(s).`);
      const [dup] = await tx`SELECT 1 FROM sites WHERE tenant_id = ${ctx.tenantId} AND domain = ${domain}`;
      if (dup) throw new HttpError(409, 'site_exists', 'This website is already in your workspace.');
      const [s] = await tx<{ id: string }[]>`
        INSERT INTO sites (tenant_id, domain, root_url, industry, market, languages, goals, verification_token)
        VALUES (${ctx.tenantId}, ${domain}, ${rootUrl}, ${industry}, ${market}, ${languages}, ${goals}, ${randomToken(18)})
        RETURNING id`;
      return s!.id;
    });
    await logActivity(sql, { tenantId: ctx.tenantId, actorUserId: ctx.session.userId, action: 'site.added', target: `site:${siteId}`, detail: { domain } });

    let runId: string | null = null;
    let checkError: string | null = null;
    if (startCheck) {
      try {
        await domainBudget(domain);
        if (!(await tryConsume(sql, ctx.tenantId, 'manual_audits', 1, plan.entitlements.manual_audits_per_day))) {
          throw new HttpError(402, 'plan_limit_audits', 'Daily check limit reached for your plan.');
        }
        try {
          runId = (await createAuditRun(sql, { tenantId: ctx.tenantId, siteId, kind: 'preliminary', trigger: 'onboarding', userId: ctx.session.userId })).runId;
        } catch (e) {
          await refundUsage(sql, ctx.tenantId, 'manual_audits', 1);
          throw e;
        }
      } catch (e) {
        if (!(e instanceof HttpError)) throw e;
        checkError = e.message;
      }
    }
    res.status(201).json({ id: siteId, runId, checkError });
  });

  r.get('/api/sites/:id', async (req, res) => {
    const ctx = await requireTenant(sql, req);
    const site = await loadSite(ctx.tenantId, req.params.id);
    res.json({ site, verification: verificationInstructions(site) });
  });

  r.patch('/api/sites/:id', async (req, res) => {
    const ctx = await requireTenant(sql, req, 'editor');
    const site = await loadSite(ctx.tenantId, req.params.id);
    const b = obj(req.body);
    const patch: Record<string, unknown> = {};
    if ('industry' in b) patch.industry = str(b, 'industry', { max: 100, optional: true });
    if ('market' in b) patch.market = str(b, 'market', { max: 100, optional: true });
    if ('goals' in b) patch.goals = str(b, 'goals', { max: 1000, optional: true });
    if ('languages' in b) patch.languages = strList(b, 'languages', { maxItems: 10, maxLen: 12, pattern: LANG_TAG });
    if ('scheduleEnabled' in b) {
      const enabled = bool(b, 'scheduleEnabled');
      if (enabled) {
        if (!site.verified_at) throw new HttpError(403, 'site_not_verified', 'Verify the site before turning on daily checks.');
        const plan = await getPlan(sql, ctx.tenantId);
        if (!plan.entitlements.scheduled_audits) throw new HttpError(402, 'plan_no_schedule', `Daily checks are not included in the ${plan.planName} plan.`);
      }
      patch.schedule_enabled = enabled;
    }
    if (Object.keys(patch).length === 0) throw new HttpError(400, 'nothing_to_update');
    await sql`UPDATE sites SET ${sql(patch as never, Object.keys(patch) as never)} WHERE id = ${site.id} AND tenant_id = ${ctx.tenantId}`;
    await logActivity(sql, { tenantId: ctx.tenantId, actorUserId: ctx.session.userId, action: 'site.updated', target: `site:${site.id}`, detail: { fields: Object.keys(patch) } });
    res.json({ ok: true });
  });

  r.delete('/api/sites/:id', async (req, res) => {
    const ctx = await requireTenant(sql, req, 'admin');
    const site = await loadSite(ctx.tenantId, req.params.id);
    await sql`DELETE FROM jobs WHERE site_id = ${site.id} AND tenant_id = ${ctx.tenantId}`;
    await sql`DELETE FROM sites WHERE id = ${site.id} AND tenant_id = ${ctx.tenantId}`;
    await logActivity(sql, { tenantId: ctx.tenantId, actorUserId: ctx.session.userId, action: 'site.deleted', target: `site:${site.id}`, detail: { domain: site.domain } });
    res.json({ ok: true });
  });

  r.post('/api/sites/:id/verify', async (req, res) => {
    const ctx = await requireTenant(sql, req, 'editor');
    rateLimit(`verify:${ctx.tenantId}`, 20, 60 * 60 * 1000);
    const site = await loadSite(ctx.tenantId, req.params.id);
    const method = oneOf(obj(req.body), 'method', ['meta', 'file', 'dns'] as const) as VerifyMethod;
    const result = await checkVerification(site, method, deps.policy, deps.resolveTxt);
    if (result.ok) {
      await sql`UPDATE sites SET verified_at = coalesce(verified_at, now()), verification_method = ${method} WHERE id = ${site.id} AND tenant_id = ${ctx.tenantId}`;
      await logActivity(sql, { tenantId: ctx.tenantId, actorUserId: ctx.session.userId, action: 'site.verified', target: `site:${site.id}`, detail: { method } });
    }
    res.json(result);
  });

  r.post('/api/sites/:id/audits', async (req, res) => {
    const ctx = await requireTenant(sql, req, 'editor');
    const site = await loadSite(ctx.tenantId, req.params.id);
    const plan = await getPlan(sql, ctx.tenantId);
    await domainBudget(site.domain);
    if (!(await tryConsume(sql, ctx.tenantId, 'manual_audits', 1, plan.entitlements.manual_audits_per_day))) {
      throw new HttpError(402, 'plan_limit_audits', `Your ${plan.planName} plan allows ${plan.entitlements.manual_audits_per_day} manual checks per day.`);
    }
    const kind = site.verified_at ? 'full' : 'preliminary';
    let runId: string;
    try {
      ({ runId } = await createAuditRun(sql, { tenantId: ctx.tenantId, siteId: site.id, kind, trigger: 'manual', userId: ctx.session.userId }));
    } catch (e) {
      await refundUsage(sql, ctx.tenantId, 'manual_audits', 1);
      throw e;
    }
    await logActivity(sql, { tenantId: ctx.tenantId, actorUserId: ctx.session.userId, action: 'audit.requested', target: `site:${site.id}`, detail: { kind, run_id: runId } });
    res.status(202).json({ runId, kind });
  });

  r.get('/api/sites/:id/audits', async (req, res) => {
    const ctx = await requireTenant(sql, req);
    const site = await loadSite(ctx.tenantId, req.params.id);
    const runs = await sql`
      SELECT id, kind, trigger, status, pages_limit, pages_crawled, summary, error, created_at, started_at, finished_at
      FROM audit_runs WHERE site_id = ${site.id} AND tenant_id = ${ctx.tenantId} ORDER BY created_at DESC LIMIT 30`;
    res.json({ runs });
  });

  r.get('/api/audits/:id', async (req, res) => {
    const ctx = await requireTenant(sql, req);
    const id = uuidParam(req.params.id);
    const [run] = await sql`
      SELECT id, site_id, kind, trigger, status, pages_limit, pages_crawled, requests_made, summary, error, created_at, started_at, finished_at
      FROM audit_runs WHERE id = ${id} AND tenant_id = ${ctx.tenantId}`;
    if (!run) throw new HttpError(404, 'not_found');
    const pages = await sql`
      SELECT url, final_url, status_code, response_ms, title, meta_description, h1_count, canonical, lang, noindex, word_count, error
      FROM audit_pages WHERE run_id = ${id} AND tenant_id = ${ctx.tenantId} ORDER BY id LIMIT 500`;
    res.json({ run, pages });
  });

  r.get('/api/sites/:id/issues', async (req, res) => {
    const ctx = await requireTenant(sql, req);
    const site = await loadSite(ctx.tenantId, req.params.id);
    const status = req.query.get('status') ?? 'open';
    if (!['open', 'resolved', 'ignored', 'all'].includes(status)) throw new HttpError(400, 'invalid_status');
    const issues = await sql<{ rule: string }[]>`
      SELECT id, rule, category, severity, scope, url, title, detail, evidence, status, occurrences, first_seen_at, last_seen_at, resolved_at
      FROM issues WHERE site_id = ${site.id} AND tenant_id = ${ctx.tenantId}
        ${status === 'all' ? sql`` : sql`AND status = ${status}`}
      ORDER BY array_position(ARRAY['critical','high','medium','low','info'], severity), rule, url
      LIMIT 1000`;
    res.json({
      issues: issues.map((i) => {
        const def = (RULES as Record<string, { why: string; fix: string }>)[i.rule];
        return { ...i, why: def?.why ?? '', fix: def?.fix ?? '' };
      }),
    });
  });

  r.patch('/api/issues/:id', async (req, res) => {
    const ctx = await requireTenant(sql, req, 'editor');
    const id = uuidParam(req.params.id);
    const status = oneOf(obj(req.body), 'status', ['open', 'ignored'] as const);
    const rows = await sql`UPDATE issues SET status = ${status} WHERE id = ${id} AND tenant_id = ${ctx.tenantId} RETURNING id`;
    if (!rows.length) throw new HttpError(404, 'not_found');
    await logActivity(sql, { tenantId: ctx.tenantId, actorUserId: ctx.session.userId, action: `issue.${status}`, target: `issue:${id}` });
    res.json({ ok: true });
  });

  return r;
}

export type { Req };
