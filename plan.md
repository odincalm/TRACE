# TRACE — Phase 1 implementation plan

## Scope and delivery boundary

This plan follows the supplied product brief and intentionally implements **Phase 1 only** before moving to later phases:

- Audit and preserve the generated Expo Router / React Native / TypeScript starter.
- Build the TRACE app shell with five destinations: Home, Timeline, Capture, Collections and Settings.
- Establish the premium OLED-black/graphite design system, accessibility-conscious spacing and reduced-motion-safe interactions.
- Implement the fresh-launch welcome/support prompt with a persistent local `Don't show again` preference.
- Implement a usable Settings shell and Support the Developer page skeleton with the supplied links, UPI ID, Wise link and exact donation guidance.
- Add an explicit local-asset configuration layer for the supplied profile image and payment QR assets. The real assets are not yet verified/bundled; placeholders stay visibly labeled and release validation must fail while any required asset is placeholder.
- Establish a small local preference repository boundary and a Room/SQLite foundation note/schema boundary suitable for the later memory repository. Phase 1 does not claim the full memory engine, FTS5, tasks, reminders, attachments, backup/restore or security features are shipped.
- Add detailed README documentation, tests that can run in the starter environment, and exact limitations.

The app will not request an Internet permission for its own data. External support/payment/social links open through platform/browser linking; the app does not download or verify payment data and does not fake donation success.

## Implementation approach

1. **Shell and state**
   - Keep the existing Expo Router entry, Query/React providers, safe-area handling and server starter intact.
   - Add a small local preference hook/repository backed by `@react-native-async-storage/async-storage` to persist only the welcome dismissal setting.
   - Keep welcome visibility scoped to app launch/session state so returning from an external browser, rotating, navigating to Settings or returning from another app does not re-show the prompt.
   - Use route navigation for the five main destinations and a nested support route rather than a single overloaded screen.

2. **Design system**
   - Replace starter light/dark sample colors with TRACE tokens: OLED black base, graphite surfaces, silver text, muted steel text and one mint-teal accent.
   - Use restrained borders, small elevation, generous vertical rhythm and compact floating/overlay treatments; avoid full-screen blur and expensive animation.
   - Use NativeWind for text/layout and `style`/`StyleSheet` for Pressable containers per the Expo starter rules.
   - Use accessible labels, visible text alternatives to icons, minimum touch targets and a reduced-motion-safe static fallback.

3. **Navigation and screens**
   - Home: app identity, local-first status, search affordance, recent-memory empty state, upcoming-work empty state and quick-capture affordances.
   - Timeline: chronological empty state with filter affordance.
   - Capture: clear type choices for Note, Event, Task, Decision, Voice and Attachment, with Phase 1 actions marked as coming in the next phases instead of fake persistence.
   - Collections: collections/projects empty state and template preview.
   - Settings: grouped pages for Support the Developer, Notifications, Privacy & Security, Backup & Restore, Storage, Help & Feedback, About TRACE, Privacy Policy & Legal and What's New; only Support and About/Legal shells are functional in Phase 1.
   - Support: developer intro, profile asset state, why-support copy, support website CTA, social/contact rows, UPI/Wise donation cards and the exact international donation restriction guidance.

4. **Asset and payment safety**
   - Add a local asset manifest with `status: "placeholder" | "verified"` and source-page notes for the supplied IBB URLs.
   - Do not generate, redraw or substitute profile/QR images. Until the exact local assets are supplied or their direct image files are verified, render a clear placeholder state and include a validation command that exits non-zero for release checks.
   - Keep payment links and UPI text in one constants module so future asset replacement cannot silently change the payment destination.

5. **Testing and quality**
   - Add pure tests for payment constants, asset validation and welcome preference behavior.
   - Run TypeScript checking, linting, tests and a Metro/API startup readiness check. Run `pnpm db:push` as required by the mobile starter before first API traffic.
   - Do not call the app production-ready; the release gate remains blocked until real profile/QR assets and later product phases are complete.

## Design direction

