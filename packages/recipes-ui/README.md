# @brewery/recipes-ui

Domain UI components for recipes and related brewing workflows.

## Scope

- **Contains**: reusable, cross-platform UI for recipe editors and feature widgets (web + native).
- **Does not contain**: Next.js, `next-intl`, React Navigation, Expo Router, or app-specific API/auth wiring.
- **Naming intent**: this package is intentionally recipe-centric (water, yeast, mash editors). As new domains get shared UI, prefer adding new domain packages (e.g. `@brewery/inventory-ui`) rather than turning this into a general “everything UI” bucket.

## Adapter pattern (mandatory)

Shared components accept injected functions/props for:

- **Navigation** (e.g. link handlers)
- **API loading** (web cookie-session vs native bearer)
- **Media rendering** (web `<img>` vs native image component)

## Build output (native-ready)

This package ships runtime-safe JS + types under `dist/**`.

Rebuild from repo root:

- `cd /home/rf/dkprojects/rfapps/brewery-app`
- `./scripts/build-packages-in-docker.sh`

