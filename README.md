# TRACE

TRACE is a private, offline-first personal memory workspace by Nitin Kumar. Phase 1 establishes the mobile shell, welcome/support flow, local preference boundary, support destinations and honest payment-asset validation. It is **not production-ready** and does not yet include the full memory engine.

> Built by Nitin Kumar · © 2026 Nitin Kumar

## What is implemented in Phase 1

The project uses the fixed Manus Webdev Mobile starter: Expo Router, React Native, TypeScript, NativeWind-compatible components, the existing safe-area/query/runtime wiring and the existing server/database starter infrastructure.

The app now includes five bottom-navigation destinations:

- **Home:** local-first status, recent-memory empty state and first-capture entry point.
- **Timeline:** chronological empty state prepared for future filters and date browsing.
- **Capture:** Note, Event, Task, Decision, Voice and Attachment entry types, clearly marked as later-phase persistence.
- **Collections:** empty state for projects, tags and starter templates.
- **Settings:** grouped shell for support, notifications, privacy/security, backup/restore, storage, help and About.

The fresh-launch welcome prompt contains TRACE branding, the developer credit, a nursing-student explanation, support and continue actions, and a `Don't show again` preference persisted locally with AsyncStorage. Dismissing the prompt for the current session does not enable the persistent preference. The prompt is not tied to browser return, rotation or navigation state.

The Support the Developer page contains:

- Support website: <https://portfolio-blush-three-98.vercel.app/>
- Instagram: <https://instagram.com/odincalm0>
- LinkedIn: <https://www.linkedin.com/in/nitin-kumar-35a0a7279>
- Email: <mailto:odincalm@proton.me>
- GitHub: <https://github.com/odincalm>
- UPI ID: `bholanitin308@okicici`
- Wise payment link: <https://wise.com/pay/business/nitinkumar34?utm_source=quick_pay>
- The exact international donation guidance supplied in the brief.

External links open through the platform linking API. TRACE does not verify donations, claim payment success, promise automatic refunds or enforce third-party limits.

## Asset safety and release blocker

The supplied payment links are stored as constants. The UPI and Wise image pages exposed these direct image URLs during inspection:

- Wise page: <https://ibb.co/KjvVW0s0>
- Wise image: <https://i.ibb.co/7JmrKYpY/wise.jpg>
- UPI page: <https://ibb.co/NfkLqCm>
- UPI image: <https://i.ibb.co/VbhvG9Q/qr.jpg>
- Profile page: <https://ibb.co/zTL9Q4Gf>

The real profile photo page did not expose a reliable direct image URL during this run. More importantly, the required assets must be verified and bundled locally, not loaded from the network. Therefore these files remain deliberately unbundled and the UI shows **Asset pending verification** instead of a fake photo or QR code:

- `assets/images/developer-profile.jpg`
- `assets/images/upi-qr.jpg`
- `assets/images/wise-qr.jpg`

Do not generate, redraw, or replace these with stock imagery. After the exact files are supplied and verified against the intended sources and UPI ID, update the asset manifest status and add the files locally. The release gate must remain failing until then:

```bash
pnpm validate:assets
```

Expected Phase 1 result while placeholders remain: exit code `1` and a JSON report listing all three missing assets.

## Local development

Requirements: Node.js, pnpm 9, and the dependencies installed by the managed Mobile starter.

```bash
pnpm install --prefer-offline
pnpm db:push
pnpm dev
```

The managed Mobile runtime uses:

- Metro/Web preview: `http://localhost:8081`
- API server: `http://localhost:3000`

The starter also supports `pnpm dev:metro` and `pnpm dev:server` when only one listener needs to be restored. Do not change the configured ports. For a native device, use the Expo Go connection flow provided by the managed project; a web preview does not verify every native-only behavior.

## Validation commands

Run the following from the project root:

```bash
pnpm db:push
pnpm check
pnpm lint
pnpm test
pnpm validate:assets
```

`pnpm db:push` synchronizes the starter schema before first API traffic. `pnpm check` runs TypeScript without emitting files. `pnpm lint` runs Expo ESLint. `pnpm test` runs the existing Vitest suite. `pnpm validate:assets` is intentionally a release blocker until all required local assets are verified.

For readiness, start `pnpm dev` in a resident terminal and verify both ports:

```bash
curl -I http://127.0.0.1:8081
curl -I http://127.0.0.1:3000
```

## Privacy and product boundaries

Phase 1 adds no AI SDK, model, analytics, advertising, mandatory login, cloud sync or payment backend. It does not request a broad storage permission and does not need an Internet permission just to open an external browser link. The app does not claim database encryption because encryption is not implemented. Private note content is not logged by the Phase 1 UI.

The full privacy policy, terms, third-party notices, changelog and permission explanations must be kept aligned with the behavior actually shipped in later phases.

## Architecture foundation

- `app/` contains Expo Router screens and navigation.
- `components/trace/` contains reusable visual primitives and asset-status UI.
- `constants/trace.ts` centralizes brand, developer, payment and required-asset declarations.
- `lib/preferences.ts` and `hooks/use-welcome-preference.ts` isolate the local welcome preference.
- `lib/asset-validation.ts` and `scripts/validate-assets.ts` implement the release blocker.
- `lib/local-data-foundation.ts` defines the future local repository boundary without pretending the memory engine exists.
- The later memory phase must add a tested SQLite/Room-compatible data layer, migrations, transactions, FTS5 indexing, duplicate safeguards and recoverable deletion behavior.

## Known limitations and next phases

Phase 1 does not ship memory creation/editing, timeline persistence, collections CRUD, tags, FTS5 search, relationships, tasks, reminders, audio/media/document attachments, backup/restore, encrypted archives, app lock, notification privacy, storage cleanup, complete legal pages, native release artifacts or verified profile/QR assets.

The implementation intentionally uses the fixed Expo/React Native mobile stack required by Webdev Mobile. It does not rewrite the project as Kotlin/Jetpack Compose. Native-only features such as notifications, photo picker, microphone capture and device credential flows require later implementation and actual device validation.

Do not describe this checkpoint as production-ready until the later release gates pass, including verified local assets, clean debug/release builds, migration/UI tests, accessibility checks, low-end-device testing and complete privacy/legal review.

## GitHub handoff

The requested destination is <https://github.com/odincalm/TRACE>. The repository was empty when inspected. Mobile projects keep the managed project repository as canonical; this repository handoff is a separate user-requested code copy and does not change that platform constraint. No force push or unrelated-history overwrite is allowed.

## License / credit

© 2026 Nitin Kumar. The generated starter retains its existing third-party packages and notices. Add a complete third-party notice inventory before a release build.
