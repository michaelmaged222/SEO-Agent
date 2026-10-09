// Bounded, polite, read-only crawl of one approved site.
import { safeFetch, FetchBlockedError, type FetchPolicy, type FetchResult } from './safe-fetch.ts';
import { extractPage, type PageData } from './html.ts';
import { parseRobots, isAllowed, type Robots } from './robots.ts';

export type BasePolicy = Pick<FetchPolicy, 'userAgent' | 'timeoutMs' | 'maxRedirects' | 'resolve' | 'isAddressAllowed' | 'devProxy' | 'testConnectPort'>;

export interface CrawlInput {
  rootUrl: string;
  domain: string;
  mode: 'preliminary' | 'full';
  maxPages: number;
  maxRequests: number;
  linkCheckLimit: number;
  delayMs: number;
  policy: BasePolicy;
  pageMaxBytes?: number;
}

export interface PageResult {
  url: string;
  finalUrl: string;
  status: number | null;
  ms: number | null;
  bytes: number | null;
  truncated: boolean;
  contentType: string;
  redirects: FetchResult['redirects'];
  error?: string;
  isHtml: boolean;
  data?: PageData;
  inSitemap: boolean;
}

export interface CrawlResult {
  rootUrl: string;
  pages: PageResult[];
  robots: { url: string; status: number | null; error?: string; parsed: Robots | null; googlebotRootAllowed: boolean };
  sitemap: { sources: string[]; urls: string[]; errors: string[]; fromRobots: boolean };
  httpToHttps: { checked: boolean; redirectsToHttps: boolean | null; error?: string };
  linkChecks: { url: string; status: number | null; error?: string }[];
  linkSources: Record<string, string[]>;
  skippedByRobots: string[];
  requests: number;
  stoppedReason: string | null;
}

const TRACKING = /^(utm_[a-z]+|gclid|fbclid|msclkid|yclid|mc_cid|mc_eid|_ga)$/i;
const ASSET = /\.(jpe?g|png|gif|webp|avif|svg|ico|bmp|tiff?|pdf|zip|rar|7z|gz|tar|mp4|mov|webm|mp3|wav|ogg|css|js|mjs|json|xml|txt|woff2?|ttf|eot|otf|docx?|xlsx?|pptx?|apk|exe|dmg)$/i;

export function normalizeUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    u.hash = '';
    u.hostname = u.hostname.toLowerCase();
    if ((u.protocol === 'https:' && u.port === '443') || (u.protocol === 'http:' && u.port === '80')) u.port = '';
    for (const k of [...u.searchParams.keys()]) if (TRACKING.test(k)) u.searchParams.delete(k);
    return u.toString();
  } catch { return null; }
}

export function siteScope(domain: string): (host: string) => boolean {
  const bare = domain.replace(/^www\./, '');
  return (h) => h === bare || h === `www.${bare}`;
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function errText(e: unknown): string {
  if (e instanceof FetchBlockedError) return `${e.reason}: ${e.message}`;
  const err = e as NodeJS.ErrnoException;
  return (err?.code ? `${err.code}: ` : '') + (err?.message ?? String(e)).slice(0, 300);
}

function extractLocs(xml: string): { locs: string[]; isIndex: boolean } {
  const isIndex = /<sitemapindex[\s>]/i.test(xml);
  const locs: string[] = [];
  for (const m of xml.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]]+?)\s*(?:\]\]>)?\s*<\/loc>/gi)) {
    locs.push(m[1]!.replace(/&amp;/g, '&'));
    if (locs.length >= 50_000) break;
  }
  return { locs, isIndex };
}

/** Pick a varied sample: one URL per first path segment first, then the rest. */
function diverseSample(urls: string[], n: number): string[] {
  const seen = new Set<string>();
  const first: string[] = [];
  const rest: string[] = [];
  for (const u of urls) {
    let seg = '';
    try { seg = new URL(u).pathname.split('/').filter(Boolean).slice(0, 2).join('/'); } catch { continue; }
    if (!seen.has(seg)) { seen.add(seg); first.push(u); } else rest.push(u);
  }
  return [...first, ...rest].slice(0, n);
}

