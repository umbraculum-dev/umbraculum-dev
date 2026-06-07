# @umbraculum/native-shell

Shared Expo bootstrap for Umbraculum native apps — auth, locale, theme tokens, and platform UI primitives.

> [!NOTE]
> Part of [Umbraculum](../../../README.md) — an open-source toolset for building workspace-shaped operational applications. Extracted from the brewery native app in RFC-0011 Wave 4B so additional vertical apps under `apps/native/<app-code>/` can reuse the same session, i18n, and Tamagui field primitives without copying code.

## What this is

Platform-classified native shell layer consumed by Expo app workspaces (`@umbraculum/native-brewery`, future `@umbraculum/native-*`). Navigation stacks and vertical screens stay in each app; this package owns cross-app bootstrap (`bootstrap`), secure-token auth wiring, locale persistence, shared color tokens, and small RN/Tamagui shims (`Input`, `ReadOnlyField`, `AdSlot`).

## Scope

- **Contains**: `bootstrap` side effects; `auth` (`AuthProvider`, API client, token storage); `i18n` (`I18nProvider`, locale detection/storage); `theme` color tokens; `components` platform primitives.
- **Does not contain**: React Navigation graphs, module route registration, or vertical screens — those remain in each app workspace under `apps/native/<app-code>/`.

## Subpath exports

| Export | Purpose |
|--------|---------|
| `@umbraculum/native-shell` | Barrel re-export of auth, i18n, theme, components |
| `@umbraculum/native-shell/bootstrap` | Side-effect entry (import from app `index.js` before `App`) |
| `@umbraculum/native-shell/auth` | Session provider + API client |
| `@umbraculum/native-shell/i18n` | Locale provider + storage helpers |
| `@umbraculum/native-shell/theme` | Shared surface/field color tokens |
| `@umbraculum/native-shell/components` | `Input`, `ReadOnlyField`, `AdSlot` |

## Build / test / lint (local)

Ships compiled JS + types under `dist/**` for Metro consumption.

- **Build**: from repo root, `./scripts/build-package-in-docker.sh @umbraculum/native-shell` (or `npm run build -w @umbraculum/native-shell` inside the dev container).
- **Typecheck**: `npm run typecheck -w @umbraculum/native-shell`.
- **Lint**: covered by root `web-lint` / ci-parity when this package changes.

When you change `packages/platform/native-shell/src/**`, rebuild before native app typecheck picks up the change.

## How it fits in

- **Consumed by**: `apps/native/brewery` (`@umbraculum/native-brewery`); future native app workspaces under `apps/native/*`.
- **Depends on**: `@umbraculum/api-client`, `@umbraculum/i18n`, `@umbraculum/i18n-react`.
- **Peer dependencies**: `expo`, `expo-secure-store`, `react`, `react-native`, `tamagui`.

## Further reading

- [`docs/design/pre-flip-application-surface-backbone.md`](../../../docs/design/pre-flip-application-surface-backbone.md) — Wave 4 native multi-app layout
- [`docs/rfcs/0011-application-surface-shell-layering.md`](../../../docs/rfcs/0011-application-surface-shell-layering.md) — RFC-0011 application surface layering
- [`apps/native/README.md`](../../../apps/native/README.md) — native umbrella index
- [`docs/DOCS-README-STANDARDS.md`](../../../docs/DOCS-README-STANDARDS.md) — module README standard
