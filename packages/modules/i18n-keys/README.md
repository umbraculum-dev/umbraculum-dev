# @umbraculum/i18n-keys

Namespace conventions and key helpers for module-owned message keys in Umbraculum locale bundles.

> [!NOTE]
> Part of [Umbraculum](../../../README.md) — an open-source toolset for building workspace-shaped operational applications. Greenfield SDK package landed 2026-05-27; realizes the published-SDK commitment in [`docs/PLATFORM-ARCHITECTURE.md`](../../../docs/PLATFORM-ARCHITECTURE.md) §4.4. This is **not** a carve-out from [`@umbraculum/i18n`](../../platform/i18n/) — that package keeps locale machinery and message **content**. Splitting brewery-flavored strings into a future vertical bundle is deferred per [`docs/design/brewery-scope-migration-plan.md`](../../../docs/design/brewery-scope-migration-plan.md) §1.4.

## Install

```bash
npm install @umbraculum/i18n-keys@^0.1.0
```

Public alpha — see [third-party-module.md](../../../docs/modules/contribute/third-party-module.md).

## What this is

The MIT-licensed contract third-party and canonical module authors use to name message keys consistently across web (`next-intl`) and native (`useTranslator`). It encodes three rules the platform already follows in production:

1. **Module UI copy** lives under a top-level namespace equal to the module `code` (`pim.*`, `automation.*`, `mrp.*`, `crp.*`).
2. **Primary navigation labels** use the `nav.*` prefix (`nav.pim`, `nav.automation`, …). The usual pattern is `nav.<moduleCode>` via `defaultModuleNavLabelKey(code)`, but tier-6 verticals may use a different suffix (brewery today uses `nav.recipes`, not `nav.brewery`).
3. **Platform-owned roots** (`common`, `auth`, `math`, `nav`, …) are reserved — modules must not claim them as their message root.

Zero locale JSON, zero React, zero next-intl — only types and small pure helpers.

## Scope

- **Contains**: `ModuleNavLabelKey`, `ModuleScopedMessageKey`, `RESERVED_PLATFORM_MESSAGE_ROOTS`, validation helpers (`assertValidModuleMessageRoot`, `moduleMessageRoot`, `defaultModuleNavLabelKey`, `composeModuleMessageKey`), and error types for invalid or reserved roots.
- **Does not contain**: locale files (`en.json` / `it.json` live in [`@umbraculum/i18n`](../../platform/i18n/)); React bindings ([`@umbraculum/i18n-react`](../../platform/i18n-react/)); proof that a key exists at runtime (apps merge bundles at load time — a future CI check may audit bundles separately).

## Conventions (authoritative for v0)

### Module message root

| Rule | Detail |
|------|--------|
| Shape | Same as `registerModule({ code })`: lowercase, starts with a letter, `[a-z0-9_]*`. |
| Locale tree | Top-level key in `en.json` / `it.json` equals `code`. |
| Web usage | `useTranslations("pim")` then `t("products.title")` resolves `pim.products.title`. |
| Native usage | Same namespace via `useTranslator` / merged messages from `@umbraculum/i18n`. |

### Navigation label keys

| Rule | Detail |
|------|--------|
| Shape | `ModuleNavLabelKey` = `` `nav.${string}` `` (Option A — v0). |
| Default | `defaultModuleNavLabelKey("pim")` → `"nav.pim"`. |
| Registration | Pass to `registerWebModule({ navEntry: { labelKey: … } })` or `registerNativeModule({ tabEntry: { labelKey: … } })` on [`@umbraculum/module-sdk`](../module-sdk/). |
| Exception | When the product nav label is not named after `code`, use any `nav.<suffix>` that exists in the bundle (e.g. `nav.recipes` for brewery). |

### Reserved platform roots

Modules must **not** call `moduleMessageRoot()` with any value in `RESERVED_PLATFORM_MESSAGE_ROOTS` (`common`, `nav`, `auth`, `math`, …). Canonical module codes (`pim`, `automation`, …) are valid roots and are **not** on that list.

## Exports

