import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { SQLiteDatabase } from "expo-sqlite";

import { createId, normalizeSearchQuery, normalizeTags, PAGE_SIZE, type Collection, type Memory, type MemoryDraft, type MemoryFilter, type Relationship } from "@/lib/memory-model";
import { addLocalCollection, addLocalRelationship, createLocalMemoryState, filterLocalMemories, parseLocalMemoryState, restoreLocalMemory, serializeLocalMemoryState, softDeleteLocalMemory, upsertLocalMemory, type LocalMemoryState } from "@/lib/memory-state";
import { migrateDatabase } from "@/lib/sqlite-migrations";
import { openNativeDatabase } from "@/lib/sqlite-native";

const WEB_KEY = "trace.memoryDatabase.v2";
let databasePromise: Promise<SQLiteDatabase> | null = null;
let fts5Available = false;

async function getDatabase(): Promise<SQLiteDatabase> {
  databasePromise ??= openNativeDatabase();
  const db = await databasePromise;
  if (!fts5Available) {
    const result = await migrateDatabase(db);
    fts5Available = result.fts5;
  }
  return db;
}

async function readWebState(): Promise<LocalMemoryState> {
  const raw = await AsyncStorage.getItem(WEB_KEY);
  return parseLocalMemoryState(raw);
}

async function writeWebState(state: LocalMemoryState): Promise<void> { await AsyncStorage.setItem(WEB_KEY, serializeLocalMemoryState(state)); }

function matchesMemory(memory: Memory, filter: MemoryFilter): boolean {
  if (!filter.includeTrash && memory.deletedAt !== null) return false;
  if (!filter.includeArchived && memory.archived) return false;
  if (filter.collectionId !== undefined && memory.collectionId !== filter.collectionId) return false;
  if (filter.kind && memory.kind !== filter.kind) return false;
  if (filter.pinnedOnly && !memory.pinned) return false;
  if (filter.query) {
    const haystack = `${memory.title} ${memory.body} ${memory.tags.join(" ")}`.toLowerCase();
    if (!haystack.includes(normalizeSearchQuery(filter.query).toLowerCase())) return false;
  }
  return true;
}

function mapMemory(row: Record<string, unknown>, tags: string[] = []): Memory {
  return { id: String(row.id), title: String(row.title), body: String(row.body ?? ""), kind: row.kind as Memory["kind"], createdAt: Number(row.created_at), updatedAt: Number(row.updated_at), pinned: Number(row.pinned) === 1, archived: Number(row.archived) === 1, deletedAt: row.deleted_at === null || row.deleted_at === undefined ? null : Number(row.deleted_at), collectionId: row.collection_id ? String(row.collection_id) : null, tags };
}

export class MemoryRepository {
  async initialize(): Promise<void> {
    if (Platform.OS === "web") await readWebState();
    else await getDatabase();
  }

  async listMemories(filter: MemoryFilter = {}): Promise<Memory[]> {
    const limit = filter.limit ?? PAGE_SIZE;
    const offset = filter.offset ?? 0;
    if (Platform.OS === "web") {
      const state = await readWebState();
      return filterLocalMemories(state, { ...filter, offset, limit });
    }
    const db = await getDatabase();
    const where: string[] = [];
    const params: (string | number | null)[] = [];
    if (!filter.includeTrash) where.push("m.deleted_at IS NULL");
    if (!filter.includeArchived) where.push("m.archived = 0");
    if (filter.collectionId !== undefined) { where.push("m.collection_id IS ?"); params.push(filter.collectionId ?? null); }
    if (filter.kind) { where.push("m.kind = ?"); params.push(filter.kind); }
    if (filter.pinnedOnly) where.push("m.pinned = 1");
    let querySql = "";
    if (filter.query && fts5Available) {
      const tokens = normalizeSearchQuery(filter.query).split(" ").filter(Boolean).map((part) => `\"${part.replaceAll('"', '""')}\"*`).join(" AND ");
      querySql = "SELECT m.* FROM memories m JOIN memories_fts f ON f.memory_id = m.id WHERE f.memories_fts MATCH ?";
      params.unshift(tokens);
    } else {
      if (filter.query) { where.push("(LOWER(m.title) LIKE ? OR LOWER(m.body) LIKE ?)"); const q = `%${normalizeSearchQuery(filter.query).toLowerCase()}%`; params.push(q, q); }
      querySql = "SELECT m.* FROM memories m";
    }
    if (where.length) querySql += ` ${querySql.includes("WHERE") ? "AND" : "WHERE"} ${where.join(" AND ")}`;
    querySql += " ORDER BY m.pinned DESC, m.updated_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);
    const rows = await db.getAllAsync<Record<string, unknown>>(querySql, params);
    return Promise.all(rows.map(async (row) => mapMemory(row, await this.tagsForMemory(String(row.id)))));
  }

  async getMemory(id: string): Promise<Memory | null> {
    if (Platform.OS === "web") {
      const state = await readWebState();
      return state.memories.find((memory) => memory.id === id) ?? null;
    }
    const db = await getDatabase();
    const row = await db.getFirstAsync<Record<string, unknown>>("SELECT * FROM memories WHERE id = ? LIMIT 1", id);
    return row ? mapMemory(row, await this.tagsForMemory(id)) : null;
  }

