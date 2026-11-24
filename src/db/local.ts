import Dexie, { type Table } from 'dexie';

interface KvRow {
  key: string;
  value: unknown;
}

class PortalDatabase extends Dexie {
  kv!: Table<KvRow, string>;

  constructor() {
    super('softsutra-portal');
    this.version(1).stores({ kv: 'key' });
  }
}

export const portalDb = new PortalDatabase();

export async function kvGet<T>(key: string): Promise<T | undefined> {
  try {
    const row = await portalDb.kv.get(key);
    return row?.value as T | undefined;
  } catch {
    return undefined;
  }
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  try {
    await portalDb.kv.put({ key, value });
  } catch {
    /* private browsing or quota failure: keep UI usable */
  }
}
