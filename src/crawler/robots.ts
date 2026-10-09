// robots.txt parser following Google's documented matching rules:
// pick the most specific matching user-agent group, longest matching rule wins,
// Allow wins ties, supports * and $ wildcards.

interface Rule { allow: boolean; pattern: string; re: RegExp }
interface Group { agents: string[]; rules: Rule[] }

export interface Robots {
  groups: Group[];
  sitemaps: string[];
}

function toRegex(pattern: string): RegExp {
  const anchored = pattern.endsWith('$');
  const body = (anchored ? pattern.slice(0, -1) : pattern)
    .split('*')
    .map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${body}${anchored ? '$' : ''}`);
}

export function parseRobots(text: string): Robots {
  const groups: Group[] = [];
  const sitemaps: string[] = [];
  let current: Group | null = null;
  let lastWasAgent = false;
  for (const rawLine of text.split(/\r?\n/).slice(0, 5000)) {
    const line = rawLine.replace(/#.*/, '').trim();
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (field === 'user-agent') {
      if (!current || !lastWasAgent) { current = { agents: [], rules: [] }; groups.push(current); }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (field === 'sitemap') { if (value) sitemaps.push(value); continue; }
    if (!current) continue;
    if (field === 'allow' || field === 'disallow') {
      if (field === 'disallow' && value === '') continue; // empty Disallow = allow all
      current.rules.push({ allow: field === 'allow', pattern: value, re: toRegex(value) });
    }
  }
  return { groups, sitemaps };
}

function groupFor(robots: Robots, userAgentToken: string): Group | null {
  const token = userAgentToken.toLowerCase();
  let best: Group | null = null;
  let bestLen = -1;
  for (const g of robots.groups) {
    for (const a of g.agents) {
      if (a === '*' || a === token) {
        const len = a === '*' ? 0 : a.length;
        if (len > bestLen) { best = g; bestLen = len; }
      }
    }
  }
  return best;
}

export function isAllowed(robots: Robots | null, pathWithQuery: string, userAgentToken: string): boolean {
  if (!robots) return true;
  const g = groupFor(robots, userAgentToken);
  if (!g) return true;
  let verdict: Rule | null = null;
  for (const r of g.rules) {
    if (!r.re.test(pathWithQuery)) continue;
    if (!verdict || r.pattern.length > verdict.pattern.length || (r.pattern.length === verdict.pattern.length && r.allow)) verdict = r;
  }
  return verdict ? verdict.allow : true;
}
