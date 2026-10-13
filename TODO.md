# TRACE delivery outcomes

## Phase 1 — complete

- Preserve the generated Expo Router / React Native / TypeScript mobile foundation, safe-area providers, query/runtime wiring and native build configuration.
- Deliver the OLED-black/graphite TRACE visual system, accessible touch targets and five destinations: Home, Timeline, Capture, Collections and Settings.
- Deliver the fresh-launch welcome/support prompt with local `Don't show again` preference and the supplied support/social/payment text.
- Keep profile, UPI QR and Wise QR visibly marked as placeholders and make `pnpm validate:assets` fail while any required asset remains unverified.

## Phase 2 — implemented

- **Versioned local data model:** Use `expo-sqlite` for the actual native Expo runtime; create versioned migrations for memories, tags, collections and relationships, with foreign keys and indexes; create FTS5 when supported; use a documented AsyncStorage local fallback for web preview; do not claim Room.
- **Reliable memory CRUD:** Create, edit, save, pin, archive, soft-delete and restore memories with persistent local state; retain identity and creation time on edits; keep native memory/tag/FTS updates transaction-safe.
- **Timeline browsing:** Display persisted memories chronologically, prioritize pinned items, provide local title/body/tag search, pinned filtering, Trash mode and page-based load-more behavior.
- **Collections/projects:** Create collections locally, select a collection during capture, filter the Collections destination by selected project and display its saved memories.
- **Search and recovery safeguards:** Use native FTS5 where available, parameterized fallback search otherwise, normalize/deduplicate tags, prevent duplicate collection/relationship inserts, prevent self-relationships and provide undo from Trash.
- **Phase 2 tests:** Verify migration versioning, serialized persistence round trips, editing/upsert behavior, search over title/body/tags, pagination filtering, duplicate prevention, soft-delete and restore semantics; keep the existing starter tests passing.

## Phase 2 — remaining before release

- Verify native SQLite migrations, FTS5 indexing and persistence across app restarts on Expo Go/physical devices.
- Add a full relationship editor and later attachment/reminder/backup/security flows without fake persistence.
- Verify and bundle the exact developer photo, UPI QR and Wise QR locally; keep the release gate failing until verified.
- Complete accessibility, low-end-device, privacy/legal, debug/release-build and native permission QA.
- Update README and GitHub handoff after the Phase 2 commit; do not call TRACE production-ready.

## Boundaries

No AI, mandatory login, cloud backend, ads or analytics. Preserve the five existing destinations and all Phase 1 work. Do not overwrite unrelated Git history or force-push.
