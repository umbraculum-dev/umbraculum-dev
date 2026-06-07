# RFC-0011 — Application-surface shell layering (extends RFC-0002)

**Tier:** Public  
**Status:** Accepted 2026-06-06 (pre-flip solo-author + core-team approval recorded; this is a living RFC — see §11 Resolution for the change procedure)  
**Audience:** prospective contributors, third-party module developers, self-hosters, agent executors preparing the July 2026 public-alpha seed.  
**Document role:** extends [RFC-0002](0002-canonical-module-physical-layout.md) β layout with **filesystem layering** conventions for web, native, packages on disk, and E2E — the backbone integrators expect (Magento-class separation) without splitting the member-facing web app into multiple deployables.

> **Disclaimer.** This RFC does not change RFC-0002 module slice paths for `(code)/` routes, API modules, or contracts packages. It commits where **shared shell** code lives relative to module-owned and vertical-owned code. Companion audit: [`docs/design/pre-flip-application-surface-backbone.md`](../design/pre-flip-application-surface-backbone.md).

---

## 1. Summary

Six decisions:

- **Decision A — Web platform shared layout directory.** Platform-owned shared layout UI and helpers live under `apps/web/app/_shared-layout/{_components,_lib}/` (path name is legacy — see §3.1). They must not contain module- or vertical-specific names/logic. Module-shared folders live at `apps/web/app/[locale]/(<code>)/{_components,_lib}/`. Vertical UI shared across web and native belongs in `@umbraculum/<vertical>-*` packages.

- **Decision B — Platform horizontal pages use a route group.** Segments such as `ai`, `accessibility`, `about`, `contact`, `contributing` move under `apps/web/app/[locale]/(platform-layout)/<segment>/` (exact group name committed at implementation — must not collide with `[locale]/platform/` admin). URLs unchanged.

- **Decision C — Native multi-app workspace.** `apps/native/` hosts one Expo workspace per deployable native app at `apps/native/<app-code>/`. Shared bootstrap (auth, navigation glue, i18n, theme) extracts to `@umbraculum/native-shell`. Module native slices default to `apps/native/<app-code>/src/modules/<code>/` unless promoted to a package when reused across apps.

- **Decision D — Package on-disk tiers.** Monorepo paths group as `packages/platform/*`, `packages/modules/*`, `packages/verticals/<vertical-code>/*`. Folder names under `verticals/brewery/` align with npm (`core/` → `@umbraculum/brewery-core`). **npm package names and scopes unchanged** at flip unless Decision F lands in the same window.

- **Decision E — E2E taxonomy (recommended, not blocking).** Playwright suites mirror product layers: `e2e/platform/`, `e2e/canonical/`, `e2e/verticals/<code>/`. Deferral permitted via [`public-flip-deferral-register.md`](../design/public-flip-deferral-register.md).

- **Decision F — Package content layering (commit).** Platform packages contain platform-only code. Brewery wire types move to **`@umbraculum/brewery-contracts`** (new workspace under `packages/verticals/brewery/contracts/`). Vertical leakage is removed from `@umbraculum/contracts`, `@umbraculum/ui`, and `@umbraculum/i18n` per companion audit §6.4–§6.5. Package-layer eslint boundaries mirror app WS5.

**Explicit non-decisions:**

- **No merge** of `@umbraculum/api` (service) and `@umbraculum/api-client` (client SDK).
- **No second operator web deployable** — `apps/web` remains the single workspace-member web application with or without reference vertical installed.
- **No change** to RFC-0002 β paths for module route implementations already under `(code)/`.

---

## 2. Motivation

RFC-0002 answered “where does my module's **pages** go?” It intentionally deferred shell composition ([`application-surfaces-vs-platform-backbone.md`](../design/application-surfaces-vs-platform-backbone.md) §5). After brewery recipe consolidation (2026-06), module **routes** follow β, but **shared app folders** still mix platform and brewery:

- `apps/web/app/_components/BrewAccordionSection.tsx` beside `AccessibilityLink.tsx`
- `apps/web/app/_lib/breweryWaterClient.ts` beside `webApiClient.ts`
- `[locale]/ai` at the same structural level as `(pim)/` without indicating platform ownership
- `@umbraculum/contracts` exports brewery, water, and gravity-analysis schemas from the **platform** contracts package — while RFC-0002 names `@umbraculum/brewery-contracts`, that package was never created
- `packages/verticals/brewery/core/` on disk vs `@umbraculum/brewery-core` on npm; `BrewCheckbox` in `@umbraculum/ui`