- **Design movement:** editorial dark-mode utility design with iOS-inspired restraint and a studio-notebook feel.
- **Core principles:** quiet focus, local ownership, progressive disclosure and tactile clarity.
- **Color philosophy:** near-black surfaces keep attention on personal information; graphite separates hierarchy without visual noise; cool silver remains legible without harsh white; a single sea-glass accent signals actions and support without turning the app into a finance dashboard.
- **Layout paradigm:** a vertical reading surface with section rails and bottom navigation; content is grouped into calm, full-width cards rather than dense grids.
- **Signature elements:** a thin accent rule beside section headings, a compact TRACE wordmark lockup with a four-point trace mark, and outlined graphite cards with a small status eyebrow.
- **Interaction philosophy:** every gesture has a visible alternative; primary actions are thumb-reachable; external navigation is explicit and reversible; no important behavior depends on swipe-only affordances.
- **Animation:** use short opacity/translate transitions only for the welcome prompt and route content where supported; avoid motion for reduced-motion users and avoid looping decorative animations.
- **Typography system:** system sans for all copy, with wide-tracked uppercase eyebrows, high-contrast display title, readable body copy and compact metadata. Avoid custom font downloads in Phase 1.
- **Brand essence:** a private memory workspace for people who think in fragments and want a calm place to return to; **quiet, deliberate, dependable**.
- **Brand voice:** headlines are short and grounded; CTAs are direct and human. Example lines: “Keep the thread.” and “Support the work behind the quiet tools.”
- **Wordmark & logo:** TRACE appears as a restrained uppercase wordmark paired with a four-point path/trace mark; the native launcher uses the same mark on an unrounded square background.
- **Signature brand color:** sea-glass mint `#8FE3C2`.

## Project structure

```text
app/
  _layout.tsx                 Root providers, safe area and route stack
  (tabs)/_layout.tsx          Five-destination bottom navigation
  (tabs)/index.tsx            Home
  (tabs)/timeline.tsx         Timeline shell
  (tabs)/capture.tsx          Capture shell
  (tabs)/collections.tsx      Collections shell
  (tabs)/settings.tsx         Settings shell
  support.tsx                 Support the Developer page
  about.tsx                   About/legal shell
components/
  trace/                      Reusable TRACE cards, buttons and branding
constants/
  trace.ts                    Brand, developer, support and asset constants
hooks/
  use-welcome-preference.ts   Local welcome preference state
lib/
  preferences.ts               AsyncStorage boundary for local preferences
  asset-validation.ts          Placeholder/verified asset release gate
assets/images/
  icon.png and starter icons   Native bundle branding, updated for TRACE
  developer-profile.*          Real supplied photo when verified; no fake fallback
  upi-qr.* / wise-qr.*         Real supplied QR files when verified; no fake fallback
plan.md                         This approved implementation/design plan
TODO.md                         Phase outcome criteria and remaining work
README.md                       Detailed setup, scope, validation and handoff docs
```

## Build and handoff workflow

1. Create the native TODO outcome list after plan approval.
2. Implement Phase 1 in small source batches while preserving starter infrastructure.
3. Run the host-managed TypeScript diagnostics after edits and resolve actionable issues.
4. Run `pnpm db:push`, `pnpm check`, `pnpm lint`, `pnpm test`, and a Metro/API readiness check.
5. Verify the placeholder asset gate fails intentionally until the real assets are present; document this as a release blocker rather than hiding it.
6. Create the required distinct launcher assets and update `app.config.ts` without changing generated identifiers.
7. Commit the complete source and README. Mobile projects keep Manus as canonical; because the user explicitly requested GitHub, use the available repository workflow/terminal push as a separate code handoff only if the platform permits it, without claiming it changed Mobile's canonical repository.
8. Deliver the preview URL and the GitHub repository link, plus exact commands/results and known limitations.

## Known decisions and open inputs

- The supplied IBB links are page links, not direct image files. The real profile and QR files must be verified before the release gate can pass; no synthesized substitutes are acceptable.
- Phase 1 uses the installed Expo/React Native starter because webdev Mobile fixes the stack to that template; it does not attempt to rewrite the project as Kotlin/Jetpack Compose.
- No network, analytics, AI, ads, authentication or donation verification is added.
- The existing empty `odincalm/TRACE` repository is the requested GitHub destination, subject to the platform's Mobile canonical-repository boundary and normal GitHub access rules.
