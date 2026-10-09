import type { Sql } from './db.ts';
import { randomToken, sha256 } from './lib/crypto.ts';
import { HttpError, type Req } from './lib/http.ts';
import { config } from './config.ts';

export const SESSION_COOKIE = 'seo_session';

export interface Session {
  tokenHash: string;
  userId: string;
  email: string;
  name: string;
  activeTenantId: string | null;
}

export async function createSession(sql: Sql, userId: string, activeTenantId: string | null): Promise<string> {
  const token = randomToken();
  await sql`
    INSERT INTO sessions (token_hash, user_id, active_tenant_id, expires_at)
    VALUES (${sha256(token)}, ${userId}, ${activeTenantId}, now() + make_interval(days => ${config.sessionTtlDays}))`;
  return token;
}

export async function getSession(sql: Sql, req: Req): Promise<Session | null> {
  const token = req.cookies[SESSION_COOKIE];
  if (!token || token.length > 100) return null;
  const [row] = await sql<{ token_hash: string; user_id: string; email: string; name: string; active_tenant_id: string | null }[]>`
    SELECT s.token_hash, s.user_id, u.email, u.name, s.active_tenant_id
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${sha256(token)} AND s.expires_at > now()`;
  if (!row) return null;
  return { tokenHash: row.token_hash, userId: row.user_id, email: row.email, name: row.name, activeTenantId: row.active_tenant_id };
}

export async function requireSession(sql: Sql, req: Req): Promise<Session> {
  const s = await getSession(sql, req);
  if (!s) throw new HttpError(401, 'unauthenticated', 'Please sign in.');
  return s;
}

export async function destroySession(sql: Sql, tokenHash: string): Promise<void> {
  await sql`DELETE FROM sessions WHERE token_hash = ${tokenHash}`;
}
