/**
 * SEO Meta Audit: checks every page's meta title, description, canonical URL, structured data,
 * keyword coverage and image alt text, then prints a scored report with specific fix suggestions.
 *
 *   npm run seo:meta           # full audit against the live site
 *   npm run seo:meta -- --base http://localhost:3100  # audit a local build
 *   npm run seo:meta -- --json # machine-readable output
 */
export {};

import { allKeywords, breedKeywords, transactional, informational } from "./data/seo-keywords";

const arg = (name: string, fallback = "") => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? (process.argv[i + 1] ?? "") : fallback;
};
const base = (arg("base") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100").replace(/\/$/, "");
const json = process.argv.includes("--json");
const UA = { "User-Agent": "Mozilla/5.0 (compatible; puppyfy-seo-agent/1.0)" };

type Finding = {
  page: string;
  severity: "critical" | "warning" | "info";
  category: string;
  message: string;
  suggestion?: string;
};

const findings: Finding[] = [];
let pagesAudited = 0;
let score = 100;

function deduct(severity: Finding["severity"]) {
  if (severity === "critical") score = Math.max(0, score - 5);
  else if (severity === "warning") score = Math.max(0, score - 2);
  else score = Math.max(0, score - 0.5);
}

function flag(page: string, severity: Finding["severity"], category: string, message: string, suggestion?: string) {
  findings.push({ page, severity, category, message, suggestion });
  deduct(severity);
}

async function fetchPage(path: string) {
  try {
    const res = await fetch(path.startsWith("http") ? path : base + path, {
      headers: UA,
      signal: AbortSignal.timeout(20_000),
    });
    return { status: res.status, html: await res.text() };
  } catch {
    return { status: 0, html: "" };
  }
}

const strip = (h: string) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "");
const attr = (tag: string, name: string) => new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i").exec(tag)?.[1] ?? "";

async function auditPage(path: string, expectedKeywords: string[] = []) {
  const { status, html } = await fetchPage(path);
  pagesAudited++;

  if (status !== 200) {
    flag(path, "critical", "status", `Page returns ${status || "no response"} instead of 200`);
    return;
  }

  const head = strip(html);

  // Title
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1]?.trim() ?? "";
  if (!title || title.length < 10) {
    flag(path, "critical", "title", "Missing or too short title (under 10 characters)", "Add a descriptive title of 30-60 characters including your primary keyword");
  } else if (title.length > 70) {
    flag(path, "warning", "title", `Title is ${title.length} chars — Google truncates at ~60-70`, `Shorten to under 60 characters: "${title.slice(0, 55)}…"`);
  }

  // Meta description
  const descTag = /<meta[^>]*name="description"[^>]*>/i.exec(head)?.[0];
  const desc = descTag ? attr(descTag, "content") : "";
  if (!desc || desc.length < 40) {
    flag(path, "critical", "description", "Missing or too short meta description", "Write a 120-155 character description with your target keyword and a clear value proposition");
  } else if (desc.length > 165) {
    flag(path, "warning", "description", `Description is ${desc.length} chars — Google truncates at ~155-160`, "Trim to 120-155 characters for full visibility in search results");
  }

  // H1
  const h1s = (head.match(/<h1[\s>]/gi) ?? []).length;
  if (h1s === 0) {
    flag(path, "warning", "heading", "No H1 heading found", "Add exactly one H1 that includes your primary keyword");
  } else if (h1s > 1) {
    flag(path, "warning", "heading", `${h1s} H1 headings found — should be exactly 1`, "Keep one H1 per page and use H2-H4 for subsections");
  }

  // Canonical
  const canonical = attr(/<link[^>]*rel="canonical"[^>]*>/i.exec(head)?.[0] ?? "", "href");
  if (!canonical) {
    flag(path, "critical", "canonical", "No canonical URL set", "Add <link rel=\"canonical\"> pointing to this page's preferred URL");
  }

  // Robots / noindex
  const robotsTag = /<meta[^>]*name="robots"[^>]*>/i.exec(head)?.[0] ?? "";
  if (/noindex/i.test(robotsTag)) {
    flag(path, "critical", "robots", "Page is marked noindex — Google will not list it", "Remove the noindex directive unless this page should be hidden");
  }

  // Open Graph image
  if (!/property="og:image"/i.test(head)) {
    flag(path, "warning", "social", "No og:image tag — links shared on social media will have no preview image", "Add an og:image meta tag with a 1200x630px image");
  }

  // Hreflang
  const hreflangs = [...head.matchAll(/<link[^>]*(?:hreflang|hrefLang)="([^"]+)"[^>]*>/gi)].map((m) => m[1].toLowerCase());
  const langs = new Set(hreflangs);
  if (!["en", "ar", "ru", "x-default"].every((l) => langs.has(l))) {
    flag(path, "warning", "hreflang", "Incomplete hreflang tags — missing one or more of: en, ar, ru, x-default", "Add hreflang alternate links for all supported languages");
  }

  // Image alt text
  const imgs = head.match(/<img[^>]*>/gi) ?? [];
  const noAlt = imgs.filter((i) => !/\salt="[^"]+"/i.test(i) && !/aria-hidden/i.test(i));
  if (noAlt.length > 0) {
    flag(path, "warning", "images", `${noAlt.length} image(s) missing alt text`, "Add descriptive alt text to every image for accessibility and image search");
  }

  // Structured data
  const jsonLdBlocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  if (jsonLdBlocks.length === 0) {
    flag(path, "warning", "structured-data", "No JSON-LD structured data found", "Add schema.org structured data (Organization, Product, Article, BreadcrumbList as appropriate)");
  }
  for (const m of jsonLdBlocks) {
    try {
      JSON.parse(m[1].replace(/\\u003c/g, "<"));
    } catch {
      flag(path, "critical", "structured-data", "Invalid JSON in structured data block", "Fix the JSON-LD syntax so Google can parse it");
    }
  }

  // Keyword coverage in title and description
  const titleLower = title.toLowerCase();
  const descLower = desc.toLowerCase();
  const pageText = `${titleLower} ${descLower}`;
  for (const kw of expectedKeywords) {
    const words = kw.toLowerCase().split(/\s+/);
    const covered = words.filter((w) => pageText.includes(w)).length;
    if (covered < words.length * 0.5) {
      flag(path, "info", "keywords", `Target keyword "${kw}" not well represented in title/description`, `Include "${kw}" (or its core terms) in the meta title or description`);
    }
  }

  // Internal links
  const internalLinks = (html.match(/href="\/[^"]*"/gi) ?? []).length;
  if (internalLinks < 2) {
    flag(path, "info", "links", "Very few internal links on this page", "Add 3-5 internal links to related pages to help Google discover and connect your content");
  }
}

