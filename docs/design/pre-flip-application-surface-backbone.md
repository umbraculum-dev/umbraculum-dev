# Pre-flip application-surface backbone — structural audit and target shape

**Tier:** Public  
**Status:** v0.1 — pre-flip planning (2026-06-06); companion to [RFC-0011](../rfcs/0011-application-surface-shell-layering.md)  
**Audience:** maintainers, integrators forking umbraculum-dev, agent executors, module authors  
**Related:** [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md) (β module slices), [REPOSITORY-STRUCTURE.md](../REPOSITORY-STRUCTURE.md), [BUILDING-YOUR-VERTICAL.md](../BUILDING-YOUR-VERTICAL.md), [application-surfaces-vs-platform-backbone.md](application-surfaces-vs-platform-backbone.md), [forkable-repo-cleanliness-audit.md](forkable-repo-cleanliness-audit.md)

> **Disclaimer.** This document diagnoses gaps between today's tree and the Magento-class separation integrators expect. It does not supersede RFC-0002's β module layout; it extends β to **shell layers** (shared UI/helpers, E2E, native app workspaces, package on-disk grouping) that RFC-0002 deliberately left unspecified.

---

## 1. Executive summary

| Area | Today | Problem | Target (backbone) |
|------|-------|---------|-------------------|
| **Module routes (web)** | `(brewery)/`, `(pim)/`, … under `[locale]/` | **Mostly fixed** after fork-cleanliness Part B (recipes consolidation) | Keep β; enforce module-local `_components` / `_lib` per route group |
| **Shell helpers (web)** | **`app/_shell/`** (platform) + `(brewery)/{_components,_lib}/` at route-group root | **Wave 1 done (2026-06-06)** — legacy flat `app/_components/`, `app/_lib/` removed | `(platform-shell)/` route group still pending (Wave 2) |
| **Platform pages (web)** | Flat `[locale]/ai`, `[locale]/accessibility`, … | No visual parity with `(auth)/` or `(pim)/` grouping | `(platform-shell)/` route group + `platform/` admin tree unchanged |
| **Native apps** | Single `apps/native/` Expo workspace | Name implies one app; ERP/manufacturing needs PIM scanner, warehouse handheld, brew-day, … | Multi-app under `apps/native/<app-code>/` + shared `@umbraculum/native-shell` package |
| **E2E** | Flat `smoke/` + `brewday/` | No ownership signal for platform vs canonical vs vertical | Mirror module taxonomy under `e2e/{platform,canonical,verticals}/` |
| **Packages (on disk)** | Flat `packages/*` (19 siblings) | Horizontal, SDK, canonical contracts, and brewery vertical at same level; folder names disagree with npm names | On-disk tiers + align paths with npm + split brewery out of platform packages |
| **Packages (content)** | Brewery DTOs in `@umbraculum/contracts`; `BrewCheckbox` in `@umbraculum/ui` | Platform packages contain vertical logic/content — same class of bug as `app/_components` | `@umbraculum/brewery-contracts`; purge vertical leakage from platform packages |
| **Website** | `apps/website/` in monorepo | Wrong audience for forkable product repo | Sister repo **`umbraculum-website`** (private OK pre-flip) — see website extraction plan |
| **`apps/web` without verticals** | Present with platform profile | **Yes — stays.** Shared layout, auth, canonical modules, AI, accessibility remain | Document as the **member-facing web application**, not “brewery app” |

**Bottom line:** RFC-0002 solved **where module pages live**. This epic solves **where everything else lives** so a forked tree reads like Magento's `vendor/` + `app/code/` + `app/design/` mental model without splitting the member-facing web app into two deployables.

---

## 2. Magento mapping (pedagogical — not identity)

Integrators already have this table in [BUILDING-YOUR-VERTICAL.md](../BUILDING-YOUR-VERTICAL.md). Extend it to **filesystem** layers:

| Magento 2 | Umbraculum layer | Target path (post-backbone) |
|-----------|------------------|----------------------------|
| `vendor/magento/*` (framework, module-* ) | Horizontal platform + SDK | `packages/platform/*`, `services/api/src/platform/`, `services/api/src/routes/{auth,workspaces,…}` |
| `vendor/magento/module-catalog` (domain module) | Canonical module | β slices: `services/api/src/modules/<code>/`, `(code)/`, `packages/<code>-contracts/` |
| `Magento_SampleData*` | Reference vertical | `brewery` β slices + `@umbraculum/brewery-*` + `packages/verticals/brewery/` |
| `app/code/Vendor/Module` | Integrator vertical (Tier 6) | **Your repo** — same β shape |
| `app/design/frontend/` | Shell theming / layout overrides | `apps/web/app/_shell/` (platform) + future theme package |
| `app/etc/config.php` module enable | Boot registration | `registerModule()` / `UMBRACULUM_MODULE_PROFILE` |

