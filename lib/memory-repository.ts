import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { SQLiteDatabase } from "expo-sqlite";

import { createId, normalizeSearchQuery, normalizeTags, PAGE_SIZE, type Attachment, type Collection, type Memory, type MemoryDraft, type MemoryFilter, type Relationship } from "@/lib/memory-model";
import { addLocalAttachment, addLocalCollection, addLocalRelationship, filterLocalMemories, parseLocalMemoryState, restoreLocalMemory, serializeLocalMemoryState, softDeleteLocalMemory, upsertLocalMemory, type LocalMemoryState } from "@/lib/memory-state";
import { migrateDatabase } from "@/lib/sqlite-migrations";
import { openNativeDatabase } from "@/lib/sqlite-native";
import { normalizePriority, parseRecurrence } from "@/lib/phase3";
import { isAttachmentReferenceUsable } from "@/lib/attachment-safety";
import type { BackupData, RestoreMode } from "@/lib/backup";
import { calculateStorageStats, findOrphanedAttachmentIds } from "@/lib/storage";

const WEB_KEY = "trace.memoryDatabase.v3";
let databasePromise: Promise<SQLiteDatabase> | null = null;
let fts5Available = false;

async function getDatabase(): Promise<SQLiteDatabase> { databasePromise ??= openNativeDatabase(); const db = await databasePromise; if (!fts5Available) fts5Available = (await migrateDatabase(db)).fts5; return db; }
async function readWebState(): Promise<LocalMemoryState> { return parseLocalMemoryState(await AsyncStorage.getItem(WEB_KEY)); }
async function writeWebState(state: LocalMemoryState): Promise<void> { await AsyncStorage.setItem(WEB_KEY, serializeLocalMemoryState(state)); }

function mapMemory(row: Record<string, unknown>, tags: string[] = [], attachments: Attachment[] = []): Memory {
  let recurrenceRule = null;
  try { recurrenceRule = parseRecurrence(row.recurrence_rule ? JSON.parse(String(row.recurrence_rule)) : null); } catch { recurrenceRule = null; }
  return { id: String(row.id), title: String(row.title), body: String(row.body ?? ""), kind: row.kind as Memory["kind"], createdAt: Number(row.created_at), updatedAt: Number(row.updated_at), pinned: Number(row.pinned) === 1, archived: Number(row.archived) === 1, deletedAt: row.deleted_at == null ? null : Number(row.deleted_at), collectionId: row.collection_id ? String(row.collection_id) : null, tags, dueAt: row.due_at == null ? null : Number(row.due_at), eventAt: row.event_at == null ? null : Number(row.event_at), priority: normalizePriority(row.priority), completed: Number(row.completed) === 1, completedAt: row.completed_at == null ? null : Number(row.completed_at), recurrenceRule, reminderId: row.reminder_id ? String(row.reminder_id) : null, attachments };
}

export class MemoryRepository {
  async initialize(): Promise<void> { if (Platform.OS !== "web") await getDatabase(); else await readWebState(); }
  private async tagsForMemory(memoryId: string): Promise<string[]> { const db = await getDatabase(); return (await db.getAllAsync<{ name: string }>("SELECT t.name FROM tags t JOIN memory_tags mt ON mt.tag_id = t.id WHERE mt.memory_id = ? ORDER BY t.name", memoryId)).map((row) => row.name); }
  private async attachmentsForMemory(memoryId: string): Promise<Attachment[]> { const db = await getDatabase(); return (await db.getAllAsync<Record<string, unknown>>("SELECT * FROM attachments WHERE memory_id = ? ORDER BY created_at", memoryId)).map((row) => ({ id: String(row.id), memoryId: String(row.memory_id), name: String(row.name), mimeType: String(row.mime_type), uri: String(row.uri), size: row.size == null ? null : Number(row.size), createdAt: Number(row.created_at) })); }