  private async tagsForMemory(memoryId: string): Promise<string[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ name: string }>("SELECT t.name FROM tags t JOIN memory_tags mt ON mt.tag_id = t.id WHERE mt.memory_id = ? ORDER BY t.name", memoryId);
    return rows.map((row) => row.name);
  }

  async saveMemory(draft: MemoryDraft): Promise<Memory> {
    const now = Date.now();
    const id = draft.id ?? createId("memory");
    const tags = normalizeTags(draft.tags);
    const memory: Memory = { id, title: draft.title.trim(), body: draft.body, kind: draft.kind ?? "note", createdAt: now, updatedAt: now, pinned: draft.pinned ?? false, archived: draft.archived ?? false, deletedAt: null, collectionId: draft.collectionId ?? null, tags };
    if (!memory.title) throw new Error("A memory title is required.");
    if (Platform.OS === "web") {
      const state = await readWebState();
      const saved = upsertLocalMemory(state, memory).memories.find((item) => item.id === id) ?? memory;
      await writeWebState(upsertLocalMemory(state, memory));
      return saved;
    }
    const db = await getDatabase();
    const existing = await db.getFirstAsync<{ created_at: number }>("SELECT created_at FROM memories WHERE id = ?", id);
    await db.withTransactionAsync(async () => {
      await db.runAsync("INSERT INTO memories (id, title, body, kind, created_at, updated_at, pinned, archived, deleted_at, collection_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, body=excluded.body, kind=excluded.kind, updated_at=excluded.updated_at, pinned=excluded.pinned, archived=excluded.archived, deleted_at=NULL, collection_id=excluded.collection_id", id, memory.title, memory.body, memory.kind, existing?.created_at ?? now, now, memory.pinned ? 1 : 0, memory.archived ? 1 : 0, memory.collectionId);
      await db.runAsync("DELETE FROM memory_tags WHERE memory_id = ?", id);
      for (const tag of tags) { const tagId = createId("tag"); await db.runAsync("INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)", tagId, tag); const savedTag = await db.getFirstAsync<{ id: string }>("SELECT id FROM tags WHERE name = ?", tag); await db.runAsync("INSERT OR IGNORE INTO memory_tags (memory_id, tag_id) VALUES (?, ?)", id, savedTag?.id ?? tagId); }
      if (fts5Available) { await db.runAsync("DELETE FROM memories_fts WHERE memory_id = ?", id); await db.runAsync("INSERT INTO memories_fts (memory_id, title, body) VALUES (?, ?, ?)", id, memory.title, memory.body); }
    });
    return { ...memory, createdAt: existing?.created_at ?? now };
  }

  async deleteMemory(id: string): Promise<void> {
    if (Platform.OS === "web") { const now = Date.now(); await writeWebState(softDeleteLocalMemory(await readWebState(), id, now)); return; }
    const db = await getDatabase(); await db.runAsync("UPDATE memories SET deleted_at = ?, updated_at = ? WHERE id = ?", Date.now(), Date.now(), id);
  }

  async undoDelete(id: string): Promise<void> {
    if (Platform.OS === "web") { await writeWebState(restoreLocalMemory(await readWebState(), id, Date.now())); return; }
    const db = await getDatabase(); await db.runAsync("UPDATE memories SET deleted_at = NULL, updated_at = ? WHERE id = ?", Date.now(), id);
  }

  async updateFlags(id: string, flags: { pinned?: boolean; archived?: boolean }): Promise<void> {
    const now = Date.now();
    if (Platform.OS === "web") { const state = await readWebState(); const next = { ...state, memories: state.memories.map((memory) => memory.id === id ? { ...memory, ...flags, updatedAt: now } : memory) }; await writeWebState(next); return; }
    const db = await getDatabase(); const sets: string[] = ["updated_at = ?"]; const params: (number | string)[] = [now]; if (flags.pinned !== undefined) { sets.push("pinned = ?"); params.push(flags.pinned ? 1 : 0); } if (flags.archived !== undefined) { sets.push("archived = ?"); params.push(flags.archived ? 1 : 0); } params.push(id); await db.runAsync(`UPDATE memories SET ${sets.join(", ")} WHERE id = ?`, params);
  }

  async listTrash(): Promise<Memory[]> { return this.listMemories({ includeTrash: true, includeArchived: true, limit: 100 }); }

  async listCollections(): Promise<Collection[]> {
    if (Platform.OS === "web") return (await readWebState()).collections.sort((a, b) => b.updatedAt - a.updatedAt);
    const db = await getDatabase(); const rows = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM collections ORDER BY updated_at DESC"); return rows.map((row) => ({ id: String(row.id), name: String(row.name), description: String(row.description ?? ""), createdAt: Number(row.created_at), updatedAt: Number(row.updated_at) }));
  }

  async saveCollection(name: string, description = ""): Promise<Collection> {
    const cleanName = name.trim(); if (!cleanName) throw new Error("A collection name is required."); const now = Date.now(); const collection = { id: createId("collection"), name: cleanName, description: description.trim(), createdAt: now, updatedAt: now };
    if (Platform.OS === "web") { await writeWebState(addLocalCollection(await readWebState(), collection)); return collection; }
    const db = await getDatabase(); await db.runAsync("INSERT INTO collections (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", collection.id, collection.name, collection.description, now, now); return collection;
  }

  async addRelationship(relationship: Relationship): Promise<void> {
    if (relationship.sourceId === relationship.targetId) throw new Error("A memory cannot link to itself.");
    if (Platform.OS === "web") { await writeWebState(addLocalRelationship(await readWebState(), relationship)); return; }
    const db = await getDatabase(); await db.runAsync("INSERT OR IGNORE INTO relationships (source_id, target_id, type) VALUES (?, ?, ?)", relationship.sourceId, relationship.targetId, relationship.type);
  }
}

export const memoryRepository = new MemoryRepository();
