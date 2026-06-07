# @umbraculum/brewery-i18n

Brewery-vertical locale bundles (`en.json`, `it.json`) for the reference vertical.

> [!NOTE]
> Part of [Umbraculum](../../../../README.md). Platform + canonical namespaces live in [`@umbraculum/i18n`](../../../platform/i18n/README.md); this package holds brewery-only roots (`recipes`, `equipment`, `inventory`, `waterHub`, `waterProfiles`, `salts`, `math`, `devDashboard`).

## What this is

Vertical message catalogs merged into app-facing trees by `@umbraculum/i18n` `getSharedMessages()`. Apps continue to import `@umbraculum/i18n` only — no consumer change required for the reference vertical.

## Scope

- **Contains**: brewery-vertical namespace JSON for `en` and `it`.
- **Does not contain**: platform/canonical namespaces (`nav`, `auth`, `pim`, …); React hooks (`@umbraculum/i18n-react`); merge logic (lives in `@umbraculum/i18n` with `@arch-boundary`).

## Usage

Prefer `@umbraculum/i18n` / `getSharedMessages(locale)` in apps. Direct import when authoring vertical-only tooling:

```ts
import { en } from "@umbraculum/brewery-i18n";
```

## Build / test / lint (local)

- **Build**: `npm run build:packages` (or `npm run build --workspace=@umbraculum/brewery-i18n`).
- **Typecheck**: `npm run typecheck --workspace=@umbraculum/brewery-i18n`.

## How it fits in

- **Consumed by**: `@umbraculum/i18n` (merge in `getSharedMessages()`).
- **Depends on**: nothing in the workspace.

## Further reading

- [`docs/I18N-AUDIT.md`](../../../../docs/I18N-AUDIT.md)
- [`@umbraculum/i18n`](../../../platform/i18n/README.md)
