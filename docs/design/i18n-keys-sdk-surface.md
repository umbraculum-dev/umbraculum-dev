# i18n-keys SDK surface — module message namespace conventions

**Tier:** Public  
**Status:** v0.1 — package `@umbraculum/i18n-keys@0.1.0` landed 2026-05-27  
**Audience:** module authors, third-party integrators, platform maintainers  
**Governing:** [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.2 + §4.4, [`docs/LICENSING.md`](../LICENSING.md) §6.2, [RFC-0001](../rfcs/0001-modules-tiers-governance-and-automation-placement.md) Tier 2  
**Implementation:** [`packages/sdk/i18n-keys/README.md`](../../packages/sdk/i18n-keys/README.md)

## 1. Problem this package solves

Umbraculum modules ship user-facing copy in shared locale bundles (`@umbraculum/i18n` today) and consume it via `next-intl` (web) or `useTranslator` (native). Without a published convention, third-party module authors would guess:

- whether keys live under `pim.*`, `module.pim.*`, or flat `products.*`;
- whether nav labels are `nav.pim`, `pim.nav`, or ad hoc strings;
- which top-level JSON roots are safe to use.

`@umbraculum/i18n-keys` is the **MIT-licensed SDK artifact** that answers those questions — parallel to `@umbraculum/ai-tool-sdk` for tools and `@umbraculum/module-sdk` for registration.

## 2. What is intentionally out of scope (v0)

| Deferred item | Owner / when |
|---|---|
| Brewery-flavored **content** split from `@umbraculum/i18n` | `brewery-scope-migration` §1.4 — second vertical landing |
| External module locale bundle install / merge at app boot | Post-flip marketplace story |
| CI proof that every `labelKey` exists in `en.json` + `it.json` | Fast follow (script under `scripts/`) |
| Typed keys generated from JSON (e.g. `i18n-types`) | Optional later; not required for SDK v0 |

## 3. Conventions (normative for v0)

### 3.1 Module message root

- **Rule:** top-level locale namespace **equals** `registerModule({ code })`.
- **Examples:** `pim`, `automation`, `mrp`, `crp`.
- **API:** `moduleMessageRoot("pim")` → `"pim"` (after validation).
- **Anti-pattern:** using `common` or `nav` as your module root.

### 3.2 Nested keys

- **Rule:** camelCase segments under the module root (`products`, `listTitle`, `attributeSets`).
- **API:** `composeModuleMessageKey("pim", "products", "title")` → `"pim.products.title"`.
- **Web:** `useTranslations("pim")` + `t("products.title")`.

### 3.3 Navigation label keys (Option A — v0)

- **Rule:** `ModuleNavLabelKey` = `` `nav.${string}` ``.
- **Default:** `defaultModuleNavLabelKey(code)` → `nav.<code>`.
- **Registration:** `registerWebModule({ navEntry: { labelKey } })`, `registerNativeModule({ tabEntry: { labelKey } })`.
- **Documented exception:** tier-6 brewery uses `nav.recipes` while `code` is `brewery` — allowed because v0 only requires the `nav.` prefix, not `nav.<code>` equality.

### 3.4 Reserved platform roots

Listed in `RESERVED_PLATFORM_MESSAGE_ROOTS` in the package source. Modules must not call `moduleMessageRoot()` with any reserved value. Canonical module codes are **not** reserved.

## 4. Package dependency graph

```text
@umbraculum/i18n-keys     (leaf — zero deps)
        ↑
@umbraculum/module-sdk    (navEntry.labelKey, tabEntry.labelKey)
        ↑
services/api module boot, third-party modules
```

Locale **content** and **machinery** remain:

- `@umbraculum/i18n` — JSON + `getSharedMessages`
- `@umbraculum/i18n-react` — React / next-intl bindings

## 5. Verification checklist (maintainers)

After changing conventions or reserved roots:

1. `npm run test --workspace=@umbraculum/i18n-keys`
2. `npm run build -w @umbraculum/module-sdk` (depends on i18n-keys types)
3. `npm run typecheck` in `services/api` (module boot uses string literals assignable to `ModuleNavLabelKey`)
4. `python3 scripts/docs/check-readmes.py` (includes `packages/sdk/i18n-keys/README.md`)

## 6. Related documents

- [`docs/I18N-AUDIT.md`](../I18N-AUDIT.md) — hard-coded string migration (web)
- [`docs/design/brewery-scope-migration-plan.md`](brewery-scope-migration-plan.md) §1.4 — framework vs content split
- [`docs/modules/contribute/third-party-module.md`](../modules/contribute/third-party-module.md) — peer dependencies to pin
