-- Rollback for 001. Destroys all SEO product data. Take a backup first (see docs/RUNBOOK.md).
DROP TABLE IF EXISTS activity_log;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS issues;
DROP TABLE IF EXISTS audit_pages;
DROP TABLE IF EXISTS audit_runs;
DROP TABLE IF EXISTS sites;
DROP TABLE IF EXISTS usage_counters;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS tenant_subscriptions;
DROP TABLE IF EXISTS tenant_members;
DROP TABLE IF EXISTS tenants;
DROP TABLE IF EXISTS subscription_plans;
DROP TABLE IF EXISTS users;
