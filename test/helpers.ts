// Shared test harness: isolated test database, the API on a random port, and a local
// fixture "customer website" the crawler can audit (via the test-only port hook).
import http from 'node:http';
import type { AddressInfo } from 'node:net';

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? 'postgres://seo:seo@localhost:5432/seo_test';
process.env.APP_ORIGIN = 'http://app.test';
process.env.NODE_ENV = 'test';

const { getSql, closeSql } = await import('../src/db.ts');
const { migrateUp, migrateDown } = await import('../src/migrate.ts');
const { createApp } = await import('../src/server.ts');
const { resetRateLimits } = await import('../src/lib/ratelimit.ts');
import type { BasePolicy } from '../src/crawler/crawl.ts';

export const ORIGIN = 'http://app.test';
export const sql = getSql();

export async function resetDb(): Promise<void> {
  await sql`DROP TABLE IF EXISTS schema_migrations`;
  await sql.unsafe(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
  await migrateUp(sql);
  resetRateLimits();
}

export { migrateDown, closeSql };

// ---------------------------------------------------------------- fixture site
export type Pages = Record<string, { status?: number; body?: string; type?: string; headers?: Record<string, string> }>;

export async function startFixtureSite(pages: Pages): Promise<{ port: number; pages: Pages; requests: string[]; close: () => Promise<void> }> {
  const requests: string[] = [];
  const state = { pages };
  const server = http.createServer((req, res) => {
    requests.push(`${req.method} ${req.headers.host}${req.url}`);
    const p = state.pages[req.url ?? '/'];
    if (!p) { res.writeHead(404, { 'Content-Type': 'text/html' }); res.end('<html><title>Not found</title></html>'); return; }
    res.writeHead(p.status ?? 200, { 'Content-Type': p.type ?? 'text/html; charset=utf-8', ...(p.headers ?? {}) });
    res.end(p.body ?? '');
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const port = (server.address() as AddressInfo).port;
  return {
    port, requests,
    get pages() { return state.pages; },
    set pages(v: Pages) { state.pages = v; },
    close: () => new Promise<void>((r) => server.close(() => r())),
  } as never;
}

/** Policy that maps every hostname to the local fixture. Explicitly permissive - tests only. */
export function fixturePolicy(port: number): BasePolicy {
  return {
    userAgent: 'PetsySEOBot-test', timeoutMs: 5000, maxRedirects: 5,
    resolve: async () => ['127.0.0.1'], isAddressAllowed: () => true, testConnectPort: port,
  };
}

// ---------------------------------------------------------------- API client
export async function startApi(policy: BasePolicy, extra: { resolveTxt?: (h: string) => Promise<string[][]> } = {}) {
  const server = createApp({ sql, policy, appOrigin: ORIGIN, trustProxy: false, perDomainHourlyAudits: 1000, ...extra });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return { base, close: () => new Promise<void>((r) => { server.closeAllConnections(); server.close(() => r()); }) };
}

export class Client {
  cookie = '';
  base: string;
  constructor(base: string) { this.base = base; }
  async req(method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
    const res = await fetch(this.base + path, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(method !== 'GET' ? { Origin: ORIGIN } : {}),
        ...(this.cookie ? { Cookie: this.cookie } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get('set-cookie');
    if (set) this.cookie = set.split(';')[0]!;
    const text = await res.text();
    let json: any = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = text; }
    return { status: res.status, body: json };
  }
  get(p: string) { return this.req('GET', p); }
  post(p: string, b: unknown = {}) { return this.req('POST', p, b); }
  patch(p: string, b: unknown) { return this.req('PATCH', p, b); }
  del(p: string) { return this.req('DELETE', p); }
}

export async function registerUser(base: string, n: string, company = `Company ${n}`): Promise<Client> {
  const c = new Client(base);
  const r = await c.post('/api/auth/register', { email: `${n}@example.org`, password: 'correct horse battery', name: n, company });
  if (r.status !== 201) throw new Error(`register failed: ${JSON.stringify(r.body)}`);
  return c;
}

// ---------------------------------------------------------------- fixture HTML
export function page(o: { title?: string; desc?: string; h1?: string[]; canonical?: string; lang?: string; dir?: string; body?: string; head?: string; links?: string[] }): string {
  return `<!doctype html><html${o.lang !== undefined ? ` lang="${o.lang}"` : ' lang="en"'}${o.dir ? ` dir="${o.dir}"` : ''}><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
${o.title !== undefined ? `<title>${o.title}</title>` : ''}
${o.desc !== undefined ? `<meta name="description" content="${o.desc}">` : ''}
${o.canonical ? `<link rel="canonical" href="${o.canonical}">` : ''}
<meta property="og:title" content="x"><meta property="og:image" content="https://shop.fixture-site.com/og.png">
${o.head ?? ''}
</head><body>${(o.h1 ?? ['Heading']).map((h) => `<h1>${h}</h1>`).join('')}
${(o.links ?? []).map((l) => `<a href="${l}">link</a>`).join(' ')}
<p>${o.body ?? 'Healthy puppies raised with care. '.repeat(40)}</p></body></html>`;
}
