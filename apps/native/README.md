# Native apps

> [!NOTE]
> Part of [Umbraculum](../../README.md) — an open-source toolset for building workspace-shaped operational applications.

Index of Expo / React Native workspaces under `apps/native/`. The **installation profile** selects which app CI and local defaults target.

| App | Installation profile | Workspace | Purpose |
|-----|---------------------|-----------|---------|
| **starter** | Core (default) | `@umbraculum/native-starter` | Minimal one-screen Expo app — no vertical packages |
| **brewery** | Reference (opt-in) | `@umbraculum/native-brewery` | Full brewery reference vertical native experience |

The active native app is selected by the [installation profile manifest](../../.umbraculum/install.core.json) (`nativeApps` field). See [docs/design/installation-profile.md](../../docs/design/installation-profile.md).

## What this is

The native app layer of the monorepo. Each subdirectory is an independent Expo workspace (`package.json` + `app.config.js`). **Starter** proves core-profile Expo bootstrap without brewery packages; **brewery** is the reference vertical mobile surface documented in [`docs/NATIVE-STRATEGY-AND-CI.md`](../../docs/NATIVE-STRATEGY-AND-CI.md).

Per-app detail: [`starter/`](starter/) (minimal shell) and [`brewery/README.md`](brewery/README.md) (full product app).

## Scope

- **Contains**: Expo app workspaces only (`starter/`, `brewery/`); this index README.
- **Does not contain**: shared RN shell (`@umbraculum/native-shell` in `packages/platform/native-shell`); API routes (`services/api`); web app (`apps/web`).

## Build / test / lint (local)

**Core profile (default — starter):**

```bash
cd apps/native/starter && npx expo start
```

**Reference profile (brewery):**

```bash
UMBRACULUM_MODULE_PROFILE=reference docker compose -f docker-compose.yml -f docker-compose.reference.yml up -d
cd apps/native/brewery && npx expo start
```

- **CI**: `native-deps` runs `expo-doctor` against the manifest's primary native app (`starter` on core, `brewery` on reference). See [`.github/workflows/native-deps.yml`](../../.github/workflows/native-deps.yml).
- **Typecheck**: `npm run typecheck -w @umbraculum/native-starter` or `-w @umbraculum/native-brewery` (container-only npm per [`DEVELOPMENT.md`](../../DEVELOPMENT.md)).
- **Lint**: root `npm run lint` includes native app sources; brewery workspace lint policy in [`brewery/README.md`](brewery/README.md).

## Further reading

- [`docs/design/installation-profile.md`](../../docs/design/installation-profile.md) — core vs reference profiles
- [`docs/NATIVE-STRATEGY-AND-CI.md`](../../docs/NATIVE-STRATEGY-AND-CI.md) — native strategy and CI gates
- [`docs/DEVELOPMENT-NATIVE-LOCAL.md`](../../docs/DEVELOPMENT-NATIVE-LOCAL.md) — local Expo setup
