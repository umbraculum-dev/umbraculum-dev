# Building your vertical on Umbraculum

**Tier:** Public  
**Status:** v1.1 — RFC-0011 Wave 6 sync (2026-06-07)  
**Audience:** integrators, ISVs, and in-house teams building **product X** on Umbraculum — especially when product X is **not** a brewery and you want to know how that differs from the reference vertical shipped in this repo.

> **Two questions this page answers**
>
> 1. **"How do I start building my vertical on top of Umbraculum?"**
> 2. **"I'm building product X and don't need brewery — how do I uninstall / omit it?"**

Terminology (*vertical*, *canonical*, *reference vertical*): [`GLOSSARY.md`](GLOSSARY.md). Ecosystem vocabulary and catalog: [`MODULES.md`](MODULES.md).

---

## The Magento 2 mental model (parallel, not identity)

Many integrators learned ecommerce on **Magento Open Source**: install **core**, optionally install **sample data**, then ship **your modules** in a **merchant project** that is not the Magento core repo.

Umbraculum uses the **same three-layer idea** with different packaging today:

| Magento 2 (familiar) | Umbraculum (name) | Typical home | In `umbraculum-dev` today? |
|---|---|---|---|
| Magento Open Source **core** + framework (`magento/product-community-edition`, `magento/framework`, …) | **Horizontal platform** — auth, workspace, billing, AI, i18n, shared layout, rendering | Vendor / platform repo | **Yes** — shared |
| Standard domain modules shipped with the suite (Catalog, Customer, Inventory, …) — *peer domains, not "industry verticals"* | **Canonical modules** — `pim`, `mrp`, `wms`, `crm`, `automation`, `crp` | Platform repo | **Yes** — shared |
| **`Magento_SampleData*`** modules (Luma demo products, widgets, …) — reference/demo, **not** your merchant product | **`brewery` reference vertical** — demo domain data, BeerJSON, brew-day UX, `@umbraculum/brewery-*` packages | *Should* be optional like sample data | **Co-shipped in monorepo** (see gap below) |
| **Your agency module** — `vendor/module-acme-checkout`, theme, integrations in the **merchant project** | **Your vertical configuration** — `code: "distillery"`, `@acme/distillery-*`, your β slices | **Your repo** + your deploy | **Usually no** |
| `composer require vendor/module-foo` + enable module in `config.php` | Pin `@umbraculum/module-sdk` + your vertical npm package; register at API/web/native boot | Merchant / integrator stack | **Target** (partially manual today) |
| Disable / remove sample data modules; merchant stack without demo catalog | Omit brewery from boot + schema + nav | Integrator deployment | **Target** (custom build today) |

**One-line parallel**

> **Magento:** `composer require` core → skip or remove sample data → add your modules in the merchant project.  
> **Umbraculum (intent):** depend on platform + canonical modules → omit reference vertical → register **your** vertical from **your** repo.

**Where we are honest:** Magento has had a clean **optional sample-data** story for years. Umbraculum's **reference vertical is still wired like core** in the stock monorepo build — that is a **known product gap**, not the long-term model. [`GLOSSARY.md`](GLOSSARY.md) FAQ #5; [§ Question 2 — Running without brewery (today vs target)](#question-2--running-without-brewery-today-vs-target) below.

Practitioner context (stewardship, agency-owned stacks): [`design/ecosystem-case-study-adobe-magento.md`](design/ecosystem-case-study-adobe-magento.md). Odoo/Omnis "core vs vertical product" parallels: [`GLOSSARY.md`](GLOSSARY.md) §"Where code lives".

---

## Question 1 — How do I start building my vertical?

### What you are building

A **vertical configuration** (Tier 6) is **your product** — the industry-specific operator experience, seed data, prompts, and packages that sit **on top of** shared canonical modules. It is **not** a new canonical domain; it is **not** a fork of Umbraculum core.

Plain language: *you use Umbraculum as backbone; you ship product X separately.*

### Recommended path (checklist)

