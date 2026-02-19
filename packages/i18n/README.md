# @brewery/i18n

Shared i18n messages for native apps (React Native / Expo).

## Contents

- **math** – derivation labels, formulas, common strings (water + analysis)
- **auth.errors** – API error codes mapped to user-facing strings

## Usage (native)

```ts
import { getSharedMessages } from "@brewery/i18n";

const messages = getSharedMessages("en");
// messages.math.derivation.labels.volumeLiters → "Volume (L)"
// messages.auth.errors.invalid_credentials → "Invalid email or password"
```

Or import locale-specific JSON:

```ts
import en from "@brewery/i18n/en";
```

## Web

The web app continues to use `apps/web/messages/en.json` and `it.json`. These shared keys are duplicated there for now. A future migration could merge from this package at build/runtime.

## Adding new shared keys

1. Add to `packages/i18n/src/en.json` and `it.json`
2. Add to `apps/web/messages/en.json` and `it.json` (to keep web working)
3. Document in this README
