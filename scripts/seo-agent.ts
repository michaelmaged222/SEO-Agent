/**
 * SEO Agent: an automated system that runs daily and weekly to manage every aspect of the site's
 * search engine optimisation. It orchestrates:
 *
 *   1. Daily meta audit — checks every page's title, description, canonical, structured data
 *   2. Keyword tracking — monitors which target keywords are covered and which need content
 *   3. Content gap analysis — identifies topics that should have articles but don't
 *   4. Weekly article scheduling — queues new SEO-optimized articles one per day
 *   5. Sitemap & robots.txt validation — ensures Google can crawl everything
 *   6. Google ranking protection — watches for broken pages, noindex, missing canonicals
 *
 * Run modes:
 *   npm run seo:agent                  # full daily check (quick)
 *   npm run seo:agent -- --weekly      # full weekly check (thorough, generates article plan)
 *   npm run seo:agent -- --report      # just print the status report
 *   npm run seo:agent -- --keywords    # keyword analysis only
 *   npm run seo:agent -- --json        # machine-readable output
 */
export {};

import { allKeywords, transactional, informational, breedKeywords, type KeywordGroup } from "./data/seo-keywords";

const arg = (name: string, fallback = "") => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? (process.argv[i + 1] ?? "") : fallback;
};
const base = (arg("base") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100").replace(/\/$/, "");
const isWeekly = process.argv.includes("--weekly");
const reportOnly = process.argv.includes("--report");
const keywordsOnly = process.argv.includes("--keywords");
const jsonOutput = process.argv.includes("--json");
const UA = { "User-Agent": "Mozilla/5.0 (compatible; puppyfy-seo-agent/1.0)" };

// ─── Types ───────────────────────────────────────────────────────────────────────

type PageReport = {
  url: string;
  status: number;
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  hasCanonical: boolean;
  hasOgImage: boolean;
  hasHreflang: boolean;
  hasJsonLd: boolean;
  jsonLdTypes: string[];
  h1Count: number;
  imagesMissingAlt: number;
  internalLinkCount: number;
  issues: string[];
  suggestions: string[];
};

type KeywordReport = {
  keyword: string;
  intent: string;
  priority: string;
  coveredByPages: string[];
  inTitles: string[];
  inDescriptions: string[];
  status: "well-covered" | "partial" | "gap";
};

type AgentReport = {
  timestamp: string;
  mode: string;
  siteUrl: string;
  overallScore: number;
  summary: {
    pagesAudited: number;
    criticalIssues: number;
    warnings: number;
    keywordsCovered: number;
    keywordsTotal: number;
    contentGaps: number;
  };
  pages: PageReport[];
  keywords: KeywordReport[];
  contentGaps: string[];
  articleSuggestions: string[];
  actions: string[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────────

async function get(path: string) {
  try {
    const url = path.startsWith("http") ? path : base + path;
    const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20_000) });
    return { status: res.status, html: await res.text() };
  } catch {
    return { status: 0, html: "" };
  }
}

const strip = (h: string) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "");
const attrVal = (tag: string, name: string) => new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i").exec(tag)?.[1] ?? "";

// ─── Page Auditor ────────────────────────────────────────────────────────────────

