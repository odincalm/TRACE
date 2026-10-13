import type { SQLiteDatabase } from "expo-sqlite";

export const LATEST_SCHEMA_VERSION = 3;

const MIGRATIONS: Record<number, string[]> = {
  1: [
    `CREATE TABLE IF NOT EXISTS memories (id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', kind TEXT NOT NULL DEFAULT 'note', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, pinned INTEGER NOT NULL DEFAULT 0, archived INTEGER NOT NULL DEFAULT 0, deleted_at INTEGER, collection_id TEXT)`,
    `CREATE TABLE IF NOT EXISTS collections (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL UNIQUE, description TEXT NOT NULL DEFAULT '', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS tags (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL UNIQUE)`,
    `CREATE TABLE IF NOT EXISTS memory_tags (memory_id TEXT NOT NULL, tag_id TEXT NOT NULL, PRIMARY KEY(memory_id, tag_id), FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE CASCADE, FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS relationships (source_id TEXT NOT NULL, target_id TEXT NOT NULL, type TEXT NOT NULL, PRIMARY KEY(source_id, target_id, type), FOREIGN KEY(source_id) REFERENCES memories(id) ON DELETE CASCADE, FOREIGN KEY(target_id) REFERENCES memories(id) ON DELETE CASCADE)`,
    `CREATE INDEX IF NOT EXISTS memories_updated_idx ON memories(updated_at DESC)`,
    `CREATE INDEX IF NOT EXISTS memories_deleted_idx ON memories(deleted_at)`,
    `CREATE INDEX IF NOT EXISTS memories_collection_idx ON memories(collection_id)`,
    `CREATE INDEX IF NOT EXISTS memory_tags_tag_idx ON memory_tags(tag_id)`,
  ],
  2: [
    `CREATE INDEX IF NOT EXISTS memories_kind_idx ON memories(kind)`,
    `CREATE INDEX IF NOT EXISTS memories_pinned_idx ON memories(pinned, updated_at DESC)`,
  ],
  3: [
    `ALTER TABLE memories ADD COLUMN due_at INTEGER`,
    `ALTER TABLE memories ADD COLUMN event_at INTEGER`,
    `ALTER TABLE memories ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal'`,
    `ALTER TABLE memories ADD COLUMN completed INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE memories ADD COLUMN completed_at INTEGER`,
    `ALTER TABLE memories ADD COLUMN recurrence_rule TEXT`,
    `ALTER TABLE memories ADD COLUMN reminder_id TEXT`,
    `CREATE TABLE IF NOT EXISTS attachments (id TEXT PRIMARY KEY NOT NULL, memory_id TEXT NOT NULL, name TEXT NOT NULL, mime_type TEXT NOT NULL, uri TEXT NOT NULL, size INTEGER, created_at INTEGER NOT NULL, FOREIGN KEY(memory_id) REFERENCES memories(id) ON DELETE CASCADE)`,
    `CREATE INDEX IF NOT EXISTS memories_due_idx ON memories(due_at)`,
    `CREATE INDEX IF NOT EXISTS attachments_memory_idx ON attachments(memory_id)`,
  ],
};

export async function migrateDatabase(db: SQLiteDatabase): Promise<{ version: number; fts5: boolean }> {
  await db.execAsync("PRAGMA foreign_keys = ON;");
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  let version = Number(row?.user_version ?? 0);
  for (let next = version + 1; next <= LATEST_SCHEMA_VERSION; next += 1) {
    await db.withTransactionAsync(async () => {
      for (const statement of MIGRATIONS[next] ?? []) await db.execAsync(statement);
      await db.execAsync(`PRAGMA user_version = ${next}`);
    });
    version = next;
  }
  let fts5 = true;
  try {
    await db.execAsync("CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(memory_id UNINDEXED, title, body)");
  } catch {
    fts5 = false;
  }
  return { version, fts5 };
}
