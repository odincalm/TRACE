

# Phase 2 amendment — local memory engine

## Scope

Phase 2 keeps the Phase 1 design and five-destination navigation while replacing empty-state shells with a local memory engine. Native Expo runtimes use `expo-sqlite`; the browser preview uses a versioned AsyncStorage local state fallback because Room is Android-specific and native SQLite is not guaranteed in a browser. No AI, mandatory login, cloud backend, ads or analytics are introduced.

## Data architecture

- `lib/memory-model.ts` defines memories, tags, collections, relationships, filters and pagination.
- `lib/sqlite-migrations.ts` owns `PRAGMA user_version` migrations. Version 1 creates the relational tables and indexes; version 2 adds kind/pinned indexes. Native initialization creates the `memories_fts` FTS5 table when supported.
- `lib/memory-repository.ts` is the runtime boundary. Native writes use SQLite transactions for memory fields, tags and FTS rows. Web writes use serialized AsyncStorage state with deterministic state helpers.
- `lib/memory-state.ts` contains tested fallback transitions for upsert/edit, serialization, search, duplicate collection/relationship prevention, soft delete and restore.
- `hooks/use-memory-store.tsx` keeps screen code independent of the selected storage runtime.

## Product behavior

Capture writes actual local records. Memory editing preserves record identity and creation time. Timeline reads saved data chronologically with pinned filtering, local search, Trash and page-based loading. Collections can be created and selected during capture. Deleted memories are soft-deleted and undoable; no unimplemented cloud recovery or encryption is claimed.

## Validation boundary

TypeScript, Expo lint, existing tests and Phase 2 state-engine tests must pass. `pnpm db:push` remains a starter-server schema check and is not the local memory database. Native SQLite/FTS5, Expo Go persistence across process restarts, accessibility and release builds require device validation. Real profile and payment QR assets remain release blockers.
