import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, normalize } from 'node:path';
import { getSql, closeSql } from './db.ts';
import { config } from './config.ts';
import { HttpError, makeRes, parseCookies, readJsonBody, applySecurityHeaders, clientIp, type Req } from './lib/http.ts';
import { apiRoutes, type ApiDeps } from './routes/api.ts';
import { defaultPolicy } from './crawler/policy.ts';

const WEB_DIR = fileURLToPath(new URL('../web/', import.meta.url));
const STATIC: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };

export interface AppOptions extends ApiDeps { appOrigin: string; trustProxy: boolean }

export function createApp(opts: AppOptions): http.Server {
  const router = apiRoutes(opts);
  return http.createServer(async (raw, rawRes) => {
    const res = makeRes(rawRes);
    applySecurityHeaders(rawRes);
    try {
      const url = new URL(raw.url ?? '/', 'http://localhost');
      const method = (raw.method ?? 'GET').toUpperCase();

      if (!url.pathname.startsWith('/api/')) {
        if (method !== 'GET' && method !== 'HEAD') throw new HttpError(405, 'method_not_allowed');
        const file = url.pathname === '/' || !url.pathname.includes('.') ? 'index.html' : url.pathname.slice(1);
        const full = normalize(join(WEB_DIR, file));
        if (!full.startsWith(WEB_DIR)) throw new HttpError(404, 'not_found');
        const ext = full.slice(full.lastIndexOf('.'));
        const type = STATIC[ext];
        if (!type) throw new HttpError(404, 'not_found');
        let body: Buffer;
        try { body = await readFile(full); } catch { throw new HttpError(404, 'not_found'); }
        rawRes.setHeader('Cache-Control', ext === '.html' ? 'no-cache' : 'public, max-age=300');
        res.send(body, type);
        return;
      }

      // CSRF defence for cookie-authenticated API: state-changing requests must come from our origin.
      if (method !== 'GET' && method !== 'HEAD') {
        const origin = raw.headers.origin;
        if (origin !== opts.appOrigin) throw new HttpError(403, 'bad_origin', 'Cross-site request blocked.');
      }
      const match = router.match(method, url.pathname);
      if (match === null) throw new HttpError(404, 'not_found');
      if (match === 'method') throw new HttpError(405, 'method_not_allowed');
      const req: Req = {
        raw, method, path: url.pathname, query: url.searchParams, params: match.params, headers: raw.headers,
        ip: clientIp(raw, opts.trustProxy), cookies: parseCookies(raw.headers.cookie), body: await readJsonBody(raw),
      };
      await match.handler(req, res);
    } catch (e) {
      if (rawRes.headersSent) { rawRes.end(); return; }
      if (e instanceof HttpError) {
        res.status(e.status).json({ error: e.code, message: e.message });
      } else {
        // Never leak internals (or secrets) in responses; log server-side only.
        console.error('[api] unhandled error', e instanceof Error ? e.stack : e);
        res.status(500).json({ error: 'internal_error', message: 'Something went wrong.' });
      }
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sql = getSql();
  const server = createApp({ sql, policy: defaultPolicy(), appOrigin: config.appOrigin, trustProxy: process.env.TRUST_PROXY === 'true' });
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  server.listen(config.port, '127.0.0.1', () => console.log(`[api] listening on http://127.0.0.1:${config.port}`));
  const shutdown = () => server.close(() => { void closeSql(); });
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
