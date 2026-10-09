// SSRF-safe HTTP fetcher for crawling customer websites.
// - http/https only, default ports only, no credentials in URLs
// - host must be allowed by the site's scope (approved domain only)
// - DNS is resolved by us; every address is checked against private/reserved ranges and
//   the connection is pinned to the checked address (no DNS-rebinding window)
// - redirects are followed manually and every hop is re-validated
// - strict byte (post-decompression), time and redirect limits
import http from 'node:http';
import https from 'node:https';
import tls from 'node:tls';
import net from 'node:net';
import dns from 'node:dns/promises';
import zlib from 'node:zlib';
import type { Readable } from 'node:stream';

export class FetchBlockedError extends Error {
  reason: string;
  constructor(reason: string, message: string) {
    super(message);
    this.reason = reason;
  }
}

const blocked = new net.BlockList();
for (const [addr, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.88.99.0', 24], ['192.168.0.0', 16],
  ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
] as const) blocked.addSubnet(addr, prefix, 'ipv4');
for (const [addr, prefix] of [
  ['::', 128], ['::1', 128], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8], ['64:ff9b::', 96],
  ['64:ff9b:1::', 48], ['100::', 64], ['2001::', 23], ['2001:db8::', 32], ['2002::', 16], ['fec0::', 10],
] as const) blocked.addSubnet(addr, prefix, 'ipv6');

/** True when the address must never be contacted (private, loopback, link-local, metadata, reserved...). */
export function isBlockedAddress(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return blocked.check(ip, 'ipv4');
  if (family === 6) {
    const lower = ip.toLowerCase();
    // IPv6 with an embedded dotted IPv4 (mapped ::ffff:a.b.c.d, compatible ::a.b.c.d, NAT64...):
    // blocked if either the IPv6 range or the embedded IPv4 address is blocked.
    if (lower.includes('.')) {
      const v4 = lower.slice(lower.lastIndexOf(':') + 1);
      return blocked.check(ip, 'ipv6') || isBlockedAddress(v4);
    }
    const hexMapped = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(lower);
    if (hexMapped) {
      const a = parseInt(hexMapped[1]!, 16), b = parseInt(hexMapped[2]!, 16);
      return isBlockedAddress(`${a >> 8}.${a & 255}.${b >> 8}.${b & 255}`);
    }
    return blocked.check(ip, 'ipv6');
  }
  return true; // not an IP at all
}

export interface FetchPolicy {
  /** Approved-domain scope: every URL, including redirect targets, must pass. */
  allowedHost: (hostname: string) => boolean;
  userAgent: string;
  maxBytes: number;
  timeoutMs: number;
  maxRedirects: number;
  accept?: string;
  method?: 'GET' | 'HEAD';
  /** Overridable for tests only. */
  resolve?: (hostname: string) => Promise<string[]>;
  isAddressAllowed?: (ip: string) => boolean;
  /** Development-only CONNECT proxy (sandbox without DNS). Disables IP pinning. */
  devProxy?: string;
  /** Tests only: connect to this local port instead of 80/443 (URL validation is unchanged). */
  testConnectPort?: number;
}

export interface FetchResult {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  headers: http.IncomingHttpHeaders;
  contentType: string;
  body: string;
  bytes: number;
  truncated: boolean;
  ms: number;
  redirects: { from: string; to: string; status: number }[];
}

async function defaultResolve(hostname: string): Promise<string[]> {
  const res = await dns.lookup(hostname, { all: true, verbatim: true });
  return res.map((r) => r.address);
}

export function validateUrl(raw: string, policy: Pick<FetchPolicy, 'allowedHost'>): URL {
  let u: URL;
  try { u = new URL(raw); } catch { throw new FetchBlockedError('invalid_url', `Invalid URL: ${raw}`); }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new FetchBlockedError('scheme', `Scheme not allowed: ${u.protocol}`);
  if (u.username || u.password) throw new FetchBlockedError('credentials', 'URLs with credentials are not allowed');
  if (u.port && u.port !== '80' && u.port !== '443') throw new FetchBlockedError('port', `Port not allowed: ${u.port}`);
  const host = u.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (net.isIP(host)) throw new FetchBlockedError('ip_literal', 'IP-address URLs are not crawled');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || !host.includes('.')) {
    throw new FetchBlockedError('internal_host', `Host not allowed: ${host}`);
  }
  if (!policy.allowedHost(host)) throw new FetchBlockedError('out_of_scope', `Host is outside the approved domain: ${host}`);
  return u;
}

async function pinAddress(host: string, policy: FetchPolicy): Promise<{ address: string; family: 4 | 6 }> {
  const resolve = policy.resolve ?? defaultResolve;
  const allowed = policy.isAddressAllowed ?? ((ip: string) => !isBlockedAddress(ip));
  let addrs: string[];
  try { addrs = await resolve(host); } catch { throw new FetchBlockedError('dns', `Could not resolve ${host}`); }
  if (addrs.length === 0) throw new FetchBlockedError('dns', `No address for ${host}`);
  // If ANY address is internal, refuse: an attacker could otherwise race between records.
  for (const a of addrs) if (!allowed(a)) throw new FetchBlockedError('private_address', `${host} resolves to a blocked address`);
  const address = addrs[0]!;
  return { address, family: net.isIP(address) === 6 ? 6 : 4 };
}

