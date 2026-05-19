# Contribute — a vertical configuration

**Tier:** Public
**Ceremony level:** **None — Tier 6 is permissionless** ([RFC-0001 §6](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md)).
**Audience:** anyone building a new vertical (e.g. `distillery`, `kombucha`, `cosmetics`, `food-batch`, `fragrance`) on Umbraculum.

> [!NOTE]
> Vertical configurations consume canonical modules and add vertical-specific seed data, prompts, UI flows, i18n, and tier-limit slices. They do not own canonical-domain semantics. The reference example is [`brewery`](../verticals/brewery.md) — read that page first to see the worked shape, then come back here for the contribution mechanics.

---

## 1. When this path applies

You're building a vertical-flavored configuration that:

- Targets a specific industry (distillery, kombucha, cosmetics, food-batch, fragrance, …).
- Consumes the canonical-module surface (typically `automation` first, later `mrp` / `wms` / `crp` / `crm` as they ship).
- Adds vertical-specific data, prompts, UI flows.
- Does **not** reimplement canonical-domain semantics or platform horizontal services.

If you're building a connector against an existing canonical (e.g. "an OPC-UA adapter for `automation`"), you want [`third-party-module.md`](third-party-module.md) instead — that's a Tier 3/4 module, not a vertical.

---

## 2. What you ship

Per [RFC-0001 §5](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) (Tier 6 row), a vertical configuration ships:

- **Vertical-specific seed data** — your industry's catalogs, standards, defaults (for distillery: spirit categories, federal regulatory codes, distillation stages; for cosmetics: ingredient compatibility tables, regulatory limits).
- **Vertical-specific AI prompts and knowledge sources** — domain templates, terminology, common workflows.
- **Vertical-specific UI flows and routes** — the screens that make sense for your operators (a distillery's still operation, a cosmetics formulator's compatibility checker).
- **Vertical-specific i18n strings** under a vertical-prefixed namespace.
- **Vertical-specific tier-limit slices** (e.g. `maxRecipesPerWorkspace` for brewery; analogues for your vertical).
- **Vertical adapter implementations** of canonical-module SDK contracts when needed (e.g. a brewery-side `brewery.openplc.v1` against the `automation` adapter SDK; your vertical may ship `distillery.somecontroller.v1`).

What you **do not** ship — the consumption contract from [RFC-0001 §8](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md):

- No parallel auth / session model.
- No parallel billing integration (use addon codes).
- No parallel AI orchestrator (register your AI tools via the SDK).
- No parallel i18n stack (your strings live in the platform's i18n catalog under your vertical's namespace).
- No reimplementation of canonical-domain semantics — once `mrp` ships, you do **not** ship your own production-planning logic. You configure MRP for your vertical's primitives.

---

## 3. Procedure

### Step 1 — Pick a code

Lowercase, no prefix, **not** in the reserved canonical set (`mrp`, `wms`, `crm`, `crp`, `automation`). Vertical codes are permissionless — no mini-RFC required. Recommend something obvious and durable: `distillery`, `kombucha`, `cosmetics`, `food-batch`, `fragrance`.

A vertical code that collides with a reserved canonical is a boot error from `registerModule()` ([RFC-0001 §3 structural enforcement](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md)).

### Step 2 — Decide which canonical modules you consume

For a brewery-shaped manufacturing vertical, the natural set is `automation` (today) plus `mrp` + `wms` + `crp` (when they ship). For a non-manufacturing vertical (e.g. a hospitality vertical), the set might be just `crm`.

Your vertical may also be **canonical-free** — pure config without canonical consumption. That's fine; vertical configurations are not required to consume any canonical.

### Step 3 — Scaffold the four β slices

Per [RFC-0002 §3](../../rfcs/0002-canonical-module-physical-layout.md), every module (canonical or vertical) materializes as four coordinated paths:

```
services/api/src/modules/<your-code>/
apps/web/app/[locale]/(<your-code>)/
apps/native/src/modules/<your-code>/
packages/<your-code>-contracts/         → @umbraculum/<your-code>-contracts
```

The native slice is required only if your vertical needs a native shell (per [ROADMAP.md §H2 2027](../../ROADMAP.md), some verticals are native-mandatory like brewery and WMS; others are web-only).

### Step 4 — Vertical-flavored packages

Beyond the contracts package, your vertical may ship additional packages with vertical-flavored content (`@umbraculum/distillery-spirits-catalog`, `@umbraculum/cosmetics-ingredient-compat`). These carry the `@umbraculum/<your-code>-<name>` prefix per [RFC-0002 §4](../../rfcs/0002-canonical-module-physical-layout.md) — to distinguish vertical-flavored packages from horizontal infrastructure at a glance.

