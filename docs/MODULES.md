# Umbraculum modules

**Tier:** Public
**Status:** v0.1 — first iteration 2026-05-19 (living document; per-module pages land as each module ships)
**Audience:** anyone evaluating, contributing to, or building on top of the Umbraculum module ecosystem.

> [!NOTE]
> Part of [Umbraculum](../README.md) — the process-manufacturing platform, brewery-configured by default. Brand resolved 2026-05-18; see [`RENAME-DILIGENCE.md`](RENAME-DILIGENCE.md). This doc is the ecosystem entry point — the analog of `drupal.org/project/project_module` for Umbraculum. For substantive governance, the [RFCs](rfcs/) win; this doc indexes them.

---

## 1. What this page is

Three different readers land here for three different reasons; the page tries to serve all three without making any of them dig:

1. **Skeptic / evaluator** — *"how mature is this ecosystem, and what does it commit me to?"* The catalog in §3, the license/tier signals in §6, and the cross-references in §7 are for you.
2. **Module developer (would-be contributor)** — *"how do I add a module, and what kind of module is right for me?"* The vocabulary in §2 and the decision tree in §4 are for you. §5 is the working code you copy from.
3. **Future maintainer or integrator** — *"what's already shipped, and where does each piece live?"* The catalog in §3 and the per-module pages it links to are for you.

This page does **not** relitigate the governance model — [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) does that, and is binding. This page also does **not** duplicate the physical layout decisions — [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) does that, and is binding. What this page adds is navigation, vocabulary, and a worked example so the RFCs are findable and approachable.

---

## 2. Vocabulary — the five words that matter

These five terms are used precisely throughout Umbraculum's docs. They are *not* interchangeable; mixing them up is the single most common source of confusion when reading the codebase. Source-of-truth links are in the right-hand column.

