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

- `assets/images/developer-profile.jpg`
- `assets/images/upi-qr.jpg`
- `assets/images/wise-qr.jpg`

The inspected source pages are:

- Wise QR page: <https://ibb.co/KjvVW0s0>
- UPI QR page: <https://ibb.co/NfkLqCm>
- Profile page: <https://ibb.co/zTL9Q4Gf>

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
