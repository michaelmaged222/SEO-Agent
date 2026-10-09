// Background worker: runs audit jobs and the daily scheduler. Runs as its own process
// (PM2/systemd), so nothing depends on anyone having a browser open.
import { hostname } from 'node:os';
import { getSql, closeSql, type Sql } from './db.ts';
import { config } from './config.ts';
import { claimJob, completeJob, failJob, recoverStaleJobs, type Job } from './jobs.ts';
import { executeAuditRun, createAuditRun, finishFailed, type ExecuteDeps } from './audit.ts';
import { HttpError } from './lib/http.ts';
import { defaultPolicy } from './crawler/policy.ts';
import { logActivity } from './activity.ts';

export async function runOneJob(sql: Sql, workerId: string, deps: ExecuteDeps): Promise<boolean> {
  const job = await claimJob(sql, workerId);
  if (!job) return false;
  try {
    await handle(sql, job, deps);
    await completeJob(sql, job.id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const retry = await failJob(sql, job, msg);
    if (job.type === 'audit.run') {
      const runId = String(job.payload.runId ?? '');
      if (retry) await sql`UPDATE audit_runs SET status = 'queued', error = ${`Attempt ${job.attempts} failed, retrying: ${msg}`.slice(0, 1000)} WHERE id = ${runId} AND tenant_id = ${job.tenant_id}`;
      else await finishFailed(sql, runId, `Failed after ${job.attempts} attempts: ${msg}`);
    }
    console.error(`[worker] job ${job.id} (${job.type}) failed: ${msg}${retry ? ' - will retry' : ''}`);
  }
  return true;
}

async function handle(sql: Sql, job: Job, deps: ExecuteDeps): Promise<void> {
  switch (job.type) {
    case 'audit.run':
      return executeAuditRun(sql, job, deps);
    default:
      throw new Error(`Unknown job type: ${job.type}`);
  }
}

/** Enqueue at most one scheduled audit per verified, opted-in site per UTC day. */
export async function schedulerTick(sql: Sql, now = new Date()): Promise<number> {
  const day = now.toISOString().slice(0, 10);
  const due = await sql<{ id: string; tenant_id: string }[]>`
    SELECT s.id, s.tenant_id FROM sites s
    JOIN tenant_subscriptions ts ON ts.tenant_id = s.tenant_id AND ts.status IN ('free', 'trialing', 'active')
    JOIN subscription_plans p ON p.id = ts.plan_id AND (p.entitlements->>'scheduled_audits')::boolean
    WHERE s.schedule_enabled AND s.verified_at IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM jobs j WHERE j.idempotency_key = ${'sched:'} || s.id || ':' || ${day})`;
  let created = 0;
  for (const s of due) {
    try {
      await createAuditRun(sql, { tenantId: s.tenant_id, siteId: s.id, kind: 'full', trigger: 'scheduled', userId: null, idempotencyKey: `sched:${s.id}:${day}` });
      created++;
    } catch (e) {
      if (e instanceof HttpError && e.code === 'audit_in_progress') continue; // overlap guard: try again next tick
      if (e instanceof HttpError) {
        await logActivity(sql, { tenantId: s.tenant_id, actorKind: 'system', action: 'schedule.skipped', target: `site:${s.id}`, detail: { reason: e.code } });
        continue;
      }
      throw e;
    }
  }
  return created;
}

async function main(): Promise<void> {
  const sql = getSql();
  const workerId = `${hostname()}:${process.pid}`;
  const deps: ExecuteDeps = { policy: defaultPolicy(), delayMs: 300 };
  let stopping = false;
  const stop = () => { stopping = true; };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  console.log(`[worker] started ${workerId}${config.crawlDevProxy ? ' (DEV crawl proxy - not for production)' : ''}`);
  let lastHousekeeping = 0;
  while (!stopping) {
    try {
      if (Date.now() - lastHousekeeping > 60_000) {
        lastHousekeeping = Date.now();
        const recovered = await recoverStaleJobs(sql);
        if (recovered) console.warn(`[worker] recovered ${recovered} stale job(s)`);
        if (config.schedulerEnabled) {
          const n = await schedulerTick(sql);
          if (n) console.log(`[worker] scheduled ${n} audit(s)`);
        }
      }
      const did = await runOneJob(sql, workerId, deps);
      if (!did) await new Promise((r) => setTimeout(r, config.workerPollMs));
    } catch (e) {
      console.error('[worker] loop error', e);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  await closeSql();
  console.log('[worker] stopped');
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
