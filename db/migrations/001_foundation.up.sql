-- 001 Foundation: accounts, tenants, plans/entitlements, sites, audits, issues, jobs, activity log.
-- Naming mirrors the existing Pet-sy multi-tenant schema (tenants, tenant_members,
-- subscription_plans, tenant_subscriptions) so the two products can share accounts later.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL,
  name          text NOT NULL DEFAULT '',
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_lower_uq ON users (lower(email));

CREATE TABLE subscription_plans (
  id            text PRIMARY KEY,                 -- 'free', 'starter', 'growth', 'agency'
  name          text NOT NULL,
  -- Prices are data, not code. NULL = not priced yet (billing not configured).
  price_cents   integer CHECK (price_cents IS NULL OR price_cents >= 0),
  currency      text,
  billing_interval text CHECK (billing_interval IN ('month', 'year')),
  entitlements  jsonb NOT NULL,
  is_public     boolean NOT NULL DEFAULT true,
  sort_order    integer NOT NULL DEFAULT 0,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tenants (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  slug           text NOT NULL UNIQUE,
  industry       text NOT NULL DEFAULT '',
  -- Progressive autonomy: 0 audit only, 1 recommendations/drafts, 2 low-risk fixes, 3 extended.
  autonomy_level smallint NOT NULL DEFAULT 0 CHECK (autonomy_level BETWEEN 0 AND 3),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tenant_members (
  tenant_id  uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id)
);
CREATE INDEX tenant_members_user_idx ON tenant_members (user_id);

CREATE TABLE tenant_subscriptions (
  tenant_id          uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id            text NOT NULL REFERENCES subscription_plans(id),
  -- 'free' = no paid subscription; billing provider not configured in this phase.
  status             text NOT NULL CHECK (status IN ('free', 'trialing', 'active', 'past_due', 'canceled')),
  billing_provider   text,
  provider_reference text,
  current_period_end timestamptz,
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  token_hash       text PRIMARY KEY,            -- sha256 of the cookie token; raw token never stored
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  active_tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL,
  expires_at       timestamptz NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_idx ON sessions (user_id);

CREATE TABLE usage_counters (
  tenant_id    uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric       text NOT NULL,
  period_start date NOT NULL,
  value        integer NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id, metric, period_start)
);

CREATE TABLE sites (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  domain              text NOT NULL,             -- normalized host, e.g. www.example.com
  root_url            text NOT NULL,             -- https://www.example.com/
  industry            text NOT NULL DEFAULT '',
  market              text NOT NULL DEFAULT '',
  languages           text[] NOT NULL DEFAULT '{}',
  goals               text NOT NULL DEFAULT '',
  verification_token  text NOT NULL,
  verification_method text CHECK (verification_method IN ('meta', 'file', 'dns')),
  verified_at         timestamptz,
  schedule_enabled    boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, domain),
  UNIQUE (id, tenant_id)
);

CREATE TABLE audit_runs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id       uuid NOT NULL,
  kind          text NOT NULL CHECK (kind IN ('preliminary', 'full')),
  trigger       text NOT NULL CHECK (trigger IN ('manual', 'scheduled', 'onboarding')),
  status        text NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed')),
  pages_limit   integer NOT NULL,
  pages_crawled integer NOT NULL DEFAULT 0,
  requests_made integer NOT NULL DEFAULT 0,
  summary       jsonb NOT NULL DEFAULT '{}',
  error         text,
  created_by    uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  started_at    timestamptz,
  finished_at   timestamptz,
  FOREIGN KEY (site_id, tenant_id) REFERENCES sites(id, tenant_id) ON DELETE CASCADE
);
-- At most one queued/running audit per site: prevents overlap and duplicate runs.
CREATE UNIQUE INDEX audit_runs_one_active_per_site ON audit_runs (site_id) WHERE status IN ('queued', 'running');
CREATE INDEX audit_runs_site_created_idx ON audit_runs (site_id, created_at DESC);

