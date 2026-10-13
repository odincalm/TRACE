

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

## Phase 3 implementation

- Native SQLite schema version 3 adds task/event/reminder columns and an attachment metadata table; the web AsyncStorage fallback upgrades Phase 2 records with safe defaults.
- Tasks support due dates, low/normal/high/urgent priority, completion/reopen, daily/weekly/monthly recurrence, and next-occurrence helpers. Events support event dates and collection links.
- `lib/reminders.ts` handles local notification permission, scheduling and cancellation. Web is explicitly unsupported; Android delivery/channel behavior remains device-dependent.
- Capture supports Expo Audio recording, photo/video selection and document selection. Only local metadata is persisted, and empty/unsafe URIs are rejected.
- The editor supports task completion, reminder cancellation/scheduling, and voice playback.
- TypeScript passes; Vitest passes with 33 tests and 1 skipped. Direct ESLint has zero errors and nine existing warnings. The asset gate remains intentionally blocked. `db:push` was not run because a network-connected database write was denied by the permission reviewer.

## Phase 4 implementation

- Backup format is `trace-local-backup` version 1 with a manifest, schema/app version, timestamp, counts, explicit `attachmentsIncluded: false`, SHA-256 integrity and all supported local entities. Validation precedes any restore mutation. Native replace restores inside one SQLite transaction; web restore uses the versioned state fallback. Merge deduplicates by stable IDs/relationship keys. Imported reminder IDs are cleared rather than scheduled.
- App lock is biometric-only, SecureStore-backed and enforced by a root gate. The lock relocks on background/foreground transitions. Unsupported devices, web preview, cancellation and failed auth leave data accessible only according to the existing lock state. No PIN cryptography or database-encryption claim is made.
- Storage measures serialized local data and attachment metadata sizes and safely removes only metadata rows whose memory reference no longer exists. It never deletes a referenced attachment or memory and does not request broad storage permission.
- No schema migration was required: Phase 4 preserves native schema version 3 and all prior migration history.
- Phase 4 tests cover backup schema rejection, duplicate/dangling reference safety, storage calculations, orphan cleanup and conservative biometric policy. Native APIs remain device-validation work.

## Phase 5 implementation

- Added dedicated routes for About, Privacy Policy, Terms & Open Source, Help & Feedback, Changelog and Permissions & Data. Settings links these pages without changing the five primary tabs.
- About and support copy now describes the actual Phase 1–4 implementation instead of stale Phase 1 claims.
- Privacy language distinguishes local persistence, user-initiated export/share, attachment metadata versus file bytes, feature-specific permissions, biometric app access versus database encryption, and unverified native behavior.
- Support retains the exact existing developer destinations, exact UPI/Wise values, voluntary-donation language, blocked QR/profile asset fallbacks and required international guidance.
- `pnpm licenses list` was used to inspect installed package metadata. Checked Phase 4 additions and core Expo/React Native packages report MIT metadata; full upstream notice text is still a release requirement.
- Phase 5 does not add a database migration or new runtime dependency.

## Phase 6 implementation

- Audited the asset gate. The three Phase 6 ImgBB landing pages resolve to original files: profile `https://i.ibb.co/rKpRm2FH/nitin.png` (480×640), UPI `https://i.ibb.co/1NDGWdK/qr.jpg` (640×605), and Wise `https://i.ibb.co/0RKKXmSJ/wise.jpg` (551×551). The browser artifact was visually inspected, but the device application-control policy blocked copying the artifacts into the workspace, so all three local assets remain explicitly blocked and unverified.
- Hardened web-state migration to ignore malformed records/sections while preserving valid memories, collections, relationships and attachment metadata and upgrading the state version to 3.
- Reduced native timeline work by not loading attachment metadata for every paginated row; detail reads continue to load attachments on demand. Media selection is capped at 12 items and uses quality 0.8 instead of full-resolution decoding.
- Added migration/malformed-state/pagination regression coverage and retained Phase 4 backup, storage and biometric-policy tests.
- Shared TRACE buttons now expose accessible labels and decorative icons are hidden from screen readers; full native screen-reader and dynamic-text QA remains open.
- No schema migration or new dependency was added. No remote database write, native build or device test was performed.
