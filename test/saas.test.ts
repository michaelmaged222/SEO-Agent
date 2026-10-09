import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { sql, resetDb, closeSql, startFixtureSite, fixturePolicy, startApi, registerUser, Client, page, ORIGIN, type Pages } from './helpers.ts';
import { runOneJob, schedulerTick } from '../src/worker.ts';
import { enqueueJob, claimJob } from '../src/jobs.ts';
import { crawlSite } from '../src/crawler/crawl.ts';

const HOST = 'shop.fixture-site.com';
const U = (p: string) => `http://${HOST}${p}`;

function basePages(): Pages {
  return {
    '/': { body: page({ title: 'Fixture Puppies - Healthy Puppies For Families', desc: 'Healthy, vaccinated puppies from trusted breeders with full health records and support.', canonical: U('/'), links: ['/about', '/dup1', '/dup2', '/ar', '/broken'], head: '<script type="application/ld+json">{"@type":"Organization"}</script>' }) },
    '/about': { body: page({ title: 'About Fixture Puppies and our breeders', canonical: U('/about') }) },
    '/dup1': { body: page({ title: 'Same Title For Two Different Pages', desc: 'First page with its own long enough description for search results here.', canonical: U('/dup1') }) },
    '/dup2': { body: page({ title: 'Same Title For Two Different Pages', desc: 'Second page with its own long enough description for search results ok.', canonical: U('/dup2') }) },
    '/ar': { body: page({ title: 'جراء صحية للعائلات في الإمارات', desc: 'جراء صحية ومطعمة من مربين موثوقين مع سجلات صحية كاملة ودعم بعد البيع للعائلات.', canonical: U('/ar'), lang: 'ar' }) },
    '/old': { status: 301, headers: { Location: '/about' } },
    '/robots.txt': { type: 'text/plain', body: `User-agent: *\nDisallow: /private\n\nSitemap: ${U('/sitemap.xml')}` },
    '/sitemap.xml': { type: 'application/xml', body: `<?xml version="1.0"?><urlset>${['/', '/about', '/dup1', '/dup2', '/ar', '/old'].map((p) => `<url><loc>${U(p)}</loc></url>`).join('')}</urlset>` },
  };
}

let site: Awaited<ReturnType<typeof startFixtureSite>>;
let api: Awaited<ReturnType<typeof startApi>>;
let a: Client, b: Client;
let siteA = '', runA = '';
const txtRecords = new Map<string, string[][]>();
const deps = () => ({ policy: fixturePolicy(site.port), delayMs: 0 });
const work = async () => { let n = 0; while (await runOneJob(sql, 'test-worker', deps())) n++; return n; };
const openIssues = async (c: Client, id: string) => (await c.get(`/api/sites/${id}/issues`)).body.issues as any[];

before(async () => {
  await resetDb();
  site = await startFixtureSite(basePages());
  api = await startApi(fixturePolicy(site.port), { resolveTxt: async (h) => txtRecords.get(h) ?? [] });
  a = await registerUser(api.base, 'alice', 'Alice Pets');
  b = await registerUser(api.base, 'bob', 'Bob Garage');
});
after(async () => { await api.close(); await site.close(); await closeSql(); });

test('new user can register, add a site and get a real preliminary audit without Google/CMS', async () => {
  const me = await a.get('/api/me');
  assert.equal(me.status, 200);
  assert.equal(me.body.activeTenant.name, 'Alice Pets');
  assert.equal(me.body.activeTenant.role, 'owner');

  const created = await a.post('/api/sites', { url: `http://${HOST}`, industry: 'Pet retail', market: 'UAE', languages: ['en', 'ar'], goals: 'More puppy enquiries' });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  assert.ok(created.body.runId, 'preliminary check started on onboarding');
  siteA = created.body.id; runA = created.body.runId;

  assert.equal(await work(), 1);
  const run = await a.get(`/api/audits/${runA}`);
  assert.equal(run.body.run.status, 'succeeded', run.body.run.error);
  assert.equal(run.body.run.kind, 'preliminary');
  assert.ok(run.body.run.pages_crawled >= 6 && run.body.run.pages_crawled <= 10);
  assert.ok(!site.requests.some((r) => r.includes('/private')), 'robots.txt Disallow respected');

  const rules = new Set((await openIssues(a, siteA)).map((i) => `${i.rule} ${i.url ?? ''}`));
  for (const expected of [
    `meta_description_missing ${U('/about')}`, `duplicate_title ${U('/dup1')}`, `duplicate_title ${U('/dup2')}`,
    `rtl_missing ${U('/ar')}`, `page_not_found ${U('/broken')}`, `broken_internal_link ${U('/broken')}`, `sitemap_url_not_ok ${U('/old')}`,
  ]) assert.ok(rules.has(expected), `expected finding: ${expected}\nGot: ${[...rules].join('\n')}`);
  assert.ok(![...rules].some((r) => r.startsWith('robots_') || r.startsWith('sitemap_missing')), 'robots/sitemap present');
  const one = (await openIssues(a, siteA)).find((i) => i.rule === 'rtl_missing');
  assert.equal(one.evidence.lang, 'ar', 'findings carry evidence');
  assert.ok(one.fix.length > 0 && one.why.length > 0);
  assert.equal(typeof run.body.run.summary.health_score, 'number');
  assert.match(run.body.run.summary.not_measured, /Search Console/);
});