async function auditPage(path: string): Promise<PageReport> {
  const { status, html } = await get(path);
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (status !== 200) {
    return {
      url: path, status, title: "", titleLength: 0, description: "", descriptionLength: 0,
      hasCanonical: false, hasOgImage: false, hasHreflang: false, hasJsonLd: false,
      jsonLdTypes: [], h1Count: 0, imagesMissingAlt: 0, internalLinkCount: 0,
      issues: [`Page returns ${status || "no response"}`], suggestions: ["Fix the page so it returns 200"],
    };
  }

  const head = strip(html);

  // Title
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1]?.trim() ?? "";
  if (!title || title.length < 10) {
    issues.push("Title missing or too short");
    suggestions.push("Add a 30-60 character title with your primary keyword");
  } else if (title.length > 70) {
    issues.push(`Title too long (${title.length} chars)`);
    suggestions.push("Shorten to under 60 characters");
  }

  // Description
  const descTag = /<meta[^>]*name="description"[^>]*>/i.exec(head)?.[0];
  const desc = descTag ? attrVal(descTag, "content") : "";
  if (!desc || desc.length < 40) {
    issues.push("Meta description missing or too short");
    suggestions.push("Write a 120-155 character description with target keywords");
  } else if (desc.length > 165) {
    issues.push(`Description too long (${desc.length} chars)`);
    suggestions.push("Trim to 120-155 characters");
  }

  // H1
  const h1Count = (head.match(/<h1[\s>]/gi) ?? []).length;
  if (h1Count !== 1) {
    issues.push(`${h1Count} H1 headings (should be 1)`);
    suggestions.push(h1Count === 0 ? "Add one H1 heading" : "Keep only one H1 per page");
  }

  // Canonical
  const canonical = attrVal(/<link[^>]*rel="canonical"[^>]*>/i.exec(head)?.[0] ?? "", "href");
  if (!canonical) {
    issues.push("No canonical URL");
    suggestions.push("Add a canonical link to prevent duplicate content");
  }

  // Robots
  const robotsTag = /<meta[^>]*name="robots"[^>]*>/i.exec(head)?.[0] ?? "";
  if (/noindex/i.test(robotsTag)) {
    issues.push("NOINDEX — page hidden from Google");
    suggestions.push("Remove noindex unless intentional");
  }

  // OG image
  const hasOgImage = /property="og:image"/i.test(head);
  if (!hasOgImage) {
    issues.push("No og:image for social sharing");
    suggestions.push("Add a 1200x630 og:image");
  }

  // Hreflang
  const hreflangs = [...head.matchAll(/<link[^>]*(?:hreflang|hrefLang)="([^"]+)"[^>]*>/gi)].map((m) => m[1].toLowerCase());
  const hasHreflang = ["en", "ar", "ru", "x-default"].every((l) => new Set(hreflangs).has(l));
  if (!hasHreflang) {
    issues.push("Incomplete hreflang links");
    suggestions.push("Add hreflang for en, ar, ru and x-default");
  }

  // Structured data
  const jsonLdTypes: string[] = [];
  const jsonLdBlocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of jsonLdBlocks) {
    try {
      const j = JSON.parse(m[1].replace(/\\u003c/g, "<"));
      const t = j["@type"];
      jsonLdTypes.push(...(Array.isArray(t) ? t : [t]).filter(Boolean));
    } catch {
      issues.push("Invalid JSON-LD block");
      suggestions.push("Fix the JSON syntax in the structured data");
    }
  }

  // Images missing alt
  const imgs = head.match(/<img[^>]*>/gi) ?? [];
  const imagesMissingAlt = imgs.filter((i) => !/\salt="[^"]+"/i.test(i) && !/aria-hidden/i.test(i)).length;
  if (imagesMissingAlt > 3) {
    issues.push(`${imagesMissingAlt} images missing alt text`);
    suggestions.push("Add descriptive alt text to all images");
  }

  // Internal links
  const internalLinkCount = (html.match(/href="\/[^"]*"/gi) ?? []).length;

  return {
    url: path, status, title, titleLength: title.length, description: desc, descriptionLength: desc.length,
    hasCanonical: !!canonical, hasOgImage, hasHreflang, hasJsonLd: jsonLdBlocks.length > 0,
    jsonLdTypes, h1Count, imagesMissingAlt, internalLinkCount, issues, suggestions,
  };
}

// ─── Keyword Analyser ────────────────────────────────────────────────────────────

function analyseKeywords(pages: PageReport[]): KeywordReport[] {
  const reports: KeywordReport[] = [];
  const groups: [KeywordGroup, string][] = [
    [transactional, "transactional"],
    [informational, "informational"],
  ];

  for (const [group, intent] of groups) {
    for (const kw of group.keywords) {
      const words = kw.toLowerCase().split(/\s+/);
      const coveredByPages: string[] = [];
      const inTitles: string[] = [];
      const inDescriptions: string[] = [];

      for (const page of pages) {
        const titleLower = page.title.toLowerCase();
        const descLower = page.description.toLowerCase();
        const wordsInTitle = words.filter((w) => titleLower.includes(w)).length;
        const wordsInDesc = words.filter((w) => descLower.includes(w)).length;

        if (wordsInTitle >= words.length * 0.5) inTitles.push(page.url);
        if (wordsInDesc >= words.length * 0.5) inDescriptions.push(page.url);
        if (wordsInTitle >= words.length * 0.5 || wordsInDesc >= words.length * 0.5) {
          coveredByPages.push(page.url);
        }
      }

      const status: KeywordReport["status"] =
        inTitles.length > 0 ? "well-covered" : coveredByPages.length > 0 ? "partial" : "gap";

      reports.push({ keyword: kw, intent, priority: group.priority, coveredByPages, inTitles, inDescriptions, status });
    }
  }

  return reports;
}

// ─── Content Gap Analysis ────────────────────────────────────────────────────────

function findContentGaps(keywords: KeywordReport[], existingArticlePaths: string[]): string[] {
  const gaps: string[] = [];
  for (const kw of keywords) {
    if (kw.status === "gap" && kw.intent === "informational") {
      gaps.push(kw.keyword);
    }
  }
  return gaps;
}

