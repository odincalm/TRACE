# TRACE

TRACE is a private, offline-first personal memory workspace by Nitin Kumar. The current checkpoint ships the Phase 1 shell and Phase 2 local memory engine. It is **not production-ready** because the real profile/QR assets remain unverified and native device/release QA is still outstanding.

> Built by Nitin Kumar · © 2026 Nitin Kumar

## Phase 2 shipped functionality

### Local data model and migrations

- Native iOS/Android runtime: `expo-sqlite` (`~57.0.4`) with a versioned `PRAGMA user_version` migration path.
- Migration 1 creates `memories`, `collections`, `tags`, `memory_tags` and `relationships` plus foreign keys and indexes.
- Migration 2 adds kind and pinned indexes.
- A native `memories_fts` FTS5 virtual table is created when the selected SQLite runtime supports FTS5. The repository falls back to parameterized title/body matching if FTS5 is unavailable.
- The app does **not** claim that Room is implemented. Room is Android-specific; this Expo project uses `expo-sqlite` on native and a real AsyncStorage-backed local state database for the web preview.

### Memories

- Capture creates and persists Note, Event, Task, Decision, Voice and Attachment records.
- Edit screens update title/body and preserve the existing identity, tags, collection, flags and creation time.
- Memories can be pinned, archived, moved to Trash and restored from Trash.
- Native writes for memory fields, tags and FTS indexing occur in a SQLite transaction.
- Web preview writes serialize a versioned local state document through AsyncStorage; it is not a cloud or fake in-memory-only implementation.

### Timeline, search and pagination

- Timeline reads saved memories chronologically, prioritizing pinned items.
- Search covers title, body and tags locally. Native uses FTS5 where available; the web fallback uses local matching over the same persisted state.
- Pinned-only filtering, Trash mode and a load-more pagination control are available.
- Deleted memories are excluded from the normal timeline and remain recoverable through Trash.

### Collections and relationships

- Collections/projects can be created locally and selected during capture.
- Collection filtering is available from the Collections destination.
- Tags are normalized, deduplicated and stored relationally.
- Relationships have a relational table, self-link prevention and duplicate prevention at the repository boundary; a full relationship editor remains a later enhancement.

## Phase 1 shell and support flow

The app keeps five bottom-navigation destinations: **Home, Timeline, Capture, Collections and Settings**. It retains the premium OLED-black/graphite visual system, sea-glass accent, accessible touch targets, local welcome preference and Support the Developer page.

The welcome prompt contains TRACE branding, the developer credit, nursing-student explanation, support and continue actions, and a persistent local `Don't show again` preference. It is not tied to browser return, rotation or navigation state.

Support destinations remain:

- Support website: <https://portfolio-blush-three-98.vercel.app/>
- Instagram: <https://instagram.com/odincalm0>
- LinkedIn: <https://www.linkedin.com/in/nitin-kumar-35a0a7279>
- Email: <mailto:odincalm@proton.me>
- GitHub: <https://github.com/odincalm>
- UPI ID: `bholanitin308@okicici`
- Wise payment link: <https://wise.com/pay/business/nitinkumar34?utm_source=quick_pay>

External links open through the platform linking API. TRACE does not verify donations, claim payment success, promise automatic refunds or enforce third-party limits.

## Asset safety and release blocker

The required real assets must be verified and bundled locally, not loaded from a network. These remain deliberately unbundled and the UI shows **Asset pending verification** instead of a fake photo or QR code:

- `assets/images/developer-profile.png`
- `assets/images/upi-qr.jpg`
- `assets/images/wise-qr.jpg`

The inspected source pages are:

- Wise QR page: <https://ibb.co/nNBB06vk> → resolved original: `https://i.ibb.co/0RKKXmSJ/wise.jpg`
- UPI QR page: <https://ibb.co/HyWT8xY> → resolved original: `https://i.ibb.co/1NDGWdK/qr.jpg`
- Profile page: <https://ibb.co/KcspXxbW> → resolved original: `https://i.ibb.co/rKpRm2FH/nitin.png`

Run the release gate:

```bash
pnpm validate:assets
```

Expected current result: exit code `1` with all three assets listed as `placeholder`. Do not generate, redraw, substitute or claim verification for these files.

## Local development

Requirements: Node.js, pnpm 9 and the dependencies installed by the managed Mobile starter.

```bash
pnpm install --prefer-offline
pnpm db:push
pnpm dev
```

The managed Mobile runtime uses:

- Metro/Web preview: `http://localhost:8081`
- API server: `http://localhost:3000`

