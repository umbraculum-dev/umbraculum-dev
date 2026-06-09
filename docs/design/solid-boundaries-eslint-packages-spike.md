# SOLID boundaries eslint spike — package-layer tiers (RFC-0011 Wave 3d)

**Tier:** Internal  
**Status:** Frozen (2026-06-06) — Wave 3d deliverable  
**Audience:** package authors, CI maintainers  
**Related:** [pre-flip-application-surface-backbone.md](./pre-flip-application-surface-backbone.md) §6.2 item 5, [solid-boundaries-eslint-spike.md](./solid-boundaries-eslint-spike.md) (API modules B5), [LINTING.md](../LINTING.md)

---

## 1. Motivation

After Wave **3a** (physical tier folders) and **3c** (platform package purity), the repo has three on-disk package tiers under `packages/`:

| Tier | Path | npm examples |
|------|------|--------------|
| Platform | `packages/platform/**` | `@umbraculum/ui`, `@umbraculum/i18n` |
| Modules | `packages/canonical/*/**` | `@umbraculum/module-sdk`, `*-contracts` |
| Verticals | `packages/verticals/*/**` | `@umbraculum/brewery-core`, `@umbraculum/brewery-i18n` |

Mechanical ESLint fences prevent platform packages from re-accumulating vertical leakage (the pre-3c class of bug: `BrewCheckbox` in `@umbraculum/ui`, brewery namespaces in `@umbraculum/i18n`).

---

## 2. Element table (post-3a paths)

| Element | Pattern | Rule |
|---------|---------|------|
| `pkg-platform` | `packages/platform/**` | Must **not** import `pkg-vertical` (may import `pkg-modules` — e.g. `@umbraculum/api-client` → `*-contracts`) |
| `pkg-modules` | `packages/canonical/*/**` | Must **not** import `pkg-vertical` |
| `pkg-vertical` | `packages/verticals/*/**` | May import `pkg-platform` + `pkg-modules`; **never** sibling vertical (`verticalCode` capture) |

**Scope:** `packages/**/*.{ts,tsx}` excluding `dist/**`.

**Severity:** `error` (CI-blocking via existing `lint` job).

---

## 3. Baseline measurement commands

```bash
# Package-layer surface only
npx eslint packages/

# Full repo (same as ci-parity lint job)
npm run lint
```

Post-3c expectation: **0** `boundaries/element-types` violations except the documented allowlist.

---

## 4. Synthetic probe cases

| Probe | Expected |
|-------|----------|
| Add `import x from "../../../verticals/brewery/core/src/index"` in `packages/platform/ui/src/index.ts` | **1 error** (`pkg-platform` → `pkg-vertical`) |
| Add sibling import between `packages/verticals/brewery/**` and a future `packages/verticals/distillery/**` | **1 error** (sibling `pkg-vertical`) |
| `@umbraculum/brewery-recipes-ui` importing `@umbraculum/ui` | **allow** (`pkg-vertical` → `pkg-platform`) |

Remove probes before merge.

---

## 5. Intentional exception — i18n merge

`packages/platform/i18n/src/index.ts` imports `@umbraculum/brewery-i18n` to deep-merge reference-vertical catalogs into `getSharedMessages()`. This is documented with `@arch-boundary` in source and has a dedicated ESLint override (`boundaries/element-types: off` for that file only).

Integrators on `UMBRACULUM_MODULE_PROFILE=platform` may omit brewery-i18n when F-mod lands.

---

## 5b. Intentional exception — api-client facade

`packages/platform/api-client/**` imports both `pkg-modules` (`*-contracts`) and `pkg-vertical` (`@umbraculum/brewery-contracts`) types — the HTTP client is the deliberate aggregation surface for all canonical modules. ESLint disables `boundaries/element-types` for that tree (`@arch-boundary`).

---

## 6. Promotion criteria (warn → error)

Mirrors B5: promote when baseline is **0** warnings on the scoped glob. Wave 3d landed at **error** directly because 3c purity left a clean tree.

---

## 7. Out of scope

- Apps (`apps/**`) — covered by WS5/WS6.
- API canonical modules — covered by B5.
- npm package **name** enforcement (only resolved **file paths** matter for `eslint-plugin-boundaries`).