function decode(res: http.IncomingMessage): Readable {
  const enc = String(res.headers['content-encoding'] ?? '').toLowerCase().trim();
  if (enc === 'gzip' || enc === 'x-gzip') return res.pipe(zlib.createGunzip());
  if (enc === 'deflate') return res.pipe(zlib.createInflate());
  if (enc === 'br') return res.pipe(zlib.createBrotliDecompress());
  return res;
}

async function connectViaProxy(proxy: string, host: string, port: number, deadline: number): Promise<net.Socket> {
  const p = new URL(proxy);
  return new Promise((resolve, reject) => {
    const req = http.request({ host: p.hostname, port: Number(p.port || 80), method: 'CONNECT', path: `${host}:${port}`, headers: { Host: `${host}:${port}` } });
    const timer = setTimeout(() => { req.destroy(); reject(new FetchBlockedError('timeout', 'Proxy connect timed out')); }, Math.max(1, deadline - Date.now()));
    req.on('connect', (res, socket) => {
      clearTimeout(timer);
      if (res.statusCode !== 200) { socket.destroy(); reject(new Error(`Proxy refused CONNECT (${res.statusCode})`)); return; }
      resolve(socket);
    });
    req.on('error', (e) => { clearTimeout(timer); reject(e); });
    req.end();
  });
}

async function requestOnce(u: URL, policy: FetchPolicy, deadline: number): Promise<{ res: http.IncomingMessage; cleanup: () => void }> {
  const isHttps = u.protocol === 'https:';
  const port = policy.testConnectPort ?? Number(u.port || (isHttps ? 443 : 80));
  const host = u.hostname.toLowerCase();
  const headers: Record<string, string> = {
    'User-Agent': policy.userAgent,
    Accept: policy.accept ?? 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': '*',
  };
  const remaining = deadline - Date.now();
  if (remaining <= 0) throw new FetchBlockedError('timeout', 'Request timed out');

  let options: https.RequestOptions;
  if (policy.devProxy) {
    const socket = await connectViaProxy(policy.devProxy, host, port, deadline);
    options = {
      host, port, method: policy.method ?? 'GET', path: u.pathname + u.search, headers, agent: false,
      createConnection: () => (isHttps ? tls.connect({ socket, servername: host }) : socket),
    };
  } else {
    const pinned = await pinAddress(host, policy);
    options = {
      host, port, method: policy.method ?? 'GET', path: u.pathname + u.search, headers, agent: false,
      servername: isHttps ? host : undefined,
      // Connect only to the address we validated, whatever DNS says a moment later.
      lookup: ((_h: string, opts: { all?: boolean }, cb: (...a: unknown[]) => void) => {
        if (opts?.all) cb(null, [{ address: pinned.address, family: pinned.family }]);
        else cb(null, pinned.address, pinned.family);
      }) as unknown as net.LookupFunction,
    };
  }

  return new Promise((resolve, reject) => {
    const req = (isHttps ? https : http).request(options, (res) => {
      clearTimeout(timer);
      resolve({ res, cleanup: () => { req.destroy(); } });
    });
    const timer = setTimeout(() => req.destroy(new FetchBlockedError('timeout', 'Request timed out')), remaining);
    req.on('error', (e) => { clearTimeout(timer); reject(e); });
    req.end();
  });
}

async function readBody(res: http.IncomingMessage, maxBytes: number, deadline: number): Promise<{ body: string; bytes: number; truncated: boolean }> {
  const stream = decode(res);
  const chunks: Buffer[] = [];
  let bytes = 0;
  let truncated = false;
  const timer = setTimeout(() => stream.destroy(new FetchBlockedError('timeout', 'Body read timed out')), Math.max(1, deadline - Date.now()));
  try {
    for await (const chunk of stream) {
      const buf = chunk as Buffer;
      if (bytes + buf.length > maxBytes) {
        chunks.push(buf.subarray(0, maxBytes - bytes));
        bytes = maxBytes;
        truncated = true;
        break;
      }
      chunks.push(buf);
      bytes += buf.length;
    }
  } finally {
    clearTimeout(timer);
    res.destroy();
  }
  return { body: Buffer.concat(chunks).toString('utf8'), bytes, truncated };
}

export async function safeFetch(rawUrl: string, policy: FetchPolicy): Promise<FetchResult> {
  const started = Date.now();
  const deadline = started + policy.timeoutMs;
  const redirects: FetchResult['redirects'] = [];
  let current = validateUrl(rawUrl, policy);
  for (let hop = 0; ; hop++) {
    const { res, cleanup } = await requestOnce(current, policy, deadline);
    const status = res.statusCode ?? 0;
    const location = res.headers.location;
    if (status >= 300 && status < 400 && location) {
      cleanup();
      if (hop >= policy.maxRedirects) throw new FetchBlockedError('too_many_redirects', `More than ${policy.maxRedirects} redirects`);
      const next = validateUrl(new URL(location, current).toString(), policy); // re-validated every hop
      redirects.push({ from: current.toString(), to: next.toString(), status });
      current = next;
      continue;
    }
    const contentType = String(res.headers['content-type'] ?? '');
    let body = '', bytes = 0, truncated = false;
    if ((policy.method ?? 'GET') === 'GET') ({ body, bytes, truncated } = await readBody(res, policy.maxBytes, deadline));
    else cleanup();
    return {
      requestedUrl: rawUrl, finalUrl: current.toString(), status, headers: res.headers, contentType,
      body, bytes, truncated, ms: Date.now() - started, redirects,
    };
  }
}