CREATE TABLE audit_pages (
  id               bigserial PRIMARY KEY,
  run_id           uuid NOT NULL REFERENCES audit_runs(id) ON DELETE CASCADE,
  tenant_id        uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  url              text NOT NULL,
  final_url        text,
  status_code      integer,
  response_ms      integer,
  bytes            integer,
  title            text,
  meta_description text,
  h1_count         integer,
  canonical        text,
  lang             text,
  noindex          boolean,
  word_count       integer,
  error            text,
  fetched_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_pages_run_idx ON audit_pages (run_id);

CREATE TABLE issues (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id       uuid NOT NULL,
  fingerprint   text NOT NULL,
  rule          text NOT NULL,
  category      text NOT NULL,
  severity      text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  scope         text NOT NULL CHECK (scope IN ('page', 'site')),
  url           text,
  title         text NOT NULL,
  detail        text NOT NULL DEFAULT '',
  evidence      jsonb NOT NULL DEFAULT '{}',
  status        text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),
  occurrences   integer NOT NULL DEFAULT 1,
  first_seen_run uuid,
  last_seen_run  uuid,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  resolved_at   timestamptz,
  UNIQUE (site_id, fingerprint),
  FOREIGN KEY (site_id, tenant_id) REFERENCES sites(id, tenant_id) ON DELETE CASCADE
);
CREATE INDEX issues_site_status_idx ON issues (site_id, status);

CREATE TABLE jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  site_id         uuid,
  type            text NOT NULL,
  payload         jsonb NOT NULL DEFAULT '{}',
  priority        smallint NOT NULL DEFAULT 5,   -- lower runs first
  status          text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'succeeded', 'failed')),
  idempotency_key text UNIQUE,
  attempts        integer NOT NULL DEFAULT 0,
  max_attempts    integer NOT NULL DEFAULT 3,
  run_after       timestamptz NOT NULL DEFAULT now(),
  locked_at       timestamptz,
  locked_by       text,
  last_error      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  finished_at     timestamptz
);
CREATE INDEX jobs_claim_idx ON jobs (priority, created_at) WHERE status = 'queued';

CREATE TABLE activity_log (
  id            bigserial PRIMARY KEY,
  tenant_id     uuid REFERENCES tenants(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  actor_kind    text NOT NULL DEFAULT 'user' CHECK (actor_kind IN ('user', 'system', 'agent')),
  action        text NOT NULL,
  target        text,
  detail        jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activity_log_tenant_idx ON activity_log (tenant_id, created_at DESC);

-- Plans are configuration. Prices are intentionally NULL: billing is not configured yet.
-- Change limits/prices with SQL or a future admin screen, never in UI code.
INSERT INTO subscription_plans (id, name, price_cents, currency, billing_interval, entitlements, sort_order) VALUES
('free', 'Free', NULL, NULL, NULL, '{
  "max_sites": 1, "seats": 1, "unverified_pages": 10, "max_pages_per_crawl": 50,
  "manual_audits_per_day": 3, "scheduled_audits": false, "pages_per_month": 500,
  "retention_days": 30, "integrations": [], "content_drafts_per_month": 0,
  "fix_quota_per_month": 0, "ai_budget_cents_per_month": 0, "report_cadence": "none"
}', 10),
('starter', 'Starter', NULL, NULL, 'month', '{
  "max_sites": 1, "seats": 2, "unverified_pages": 10, "max_pages_per_crawl": 250,
  "manual_audits_per_day": 10, "scheduled_audits": true, "pages_per_month": 10000,
  "retention_days": 90, "integrations": ["google_search_console"], "content_drafts_per_month": 4,
  "fix_quota_per_month": 0, "ai_budget_cents_per_month": 500, "report_cadence": "weekly"
}', 20),
('growth', 'Growth', NULL, NULL, 'month', '{
  "max_sites": 3, "seats": 5, "unverified_pages": 10, "max_pages_per_crawl": 1000,
  "manual_audits_per_day": 30, "scheduled_audits": true, "pages_per_month": 60000,
  "retention_days": 365, "integrations": ["google_search_console", "wordpress", "github"],
  "content_drafts_per_month": 12, "fix_quota_per_month": 50, "ai_budget_cents_per_month": 2000,
  "report_cadence": "daily"
}', 30),
('agency', 'Agency', NULL, NULL, 'month', '{
  "max_sites": 20, "seats": 20, "unverified_pages": 10, "max_pages_per_crawl": 2000,
  "manual_audits_per_day": 100, "scheduled_audits": true, "pages_per_month": 400000,
  "retention_days": 365, "integrations": ["google_search_console", "wordpress", "github"],
  "content_drafts_per_month": 60, "fix_quota_per_month": 300, "ai_budget_cents_per_month": 10000,
  "report_cadence": "daily"
}', 40);
