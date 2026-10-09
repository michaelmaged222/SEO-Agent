import type { Sql } from './db.ts';

/** Append-only audit trail of who did what. Never put secrets or tokens in `detail`. */
export async function logActivity(
  sql: Sql,
  e: { tenantId: string | null; actorUserId?: string | null; actorKind?: 'user' | 'system' | 'agent'; action: string; target?: string; detail?: Record<string, unknown> },
): Promise<void> {
  await sql`
    INSERT INTO activity_log (tenant_id, actor_user_id, actor_kind, action, target, detail)
    VALUES (${e.tenantId}, ${e.actorUserId ?? null}, ${e.actorKind ?? 'user'}, ${e.action}, ${e.target ?? null}, ${sql.json((e.detail ?? {}) as never)})`;
}