**What Magento has that we lack today:** platform vs brewery shell ownership is now obvious via `app/_shell/` vs `(brewery)/_components|_lib` (Wave 1). Remaining gap: flat `[locale]/ai`, `[locale]/accessibility`, … vs `(platform-shell)/` grouping (Wave 2).

---

## 3. `apps/web` — shell layering (primary gap)

### 3.1 What is already correct

- **Module pages** live under `[locale]/(<code>)/<segment>/` per RFC-0002.
- **Brewery recipe implementation** consolidated to `(brewery)/recipes/**` (fork-cleanliness Part B, 2026-06).
- **WS5 eslint** fences `(pim|mrp|crp|brewery|automation)` from cross-importing sibling verticals.
- **`(auth)/`** is the canonical example of a platform route group with sub-segments only.

### 3.2 What is still mixed

| Path | Examples | Should be |
|------|----------|-----------|
| ~~`app/_components/` / `app/_lib/`~~ | ~~Mixed platform + brewery~~ | **Done (Wave 1)** — `app/_shell/` + `(brewery)/{_components,_lib}/` |
| `[locale]/ai`, `[locale]/accessibility`, `[locale]/about`, … | Platform horizontal features at flat `[locale]/<segment>/` | `(platform-shell)/<segment>/` route group (URLs unchanged) — **Wave 2** |
| `[locale]/platform/` | Cross-workspace admin (ads, platform recipes) | **Keep** — distinct from shared layout / module routes; docs call this **platform admin** |

### 3.3 Target web tree (member-facing web application)

```text
apps/web/app/
  _shell/                              # Platform shared layout — path name; see §3.5–§3.6
    _components/                       # Nav, footer, auth status, …
    _lib/                              # webApiClient, sessionAuthUx, registerPlatformSegments, …
  [locale]/
    (platform-shell)/                  # Route group — no URL prefix
      ai/
      accessibility/
      about/
      contact/
      contributing/
      i18n-contributing/
    (auth)/                            # unchanged
    (automation)/                      # canonical modules — unchanged
    (brewery)/
      _components/                     # Brewery-only shared route components (moved from app/_components)
      _lib/                            # breweryWaterClient, grist, … (moved from app/_lib)
      recipes/ …
    (pim)/ …
    (mrp)/ …
    (crp)/ …
    platform/                          # Admin cross-workspace — unchanged URL /platform/*
  layout.tsx, globals.css, …           # App root — unchanged
```

**Rules (enforceable):**

1. **`_shell/` may not import from `(brewery)/`, `(pim)/`, …** — WS5 extension.
2. **Module route groups own `_components/` and `_lib/` at group root** when shared across segments within that module (PIM already has local `_components` under some segments; standardize on group root).
3. **Vertical-specific UI belongs in `@umbraculum/brewery-recipes-ui`** when shared across web **and** native — app tree holds adapters/pages only.
4. **URLs unchanged** — same discipline as RFC-0006 (route groups are structural).

### 3.4 Will `apps/web` exist without verticals?

**Yes.** With `UMBRACULUM_MODULE_PROFILE=platform`:

