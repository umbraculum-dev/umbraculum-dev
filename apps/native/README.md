# Native apps (`apps/native/`)

**Tier:** Public  
**Status:** RFC-0011 Wave 4 — multi-app workspace (2026-06-07)  
**Audience:** contributors working on Expo / React Native surfaces

> [!NOTE]
> Part of [Umbraculum](../../README.md) — an open-source toolset for building workspace-shaped operational applications.

## What this is

Umbrella directory for **multiple Expo app workspaces** under `apps/native/<app-code>/`. Each deployable native app is its own npm workspace; shared bootstrap lives in `@umbraculum/native-shell` (Wave 4B complete).

## Scope

- **Contains:** multi-app index, links to per-app READMEs, layout diagram.
- **Does not contain:** Expo entrypoints, Metro config, or module slices (those live under `brewery/` today).

## Build / test / lint (local)

Per-app commands live in each app README — start with [`brewery/README.md`](brewery/README.md) (`cd apps/native/brewery && npx expo start`).

## Multi-app layout

Manufacturing/ERP products often ship **multiple mobile apps** against one backend (brew-day, warehouse scanner, PIM floor app). Umbraculum models that under `apps/native/<app-code>/`:

```text
apps/native/
  brewery/                 # @umbraculum/native-brewery — reference brew-day app (shipping)
  # future (scaffold only until product need):
  # pim/                 # @umbraculum/native-pim — shop-floor / handheld (post-alpha scaffold)
  # wms-scanner/           # @umbraculum/native-wms-scanner

packages/platform/native-shell/   # @umbraculum/native-shell (Wave 4B — shared auth/nav/i18n)
```

| App | npm workspace | README |
|-----|---------------|--------|
| Brewery brew-day | `@umbraculum/native-brewery` | [`brewery/README.md`](brewery/README.md) |

## Quick start

```bash
cd apps/native/brewery && npx expo start
```

Full setup: [`docs/DEVELOPMENT-NATIVE-LOCAL.md`](../../docs/DEVELOPMENT-NATIVE-LOCAL.md). Strategy / CI: [`docs/NATIVE-STRATEGY-AND-CI.md`](../../docs/NATIVE-STRATEGY-AND-CI.md).

**Dependency gate (agents + humans):** after editing native deps, root `overrides`, or `native-shell` peers, run [`scripts/check-native-expo-doctor.sh`](../../scripts/check-native-expo-doctor.sh) (CI: [`native-deps.yml`](../../.github/workflows/native-deps.yml)). See [`docs/design/expo-doctor-monorepo-assessment.md`](../../docs/design/expo-doctor-monorepo-assessment.md) §8.

## Related

- [`apps/web`](../web/README.md) — member-facing web application  
- [`docs/design/pre-flip-application-surface-backbone.md`](../../docs/design/pre-flip-application-surface-backbone.md) §4 — native multi-app model  
- [`docs/rfcs/0011-application-surface-shell-layering.md`](../../docs/rfcs/0011-application-surface-shell-layering.md) — Decision C
