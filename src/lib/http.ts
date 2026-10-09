// Tiny dependency-free HTTP layer: routing, JSON bodies with size limits, cookies,
// security headers and consistent error responses.
import type { IncomingMessage, ServerResponse } from 'node:http';

export class HttpError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message?: string) {
    super(message ?? code);
    this.status = status;
    this.code = code;
  }
}

export interface Req {
  raw: IncomingMessage;
  method: string;
  path: string;
  query: URLSearchParams;
  params: Record<string, string>;
  headers: IncomingMessage['headers'];
  ip: string;
  cookies: Record<string, string>;
  body: unknown;
}

export interface Res {
  raw: ServerResponse;
  status(code: number): Res;
  header(name: string, value: string | string[]): Res;
  json(data: unknown): void;
  send(body: string | Buffer, contentType: string): void;
  setCookie(name: string, value: string, opts: CookieOpts): void;
}

export interface CookieOpts {
  maxAgeSeconds?: number;
  secure: boolean;
  httpOnly?: boolean;
  sameSite?: 'Lax' | 'Strict';
  path?: string;
}

export type Handler = (req: Req, res: Res) => Promise<void> | void;

interface Route { method: string; parts: string[]; handler: Handler }

export class Router {
  private routes: Route[] = [];
  add(method: string, pattern: string, handler: Handler): void {
    this.routes.push({ method, parts: pattern.split('/').filter(Boolean), handler });
  }
  get(p: string, h: Handler) { this.add('GET', p, h); }
  post(p: string, h: Handler) { this.add('POST', p, h); }
  patch(p: string, h: Handler) { this.add('PATCH', p, h); }
  delete(p: string, h: Handler) { this.add('DELETE', p, h); }

  match(method: string, path: string): { handler: Handler; params: Record<string, string> } | 'method' | null {
    const segs = path.split('/').filter(Boolean);
    let pathMatched = false;
    for (const r of this.routes) {
      if (r.parts.length !== segs.length) continue;
      const params: Record<string, string> = {};
      let ok = true;
      for (let i = 0; i < segs.length; i++) {
        const p = r.parts[i]!;
        const s = segs[i]!;
        if (p.startsWith(':')) {
          try { params[p.slice(1)] = decodeURIComponent(s); } catch { ok = false; break; }
        } else if (p !== s) { ok = false; break; }
      }
      if (!ok) continue;
      pathMatched = true;
      if (r.method === method) return { handler: r.handler, params };
    }
    return pathMatched ? 'method' : null;
  }
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    try { out[k] = decodeURIComponent(v); } catch { /* ignore malformed */ }
  }
  return out;
}

export async function readJsonBody(raw: IncomingMessage, limitBytes = 64 * 1024): Promise<unknown> {
  const method = raw.method ?? 'GET';
  if (method === 'GET' || method === 'HEAD' || method === 'DELETE') return undefined;
  const ct = raw.headers['content-type'] ?? '';
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of raw) {
    size += (chunk as Buffer).length;
    if (size > limitBytes) throw new HttpError(413, 'payload_too_large');
    chunks.push(chunk as Buffer);
  }
  if (size === 0) return {};
  if (!ct.includes('application/json')) throw new HttpError(415, 'json_required', 'Content-Type must be application/json');
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'invalid_json');
  }
}

export function makeRes(raw: ServerResponse): Res {
  const res: Res = {
    raw,
    status(code) { raw.statusCode = code; return res; },
    header(name, value) { raw.setHeader(name, value); return res; },
    json(data) {
      const body = JSON.stringify(data);
      raw.setHeader('Content-Type', 'application/json; charset=utf-8');
      raw.setHeader('Cache-Control', 'no-store');
      raw.end(body);
    },
    send(body, contentType) {
      raw.setHeader('Content-Type', contentType);
      raw.end(body);
    },
    setCookie(name, value, opts) {
      const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${opts.path ?? '/'}`, `SameSite=${opts.sameSite ?? 'Lax'}`];
      if (opts.httpOnly !== false) parts.push('HttpOnly');
      if (opts.secure) parts.push('Secure');
      if (opts.maxAgeSeconds !== undefined) parts.push(`Max-Age=${opts.maxAgeSeconds}`);
      const prev = raw.getHeader('Set-Cookie');
      const list = Array.isArray(prev) ? prev : prev ? [String(prev)] : [];
      raw.setHeader('Set-Cookie', [...list, parts.join('; ')]);
    },
  };
  return res;
}

export function applySecurityHeaders(raw: ServerResponse): void {
  raw.setHeader('X-Content-Type-Options', 'nosniff');
  raw.setHeader('X-Frame-Options', 'DENY');
  raw.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  raw.setHeader('Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  raw.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

export function clientIp(raw: IncomingMessage, trustProxy: boolean): string {
  if (trustProxy) {
    const xf = raw.headers['x-forwarded-for'];
    const first = (Array.isArray(xf) ? xf[0] : xf)?.split(',')[0]?.trim();
    if (first) return first;
  }
  return raw.socket.remoteAddress ?? 'unknown';
}