console.log(`\nSEO Meta Audit of ${base}\n${"=".repeat(50)}\n`);

// Fetch sitemap to discover all pages
const smRes = await fetchPage("/sitemap.xml");
const sitemapUrls = [...smRes.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);

if (sitemapUrls.length === 0) {
  flag("/sitemap.xml", "critical", "sitemap", "No URLs found in sitemap", "Ensure sitemap.xml returns valid XML with <loc> entries");
}

// Audit key pages with their target keywords
const keyPages: [string, string[]][] = [
  ["/", ["buy puppy dubai", "puppies for sale uae", "puppy shop dubai", "pet shop dubai"]],
  ["/puppies/", ["puppies for sale uae", "buy puppy dubai", "puppy price dubai"]],
  ["/importing/", ["imported puppies uae", "import puppy to uae"]],
  ["/contact-us/", ["puppy shop dubai", "pet shop dubai"]],
  ["/articles/", []],
  ["/services/", ["puppy delivery uae"]],
];

// Audit key pages
for (const [path, kws] of keyPages) {
  await auditPage(path, kws);
}

// Audit breed pages from sitemap
const breedPaths = sitemapUrls.filter((p) => p.startsWith("/product/"));
for (let i = 0; i < breedPaths.length; i += 4) {
  const batch = breedPaths.slice(i, i + 4);
  await Promise.all(batch.map((p) => {
    const slug = p.replace(/^\/product\//, "").replace(/\/$/, "");
    return auditPage(p, breedKeywords[slug] ?? []);
  }));
}

// Audit article pages from sitemap
const articlePaths = sitemapUrls.filter((p) => /^\/[a-z0-9-]{20,}\/$/.test(p));
for (let i = 0; i < articlePaths.length; i += 4) {
  const batch = articlePaths.slice(i, i + 4);
  await Promise.all(batch.map((p) => auditPage(p)));
}

// Keyword coverage report: which target keywords have at least one page covering them
const allKws = allKeywords();
const covered = new Set<string>();
for (const f of findings) {
  if (f.category === "keywords") continue;
}
const uncovered = allKws.filter((kw) => {
  const words = kw.toLowerCase().split(/\s+/);
  return !sitemapUrls.some((u) => words.every((w) => u.includes(w)));
});

// Final report
score = Math.max(0, Math.round(score));

if (json) {
  console.log(JSON.stringify({ score, pagesAudited, findings, uncoveredKeywords: uncovered.slice(0, 20) }, null, 2));
} else {
  const bySeverity = { critical: 0, warning: 0, info: 0 };
  for (const f of findings) bySeverity[f.severity]++;

  console.log(`SCORE: ${score}/100\n`);
  console.log(`Pages audited: ${pagesAudited}`);
  console.log(`Findings: ${bySeverity.critical} critical, ${bySeverity.warning} warnings, ${bySeverity.info} info\n`);

  if (bySeverity.critical > 0) {
    console.log("CRITICAL ISSUES:");
    for (const f of findings.filter((f) => f.severity === "critical")) {
      console.log(`  [${f.category}] ${f.page}  ${f.message}`);
      if (f.suggestion) console.log(`    → ${f.suggestion}`);
    }
    console.log();
  }

  if (bySeverity.warning > 0) {
    console.log("WARNINGS:");
    for (const f of findings.filter((f) => f.severity === "warning")) {
      console.log(`  [${f.category}] ${f.page}  ${f.message}`);
      if (f.suggestion) console.log(`    → ${f.suggestion}`);
    }
    console.log();
  }

  if (uncovered.length > 0) {
    console.log("KEYWORD GAPS (no page targets these yet):");
    for (const kw of uncovered.slice(0, 15)) {
      console.log(`  • ${kw}`);
    }
    if (uncovered.length > 15) console.log(`  … and ${uncovered.length - 15} more`);
    console.log();
  }

  console.log(`${"=".repeat(50)}`);
  console.log(score >= 80 ? "SEO health is GOOD — keep publishing content and monitoring." : score >= 50 ? "SEO needs ATTENTION — fix the critical issues first." : "SEO needs URGENT work — address all critical issues immediately.");
}

process.exit(findings.some((f) => f.severity === "critical") ? 1 : 0);
