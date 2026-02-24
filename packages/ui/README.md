# @brewery/ui

Shared UI building blocks for web and native apps.

## Tamagui config entrypoints

- Web: `@brewery/ui/tamagui-config-web` (uses `@tamagui/animations-css`)
- Native: `@brewery/ui/tamagui-config-native` (native-safe; animation driver TBD)

## Build output (native-ready)

This package ships runtime-safe JS + types:

- Runtime entrypoints under `dist/**`
- Type entrypoints under `dist/**`

When you change `packages/ui/src/**`, rebuild the package outputs (from repo root):

- `npm run build:packages`