test('tenant isolation: another tenant cannot read or change anything by guessing IDs', async () => {
  const [issue] = await openIssues(a, siteA);
  const [tenantA] = await sql<{ tenant_id: string }[]>`SELECT tenant_id FROM sites WHERE id = ${siteA}`;
  const attempts: [string, () => Promise<{ status: number }>][] = [
    ['GET site', () => b.get(`/api/sites/${siteA}`)],
    ['GET issues', () => b.get(`/api/sites/${siteA}/issues`)],
    ['GET audits list', () => b.get(`/api/sites/${siteA}/audits`)],
    ['GET audit', () => b.get(`/api/audits/${runA}`)],
    ['PATCH site', () => b.patch(`/api/sites/${siteA}`, { goals: 'hijack' })],
    ['DELETE site', () => b.del(`/api/sites/${siteA}`)],
    ['POST audit', () => b.post(`/api/sites/${siteA}/audits`)],
    ['POST verify', () => b.post(`/api/sites/${siteA}/verify`, { method: 'meta' })],
    ['PATCH issue', () => b.patch(`/api/issues/${issue.id}`, { status: 'ignored' })],
    ['switch tenant', () => b.post('/api/tenants/active', { tenantId: tenantA!.tenant_id })],
    ['malformed id', () => b.get('/api/sites/not-a-uuid')],
  ];
  for (const [name, fn] of attempts) assert.equal((await fn()).status, 404, `${name} must be 404 for a foreign tenant`);

  assert.equal((await b.get('/api/sites')).body.sites.length, 0);
  const actB = (await b.get('/api/activity')).body.activity as any[];
  assert.ok(actB.every((x) => !String(x.target ?? '').includes(siteA)), 'activity log is tenant-scoped');
  assert.equal((await a.get(`/api/sites/${siteA}`)).status, 200, 'site untouched');
  assert.notEqual((await a.get(`/api/sites/${siteA}`)).body.site.goals, 'hijack');

  // Unauthenticated
  assert.equal((await new Client(api.base).get('/api/sites')).status, 401);
});

test('roles are enforced server-side and revoked membership loses access immediately', async () => {
  const { tenant_id } = (await sql<{ tenant_id: string }[]>`SELECT tenant_id FROM sites WHERE id = ${siteA}`)[0]!;
  const { id: bobId } = (await sql<{ id: string }[]>`SELECT id FROM users WHERE email = 'bob@example.org'`)[0]!;
  await sql`INSERT INTO tenant_members (tenant_id, user_id, role) VALUES (${tenant_id}, ${bobId}, 'viewer')`;
  assert.equal((await b.post('/api/tenants/active', { tenantId: tenant_id })).status, 200);
  assert.equal((await b.get(`/api/sites/${siteA}`)).status, 200, 'viewer can read');
  assert.equal((await b.post(`/api/sites/${siteA}/audits`)).status, 403, 'viewer cannot start audits');
  assert.equal((await b.del(`/api/sites/${siteA}`)).status, 403, 'viewer cannot delete');
  await sql`DELETE FROM tenant_members WHERE tenant_id = ${tenant_id} AND user_id = ${bobId}`;
  assert.equal((await b.get(`/api/sites/${siteA}`)).status, 403);
  assert.equal((await b.get('/api/sites')).status, 409, 'active tenant cleared after revocation');
});

