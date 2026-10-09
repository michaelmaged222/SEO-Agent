// Audit orchestration: create runs (API/scheduler) and execute them (worker).
import type { Sql } from './db.ts';
import { HttpError } from './lib/http.ts';
import { enqueueJob } from './jobs.ts';
import { getPlan, getUsage, addUsage } from './entitlements.ts';
import { crawlSite, type BasePolicy } from './crawler/crawl.ts';
import { evaluate, fingerprint, healthScore, RULES, type Severity } from './crawler/checks.ts';
import { logActivity } from './activity.ts';

export const PRELIMINARY_PAGES = 10;
const CROSS_PAGE_RULES = ['duplicate_title', 'duplicate_meta_description'];

export interface SiteRow {
  id: string; tenant_id: string; domain: string; root_url: string; verified_at: Date | null;
}

export async function createAuditRun(
  sql: Sql,
  opts: { tenantId: string; siteId: string; kind: 'preliminary' | 'full'; trigger: 'manual' | 'scheduled' | 'onboarding'; userId: string | null; idempotencyKey?: string },
): Promise<{ runId: string }> {
  const [site] = await sql<SiteRow[]>`SELECT id, tenant_id, domain, root_url, verified_at FROM sites WHERE id = ${opts.siteId} AND tenant_id = ${opts.tenantId}`;
  if (!site) throw new HttpError(404, 'not_found');
  if (opts.kind === 'full' && !site.verified_at) throw new HttpError(403, 'site_not_verified', 'Verify ownership before running a full crawl.');
  const plan = await getPlan(sql, opts.tenantId);
  const ent = plan.entitlements;
  const pagesLimit = opts.kind === 'full'
    ? ent.max_pages_per_crawl
    : Math.min(PRELIMINARY_PAGES, site.verified_at ? ent.max_pages_per_crawl : ent.unverified_pages);

  return sql.begin(async (tx) => {
    const rows = await tx<{ id: string }[]>`
      INSERT INTO audit_runs (tenant_id, site_id, kind, trigger, status, pages_limit, created_by)
      VALUES (${opts.tenantId}, ${opts.siteId}, ${opts.kind}, ${opts.trigger}, 'queued', ${pagesLimit}, ${opts.userId})
      ON CONFLICT (site_id) WHERE status IN ('queued', 'running') DO NOTHING
      RETURNING id`;
    if (!rows[0]) throw new HttpError(409, 'audit_in_progress', 'A check is already running for this site.');
    const runId = rows[0].id;
    await enqueueJob(tx as unknown as Sql, {
      tenantId: opts.tenantId, siteId: opts.siteId, type: 'audit.run', payload: { runId },
      priority: opts.kind === 'preliminary' ? 1 : 5, idempotencyKey: opts.idempotencyKey ?? `audit:${runId}`,
    });
    return { runId };
  });
}

export interface ExecuteDeps { policy: BasePolicy; delayMs: number }

