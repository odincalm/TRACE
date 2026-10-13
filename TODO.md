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

## Phase 3 — implemented

- **Structured tasks and events:** task memories support due date, priority, completion/reopen, completion timestamps and recurrence; event memories support dates and collection links.
- **Local reminders:** permissions, future-date scheduling, cancellation, denied-permission messaging and web limitations are handled locally through Expo Notifications.
- **Voice and attachments:** Capture records real voice notes with Expo Audio and supports native photo/video/document pickers; the editor plays voice attachments. Only local metadata is stored and unsafe/missing URIs are rejected.
- **Safe migration and persistence:** native schema version 3 and web fallback defaults preserve existing Phase 2 data and search behavior.
- **Tests:** 33 passed, 1 pre-existing auth test skipped; coverage includes task lifecycle, recurrence, reminder due logic and attachment URI safety.

## Phase 3 remaining before release

- Supply and verify the real developer photo, UPI QR and Wise QR; `pnpm validate:assets` intentionally fails until then.
- Run `db:push` only in an authorized environment; it was not run in this session because the permission reviewer denied the network-connected database write.
- Validate native SQLite, FTS5, notifications/Android limitations, microphone capture, picker URIs, playback, accessibility, release builds and low-end behavior on Expo Go/physical devices.

## Phase 4 — implemented

- Versioned local JSON backup with SHA-256 integrity, manifest counts, schema/app versions, 25 MB safety limit, corrupted/unsupported backup rejection, reference validation, explicit merge/replace restore, native transaction boundary, and actual export verification.
- Attachment files are explicitly reported as excluded because the current attachment implementation stores local references and metadata only; no user data is uploaded.
- Optional root-level biometric app lock using Expo Local Authentication plus SecureStore. No insecure PIN fallback; no claim of database encryption.
- Storage manager with measured counts/bytes and confirmation-gated cleanup of only unreferenced attachment metadata.
- Privacy-safe error paths and documentation updated to avoid claims about encryption, secure deletion, cloud backup, or OS-level protection.
- Phase 4 tests cover malformed/unsupported backups, duplicate IDs, dangling references, storage calculations, orphan detection, attachment-file omission, and conservative biometric lock policy.

## Phase 4 remaining before release

- Test backup export/share, document-picker import, merge/replace rollback, SQLite transactions, SecureStore, biometric prompts, background relock, and storage cleanup on physical iOS and Android devices.
- Supply/verify the real profile photo, UPI QR and Wise QR assets; keep `validate:assets` blocked until genuine files are supplied.
- Complete accessibility/privacy/legal review and native release builds. Do not claim TRACE is production-ready until these checks pass.

## Phase 5 — implemented

- Updated About TRACE with purpose, current feature scope, offline-first behavior, developer attribution and copyright.
- Added separate Privacy Policy, Terms & Open Source, Help & Feedback, Permissions & Data Transparency, and Changelog pages.
- Connected all trust/support pages from Settings without changing the five primary destinations.
- Preserved the exact support destinations and corrected the required international donation guidance. Donations remain voluntary; no payment status, automatic refund, charitable status or tax-deductibility claim was added.
- Reviewed installed license metadata with `pnpm licenses list`; checked Phase 4 additions and core Expo/React Native packages report MIT metadata. Full upstream notice text inventory remains required before distribution.

## Phase 5 remaining before release

- Complete a full lockfile-based third-party notice bundle using upstream license texts rather than summaries.
- Test long policy/help pages, external mailto/web links, accessibility, screen readers, offline navigation and native builds on physical devices.
- Supply and verify genuine profile, UPI QR and Wise QR assets; keep the release gate failing until then.

## Phase 6 — implemented

- Inspected the newly supplied profile, UPI QR and Wise QR landing pages and resolved their original image URLs. The original artifacts were visually checked for dimensions/content, but local bundling was blocked by the device application-control policy; the asset gate remains honestly blocked.
- Hardened AsyncStorage migration against malformed/missing fields and invalid state sections without resetting valid records.
- Reduced native timeline attachment loading and bounded media selection to 12 items at quality 0.8 for lower memory pressure.
- Added regression tests for migration preservation, malformed fields and deterministic pagination while preserving all Phase 4 tests.
- Added shared button accessibility labels and hid decorative icons from screen readers.

## Phase 6 validation and remaining release work

- TypeScript and tests must be rerun after the final Phase 6 edits; do not claim native-device behavior from unit tests.
- Verify QR payloads with a real decoder and copy the original profile/UPI/Wise files into the local asset paths before changing any asset status to verified.
- Run native iOS/Android accessibility, app-lock, notification, picker, backup rollback, SQLite migration, performance and release-build checks.
- Review all upstream license texts from the exact lockfile and ship a complete notice bundle. Keep TRACE non-production until these checks pass.
