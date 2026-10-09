import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractPage } from '../src/crawler/html.ts';
import { parseRobots, isAllowed } from '../src/crawler/robots.ts';
import { isBlockedAddress, validateUrl, safeFetch, FetchBlockedError } from '../src/crawler/safe-fetch.ts';
import { normalizeSiteInput } from '../src/sites.ts';
import { healthScore } from '../src/crawler/checks.ts';

test('html extraction: SEO fields, JSON-LD validity, hidden text excluded, missing </head>', () => {
  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head>
    <title>  Puppies &amp; Dogs  </title>
    <meta name="description" content="Healthy puppies">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="/en/">
    <link rel="alternate" hreflang="en" href="https://x.com/en/">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization"}</script>
    <script type="application/ld+json">{ broken json </script>
    <meta name="petsy-seo-verification" content="tok123">
    <body><h1>Main <b>title</b></h1><h1>Second</h1>
    <script>var ignoreMe = "lots of words that are not content";</script>
    <!-- <a href="/commented">no</a> -->
    <a href="/a?utm_source=x#top">A</a> <a href="mailto:x@y.z">mail</a> <a rel="nofollow" href="https://other.com/">ext</a>
    <img src="/1.jpg"><img src="/2.jpg" alt="dog">
    <p>مرحبا بكم في متجر الجراء</p></body></html>`;
  const d = extractPage(html, 'https://x.com/');
  assert.equal(d.title, 'Puppies & Dogs');
  assert.equal(d.metaDescription, 'Healthy puppies');
  assert.equal(d.lang, 'ar');
  assert.equal(d.dir, 'rtl');
  assert.deepEqual(d.canonicals, ['https://x.com/en/']);
  assert.equal(d.hreflangs.length, 1);
  assert.deepEqual(d.h1s, ['Main title', 'Second']);
  assert.equal(d.jsonLd.length, 2);
  assert.equal(d.jsonLd[0]!.valid, true);
  assert.deepEqual(d.jsonLd[0]!.types, ['Organization']);
  assert.equal(d.jsonLd[1]!.valid, false);
  assert.deepEqual(d.verificationTokens, ['tok123']);
  assert.equal(d.links.length, 2, 'mailto and commented links excluded');
  assert.equal(d.links[1]!.nofollow, true);
  assert.equal(d.images.filter((i) => !i.hasAlt).length, 1);
  assert.ok(d.wordCount >= 8 && d.wordCount < 20, `word count ${d.wordCount} should exclude script text`);
});

test('robots.txt: most specific group, longest match, wildcards', () => {
  const r = parseRobots(`User-agent: *\nDisallow: /admin\nAllow: /admin/public\nDisallow: /*.pdf$\n\nUser-agent: Googlebot\nDisallow: /\n\nSitemap: https://x.com/sitemap.xml`);
  assert.equal(isAllowed(r, '/admin/x', 'petsyseobot'), false);
  assert.equal(isAllowed(r, '/admin/public/a', 'petsyseobot'), true);
  assert.equal(isAllowed(r, '/file.pdf', 'petsyseobot'), false);
  assert.equal(isAllowed(r, '/file.pdf?x', 'petsyseobot'), true);
  assert.equal(isAllowed(r, '/', 'googlebot'), false, 'googlebot group blocks all');
  assert.deepEqual(r.sitemaps, ['https://x.com/sitemap.xml']);
});

test('SSRF: blocked address ranges', () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:127.0.0.1', '::ffff:7f00:1', '::ffff:169.254.169.254', '224.0.0.1', 'not-an-ip']) {
    assert.equal(isBlockedAddress(ip), true, `${ip} must be blocked`);
  }
  for (const ip of ['93.184.216.34', '8.8.8.8', '2606:4700::1111']) assert.equal(isBlockedAddress(ip), false, `${ip} should be allowed`);
});

test('SSRF: URL validation rejects internal targets and out-of-scope hosts', () => {
  const scope = { allowedHost: (h: string) => h === 'shop.com' || h === 'www.shop.com' };
  for (const u of ['http://127.0.0.1/', 'http://localhost/', 'http://[::1]/', 'ftp://shop.com/', 'http://user:pw@shop.com/', 'http://shop.com:8080/', 'http://intranet/', 'https://evil.com/', 'http://169.254.169.254/latest/meta-data']) {
    assert.throws(() => validateUrl(u, scope), FetchBlockedError, u);
  }
  assert.doesNotThrow(() => validateUrl('https://www.shop.com/a', scope));
});

test('SSRF: a public-looking domain that resolves to a private IP is refused before connecting', async () => {
  await assert.rejects(
    safeFetch('https://shop.com/', { allowedHost: () => true, userAgent: 't', maxBytes: 1000, timeoutMs: 2000, maxRedirects: 3, resolve: async () => ['93.184.216.34', '10.0.0.5'] }),
    (e: unknown) => e instanceof FetchBlockedError && e.reason === 'private_address',
  );
});

test('site input normalization', () => {
  assert.deepEqual(normalizeSiteInput('PuppyfyUAE.com'), { domain: 'puppyfyuae.com', rootUrl: 'https://puppyfyuae.com/' });
  assert.deepEqual(normalizeSiteInput('https://www.puppyfyuae.com/en/breeds?x=1'), { domain: 'www.puppyfyuae.com', rootUrl: 'https://www.puppyfyuae.com/' });
  for (const bad of ['localhost', '127.0.0.1', 'http://10.0.0.1', 'intranet', 'https://x.com:8443', 'javascript:alert(1)', 'a.local']) {
    assert.throws(() => normalizeSiteInput(bad), Error, bad);
  }
});

test('health score is bounded and caps repeats per rule', () => {
  assert.equal(healthScore([]), 100);
  const many = Array.from({ length: 50 }, () => ({ rule: 'title_too_long', severity: 'low' as const }));
  assert.equal(healthScore(many), 97);
  assert.equal(healthScore(Array.from({ length: 20 }, (_, i) => ({ rule: `r${i}`, severity: 'critical' as const }))), 0);
});
