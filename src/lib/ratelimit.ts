// In-memory fixed-window limiter. Fine for the single-instance deployment on the droplet;
// swap for a shared store (Postgres/Redis) before running more than one API process.
import { HttpError } from './http.ts';

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
  } else if (++b.count > limit) {
    throw new HttpError(429, 'rate_limited', 'Too many requests. Please wait and try again.');
  }
  if (buckets.size > 50_000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }
}

export function resetRateLimits(): void {
  buckets.clear();
}
