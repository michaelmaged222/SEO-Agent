// Technical SEO Auditor: deterministic rules over crawl evidence. No AI, no guesses:
// every finding carries the evidence (URL, observed value, HTTP status) that produced it.
import { createHash } from 'node:crypto';
import type { CrawlResult, PageResult } from './crawl.ts';
import { normalizeUrl, siteScope } from './crawl.ts';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Category = 'availability' | 'indexability' | 'metadata' | 'content' | 'structure' | 'links' | 'localization' | 'structured_data' | 'performance' | 'social';

export interface RuleDef { category: Category; severity: Severity; scope: 'page' | 'site'; title: string; why: string; fix: string }

export const RULES = {
  homepage_unreachable: { category: 'availability', severity: 'critical', scope: 'site', title: 'Homepage could not be loaded', why: 'If the homepage fails, Google cannot crawl the rest of the site.', fix: 'Check hosting, DNS and SSL for the homepage.' },
  homepage_noindex: { category: 'indexability', severity: 'critical', scope: 'site', title: 'Homepage tells Google not to index it', why: 'A noindex on the homepage removes it from Google results.', fix: 'Remove "noindex" from the homepage robots meta tag.' },
  robots_blocks_all: { category: 'indexability', severity: 'critical', scope: 'site', title: 'robots.txt blocks Google from the whole site', why: 'Googlebot is told not to crawl any page.', fix: 'Remove "Disallow: /" for Googlebot / all user-agents.' },
  robots_error: { category: 'indexability', severity: 'high', scope: 'site', title: 'robots.txt returns a server error', why: 'Google pauses crawling when robots.txt fails with a server error.', fix: 'Make /robots.txt return 200 (or 404 if you have none).' },
  robots_missing: { category: 'indexability', severity: 'low', scope: 'site', title: 'No robots.txt file', why: 'Not required, but it is the standard place to point Google to your sitemap.', fix: 'Add /robots.txt with a Sitemap: line.' },
  sitemap_missing: { category: 'indexability', severity: 'medium', scope: 'site', title: 'No XML sitemap found', why: 'A sitemap helps Google discover all important pages.', fix: 'Publish /sitemap.xml listing your indexable pages.' },
  sitemap_not_in_robots: { category: 'indexability', severity: 'low', scope: 'site', title: 'Sitemap not listed in robots.txt', why: 'Listing it helps all search engines find it.', fix: 'Add "Sitemap: https://your-site/sitemap.xml" to robots.txt.' },
  no_https_redirect: { category: 'availability', severity: 'high', scope: 'site', title: 'HTTP version does not redirect to HTTPS', why: 'Duplicate http/https versions split ranking signals and look insecure.', fix: 'Add a permanent (301) redirect from http:// to https://.' },
  page_server_error: { category: 'availability', severity: 'critical', scope: 'page', title: 'Page returns a server error (5xx)', why: 'Google drops pages that keep failing.', fix: 'Fix the server error for this URL.' },
  page_not_found: { category: 'availability', severity: 'high', scope: 'page', title: 'Page returns an error (4xx)', why: 'Linked or listed pages that do not exist waste crawl budget and hurt users.', fix: 'Restore the page, redirect it, or remove links to it.' },
  page_fetch_failed: { category: 'availability', severity: 'medium', scope: 'page', title: 'Page could not be fetched', why: 'Timeouts and connection errors stop Google from reading the page.', fix: 'Check the page loads quickly and reliably.' },
  sitemap_url_not_ok: { category: 'indexability', severity: 'medium', scope: 'page', title: 'Sitemap lists a URL that is not a working page', why: 'Sitemaps should only list final, indexable 200 pages.', fix: 'Update the sitemap to the final URL or remove this entry.' },
  noindex_in_sitemap: { category: 'indexability', severity: 'high', scope: 'page', title: 'Page in sitemap is set to noindex', why: 'Conflicting signals: you ask Google to index and not index the same page.', fix: 'Remove noindex, or remove the page from the sitemap.' },
  page_noindex: { category: 'indexability', severity: 'info', scope: 'page', title: 'Page is set to noindex', why: 'This page will not appear in Google. Fine if intended.', fix: 'Confirm this page should be hidden from search.' },
  title_missing: { category: 'metadata', severity: 'high', scope: 'page', title: 'Missing page title', why: 'The title is the main headline Google shows in results.', fix: 'Add a unique, descriptive <title>.' },
  title_too_long: { category: 'metadata', severity: 'low', scope: 'page', title: 'Title is long and may be cut off', why: 'Google truncates long titles in results (roughly 60 characters).', fix: 'Shorten the title and put key words first.' },
  title_too_short: { category: 'metadata', severity: 'low', scope: 'page', title: 'Title is very short', why: 'Short titles miss the chance to describe the page.', fix: 'Write a more descriptive title.' },
  title_multiple: { category: 'metadata', severity: 'low', scope: 'page', title: 'More than one <title> tag', why: 'Search engines may pick the wrong one.', fix: 'Keep a single <title> in <head>.' },
  duplicate_title: { category: 'metadata', severity: 'medium', scope: 'page', title: 'Same title used on several pages', why: 'Duplicate titles make pages compete with each other.', fix: 'Give each page a unique title.' },
  meta_description_missing: { category: 'metadata', severity: 'medium', scope: 'page', title: 'Missing meta description', why: 'Google may show a random snippet instead of your pitch.', fix: 'Add a 70-160 character description of the page.' },
  meta_description_length: { category: 'metadata', severity: 'low', scope: 'page', title: 'Meta description is too short or too long', why: 'Very short descriptions under-sell; long ones get cut off.', fix: 'Aim for roughly 70-160 characters.' },
  meta_description_multiple: { category: 'metadata', severity: 'low', scope: 'page', title: 'More than one meta description', why: 'Search engines may pick the wrong one.', fix: 'Keep a single meta description.' },
  duplicate_meta_description: { category: 'metadata', severity: 'low', scope: 'page', title: 'Same meta description on several pages', why: 'Duplicates make results look identical.', fix: 'Write a unique description per page.' },
  h1_missing: { category: 'structure', severity: 'medium', scope: 'page', title: 'No H1 heading', why: 'The H1 tells users and Google what the page is about.', fix: 'Add one clear H1 heading.' },
  h1_multiple: { category: 'structure', severity: 'low', scope: 'page', title: 'Several H1 headings', why: 'Multiple H1s blur the main topic.', fix: 'Use one H1 and H2/H3 for sub-sections.' },
  canonical_missing: { category: 'indexability', severity: 'low', scope: 'page', title: 'No canonical URL', why: 'A canonical tells Google which URL is the main version.', fix: 'Add <link rel="canonical"> pointing to the preferred URL.' },
  canonical_multiple: { category: 'indexability', severity: 'medium', scope: 'page', title: 'Several different canonical URLs', why: 'Google may ignore conflicting canonicals.', fix: 'Keep exactly one canonical tag.' },
  canonical_offsite: { category: 'indexability', severity: 'high', scope: 'page', title: 'Canonical points to another website', why: 'This hands the page\'s ranking to another domain.', fix: 'Point the canonical to this site\'s own URL (needs approval).' },
  sitemap_canonical_mismatch: { category: 'indexability', severity: 'medium', scope: 'page', title: 'Sitemap URL says its main version is a different URL', why: 'Sitemaps should list canonical URLs only.', fix: 'List the canonical URL in the sitemap, or fix the canonical (needs approval).' },
  lang_missing: { category: 'localization', severity: 'medium', scope: 'page', title: 'Page language is not declared', why: 'The html lang attribute helps search engines and screen readers.', fix: 'Add lang="en" (or the right language) to <html>.' },
  lang_invalid: { category: 'localization', severity: 'low', scope: 'page', title: 'Language code looks invalid', why: 'Invalid codes are ignored.', fix: 'Use a valid code such as en, ar, ru or en-AE.' },
  rtl_missing: { category: 'localization', severity: 'medium', scope: 'page', title: 'Right-to-left page without dir="rtl"', why: 'Arabic and other RTL pages render incorrectly without it.', fix: 'Add dir="rtl" to <html> on RTL-language pages.' },
  hreflang_invalid: { category: 'localization', severity: 'medium', scope: 'page', title: 'Invalid hreflang code', why: 'Google ignores invalid language alternates.', fix: 'Use codes like en, ar, ru, en-ae or x-default.' },
  hreflang_no_self: { category: 'localization', severity: 'low', scope: 'page', title: 'hreflang set has no self-reference', why: 'Each language version should list itself as well as the others.', fix: 'Add an hreflang entry pointing to this page.' },
  structured_data_invalid: { category: 'structured_data', severity: 'medium', scope: 'page', title: 'Structured data (JSON-LD) is not valid JSON', why: 'Broken structured data is ignored, so no rich results.', fix: 'Fix the JSON syntax in the ld+json block.' },
  homepage_no_structured_data: { category: 'structured_data', severity: 'low', scope: 'site', title: 'Homepage has no structured data', why: 'Organization/LocalBusiness data helps Google understand your business.', fix: 'Add Organization or LocalBusiness JSON-LD to the homepage.' },
  images_missing_alt: { category: 'content', severity: 'low', scope: 'page', title: 'Images without alt text', why: 'Alt text helps image search and accessibility.', fix: 'Describe each meaningful image in its alt attribute.' },
  viewport_missing: { category: 'structure', severity: 'medium', scope: 'page', title: 'No mobile viewport tag', why: 'Google indexes the mobile version; pages without a viewport render badly on phones.', fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.' },
  og_missing: { category: 'social', severity: 'low', scope: 'page', title: 'Missing social sharing tags (Open Graph)', why: 'Links shared on WhatsApp, Facebook and Instagram show no proper preview.', fix: 'Add og:title, og:description and og:image.' },
  thin_content: { category: 'content', severity: 'low', scope: 'page', title: 'Very little text on the page', why: 'Pages with little content rarely rank.', fix: 'Add helpful, original text for visitors.' },
  slow_response: { category: 'performance', severity: 'low', scope: 'page', title: 'Slow server response', why: 'Slow pages hurt users and crawling (measured from our crawler, not real users).', fix: 'Check hosting, caching and page weight.' },
  page_truncated: { category: 'performance', severity: 'info', scope: 'page', title: 'Page HTML is very large', why: 'Only the first part was analysed; very heavy pages are slow.', fix: 'Reduce HTML size (inline data, scripts).' },
  broken_internal_link: { category: 'links', severity: 'medium', scope: 'page', title: 'Internal link points to a broken page', why: 'Broken links waste visitors and crawl budget.', fix: 'Update the links on the listed source pages.' },
} as const satisfies Record<string, RuleDef>;

export type RuleId = keyof typeof RULES;

export interface Finding {
  rule: RuleId;
  url: string | null;
  key: string;               // extra discriminator for the fingerprint (e.g. duplicated value)
  detail: string;
  evidence: Record<string, unknown>;
}

export function fingerprint(siteId: string, f: Pick<Finding, 'rule' | 'url' | 'key'>): string {
  return createHash('sha256').update([siteId, f.rule, f.url ?? '', f.key].join('|')).digest('hex').slice(0, 40);
}

const HREFLANG = /^([a-z]{2,3}(-[a-z]{4})?(-([a-z]{2}|\d{3}))?|x-default)$/i;
const LANG = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i;
const RTL = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'yi', 'ku', 'dv']);
const shortHash = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 12);