| Term | One-line meaning | Source of truth |
|---|---|---|
| **package** | An npm artifact under `packages/<name>/` with its own `package.json`. A *publishing and build* unit. Not all packages are modules; horizontal infrastructure packages exist that no module owns. | [`packages/`](../packages/) tree; each package's own `README.md` |
| **canonical module** | A reserved-domain registered unit, identified by a short `code` from a closed set. Materialized as four coordinated slices (API + web + native + contracts package) sharing the same code. Governance: Tier 1, gated by mini-RFC. | [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §3–§4; [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) §3–§4 |
| **vertical configuration** | A non-canonical module — same physical β shape (four slices), but its `code` is *not* in the reserved set. Tier 6, permissionless. Consumes canonical modules; never reimplements canonical domains. | [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5 (Tier 6); [PLATFORM-ARCHITECTURE.md](PLATFORM-ARCHITECTURE.md) §1.1 |
| **reserved canonical code** | One of the six strings in `RESERVED_CANONICAL_MODULE_CODES` — currently `mrp`, `wms`, `crm`, `crp`, `automation`, `pim`. Allocation is gated by mini-RFC; collision in `registerModule()` is a boot error. | [`packages/module-sdk/src/reservedCodes.ts`](../packages/module-sdk/src/reservedCodes.ts) (code-authoritative); [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §4 + [RFC-0004](rfcs/0004-canonical-pim.md) (governance-authoritative) |
| **module SDK** | The MIT-licensed npm package that defines `registerModule()`, the canonical-code validator, and the `ValidatedSchema<T>` contract. The reusable surface third-party module authors pin. | [`packages/module-sdk/README.md`](../packages/module-sdk/README.md); [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) §5 (Decision C); [RFC-0003](rfcs/0003-validation-library-adoption.md) |

**Three quick clarifications people stumble on:**

- *"Is `@umbraculum/i18n` a module?"* No — it's a horizontal **package** (cross-cutting infrastructure). It has no `code`, no API slice, no web slice. Modules consume it; it does not register itself.
- *"Is `brewery` a canonical module?"* No — it's a **vertical configuration** (Tier 6). The `brewery` code is *not* in the reserved set. This is deliberate, and it is the single most important distinction in RFC-0001. The category mistake to avoid is "building a CRM for a hotel and calling it Hotel instead of CRM": the hotel is the vertical, the CRM is the canonical domain ([RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §4; [PLATFORM-ARCHITECTURE.md](PLATFORM-ARCHITECTURE.md) §1.1.1).
- *"What about `automation-contracts` — is that a module?"* No — it's the *contracts package* slice of the `automation` canonical module. The other three slices (`services/api/src/modules/automation/`, `apps/web/app/[locale]/(automation)/`, `apps/native/src/modules/automation/`) make up the rest of the module. See §5 below for the full picture.

**Why this discipline?** The canonical-module rule and the reserved-code allocation exist primarily because **the AI consultant operates at workspace scope**. The orchestrator needs one coherent mental model — "what canonical modules are installed in this workspace, and what do they own" — to reason across them. Two parallel competing implementations of the same domain (the WordPress / Magento failure mode where multiple plugins reimplement the same operational concept under different schemas) would collapse that mental model: cross-module questions would have to be re-asked per-implementation and stitched together by the operator. The reserved-code list is the structural answer — at most one shipped implementation per canonical domain, in one shape the AI consultant can rely on. See [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §4.0 (cornerstone), [`AI-CONSULTANT.md`](AI-CONSULTANT.md) §2 (worked illustration), and [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §4.1 (peer-decomposition rationale).

---

## 3. Catalog — what's in the ecosystem today

Three tables, one per category. Each row links to the artifact's own documentation.

### 3.1 Canonical modules (Tier 1, reserved codes)

The reserved set is closed — the six codes below are it, today. Additions go through the mini-RFC procedure ([RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §6 Decision D); the most recent allocation is `pim` via [RFC-0004](rfcs/0004-canonical-pim.md) 2026-05-19.

| Code | Status | Surface | License | Page |
|---|---|---|---|---|
| `automation` | **Shipped — read path (Phase B-3, 2026-05-19); Phase C real adapter pending** | Fleet, vessels, alarms; OpenPLC bridge via brewery adapter | AGPLv3 | [modules/canonical/automation.md](modules/canonical/automation.md) |
| `mrp` | Open door — H1 2027 working assumption | Material requirements planning, production orders, work orders | AGPLv3 | [modules/canonical/mrp.md](modules/canonical/mrp.md) |
| `wms` | Open door — H2 2027 (native-mandatory) | Warehouse management, stock movements, locations, lots/serials | AGPLv3 | [modules/canonical/wms.md](modules/canonical/wms.md) |
| `crm` | Open door — no firm horizon | Customer relationships, contacts, accounts, opportunities | AGPLv3 | [modules/canonical/crm.md](modules/canonical/crm.md) |
| `crp` | Open door — H1 2027 working assumption (paired with `mrp`) | Capacity requirements planning, resource scheduling, work-center load | AGPLv3 | [modules/canonical/crp.md](modules/canonical/crp.md) |
| `pim` | Shipped — Phase A + B + C + D-integration-test-Option-B (read path, web admin, cross-module composition proof); Phase E write paths + channel feeds + Option-A real-FK integration queued per [RFC-0004](rfcs/0004-canonical-pim.md) + [surface doc](design/canonical-pim-module-surface.md) §"Open work" | Master product information: products, variants, attribute sets, categories, media, channel + locale overrides (Akeneo / Pimcore class) | AGPLv3 | [modules/canonical/pim.md](modules/canonical/pim.md) |

Note on "open door": the code is reserved and the folder shape is pre-committed by [RFC-0002](rfcs/0002-canonical-module-physical-layout.md). The work to design and ship each module's surface is its own future RFC or design artifact ([RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §12.4); no implementation exists yet.

### 3.2 Vertical configurations (Tier 6, permissionless)

Vertical configurations use the same β shape as canonical modules but with a vertical code instead of a reserved canonical code. They consume the canonical-module surface plus vertical-specific seed data and prompts ([RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5 row 6).

| Code | Status | Consumes (planned) | License | Page |
|---|---|---|---|---|
| `brewery` | **Shipped — reference vertical** (flat layout today; β migration H1 2027 per [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) Decision D) | `automation` (shipped), `mrp` (planned), `wms` (planned), `crm` (planned) | AGPLv3 (this bundle); third-party verticals are author's choice | [modules/verticals/brewery.md](modules/verticals/brewery.md) |

Future verticals (distillery, kombucha, cosmetics, food-batch, fragrance) are explicitly anticipated by [PLATFORM-ARCHITECTURE.md](PLATFORM-ARCHITECTURE.md) §1.1 but unimplemented. They can be community-built — the Tier 6 path is permissionless.

> [!NOTE]
> **Vertical configurations may have sister repos.** A vertical's surface is not always exclusively TypeScript — verticals with safety-validated PLC code, embedded firmware, hardware drivers, or other runtime-asymmetric assets typically live in a separate repository coupled to this monorepo by a versioned interface contract. The brewery vertical is the worked example: its OpenPLC ladder logic lives in a sister repo joined here by the `PI_*` Modbus mailbox + `CONTRACT_VERSION` + `integrated_release_tag`. See [`modules/verticals/brewery.md §3.7`](modules/verticals/brewery.md) for the worked example, and [`modules/contribute/vertical-configuration.md §4`](modules/contribute/vertical-configuration.md) for the generalized "multi-runtime modules" pattern.

### 3.3 Horizontal packages (cross-cutting infrastructure, NOT modules)

These packages are consumed by every module. They are not registered through `registerModule()`; they have no `code`. They are the platform-owned services from the *consumption contract* ([RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §8 Decision F) that modules must use rather than reimplement.

| Package (current name) | End-state name | Role |
|---|---|---|
| [`@umbraculum/module-sdk`](../packages/module-sdk/README.md) | `@umbraculum/module-sdk` (rename pending — sub-plan #9 slot 11) | The SDK every module pins. `registerModule()`, reserved-code validation, `ValidatedSchema<T>`. |
| [`@umbraculum/contracts`](../packages/contracts/README.md) | `@umbraculum/contracts` (sub-plan #9 slot 9) | Platform-wide auth/me DTOs, AI tool contract types. |
| [`@umbraculum/automation-contracts`](../packages/automation-contracts/README.md) | (already renamed — slot 4 done) | Contracts slice of the `automation` canonical module. The Modbus mailbox mirror lives here. |
| [`@umbraculum/api-client`](../packages/api-client/README.md) | (renamed — slot 10 done) | Fetch + auth boundary (cookie web, bearer native). |
| [`@umbraculum/i18n`](../packages/i18n/README.md) | (renamed — slot 7 done) | Cross-platform message catalog (web + native). |
| [`@umbraculum/i18n-react`](../packages/i18n-react/README.md) | (renamed — slot 8 done) | Universal `useT` hook for React + React Native. |
| [`@umbraculum/ui`](../packages/ui/README.md) | (renamed — slot 5 done) | Tamagui primitives + design-system components. Industry-agnostic. |
| [`@umbraculum/navigation`](../packages/navigation/README.md) | (renamed — slot 3 done) | Route IDs + cross-platform routing policy. |
| [`@umbraculum/media`](../packages/media/README.md) | (renamed — slot 2 done) | Shared assets framework. |
| [`@umbraculum/test-mcp`](../packages/test-mcp/README.md) | (renamed — slot 1 done) | Test-MCP HTTP server exposing testing tools. Developer tooling. |
| `@umbraculum/brewery-core` ([`packages/core/`](../packages/core/)) | (renamed — slot 6 done; vertical-prefixed) | Brewery-vertical brewing math (gravity, water). **Vertical-prefixed scope** — see RFC-0002 §4. No README yet — content sits in [`packages/core/src/`](../packages/core/src/). |
| [`@umbraculum/brewery-beerjson`](../packages/beerjson/README.md) | (renamed — slot 12 done; vertical-prefixed) | Brewery-vertical BeerJSON spec layer. |
| [`@umbraculum/brewery-recipes-ui`](../packages/recipes-ui/README.md) | (renamed — slot 13 done; vertical-prefixed) | Brewery-vertical recipe/water/yeast UI. |

Note the asymmetry in the third column: horizontal packages keep an unprefixed `@umbraculum/<name>` scope; vertical-flavored packages carry a vertical prefix (`@umbraculum/brewery-<name>`). That distinction is enforced by [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) §4 and is the trap that slot 6 of sub-plan #9 was designed to catch ([brewery-scope-migration-per-package-handoff.md](design/brewery-scope-migration-per-package-handoff.md) — Slot 6 ⚠ TRAP).

---

## 4. "I want to build a ___" — decision tree

The right contribution path depends on which kind of thing you're adding. Use this tree before you start; the ceremony cost varies by an order of magnitude across the rows.

Quick map (full per-path guides linked below):

| You want to add… | Read | Ceremony |
|---|---|---|
| A new canonical module (new reserved code) | [`modules/contribute/canonical-module.md`](modules/contribute/canonical-module.md) | **High** — mini-RFC + consumption-contract checklist + core team approval. |
| A vertical configuration (e.g. `distillery`, `kombucha`) | [`modules/contribute/vertical-configuration.md`](modules/contribute/vertical-configuration.md) | **None** — Tier 6, permissionless. Use `brewery` as model. |
| A third-party / community module against an existing canonical | [`modules/contribute/third-party-module.md`](modules/contribute/third-party-module.md) | **None** — Tier 3 / Tier 4, permissionless. Pin the SDK. |
| A horizontal package (cross-cutting infrastructure) | [`modules/contribute/horizontal-package.md`](modules/contribute/horizontal-package.md) | **Low** — regular PR; reviewer agreement on cross-cutting nature. |

The full set of contributor guides lives under [`modules/contribute/`](modules/contribute/). Each page covers the procedure, common pitfalls, and worked examples.

### 4.x …a new AI tool, a tier-limit field, an addon code

These attach *to a module*. They are not standalone artifacts. Find the right module's `registerModule({ ... })` call and add the entry there — see §5 for what that looks like for `automation`.

---

## 5. Worked example — the `automation` canonical module

This is the only canonical module that exists today, so it is the canonical worked example. Every column in the §3.1 catalog comes from real files in this repo; the snippets below are the load-bearing ones.

### 5.1 The four slices

The β layout from [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) §3 says every canonical module is materialized as four coordinated paths sharing the `code`. For `automation`:

| Slice | Path | What it owns |
|---|---|---|
| API | [`services/api/src/modules/automation/`](../services/api/src/modules/automation/) | Fastify routes (`/automation/vessels`, `/automation/vessels/:code`), the mock adapter, the vessels service. |
| Web | [`apps/web/app/[locale]/(automation)/`](../apps/web/app/[locale]/(automation)/) | Next.js pages — vessel list, vessel detail. Route group `(automation)/` — no URL prefix change. |
| Native | (not yet wired) | Will be `apps/native/src/modules/automation/` per RFC-0002 §3 — pending native-side automation work. |
| Contracts | [`packages/automation-contracts/`](../packages/automation-contracts/) → [`@umbraculum/automation-contracts`](../packages/automation-contracts/README.md) | Adapter SDK types (`AutomationAdapterDefinition`), `VesselStateSchema`, `CONTRACT_VERSION`, the typed Modbus mailbox mirror. The only piece a third-party adapter pins. |

> [!NOTE]
> **The "(not yet wired)" status of the native slice is a sequencing decision, not a downgrade.** Per [RFC-0002 §3](rfcs/0002-canonical-module-physical-layout.md), every canonical and tier-6 vertical module is *required* to have a native slice at `apps/native/src/modules/<code>/` in its mature shape — and per [`PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §1.1, shipping to both web and native almost out of the box is part of the platform's first-class commitment (the cross-platform infrastructure — Tamagui + React Native + Expo + the cross-platform packages — is the durable deliverable). Per-module native wiring lands when each module's native UI work is scheduled: brewery's flat native surface migrates to `apps/native/src/modules/brewery/` in the H1 2027 tranche per [RFC-0002 Decision D](rfcs/0002-canonical-module-physical-layout.md); `automation`'s native slice lands when its native surface is designed; future canonical modules' native slices ship alongside their first version. The empty cell in the table is "future work" in the sequencing sense, not in the "may or may not happen" sense.

The Postgres schema is named `automation` (per [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) §4 convention 4); the `Vessel`, `AdapterConnection`, and `AutomationAlarmEvent` models live there. See [`services/api/prisma/schema.prisma`](../services/api/prisma/schema.prisma) and [canonical-automation-module-surface.md §7](design/canonical-automation-module-surface.md) for the Prisma layout.

### 5.2 The `registerModule()` call

The shape every module follows. From [`services/api/src/modules/automation/index.ts`](../services/api/src/modules/automation/index.ts):

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

Three things to notice for your own module:

1. **`code`** is the canonical code from `RESERVED_CANONICAL_MODULE_CODES` (or your vertical code for Tier 6). Collision is a boot error.
2. **`prismaSchema`** matches the code by convention. For Tier 6 verticals migrating from `public`, this may be the vertical code or stay as `public` until a dedicated migration ([RFC-0002](rfcs/0002-canonical-module-physical-layout.md) §3 Prisma alignment).
3. **`addonCodes`** is the list of Stripe / RevenueCat addon SKUs your module's paid features unlock through. The platform owns billing — modules declare addon codes, they do not integrate Stripe directly ([RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §8.2).

The full SDK options surface (route registrars, `tierLimits`, `registerAiTools`) is documented in [`packages/module-sdk/src/types.ts`](../packages/module-sdk/src/types.ts).

### 5.3 The contracts package — what third parties pin

[`packages/automation-contracts/`](../packages/automation-contracts/) is the only piece of `automation` a third-party adapter author depends on. It exports four surfaces ([`@umbraculum/automation-contracts` README](../packages/automation-contracts/README.md)):

- `CONTRACT_VERSION` constant + `classifyContractVersionSkew` helper (the major/minor/patch handshake policy).
- `MailboxSpec` / `MailboxEntry` types (typed mirror of the OpenPLC sister-repo `PI_*` registers).
- `MAILBOX_SPEC` frozen constant (the validated runtime mirror, 356 entries as of contract `2.0.1-dev`).
- `AutomationAdapterDefinition` (the adapter contract that `brewery.openplc.v1` and any other adapter implements).

The implementation surface (Fastify routes, Prisma models, AI tools, adapter supervisor loop) stays inside the API slice. Third parties never reach into `services/api/src/modules/automation/` directly — they pin `@umbraculum/automation-contracts` and depend on the `@umbraculum/module-sdk` SDK shape.

### 5.4 The design doc

[`docs/design/canonical-automation-module-surface.md`](design/canonical-automation-module-surface.md) is the accepted design (2026-05-19) for the `automation` module's surface — the adapter SDK shape, the `Vessel` vs `EquipmentProfile` decision, the OpenPLC translation seam, the AI tools, the tier limits, and the H2 2026 phasing. When you build another canonical module, write the equivalent design doc; it is the "what does this module actually look like at the platform's edges" artifact that RFC-0001 §7.2 leaves to the per-module follow-on.

---

## 6. Governance & license signals

| Concern | Where it's pinned |
|---|---|
| **License posture** — Tier 1 canonical is AGPLv3; Tier 2 SDK is MIT; Tier 6 vertical (when bundled by core team) is AGPLv3 alongside the core; third-party verticals (Tier 4 / Tier 6 community-built) are author's choice. | [LICENSING.md](LICENSING.md) §6, [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5 |
| **Tier model and rights / obligations** | [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §5 (Decision C) |
| **What modules MUST consume (auth, billing, AI, …) and never reimplement** | [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §8 (Decision F, the consumption contract) |
| **Mini-RFC procedure for promoting a community module to canonical** | [RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md) §6 (Decision D) |
| **Folder / naming conventions for every module slice** | [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) §3–§4 (Decisions A + B) |
| **Validation library posture (Zod v4 + `ValidatedSchema<T>` for third-party freedom)** | [RFC-0003](rfcs/0003-validation-library-adoption.md) |
| **`@brewery/*` → `@umbraculum/*` migration progress** | [brewery-scope-migration-per-package-handoff.md](design/brewery-scope-migration-per-package-handoff.md) (slot-by-slot checklist) |

---

## 7. Cross-references

- **[RFC-0001](rfcs/0001-modules-tiers-governance-and-automation-placement.md)** — canonical-module rule, reserved codes, tier model, governance, consumption contract.
- **[RFC-0002](rfcs/0002-canonical-module-physical-layout.md)** — physical layout (β three-tree distribution), naming conventions, module-SDK location.
- **[RFC-0003](rfcs/0003-validation-library-adoption.md)** — validation library adoption (Zod v4 + library-agnostic `ValidatedSchema<T>`).
- **[PLATFORM-ARCHITECTURE.md](PLATFORM-ARCHITECTURE.md)** — the platform vision; §1.1.1 explains why canonical modules are peer domains and not nested under "manufacturing"; §4.4 sketches the `registerModule()` runtime; §5.2 is the H1 2027 restructure tranche.
- **[`packages/module-sdk/README.md`](../packages/module-sdk/README.md)** — the SDK's own README.
- **[`docs/design/canonical-automation-module-surface.md`](design/canonical-automation-module-surface.md)** — the worked example for "how a canonical module's surface design doc looks".
- **[modules/canonical/automation.md](modules/canonical/automation.md)** — the per-module page for `automation`.

---

*This page is intentionally short and load-bearing. Substantive arguments live in the RFCs; per-artifact detail lives in the per-module pages and the package READMEs. If you find yourself reading this doc and wishing it explained something in more depth, the right answer is almost always to follow one of the links above — and if that link doesn't exist, that's a docs gap worth filing.*
