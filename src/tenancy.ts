// Tenant context. The ONLY source of tenant identity for a request is the server-side
// session's active_tenant_id, re-checked against tenant_members on every request.
// Client-supplied tenant IDs are accepted solely by the "switch tenant" endpoint, which
// verifies membership before storing them.
import type { Sql } from './db.ts';
import { HttpError, type Req } from './lib/http.ts';
import { requireSession, type Session } from './auth.ts';

export type Role = 'owner' | 'admin' | 'editor' | 'viewer';
const RANK: Record<Role, number> = { viewer: 0, editor: 1, admin: 2, owner: 3 };

export interface TenantCtx {
  session: Session;
  tenantId: string;
  role: Role;
}

export async function requireTenant(sql: Sql, req: Req, minRole: Role = 'viewer'): Promise<TenantCtx> {
  const session = await requireSession(sql, req);
  if (!session.activeTenantId) throw new HttpError(409, 'no_active_tenant', 'Select or create a workspace first.');
  const [m] = await sql<{ role: Role }[]>`
    SELECT role FROM tenant_members WHERE tenant_id = ${session.activeTenantId} AND user_id = ${session.userId}`;
  if (!m) {
    // Membership was removed after the session selected this tenant: drop it.
    await sql`UPDATE sessions SET active_tenant_id = NULL WHERE token_hash = ${session.tokenHash}`;
    throw new HttpError(403, 'not_a_member', 'You no longer have access to this workspace.');
  }
  if (RANK[m.role] < RANK[minRole]) throw new HttpError(403, 'forbidden', `This action needs the ${minRole} role.`);
  return { session, tenantId: session.activeTenantId, role: m.role };
}

export function slugify(name: string): string {
  const base = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return base || 'workspace';
}
