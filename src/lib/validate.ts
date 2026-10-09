// Small schema helpers. Every handler validates its input with these before touching the DB.
import { HttpError } from './http.ts';

type Obj = Record<string, unknown>;

export function obj(body: unknown): Obj {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'invalid_body', 'Expected a JSON object');
  return body as Obj;
}

export function str(o: Obj, key: string, opts: { min?: number; max: number; optional?: boolean; pattern?: RegExp }): string {
  const v = o[key];
  if (v === undefined || v === null || v === '') {
    if (opts.optional) return '';
    throw new HttpError(400, 'invalid_field', `${key} is required`);
  }
  if (typeof v !== 'string') throw new HttpError(400, 'invalid_field', `${key} must be text`);
  const s = v.trim();
  if (s.length < (opts.min ?? 0) || s.length > opts.max) {
    throw new HttpError(400, 'invalid_field', `${key} must be ${opts.min ?? 0}-${opts.max} characters`);
  }
  if (opts.pattern && !opts.pattern.test(s)) throw new HttpError(400, 'invalid_field', `${key} has an invalid format`);
  return s;
}

export function strList(o: Obj, key: string, opts: { maxItems: number; maxLen: number; pattern?: RegExp }): string[] {
  const v = o[key];
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v) || v.length > opts.maxItems) throw new HttpError(400, 'invalid_field', `${key} must be a list (max ${opts.maxItems})`);
  return v.map((x) => {
    if (typeof x !== 'string' || !x.trim() || x.length > opts.maxLen) throw new HttpError(400, 'invalid_field', `${key} has an invalid item`);
    const s = x.trim();
    if (opts.pattern && !opts.pattern.test(s)) throw new HttpError(400, 'invalid_field', `${key} has an invalid item`);
    return s;
  });
}

export function oneOf<T extends string>(o: Obj, key: string, allowed: readonly T[]): T {
  const v = o[key];
  if (typeof v !== 'string' || !(allowed as readonly string[]).includes(v)) {
    throw new HttpError(400, 'invalid_field', `${key} must be one of: ${allowed.join(', ')}`);
  }
  return v as T;
}

export function bool(o: Obj, key: string): boolean {
  const v = o[key];
  if (typeof v !== 'boolean') throw new HttpError(400, 'invalid_field', `${key} must be true or false`);
  return v;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function uuidParam(v: string | undefined): string {
  // Malformed IDs get the same 404 as foreign IDs, so probing reveals nothing.
  if (!v || !UUID.test(v)) throw new HttpError(404, 'not_found');
  return v.toLowerCase();
}

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const LANG_TAG = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})?$/;
