# @brewery/i18n

Shared i18n message tree for web and native apps. Single source of truth.

> [!NOTE]
> Part of [Umbraculum](../../README.md) — the process-manufacturing platform, brewery-configured by default. Brand resolved 2026-05-18; see [`docs/RENAME-DILIGENCE.md`](../../docs/RENAME-DILIGENCE.md). The npm scope `@brewery/*` is parked pending sub-plan #9 ([`RENAME-DILIGENCE.md`](../../docs/RENAME-DILIGENCE.md) §10); do not rewrite import paths.

## What this is

The platform-wide message catalog. The web app (Next.js + next-intl) and the native app (React Native / Expo) both consume from this package, so a translation change in `packages/i18n/src/<locale>.json` propagates to every surface without per-app duplication. Locales currently shipped: English (`en`), Italian (`it`). Coverage and conventions are tracked in [`docs/I18N-AUDIT.md`](../../docs/I18N-AUDIT.md). React-binding helpers (hooks, context providers) live in the sibling [`@brewery/i18n-react`](../i18n-react/README.md) package — this package is **runtime-and-framework-neutral** so it can be consumed by Node services and tests too.

## Scope

- **Contains**: the canonical message tree (`common`, `nav`, `units`, `math`, `recipes`, `waterHub`, `auth`, etc.); locale JSON files (`en.json`, `it.json`); the `getSharedMessages(locale)` accessor.
- **Does not contain**: React hooks or context providers (those live in `@brewery/i18n-react`); Next.js / next-intl wiring (lives in `apps/web/i18n/request.ts` and `apps/web/app/[locale]/layout.tsx`); platform-specific date/number formatters (Intl APIs are used directly at the call site).

## Contents

- Full message tree for the app: `common`, `nav`, `units`, `math`, `recipes`, `waterHub`, `auth`, etc.
- Web (Next.js + next-intl) and native (React Native / Expo) both consume from this package.

## Usage (web)

The web app loads messages via `getSharedMessages(locale)` in `i18n/request.ts` and `app/[locale]/layout.tsx`.

## Usage (native)

```ts
import { getSharedMessages } from "@brewery/i18n";

const messages = getSharedMessages("en");
```

Or import locale-specific JSON:

```ts
import en from "@brewery/i18n/en";
```

## Adding new keys

1. Add to `packages/i18n/src/en.json` and `it.json`
2. Document in this README if adding a new top-level namespace

## Build / test / lint (local)

This package is consumed by Metro (React Native) and Node (services, tests) and must ship runtime-safe JS + types:

- Runtime entrypoint: `dist/index.js`
- Type entrypoint: `dist/index.d.ts`

Commands (run from repo root, container-friendly per the [`node-npm-container-only`](../../.cursor/skills/node-npm-container-only.md) rule):

- **Build**: `npm run build:packages` (rebuilds this package and any other source-level packages whose outputs need refreshing).
- **Test**: `npm run test --workspace=@brewery/i18n` (vitest in container; see [`docs/TESTING.md`](../../docs/TESTING.md)).
- **Lint**: `npm run lint --workspace=@brewery/i18n`.
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../docs/TYPING.md) §"Per-workspace CI gate".

## How it fits in

- **Consumed by**: `apps/web` (via next-intl), `apps/native` (via React Native bundling), `services/api` (for any operator-facing message strings), `@brewery/i18n-react` (the React-binding sibling).
- **Depends on**: nothing in the workspace scope. This package is at the bottom of the package dependency stack alongside `@brewery/contracts` and `@umbraculum/media` (the latter renamed under sub-plan #9 slot 2; remaining `@brewery/*` packages pending sub-plan #9 slots).

## Status

Stable. Adding a locale is a runtime concern (drop a new `<locale>.json`, register it in the consumers). Adding a new top-level namespace requires a doc-trail entry per the **Adding new keys** section above.

## Further reading

- [`docs/I18N-AUDIT.md`](../../docs/I18N-AUDIT.md) — internationalization audit and guardrails
- [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) — platform vision
- [`docs/DOCS-README-STANDARDS.md`](../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
- [`@brewery/i18n-react`](../i18n-react/README.md) — React bindings for translations
