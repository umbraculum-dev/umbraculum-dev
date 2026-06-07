# @umbraculum/native-brewery

React Native + Expo + Tamagui mobile application — the on-the-go brew-day surface of Umbraculum's brewery vertical.

> [!NOTE]
> Part of [Umbraculum](../../../README.md) — an open-source toolset for building workspace-shaped operational applications.

> [!TIP]
> **Looking for the web app?** See [`apps/web`](../../web/README.md) — Next.js + Tamagui desktop-first operational UI. Web and native share UI through `@umbraculum/ui`; see [`docs/CROSS-PLATFORM-BOUNDARIES.md`](../../../../docs/CROSS-PLATFORM-BOUNDARIES.md).

> **Multi-app index:** [`apps/native/README.md`](../README.md)

## What this is

The native (iOS + Android) application for brewers who need brew-day reliability tooling on a phone or tablet during a brew session. Built on React Native 0.81 + Expo 54 + Tamagui, sharing the bulk of its UI surface with `apps/web` through the `@umbraculum/ui` (primitives) and `@umbraculum/brewery-recipes-ui` (domain UI) packages — the platform-neutral components render identically on both surfaces. Authentication uses bearer tokens stored in `expo-secure-store` and refreshed against `services/api` via `@umbraculum/api-client`; localization runs through `@umbraculum/i18n-react` reading from `@umbraculum/i18n`; charts use `victory-native` + `react-native-svg`.

The native-specific build / CI / publishing strategy is documented in [`docs/NATIVE-STRATEGY-AND-CI.md`](../../../../docs/NATIVE-STRATEGY-AND-CI.md); the kickoff readiness criteria (now mostly cleared) are in [`docs/REACT-NATIVE-KICKOFF-READINESS.md`](../../../../docs/REACT-NATIVE-KICKOFF-READINESS.md). Local-development setup is in [`docs/DEVELOPMENT-NATIVE-LOCAL.md`](../../../../docs/DEVELOPMENT-NATIVE-LOCAL.md).

**Platform context (post–RFC-0002/0003/0007):** The operational source of truth for route availability, module obligations, July 2026 alpha scope, and post-alpha gates is [`docs/design/canonical-native-platform-surface.md`](../../../../docs/design/canonical-native-platform-surface.md). Canonical modules (`mrp`, `crp`, `pim`, `automation`) ship **web-first** today; native covers **brewery brew-day** flows only. Planning, exports, and admin surfaces remain on web (with optional **Open on web** for whitelisted routes such as `inventory`).

## Scope

- **Contains**: Expo entrypoint (`App.tsx`, `index.js`); React Navigation stack/tab/native-stack glue (`src/navigation/`); auth integration with `expo-secure-store` (`src/auth/`); per-screen views (`src/screens/`); native-side bootstrap (locale detection, Tamagui theme injection — `src/bootstrap.ts`, `src/i18n/`, `src/theme/`); native-component shims for things web doesn't need (`src/components/`); Metro bundler config (`metro.config.js`); the i18n-coverage guardrail (`scripts/i18n-guardrail.mjs`).
- **Does not contain**: API route handlers (`services/api`); shared UI primitives (`@umbraculum/ui`); domain UI (`@umbraculum/brewery-recipes-ui`); message catalogs (`@umbraculum/i18n`); contract types (`@umbraculum/contracts`); media assets (`@umbraculum/media` — referenced directly via Metro bundling); the API client (`@umbraculum/api-client`); the web app (`apps/web`).

## Quick start

The native dev loop runs **outside Docker** because Expo / Metro need direct access to a running iOS Simulator or Android emulator. Per the `node-npm-container-only` skill shipped by `umbraculum-node-react-cursor-assistant`, dependency installation is still container-only; the dev runtime is the documented exception.

From repo root:

1. Install dependencies (one-time, container): see [`docs/DEVELOPMENT-NATIVE-LOCAL.md`](../../../docs/DEVELOPMENT-NATIVE-LOCAL.md) for the canonical install flow.
2. Start Metro: `cd apps/native/brewery && npx expo start`.
3. iOS: press `i` in the Expo CLI; Android: press `a`; web (Expo's web target, separate from `apps/web`): press `w`.

The native app expects `services/api` to be reachable; for local development against the dev stack on the host, use the documented LAN-IP override in [`docs/DEVELOPMENT-NATIVE-LOCAL.md`](../../../docs/DEVELOPMENT-NATIVE-LOCAL.md) so the device can resolve the API host.

## Build / test / lint (local)

- **Build (Expo dev)**: `npx expo start` (Metro bundler in dev mode).
- **Build (EAS demo)**: `eas.json` `preview` profile → `https://demo.umbraculum.dev`; operator steps: [`EAS-DEMO-SETUP.md`](EAS-DEMO-SETUP.md) (includes **Expo free tier** — monthly build caps + slow queue are expected); policy: [`docs/design/demo-host-runbook.md`](../../../docs/design/demo-host-runbook.md); [`docs/NATIVE-STRATEGY-AND-CI.md`](../../../docs/NATIVE-STRATEGY-AND-CI.md) §5.
- **Lint**: not yet configured in this workspace (see [`docs/LINTING.md`](../../../docs/LINTING.md) for the platform-wide linting strategy and current scope tiers).
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../../docs/TYPING.md) §"Per-workspace CI gate" (this workspace carries all 6 candidate strict flags after Phase 6h, and was the first non-pilot workspace to land `noUncheckedIndexedAccess` in Phase 6b — fixing 6 latent index-out-of-bounds sites in the process).
- **i18n coverage check**: `npm run i18n:guardrail`.
- **Unit tests**: `npm run test` runs vitest for navigation/bootstrap helpers; component-level UI testing remains in `@umbraculum/ui` and `@umbraculum/brewery-recipes-ui`. See [`docs/TESTING.md`](../../../docs/TESTING.md) §"Layer map".

## How it fits in

- **Consumed by**: end users on iOS and Android (via the future store releases). Internal alpha distribution runs through Expo's tooling per [`docs/NATIVE-STRATEGY-AND-CI.md`](../../../docs/NATIVE-STRATEGY-AND-CI.md).
- **Depends on**: `services/api` (HTTP backend, bearer auth); `@umbraculum/api-client` (transport); `@umbraculum/contracts` (typed responses); `@umbraculum/ui` + `@umbraculum/brewery-recipes-ui` (UI); `@umbraculum/i18n` + `@umbraculum/i18n-react` (localization); `@umbraculum/navigation` (route ID system shared with web); `@umbraculum/media` (assets); `@umbraculum/brewery-beerjson` (recipe parsing).
- **Auth**: bearer tokens in `expo-secure-store`. The web sibling rides cookie sessions — the difference is abstracted in `@umbraculum/api-client`.

## Status

**July 2026 EAS demo (brewery-only):** Internal EAS `preview` APK against **`demo.umbraculum.dev`** (demonstration host — not production `cloud`). Brew-day flows only on native; MRP/CRP/PIM/automation remain web. Inventory uses **Open on web** via `openWebFallbackRoute`.

Shipping (work-in-progress). Brew-session ergonomics are tuned for kettle-side use. Full webview-in-app embedding remains deferred; system-browser web fallback is implemented for whitelisted routes per [`docs/AUTH-STRATEGY.md`](../../../docs/AUTH-STRATEGY.md).

## Further reading

- [`docs/design/canonical-native-platform-surface.md`](../../../docs/design/canonical-native-platform-surface.md) — native SoT (routes, alpha scope, obligations)
- [`docs/PLATFORM-ARCHITECTURE.md`](../../../docs/PLATFORM-ARCHITECTURE.md) — platform vision and module boundaries
- [`docs/NATIVE-STRATEGY-AND-CI.md`](../../../docs/NATIVE-STRATEGY-AND-CI.md) — native strategy, CI, EAS pipeline
- [`docs/REACT-NATIVE-KICKOFF-READINESS.md`](../../../docs/REACT-NATIVE-KICKOFF-READINESS.md) — kickoff readiness criteria
- [`docs/DEVELOPMENT-NATIVE-LOCAL.md`](../../../docs/DEVELOPMENT-NATIVE-LOCAL.md) — local development setup
- [`docs/AUTH-STRATEGY.md`](../../../docs/AUTH-STRATEGY.md) — cookie-web + bearer-native + future webview bridge
- [`docs/TAMAGUI.md`](../../../docs/TAMAGUI.md) — Tamagui type-system caveats
- [`docs/DOCS-README-STANDARDS.md`](../../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