export async function crawlSite(input: CrawlInput): Promise<CrawlResult> {
  const allowedHost = siteScope(input.domain);
  const root = normalizeUrl(input.rootUrl)!;
  const origin = new URL(root).origin;
  const pageMaxBytes = input.pageMaxBytes ?? 2 * 1024 * 1024;
  let requests = 0;
  let stoppedReason: string | null = null;

  const budgetLeft = () => requests < input.maxRequests;
  const fetchWith = async (url: string, extra: Partial<FetchPolicy>): Promise<FetchResult> => {
    requests++;
    return safeFetch(url, { ...input.policy, allowedHost, maxBytes: pageMaxBytes, ...extra });
  };

  // 1. robots.txt
  const robots: CrawlResult['robots'] = { url: `${origin}/robots.txt`, status: null, parsed: null, googlebotRootAllowed: true };
  try {
    const r = await fetchWith(robots.url, { accept: 'text/plain,*/*;q=0.5', maxBytes: 512 * 1024 });
    robots.status = r.status;
    if (r.status === 200) robots.parsed = parseRobots(r.body);
  } catch (e) { robots.error = errText(e); }
  robots.googlebotRootAllowed = isAllowed(robots.parsed, '/', 'googlebot');
  const uaToken = 'petsyseobot';
  const robotsAllows = (url: string) => {
    if (robots.status !== null && robots.status >= 500) return false; // treat server errors as "do not crawl"
    const u = new URL(url);
    return isAllowed(robots.parsed, u.pathname + u.search, uaToken);
  };

  // 2. http -> https check
  const httpToHttps: CrawlResult['httpToHttps'] = { checked: false, redirectsToHttps: null };
  if (root.startsWith('https://')) {
    try {
      const r = await fetchWith(root.replace(/^https:/, 'http:'), { maxBytes: 64 * 1024 });
      httpToHttps.checked = true;
      httpToHttps.redirectsToHttps = r.finalUrl.startsWith('https://');
    } catch (e) {
      httpToHttps.checked = true;
      httpToHttps.error = errText(e);
    }
  }

  // 3. sitemaps
  const sitemap: CrawlResult['sitemap'] = { sources: [], urls: [], errors: [], fromRobots: false };
  const candidates = (robots.parsed?.sitemaps ?? []).filter((s) => { try { return allowedHost(new URL(s).hostname.toLowerCase()); } catch { return false; } });
  sitemap.fromRobots = candidates.length > 0;
  const toVisit = candidates.length ? candidates.slice(0, 5) : [`${origin}/sitemap.xml`];
  const visitedSitemaps = new Set<string>();
  const sitemapUrls = new Set<string>();
  while (toVisit.length && visitedSitemaps.size < 10 && budgetLeft()) {
    const sm = toVisit.shift()!;
    if (visitedSitemaps.has(sm)) continue;
    visitedSitemaps.add(sm);
    try {
      const r = await fetchWith(sm, { accept: 'application/xml,text/xml,*/*;q=0.5', maxBytes: 8 * 1024 * 1024 });
      if (r.status !== 200) { sitemap.errors.push(`${sm} returned HTTP ${r.status}`); continue; }
      const { locs, isIndex } = extractLocs(r.body);
      if (!locs.length) { sitemap.errors.push(`${sm} has no <loc> entries`); continue; }
      sitemap.sources.push(sm);
      for (const l of locs) {
        const n = normalizeUrl(l);
        if (!n) continue;
        try { if (!allowedHost(new URL(n).hostname)) continue; } catch { continue; }
        if (isIndex) { if (toVisit.length < 20) toVisit.push(n); }
        else sitemapUrls.add(n);
      }
    } catch (e) { sitemap.errors.push(`${sm}: ${errText(e)}`); }
  }
  sitemap.urls = [...sitemapUrls];

  // 4. pages
  const queue: string[] = [root];
  const queued = new Set<string>([root]);
  const enqueue = (u: string) => { if (!queued.has(u)) { queued.add(u); queue.push(u); } };
  const seeds = input.mode === 'preliminary' ? diverseSample(sitemap.urls, input.maxPages) : sitemap.urls;
  for (const u of seeds) enqueue(u);

  const pages: PageResult[] = [];
  const linkSources: Record<string, string[]> = {};
  const skippedByRobots: string[] = [];
  const crawledFinal = new Set<string>();

  while (queue.length && pages.length < input.maxPages) {
    if (!budgetLeft()) { stoppedReason = 'request_budget_reached'; break; }
    const url = queue.shift()!;
    if (!robotsAllows(url)) { skippedByRobots.push(url); continue; }
    const page: PageResult = { url, finalUrl: url, status: null, ms: null, bytes: null, truncated: false, contentType: '', redirects: [], isHtml: false, inSitemap: sitemapUrls.has(url) };
    try {
      const r = await fetchWith(url, {});
      page.finalUrl = normalizeUrl(r.finalUrl) ?? r.finalUrl;
      page.status = r.status;
      page.ms = r.ms;
      page.bytes = r.bytes;
      page.truncated = r.truncated;
      page.contentType = r.contentType;
      page.redirects = r.redirects;
      page.isHtml = /text\/html|application\/xhtml/i.test(r.contentType);
      if (page.isHtml && r.status === 200 && !crawledFinal.has(page.finalUrl)) {
        crawledFinal.add(page.finalUrl);
        page.data = extractPage(r.body, page.finalUrl);
        for (const l of page.data.links) {
          const n = normalizeUrl(l.href);
          if (!n) continue;
          let host: string;
          try { host = new URL(n).hostname; } catch { continue; }
          if (!allowedHost(host)) continue;
          const pathOnly = new URL(n).pathname;
          if (ASSET.test(pathOnly)) continue;
          const sources = (linkSources[n] ??= []);
          if (sources.length < 5 && !sources.includes(page.finalUrl)) sources.push(page.finalUrl);
          if (!l.nofollow) enqueue(n);
        }
      }
    } catch (e) {
      page.error = errText(e);
    }
    pages.push(page);
    if (input.delayMs) await sleep(input.delayMs);
  }
  if (!stoppedReason && queue.length && pages.length >= input.maxPages) stoppedReason = 'page_limit_reached';

  // 5. broken-link checks on internal targets we did not crawl (full mode only)
  const linkChecks: CrawlResult['linkChecks'] = [];
  if (input.mode === 'full') {
    const crawledUrls = new Set(pages.flatMap((p) => [p.url, p.finalUrl]));
    const targets = Object.keys(linkSources).filter((u) => !crawledUrls.has(u) && robotsAllows(u)).slice(0, input.linkCheckLimit);
    for (const t of targets) {
      if (!budgetLeft()) { stoppedReason ??= 'request_budget_reached'; break; }
      try {
        const r = await fetchWith(t, { maxBytes: 16 * 1024 });
        linkChecks.push({ url: t, status: r.status });
      } catch (e) {
        linkChecks.push({ url: t, status: null, error: errText(e) });
      }
      if (input.delayMs) await sleep(input.delayMs);
    }
  }

  return { rootUrl: root, pages, robots, sitemap, httpToHttps, linkChecks, linkSources, skippedByRobots, requests, stoppedReason };
}