The web preview uses the AsyncStorage repository fallback because native SQLite is not guaranteed in a browser. Expo Go/native builds use `expo-sqlite`. `expo-sqlite` is registered in `app.config.ts` through the `expo-sqlite` plugin.

## Validation commands and current results

```bash
pnpm db:push
pnpm check
pnpm lint
pnpm test
pnpm validate:assets
```

Current results for this checkpoint:

- `pnpm db:push`: passed; starter server schema has no changes.
- `pnpm check`: passed.
- `pnpm lint`: passed; pnpm/module-type warnings remain non-blocking.
- `pnpm test`: passed: 31 tests, 1 pre-existing auth test skipped.
- `pnpm validate:assets`: intentionally fails because the three required real assets are still placeholders.

The tests cover migration versioning, serialization round trips, editing/upsert behavior, local search over title/body/tags, pagination filtering, duplicate collection/relationship prevention, soft-delete and restore semantics. A plain Node smoke import cannot exercise React Native modules, so native SQLite itself still requires device/runtime validation.

For readiness, start `pnpm dev` in a resident terminal and verify:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8081/
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/
```

## Privacy and product boundaries

Phase 2 adds no AI SDK, model, analytics, advertising, mandatory login, cloud sync or payment backend. Private memory content is stored locally by the selected runtime and is not sent to the server. The app does not claim database encryption, app lock, secure deletion or encrypted archives because those features are not implemented. It does not request a broad storage permission and does not need an Internet permission merely to open an external browser link.

## Architecture

- `app/` contains Expo Router screens and navigation.
- `components/trace/` contains reusable visual primitives and memory cards.
- `constants/trace.ts` centralizes brand, developer, payment and asset declarations.
- `lib/memory-model.ts` defines memory, tag, collection and relationship types.
- `lib/sqlite-migrations.ts` owns versioned native SQLite migrations and FTS5 setup.
- `lib/memory-repository.ts` owns native SQLite persistence and the web-local AsyncStorage fallback.
- `lib/memory-state.ts` contains deterministic serialized-state transitions used by the fallback and tests.
- `hooks/use-memory-store.tsx` provides app-level loading, refresh and mutation behavior.
- `lib/preferences.ts` and `hooks/use-welcome-preference.ts` isolate the Phase 1 welcome preference.
- `lib/asset-validation.ts` and `scripts/validate-assets.ts` implement the release blocker.

## Remaining limitations

Not shipped in Phase 2: full relationship editing UI, reminders/notifications, audio/media/document attachment capture, backup/restore, encrypted exports, app lock, secure deletion, storage cleanup, complete legal pages, complete accessibility audit, native release artifacts and verified profile/QR assets.

The repository uses the fixed Expo/React Native Mobile stack and does not rewrite the project as Kotlin/Jetpack Compose. Do not describe TRACE as production-ready until real assets, migrations on physical devices, native FTS5 behavior, release builds, low-end-device testing, accessibility QA and privacy/legal review pass.

## GitHub handoff

The requested code destination is <https://github.com/odincalm/TRACE>. The Phase 1 code was previously pushed to `main`; Phase 2 changes should be pushed as a new normal commit without force-pushing or overwriting unrelated history.

## License / credit

© 2026 Nitin Kumar. The generated starter retains its existing third-party packages and notices. Add a complete third-party notice inventory before a release build.

## Phase 3 implementation

Phase 3 adds structured tasks and events, local reminders, real voice capture/playback, and local photo/video/document attachment metadata without replacing the Expo stack or adding cloud memory sync.

- Tasks support due date, low/normal/high/urgent priority, completion/reopen, timestamps, and daily/weekly/monthly recurrence.
- Events support event dates and existing collection links.
- Local reminders request permission only when used, schedule future notifications, cancel existing reminder IDs, and explain native-only limitations on web. Android delivery/channel behavior still requires device verification.
- Capture records voice notes with Expo Audio and uses SDK 57-compatible Image Picker and Document Picker packages. Only local name/MIME/size/URI metadata is persisted; empty or unsafe URI references are rejected.
- Native SQLite is now schema version 3. The web AsyncStorage state upgrades older Phase 2 records with safe defaults.
- The memory editor supports task completion, reminder scheduling/cancellation, and voice playback.

## Phase 3 validation results

- TypeScript: passed.
- Vitest: passed — 33 tests, 1 skipped (pre-existing auth test).
- Direct ESLint: 0 errors, 9 existing warnings.
- `validate:assets`: intentionally fails because the real developer photo, UPI QR, and Wise QR remain unverified placeholders.
- `db:push`: not run; the permission reviewer denied the network-connected database write in this session.
- Native device validation: not run; Expo Go/physical-device testing remains required for SQLite migrations, notification delivery, microphone capture, picker URI behavior and playback.

## Phase 5 trust and support surfaces

- Refined **About TRACE** with the current purpose, implemented capabilities, offline-first behavior, developer attribution, copyright and internal links.
- Added separate **Privacy Policy**, **Permissions & Data**, **Terms & Open Source**, **Help & Feedback**, and **What's New / Changelog** screens.
- Updated Settings navigation while preserving Home, Timeline, Capture, Collections and Settings.
- The privacy copy matches actual behavior: local SQLite/AsyncStorage, user-initiated backup sharing, attachment metadata/local references without attachment bytes, feature-specific microphone/notification/picker/biometric permissions, no analytics/ads/AI/cloud memory sync, and no claim of database encryption or secure deletion.
- The support page retains the exact website, UPI ID, Wise link, Instagram, LinkedIn, GitHub and email destinations. Donations remain voluntary, payment status is not verified, QR assets remain blocked, and the required international donation guidance is shown verbatim.
- License metadata was checked with `pnpm licenses list` for the Phase 4-added Expo packages and core Expo/React Native packages; the checked package metadata identifies them as MIT, while a complete upstream notice inventory remains a release task.

## Phase 5 validation results

- TypeScript: passed.
- Vitest: passed — 38 tests, 1 skipped (pre-existing auth test).
- Direct ESLint: 0 errors, 9 existing starter warnings.
- `validate:assets`: intentionally fails because the genuine developer photo, UPI QR and Wise QR remain unverified placeholders.
- No device validation, release build, commit or GitHub push was performed.

## Phase 6 hardening results

- Resolved the newly supplied ImgBB pages to original image URLs and visually inspected the resulting profile and QR artifacts. Local bundling was blocked by the device application-control policy, so the three local assets remain placeholders and `validate:assets` must stay failing. QR payloads were not claimed as decoded or payment-verified.
- Hardened AsyncStorage migration against malformed/missing fields and invalid sections while preserving valid Phase 1–4 records.
- Reduced native timeline work by avoiding attachment metadata queries for every paginated row; detail screens still load attachments. Media selection is capped at 12 items with quality 0.8 to avoid unnecessary full-resolution decoding.
- Added regression coverage for migration preservation, malformed state and pagination determinism.
- Improved shared controls: buttons expose actionable accessibility labels and decorative icons are hidden from screen readers.
- No schema migration or dependency was added in Phase 6. No native build, device test, remote database write, commit or GitHub push occurred.

## Phase 4 implementation

- **Backup & restore:** `lib/backup.ts`, `lib/backup-schema.ts` and `lib/backup-service.ts` define a versioned JSON format with manifest, app/schema versions, creation time, entity counts, attachment-file inclusion status and SHA-256 integrity. Export writes and verifies a local file before opening the system share surface. Import uses the system document picker, enforces a 25 MB limit, validates required fields/IDs/references/counts/integrity before restore, and offers explicit merge or replace semantics. Replace happens inside the native SQLite transaction; web uses the versioned local state fallback. Existing reminder IDs are not rescheduled, preventing notification floods. Current attachment files are explicitly not embedded because the app stores local references/metadata only.
- **App lock:** Settings > Privacy & Security offers an optional biometric-only lock using `expo-local-authentication` and SecureStore. It relocks after backgrounding and gates the root app content. No PIN fallback is invented because a secure PIN implementation is not justified by the current dependencies. Web and devices without enrolled biometrics remain unlocked. This protects app access but does not encrypt SQLite or guarantee secure deletion.
- **Storage:** Settings > Storage measures serialized local database estimate, attachment metadata count/bytes, memories, tasks and events. Cleanup removes only unreferenced attachment metadata rows; it does not delete referenced files or memories and does not request broad storage access.
- **Privacy:** Phase 4 paths avoid logging memory content, backup payloads, PINs or local file paths. Permission requests remain feature-specific.

## Phase 4 validation results

- TypeScript: passed.
- Vitest: passed — 38 tests, 1 skipped (pre-existing auth test).
- Direct ESLint: passed with 0 errors and 9 existing starter warnings.
- Native biometric, system picker/share, SQLite transaction rollback and file-system behavior: not run in this environment; physical iOS/Android validation remains required.
- No database migration was added: Phase 4 uses the existing schema version 3 and stores no new persistent entity type.
