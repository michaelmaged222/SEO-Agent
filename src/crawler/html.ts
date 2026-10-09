// Tolerant HTML tokenizer + SEO field extraction. Crawled HTML is untrusted data:
// it is only parsed for facts, never executed, rendered or treated as instructions.

export interface Tag { name: string; attrs: Record<string, string> }

export interface PageData {
  lang: string | null;
  dir: string | null;
  title: string | null;
  titleCount: number;
  metaDescription: string | null;
  metaDescriptionCount: number;
  robots: string[];              // lower-cased directives from meta robots/googlebot
  viewport: string | null;
  canonicals: string[];          // resolved absolute URLs
  hreflangs: { lang: string; href: string }[];
  h1s: string[];
  headings: { level: number; text: string }[];
  links: { href: string; nofollow: boolean }[]; // resolved absolute http(s) URLs
  images: { src: string; hasAlt: boolean; alt: string }[];
  jsonLd: { raw: string; valid: boolean; types: string[]; error?: string }[];
  og: Record<string, string>;
  twitter: Record<string, string>;
  wordCount: number;
  verificationTokens: string[];  // <meta name="petsy-seo-verification">
}

const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+\d*);/gi, (m, e: string) => {
    const lower = e.toLowerCase();
    if (lower.startsWith('#x')) { const n = parseInt(lower.slice(2), 16); return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m; }
    if (lower.startsWith('#')) { const n = parseInt(lower.slice(1), 10); return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m; }
    return NAMED[lower] ?? m;
  });
}

const ATTR_RE = /([^\s"'=<>`/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
function parseAttrs(src: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const m of src.matchAll(ATTR_RE)) {
    const name = m[1]!.toLowerCase();
    if (name in attrs) continue; // first occurrence wins, as in browsers
    attrs[name] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return attrs;
}

const RAW_TEXT = new Set(['script', 'style', 'textarea', 'title', 'noscript', 'template', 'svg']);
const HIDDEN_TEXT = new Set(['script', 'style', 'noscript', 'template', 'svg', 'head']);

type Token = { type: 'start'; tag: Tag; raw?: string } | { type: 'end'; name: string } | { type: 'text'; text: string };

export function* tokenize(html: string): Generator<Token> {
  let i = 0;
  const n = html.length;
  while (i < n) {
    const lt = html.indexOf('<', i);
    if (lt === -1) { yield { type: 'text', text: html.slice(i) }; return; }
    if (lt > i) yield { type: 'text', text: html.slice(i, lt) };
    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt + 4);
      i = end === -1 ? n : end + 3;
      continue;
    }
    if (html[lt + 1] === '!' || html[lt + 1] === '?') {
      const end = html.indexOf('>', lt);
      i = end === -1 ? n : end + 1;
      continue;
    }
    const isEnd = html[lt + 1] === '/';
    const nameMatch = /^[a-zA-Z][a-zA-Z0-9:-]*/.exec(html.slice(lt + (isEnd ? 2 : 1), lt + 64));
    if (!nameMatch) { yield { type: 'text', text: '<' }; i = lt + 1; continue; }
    const name = nameMatch[0].toLowerCase();
    // find the end of the tag, honouring quotes
    let j = lt + (isEnd ? 2 : 1) + nameMatch[0].length;
    let quote: string | null = null;
    for (; j < n; j++) {
      const c = html[j];
      if (quote) { if (c === quote) quote = null; }
      else if (c === '"' || c === "'") quote = c;
      else if (c === '>') break;
    }
    const inner = html.slice(lt + (isEnd ? 2 : 1) + nameMatch[0].length, j);
    i = j + 1;
    if (isEnd) { yield { type: 'end', name }; continue; }
    const tag: Tag = { name, attrs: parseAttrs(inner) };
    if (RAW_TEXT.has(name) && !inner.trimEnd().endsWith('/')) {
      const close = html.toLowerCase().indexOf(`</${name}`, i);
      const rawEnd = close === -1 ? n : close;
      yield { type: 'start', tag, raw: html.slice(i, rawEnd) };
      if (close === -1) { i = n; } else {
        const gt = html.indexOf('>', close);
        i = gt === -1 ? n : gt + 1;
      }
      yield { type: 'end', name };
      continue;
    }
    yield { type: 'start', tag };
  }
}

function clean(s: string): string {
  return decodeEntities(s).replace(/\s+/g, ' ').trim();
}

function resolveHttp(href: string, base: URL): string | null {
  try {
    const u = new URL(href.trim(), base);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    u.hash = '';
    return u.toString();
  } catch { return null; }
}

function jsonLdTypes(v: unknown, out: string[]): void {
  if (Array.isArray(v)) { for (const x of v) jsonLdTypes(x, out); return; }
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    const t = o['@type'];
    if (typeof t === 'string') out.push(t);
    else if (Array.isArray(t)) for (const x of t) if (typeof x === 'string') out.push(x);
    if (o['@graph']) jsonLdTypes(o['@graph'], out);
  }
}

