import { readFileSync, existsSync } from 'node:fs';

// Minimal .env loader (no dependency). Real environment variables win over .env.
function loadDotEnv(path = '.env'): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m || line.trimStart().startsWith('#')) continue;
    const key = m[1]!;
    const value = m[2]!.replace(/^['"]|['"]$/g, '');
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadDotEnv();

function req(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') throw new Error(`Missing required env var ${name}`);
  return v;
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';
const devProxy = process.env.CRAWL_DEV_PROXY || undefined;
if (isProduction && devProxy) {
  throw new Error('CRAWL_DEV_PROXY is not allowed in production (it disables DNS pinning for SSRF protection).');
}

export const config = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT ?? 5100),
  appOrigin: req('APP_ORIGIN', 'http://localhost:5100'),
  databaseUrl: req('DATABASE_URL', 'postgres://seo:seo@localhost:5432/seo_dev'),
  workerPollMs: Number(process.env.WORKER_POLL_MS ?? 2000),
  schedulerEnabled: (process.env.SCHEDULER_ENABLED ?? 'true') === 'true',
  crawlUserAgent: process.env.CRAWL_USER_AGENT ?? 'PetsySEOBot/0.1 (+https://seo.pet-sy.com/bot)',
  crawlDevProxy: devProxy,
  sessionTtlDays: 14,
};
