import { config } from '../config.ts';
import type { BasePolicy } from './crawl.ts';

export function defaultPolicy(): BasePolicy {
  return {
    userAgent: config.crawlUserAgent,
    timeoutMs: 15_000,
    maxRedirects: 5,
    devProxy: config.crawlDevProxy,
  };
}