| Step | Action | Detail |
|---|---|---|
| 0 | Read vocabulary | [`GLOSSARY.md`](GLOSSARY.md), [`MODULES.md`](MODULES.md) §2 |
| 1 | Study the worked example | [`modules/verticals/brewery/README.md`](modules/verticals/brewery/README.md) — β layout, packages, OpenPLC sister-repo pattern |
| 2 | Pick your vertical `code` | Lowercase, not in reserved set (`mrp`, `wms`, …). Example: `distillery`, `cosmetics` |
| 3 | Choose canonical modules to consume | Often `automation` + later `mrp`/`wms`; hospitality might be `crm` only — see [`vertical-configuration.md`](modules/contribute/vertical-configuration.md) §Step 2 |
| 4 | Create **your repository** | Scaffold four β slices + vertical-flavored packages — **normally outside** `umbraculum-dev` |
| 5 | Pin the MIT SDK | `@umbraculum/module-sdk` (+ `@umbraculum/*-contracts` for domains you integrate with) — [`third-party-module.md`](modules/contribute/third-party-module.md) |
| 6 | Register at runtime | `registerModule({ code: "your-code", ... })` + web/native registration — mirror [`services/api/src/modules/brewery/`](../../services/api/src/modules/brewery/) |
| 7 | Respect consumption contract | No parallel auth, billing, AI, i18n stack — [RFC-0001 §8](rfcs/0001-modules-tiers-governance-and-automation-placement.md) |
| 8 | Ship | Tier 6 is permissionless — no mini-RFC. Full procedure: [`modules/contribute/vertical-configuration.md`](modules/contribute/vertical-configuration.md) |

### Magento-shaped project layout (conceptual)

```text
your-product-x/                    ← your merchant project (NOT umbraculum-dev)
├── package.json                     ← depends on @umbraculum/module-sdk, your vertical packages
├── packages/
│   ├── productx-contracts/          ← @yourorg/productx-contracts
│   └── productx-domain-ui/          ← @yourorg/productx-ui
├── api/                             ← or merge into a forked services/api slice
│   └── src/modules/productx/
├── web/                             ← apps/web equivalent: (productx)/ routes
└── native/                          ← optional native slice

umbraculum platform (upstream)       ← backbone you track / deploy
├── horizontal platform + canonical modules
└── (optional) brewery reference     ← you omit this in product X
```

**Learning locally:** cloning `umbraculum-dev` and running `docker compose up` is still the fastest way to **study** the platform and brewery reference — same as cloning Magento to learn before creating a clean merchant project.

**Contributing a vertical into this monorepo:** optional. Only the **reference vertical** (`brewery`) and core team's demos live here by policy. Your production vertical should default to **your repo** ([`GLOSSARY.md`](GLOSSARY.md) §"Where code lives").

### Web app filesystem map

Where routes and shared code live under `apps/web/app/` (terminology contract: [backbone §3.7](design/pre-flip-application-surface-backbone.md)):

```text
apps/web/app/[locale]/
  _shared-layout/          # platform chrome (nav, footer, providers)
  (auth)/                  # login, signup, workspace select
  (platform-layout)/       # platform horizontal pages (ai, accessibility, …)
  (pim|mrp|crp|automation)/   # canonical module route groups
  (brewery)/               # reference vertical
  platform/                # cross-workspace admin (unchanged URL shape)
```

On-disk **package tiers** (RFC-0012):

```text
packages/
  platform/                # @umbraculum/ui, i18n, api-client, contracts, …
  sdk/                     # module-sdk, ai-tool-sdk, i18n-keys
  canonical/               # pim/contracts, mrp/contracts, …
  verticals/brewery/       # brewery-core, brewery-contracts, brewery-i18n, …
```

See [`NAVIGATE-MONOREPO.md`](NAVIGATE-MONOREPO.md) and [`REPOSITORY-STRUCTURE.md`](REPOSITORY-STRUCTURE.md) §2–§3.

### Where does my UI code go?

Use this decision tree when adding web UI or helpers (conventional terms — see [backbone §3.7](design/pre-flip-application-surface-backbone.md)):

```text
Used on web AND native with the same widget?  → @umbraculum/<vertical>-* package
Platform-wide nav / footer / auth / providers? → app/_shared-layout/{_components,_lib}/
Module-only shared UI for one module code?     → app/[locale]/(<code>)/{_components,_lib}/
Routable page (URL segment)?                   → app/[locale]/(<code>)/<segment>/
                                              OR app/[locale]/(platform-layout)/<segment>/  (platform horizontal)
Cross-workspace admin (ads, platform recipes)? → app/[locale]/platform/  (unchanged)
Login / signup / workspace picker?             → app/[locale]/(auth)/
```

