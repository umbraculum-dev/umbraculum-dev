# @umbraculum/i18n-react

React + next-intl bindings for `@umbraculum/i18n`. The translator API and locale provider used by both web and native.

> [!NOTE]
> Part of [Umbraculum](../../README.md) — the process-manufacturing platform, brewery-configured by default. Brand resolved 2026-05-18; see [`docs/RENAME-DILIGENCE.md`](../../docs/RENAME-DILIGENCE.md). Renamed from `@brewery/i18n-react` to `@umbraculum/i18n-react` as sub-plan #9 slot 8 (2026-05-19); see [`docs/design/brewery-scope-migration-plan.md`](../../docs/design/brewery-scope-migration-plan.md) §6.8. The rename completes the i18n stack migration that started in slot 7 (`@brewery/i18n` → `@umbraculum/i18n`). Platform-classified per sub-plan #9 §1.1 — no brewery-domain logic lives here.

## What this is

The React-binding layer on top of [`@umbraculum/i18n`](../i18n/README.md). It provides a `LocaleProvider` context, a `Translator` interface (with `t(key, values)` for plain strings and `rich(key, values)` for ReactNode-flavored interpolation), and the `useTranslator(namespace?)` hook consumed by every React component that needs localized strings — on both web and native. Two entry points are exported: the default React entry point (`@umbraculum/i18n-react`) and a Next.js / next-intl-flavored variant (`@umbraculum/i18n-react/next-intl`) that integrates with next-intl's middleware and request-scoped locale on the server. Internally, both paths route formatting through `intl-messageformat` so plural / select / number / date interpolation behavior matches across platforms.

The runtime catalogs themselves live in `@umbraculum/i18n` (which is intentionally framework-neutral so it can also be consumed by Node services and tests); this package is the React-flavored adapter on top.

## Scope

- **Contains**: `LocaleProvider` (context provider for `{ locale, messages }`); `useTranslator(namespace?)` (returns `{ t, rich }`); the `Translator` / `I18nRuntime` type contracts; the `next-intl` sub-entrypoint that integrates with Next.js's per-request locale resolution.
- **Does not contain**: message catalogs (live in `@umbraculum/i18n`); language detection logic for native (lives in `apps/native/src/i18n/` using `expo-localization`); Next.js i18n routing config (lives in `apps/web/middleware.ts` and `apps/web/i18n/`); date / number formatters that don't go through translation keys (use `Intl.*` directly).

## Usage

### Default entry point (works on both web and native)

```ts
import { LocaleProvider, useTranslator } from "@umbraculum/i18n-react";
import { getSharedMessages } from "@umbraculum/i18n";

const messages = getSharedMessages("en");

<LocaleProvider locale="en" messages={messages}>
  <App />
</LocaleProvider>;

function MyComponent() {
  const { t } = useTranslator("recipes");
  return <h1>{t("title")}</h1>;
}
```

### next-intl entry point (web only)

```ts
import { useTranslator } from "@umbraculum/i18n-react/next-intl";
```

The `next-intl` variant defers locale + messages to next-intl's request-scoped context, so server components can use the same `useTranslator` shape.

## Build / test / lint (local)

This package ships dual-format runtime + types (ESM + CJS + d.ts) per the workspace standard.

- **Runtime entrypoints**: `dist/index.js` + `dist/next-intl.js`
- **Type entrypoints**: `dist/index.d.ts` + `dist/next-intl.d.ts`

Commands (run from repo root, container-friendly per the [`node-npm-container-only`](../../.cursor/skills/node-npm-container-only.md) rule):

- **Build**: `npm run build:packages` (uses `tsup` with both entry points).
- **Test**: vitest is not yet configured in this workspace; behavior is covered by the consuming apps' E2E suite (`apps/web/e2e/`) and by the per-workspace typecheck gate. See [`docs/TESTING.md`](../../docs/TESTING.md) §"Layer map" for the per-layer responsibility split.
- **Typecheck**: handled by the per-workspace typecheck CI gate; see [`docs/TYPING.md`](../../docs/TYPING.md) §"Per-workspace CI gate".

## How it fits in

- **Consumed by**: `apps/web` (via `next-intl` entry point), `apps/native` (via default entry point), `@umbraculum/brewery-recipes-ui` (any component that renders translated strings), `@umbraculum/ui` (components with text labels).
- **Depends on**: `@umbraculum/i18n` (the message catalogs); `intl-messageformat` (ICU MessageFormat parser); peer-depends on `react >=18` and `next-intl >=4` (the latter only required if the `next-intl` sub-entrypoint is used).

## Status

Stable for the brewery vertical's current surface area. The two-entrypoint shape (default + `next-intl`) is the architectural anchor: it lets the same component code call `useTranslator` regardless of platform, which is what makes `@umbraculum/brewery-recipes-ui` legitimately platform-neutral.

## Further reading

- [`@umbraculum/i18n`](../i18n/README.md) — the message catalog this package binds to React
- [`docs/I18N-AUDIT.md`](../../docs/I18N-AUDIT.md) — internationalization audit and guardrails
- [`docs/PLATFORM-ARCHITECTURE.md`](../../docs/PLATFORM-ARCHITECTURE.md) — platform vision
- [`docs/DOCS-README-STANDARDS.md`](../../docs/DOCS-README-STANDARDS.md) — module README standard this file conforms to
