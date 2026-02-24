# @brewery/i18n

Shared i18n messages for web and native apps. Single source of truth.

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

## Build output (native-ready)

This package is consumed by Metro (React Native) and must ship runtime-safe JS + types:

- Runtime entrypoint: `dist/index.js`
- Type entrypoint: `dist/index.d.ts`

When you change `packages/i18n/src/**`, rebuild the package outputs (from repo root):

- `npm run build:packages`