function suggestArticles(gaps: string[]): string[] {
  const suggestions: string[] = [];
  const topicMap: Record<string, string> = {
    "puppy food guide uae": "The Complete Puppy Food Guide for UAE Pet Owners: What, When and How Much to Feed",
    "dog grooming tips dubai": "Dog Grooming in Dubai: Tips, Schedules and Where to Go for Every Coat Type",
    "dog registration uae municipality": "How to Register Your Dog in the UAE: Municipality Rules in Every Emirate",
    "pet travel rules uae": "Travelling With Your Dog In and Out of the UAE: Rules, Airlines and Checklist",
    "puppy training tips beginners": "Puppy Training for Beginners: The First Commands Every New Owner Should Teach",
    "best small dogs for families": "The Best Small Dog Breeds for Families With Children in the UAE",
    "hypoallergenic dog breeds uae": "Hypoallergenic Dog Breeds Available in the UAE: Which Really Shed Less?",
    "maltese vs shih tzu comparison": "Maltese vs Shih Tzu: An Honest Comparison for UAE Puppy Buyers",
    "puppy potty training apartment": "Puppy Potty Training in a UAE Apartment: A Step-by-Step Guide",
    "dog parks dubai": "The Best Dog Parks and Pet-Friendly Spaces in Dubai (Updated 2026)",
    "pet insurance uae": "Pet Insurance in the UAE: What It Covers, What It Costs and Whether You Need It",
    "puppy teething tips": "Puppy Teething: What to Expect, What to Give and What to Hide",
    "dog socialization tips": "How to Socialise Your Puppy Safely in the UAE: A Week-by-Week Guide",
    "best dog food brands uae": "The Best Dog Food Brands Available in the UAE: A Vet-Informed Guide",
    "puppy growth stages": "Puppy Growth Stages: What to Expect From 8 Weeks to One Year",
    "when to spay neuter puppy uae": "When to Spay or Neuter Your Puppy in the UAE: Age, Cost and Recovery",
    "summer grooming tips dogs": "Summer Grooming for Dogs in the UAE: Trims, Baths and Coat Care in the Heat",
    "puppy separation anxiety": "Puppy Separation Anxiety: Signs, Prevention and What to Do When You Go to Work",
    "raw diet for dogs uae": "Raw Diet for Dogs in the UAE: Benefits, Risks and Where to Buy",
  };

  for (const gap of gaps.slice(0, 10)) {
    const suggested = topicMap[gap];
    if (suggested) {
      suggestions.push(suggested);
    } else {
      const title = gap.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      suggestions.push(`${title}: A Complete Guide for UAE Pet Owners`);
    }
  }
  return suggestions;
}

// ─── Main ────────────────────────────────────────────────────────────────────────

const mode = isWeekly ? "weekly" : keywordsOnly ? "keywords" : reportOnly ? "report" : "daily";

if (!jsonOutput) {
  console.log(`\n🔍 SEO Agent — ${mode} run`);
  console.log(`   Site: ${base}`);
  console.log(`   Time: ${new Date().toISOString()}\n`);
}

// 1. Fetch sitemap
const smRes = await get("/sitemap.xml");
const sitemapUrls = [...smRes.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);

if (!jsonOutput) console.log(`Sitemap: ${sitemapUrls.length} URLs found\n`);

// 2. Audit pages
const pagesToAudit = keywordsOnly
  ? sitemapUrls.filter((p) => !p.startsWith("/ar/") && !p.startsWith("/ru/")).slice(0, 10)
  : sitemapUrls.filter((p) => !p.startsWith("/ar/") && !p.startsWith("/ru/"));

const pages: PageReport[] = [];
for (let i = 0; i < pagesToAudit.length; i += 6) {
  const batch = pagesToAudit.slice(i, i + 6);
  const results = await Promise.all(batch.map(auditPage));
  pages.push(...results);
  if (!jsonOutput && i % 18 === 0 && i > 0) {
    process.stdout.write(`  Audited ${pages.length}/${pagesToAudit.length} pages...\r`);
  }
}

if (!jsonOutput) console.log(`Audited ${pages.length} pages\n`);

// 3. Keyword analysis
const keywords = analyseKeywords(pages);
const wellCovered = keywords.filter((k) => k.status === "well-covered").length;
const partial = keywords.filter((k) => k.status === "partial").length;
const gaps = keywords.filter((k) => k.status === "gap").length;

// 4. Content gaps
const articlePaths = sitemapUrls.filter((p) => /^\/[a-z0-9-]{20,}\/$/.test(p));
const contentGaps = findContentGaps(keywords, articlePaths);
const articleSuggestions = suggestArticles(contentGaps);

// 5. Score
const criticalIssues = pages.reduce((n, p) => n + p.issues.filter((i) => i.includes("NOINDEX") || i.includes("missing") || i.includes("Invalid")).length, 0);
const warnings = pages.reduce((n, p) => n + p.issues.length, 0) - criticalIssues;
let overallScore = 100;
overallScore -= criticalIssues * 5;
overallScore -= warnings * 1;
overallScore -= gaps * 0.5;
overallScore = Math.max(0, Math.round(overallScore));

