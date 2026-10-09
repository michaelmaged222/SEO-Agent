// Migration runner: applies db/migrations/NNN_name.up.sql in order, records them,
// and can roll back the latest one with its .down.sql file.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSql, closeSql, type Sql } from './db.ts';

const dir = fileURLToPath(new URL('../db/migrations/', import.meta.url));

function listMigrations(): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.up.sql'))
    .map((f) => f.replace(/\.up\.sql$/, ''))
    .sort();
}

async function ensureTable(sql: Sql): Promise<void> {
  await sql`CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
}

export async function migrateUp(sql: Sql = getSql()): Promise<string[]> {
  await ensureTable(sql);
  const applied = new Set((await sql<{ name: string }[]>`SELECT name FROM schema_migrations`).map((r) => r.name));
  const done: string[] = [];
  for (const name of listMigrations()) {
    if (applied.has(name)) continue;
    const text = readFileSync(join(dir, `${name}.up.sql`), 'utf8');
    await sql.begin(async (tx) => {
      await tx.unsafe(text);
      await tx`INSERT INTO schema_migrations (name) VALUES (${name})`;
    });
    done.push(name);
  }
  return done;
}

export async function migrateDown(sql: Sql = getSql()): Promise<string | null> {
  await ensureTable(sql);
  const [last] = await sql<{ name: string }[]>`SELECT name FROM schema_migrations ORDER BY name DESC LIMIT 1`;
  if (!last) return null;
  const text = readFileSync(join(dir, `${last.name}.down.sql`), 'utf8');
  await sql.begin(async (tx) => {
    await tx.unsafe(text);
    await tx`DELETE FROM schema_migrations WHERE name = ${last.name}`;
  });
  return last.name;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const cmd = process.argv[2] ?? 'up';
  try {
    if (cmd === 'up') {
      const done = await migrateUp();
      console.log(done.length ? `Applied: ${done.join(', ')}` : 'Nothing to apply.');
    } else if (cmd === 'down') {
      const name = await migrateDown();
      console.log(name ? `Rolled back: ${name}` : 'Nothing to roll back.');
    } else {
      console.error('Usage: node src/migrate.ts up|down');
      process.exitCode = 1;
    }
  } finally {
    await closeSql();
  }
}
