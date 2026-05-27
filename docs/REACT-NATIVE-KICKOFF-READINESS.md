# React Native kickoff readiness (web + native shared stack)

Repo root (canonical): `~/dkprojects/rfapps/umbraculum-dev`

> **Status (2026-05-27):** Kickoff criteria below are **cleared** for daily Expo Go development. Ongoing native platform work (July 2026 EAS alpha, module registration, validation debt) is tracked in [`docs/design/canonical-native-platform-surface.md`](design/canonical-native-platform-surface.md).

## Version baseline

- [x] `apps/native/package.json` uses a **stable Expo SDK** (not `expo: next`) and React/RN versions aligned to that SDK.
- [x] `apps/native/tsconfig.json` does **not** include DOM libs (prevents accidental web-only APIs leaking into native).

## Shared packages build (native-ready dist)

- [x] After changes under `packages/**`, rebuild shared package outputs:
  - `cd ~/dkprojects/rfapps/umbraculum-dev`
  - `./scripts/build-packages-in-docker.sh`
- [x] Verify `packages/*/dist/**` reflects the latest source changes (these outputs are committed in this repo).

## Shared UI design system (`packages/ui`)

- [x] `@umbraculum/ui` exports initial shared primitives (Tamagui-based):
  - `Button`, `Text`, `Heading`, `Card`, `Screen`, `Spinner`
- [x] At least one web component uses shared UI (example: `apps/web/app/_components/LogoutButton.tsx` imports `Button` from `@umbraculum/ui`).
- [x] At least one native screen uses shared UI (example: `apps/native/src/screens/DashboardScreen.tsx` uses `Screen`, `Heading`, `Text`, `Button` from `@umbraculum/ui`).

## i18n (no hard-coded strings)

- [x] New user-facing strings are added only to:
  - `packages/i18n/src/en.json`
  - `packages/i18n/src/it.json`
- [x] Native i18n guardrail passes:
  - `npm run i18n:guardrail -w @umbraculum/native` (run in a Node container per repo policy)
- [x] Native screens use `useT()` from `@umbraculum/i18n-react` for user-visible text and accessibility labels.

## Auth + web-only fallback routes (system browser bridge)

- [x] Auth behavior is understood and validated:
  - Web uses cookie sessions (`sid`).
  - Native uses bearer tokens from `POST /auth/login/native`.
  - Source of truth: `docs/AUTH-STRATEGY.md`.
- [x] Web-only fallback route strategy is **system-browser-first** using:
  - `POST /auth/webview-exchange` (bearer) → returns `bridgeUrl` (relative)
  - open `bridgeUrl` in system browser → cookie minted → redirect to locale-prefixed `next`
- [x] Shared navigation supports locale-prefixed web paths via:
  - `packages/navigation/src/index.ts` `routeToLocalePath(ref, locale)`
- [x] Native has a small helper to open a whitelisted web flow via system browser:
  - `apps/native/src/navigation/openWebFallback.ts` `openWebFallbackRoute(...)`

## Media (shared assets)

- [x] Native can load shared media via `@umbraculum/media` URLs when base URL is configured:
  - `EXPO_PUBLIC_MEDIA_BASE_URL` is set appropriately for simulator/device.
  - Native example component: `apps/native/src/media/RemoteImage.tsx`.

---

## Post-kickoff (active work)

| Topic | Doc |
|-------|-----|
| Native platform SoT, alpha scope, route matrix | [`docs/design/canonical-native-platform-surface.md`](design/canonical-native-platform-surface.md) |
| EAS internal alpha (July 2026) | Same doc §5; `apps/native/eas.json` |
| `registerNativeModule` | [`packages/module-sdk`](../../packages/module-sdk/README.md) |
| Validation debt on brewery screens | Native surface doc §6 |

