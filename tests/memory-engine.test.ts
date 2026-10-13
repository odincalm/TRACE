import { describe, expect, it } from "vitest";

import { LATEST_SCHEMA_VERSION } from "../lib/sqlite-migrations";
import { createId, normalizeSearchQuery, normalizeTags } from "../lib/memory-model";
import { addLocalCollection, addLocalRelationship, createLocalMemoryState, filterLocalMemories, parseLocalMemoryState, restoreLocalMemory, serializeLocalMemoryState, softDeleteLocalMemory, upsertLocalMemory } from "../lib/memory-state";


describe("TRACE Phase 2 memory foundation", () => {
  it("keeps migrations versioned beyond the Phase 1 starter", () => {
    expect(LATEST_SCHEMA_VERSION).toBe(2);
  });

  it("normalizes tags without duplicates or blank values", () => {
    expect(normalizeTags([" Study ", "study", "", "Nursing"])).toEqual(["study", "nursing"]);
  });

  it("normalizes search input for local FTS or fallback matching", () => {
    expect(normalizeSearchQuery("  nursing   notes ")).toBe("nursing notes");
  });

  it("creates unique local ids without a server", () => {
    const first = createId("memory");
    const second = createId("memory");
    expect(first.startsWith("memory_")).toBe(true);
    expect(first).not.toBe(second);
  });

  it("persists edits through serialization and restores deleted memories", () => {
    const created = { id: "memory_1", title: "First title", body: "Searchable nursing note", kind: "note" as const, createdAt: 1, updatedAt: 1, pinned: false, archived: false, deletedAt: null, collectionId: null, tags: ["study"] };
    const edited = { ...created, title: "Edited title", updatedAt: 2 };
    const saved = upsertLocalMemory(createLocalMemoryState(), created);
    const roundTrip = parseLocalMemoryState(serializeLocalMemoryState(upsertLocalMemory(saved, edited)));
    expect(roundTrip.memories).toHaveLength(1);
    expect(roundTrip.memories[0].title).toBe("Edited title");
    const deleted = softDeleteLocalMemory(roundTrip, created.id, 3);
    expect(filterLocalMemories(deleted)).toHaveLength(0);
    expect(filterLocalMemories(deleted, { includeTrash: true, includeArchived: true })).toHaveLength(1);
    expect(restoreLocalMemory(deleted, created.id, 4).memories[0].deletedAt).toBeNull();
  });

  it("searches local title/body/tags and rejects duplicate collections and relationships", () => {
    const memory = { id: "memory_2", title: "Exam plan", body: "Review pharmacology", kind: "note" as const, createdAt: 1, updatedAt: 1, pinned: false, archived: false, deletedAt: null, collectionId: null, tags: ["nursing"] };
    const state = upsertLocalMemory(createLocalMemoryState(), memory);
    expect(filterLocalMemories(state, { query: "pharmacology" })).toHaveLength(1);
    const collection = { id: "collection_1", name: "Study", description: "", createdAt: 1, updatedAt: 1 };
    expect(addLocalCollection(addLocalCollection(state, collection), { ...collection, id: "collection_2" }).collections).toHaveLength(1);
    const relationship = { sourceId: memory.id, targetId: "memory_3", type: "related" };
    expect(addLocalRelationship(addLocalRelationship(state, relationship), relationship).relationships).toHaveLength(1);
  });
});