[`BUILDING-YOUR-VERTICAL.md`](../BUILDING-YOUR-VERTICAL.md) teaches Magento's core vs sample-data vs agency-module story, but the repo tree contradicts that story in **platform shared layout folders and platform npm packages alike**. Pre-flip is the last low-cost window to fix paths before external forks copy the wrong shape.

---

## 3. Decision A — Web platform shared layout directory (commit)

**Platform-owned shared layout code lives in `apps/web/app/_shared-layout/`.** Wave **3f (2026-06-07)** renamed the path from legacy `_shell/`; use **platform shared layout** in prose (see §3.1, backbone §3.7).

| Bucket | Path | May import from |
|--------|------|-----------------|
| Platform shared layout | `app/_shared-layout/_components/`, `app/_shared-layout/_lib/` | `@umbraculum/{ui,navigation,i18n-react,api-client,contracts,…}` horizontal packages |
| Module shared UI (per code) | `app/[locale]/(<code>)/_components/`, `…/_lib/` | Same horizontal packages + `@umbraculum/<code>-contracts` + same-module segments |
| Module pages | `app/[locale]/(<code>)/<segment>/` | Module shared UI + horizontal packages |
| Cross-surface vertical UI | `@umbraculum/<vertical>-*` packages | Horizontal packages only |

**WS5 enforcement:** add `web-platform-shared-layout` eslint element (legacy identifier = **platform shared layout folder**); forbid imports from any `web-locale-vertical` into that folder and vice versa except through registered package boundaries.

**Migration:** rename/move current platform files from legacy `app/_components` + `app/_lib`; move brewery-specific files into `(brewery)/_components` or packages. Delete empty legacy folders when done.

### 3.1 Terminology policy — sunset internal slang (commit)

This RFC title uses *shell layering* for historical reasons. **New and revised documentation must not adopt or extend internal slang** invented for early Umbraculum drafts. Use **conventional IT and framework vocabulary** so readers without project history can follow the tree.

**Sunset in prose** (replace when editing docs; full table in [`pre-flip-application-surface-backbone.md`](../design/pre-flip-application-surface-backbone.md) §3.5):

| Do not write | Write instead |
|--------------|---------------|
| Operator shell, operator chrome, application shell, platform chrome | **Platform shared layout**, **workspace web UI**, **member-facing web application** |
| Shared layout components (ambiguous) | **Shared layout components** (nav, footer, auth bar) under `app/_shared-layout/` |
| “Shell” without qualification | **Command-line shell**, **platform shared layout**, **UT Morph webapp wrapper**, **Next.js route group** — pick the precise term |
| New invented compounds | Standard terms from Next.js docs, software architecture, or [`GLOSSARY.md`](../GLOSSARY.md) |

**Allowed exceptions (narrow):** RFC-0011 document title/filename (historical); `@umbraculum/native-shell` npm package name; **command-line shell** when discussing bash/CI.

**Wave 3f complete (2026-06-07):** path rename `_shared-layout/`, `(platform-layout)/` route group, eslint `web-platform-shared-layout`, zero legacy slang in integrator docs. Decision A **semantics** unchanged.

---

## 4. Decision B — Platform horizontal route group (commit)

Platform-facing operator pages that are **not** canonical modules and **not** `[locale]/platform/` admin move under a dedicated route group:

```text
apps/web/app/[locale]/(platform-layout)/ai/…
apps/web/app/[locale]/(platform-layout)/accessibility/…
```

**Invariants:**

- URLs identical to today (`/en/ai`, not `/en/platform-layout/ai`).
- `[locale]/platform/` remains the **cross-workspace admin** tree (ads, platform recipes).
- `(auth)/` unchanged.

---

## 5. Decision C — Native multi-app workspace (commit)

**Structure:**

```text
apps/native/<app-code>/     # Expo workspace — own app.json, eas.json, package.json
packages/native-shell/      # @umbraculum/native-shell — shared bootstrap
```

First shipped app: `apps/native/brewery/` (migration from current `apps/native/` root). Additional apps are scaffold-only until product need + EAS strategy land.

