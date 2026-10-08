/**
 * SEO health check: looks at the public website the way Google does and reports what could stop it from being
 * found. Run on any address: `npm run seo:check -- --base https://www.puppyfyuae.com`.
 * Exit code 1 when something is broken (FAIL); warnings (WARN) do not fail it.
 * The server runs it every Monday (deploy/seo-check.sh) and messages the alert channel if anything FAILs.
 */
// A module (so top-level await is allowed and names do not clash with browser globals).
export {};

const arg = (name: string, fallback = "") => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? (process.argv[i + 1] ?? "") : fallback;
};
const base = (arg("base") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100").replace(/\/$/, "");
const limit = Number(arg("limit", "400")) || 400;
const quiet = process.argv.includes("--quiet");
const UA = { "User-Agent": "Mozilla/5.0 (compatible; puppyfy-seo-check/1.0)" };

type Level = "FAIL" | "WARN";
const problems: { level: Level; where: string; what: string }[] = [];
let checks = 0;
const flag = (level: Level, where: string, what: string) => problems.push({ level, where, what });
const ok = (cond: unknown, level: Level, where: string, what: string) => {
  checks++;
  if (!cond) flag(level, where, what);
  return !!cond;
};

async function get(path: string, init: RequestInit = {}) {
  try {
    const res = await fetch(path.startsWith("http") ? path : base + path, { redirect: "manual", headers: UA, signal: AbortSignal.timeout(20000), ...init });
    return { status: res.status, headers: res.headers, text: init.method === "HEAD" ? "" : await res.text(), location: res.headers.get("location") ?? "" };
  } catch (e) {
    return { status: 0, headers: new Headers(), text: "", location: String((e as Error).message) };
  }
}

const strip = (h: string) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "");
const attr = (tag: string, name: string) => new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i").exec(tag)?.[1] ?? "";

async function page(path: string, expect: { types?: string[]; self?: boolean } = {}) {
  const r = await get(path);
  const where = path;
  if (!ok(r.status === 200, "FAIL", where, `answers ${r.status || "no response"} instead of 200`)) return;
  const html = r.text;
  const head = strip(html);
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1]?.trim() ?? "";
  ok(title.length >= 10, "FAIL", where, "has no title");
  ok(title.length <= 75, "WARN", where, `title is ${title.length} characters (Google cuts it at about 60-70)`);
  const desc = /<meta[^>]*name="description"[^>]*>/i.exec(head)?.[0];
  const descText = desc ? attr(desc, "content") : "";
  ok(descText.length >= 40, "WARN", where, "description is missing or very short");
  ok(descText.length <= 180, "WARN", where, `description is ${descText.length} characters (Google cuts it at about 155-160)`);
  const h1 = (head.match(/<h1[\s>]/gi) ?? []).length;
  ok(h1 === 1, "WARN", where, `has ${h1} H1 headings (should be exactly 1)`);
  const robots = /<meta[^>]*name="robots"[^>]*>/i.exec(head)?.[0] ?? "";
  ok(!/noindex/i.test(robots) && !/noindex/i.test(r.headers.get("x-robots-tag") ?? ""), "FAIL", where, "is marked noindex: Google will not list it");
  const canonical = attr(/<link[^>]*rel="canonical"[^>]*>/i.exec(head)?.[0] ?? "", "href");
  ok(canonical, "FAIL", where, "has no canonical address");
  if (canonical && expect.self !== false) {
    const url = new URL(canonical, base);
    ok(url.origin === new URL(base).origin, "FAIL", where, `canonical points to another site (${url.origin})`);
    ok(url.pathname === path.split("?")[0], "WARN", where, `canonical (${url.pathname}) is not this address`);
  }
  const alternates = [...head.matchAll(/<link[^>]*rel="alternate"[^>]*hreflang="([^"]+)"[^>]*>/gi)].map((m) => m[1].toLowerCase());
  const alt2 = [...head.matchAll(/<link[^>]*hrefLang="([^"]+)"[^>]*rel="alternate"[^>]*>/gi)].map((m) => m[1].toLowerCase());
  const langs = new Set([...alternates, ...alt2]);
  ok(["en", "ar", "ru", "x-default"].every((l) => langs.has(l)), "WARN", where, "language links (hreflang) for en, ar, ru and x-default are incomplete");
  ok(/property="og:image"/i.test(head), "WARN", where, "has no social-sharing image (og:image)");
  const imgs = head.match(/<img[^>]*>/gi) ?? [];
  const noAlt = imgs.filter((i) => !/\salt="[^"]+"/i.test(i) && !/aria-hidden/i.test(i)).length;
  ok(noAlt <= 3, "WARN", where, `${noAlt} images have no alt text`);
  // structured data must parse and contain the expected types
  const types: string[] = [];
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const j = JSON.parse(m[1].replace(/\\u003c/g, "<"));
      const t = j["@type"];
      types.push(...(Array.isArray(t) ? t : [t]));
    } catch {
      flag("FAIL", where, "has structured data (JSON-LD) that is not valid JSON");
    }
  }
  for (const want of expect.types ?? []) ok(types.includes(want), "WARN", where, `is missing ${want} structured data`);
}