| Symbol | Purpose |
|--------|---------|
| `ModuleNavLabelKey` | Branded `nav.*` key type for primary nav / tab labels. |
| `ModuleScopedMessageKey<Root>` | `` `${Root}.${string}` `` helper type for documentation. |
| `RESERVED_PLATFORM_MESSAGE_ROOTS` | Platform-owned top-level namespaces modules must not claim. |
| `moduleMessageRoot(code)` | Validated module root string. |
| `defaultModuleNavLabelKey(code)` | `nav.<code>` with validation on `code`. |
| `composeModuleMessageKey(root, …segments)` | Builds `root.seg1.seg2` with segment validation. |
| `assertValidModuleMessageRoot(root)` | Pattern + reserved-root check. |

## Usage

Registering web navigation (API module boot):

```ts
import { registerWebModule } from "@umbraculum/module-sdk";
import { defaultModuleNavLabelKey } from "@umbraculum/i18n-keys";

registerWebModule({
  code: "pim",
  ownedUrlSegments: ["products", "categories"],
  navEntry: {
    primarySegment: "products",
    labelKey: defaultModuleNavLabelKey("pim"),
    order: 5,
  },
});
```

Authoring locale entries (in your module's bundle or the monorepo's `@umbraculum/i18n` until external bundles land):

```json
{
  "pim": {
    "title": "Product Information Management",
    "products": { "listTitle": "Products" }
  },
  "nav": {
    "pim": "Products"
  }
}
```

Composing a nested key in TypeScript:

```ts
import { composeModuleMessageKey, moduleMessageRoot } from "@umbraculum/i18n-keys";

const root = moduleMessageRoot("pim");
const key = composeModuleMessageKey(root, "products", "listTitle");
// "pim.products.listTitle"
```

## Build / test / lint (local)

Commands (run from repo root, container-friendly per the `node-npm-container-only` skill):

- **Build**: `npm run build:packages` (builds `@umbraculum/i18n-keys` before `@umbraculum/module-sdk`)
- **Test**: `npm run test --workspace=@umbraculum/i18n-keys`
- **Lint**: `npm run lint --workspace=@umbraculum/i18n-keys`
- **Typecheck**: per-workspace CI gate; see [`docs/TYPING.md`](../../../docs/TYPING.md)

## How it fits in

- **Consumed by**: [`@umbraculum/module-sdk`](../module-sdk/) (`navEntry.labelKey`, `tabEntry.labelKey` typed as `ModuleNavLabelKey`); third-party module repos (peer dependency); canonical module authors documenting key layout.
- **Depends on**: nothing. Peer of [`@umbraculum/ai-tool-sdk`](../ai-tool-sdk/) on the MIT SDK surface.
- **Sibling packages**: [`@umbraculum/i18n`](../../platform/i18n/) (bundles + `getSharedMessages`); [`@umbraculum/i18n-react`](../../platform/i18n-react/) (React hook).

## Status

v0.1.0 is intentionally minimal: conventions + helpers, no bundle merger and no key-existence CI yet. Breaking changes follow PLATFORM-ARCHITECTURE §10 semver discipline at the SDK boundary. Published on the public npm registry — see [`docs/design/npm-sdk-publish-execution-plan.md`](../../../docs/design/npm-sdk-publish-execution-plan.md).

## Further reading

- [`docs/design/i18n-keys-sdk-surface.md`](../../../docs/design/i18n-keys-sdk-surface.md) — normative v0 conventions, dependency graph, maintainer checklist
- [`docs/PLATFORM-ARCHITECTURE.md`](../../../docs/PLATFORM-ARCHITECTURE.md) §4.2 + §4.4 — module-owned i18n namespace + SDK surface
- [`docs/LICENSING.md`](../../../docs/LICENSING.md) §6.2 — MIT SDK posture
- [`docs/I18N-AUDIT.md`](../../../docs/I18N-AUDIT.md) — web UI i18n migration audit
- [`docs/modules/contribute/third-party-module.md`](../../../docs/modules/contribute/third-party-module.md) — stable surfaces to pin
- [`packages/modules/module-sdk/README.md`](../module-sdk/README.md) — `registerWebModule` / `registerNativeModule`
- [`packages/platform/i18n/README.md`](../../platform/i18n/README.md) — where locale JSON lives today