**`(platform-layout)/` vs `platform/` admin:** `(platform-layout)/` holds **member-facing platform horizontal pages** (AI consultant, accessibility statement, about) — same audience as module routes. `platform/` is **cross-workspace admin** (platform recipe catalog, ads) with a distinct URL prefix; do not move admin pages into `(platform-layout)/`.

**Package placement for a new vertical:**

| Need | Package | On-disk path |
|---|---|---|
| Wire types + Zod schemas | `@umbraculum/<code>-contracts` | `packages/verticals/<code>/contracts/` |
| Locale JSON (vertical-only namespaces) | `@umbraculum/<code>-i18n` | `packages/verticals/<code>/i18n/` |
| PNG/SVG assets + manifest | `@umbraculum/<code>-media-assets` | `packages/verticals/<code>/media-assets/` |
| Shared domain UI widgets | `@umbraculum/<code>-<feature>-ui` | `packages/verticals/<code>/<feature>-ui/` |
| Platform merge/loader only | `@umbraculum/i18n`, `@umbraculum/media` | `packages/platform/` — no vertical content |

**API colocation:** domain services belong under `services/api/src/modules/<code>/services/` (Wave 3e). Do not add new vertical logic under `services/api/src/services/` or `domain/`.

**Known pre-flip gaps (documented, not fixed in Wave 6):**

- **Cross-module `(brewery)/_components` imports** — some canonical module pages still import brewery shared UI; prefer `@umbraculum/brewery-recipes-ui` or module-local `_components/`.

**Not** platform shared layout: a page's internal column/grid layout (recipe editor sections); Tamagui `layout` props; the POSIX command-line shell.

---

## Question 2 — Running without brewery (today vs target)

You are building **product X** (distillery, hotel ops, cosmetics batch, internal PIM-only workspace, …). You do **not** want brewery recipes, brew-day flows, or `@umbraculum/brewery-*` in your workspace web UI.

### Target (the Magento sample-data equivalent)

| Capability | Target behavior |
|---|---|
| **Platform install** | Depend on Umbraculum **platform + chosen canonical modules** without brewery artifacts |
| **Reference vertical** | `brewery` is **optional** — like `Magento_SampleData*` — not boot-registered unless you opt in |
| **Workspace** | Per-workspace module / add-on entitlements — hide routes, AI tools, and billing surfaces for modules not installed ([RFC-0009](rfcs/0009-workspace-billing-addons-and-entitlements.md), H1 2027) |
| **Your vertical** | Your package registers alongside canonical modules; brewery never appears |

`brewery_module` is already declared as an add-on code; **enforcement is deferred** ([`design/canonical-workspace-billing-addons-surface.md`](design/canonical-workspace-billing-addons-surface.md)).

### Installation profile (Waves A–F shipped 2026-06)

| Layer | Core profile (default) | Reference opt-in (`UMBRACULUM_MODULE_PROFILE=reference`) |
|---|---|---|
| **API** | Brewery module not registered ([`services/api/src/app.ts`](../../services/api/src/app.ts)) | `registerBreweryModule(app)` |
| **Web nav** | Brewery segments omitted | `brewery` in builtin web modules |
| **Native** | [`apps/native/blank`](../../apps/native/blank) (blank app) | [`apps/native/brewery`](../../apps/native/brewery) |
| **Database** | `brewery.*` stripped after migrate ([`installation-profile.md`](design/installation-profile.md)) | Full `brewery.*` schema |
| **Workspace UI toggle** | Install profile gate + optional add-on rows (RFC-0009 prep) | Same |

**Fresh clone:** `docker compose up` → **core** profile (brewery off) — see [`.env.sample`](../../.env.sample) and [`design/installation-profile.md`](design/installation-profile.md).