export async function executeAuditRun(sql: Sql, job: { tenant_id: string; site_id: string | null; payload: Record<string, unknown> }, deps: ExecuteDeps): Promise<void> {
  const runId = String(job.payload.runId ?? '');
  // Re-validate tenant/site context server-side; never trust the payload alone.
  const [run] = await sql<{ id: string; kind: 'preliminary' | 'full'; trigger: string; pages_limit: number; status: string }[]>`
    SELECT id, kind, trigger, pages_limit, status FROM audit_runs
    WHERE id = ${runId} AND tenant_id = ${job.tenant_id} AND site_id = ${job.site_id}`;
  if (!run) throw new Error('Audit run not found for this tenant/site (rejected).');
  if (run.status === 'succeeded') return; // idempotent: already done
  const [site] = await sql<SiteRow[]>`SELECT id, tenant_id, domain, root_url, verified_at FROM sites WHERE id = ${job.site_id} AND tenant_id = ${job.tenant_id}`;
  if (!site) throw new Error('Site not found for tenant (rejected).');
  if (run.kind === 'full' && !site.verified_at) {
    await finishFailed(sql, run.id, 'Site is not verified; full crawls need ownership verification.');
    return;
  }

  const plan = await getPlan(sql, job.tenant_id);
  const remaining = plan.entitlements.pages_per_month - (await getUsage(sql, job.tenant_id, 'pages_crawled'));
  const maxPages = Math.min(run.pages_limit, remaining);
  if (maxPages <= 0) {
    await finishFailed(sql, run.id, 'Monthly page budget for this plan is used up.');
    return;
  }

  await sql`UPDATE audit_runs SET status = 'running', started_at = now(), error = NULL WHERE id = ${run.id}`;
  await sql`DELETE FROM audit_pages WHERE run_id = ${run.id}`; // clean slate on retry
  const started = Date.now();

  const crawl = await crawlSite({
    rootUrl: site.root_url, domain: site.domain, mode: run.kind, maxPages,
    maxRequests: maxPages * 2 + 40, linkCheckLimit: run.kind === 'full' ? 40 : 0,
    delayMs: deps.delayMs, policy: deps.policy,
  });
  const { findings, evaluatedUrls } = evaluate(crawl, site.domain);
  const rootOk = crawl.pages.some((p) => p.url === crawl.rootUrl && p.status === 200);

  const result = await sql.begin(async (tx) => {
    for (const p of crawl.pages) {
      await tx`
        INSERT INTO audit_pages (run_id, tenant_id, url, final_url, status_code, response_ms, bytes, title, meta_description, h1_count, canonical, lang, noindex, word_count, error)
        VALUES (${run.id}, ${job.tenant_id}, ${p.url}, ${p.finalUrl}, ${p.status}, ${p.ms}, ${p.bytes},
                ${p.data?.title ?? null}, ${p.data?.metaDescription ?? null}, ${p.data?.h1s.length ?? null},
                ${p.data?.canonicals[0] ?? null}, ${p.data?.lang ?? null},
                ${p.data ? p.data.robots.includes('noindex') : null}, ${p.data?.wordCount ?? null}, ${p.error ?? null})`;
    }
    const seen: string[] = [];
    let created = 0;
    for (const f of findings) {
      const def = RULES[f.rule];
      const fp = fingerprint(site.id, f);
      if (seen.includes(fp)) continue;
      seen.push(fp);
      const [row] = await tx<{ inserted: boolean }[]>`
        INSERT INTO issues (tenant_id, site_id, fingerprint, rule, category, severity, scope, url, title, detail, evidence, first_seen_run, last_seen_run)
        VALUES (${job.tenant_id}, ${site.id}, ${fp}, ${f.rule}, ${def.category}, ${def.severity}, ${def.scope}, ${f.url}, ${def.title},
                ${f.detail.slice(0, 1000)}, ${tx.json(f.evidence as never)}, ${run.id}, ${run.id})
        ON CONFLICT (site_id, fingerprint) DO UPDATE SET
          last_seen_run = EXCLUDED.last_seen_run, last_seen_at = now(),
          occurrences = issues.occurrences + 1,
          detail = EXCLUDED.detail, evidence = EXCLUDED.evidence,
          severity = EXCLUDED.severity, title = EXCLUDED.title,
          status = CASE WHEN issues.status = 'ignored' THEN 'ignored' ELSE 'open' END,
          resolved_at = CASE WHEN issues.status = 'ignored' THEN issues.resolved_at ELSE NULL END
        RETURNING (xmax = 0) AS inserted`;
      if (row?.inserted) created++;
    }
    // Resolve issues that were checked this run and no longer occur.
    const resolved = await tx`
      UPDATE issues SET status = 'resolved', resolved_at = now()
      WHERE site_id = ${site.id} AND tenant_id = ${job.tenant_id} AND status = 'open'
        AND NOT (fingerprint = ANY(${seen}))
        AND (
          (scope = 'site' AND ${rootOk})
          OR (scope = 'page' AND url = ANY(${evaluatedUrls})
              AND (${run.kind === 'full'} OR NOT (rule = ANY(${CROSS_PAGE_RULES}))))
        )
      RETURNING id`;

    const open = await tx<{ rule: string; severity: Severity }[]>`SELECT rule, severity FROM issues WHERE site_id = ${site.id} AND status = 'open'`;
    const bySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    for (const i of open) bySeverity[i.severity] = (bySeverity[i.severity] ?? 0) + 1;
    const summary = {
      kind: run.kind,
      pages_crawled: crawl.pages.length,
      html_pages: crawl.pages.filter((p) => p.data).length,
      requests: crawl.requests,
      duration_ms: Date.now() - started,
      stopped_reason: crawl.stoppedReason,
      skipped_by_robots: crawl.skippedByRobots.length,
      robots_status: crawl.robots.status,
      sitemap_urls: crawl.sitemap.urls.length,
      sitemap_sources: crawl.sitemap.sources,
      issues_found_this_run: seen.length,
      new_issues: created,
      resolved_issues: resolved.length,
      open_by_severity: bySeverity,
      health_score: healthScore(open),
      health_score_note: 'Internal technical score (100 minus weighted open issues). Not a Google metric and not a ranking prediction.',
      measured: 'Technical facts observed by our crawler at the time of the check.',
      not_measured: 'Google rankings, impressions and clicks (needs Google Search Console, not connected).',
    };
    await tx`
      UPDATE audit_runs SET status = 'succeeded', finished_at = now(), pages_crawled = ${crawl.pages.length},
        requests_made = ${crawl.requests}, summary = ${tx.json(summary as never)}
      WHERE id = ${run.id}`;
    return summary;
  });

  await addUsage(sql, job.tenant_id, 'pages_crawled', crawl.pages.length);
  await logActivity(sql, {
    tenantId: job.tenant_id, actorKind: 'agent', action: 'audit.completed', target: `site:${site.id}`,
    detail: { run_id: run.id, kind: run.kind, pages: result.pages_crawled, new_issues: result.new_issues, resolved: result.resolved_issues },
  });

  // First-result flow: preliminary result is shown immediately; a verified site continues with a full crawl.
  if (run.kind === 'preliminary' && site.verified_at && run.trigger === 'onboarding') {
    try {
      await createAuditRun(sql, { tenantId: job.tenant_id, siteId: site.id, kind: 'full', trigger: 'onboarding', userId: null, idempotencyKey: `full-after:${run.id}` });
    } catch (e) {
      if (!(e instanceof HttpError) || e.code !== 'audit_in_progress') throw e;
    }
  }
}

export async function finishFailed(sql: Sql, runId: string, error: string): Promise<void> {
  await sql`UPDATE audit_runs SET status = 'failed', finished_at = now(), error = ${error.slice(0, 1000)} WHERE id = ${runId}`;
}
