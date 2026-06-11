# Native apps

> [!NOTE]
> Part of [Umbraculum](../../README.md) — an open-source toolset for building workspace-shaped operational applications.

Index of Expo / React Native workspaces under `apps/native/`. The **installation profile** selects which app CI and local defaults target.

| App | Installation profile | Workspace | Purpose |
|-----|---------------------|-----------|---------|
| **blank** | Core (default) | `@umbraculum/native-blank` | Blank one-screen Expo app — no vertical or canonical module UI |
| **brewery** | Reference (opt-in) | `@umbraculum/native-brewery` | Full brewery reference vertical native experience |

The active native app is selected by the [installation profile manifest](../../.umbraculum/install.core.json) (`nativeApps` field). See [docs/design/installation-profile.md](../../docs/design/installation-profile.md).

## Web vs native — asymmetric surfaces

**Web:** one federated workspace-member shell (`apps/web`) — canonical modules appear as route groups inside that deployable. The ecosystem can grow large on web (desktop-heavy workflows, AI consultant workspace context). See [RFC-0011](../../docs/rfcs/0011-application-surface-shell-layering.md) explicit non-decision: no second operator web app.

**Native:** many **purpose-built store binaries** under `apps/native/<app-code>/`, not one shell that mirrors web. Each binary is **composed** at build time: which module native slices it registers (for example brew-day, PIM floor, warehouse scanner). Related floor workflows may share one binary; high-friction roles (warehouse scanning, kiosk) stay separate. The installation profile `nativeApps` list selects **which binaries ship** for a deployment — not “every enabled module in one mega-app.”

Native exists only where workflows are intrinsically mobile (offline, scanning, BLE, push, on-the-floor input). The AI consultant reaches the same workspace via API; it does **not** require one native shell. See [`docs/design/installation-profile.md`](../../docs/design/installation-profile.md) § Web vs native and [`docs/NATIVE-STRATEGY-AND-CI.md`](../../docs/NATIVE-STRATEGY-AND-CI.md).

**`blank` (core profile):** the **blank native app** — interim CI/monorepo placeholder until canonical module native apps land (for example `pim-floor`, `quality-audit`). Not the native counterpart to `apps/web` and not sample data (that role belongs to the brewery reference vertical). Expected to retire or shrink when real `<app-code>` workspaces ship.

## What this is

The native app layer of the monorepo. Each subdirectory is an independent Expo workspace (`package.json` + `app.config.js`). **Blank** proves core-profile Expo monorepo bootstrap without vertical packages; **brewery** is the reference vertical mobile surface documented in [`docs/NATIVE-STRATEGY-AND-CI.md`](../../docs/NATIVE-STRATEGY-AND-CI.md).

Per-app detail: [`blank/`](blank/) (blank app) and [`brewery/README.md`](brewery/README.md) (full product app).

## Scope

- **Contains**: Expo app workspaces only (`blank/`, `brewery/`); this index README.
- **Does not contain**: shared RN shell (`@umbraculum/native-shell` in `packages/platform/native-shell`); API routes (`services/api`); web app (`apps/web`).

## Build / test / lint (local)

**Core profile (default — blank):**

```bash
cd apps/native/blank && npx expo start
```

**Reference profile (brewery):**

```bash
UMBRACULUM_MODULE_PROFILE=reference docker compose -f docker-compose.yml -f docker-compose.reference.yml up -d
cd apps/native/brewery && npx expo start
```

- **CI**: `native-deps` runs `expo-doctor` against the manifest's primary native app (`blank` on core, `brewery` on reference). See [`.github/workflows/native-deps.yml`](../../.github/workflows/native-deps.yml).
- **Typecheck**: `npm run typecheck -w @umbraculum/native-blank` or `-w @umbraculum/native-brewery` (container-only npm per [`DEVELOPMENT.md`](../../DEVELOPMENT.md)).
- **Lint**: root `npm run lint` includes native app sources; brewery workspace lint policy in [`brewery/README.md`](brewery/README.md).

## Further reading

- [`docs/design/installation-profile.md`](../../docs/design/installation-profile.md) — core vs reference profiles
- [`docs/NATIVE-STRATEGY-AND-CI.md`](../../docs/NATIVE-STRATEGY-AND-CI.md) — native strategy and CI gates
- [`docs/DEVELOPMENT-NATIVE-LOCAL.md`](../../docs/DEVELOPMENT-NATIVE-LOCAL.md) — local Expo setup