- Shared layout folder (`_shell/`), `(auth)/`, `(platform-shell)/`, canonical modules, and `platform/` admin remain.
- `(brewery)/` routes and brewery nav entries are not registered ([platform-module-profile.md](platform-module-profile.md)).
- Integrators still need `apps/web` as the **member-facing web application** (workspace members' daily UI) — comparable to Magento admin, not the reference vertical.

### 3.5 Terminology policy — sunset internal slang

RFC-0011 and early backbone drafts used **informal product slang** that overloads ordinary English and familiar IT terms. That vocabulary is **deprecated in new and revised documentation**. Prefer **standard software-engineering and Next.js terms** that appear in textbooks, framework docs, and Google results — so contributors without prior Umbraculum context can read the tree cold.

**Do not introduce or perpetuate in prose** (sunset list — non-exhaustive):

| Deprecated slang | Why it fails | Write instead (conventional) |
|------------------|--------------|------------------------------|
| **Operator shell**, **application shell** (product sense) | Ambiguous with OS/command shell; not a standard product-architecture term | **Member-facing web application** (`apps/web`); **workspace web UI** |
| **Operator chrome**, **app chrome**, **platform chrome** | Browser-industry jargon; not defined in this repo's glossary | **Shared layout**, **shared layout components**, **application frame** (nav, footer, auth bar) |
| **Shell** alone in architecture docs | Collides with POSIX shell, IDE shell, "shell component" blog posts | Name the thing: **command-line shell**, **`app/_shell/` directory** (filesystem path), **layout**, **route group** |
| Invented compounds (`platform-shell` in prose) | Sounds official but is not framework vocabulary | **Next.js route group** `(platform-shell)/` when citing the path; **platform horizontal pages** when describing product |

**Allowed exceptions (not prose slang):**

- **Filesystem paths and code identifiers** committed before rename — e.g. `app/_shell/`, WS5 element `web-platform-shell`, `WebShellNotice`, `@umbraculum/native-shell` — must be explained once using conventional terms (see §3.6).
- **Legacy [`GLOSSARY.md`](../GLOSSARY.md) entry "Operator shell"** — retained until Wave **3f** / Wave **6** glossary sync; new docs should use the "Write instead" column above and link here.

**Wave 3f deliverable (with RFC-0011 §10.1):** (1) grep docs for sunset terms and replace in integrator-facing files; (2) optionally rename `app/_shell/` to a path whose name is self-explanatory (e.g. `_shared-layout/`); (3) update [`BUILDING-YOUR-VERTICAL.md`](../BUILDING-YOUR-VERTICAL.md) with the conventional vocabulary only.

RFC-0011 §3.1 restates this policy at decision level.

### 3.6 What `app/_shell/` is — placement and why it is not in `node_modules`

**Short definition:** `apps/web/app/_shell/` holds **platform-owned shared layout code** — navigation, footer, authentication UI, and helpers used across locales and modules — **not owned by any module route group** (`(brewery)/`, `(pim)/`, …). It is **not** a command-line shell, **not** part of the brewery vertical, and **not** hidden framework core.

| Layer | Path | Role | Under `[locale]/`? |
|-------|------|------|-------------------|
| **Platform shared layout** | `app/_shell/{_components,_lib}/` | `PrimaryNav`, `Footer`, `webApiClient`, auth UX, segment registration — horizontal, profile-agnostic | **No** — same layout for every locale; locale is applied inside components (`next-intl`) and in `[locale]/layout.tsx` |
| **Module shared UI** | `app/[locale]/(<code>)/{_components,_lib}/` | Module-only shared components and helpers (e.g. `(brewery)/_components/recipe-edit/`, `breweryWaterClient.ts`) | **Yes** — lives in the App Router tree next to that module's routes |
| **Module pages** | `app/[locale]/(<code>)/<segment>/` | Routable pages (`/en/recipes`, `/en/products`, …) | **Yes** — `[locale]` is a URL segment |
| **Cross-surface vertical UI** | `@umbraculum/<vertical>-*` packages | Shared when web **and** native need the same widget | npm package — not app tree |

**Why `_shell/` sits beside `[locale]/`, not inside it**

1. **Next.js App Router:** `[locale]/` is a **URL segment** (`/en/…`, `/it/…`). `_shell/` is **not a route** — the leading underscore marks a **private folder** ([Next.js project structure](https://nextjs.org/docs/app/getting-started/project-structure#private-folders); omitted from URLs). It holds components imported by `[locale]/layout.tsx`. Nesting under `[locale]/_shell/` would duplicate the same layout code per locale folder with no URL benefit.
2. **Ownership:** `(brewery)/` is a **route group** for one module/vertical. `_shell/` is **platform-owned** and must remain when `UMBRACULUM_MODULE_PROFILE=platform` disables brewery routes. Module-shared code belongs under `(brewery)/`; platform shared layout belongs outside every module fence.
3. **Dependency direction (WS5):** Module code may import `_shell/` (e.g. `useRequireAuth`). `_shell/` must **not** import `(brewery)/` or sibling modules — enforced by the `web-platform-shell` eslint element (identifier name is legacy; means **platform shared layout folder**).

`[locale]/layout.tsx` importing from `../_shell/_components` is intentional: the **locale layout wraps routed page content with shared layout components**.

**Why the folder is still named `_shell/` (temporary)**

Wave 1 committed this path per RFC-0011 Decision A. The name is **misleading** (see §3.5). Wave **3f** may rename the directory after docs adopt conventional terms. Until then, treat **`_shell/` as a filesystem label only**, not vocabulary for architecture discussions.

**Why shared layout code lives in `apps/web/app/`, not `node_modules/`**

`_shell/` is **application composition**, not a publishable library:

- It wires **this** Next.js app's layouts, relative imports, env-driven notices, and Tamagui provider to **this** repo's `[locale]/` tree. Reusable behavior already lives in `@umbraculum/{ui,navigation,i18n-react,api-client,contracts,…}` — `_shell/` is the thin **app-local adapter layer** that imports those packages.
- **Forkability:** integrators fork `apps/web` and edit shared layout components without publishing a private npm package or patching `node_modules`.
- **Single deployable:** RFC-0011 keeps one member-facing web app (`apps/web`); moving shared layout into npm would add release coupling without a second web deployable today. (Native is different: `@umbraculum/native-shell` is a **package name** for shared bootstrap across **multiple** Expo apps — Decision C; package rename may follow 3f.)
- **WS5** maps the `web-platform-shell` eslint element to a **filesystem path inside the app** so import boundaries stay enforceable.

Promote code from `_shell/` to `@umbraculum/*` when it is **reusable across repositories** with no Next.js layout coupling — not by default for all shared UI.

---

## 4. `apps/native` — multi-app workspace model

### 4.1 Problem

`apps/native/` is one Expo app (`@umbraculum/native`) whose README describes “the native application.” In manufacturing/ERP you routinely ship **multiple mobile apps** against one backend: brew-day, warehouse scanner, PIM floor app, maintenance handheld.

### 4.2 Target shape

```text
apps/native/
  brewery/                    # @umbraculum/native-brewery — brew-day (current app)
    App.tsx, app.json, …
    src/modules/brewery/ …
  # future examples (scaffold only pre-flip):
  # pim-floor/                # @umbraculum/native-pim-floor
  # wms-scanner/                # @umbraculum/native-wms-scanner

packages/native-shell/        # @umbraculum/native-shell (NEW)
  auth/, navigation/, i18n/, theme/, bootstrap
```

**Shared extraction:** Move today's `apps/native/src/{auth,navigation,i18n,theme,bootstrap,components}` into `@umbraculum/native-shell`. Each app workspace depends on shell + selected module native slices.

**Registration:** Each app calls `registerPlatformNativeModules({ modules: ['brewery'] })` (or subset) — already partially profile-driven.

**Flip posture:** Pre-flip can land **folder rename + shell package extraction** with one shipping app (`brewery/`). Additional app workspaces are **scaffold + README** only — proves extensibility without EAS multiplication on day one.

### 4.3 Relationship to RFC-0002 native slice

RFC-0002 native slice path **`apps/native/src/modules/<code>/`** becomes **`apps/native/<primary-app>/src/modules/<code>/`** OR module code moves to **`packages/<code>-native/`** when shared across multiple native apps. Decision in RFC-0011: prefer **per-app `src/modules/<code>/`** for app-specific navigation; promote to package when second app reuses screens.

---

## 5. `apps/web/e2e` — test ownership mirrors product layers

### 5.1 Today

```
apps/web/e2e/
  smoke/          # mixed: auth, dashboard, mrp-crp, recipes, water, ai
  brewday/        # brewery vertical
```

### 5.2 Target

```text
apps/web/e2e/
  platform/       # auth, select-workspace, dashboard, ai-pages
  canonical/      # mrp-crp-read-only, mrp-crp-export, pim-when-added
  verticals/
    brewery/      # recipe-list, water-*, brewday/*
  support/        # unchanged fixtures
```

Playwright config uses projects/tags matching folders. **Not a flip blocker** if deferred — log in [public-flip-deferral-register.md](public-flip-deferral-register.md) with **R-SCOPE** if needed.

---

## 6. `packages/` — the same mixing problem as `apps/web`

The flat `packages/` tree repeats the shell-layer confusion at the **npm workspace** layer. [REPOSITORY-STRUCTURE.md](../REPOSITORY-STRUCTURE.md) §2 defines five logical layers, but on disk all 19 workspaces sit as siblings — and several **platform-classified** packages still contain brewery-vertical code.

### 6.1 Inventory — what lives where today

| On-disk path | npm name | Declared layer | Actual ownership signal |
|--------------|----------|----------------|-------------------------|
| `packages/ui/` | `@umbraculum/ui` | Horizontal (L3) | **Leaked:** `BrewCheckbox`, `HydrometerChart` |
| `packages/navigation/` | `@umbraculum/navigation` | Horizontal (L3) | Clean |
| `packages/i18n/` | `@umbraculum/i18n` | Horizontal (L3) | **Leaked:** brewery + MRP/CRP copy in same `en.json` |
| `packages/i18n-react/` | `@umbraculum/i18n-react` | Horizontal (L3) | Clean (bindings only) |
| `packages/i18n-keys/` | `@umbraculum/i18n-keys` | SDK (L5) | Clean |
| `packages/api-client/` | `@umbraculum/api-client` | Horizontal (L3) | Clean |
| `packages/media/` | `@umbraculum/media` | Horizontal (L3) | **Leaked:** brewery asset content (documented deferral) |
| `packages/rendering/` | `@umbraculum/rendering` | Horizontal (L3) | Clean (BeerJSON proof is consumer, not owner) |
| `packages/test-mcp/` | `@umbraculum/test-mcp` | Dev tooling | Clean |
| `packages/contracts/` | `@umbraculum/contracts` | Platform contracts (L4) | **Was leaked** — `src/brewery/`, `src/water/`, `src/analysis/` moved to `@umbraculum/brewery-contracts` (Wave 3b, 2026-06-06) |
| `packages/brewery-contracts/` | `@umbraculum/brewery-contracts` | Vertical contracts (L4) | **Clean** — RFC-0002 β fourth slice for `brewery` |
| `packages/module-sdk/` | `@umbraculum/module-sdk` | SDK (L5) | Clean |
| `packages/ai-tool-sdk/` | `@umbraculum/ai-tool-sdk` | SDK (L5) | Clean |
| `packages/automation-contracts/` | `@umbraculum/automation-contracts` | Canonical (L4) | Clean — **good pattern** |
| `packages/pim-contracts/` | `@umbraculum/pim-contracts` | Canonical (L4) | Clean |
| `packages/mrp-contracts/` | `@umbraculum/mrp-contracts` | Canonical (L4) | Clean |
| `packages/crp-contracts/` | `@umbraculum/crp-contracts` | Canonical (L4) | Clean |
| `packages/core/` | `@umbraculum/brewery-core` | Vertical (L5) | **Trap:** folder says `core`, npm says `brewery-core` |
| `packages/beerjson/` | `@umbraculum/brewery-beerjson` | Vertical (L5) | **Trap:** folder omits `brewery-` prefix |
| `packages/recipes-ui/` | `@umbraculum/brewery-recipes-ui` | Vertical (L5) | **Trap:** folder omits `brewery-` prefix |

**Magento parallel:** this is like finding `Magento\Catalog` classes under `vendor/magento/framework/` because “we haven't split the package yet.” Canonical modules already follow the right pattern (`pim-contracts/` → `@umbraculum/pim-contracts`). Brewery and platform do not.

### 6.2 Failure modes (why this blocks integrators)

1. **Path vs npm cognitive load.** `cd packages/core` installs `@umbraculum/brewery-core` — the bare `@umbraculum/core` name is *reserved* for future platform-core ([trap-avoidance](../REPOSITORY-STRUCTURE.md) §3.6). New contributors grep `packages/core` expecting platform backbone.

2. **Platform contracts absorb vertical DTOs.** ~~`@umbraculum/contracts` exports brewery route schemas…~~ **Resolved Wave 3b** — brewery wire types now live in `@umbraculum/brewery-contracts`; platform `@umbraculum/contracts` is cross-cutting only (no re-export shims). Remaining symmetry gap: **`services/api/src/services/` and `domain/`** still host brewery logic outside `modules/brewery/` (§6.8).

3. **Horizontal UI carries vertical nouns.** `@umbraculum/ui` exports `BrewCheckbox` and hydrometer charts. A distillery integrator importing `@umbraculum/ui` for primitives inherits brewing-named components — the opposite of “industry-agnostic by construction.”

4. **Flat listing hides opt-out.** F-mod `UMBRACULUM_MODULE_PROFILE=platform` can skip brewery at **runtime registration**, but `npm ls` and `packages/` still show brewery workspaces peered with `navigation` — no filesystem story for “sample data module.”

5. **eslint / boundaries gap.** WS5 covers `apps/web` and `apps/native`; there is no equivalent **`eslint-plugin-boundaries` tier fence on `packages/**`** preventing `@umbraculum/ui` from importing `@umbraculum/brewery-recipes-ui` or `@umbraculum/contracts` from growing new vertical subtrees without review.

### 6.3 Target on-disk shape

```text
packages/
  platform/                         # Layer 3 — industry-agnostic ONLY
    ui/
    navigation/
    i18n/                           # platform message roots only (after content split)
    i18n-react/
    api-client/
    contracts/                      # platform wire types ONLY (auth, workspaces, billing, ai, rendering, …)
    rendering/
    media/                          # loader framework; vertical assets under verticals/
    native-shell/                   # NEW — extracted from apps/native
    test-mcp/
  modules/                          # Layer 4–5 — SDK + canonical *-contracts
    module-sdk/
    ai-tool-sdk/
    i18n-keys/
    automation-contracts/
    pim-contracts/
    mrp-contracts/
    crp-contracts/
  verticals/
    brewery/                        # Tier-6 reference vertical — ALL brewery npm packages here
      core/                         # @umbraculum/brewery-core  (rename from packages/core)
      beerjson/                     # @umbraculum/brewery-beerjson
      recipes-ui/                   # @umbraculum/brewery-recipes-ui
      contracts/                    # @umbraculum/brewery-contracts  (NEW — see §6.4)
      i18n/                         # optional: brewery locale bundles split from platform i18n
      media-assets/                 # optional: brewery-only manifest assets
```

Root workspaces:

```json
"packages/platform/*",
"packages/modules/*",
"packages/verticals/*/*"
```

**npm names:** stable through Wave 3a (physical tier move only). Wave 3b+ aligns folder names under `verticals/brewery/` with npm without changing published names.

### 6.4 Target content split — `@umbraculum/brewery-contracts`

Align brewery with canonical modules (RFC-0002 contracts slice):

| Move from `@umbraculum/contracts` | Destination |
|-----------------------------------|-------------|
| `src/brewery/**` | `@umbraculum/brewery-contracts` |
| `src/water/**` | `@umbraculum/brewery-contracts` (brewery water chemistry — not horizontal) |
| `src/analysis/**` | `@umbraculum/brewery-contracts` (gravity analysis — brewery domain) |

**Keep in `@umbraculum/contracts` (platform):** `auth/`, `workspaces/`, `billing/`, `ads/`, `ai/`, `integrations/`, `platformAdmin/`, `webhooks/`, `health/`, `rendering/`, cross-cutting `format/`.

**Pre-flip posture:** pre-release — **no re-export shims**. Update `@umbraculum/api-client` and apps to import brewery wire types from `@umbraculum/brewery-contracts` directly. Same discipline as deleting legacy `apps/web/app/recipes/` re-exports.

### 6.5 Target content split — horizontal package purity

| Package | Action |
|---------|--------|
| `@umbraculum/ui` | Move `BrewCheckbox` → `@umbraculum/brewery-recipes-ui` or rename to neutral primitive if truly horizontal; move `HydrometerChart` → brewery package |
| `@umbraculum/i18n` | Split locale JSON: platform + canonical keys stay; brewery keys → `verticals/brewery/i18n/` (or `@umbraculum/brewery-i18n` bundle) |
| `@umbraculum/media` | Split manifest: framework loader stays; brewery images → vertical assets package |
| `@umbraculum/api-client` | Optional subpath exports: `./platform`, `./brewery`, `./pim` |

### 6.6 npm scope questions (recap)

**Should vertical packages leave `@umbraculum/`?** Keep `@umbraculum/brewery-*` for the **reference vertical** in this monorepo. Integrator verticals publish under **their org scope** (`@acme/distillery-*`). On-disk `verticals/brewery/` makes reference vertical visually optional; npm scope alone does not.

**Should `@umbraculum/api` + `@umbraculum/api-client` merge?** **No** — service workspace vs client SDK; WS6 client-safe story requires the split.

### 6.7 Package-layer eslint (new — mirrors WS5)

Add `eslint-plugin-boundaries` elements on `packages/**`:

| Element | Pattern | Rule |
|---------|---------|------|
| `pkg-platform` | `packages/platform/**` | Must not import `pkg-vertical` or `pkg-module-contracts` except via explicit allowlist for boot glue |
| `pkg-module-contracts` | `packages/modules/*-contracts/**` | Must not import `pkg-vertical` |
| `pkg-vertical` | `packages/verticals/**` | May import `pkg-platform` + relevant `pkg-module-contracts`; never sibling vertical |

Spike doc: `docs/design/solid-boundaries-eslint-packages-spike.md` (to author in Wave 3d).

### 6.8 `services/api` — the same mixing problem (symmetry with §6)

RFC-0002 β layout landed **module routes** under `services/api/src/modules/<code>/`, but brewery **domain services** still sit in legacy horizontal trees beside platform code — the same category mistake as `@umbraculum/contracts` owning brewery wire types before Wave 3b.

#### 6.8.1 Inventory — brewery code outside `modules/brewery/`

| On-disk path | Declared owner | Actual signal |
|--------------|----------------|---------------|
| `services/api/src/modules/brewery/routes/` | Brewery module | **Correct** — Fastify route registration |
| `services/api/src/modules/brewery/services/` | Brewery module | **Partial** — e.g. `waterCalcService.ts`, `waterCalc/*` live here |
| `services/api/src/services/recipeWaterHub/` | *(none — flat `services/`)* | **Leaked:** hub-summary builders (`recipeWaterHubBoilSummary.ts`, mash/sparge/merged, …) — brewery-only |
| `services/api/src/services/recipeWaterHubSummaryService.ts` | *(flat `services/`)* | **Leaked:** orchestrates brewery water-hub reads |
| `services/api/src/services/recipeWaterCompute/` | *(flat `services/`)* | **Leaked:** mash/sparge/boil compute-and-save ops — brewery-only |
| `services/api/src/domain/waterCalc/` | *(flat `domain/`)* | **Leaked:** shared water-chemistry math consumed by brewery routes **and** by `recipeWaterHub` / `recipeWaterCompute` under `services/` |
| `services/api/src/domain/recipeAnalysis/` | *(flat `domain/`)* | **Leaked:** gravity / efficiency analysis attached to `GET /recipes/:id` |

**Magento parallel:** routes live under `module-catalog`, but half the catalog service layer still sits under `app/code/Magento/Framework/` because the split stopped at controllers — integrators grep `src/services/` expecting platform-only helpers and hit brewery math.

#### 6.8.2 Failure modes

1. **Dual homes for the same vertical.** Water calc exists under both `modules/brewery/services/waterCalc/` and `domain/waterCalc/` + `services/recipeWaterCompute/` — no single “brewery module service root.”
2. **F-mod opt-out is incomplete at the filesystem layer.** `UMBRACULUM_MODULE_PROFILE=platform` can skip brewery route registration, but `src/services/recipeWaterHub/` and `src/domain/recipeAnalysis/` remain visible in tree listings and import graphs.
3. **Boundary enforcement gap.** WS5 covers `apps/**`; there is no **`services/api/src/modules/**` vs `services/api/src/{services,domain}/**` eslint fence** preventing new brewery helpers from landing in flat trees “because it's closer to the route.”

#### 6.8.3 Target shape (filesystem clarity — HTTP paths unchanged)

```text
services/api/src/
  platform/              # horizontal services (auth, billing, rendering queue, …)
  modules/
    brewery/
      routes/            # exists today
      services/          # consolidate ALL brewery service + domain logic here
        waterCalc/
        recipeWaterHub/
        recipeWaterCompute/
        recipeAnalysis/
    pim/
    …
  routes/                # legacy platform route entry files — migrate toward platform/ over time
```

**Explicit non-goals for Wave 3b:** moving these trees — Wave 3b only extracted `@umbraculum/brewery-contracts`. Service colocation is a **follow-on wave** (proposed **3e** in §9).

No change to HTTP paths — filesystem clarity only.

---

## 7. Sister repos and out-of-monorepo surfaces

| Item | Action | Plan reference |
|------|--------|----------------|
| `apps/website/` | Extract to **`umbraculum-website`** (private repo OK) | Update website sister-repo plan name from `umbraculum-marketing` |
| `docs-site/` | **Keep** in monorepo through flip | deferral register R-POLICY |
| Forum/demo VPS | Already in hosting repos | production-hosts.md |

---

## 8. Relationship to completed / in-flight work

| Work | Status | Backbone relationship |
|------|--------|----------------------|
| Fork-cleanliness Part B (brewery recipes tree) | **Done** | Prerequisite — module routes correct |
| SOLID WS5/WS6 | **Closed** | **`web-platform-shell` + `web-brewery-shared` WS5 elements landed (Wave 1)** |
| F-mod brewery optional profile | **Phase 1 shipped** | Backbone makes opt-out visually obvious |
| Website sister repo | **Ready to implement** | Independent track; rename to `umbraculum-website` |
| RFC-0002 β layout | **Accepted** | Unchanged — this doc extends, not replaces |

---

## 9. Proposed execution waves (no deadline pressure)

```mermaid
flowchart TB
  W0[RFC-0011 accept + this doc]
  W1[Web shell split: _shell vs brewery _components/_lib]
  W2[platform-shell route group for ai/accessibility/about]
  W3a[packages tier folders]
  W3b[brewery-contracts extract]
  W3c[platform package purity ui/i18n/contracts]
  W3d[package eslint boundaries]
  W3e[api brewery services colocate]
  W3f[docs: sunset shell slang + optional _shell rename]
  W4[native-shell package + apps/native/brewery rename]
  W5[e2e folder taxonomy]
  W6[WS5 + REPOSITORY-STRUCTURE + BUILDING-YOUR-VERTICAL sync]
  W0 --> W1 --> W2
  W0 --> W3a --> W3b --> W3c
  W3a --> W3d
  W3b --> W3e
  W3e --> W3f
  W1 --> W6
  W2 --> W6
  W3c --> W6
  W3d --> W6
  W4 --> W6
  W5 --> W6
```

| Wave | Deliverable | Est. | Flip blocker? |
|------|-------------|------|---------------|
| **0** | RFC-0011 + this doc reviewed | 1–2d | No — but sets backbone |
| **1** | Move brewery files out of `app/_components`, `app/_lib`; introduce `app/_shell/` | 2–4d | **Done (2026-06-06)** — child plan `rfc-0011_wave_1_web_shell_3435eb19.plan.md` |
| **2** | `(platform-shell)/` route group; move ai/accessibility/about/contact | 1–2d | Recommended |
| **3a** | Physical move to `packages/{platform,modules,verticals}/`; workspace globs | 2–3d | Optional pre-flip |
| **3b** | Create `@umbraculum/brewery-contracts`; migrate `contracts/src/{brewery,water,analysis}` | 3–5d | **Recommended** — closes RFC-0002 gap |
| **3c** | Purge vertical leakage from `@umbraculum/ui`, split `@umbraculum/i18n` content | 2–4d | Recommended |
| **3d** | Package-layer eslint boundaries + spike doc | 1–2d | Follows 3a |
| **3e** | Colocate brewery API services — move `src/services/recipeWaterHub*`, `recipeWaterCompute/`, `domain/waterCalc/`, `domain/recipeAnalysis/` under `modules/brewery/services/` (§6.8) | 2–3d | Recommended — same integrator confusion as pre-3b packages |
| **3f** | **Documentation vocabulary + optional path rename:** sunset slang (`operator shell`, `operator chrome`, prose uses of “shell”) per §3.5; adopt conventional terms in BUILDING-YOUR-VERTICAL; optionally rename `apps/web/app/_shell/` to a self-explanatory path | 0.5–1d | No — docs-first; folder rename optional |
| **4** | `@umbraculum/native-shell` + `apps/native/brewery/` | 3–5d | Optional pre-flip — scaffold second app README |
| **5** | E2E folder taxonomy | 1d | No |
| **6** | Docs + eslint + module READMEs | 1d | Yes for changed waves |

**Parallel track:** website → `umbraculum-website` extraction (existing plan).

---

## 10. Verification gates (per wave)

- `./scripts/ci-parity-check.sh --archive run` (lint + typecheck when TS paths change)
- `npm run check-web-url-segments` after any `[locale]/` moves
- WS5: zero `boundaries/element-types` violations after `_shell/` element added
- Playwright smoke on touched segments
- `python3 scripts/docs/check-readmes.py` when module READMEs change

---

## 11. Open questions for maintainer decision

1. **Route group name:** `(platform-shell)/` vs `(platform)/` — latter collides mentally with `[locale]/platform/` admin. Prefer **`(platform-shell)/`** or **`(shell)/`**.
2. **Native multi-app CI:** one EAS project per app vs monorepo matrix — defer to [NATIVE-STRATEGY-AND-CI.md](../NATIVE-STRATEGY-AND-CI.md) amendment.
3. **On-disk package move (Wave 3a):** before flip (cleaner first fork) vs after (less churn now).
4. **`brewery-contracts` extraction (Wave 3b):** pre-flip vs post-flip — pre-flip aligns public seed with RFC-0002 text.
5. **Integrator doc:** update BUILDING-YOUR-VERTICAL with “shell vs module vs vertical” filesystem diagram after Wave 1.
6. **`app/_shell/` path and doc vocabulary (Wave 3f):** sunset **operator shell**, **operator chrome**, and similar internal slang (§3.5); use conventional IT / Next.js terms in integrator docs; optional folder rename after prose is fixed.

---

## 12. Success criteria (epic complete)

1. A new contributor can open `apps/web/app/` and identify **platform shell**, **platform pages**, **canonical module**, and **vertical** folders without reading chat history.
2. `grep Brew app/_shell` returns zero — brewery naming only under `(brewery)/` or `@umbraculum/brewery-*`.
3. `grep brewery packages/platform` returns zero — no vertical subtrees under platform packages.
4. `@umbraculum/brewery-contracts` exists; `@umbraculum/contracts` root export has no brewery/water/analysis paths.
5. Native README describes **multi-app workspace** pattern with one reference app shipped.
6. [REPOSITORY-STRUCTURE.md](../REPOSITORY-STRUCTURE.md) and RFC-0011 cross-link this doc; deferral register lists anything intentionally post-flip.