**Public demo host:** [`demo.umbraculum.dev`](https://demo.umbraculum.dev) intentionally runs the **reference** profile (platform core **plus** brewery vertical) — one hosted illustration of how a Tier 6 vertical sits alongside canonical modules ([`design/demo-host-runbook.md`](design/demo-host-runbook.md)). It is **not** a second demo for platform-only; integrators who omit brewery use `UMBRACULUM_MODULE_PROFILE=platform` in their own deploy (below).

**Integrator without brewery:** default fresh clone uses the **core installation profile** (`UMBRACULUM_MODULE_PROFILE=platform`). See [`docs/design/installation-profile.md`](design/installation-profile.md).

**Opt in to brewery (demo / walkthrough):** `UMBRACULUM_MODULE_PROFILE=reference` or `docker compose -f docker-compose.yml -f docker-compose.reference.yml up -d`.

**OpenAPI:** ISVs on the platform profile should consume [`services/api/openapi/openapi.json`](../services/api/openapi/openapi.json) only — the brewery add-on spec (`openapi/brewery.json`) documents the reference vertical and is omitted from platform-profile generation. Browse interactively on [docs.umbraculum.dev/openapi-platform](https://docs.umbraculum.dev/openapi-platform) (platform) or [docs.umbraculum.dev/openapi-brewery](https://docs.umbraculum.dev/openapi-brewery) (reference vertical). For typed HTTP calls from your repo, prefer [`@umbraculum/api-client`](../../packages/platform/api-client/README.md) facades over raw `fetch`. See [`API-OPENAPI.md`](API-OPENAPI.md).

**Workspace-level omit (hosted):** seed `brewery_module` on demo workspaces; enable `ENTITLEMENTS_ENFORCEMENT_MODE=tier_and_addons` when testing omit semantics ([RFC-0009](rfcs/0009-workspace-billing-addons-and-entitlements.md)).

### Roadmap hooks

- **H1 2027 — RFC-0009 full enforcement:** workspace add-on billing UI, Stripe, `tier_and_addons` purchase flows — installation profile gate already ships in 2026-06 ([`design/installation-profile.md`](design/installation-profile.md))
- **AI / nav:** respect installed modules only ([`design/canonical-ai-prompt-composition-surface.md`](design/canonical-ai-prompt-composition-surface.md) §5 — today all boot-registered modules contribute)
- **Packaging:** plugin-driven module registration from installed npm packages ([RFC-0002](rfcs/0002-canonical-module-physical-layout.md) §3 — future packaging detail)

---

## Where this is (and is not) documented already

| Topic | Already documented? | Where |
|---|---|---|
| Vocabulary + brewery as reference | Yes | [`GLOSSARY.md`](GLOSSARY.md) |
| Step-by-step vertical scaffold | Yes | [`modules/contribute/vertical-configuration.md`](modules/contribute/vertical-configuration.md) |
| Brewery worked example | Yes | [`modules/verticals/brewery/README.md`](modules/verticals/brewery/README.md) §6 |
| Vertical in your repo, not monorepo | Yes | [`GLOSSARY.md`](GLOSSARY.md) §"Where code lives"; [`MODULES.md`](MODULES.md) §3.2 |
| Uninstall brewery / optional reference | Yes (2026-06) | [`design/installation-profile.md`](design/installation-profile.md), [`design/brewery-vertical-lifecycle.md`](design/brewery-vertical-lifecycle.md), FAQ #5 — **this page** adds Magento parallel |
| **Single landing for both questions** | **This page** | [`BUILDING-YOUR-VERTICAL.md`](BUILDING-YOUR-VERTICAL.md) |
| First-time contributor (not vertical ISV) | Different path | [`GETTING-STARTED.md`](GETTING-STARTED.md) |

---

## Related docs

- [`GLOSSARY.md`](GLOSSARY.md) — terminology and FAQ  
- [`MODULES.md`](MODULES.md) — catalog + "I want to build a ___" decision tree  
- [`modules/contribute/vertical-configuration.md`](modules/contribute/vertical-configuration.md) — full Tier 6 procedure  
- [`modules/contribute/third-party-module.md`](modules/contribute/third-party-module.md) — npm SDK pinning from external repos  
- [`modules/verticals/brewery/README.md`](modules/verticals/brewery/README.md) — reference vertical shape  
- [`DATA-ACCESS-BOUNDARIES.md`](DATA-ACCESS-BOUNDARIES.md) — API as integration boundary  
- [`LICENSING.md`](LICENSING.md) — AGPL core vs MIT SDK for module businesses  