export function extractPage(html: string, pageUrl: string): PageData {
  let base = new URL(pageUrl);
  const d: PageData = {
    lang: null, dir: null, title: null, titleCount: 0, metaDescription: null, metaDescriptionCount: 0, robots: [],
    viewport: null, canonicals: [], hreflangs: [], h1s: [], headings: [], links: [], images: [], jsonLd: [],
    og: {}, twitter: {}, wordCount: 0, verificationTokens: [],
  };
  const textParts: string[] = [];
  const stack: string[] = [];
  let hiddenDepth = 0;
  let heading: { level: number; parts: string[] } | null = null;

  for (const t of tokenize(html)) {
    if (t.type === 'text') {
      if (hiddenDepth === 0) textParts.push(t.text);
      if (heading) heading.parts.push(t.text);
      continue;
    }
    if (t.type === 'end') {
      if (HIDDEN_TEXT.has(t.name) && stack.includes(t.name)) {
        while (stack.length) { const top = stack.pop()!; if (HIDDEN_TEXT.has(top)) hiddenDepth--; if (top === t.name) break; }
      }
      if (heading && t.name === `h${heading.level}`) {
        const text = clean(heading.parts.join(' '));
        d.headings.push({ level: heading.level, text });
        if (heading.level === 1) d.h1s.push(text);
        heading = null;
      }
      continue;
    }
    const { name, attrs } = t.tag;
    if (name === 'body' && stack.includes('head')) {
      // </head> is optional in HTML: close it implicitly so body text is counted.
      while (stack.length) { const top = stack.pop()!; if (HIDDEN_TEXT.has(top)) hiddenDepth--; if (top === 'head') break; }
    }
    if (HIDDEN_TEXT.has(name)) { stack.push(name); hiddenDepth++; }
    switch (name) {
      case 'html':
        d.lang = attrs.lang?.trim() || null;
        d.dir = attrs.dir?.trim().toLowerCase() || null;
        break;
      case 'base':
        if (attrs.href) { try { base = new URL(attrs.href, base); } catch { /* ignore */ } }
        break;
      case 'title':
        d.titleCount++;
        if (d.title === null) d.title = clean(t.raw ?? '');
        break;
      case 'meta': {
        const key = (attrs.name ?? attrs.property ?? '').toLowerCase();
        const content = attrs.content ?? '';
        if (key === 'description') { d.metaDescriptionCount++; if (d.metaDescription === null) d.metaDescription = clean(content); }
        else if (key === 'robots' || key === 'googlebot') d.robots.push(...content.toLowerCase().split(',').map((x) => x.trim()).filter(Boolean));
        else if (key === 'viewport') d.viewport = content;
        else if (key === 'petsy-seo-verification') d.verificationTokens.push(content.trim());
        else if (key.startsWith('og:')) d.og[key] ??= content;
        else if (key.startsWith('twitter:')) d.twitter[key] ??= content;
        break;
      }
      case 'link': {
        const rel = (attrs.rel ?? '').toLowerCase().split(/\s+/);
        if (rel.includes('canonical') && attrs.href) { const r = resolveHttp(attrs.href, base); if (r) d.canonicals.push(r); }
        if (rel.includes('alternate') && attrs.hreflang && attrs.href) {
          const r = resolveHttp(attrs.href, base);
          if (r) d.hreflangs.push({ lang: attrs.hreflang.trim(), href: r });
        }
        break;
      }
      case 'a': {
        if (attrs.href) {
          const r = resolveHttp(attrs.href, base);
          if (r) d.links.push({ href: r, nofollow: (attrs.rel ?? '').toLowerCase().includes('nofollow') });
        }
        break;
      }
      case 'img':
        d.images.push({ src: attrs.src ?? attrs['data-src'] ?? '', hasAlt: 'alt' in attrs, alt: attrs.alt ?? '' });
        break;
      case 'script':
        if ((attrs.type ?? '').toLowerCase().trim() === 'application/ld+json') {
          const raw = (t.raw ?? '').trim();
          try {
            const parsed: unknown = JSON.parse(raw);
            const types: string[] = [];
            jsonLdTypes(parsed, types);
            d.jsonLd.push({ raw: raw.slice(0, 2000), valid: true, types });
          } catch (e) {
            d.jsonLd.push({ raw: raw.slice(0, 2000), valid: false, types: [], error: (e as Error).message.slice(0, 200) });
          }
        }
        break;
      default:
        if (/^h[1-6]$/.test(name)) heading = { level: Number(name[1]), parts: [] };
    }
  }
  const text = decodeEntities(textParts.join(' '));
  d.wordCount = (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length;
  return d;
}
