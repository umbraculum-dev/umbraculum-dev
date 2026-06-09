# @umbraculum/i18n

Shared i18n message tree for web and native apps. Single source of truth.

> [!NOTE]
> Part of [Umbraculum](../../../README.md) — an open-source toolset for building workspace-shaped operational applications. Renamed from `@umbraculum/i18n` to `@umbraculum/i18n` as sub-plan #9 slot 7 (2026-05-19); see [`docs/design/brewery-scope-migration-plan.md`](../../../docs/design/brewery-scope-migration-plan.md). The bundle MACHINERY (TypeScript types + JSON loader + copy-json build step) is platform-neutral; the bundle CONTENT (`en.json`, `it.json`) is currently brewery-flavored — content split into a `brewery-locales` bundle is deferred per plan doc §1.4.

## What this is

The platform-wide message catalog. The web app (Next.js + next-intl) and the native app (React Native / Expo) both consume from this package, so a translation change in `packages/platform/i18n/src/<locale>.json` propagates to every surface without per-app duplication. Locales currently shipped: English (`en`), Italian (`it`). Coverage and conventions are tracked in [`docs/I18N-AUDIT.md`](../../../docs/I18N-AUDIT.md). React-binding helpers (hooks, context providers) live in the sibling [`@umbraculum/i18n-react`](../i18n-react/README.md) package — this package is **runtime-and-framework-neutral** so it can be consumed by Node services and tests too.

## Scope

- **Contains**: the canonical message tree (`common`, `nav`, `units`, `math`, `recipes`, `waterHub`, `auth`, etc.); locale JSON files (`en.json`, `it.json`); the `getSharedMessages(locale)` accessor.
- **Does not contain**: React hooks or context providers (those live in `@umbraculum/i18n-react`); Next.js / next-intl wiring (lives in `apps/web/i18n/request.ts` and `apps/web/app/[locale]/layout.tsx`); platform-specific date/number formatters (Intl APIs are used directly at the call site); module key **conventions** (those live in [`@umbraculum/i18n-keys`](../../sdk/i18n-keys/) — `ModuleNavLabelKey`, `moduleMessageRoot`, reserved platform roots).

## Contents

- Full message tree for the app: `common`, `nav`, `units`, `math`, `recipes`, `waterHub`, `auth`, etc.
- Web (Next.js + next-intl) and native (React Native / Expo) both consume from this package.

## Usage (web)

The web app loads messages via `getSharedMessages(locale)` in `i18n/request.ts` and `app/[locale]/layout.tsx`.

## Usage (native)

```ts
import { getSharedMessages } from "@umbraculum/i18n";

const messages = getSharedMessages("en");
```

Or import locale-specific JSON:

```ts
import en from "@umbraculum/i18n/en";
```

## Adding new keys

1. Add to `packages/platform/i18n/src/en.json` and `it.json`
2. Document in this README if adding a new top-level namespace

## Build / test / lint (local)

This package is consumed by Metro (React Native) and Node (services, tests) and must ship runtime-safe JS + types:

- Runtime entrypoint: `dist/index.js`
- Type entrypoint: `dist/index.d.ts`

Commands (run from repo root, container-friendly per the `node-npm-container-only` skill shipped by `umbraculum-node-react-cursor-assistant`):

- **Build**: `npm run build:packages` (rebuilds this package and any other source-level packages whose outputs need refreshing).
- **Test**: `npm run test --workspace=@umbraculum/i18n` (vitest in container; see [`docs/TESTING.md`](../../../docs/TESTING.md)).
- **Lint**: `npm run lint --workspace=@umbraculum/i18n`.
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../../docs/TYPING.md) §"Per-workspace CI gate".

## How it fits in

- **Consumed by**: `apps/web` (via next-intl), `apps/native` (via React Native bundling), `services/api` (for any operator-facing message strings), `@umbraculum/i18n-react` (the React-binding sibling).
- **Depends on**: nothing in the workspace scope. This package is at the bottom of the package dependency stack alongside `@umbraculum/contracts` and `@umbraculum/media`.

## Status

Stable. Adding a locale is a runtime concern (drop a new `<locale>.json`, register it in the consumers). Adding a new top-level namespace requires a doc-trail entry per the **Adding new keys** section above.

## Further reading

- [`docs/I18N-AUDIT.md`](../../../docs/I18N-AUDIT.md) — internationalization audit and guardrails
- [`docs/PLATFORM-ARCHITECTURE.md`](../../../docs/PLATFORM-ARCHITECTURE.md) — platform vision
- [`docs/DOCS-README-STANDARDS.md`](../../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
- [`@umbraculum/i18n-react`](../i18n-react/README.md) — React bindings for translations
- [`@umbraculum/i18n-keys`](../../sdk/i18n-keys/README.md) — module message-key conventions (SDK surface)
