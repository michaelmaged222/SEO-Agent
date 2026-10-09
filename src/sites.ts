// Site onboarding helpers: URL normalization and ownership verification.
import net from 'node:net';
import dns from 'node:dns/promises';
import { HttpError } from './lib/http.ts';
import { safeFetch, FetchBlockedError } from './crawler/safe-fetch.ts';
import { extractPage } from './crawler/html.ts';
import { siteScope, type BasePolicy } from './crawler/crawl.ts';

export const VERIFY_META_NAME = 'petsy-seo-verification';
export const VERIFY_FILE_PATH = '/.well-known/petsy-seo-verification.txt';
export const VERIFY_DNS_PREFIX = 'petsy-seo-verification=';

/** Accepts "example.com", "https://www.example.com/path" ... returns the canonical origin + host. */
export function normalizeSiteInput(input: string): { domain: string; rootUrl: string } {
  const raw = input.trim();
  if (raw.length > 253) throw new HttpError(400, 'invalid_url', 'Website address is too long.');
  let u: URL;
  try { u = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`); } catch {
    throw new HttpError(400, 'invalid_url', 'Enter a website address like example.com');
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new HttpError(400, 'invalid_url', 'Only http(s) websites are supported.');
  if (u.username || u.password) throw new HttpError(400, 'invalid_url', 'Remove the username/password from the address.');
  if (u.port && u.port !== '80' && u.port !== '443') throw new HttpError(400, 'invalid_url', 'Custom ports are not supported.');
  const host = u.hostname.toLowerCase().replace(/\.$/, '');
  if (net.isIP(host.replace(/^\[|\]$/g, ''))) throw new HttpError(400, 'invalid_url', 'Use a domain name, not an IP address.');
  const labels = host.split('.');
  if (labels.length < 2 || labels.some((l) => !/^(?!-)[a-z0-9-]{1,63}(?<!-)$/.test(l)) || !/[a-z]/.test(labels.at(-1)!)) {
    throw new HttpError(400, 'invalid_url', 'That does not look like a public domain name.');
  }
  if (['localhost', 'local', 'internal', 'test', 'invalid', 'example'].includes(labels.at(-1)!)) {
    throw new HttpError(400, 'invalid_url', 'That domain cannot be crawled.');
  }
  return { domain: host, rootUrl: `${u.protocol}//${host}/` };
}

export type VerifyMethod = 'meta' | 'file' | 'dns';

export async function checkVerification(
  site: { domain: string; root_url: string; verification_token: string },
  method: VerifyMethod,
  policy: BasePolicy,
  resolveTxt: (host: string) => Promise<string[][]> = dns.resolveTxt,
): Promise<{ ok: boolean; detail: string }> {
  const token = site.verification_token;
  const base = { ...policy, allowedHost: siteScope(site.domain), maxBytes: 1024 * 1024 };
  try {
    if (method === 'meta') {
      const r = await safeFetch(site.root_url, base);
      if (r.status !== 200) return { ok: false, detail: `Homepage returned HTTP ${r.status}.` };
      const tokens = extractPage(r.body, r.finalUrl).verificationTokens;
      return tokens.includes(token)
        ? { ok: true, detail: 'Verification meta tag found on the homepage.' }
        : { ok: false, detail: tokens.length ? 'A verification tag was found but the code does not match.' : 'Verification meta tag not found on the homepage.' };
    }
    if (method === 'file') {
      const r = await safeFetch(new URL(VERIFY_FILE_PATH, site.root_url).toString(), { ...base, accept: 'text/plain', maxBytes: 4096 });
      if (r.status !== 200) return { ok: false, detail: `Verification file returned HTTP ${r.status}.` };
      return r.body.trim() === token ? { ok: true, detail: 'Verification file found.' } : { ok: false, detail: 'Verification file content does not match.' };
    }
    const hosts = [...new Set([site.domain, site.domain.replace(/^www\./, '')])];
    for (const h of hosts) {
      let records: string[][] = [];
      try { records = await resolveTxt(h); } catch { continue; }
      if (records.some((parts) => parts.join('') === `${VERIFY_DNS_PREFIX}${token}`)) return { ok: true, detail: `DNS TXT record found on ${h}.` };
    }
    return { ok: false, detail: 'DNS TXT record not found yet (DNS changes can take a while).' };
  } catch (e) {
    if (e instanceof FetchBlockedError) return { ok: false, detail: `Could not check: ${e.message}` };
    return { ok: false, detail: `Could not reach the site: ${(e as Error).message}`.slice(0, 300) };
  }
}
