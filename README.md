# Pet-sy SEO

Multi-tenant, subscription-ready SEO automation SaaS under the Pet-sy umbrella
(planned at `seo.pet-sy.com`). Works for any industry. Puppyfy UAE is tenant #1, onboarded
through the normal signup flow — nothing is hard-coded for it.

**Status: Phase 1 vertical slice.** See [What works / what doesn't](#what-works-today).

## What works today

| Capability | Status |
|---|---|
| Signup, sign-in, sessions, workspaces (tenants), roles (owner/admin/editor/viewer) | ✅ Built, tested |
| Server-side tenant isolation on every route and job | ✅ Built, tested with cross-tenant attack tests |
| Add a website (industry, market, languages, goals) | ✅ |
| Ownership verification: meta tag, DNS TXT, or file | ✅ |
| Quick read-only check (≤10 pages) right after signup, no Google/CMS needed | ✅ |
| Full crawl for verified sites, robots.txt respected, sitemap read | ✅ |
| 40+ deterministic technical checks with evidence, "why it matters", "how to fix" | ✅ |
| Deduplicated issues (fingerprints), auto-resolve when fixed, ignore/reopen | ✅ |
| Postgres job queue: idempotent, no overlap per site, retries with backoff, stale-lock recovery | ✅ |
| Daily scheduler (verified sites, plans that include it, once per day) | ✅ |
| Plans & limits as data; enforced in API and worker | ✅ (prices **not set**) |
| SSRF protection (private IPs, DNS pinning, redirect re-validation, size/time limits) | ✅ |
| Activity log (who did what) | ✅ |
| Dashboard UI (desktop + mobile, light/dark) | ✅ |
| Google Search Console | ❌ Not configured — no search metrics are shown |
| Keyword research, Content Studio, localization agent, reports by email | ❌ Not implemented |
| WordPress / GitHub write connectors, auto-fixes | ❌ Not implemented (all tenants are autonomy level 0 = audit only) |
| Billing / payments | ❌ Not configured |
| Invites, account export/deletion, backups automation | ❌ Not implemented |

The UI's **Plan & features** page shows exactly this, per workspace.

## Architecture

```
web/            Vanilla JS dashboard (no build step, strict CSP, no innerHTML for data)
src/server.ts   HTTP API + static files (node:http)
src/worker.ts   Background worker: audit jobs + daily scheduler (separate process)
src/routes/     API routes — every query scoped by the session's tenant
src/crawler/    safe-fetch (SSRF), robots, crawl, HTML extraction, checks (Technical SEO Auditor)
src/audit.ts    Orchestrator: run creation, execution, issue dedupe/resolution
src/jobs.ts     Postgres queue (SKIP LOCKED, idempotency keys, backoff)
db/migrations/  SQL up/down migrations
test/           node:test suites (unit + full API integration against Postgres)
```

Specialist "agents" are modules with narrow permissions, not separate paid LLMs. The only one
built so far is the **Technical SEO Auditor** (deterministic, no AI). The worker acts as the
**Orchestrator** (scheduling, budgets, dedupe). Crawled text is treated as untrusted data.

## Run locally

Requires Node ≥ 22.18 and PostgreSQL ≥ 14.

```bash
npm install
cp .env.example .env            # set DATABASE_URL
npm run migrate
npm start                        # API + dashboard on http://localhost:5100
npm run worker                   # in a second terminal
```

## Checks

```bash
npm run typecheck
npm test        # needs a database at TEST_DATABASE_URL (default postgres://seo:seo@localhost:5432/seo_test)
```

Deployment: see [docs/RUNBOOK.md](docs/RUNBOOK.md). Phase 0 findings: [docs/RECON.md](docs/RECON.md).
