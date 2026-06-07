# @umbraculum/ui

Shared UI building blocks for web and native apps (Tamagui-based primitives + generic compound components).

> [!NOTE]
> Part of [Umbraculum](../../../README.md) — an open-source toolset for building workspace-shaped operational applications. This package landed under the new `@umbraculum/*` scope as sub-plan #9 slot 5 (2026-05-19); see [`docs/design/brewery-scope-migration-plan.md`](../../../docs/design/brewery-scope-migration-plan.md). Industry-agnostic by construction — no brewery-specific knowledge lives here; domain-flavored components live in `@umbraculum/brewery-recipes-ui`.

## What this is

The platform-neutral UI primitives layer, consumed by both `apps/web` (Next.js) and `apps/native` (React Native + Expo) through Tamagui's cross-platform component system. Intentionally domain-free — recipe-editing, water-page, and other brew-day-specific UI lives in `@umbraculum/brewery-recipes-ui`. See [`docs/PLATFORM-ARCHITECTURE.md`](../../../docs/PLATFORM-ARCHITECTURE.md) for the platform-level framing and [`docs/TAMAGUI.md`](../../../docs/TAMAGUI.md) for the Tamagui type-system caveats and adaptation strategy.

## Scope

- **Contains**: platform-neutral UI primitives and generic compound components (Tamagui-based).
- **Does not contain**: domain/feature UI (recipes editors, water pages, etc.). Those live in `@umbraculum/brewery-recipes-ui`.

## Tamagui config entrypoints

- Web: `@umbraculum/ui/tamagui-config-web` (uses `@tamagui/animations-css`)
- Native: `@umbraculum/ui/tamagui-config-native` (native-safe; animation driver TBD)

## Build / test / lint (local)

This package ships runtime-safe JS + types under `dist/**` so it can be consumed by Metro (React Native) and Next.js without source-level transpilation in the consumer.

- **Build**: from repo root, `./scripts/build-packages-in-docker.sh` (Docker route — preferred per the `node-npm-container-only` skill shipped by `umbraculum-node-react-cursor-assistant`).
- **Test**: `npm run test --workspace=@umbraculum/ui` (vitest in container; see [`docs/TESTING.md`](../../../docs/TESTING.md)).
- **Lint**: `npm run lint --workspace=@umbraculum/ui`.
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../../docs/TYPING.md) §"Per-workspace CI gate" (this workspace landed in Phase 5, commit `aab5b41`, and carries all 6 candidate strict flags after Phase 6h).

When you change `packages/platform/ui/src/**`, run the build before consumers can pick up the change.

## How it fits in

- **Consumed by**: `apps/web` and `apps/native` directly; `@umbraculum/brewery-recipes-ui` (adds domain-specific components on top of these primitives).
- **Depends on**: Tamagui (the cross-platform component system); no other workspace packages — this is the bottom of the UI dependency stack.

## Status

Stable for the brewery vertical's current surface area. The Tamagui upstream evolution is tracked in [`docs/TAMAGUI.md`](../../../docs/TAMAGUI.md); when Tamagui ships breaking changes that affect these primitives, the migration is staged through this package first.

## Further reading

- [`docs/PLATFORM-ARCHITECTURE.md`](../../../docs/PLATFORM-ARCHITECTURE.md) — platform vision and module boundaries
- [`docs/TAMAGUI.md`](../../../docs/TAMAGUI.md) — Tamagui type-system caveats and adaptation strategy
- [`docs/DOCS-README-STANDARDS.md`](../../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
