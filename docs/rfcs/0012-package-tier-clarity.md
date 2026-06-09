# RFC-0012 — Package tier clarity (extends RFC-0011 Decision D)

**Tier:** Public  
**Status:** Accepted 2026-06-08 (solo-author; amends RFC-0011 Decision D and RFC-0002 contracts/SDK paths)  
**Audience:** contributors, evaluators, module developers onboarding to the monorepo tree.  
**Document role:** replaces ambiguous `packages/sdk/` with four peer tiers whose folder names match governance vocabulary (`platform`, `sdk`, `canonical`, `verticals`).

> **Disclaimer.** This RFC changes **on-disk package paths** and semver baseline for the MIT SDK batch. It does **not** rename npm package names (`@umbraculum/pim-contracts`, `@umbraculum/module-sdk`, …), change web URLs, or move `services/api/src/modules/<code>/`.

**Companion:** [`docs/NAVIGATE-MONOREPO.md`](../NAVIGATE-MONOREPO.md) (onboarding map + worked example).

---

## 1. Summary

Three decisions:

- **Decision A — Four peer package tiers.** Under `packages/`, only these top-level folders hold npm workspaces: `platform/`, `sdk/`, `canonical/`, `verticals/`. Delete `packages/modules/`.

- **Decision B — Symmetric domain nesting.** Canonical and vertical domain packages use `<tier>/<code>/<artifact>/` (same shape as `verticals/brewery/contracts/`). Canonical contracts live at `packages/canonical/<code>/contracts/` → `@umbraculum/<code>-contracts`. SDK packages live at `packages/sdk/<name>/`.

- **Decision C — npm names unchanged; semver reset.** Tier is visible in **paths**, not npm names (Magento parallel: `Magento_Catalog`, not `Magento_Canonical_Catalog`). MIT publish batch resets to **0.1.0** with updated `repository.directory` fields. **No re-export shims** from old paths.

**Amendments:**

| Prior RFC | What changes |
|-----------|--------------|
| [RFC-0011](0011-application-surface-shell-layering.md) Decision D | `packages/modules/*` → `packages/sdk/*` + `packages/canonical/*/*` |
| [RFC-0002](0002-canonical-module-physical-layout.md) Decision A | Contracts slice: `packages/canonical/<code>/contracts/` (canonical) or `packages/verticals/<code>/contracts/` (vertical) |
| [RFC-0002](0002-canonical-module-physical-layout.md) Decision C | SDK path: `packages/sdk/module-sdk/` |

**Explicit non-goals:**

- No rename of `services/api/src/modules/` (all registered domains remain peer API slices).
- No change to `(code)/` web route groups or URLs.
- No npm scope or package name renames (`@umbraculum/pim-contracts` stays).

---

## 2. Motivation

RFC-0011 Wave 3a grouped packages into `platform/`, `modules/`, and `verticals/`. **`verticals/` read correctly; `modules/` did not.** It mixed:

- canonical module contracts (`pim-contracts`, …),
- plug-in registration SDK (`module-sdk`, `ai-tool-sdk`, `i18n-keys`),

while docs and E2E already used **canonical** as a governance term (`e2e/canonical/`, `docs/modules/canonical/`).

Three meanings of "module" collided:

| Location | "Module" meant |
|----------|----------------|
| `services/api/src/modules/` | Any registered domain (PIM, brewery, …) |
| `packages/sdk/` | Canonical contracts + SDK |
| Docs "canonical module" | Reserved-code governance tier |

Integrators familiar with Magento expect **vendor separation**: `vendor/magento/framework`, `vendor/magento/module-catalog`, extension vendor, merchant code — not a folder named `modules` that hides the SDK.

---

## 3. Decision A — Target tree (commit)

```text
packages/
  platform/                    # industry-agnostic horizontal libs
    ui/
    contracts/                 @umbraculum/contracts
    api-client/
    …

  sdk/                         # plug-in registration spine (MIT)
    module-sdk/                @umbraculum/module-sdk
    ai-tool-sdk/
    i18n-keys/

  canonical/                   # reserved-domain modules (contracts slice today)
    pim/
      contracts/               @umbraculum/pim-contracts
    mrp/
      contracts/
    crp/
      contracts/
    automation/
      contracts/

  verticals/                   # reference + pattern for ISV verticals
    brewery/
      contracts/
      core/
      recipes-ui/
      …
```

**Root workspace globs:**

```json
"packages/platform/*",
"packages/sdk/*",
"packages/canonical/*/*",
"packages/verticals/*/*"
```

---

## 4. Decision B — Magento mapping (commit)

| Magento 2 | Umbraculum tier | Path |
|-----------|-----------------|------|
| `vendor/magento/framework` | Platform | `packages/platform/*` |
| `vendor/magento/module-catalog` | Canonical module | `packages/canonical/pim/contracts/` + β API/web/native slices |
| Extension registration / module.xml contract | SDK | `packages/sdk/module-sdk/` |
| `Magento_SampleData*` / `vendor/amasty/*` | Reference vertical | `packages/verticals/brewery/*` |
| `app/code/Vendor/Module` | Integrator vertical | **Your repo** — same β shape |

See [`BUILDING-YOUR-VERTICAL.md`](../BUILDING-YOUR-VERTICAL.md) §1 for the full parallel table.

---

## 5. Decision C — npm and semver (commit)

| Artifact | Path | npm name |
|----------|------|----------|
| Platform contracts | `packages/platform/contracts/` | `@umbraculum/contracts` |
| Registration SDK | `packages/sdk/module-sdk/` | `@umbraculum/module-sdk` |
| PIM contracts | `packages/canonical/pim/contracts/` | `@umbraculum/pim-contracts` |
| Brewery contracts | `packages/verticals/brewery/contracts/` | `@umbraculum/brewery-contracts` |

MIT publish batch (`ai-tool-sdk`, `i18n-keys`, `module-sdk`, four `*-contracts`) resets to **0.1.0**. No backward-compat path shims.

**Rejected:** `@umbraculum/canonical-pim-contracts` — tier belongs in the path; npm keeps domain-first names.

---

## 6. Future extension (document only)

When a canonical module needs packages beyond contracts:

```text
packages/canonical/pim/
  contracts/
  ui/              # future — same pattern as verticals/brewery/recipes-ui/
```

Workspace glob `packages/canonical/*/*` supports this without another tier rename.

---

## 7. Resolution

Change procedure: same as [RFC-0011 §11](0011-application-surface-shell-layering.md) and [`LICENSING.md`](../LICENSING.md) §10.

Implementation: single coordinated PR — git mv, workspace globs, eslint `pkg-sdk` + `pkg-canonical`, docker bind mounts, docs sweep, semver 0.1.0.