// 6. Actions
const actions: string[] = [];
if (criticalIssues > 0) actions.push(`Fix ${criticalIssues} critical SEO issues immediately`);
if (gaps > 0) actions.push(`Create content for ${Math.min(gaps, 5)} keyword gaps this week`);
if (articleSuggestions.length > 0) actions.push(`Write next batch of ${Math.min(articleSuggestions.length, 3)} articles`);
const pagesNoDesc = pages.filter((p) => p.descriptionLength < 40);
if (pagesNoDesc.length > 0) actions.push(`Add meta descriptions to ${pagesNoDesc.length} page(s)`);
const pagesNoOg = pages.filter((p) => !p.hasOgImage);
if (pagesNoOg.length > 0) actions.push(`Add og:image to ${pagesNoOg.length} page(s)`);

const report: AgentReport = {
  timestamp: new Date().toISOString(),
  mode,
  siteUrl: base,
  overallScore,
  summary: {
    pagesAudited: pages.length,
    criticalIssues,
    warnings,
    keywordsCovered: wellCovered + partial,
    keywordsTotal: keywords.length,
    contentGaps: contentGaps.length,
  },
  pages,
  keywords,
  contentGaps,
  articleSuggestions,
  actions,
};

// ─── Output ──────────────────────────────────────────────────────────────────────

if (jsonOutput) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("═".repeat(60));
  console.log(`  SEO SCORE: ${overallScore}/100`);
  console.log("═".repeat(60));

  console.log(`\n  Pages audited:      ${pages.length}`);
  console.log(`  Critical issues:    ${criticalIssues}`);
  console.log(`  Warnings:           ${warnings}`);
  console.log(`  Keywords covered:   ${wellCovered} well + ${partial} partial / ${keywords.length} total`);
  console.log(`  Keyword gaps:       ${gaps}`);
  console.log(`  Content gaps:       ${contentGaps.length}`);
  console.log(`  Articles in site:   ${articlePaths.length}`);

  // Critical issues
  const critPages = pages.filter((p) => p.issues.some((i) => i.includes("NOINDEX") || i.includes("missing") || i.includes("Invalid") || i.includes("returns")));
  if (critPages.length > 0) {
    console.log("\n  CRITICAL ISSUES:");
    for (const p of critPages) {
      for (const issue of p.issues) {
        console.log(`    ✗ ${p.url}  ${issue}`);
      }
    }
  }

  // Top keyword gaps
  if (contentGaps.length > 0) {
    console.log("\n  TOP KEYWORD GAPS (no content targeting these):");
    for (const kw of contentGaps.slice(0, 8)) {
      console.log(`    • ${kw}`);
    }
  }

  // Article suggestions
  if (isWeekly && articleSuggestions.length > 0) {
    console.log("\n  SUGGESTED ARTICLES FOR NEXT WEEK:");
    for (let i = 0; i < Math.min(articleSuggestions.length, 5); i++) {
      console.log(`    ${i + 1}. ${articleSuggestions[i]}`);
    }
  }

  // Actions
  if (actions.length > 0) {
    console.log("\n  RECOMMENDED ACTIONS:");
    for (const a of actions) {
      console.log(`    → ${a}`);
    }
  }

  // Pages with issues (top 10)
  const pagesWithIssues = pages.filter((p) => p.issues.length > 0).sort((a, b) => b.issues.length - a.issues.length);
  if (pagesWithIssues.length > 0 && !keywordsOnly) {
    console.log("\n  PAGES NEEDING ATTENTION (most issues first):");
    for (const p of pagesWithIssues.slice(0, 10)) {
      console.log(`    ${p.url}`);
      for (const issue of p.issues) console.log(`      - ${issue}`);
      if (p.suggestions.length > 0) console.log(`      → ${p.suggestions[0]}`);
    }
  }

  // Best keywords
  const bestKeywords = keywords.filter((k) => k.status === "well-covered" && k.priority === "high");
  if (bestKeywords.length > 0) {
    console.log("\n  WELL-COVERED HIGH-PRIORITY KEYWORDS:");
    for (const k of bestKeywords.slice(0, 8)) {
      console.log(`    ✓ "${k.keyword}" → ${k.inTitles.slice(0, 2).join(", ")}`);
    }
  }

  console.log(`\n${"═".repeat(60)}`);
  if (overallScore >= 80) console.log("  STATUS: HEALTHY — keep publishing and monitoring");
  else if (overallScore >= 50) console.log("  STATUS: NEEDS ATTENTION — fix critical issues, fill keyword gaps");
  else console.log("  STATUS: URGENT — fix all critical issues immediately");
  console.log(`${"═".repeat(60)}\n`);
}

process.exit(criticalIssues > 0 ? 1 : 0);
