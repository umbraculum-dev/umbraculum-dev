# @brewery/ui

Shared UI building blocks for web and native apps.

## Scope

- **Contains**: platform-neutral UI primitives and generic compound components (Tamagui-based).
- **Does not contain**: domain/feature UI (recipes editors, water pages, etc.). Those live in `@brewery/recipes-ui`.

## Tamagui config entrypoints

- Web: `@brewery/ui/tamagui-config-web` (uses `@tamagui/animations-css`)
- Native: `@brewery/ui/tamagui-config-native` (native-safe; animation driver TBD)

## Build output (native-ready)

This package ships runtime-safe JS + types:

- Runtime entrypoints under `dist/**`
- Type entrypoints under `dist/**`

When you change `packages/ui/src/**`, rebuild the package outputs from repo root:

- `cd /home/rf/dkprojects/rfapps/brewery-app`
- `./scripts/build-packages-in-docker.sh`