  async listMemories(filter: MemoryFilter = {}): Promise<Memory[]> {
    const limit = filter.limit ?? PAGE_SIZE; const offset = filter.offset ?? 0;
    if (Platform.OS === "web") return filterLocalMemories(await readWebState(), { ...filter, offset, limit });
    const db = await getDatabase(); const where: string[] = []; const params: (string | number | null)[] = [];
    if (!filter.includeTrash) where.push("m.deleted_at IS NULL"); if (!filter.includeArchived) where.push("m.archived = 0"); if (filter.collectionId !== undefined) { where.push("m.collection_id IS ?"); params.push(filter.collectionId ?? null); } if (filter.kind) { where.push("m.kind = ?"); params.push(filter.kind); } if (filter.pinnedOnly) where.push("m.pinned = 1");
    let sql = "SELECT m.* FROM memories m";
    if (filter.query && fts5Available) { const tokens = normalizeSearchQuery(filter.query).split(" ").filter(Boolean).map((part) => `\"${part.replaceAll('"', '""')}\"*`).join(" AND "); sql = "SELECT m.* FROM memories m JOIN memories_fts f ON f.memory_id = m.id WHERE f.memories_fts MATCH ?"; params.unshift(tokens); }
    else if (filter.query) { const q = `%${normalizeSearchQuery(filter.query).toLowerCase()}%`; where.push("(LOWER(m.title) LIKE ? OR LOWER(m.body) LIKE ?)"); params.push(q, q); }
    if (where.length) sql += ` ${sql.includes("WHERE") ? "AND" : "WHERE"} ${where.join(" AND ")}`; sql += " ORDER BY m.pinned DESC, m.updated_at DESC LIMIT ? OFFSET ?"; params.push(limit, offset);
    const rows = await db.getAllAsync<Record<string, unknown>>(sql, params);
    return Promise.all(rows.map(async (row) => mapMemory(row, await this.tagsForMemory(String(row.id)))));
  }

  async getMemory(id: string): Promise<Memory | null> { if (Platform.OS === "web") return (await readWebState()).memories.find((memory) => memory.id === id) ?? null; const db = await getDatabase(); const row = await db.getFirstAsync<Record<string, unknown>>("SELECT * FROM memories WHERE id = ? LIMIT 1", id); return row ? mapMemory(row, await this.tagsForMemory(id), await this.attachmentsForMemory(id)) : null; }

  async saveMemory(draft: MemoryDraft): Promise<Memory> {
    const now = Date.now(); const id = draft.id ?? createId("memory"); const tags = normalizeTags(draft.tags); const existing = draft.id ? await this.getMemory(draft.id) : null;
    const memory: Memory = { id, title: draft.title.trim(), body: draft.body, kind: draft.kind ?? "note", createdAt: existing?.createdAt ?? now, updatedAt: now, pinned: draft.pinned ?? existing?.pinned ?? false, archived: draft.archived ?? existing?.archived ?? false, deletedAt: null, collectionId: draft.collectionId ?? existing?.collectionId ?? null, tags, dueAt: draft.dueAt ?? existing?.dueAt ?? null, eventAt: draft.eventAt ?? existing?.eventAt ?? null, priority: draft.priority ?? existing?.priority ?? "normal", completed: draft.completed ?? existing?.completed ?? false, completedAt: draft.completedAt ?? existing?.completedAt ?? null, recurrenceRule: draft.recurrenceRule ?? existing?.recurrenceRule ?? null, reminderId: draft.reminderId ?? existing?.reminderId ?? null, attachments: existing?.attachments ?? [] };
    if (!memory.title) throw new Error("A memory title is required.");
    if (Platform.OS === "web") { await writeWebState(upsertLocalMemory(await readWebState(), memory)); return memory; }
    const db = await getDatabase(); await db.withTransactionAsync(async () => { await db.runAsync("INSERT INTO memories (id, title, body, kind, created_at, updated_at, pinned, archived, deleted_at, collection_id, due_at, event_at, priority, completed, completed_at, recurrence_rule, reminder_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, body=excluded.body, kind=excluded.kind, updated_at=excluded.updated_at, pinned=excluded.pinned, archived=excluded.archived, deleted_at=NULL, collection_id=excluded.collection_id, due_at=excluded.due_at, event_at=excluded.event_at, priority=excluded.priority, completed=excluded.completed, completed_at=excluded.completed_at, recurrence_rule=excluded.recurrence_rule, reminder_id=excluded.reminder_id", id, memory.title, memory.body, memory.kind, memory.createdAt, now, memory.pinned ? 1 : 0, memory.archived ? 1 : 0, memory.collectionId, memory.dueAt, memory.eventAt, memory.priority, memory.completed ? 1 : 0, memory.completedAt, memory.recurrenceRule ? JSON.stringify(memory.recurrenceRule) : null, memory.reminderId); await db.runAsync("DELETE FROM memory_tags WHERE memory_id = ?", id); for (const tag of tags) { const tagId = createId("tag"); await db.runAsync("INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)", tagId, tag); const savedTag = await db.getFirstAsync<{ id: string }>("SELECT id FROM tags WHERE name = ?", tag); await db.runAsync("INSERT OR IGNORE INTO memory_tags (memory_id, tag_id) VALUES (?, ?)", id, savedTag?.id ?? tagId); } if (fts5Available) { await db.runAsync("DELETE FROM memories_fts WHERE memory_id = ?", id); await db.runAsync("INSERT INTO memories_fts (memory_id, title, body) VALUES (?, ?, ?)", id, memory.title, memory.body); } }); return memory;
  }

