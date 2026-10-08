/**
 * Adds journal articles in advance, one per day, so the Journal grows by itself: each article is saved as published but
 * dated in the future, and the website only shows it (and lists it in the sitemap) once its day has come.
 *   npm run articles:add -- --dry-run
 *   npm run articles:add                       # first article tomorrow, then one per day
 *   npm run articles:add -- --start 2026-10-06 # choose the first day
 * Existing articles (same address) are never touched. Edit or unpublish any of them in Admin → Articles.
 */
import { eq } from "drizzle-orm";
import { cleanHtml } from "../src/lib/sanitize";
import { db, schema, sql } from "./db";
import { batch1 } from "./data/articles-batch-1";
import { batch2 } from "./data/articles-batch-2";

const dryRun = process.argv.includes("--dry-run");
const startArg = process.argv[process.argv.indexOf("--start") + 1];
const batches = [...batch1, ...batch2];

// The first day: tomorrow (or --start). Articles appear at 08:00 UAE time on their day.
const first = startArg && /^\d{4}-\d{2}-\d{2}$/.test(startArg) ? new Date(`${startArg}T04:00:00Z`) : new Date(Date.now() + 86400_000);
first.setUTCHours(4, 0, 0, 0);

const existing = new Set((await db.select({ slug: schema.articles.slug }).from(schema.articles)).map((r) => r.slug));
const breedCovers = new Map((await db.select({ slug: schema.breeds.slug, cover: schema.breeds.coverImage }).from(schema.breeds)).map((b) => [b.slug, b.cover]));

let day = 0;
let added = 0;
for (const a of batches) {
  if (existing.has(a.slug)) continue;
  const publishedAt = new Date(first.getTime() + day * 86400_000);
  day++;
  console.log(`${publishedAt.toISOString().slice(0, 10)}  /${a.slug}/  (${a.body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length} words)`);
  added++;
  if (dryRun) continue;
  await db.insert(schema.articles).values({
    slug: a.slug,
    status: "published",
    title: { en: a.title },
    excerpt: { en: a.excerpt },
    body: { en: cleanHtml(a.body) },
    coverImage: breedCovers.get(a.cover) ?? null,
    publishedAt,
    seoTitle: { en: a.seoTitle },
    seoDescription: { en: a.seoDescription },
  });
}
console.log(`\n${dryRun ? "Dry run: " : ""}${added} article(s) ${dryRun ? "would be " : ""}scheduled, one per day.`);
await sql.end();