test('CSRF: state-changing requests from another origin are blocked', async () => {
  const r1 = await a.req('POST', `/api/sites/${siteA}/audits`, {}, { Origin: 'https://evil.example' });
  assert.equal(r1.status, 403);
  const res = await fetch(`${api.base}/api/sites/${siteA}/audits`, { method: 'POST', headers: { Cookie: a.cookie } });
  assert.equal(res.status, 403, 'missing Origin is blocked');
});

test('repeat audit deduplicates issues; fixed problems resolve; ignored stay ignored', async () => {
  const before = await openIssues(a, siteA);
  const thin = before.find((i) => i.rule === 'rtl_missing');
  assert.equal((await a.patch(`/api/issues/${thin.id}`, { status: 'ignored' })).status, 200);

  assert.equal((await a.post(`/api/sites/${siteA}/audits`)).status, 202);
  assert.equal((await a.post(`/api/sites/${siteA}/audits`)).status, 409, 'no overlapping run for the same site');
  await work();
  const after1 = await openIssues(a, siteA);
  assert.equal(after1.length, before.length - 1, 'same issues, no duplicates (minus the ignored one)');
  const { n } = (await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM issues WHERE site_id = ${siteA}`)[0]!;
  assert.equal(n, before.length, 'no duplicate rows were created');
  assert.ok(after1.every((i) => i.occurrences === 2), 'occurrence counter incremented');

  // Owner fixes /about's description on their site.
  site.pages = { ...basePages(), '/about': { body: page({ title: 'About Fixture Puppies and our breeders', desc: 'Who we are, how we raise our puppies and how we support every family after adoption.', canonical: U('/about') }) } };
  await a.post(`/api/sites/${siteA}/audits`);
  await work();
  const all = (await a.get(`/api/sites/${siteA}/issues?status=all`)).body.issues as any[];
  const fixed = all.find((i) => i.rule === 'meta_description_missing' && i.url === U('/about'));
  assert.equal(fixed.status, 'resolved');
  assert.equal(all.find((i) => i.id === thin.id).status, 'ignored', 'ignored issues stay ignored');
});

test('ownership verification gates full crawls; DNS/meta checks work', async () => {
  const s = (await a.get(`/api/sites/${siteA}`)).body;
  assert.equal(s.site.verified_at, null);
  const fail = await a.post(`/api/sites/${siteA}/verify`, { method: 'meta' });
  assert.equal(fail.body.ok, false);

  txtRecords.set('shop.fixture-site.com', [[s.verification.dns.value]]);
  const okDns = await a.post(`/api/sites/${siteA}/verify`, { method: 'dns' });
  assert.equal(okDns.body.ok, true, okDns.body.detail);

  await sql`UPDATE usage_counters SET value = 0 WHERE metric = 'manual_audits'`; // free plan: 3/day already used above
  const started = await a.post(`/api/sites/${siteA}/audits`);
  assert.equal(started.status, 202, JSON.stringify(started.body));
  assert.equal(started.body.kind, 'full', 'verified site gets a full crawl');
  await work();
  const run = (await a.get(`/api/audits/${started.body.runId}`)).body.run;
  assert.equal(run.status, 'succeeded', run.error);
  assert.equal(run.kind, 'full');
});

test('plan limits are enforced by the API, not the UI', async () => {
  const second = await a.post('/api/sites', { url: 'another-shop.com' });
  assert.equal(second.status, 402);
  assert.equal(second.body.error, 'plan_limit_sites');

  const sched = await a.patch(`/api/sites/${siteA}`, { scheduleEnabled: true });
  assert.equal(sched.status, 402, 'free plan has no scheduled audits');

  await sql`UPDATE usage_counters SET value = 999 WHERE metric = 'manual_audits'`;
  assert.equal((await a.post(`/api/sites/${siteA}/audits`)).body.error, 'plan_limit_audits');
  await sql`UPDATE usage_counters SET value = 0 WHERE metric = 'manual_audits'`;
});

test('daily scheduler: verified opted-in sites only, at most once per day, no overlap', async () => {
  const { tenant_id } = (await sql<{ tenant_id: string }[]>`SELECT tenant_id FROM sites WHERE id = ${siteA}`)[0]!;
  await sql`UPDATE tenant_subscriptions SET plan_id = 'starter', status = 'trialing' WHERE tenant_id = ${tenant_id}`;
  assert.equal((await a.patch(`/api/sites/${siteA}`, { scheduleEnabled: true })).status, 200);
  const day = new Date('2030-01-01T05:00:00Z');
  assert.equal(await schedulerTick(sql, day), 1);
  assert.equal(await schedulerTick(sql, day), 0, 'idempotent within the same day');
  await work();
  assert.equal(await schedulerTick(sql, day), 0, 'still once per day after the run finished');
  assert.equal(await schedulerTick(sql, new Date('2030-01-02T05:00:00Z')), 1, 'next day schedules again');
  await work();
  const runs = (await a.get(`/api/sites/${siteA}/audits`)).body.runs as any[];
  assert.equal(runs.filter((r) => r.trigger === 'scheduled' && r.status === 'succeeded').length, 2);
});

test('jobs: idempotent enqueue, single claim under concurrency, retries then failure', async () => {
  const { id: tenantId } = (await sql<{ id: string }[]>`SELECT id FROM tenants LIMIT 1`)[0]!;
  const id1 = await enqueueJob(sql, { tenantId, type: 'unknown.type', payload: {}, idempotencyKey: 'k1', maxAttempts: 2 });
  const id2 = await enqueueJob(sql, { tenantId, type: 'unknown.type', payload: {}, idempotencyKey: 'k1' });
  assert.ok(id1);
  assert.equal(id2, null, 'duplicate key ignored');
  const claims = await Promise.all([claimJob(sql, 'w1'), claimJob(sql, 'w2'), claimJob(sql, 'w3')]);
  assert.equal(claims.filter(Boolean).length, 1, 'exactly one worker gets the job');
  await sql`UPDATE jobs SET status = 'queued', attempts = 0, locked_at = NULL WHERE id = ${id1}`;
  await runOneJob(sql, 'w', deps());
  let [j] = await sql<{ status: string; attempts: number; run_after: Date }[]>`SELECT status, attempts, run_after FROM jobs WHERE id = ${id1}`;
  assert.equal(j!.status, 'queued');
  assert.ok(j!.run_after.getTime() > Date.now(), 'backoff before retry');
  await sql`UPDATE jobs SET run_after = now() WHERE id = ${id1}`;
  await runOneJob(sql, 'w', deps());
  [j] = await sql<{ status: string; attempts: number; run_after: Date }[]>`SELECT status, attempts, run_after FROM jobs WHERE id = ${id1}`;
  assert.equal(j!.status, 'failed');
  assert.equal(j!.attempts, 2);
});

test('SSRF end-to-end: a domain resolving to a private address is never contacted', async () => {
  const before = site.requests.length;
  const result = await crawlSite({
    rootUrl: `https://${HOST}/`, domain: HOST, mode: 'preliminary', maxPages: 5, maxRequests: 20, linkCheckLimit: 0, delayMs: 0,
    policy: { userAgent: 't', timeoutMs: 2000, maxRedirects: 3, resolve: async () => ['10.0.0.7'], testConnectPort: site.port },
  });
  assert.equal(site.requests.length, before, 'no request reached the network');
  assert.match(result.pages[0]!.error ?? '', /private_address/);
});

test('API never trusts a client-supplied tenant id in the body', async () => {
  const { tenant_id } = (await sql<{ tenant_id: string }[]>`SELECT tenant_id FROM sites WHERE id = ${siteA}`)[0]!;
  const r = await b.post('/api/sites', { url: 'bob-garage.com', tenantId: tenant_id, tenant_id, startCheck: false });
  // Bob's active tenant was cleared in the roles test; re-select his own workspace first.
  const me = await b.get('/api/me');
  await b.post('/api/tenants/active', { tenantId: me.body.memberships[0].id });
  const r2 = await b.post('/api/sites', { url: 'bob-garage.com', tenantId: tenant_id, startCheck: false });
  assert.equal(r.status, 409);
  assert.equal(r2.status, 201);
  const [row] = await sql<{ tenant_id: string }[]>`SELECT tenant_id FROM sites WHERE id = ${r2.body.id}`;
  assert.notEqual(row!.tenant_id, tenant_id, 'site created in the session tenant, not the body tenant');
  void ORIGIN;
});
