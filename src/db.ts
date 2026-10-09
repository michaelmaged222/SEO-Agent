import postgres from 'postgres';
import { config } from './config.ts';

export type Sql = postgres.Sql<{}>;
export type TxSql = postgres.TransactionSql<{}>;

let instance: Sql | undefined;

export function getSql(url = config.databaseUrl): Sql {
  if (!instance) {
    instance = postgres(url, {
      max: 10,
      idle_timeout: 30,
      onnotice: () => {},
      transform: { undefined: null },
    });
  }
  return instance;
}

export async function closeSql(): Promise<void> {
  if (instance) {
    await instance.end({ timeout: 5 });
    instance = undefined;
  }
}
