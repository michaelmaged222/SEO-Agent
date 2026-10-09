# Phase 0 — Reconnaissance report (2026-10-09)

## What was found

| Repo | What it is | Relevance |
|---|---|---|
| `michaelmaged222/SEO-Agent` | Old single-tenant Puppyfy SEO scripts (keyword list, 20 article drafts, `seo-agent.ts`, shell scripts). | **Removed** in this branch. Replaced by this product. |
| `michaelmaged222/puppyfy-website-` | Live puppyfyuae.com (Next.js 16, Drizzle, Postgres, next-intl en/ar/ru). Contains earlier SEO commits: structured data, ar/ru titles, sitemap images, `npm run seo:check`, 10 scheduled journal articles. | **Not changed.** It is tenant #1's website, audited read-only by this product. Removing its SEO work needs the owner's decision. |
| `michaelmaged222/Petsy-App--Claude-v5-` | Only a README ("Dashboard-puppyfy"). | No code to reuse. |
| `michaelmaged222/Petsyapp` | Old Bolt/Supabase version of Pet-sy (RLS multi-tenancy, `tenants`, `tenant_members`, `subscription_plans`, `tenant_subscriptions`, Stripe edge functions). | Abandoned per owner. Table **names** reused here so accounts can merge later. Stripe code was not tested or reused. |
| Live pet-sy.com (Clerk + Express + PostgreSQL on the DigitalOcean droplet) | Not in GitHub; owner says the code is on his Mac. | **Not inspected** — Mac not connected to this session. Integration deferred (see gaps). |

Three scheduled cloud agents ("Daily SEO Guard", "Daily SEO Deep Scan & Optimizer",
"Article Publisher & SEO Validator") that pushed autonomous changes to the website were **deleted**
on 2026-10-09 at the owner's request. They conflicted with the new fix policy (they changed
production SEO without approval).

## Decision

Build the SEO product as a **standalone service** (`seo.pet-sy.com`) with its own auth and
tenant model, because the live Pet-sy code was unavailable and the master prompt asks for a
standalone product usable by any industry. Shared naming keeps a later single-sign-on / account
merge straightforward.

## Environment constraints met while building

- The build sandbox could not reach the npm registry, so the product has **one runtime dependency**
  (`postgres` driver) and uses Node 22's built-in TypeScript support, `node:test` and `node:http`.
  On the droplet `npm install` works normally.
- The sandbox's network policy blocks puppyfyuae.com, so the first real audit of Puppyfy must run
  on the server after deployment.

## Gaps to close (owner input needed)

1. Live Pet-sy code location (Mac) — needed to share login/billing with pet-sy.com.
2. Approval to deploy to the droplet and create the `seo.pet-sy.com` DNS record (GoDaddy).
3. Whether to remove old SEO commits from puppyfyuae.com (recommended: keep them).
4. Google Cloud OAuth client for Search Console (Phase 5).
5. Billing provider decision and test keys (Phase 10).
