import { normalizeSearchQuery, type Collection, type Memory, type MemoryFilter, type Relationship } from "./memory-model";

export type LocalMemoryState = { version: number; memories: Memory[]; collections: Collection[]; relationships: Relationship[] };
export const LOCAL_STATE_VERSION = 2;

export function createLocalMemoryState(): LocalMemoryState { return { version: LOCAL_STATE_VERSION, memories: [], collections: [], relationships: [] }; }

export function parseLocalMemoryState(raw: string | null): LocalMemoryState {
  if (!raw) return createLocalMemoryState();
  try { const parsed = JSON.parse(raw) as Partial<LocalMemoryState>; return { version: LOCAL_STATE_VERSION, memories: parsed.memories ?? [], collections: parsed.collections ?? [], relationships: parsed.relationships ?? [] }; } catch { return createLocalMemoryState(); }
}

export function serializeLocalMemoryState(state: LocalMemoryState): string { return JSON.stringify({ ...state, version: LOCAL_STATE_VERSION }); }

export function upsertLocalMemory(state: LocalMemoryState, memory: Memory): LocalMemoryState {
  const existing = state.memories.find((item) => item.id === memory.id);
  const saved = existing ? { ...existing, ...memory, createdAt: existing.createdAt, updatedAt: Math.max(memory.updatedAt, existing.updatedAt) } : memory;
  return { ...state, memories: existing ? state.memories.map((item) => item.id === memory.id ? saved : item) : [saved, ...state.memories] };
}

export function softDeleteLocalMemory(state: LocalMemoryState, id: string, now: number): LocalMemoryState { return { ...state, memories: state.memories.map((memory) => memory.id === id ? { ...memory, deletedAt: now, updatedAt: now } : memory) }; }
export function restoreLocalMemory(state: LocalMemoryState, id: string, now: number): LocalMemoryState { return { ...state, memories: state.memories.map((memory) => memory.id === id ? { ...memory, deletedAt: null, updatedAt: now } : memory) }; }

export function filterLocalMemories(state: LocalMemoryState, filter: MemoryFilter = {}): Memory[] {
  const query = normalizeSearchQuery(filter.query ?? "").toLowerCase();
  return state.memories.filter((memory) => {
    if (!filter.includeTrash && memory.deletedAt !== null) return false;
    if (!filter.includeArchived && memory.archived) return false;
    if (filter.collectionId !== undefined && memory.collectionId !== filter.collectionId) return false;
    if (filter.kind && memory.kind !== filter.kind) return false;
    if (filter.pinnedOnly && !memory.pinned) return false;
    if (query && !`${memory.title} ${memory.body} ${memory.tags.join(" ")}`.toLowerCase().includes(query)) return false;
    return true;
  }).sort((a, b) => b.updatedAt - a.updatedAt).slice(filter.offset ?? 0, (filter.offset ?? 0) + (filter.limit ?? 20));
}

export function addLocalCollection(state: LocalMemoryState, collection: Collection): LocalMemoryState {
  if (state.collections.some((item) => item.name.trim().toLowerCase() === collection.name.trim().toLowerCase())) return state;
  return { ...state, collections: [collection, ...state.collections] };
}

export function addLocalRelationship(state: LocalMemoryState, relationship: Relationship): LocalMemoryState {
  if (relationship.sourceId === relationship.targetId || state.relationships.some((item) => item.sourceId === relationship.sourceId && item.targetId === relationship.targetId && item.type === relationship.type)) return state;
  return { ...state, relationships: [...state.relationships, relationship] };
}