  async saveAttachment(attachment: Omit<Attachment, "id" | "createdAt">): Promise<Attachment> { if (!isAttachmentReferenceUsable(attachment.uri)) throw new Error("This attachment has no safe local URI and was not saved."); const saved = { ...attachment, id: createId("attachment"), createdAt: Date.now() }; if (Platform.OS === "web") { await writeWebState(addLocalAttachment(await readWebState(), saved)); return saved; } const db = await getDatabase(); await db.runAsync("INSERT INTO attachments (id, memory_id, name, mime_type, uri, size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", saved.id, saved.memoryId, saved.name, saved.mimeType, saved.uri, saved.size, saved.createdAt); return saved; }
  async deleteMemory(id: string): Promise<void> { if (Platform.OS === "web") { await writeWebState(softDeleteLocalMemory(await readWebState(), id, Date.now())); return; } const db = await getDatabase(); const now = Date.now(); await db.runAsync("UPDATE memories SET deleted_at = ?, updated_at = ? WHERE id = ?", now, now, id); }
  async undoDelete(id: string): Promise<void> { if (Platform.OS === "web") { await writeWebState(restoreLocalMemory(await readWebState(), id, Date.now())); return; } await (await getDatabase()).runAsync("UPDATE memories SET deleted_at = NULL, updated_at = ? WHERE id = ?", Date.now(), id); }
  async updateFlags(id: string, flags: { pinned?: boolean; archived?: boolean; completed?: boolean; completedAt?: number | null }): Promise<void> { const now = Date.now(); if (Platform.OS === "web") { const state = await readWebState(); await writeWebState({ ...state, memories: state.memories.map((memory) => memory.id === id ? { ...memory, ...flags, updatedAt: now } : memory) }); return; } const sets = ["updated_at = ?"]; const params: (number | string)[] = [now]; for (const [key, value] of Object.entries(flags)) { const column = key === "completedAt" ? "completed_at" : key; sets.push(`${column} = ?`); params.push(typeof value === "boolean" ? (value ? 1 : 0) : value as number ?? null); } params.push(id); await (await getDatabase()).runAsync(`UPDATE memories SET ${sets.join(", ")} WHERE id = ?`, params); }
  async listTrash(): Promise<Memory[]> { return this.listMemories({ includeTrash: true, includeArchived: true, limit: 100 }); }
  async listCollections(): Promise<Collection[]> { if (Platform.OS === "web") return (await readWebState()).collections.sort((a, b) => b.updatedAt - a.updatedAt); const rows = await (await getDatabase()).getAllAsync<Record<string, unknown>>("SELECT * FROM collections ORDER BY updated_at DESC"); return rows.map((row) => ({ id: String(row.id), name: String(row.name), description: String(row.description ?? ""), createdAt: Number(row.created_at), updatedAt: Number(row.updated_at) })); }
  async saveCollection(name: string, description = ""): Promise<Collection> { const cleanName = name.trim(); if (!cleanName) throw new Error("A collection name is required."); const now = Date.now(); const collection = { id: createId("collection"), name: cleanName, description: description.trim(), createdAt: now, updatedAt: now }; if (Platform.OS === "web") { await writeWebState(addLocalCollection(await readWebState(), collection)); return collection; } await (await getDatabase()).runAsync("INSERT INTO collections (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", collection.id, collection.name, collection.description, now, now); return collection; }
  async addRelationship(relationship: Relationship): Promise<void> { if (relationship.sourceId === relationship.targetId) throw new Error("A memory cannot link to itself."); if (Platform.OS === "web") { await writeWebState(addLocalRelationship(await readWebState(), relationship)); return; } await (await getDatabase()).runAsync("INSERT OR IGNORE INTO relationships (source_id, target_id, type) VALUES (?, ?, ?)", relationship.sourceId, relationship.targetId, relationship.type); }

  async exportData(): Promise<BackupData> {
    if (Platform.OS === "web") { const state = await readWebState(); return { memories: state.memories, collections: state.collections, relationships: state.relationships, attachments: state.attachments }; }
    const db = await getDatabase(); const rows = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM memories ORDER BY updated_at DESC");
    const memories = await Promise.all(rows.map(async (row) => mapMemory(row, await this.tagsForMemory(String(row.id)), await this.attachmentsForMemory(String(row.id)))));
    const collections = (await db.getAllAsync<Record<string, unknown>>("SELECT * FROM collections")).map((row) => ({ id: String(row.id), name: String(row.name), description: String(row.description ?? ""), createdAt: Number(row.created_at), updatedAt: Number(row.updated_at) }));
    const relationships = (await db.getAllAsync<Record<string, unknown>>("SELECT source_id, target_id, type FROM relationships")).map((row) => ({ sourceId: String(row.source_id), targetId: String(row.target_id), type: String(row.type) }));
    const attachments = (await db.getAllAsync<Record<string, unknown>>("SELECT * FROM attachments")).map((row) => ({ id: String(row.id), memoryId: String(row.memory_id), name: String(row.name), mimeType: String(row.mime_type), uri: String(row.uri), size: row.size == null ? null : Number(row.size), createdAt: Number(row.created_at) }));
    return { memories, collections, relationships, attachments };
  }

