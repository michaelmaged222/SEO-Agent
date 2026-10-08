# SEO Agent - Puppyfy UAE

Automated SEO management system that handles keyword tracking, meta auditing, content pipeline, Google ranking protection and weekly article generation for the Puppyfy UAE website.

## What It Does

### 1. Daily SEO Health Monitor
Audits every page on the live site and produces a score (0-100):
- Meta titles and descriptions (length, keyword presence, truncation warnings)
- Canonical URLs (prevents duplicate content penalties)
- Structured data / JSON-LD (enables rich snippets in Google results)
- Hreflang tags (en/ar/ru coverage for multilingual SEO)
- Image alt text (image search traffic)
- Noindex detection (catches pages accidentally hidden from Google)
- Internal link analysis

### 2. Keyword Tracking (91 Target Keywords)
- **24 transactional keywords** (high priority) - "buy puppy dubai", "puppies for sale uae", breed-specific purchase queries
- **30 informational keywords** (medium priority) - "puppy vaccination schedule uae", "best dog breeds for apartments dubai"
- **37 breed-specific long-tail keywords** - mapped to individual product pages

The agent reports which keywords are well-covered, partially covered, or complete gaps.

### 3. Content Gap Analysis
Identifies informational keywords with no page targeting them and suggests article titles to fill the gaps.

### 4. Article Pipeline (20 SEO-Optimized Articles)
Two batches of pre-written articles targeting keyword gaps:

**Batch 1** (10 articles):
- Puppy prices in Dubai & UAE
- Best dog breeds for apartments
- Vaccination schedule
- How to import a puppy to UAE
- Heat safety guide
- Golden Retriever vs Labrador
- Teacup, Toy & Mini sizes explained
- How to choose a healthy puppy
- First week with a new puppy
- Pomeranian care guide

**Batch 2** (10 articles):
- Puppy food guide for UAE
- Dog grooming tips for Dubai
- Municipality registration rules
- Puppy training for beginners
- Best small breeds for families
- Hypoallergenic breeds in UAE
- Maltese vs Shih Tzu comparison
- Apartment potty training
- Puppy teething guide
- Socialisation week-by-week guide

Each article is 350-490 words, SEO-optimized with title/description, internal links to breed pages, and WhatsApp CTA.

### 5. Google Ranking Protection
Validates robots.txt, sitemap.xml, redirect chains, noindex directives, canonical URLs and structured data across all pages and all three languages (English, Arabic, Russian).

## Commands

```bash
# Daily quick health check (score + critical issues)
npm run seo:agent

# Weekly deep scan with content gap analysis and article suggestions
npm run seo:agent -- --weekly

# Keyword analysis only
npm run seo:agent -- --keywords

# Machine-readable JSON output
npm run seo:agent -- --json

# Detailed per-page meta audit with fix suggestions
npm run seo:meta

# Per-page meta audit as JSON
npm run seo:meta -- --json

# Google-facing health check (robots, sitemap, pages, structured data)
npm run seo:check

# Preview new articles without publishing
npm run articles:add -- --dry-run

# Schedule articles (one per day, starting tomorrow)
npm run articles:add

# Schedule articles starting on a specific date
npm run articles:add -- --start 2026-10-15

# Point any command at a specific site
npm run seo:agent -- --base https://www.puppyfyuae.com
npm run seo:meta -- --base https://www.puppyfyuae.com
npm run seo:check -- --base https://www.puppyfyuae.com
```

## Server Automation

### Daily cron (6:00 AM UAE / 2:00 AM UTC)
```bash
bash deploy/seo-agent.sh --quiet
```
Only sends alerts when the score drops below 70.

### Weekly cron (Sunday 6:00 AM UAE)
```bash
bash deploy/seo-agent.sh --weekly
```
Full deep scan with content plan and article suggestions.

### Weekly SEO health check (Monday)
```bash
bash deploy/seo-check.sh
```
Validates robots.txt, sitemap and every page Google sees.

## File Structure

```
scripts/
  seo-agent.ts              # Main SEO agent orchestrator
  seo-meta-audit.ts         # Detailed per-page meta audit
  seo-check.ts              # Google-facing health check
  add-articles.ts           # Article scheduling pipeline
  data/
    seo-keywords.ts          # 91 target keywords database
    articles-batch-1.ts      # First 10 SEO articles
    articles-batch-2.ts      # Second 10 SEO articles
deploy/
  seo-agent.sh              # Server automation (daily/weekly)
  seo-check.sh              # Weekly health check automation
```

## Adding New Keywords

Edit `scripts/data/seo-keywords.ts`:

```typescript
// Add to transactional (purchase intent)
export const transactional: KeywordGroup = {
  intent: "transactional",
  priority: "high",
  keywords: [
    "buy puppy dubai",
    "your new keyword here",
  ],
};

// Add breed-specific keywords
export const breedKeywords: Record<string, string[]> = {
  "breed-slug": ["keyword 1", "keyword 2"],
};
```

## Adding New Articles

1. Create a new batch file: `scripts/data/articles-batch-3.ts`
2. Export an array of `ArticleDraft` objects (slug, title, excerpt, seoTitle, seoDescription, cover, body)
3. Import and spread it in `scripts/add-articles.ts`:
   ```typescript
   import { batch3 } from "./data/articles-batch-3";
   const batches = [...batch1, ...batch2, ...batch3];
   ```
4. Run `npm run articles:add -- --dry-run` to preview, then `npm run articles:add` to schedule.

## How It Increases Organic Reach

1. **Keyword gaps identified** = articles written to fill them = new pages Google indexes
2. **Meta audit** = every page has optimal title/description = higher click-through rate in search results
3. **Structured data** = rich snippets (FAQ, Product, Breadcrumbs) = more visible search listings
4. **Content pipeline** = one new article per day = consistent fresh content signal to Google
5. **Ranking protection** = daily monitoring catches broken pages, noindex mistakes, missing canonicals before they hurt rankings
