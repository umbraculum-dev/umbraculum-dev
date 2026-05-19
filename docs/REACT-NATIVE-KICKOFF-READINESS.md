# React Native kickoff readiness (web + native shared stack)

Repo root (canonical): `~/dkprojects/rfapps/umbraculum-dev`

## Version baseline

- [ ] `apps/native/package.json` uses a **stable Expo SDK** (not `expo: next`) and React/RN versions aligned to that SDK.
- [ ] `apps/native/tsconfig.json` does **not** include DOM libs (prevents accidental web-only APIs leaking into native).

## Shared packages build (native-ready dist)

- [ ] After changes under `packages/**`, rebuild shared package outputs:
  - `cd ~/dkprojects/rfapps/umbraculum-dev`
  - `./scripts/build-packages-in-docker.sh`
- [ ] Verify `packages/*/dist/**` reflects the latest source changes (these outputs are committed in this repo).

## Shared UI design system (`packages/ui`)

- [ ] `@umbraculum/ui` exports initial shared primitives (Tamagui-based):
  - `Button`, `Text`, `Heading`, `Card`, `Screen`, `Spinner`
- [ ] At least one web component uses shared UI (example: `apps/web/app/_components/LogoutButton.tsx` imports `Button` from `@umbraculum/ui`).
- [ ] At least one native screen uses shared UI (example: `apps/native/src/screens/DashboardScreen.tsx` uses `Screen`, `Heading`, `Text`, `Button` from `@umbraculum/ui`).

## i18n (no hard-coded strings)

- [ ] New user-facing strings are added only to:
  - `packages/i18n/src/en.json`
  - `packages/i18n/src/it.json`
- [ ] Native i18n guardrail passes:
  - `npm run i18n:guardrail -w @umbraculum/native` (run in a Node container per repo policy)
- [ ] Native screens use `useT()` from `@umbraculum/i18n-react` for user-visible text and accessibility labels.

## Auth + web-only fallback routes (system browser bridge)

- [ ] Auth behavior is understood and validated:
  - Web uses cookie sessions (`sid`).
  - Native uses bearer tokens from `POST /auth/login/native`.
  - Source of truth: `docs/AUTH-STRATEGY.md`.
- [ ] Web-only fallback route strategy is **system-browser-first** using:
  - `POST /auth/webview-exchange` (bearer) → returns `bridgeUrl` (relative)
  - open `bridgeUrl` in system browser → cookie minted → redirect to locale-prefixed `next`
- [ ] Shared navigation supports locale-prefixed web paths via:
  - `packages/navigation/src/index.ts` `routeToLocalePath(ref, locale)`
- [ ] Native has a small helper to open a whitelisted web flow via system browser:
  - `apps/native/src/navigation/openWebFallback.ts` `openWebFallbackRoute(...)`

## Media (shared assets)

- [ ] Native can load shared media via `@umbraculum/media` URLs when base URL is configured:
  - `EXPO_PUBLIC_MEDIA_BASE_URL` is set appropriately for simulator/device.
  - Native example component: `apps/native/src/media/RemoteImage.tsx`.