Brewery's example: `@umbraculum/brewery-core`, `@brewery/beerjson` (becomes `@umbraculum/brewery-beerjson` after sub-plan #9 slot 12), `@brewery/recipes-ui` (becomes `@umbraculum/brewery-recipes-ui` after slot 13).

### Step 5 — Register via `@umbraculum/module-sdk`

The registration shape is identical to canonical modules — the SDK doesn't care whether `code` is a reserved canonical or a vertical code, only that it's unique. Mirror the brewery-side `registerModule({ code: "brewery", ... })` call that will land with the H1 2027 migration ([brewery.md §5](../verticals/brewery.md)). The shape today (Phase B for `automation`) is in [`services/api/src/modules/automation/index.ts`](../../../services/api/src/modules/automation/index.ts):

```44:66:services/api/src/modules/automation/index.ts
export function registerAutomationModule(app: FastifyInstance): void {
  const alreadyRecorded = listRegisteredModules().some(
    (m) => m.code === MODULE_CODE,
  );

  if (!alreadyRecorded) {
    registerModule(app, {
      code: MODULE_CODE,
      prismaSchema: "automation",
      addonCodes: ["automation_module"],
      // Routes registered via per-app `app.register(...)` below so they
      // attach on every `buildApp()` call. `registerModule` records the
      // metadata once per process; if `routes:` were passed here, the
      // guarded first-call path would register routes too, but
      // second-and-later `buildApp()` calls (test workers) would skip
      // both metadata AND routes — leaving the second app without the
      // module's routes wired.
      routes: [],
    });
  }

  app.register(automationVesselsRoutes);
}
```

### Step 6 — Add seed data, prompts, i18n

- Seed data goes in your vertical's `services/api/src/modules/<your-code>/seed/` (or equivalent under the migrated brewery shape).
- AI prompts and knowledge sources register through the AI tool SDK ([RFC-0001 §8.2](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) AI platform row).
- i18n strings land in `packages/i18n/src/<locale>.json` under a vertical-prefixed namespace (e.g. `distillery.*`, `cosmetics.*`).

### Step 7 — Ship

Tier 6 is permissionless. You ship in a normal PR. For external repos (a vertical maintained outside this monorepo), publish your contracts package to npm and document the install path; your vertical is a downstream consumer of `@umbraculum/module-sdk` and the platform.

---

## 4. Bundling decisions (separate from the technical contribution path)

Whether your vertical gets **bundled** with the platform's hosted offering — the way `brewery` is bundled today as the reference vertical — is a separate conversation with the core team. The technical contribution path is permissionless; bundling is curatorial.

Most third-party verticals stay external (Tier 6 community-built); a few may eventually be bundled if they demonstrate cross-customer demand and operational maturity. This is the same shape as Drupal's distinction between core and community modules — anyone can build, the core team curates which ones ship in the default offering.

---

## 5. Worked example

Read [`verticals/brewery.md`](../verticals/brewery.md) end-to-end — it documents the brewery vertical as it exists today (flat layout, pre-H1 2027) and the β shape it migrates to. The page also lists every brewery-specific surface (routes, packages, docs, i18n namespace) so you have a concrete checklist for what your own vertical needs.

---

## 6. Common pitfalls

- **Reimplementing a canonical concern in your vertical.** "We'll ship our own MRP because the canonical is too generic" — no. Once `mrp` ships, your vertical configures it; you don't fork it. If the canonical surface lacks something you need, that's an extension-point feature request against the canonical, not a parallel implementation.
- **Skipping the vertical-prefix on packages.** `@umbraculum/distillery-spirits-catalog` is correct; `@umbraculum/spirits-catalog` is the wrong shape (looks horizontal). The prefix is the visual signal that the package is vertical-flavored. See [RFC-0002 §4](../../rfcs/0002-canonical-module-physical-layout.md) and the slot-6 TRAP discussion in [brewery-scope-migration-per-package-handoff.md](../../design/brewery-scope-migration-per-package-handoff.md).
- **Owning the AI tool registry.** Register your tools via `@umbraculum/module-sdk`'s `registerAiTools` slot. Do not spin up a parallel orchestrator.
- **Building for a single workspace.** That's Tier 5 (private), not Tier 6 (vertical). Vertical configurations are *templated* — they configure the platform for a class of customers, not a single installation.

---

## 7. Cross-references

- [`verticals/brewery.md`](../verticals/brewery.md) — the worked example.
- [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5 (Tier 6 row), §8 (consumption contract).
- [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md) §3 (β layout), §4 (naming), §6 (Decision D — brewery sequencing).
- [`packages/module-sdk/README.md`](../../../packages/module-sdk/README.md) — the SDK you pin.
- [`docs/MODULES.md`](../../MODULES.md) §3.2, §4.2 — catalog of vertical configurations and decision-tree row.