`registerNativeModule()` wiring stays profile-driven ([`platform-module-profile.md`](../design/platform-module-profile.md)).

---

## 6. Decision D — Package on-disk tiers (commit)

Workspace globs:

```json
"packages/platform/*",
"packages/modules/*",
"packages/verticals/*/*"
```

Physical moves only — **no npm rename** at flip. [`REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) layer table remains authoritative for npm names.

Vertical reference packages stay `@umbraculum/brewery-*`. Third-party verticals publish under their org scope.

---

## 7. Decision F — Package content layering (commit)

**Platform npm packages must not own vertical or canonical-module domain code.**

| Source (today) | Target |
|----------------|--------|
| `@umbraculum/contracts` → `src/brewery/`, `src/water/`, `src/analysis/` | `@umbraculum/brewery-contracts` under `packages/verticals/brewery/contracts/` |
| `@umbraculum/ui` → `BrewCheckbox`, `HydrometerChart` | `@umbraculum/brewery-recipes-ui` or neutral rename |
| `@umbraculum/i18n` → brewery message keys | `verticals/brewery/i18n/` bundle (optional separate npm name) |

**Invariants:**

- `@umbraculum/contracts` root export contains **platform** wire types only after migration.
- `@umbraculum/pim-contracts` pattern is the template for `@umbraculum/brewery-contracts` — not “brewery types in platform contracts because brewery shipped first.”
- Pre-flip: **no re-export shims** from `@umbraculum/contracts` to brewery-contracts.
- Add `eslint-plugin-boundaries` elements on `packages/**` (`pkg-platform`, `pkg-module-contracts`, `pkg-vertical`) — see companion audit §6.7.

---

## 8. Decision E — E2E taxonomy (recommended)

Folder ownership mirrors §3–§6. Not required for public-alpha if deferral register entry includes reason code **R-SCOPE** and revisit trigger.

---

## 9. Alternatives considered

| Option | Rejected because |
|--------|------------------|
| Single tree under `packages/modules/<code>/` for web shell + pages (α layout) | RFC-0002 already rejected α for Next.js/Fastify entrypoints |
| Multiple operator web apps (`apps/web-brewery`, `apps/web-platform`) | Breaks one-shell / one-AI-context ([ROADMAP.md](../ROADMAP.md)) |
| Move brewery to `@brewery/*` npm scope in monorepo | Adds flip churn; integrators already expect `@umbraculum/brewery-*` prefix for reference vertical |
| Merge api + api-client packages | Violates client-safe boundary story (WS6) |
| Leave brewery DTOs in `@umbraculum/contracts` | Perpetuates platform/vertical confusion; contradicts RFC-0002 brewery contracts slice |
| Rename only npm scopes without on-disk tiers | `node_modules` improves slightly; repo map stays flat |
| Move `app/_shared-layout/` into an npm package by default | Shell is app-local Next.js composition + fork surface; horizontal code already lives in `@umbraculum/*` (see backbone §3.5) |
| Rename `app/_shared-layout/` before Wave 3f doc cleanup | Wave 1 needed a committed path for WS5; 3f sunsets slang in prose first, then may rename the folder |
| Adopt “shared layout components” or similar in new docs | Internal slang — use **shared layout** per §3.1 |

---

## 10. Implementation sequencing

See [`pre-flip-application-surface-backbone.md`](../design/pre-flip-application-surface-backbone.md) §9. RFC acceptance precedes Wave 1 merges.

**Ordered follow-ons (backbone §9, abbreviated):**

| After | Wave | Notes |
|-------|------|-------|
| Wave 1 (landed) | **2** | `(platform-layout)/` route group — **done (2026-06-07, absorbed into Wave 3f)** |
| Wave 3b (landed) | **3e** | API brewery service colocation under `modules/brewery/services/` — **complete (2026-06-06)** |
| **Wave 3e (complete)** | **3f** | **Shared layout nomenclature** — **complete (2026-06-07)** |
| Wave 3f (complete) | **6** | Doc capstone — **complete (2026-06-07)** |
| Wave 6 (complete) | **5** | E2E folder taxonomy — **complete (2026-06-07)** |

### 10.1 Wave 3f — shared layout nomenclature and path rename (complete 2026-06-07)

Wave **3f** landed the mechanical rename and documentation vocabulary in one PR:

1. **Paths:** `app/_shared-layout/` (from `_shell/`), `(platform-layout)/` route group for platform horizontal pages (`ai`, `accessibility`, …).
2. **Identifiers:** `web-platform-shared-layout` eslint element; `@umbraculum/module-sdk` nav/notice APIs; `NEXT_PUBLIC_WEB_SHARED_LAYOUT_NOTICE_ID`; i18n `sharedLayoutNotice.*`.
3. **Docs:** backbone §3.7 terminology contract; BUILDING-YOUR-VERTICAL decision tree; GLOSSARY split entries; zero legacy slang in integrator-facing prose.
4. **Out of scope (unchanged):** `@umbraculum/native-shell` package name; RFC-0011 title/filename; Wave **6** full BUILDING-YOUR-VERTICAL rewrite.

**Non-goals (honored):** re-export shims at old paths; “formerly called shell” redirect prose.

### 10.2 Wave 6 — doc capstone (complete 2026-06-07)

Integrator docs synced with post–Wave 3a/3c/3d reality:

1. [`REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) — tier prefixes, `(platform-layout)/`, vertical sub-packages, backbone cross-links.
2. [`BUILDING-YOUR-VERTICAL.md`](../BUILDING-YOUR-VERTICAL.md) — filesystem diagram, expanded decision tree, known-gap callouts.
3. [`GLOSSARY.md`](../GLOSSARY.md) — platform horizontal pages, canonical module segment, vertical route group; **workspace web UI** retained per §3.1.
4. [`docs-site/reference-sidebar-items.ts`](../../docs-site/reference-sidebar-items.ts) — brewery-contracts, brewery-i18n, brewery-media-assets.
5. [`apps/web/README.md`](../../apps/web/README.md), [`apps/native/README.md`](../../apps/native/README.md) — layering tree; native multi-app + `@umbraculum/native-shell` (Wave 4 complete — see §10.4).
6. Build log + §12 audit: [`rfc-0011-wave-6-doc-capstone-build-log.md`](../design/rfc-0011-wave-6-doc-capstone-build-log.md).

**§11 companion artifacts (Wave 6):** all rows above ticked.

### 10.3 Wave 5 — E2E folder taxonomy (complete 2026-06-07)

1. **`git mv`** 11 specs from `smoke/` + `brewday/` → `platform/`, `canonical/`, `verticals/brewery/`.
2. Playwright projects: `platform`, `canonical`, `verticals-brewery`.
3. [`apps/web/e2e/README.md`](../../apps/web/e2e/README.md), [`docs/TESTING.md`](../TESTING.md) L5 layer map updated.
4. [`packages/platform/test-mcp`](../../packages/platform/test-mcp/) — `--project=platform`, example `platform/auth.spec.ts`.
5. Rule 63 b2c/b2b filename prefixes **deferred**.

### 10.4 Wave 4 — native multi-app + `@umbraculum/native-shell` (complete 2026-06-07)

1. **`git mv`** `apps/native/` → `apps/native/brewery/` (`@umbraculum/native-brewery`); umbrella [`apps/native/README.md`](../../apps/native/README.md).
2. Extract shared bootstrap from brewery app → [`packages/platform/native-shell/`](../../packages/platform/native-shell/) (`auth`, `i18n`, `theme`, `components`, `bootstrap` subpaths).
3. Brewery app imports `@umbraculum/native-shell/*`; navigation + vertical screens remain in `apps/native/brewery/`.
4. CI/ci-parity/eslint/docs-site/README updates; `build:packages` includes native-shell.

**Deferred:** second native app scaffold (`apps/native/pim-floor/` etc.).

---

## 11. Resolution (amendment procedure)

Same as [RFC-0002 §12](0002-canonical-module-physical-layout.md): material changes re-trigger public comment post-alpha; forward-only application.

**Companion artifacts to update on acceptance:**

- [`REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) §3.1, §4
- [`BUILDING-YOUR-VERTICAL.md`](../BUILDING-YOUR-VERTICAL.md) filesystem diagram
- [`LINTING.md`](../LINTING.md) WS5 element table
- [`apps/web/README.md`](../../apps/web/README.md), [`apps/native/README.md`](../../apps/native/README.md)