export function evaluate(crawl: CrawlResult, domain: string): { findings: Finding[]; evaluatedUrls: string[] } {
  const inScope = siteScope(domain);
  const findings: Finding[] = [];
  const add = (rule: RuleId, url: string | null, detail: string, evidence: Record<string, unknown> = {}, key = '') =>
    findings.push({ rule, url, key, detail, evidence });

  const rootPage = crawl.pages.find((p) => p.url === crawl.rootUrl);

  // ---- site-level
  if (!rootPage || rootPage.error || rootPage.status === null || rootPage.status >= 400) {
    add('homepage_unreachable', crawl.rootUrl, rootPage?.error ?? `HTTP ${rootPage?.status ?? 'no response'}`, { status: rootPage?.status ?? null, error: rootPage?.error ?? null });
  }
  if (rootPage?.data?.robots.includes('noindex') || rootPage?.data?.robots.includes('none')) {
    add('homepage_noindex', crawl.rootUrl, `robots meta: ${rootPage.data.robots.join(', ')}`, { robots: rootPage.data.robots });
  }
  if (crawl.robots.status !== null && crawl.robots.status >= 500 || (crawl.robots.status === null && crawl.robots.error)) {
    add('robots_error', crawl.robots.url, crawl.robots.error ?? `HTTP ${crawl.robots.status}`, { status: crawl.robots.status });
  } else if (crawl.robots.status === 404 || crawl.robots.status === 410) {
    add('robots_missing', crawl.robots.url, `HTTP ${crawl.robots.status}`, { status: crawl.robots.status });
  }
  if (!crawl.robots.googlebotRootAllowed) add('robots_blocks_all', crawl.robots.url, 'Googlebot is disallowed from "/"', {});
  if (crawl.sitemap.sources.length === 0) add('sitemap_missing', null, crawl.sitemap.errors.join('; ') || 'No sitemap found', { errors: crawl.sitemap.errors.slice(0, 5) });
  if (crawl.robots.parsed && !crawl.sitemap.fromRobots && crawl.sitemap.sources.length > 0) add('sitemap_not_in_robots', crawl.robots.url, 'robots.txt has no Sitemap: line', {});
  if (crawl.httpToHttps.checked && crawl.httpToHttps.redirectsToHttps === false) {
    add('no_https_redirect', crawl.rootUrl.replace(/^https:/, 'http:'), 'http:// stays on http://', {});
  }
  if (rootPage?.data && rootPage.status === 200 && rootPage.data.jsonLd.length === 0) {
    add('homepage_no_structured_data', crawl.rootUrl, 'No application/ld+json blocks on the homepage', {});
  }

  // ---- page-level
  const htmlPages: PageResult[] = [];
  for (const p of crawl.pages) {
    const url = p.url;
    if (p.error) { add('page_fetch_failed', url, p.error, { error: p.error }); continue; }
    if (p.status !== null && p.status >= 500) add('page_server_error', url, `HTTP ${p.status}`, { status: p.status });
    else if (p.status !== null && p.status >= 400) add('page_not_found', url, `HTTP ${p.status}`, { status: p.status, linked_from: crawl.linkSources[url] ?? [] });
    if (p.inSitemap && (p.status !== 200 || p.redirects.length > 0)) {
      add('sitemap_url_not_ok', url, p.redirects.length ? `Redirects to ${p.finalUrl}` : `HTTP ${p.status}`, { status: p.status, final_url: p.finalUrl, redirects: p.redirects });
    }
    if (p.ms !== null && p.ms > 3000) add('slow_response', url, `${p.ms} ms`, { ms: p.ms });
    if (p.truncated) add('page_truncated', url, `Analysed the first ${p.bytes} bytes`, { bytes: p.bytes });
    if (!p.data) continue;
    const d = p.data;
    const page = p.finalUrl;
    htmlPages.push(p);

    const noindex = d.robots.includes('noindex') || d.robots.includes('none');
    if (noindex && p.inSitemap) add('noindex_in_sitemap', url, `robots meta: ${d.robots.join(', ')}`, { robots: d.robots });
    else if (noindex && url !== crawl.rootUrl) add('page_noindex', url, `robots meta: ${d.robots.join(', ')}`, { robots: d.robots });

    if (!d.title) add('title_missing', url, 'No <title> or empty title', {});
    else {
      if (d.title.length > 60) add('title_too_long', url, `${d.title.length} characters`, { title: d.title, length: d.title.length });
      if (d.title.length < 20) add('title_too_short', url, `${d.title.length} characters`, { title: d.title, length: d.title.length });
    }
    if (d.titleCount > 1) add('title_multiple', url, `${d.titleCount} title tags`, { count: d.titleCount });

    if (!d.metaDescription) add('meta_description_missing', url, 'No meta description', {});
    else if (d.metaDescription.length < 70 || d.metaDescription.length > 160) {
      add('meta_description_length', url, `${d.metaDescription.length} characters`, { description: d.metaDescription, length: d.metaDescription.length });
    }
    if (d.metaDescriptionCount > 1) add('meta_description_multiple', url, `${d.metaDescriptionCount} description tags`, { count: d.metaDescriptionCount });

    if (d.h1s.length === 0) add('h1_missing', url, 'No <h1> on the page', {});
    else if (d.h1s.length > 1) add('h1_multiple', url, `${d.h1s.length} H1 headings`, { h1s: d.h1s.slice(0, 5) });

    const canon = [...new Set(d.canonicals.map((c) => normalizeUrl(c) ?? c))];
    if (canon.length === 0) add('canonical_missing', url, 'No rel=canonical', {});
    else if (canon.length > 1) add('canonical_multiple', url, `${canon.length} different canonicals`, { canonicals: canon });
    else {
      const c = canon[0]!;
      let host = '';
      try { host = new URL(c).hostname; } catch { /* invalid */ }
      if (!inScope(host)) add('canonical_offsite', url, `Canonical: ${c}`, { canonical: c });
      else if (p.inSitemap && c !== page) add('sitemap_canonical_mismatch', url, `Canonical: ${c}`, { canonical: c, page });
    }

    if (!d.lang) add('lang_missing', url, '<html> has no lang attribute', {});
    else if (!LANG.test(d.lang)) add('lang_invalid', url, `lang="${d.lang}"`, { lang: d.lang });
    else if (RTL.has(d.lang.toLowerCase().split('-')[0]!) && d.dir !== 'rtl') add('rtl_missing', url, `lang="${d.lang}" but dir="${d.dir ?? ''}"`, { lang: d.lang, dir: d.dir });

    if (d.hreflangs.length) {
      const bad = d.hreflangs.filter((h) => !HREFLANG.test(h.lang)).map((h) => h.lang);
      if (bad.length) add('hreflang_invalid', url, `Invalid codes: ${bad.join(', ')}`, { invalid: bad });
      const self = d.hreflangs.some((h) => (normalizeUrl(h.href) ?? h.href) === page);
      if (!self) add('hreflang_no_self', url, `${d.hreflangs.length} alternates, none for this URL`, { hreflangs: d.hreflangs.slice(0, 10) });
    }

    const invalidLd = d.jsonLd.filter((j) => !j.valid);
    if (invalidLd.length) add('structured_data_invalid', url, invalidLd.map((j) => j.error).join('; '), { errors: invalidLd.map((j) => ({ error: j.error, snippet: j.raw.slice(0, 300) })) });

    const noAlt = d.images.filter((i) => !i.hasAlt);
    if (noAlt.length) add('images_missing_alt', url, `${noAlt.length} of ${d.images.length} images`, { count: noAlt.length, total: d.images.length, examples: noAlt.slice(0, 5).map((i) => i.src) });

    if (!d.viewport) add('viewport_missing', url, 'No viewport meta tag', {});
    const missingOg = ['og:title', 'og:image'].filter((k) => !d.og[k]);
    if (missingOg.length) add('og_missing', url, `Missing ${missingOg.join(', ')}`, { missing: missingOg });
    if (!noindex && d.wordCount < 150) add('thin_content', url, `${d.wordCount} words`, { words: d.wordCount });
  }

  // ---- cross-page duplicates (one finding per affected page so each can be tracked/resolved)
  const groupBy = (pick: (p: PageResult) => string | null | undefined) => {
    const m = new Map<string, PageResult[]>();
    for (const p of htmlPages) {
      if (p.data!.robots.includes('noindex')) continue;
      const v = pick(p)?.trim().toLowerCase();
      if (!v) continue;
      m.set(v, [...(m.get(v) ?? []), p]);
    }
    return [...m.entries()].filter(([, ps]) => ps.length > 1);
  };
  for (const [value, ps] of groupBy((p) => p.data!.title)) {
    for (const p of ps) add('duplicate_title', p.url, `Shared by ${ps.length} pages`, { title: p.data!.title, others: ps.filter((x) => x !== p).slice(0, 5).map((x) => x.url) }, shortHash(value));
  }
  for (const [value, ps] of groupBy((p) => p.data!.metaDescription)) {
    for (const p of ps) add('duplicate_meta_description', p.url, `Shared by ${ps.length} pages`, { description: p.data!.metaDescription, others: ps.filter((x) => x !== p).slice(0, 5).map((x) => x.url) }, shortHash(value));
  }

  // ---- broken internal links (targets we crawled or link-checked)
  const statusOf = new Map<string, { status: number | null; error?: string }>();
  for (const p of crawl.pages) statusOf.set(p.url, { status: p.status, error: p.error });
  for (const c of crawl.linkChecks) statusOf.set(c.url, { status: c.status, error: c.error });
  for (const [target, sources] of Object.entries(crawl.linkSources)) {
    const s = statusOf.get(target);
    if (s && s.status !== null && s.status >= 400) {
      add('broken_internal_link', target, `HTTP ${s.status}, linked from ${sources.length} page(s)`, { status: s.status, linked_from: sources });
    }
  }

  const evaluatedUrls = [...new Set([...crawl.pages.map((p) => p.url), ...crawl.linkChecks.map((c) => c.url)])];
  return { findings, evaluatedUrls };
}

const WEIGHT: Record<Severity, number> = { critical: 15, high: 7, medium: 3, low: 1, info: 0 };

/** Transparent internal score (our formula, NOT a Google metric): 100 minus weighted open issues, each rule counted at most 3 times. */
export function healthScore(open: { rule: string; severity: Severity }[]): number {
  const perRule = new Map<string, { sev: Severity; n: number }>();
  for (const i of open) {
    const cur = perRule.get(i.rule) ?? { sev: i.severity, n: 0 };
    cur.n++;
    perRule.set(i.rule, cur);
  }
  let penalty = 0;
  for (const { sev, n } of perRule.values()) penalty += WEIGHT[sev] * Math.min(n, 3);
  return Math.max(0, 100 - penalty);
}
