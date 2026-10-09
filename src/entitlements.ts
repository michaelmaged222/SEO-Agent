// Plan entitlements and usage. Limits are read from subscription_plans (data, not code)
// and enforced here, in the API and in workers - never only in the UI.
import type { Sql } from './db.ts';
import { HttpError } from './lib/http.ts';

export interface Entitlements {
  max_sites: number;
  seats: number;
  unverified_pages: number;
  max_pages_per_crawl: number;
  manual_audits_per_day: number;
  scheduled_audits: boolean;
  pages_per_month: number;
  retention_days: number;
  integrations: string[];
  content_drafts_per_month: number;
  fix_quota_per_month: number;
  ai_budget_cents_per_month: number;
  report_cadence: string;
}

export interface PlanInfo {
  planId: string;
  planName: string;
  status: string;
  priceCents: number | null;
  entitlements: Entitlements;
}

export async function getPlan(sql: Sql, tenantId: string): Promise<PlanInfo> {
  const [row] = await sql<{ plan_id: string; name: string; status: string; price_cents: number | null; entitlements: Entitlements }[]>`
    SELECT ts.plan_id, p.name, ts.status, p.price_cents, p.entitlements
    FROM tenant_subscriptions ts JOIN subscription_plans p ON p.id = ts.plan_id
    WHERE ts.tenant_id = ${tenantId}`;
  if (!row) throw new HttpError(500, 'no_subscription', 'Workspace has no plan record.');
  const active = ['free', 'trialing', 'active'].includes(row.status);
  if (!active) throw new HttpError(402, 'subscription_inactive', `Subscription is ${row.status}.`);
  return { planId: row.plan_id, planName: row.name, status: row.status, priceCents: row.price_cents, entitlements: row.entitlements };
}

export type Metric = 'manual_audits' | 'pages_crawled';

function periodStart(metric: Metric, now = new Date()): string {
  const d = now.toISOString().slice(0, 10);
  return metric === 'manual_audits' ? d : `${d.slice(0, 7)}-01`; // daily vs monthly window
}

export async function getUsage(sql: Sql, tenantId: string, metric: Metric): Promise<number> {
  const [row] = await sql<{ value: number }[]>`
    SELECT value FROM usage_counters WHERE tenant_id = ${tenantId} AND metric = ${metric} AND period_start = ${periodStart(metric)}`;
  return row?.value ?? 0;
}

/** Atomically consume `amount` if it stays within `limit`. Returns false (consumes nothing) otherwise. */
export async function tryConsume(sql: Sql, tenantId: string, metric: Metric, amount: number, limit: number): Promise<boolean> {
  const period = periodStart(metric);
  const rows = await sql`
    INSERT INTO usage_counters (tenant_id, metric, period_start, value)
    SELECT ${tenantId}, ${metric}, ${period}, ${amount} WHERE ${amount} <= ${limit}
    ON CONFLICT (tenant_id, metric, period_start)
    DO UPDATE SET value = usage_counters.value + EXCLUDED.value
    WHERE usage_counters.value + EXCLUDED.value <= ${limit}
    RETURNING value`;
  return rows.length === 1;
}

export async function refundUsage(sql: Sql, tenantId: string, metric: Metric, amount: number): Promise<void> {
  await sql`
    UPDATE usage_counters SET value = greatest(0, value - ${amount})
    WHERE tenant_id = ${tenantId} AND metric = ${metric} AND period_start = ${periodStart(metric)}`;
}

export async function addUsage(sql: Sql, tenantId: string, metric: Metric, amount: number): Promise<void> {
  if (amount <= 0) return;
  await sql`
    INSERT INTO usage_counters (tenant_id, metric, period_start, value) VALUES (${tenantId}, ${metric}, ${periodStart(metric)}, ${amount})
    ON CONFLICT (tenant_id, metric, period_start) DO UPDATE SET value = usage_counters.value + EXCLUDED.value`;
}
