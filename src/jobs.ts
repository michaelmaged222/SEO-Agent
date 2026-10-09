// PostgreSQL-backed job queue: no Redis needed on a 1 GB droplet.
// - idempotency_key UNIQUE prevents duplicate enqueues
// - FOR UPDATE SKIP LOCKED lets several workers claim safely
// - failed attempts back off exponentially; stale locks are recovered
import type { Sql } from './db.ts';

export interface Job {
  id: string;
  tenant_id: string;
  site_id: string | null;
  type: string;
  payload: Record<string, unknown>;
  attempts: number;
  max_attempts: number;
}

export async function enqueueJob(
  sql: Sql,
  j: { tenantId: string; siteId?: string | null; type: string; payload: Record<string, unknown>; priority?: number; idempotencyKey?: string; maxAttempts?: number; runAfter?: Date },
): Promise<string | null> {
  const rows = await sql<{ id: string }[]>`
    INSERT INTO jobs (tenant_id, site_id, type, payload, priority, idempotency_key, max_attempts, run_after)
    VALUES (${j.tenantId}, ${j.siteId ?? null}, ${j.type}, ${sql.json(j.payload as never)}, ${j.priority ?? 5},
            ${j.idempotencyKey ?? null}, ${j.maxAttempts ?? 3}, ${j.runAfter ?? new Date()})
    ON CONFLICT (idempotency_key) DO NOTHING
    RETURNING id`;
  return rows[0]?.id ?? null;
}

export async function claimJob(sql: Sql, workerId: string): Promise<Job | null> {
  const [job] = await sql<Job[]>`
    UPDATE jobs SET status = 'running', locked_at = now(), locked_by = ${workerId}, attempts = attempts + 1
    WHERE id = (
      SELECT id FROM jobs
      WHERE status = 'queued' AND run_after <= now()
      ORDER BY priority, created_at
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING id, tenant_id, site_id, type, payload, attempts, max_attempts`;
  return job ?? null;
}

export async function completeJob(sql: Sql, id: string): Promise<void> {
  await sql`UPDATE jobs SET status = 'succeeded', finished_at = now(), locked_at = NULL, last_error = NULL WHERE id = ${id}`;
}

/** Returns true if the job will be retried, false if it is permanently failed. */
export async function failJob(sql: Sql, job: Job, error: string): Promise<boolean> {
  const retry = job.attempts < job.max_attempts;
  const backoffSeconds = Math.min(3600, 30 * 2 ** (job.attempts - 1));
  await sql`
    UPDATE jobs SET
      status = ${retry ? 'queued' : 'failed'},
      run_after = CASE WHEN ${retry} THEN now() + make_interval(secs => ${backoffSeconds}) ELSE run_after END,
      finished_at = CASE WHEN ${retry} THEN NULL ELSE now() END,
      locked_at = NULL, locked_by = NULL,
      last_error = ${error.slice(0, 2000)}
    WHERE id = ${job.id}`;
  return retry;
}

/** Requeue jobs whose worker died mid-run (lock older than `staleMinutes`). */
export async function recoverStaleJobs(sql: Sql, staleMinutes = 20): Promise<number> {
  const rows = await sql`
    UPDATE jobs SET status = 'queued', locked_at = NULL, locked_by = NULL,
      last_error = coalesce(last_error, '') || ' [recovered stale lock]'
    WHERE status = 'running' AND locked_at < now() - make_interval(mins => ${staleMinutes})
    RETURNING id`;
  return rows.length;
}