  async restoreData(data: BackupData, mode: RestoreMode): Promise<{ memories: number; collections: number; attachments: number; relationships: number; remindersCleared: number }> {
    if (Platform.OS === "web") {
      const current = await readWebState(); const next = mode === "replace" ? { ...current, ...data, version: current.version } : { ...current, memories: [...data.memories, ...current.memories.filter((item) => !data.memories.some((incoming) => incoming.id === item.id))], collections: [...data.collections, ...current.collections.filter((item) => !data.collections.some((incoming) => incoming.id === item.id))], relationships: [...data.relationships, ...current.relationships.filter((item) => !data.relationships.some((incoming) => incoming.sourceId === item.sourceId && incoming.targetId === item.targetId && incoming.type === item.type))], attachments: [...data.attachments, ...current.attachments.filter((item) => !data.attachments.some((incoming) => incoming.id === item.id))] };
      await writeWebState(next); return { memories: data.memories.length, collections: data.collections.length, attachments: data.attachments.length, relationships: data.relationships.length, remindersCleared: data.memories.filter((item) => item.reminderId).length };
    }
    const db = await getDatabase(); await db.withTransactionAsync(async () => {
      if (mode === "replace") { await db.runAsync("DELETE FROM relationships"); await db.runAsync("DELETE FROM attachments"); await db.runAsync("DELETE FROM memory_tags"); await db.runAsync("DELETE FROM memories"); await db.runAsync("DELETE FROM collections"); await db.runAsync("DELETE FROM tags"); if (fts5Available) await db.runAsync("DELETE FROM memories_fts"); }
      for (const collection of data.collections) await db.runAsync("INSERT OR IGNORE INTO collections (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", collection.id, collection.name, collection.description, collection.createdAt, collection.updatedAt);
      for (const memory of data.memories) { await db.runAsync("INSERT OR IGNORE INTO memories (id, title, body, kind, created_at, updated_at, pinned, archived, deleted_at, collection_id, due_at, event_at, priority, completed, completed_at, recurrence_rule, reminder_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", memory.id, memory.title, memory.body, memory.kind, memory.createdAt, memory.updatedAt, memory.pinned ? 1 : 0, memory.archived ? 1 : 0, memory.deletedAt, memory.collectionId, memory.dueAt, memory.eventAt, memory.priority, memory.completed ? 1 : 0, memory.completedAt, memory.recurrenceRule ? JSON.stringify(memory.recurrenceRule) : null, null); for (const tag of memory.tags) { const tagId = createId("tag"); await db.runAsync("INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)", tagId, tag); const savedTag = await db.getFirstAsync<{ id: string }>("SELECT id FROM tags WHERE name = ?", tag); await db.runAsync("INSERT OR IGNORE INTO memory_tags (memory_id, tag_id) VALUES (?, ?)", memory.id, savedTag?.id ?? tagId); } }
      for (const relationship of data.relationships) await db.runAsync("INSERT OR IGNORE INTO relationships (source_id, target_id, type) VALUES (?, ?, ?)", relationship.sourceId, relationship.targetId, relationship.type);
      for (const attachment of data.attachments) await db.runAsync("INSERT OR IGNORE INTO attachments (id, memory_id, name, mime_type, uri, size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", attachment.id, attachment.memoryId, attachment.name, attachment.mimeType, attachment.uri, attachment.size, attachment.createdAt);
    }); return { memories: data.memories.length, collections: data.collections.length, attachments: data.attachments.length, relationships: data.relationships.length, remindersCleared: data.memories.filter((item) => item.reminderId).length };
  }

  async storageStats(): Promise<{ memories: number; tasks: number; events: number; attachments: number; attachmentBytes: number; databaseBytes: number }> {
    const data = await this.exportData(); return calculateStorageStats(data);
  }

  async cleanupOrphanedAttachments(): Promise<number> {
    if (Platform.OS === "web") { const state = await readWebState(); const orphaned = findOrphanedAttachmentIds(state); const next = state.attachments.filter((item) => !orphaned.includes(item.id)); await writeWebState({ ...state, attachments: next }); return orphaned.length; }
    const db = await getDatabase(); const rows = await db.getAllAsync<{ id: string }>("SELECT a.id FROM attachments a LEFT JOIN memories m ON m.id = a.memory_id WHERE m.id IS NULL"); for (const row of rows) await db.runAsync("DELETE FROM attachments WHERE id = ?", row.id); return rows.length;
  }
}

export const memoryRepository = new MemoryRepository();