console.log(`SEO check of ${base}\n`);

// 1. robots.txt and the redirects people and Google arrive through
const robots = await get("/robots.txt");
ok(robots.status === 200, "FAIL", "/robots.txt", `answers ${robots.status}`);
ok(/^sitemap:/im.test(robots.text), "WARN", "/robots.txt", "does not point to the sitemap");
ok(!/^disallow:\s*\/\s*$/im.test(robots.text.split(/user-agent:/i).find((b) => /^\s*\*/.test(b)) ?? ""), "FAIL", "/robots.txt", "blocks the whole site for all crawlers");
if (base.startsWith("https://")) {
  const host = new URL(base).host;
  const http = await get(`http://${host}/`);
  ok([301, 308].includes(http.status) && http.location.startsWith("https://"), "WARN", "http://" + host, "does not redirect to https");
  const bare = host.replace(/^www\./, "");
  if (bare !== host) {
    const r = await get(`https://${bare}/`);
    ok([301, 308].includes(r.status), "WARN", `https://${bare}/`, "does not redirect to the www address");
  }
}

// 2. the sitemap, and every address in it
const sm = await get("/sitemap.xml");
ok(sm.status === 200, "FAIL", "/sitemap.xml", `answers ${sm.status}`);
const urls = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
ok(urls.length >= 20, "FAIL", "/sitemap.xml", `lists only ${urls.length} addresses`);
let bad = 0;
const siteOrigin = new URL(base).origin;
for (let i = 0; i < Math.min(urls.length, limit); i += 8) {
  const batch = urls.slice(i, i + 8);
  const results = await Promise.all(batch.map(async (u) => ({ u, r: await get(new URL(u).pathname, { method: "HEAD" }) })));
  for (const { u, r } of results) {
    const path = new URL(u).pathname;
    if (new URL(u).origin !== siteOrigin) ok(false, "WARN", path, `is listed in the sitemap with another address (${new URL(u).origin})`);
    else if (r.status !== 200) {
      bad++;
      ok(false, "FAIL", path, `is in the sitemap but answers ${r.status}`);
    } else checks++;
  }
}

// 3. the pages that matter most, in all three languages
const first = (re: RegExp) => urls.map((u) => new URL(u).pathname).find((p) => re.test(p));
const breed = first(/^\/product\//) ?? "/product/maltese-puppies/";
const article = urls.map((u) => new URL(u).pathname).find((p) => /^\/[a-z0-9-]{25,}\/$/.test(p));
await page("/", { types: ["PetStore", "WebSite"] });
await page("/puppies/", { types: ["BreadcrumbList", "ItemList"] });
await page("/importing/", { types: ["BreadcrumbList"] });
await page(breed, { types: ["Product", "BreadcrumbList"] });
if (article) await page(article, { types: ["Article", "BreadcrumbList"] });
await page("/faqs/", { types: ["FAQPage"] });
await page("/contact-us/");
for (const l of ["ar", "ru"]) {
  await page(`/${l}/`, { types: ["PetStore"] });
  await page(`/${l}${breed}`, { types: ["Product"] });
}

// 4. Arabic and Russian titles must be in their language, not English
for (const [l, re] of [["ar", /[؀-ۿ]/], ["ru", /[Ѐ-ӿ]/]] as const) {
  const r = await get(`/${l}${breed}`);
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(r.text)?.[1] ?? "";
  ok(re.test(title), "WARN", `/${l}${breed}`, `title is not in ${l === "ar" ? "Arabic" : "Russian"}: "${title.slice(0, 50)}"`);
}

const fails = problems.filter((p) => p.level === "FAIL");
const warns = problems.filter((p) => p.level === "WARN");
for (const p of quiet ? fails : problems) console.log(`${p.level.padEnd(5)} ${p.where}  ${p.what}`);
console.log(`\n${checks} checks, ${urls.length} addresses in the sitemap (${bad} broken), ${fails.length} FAIL, ${warns.length} WARN`);
console.log(fails.length ? "SEO check: PROBLEMS FOUND" : "SEO check: everything Google needs is in place");
process.exit(fails.length ? 1 : 0);
