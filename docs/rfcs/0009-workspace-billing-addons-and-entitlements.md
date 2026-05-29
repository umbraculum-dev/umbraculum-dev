# RFC-0009 — Workspace billing add-ons and entitlements

**Tier:** Public
**Status:** Accepted 2026-05-28 (pre-public-flip solo-author + core-team approval recorded; this is a living RFC — see §10 Resolution for the change procedure)
**Audience:** prospective module developers, vertical-configuration authors, self-hosters, hosted-service customers, billing integrators, and anyone evaluating how Umbraculum sells modules beyond the base workspace tier.
**Document role:** entitlement / add-on billing contract for modules and the horizontal platform.

> **Disclaimer.** This RFC commits the ownership boundary and data-model direction **before** the July 2026 public alpha so module authors do not infer from `registerModule({ addonCodes })` that they may integrate Stripe subscription items, RevenueCat entitlements, or per-module billing tables. **Implementation** (`WorkspaceBillingAddon` Prisma model, webhook extensions, route enforcement, managed-AI credits) is intentionally deferred to **H1 2027** per [`docs/ROADMAP.md`](../ROADMAP.md); the contract is not.

---

## 1. Summary

This RFC commits to six decisions:

- **Decision A — Workspace-scoped add-ons are a horizontal platform concern.** Per-module entitlements and optional managed-AI credit packs are stored and enforced by the platform billing layer. Modules declare `addonCodes` via `@umbraculum/module-sdk`; they MUST NOT integrate Stripe, RevenueCat, or parallel entitlement stores.

- **Decision B — `WorkspaceBillingAddon` is the committed persistence shape (implementation deferred).** One row per active add-on per workspace in `platform.*`, keyed by `addonCode`, with optional Stripe subscription-item linkage and JSON `monthlyAllowance` for credit-style products. Exact Prisma fields land with the H1 2027 implementation tranche.

- **Decision C — Base tier and add-ons compose; they do not replace each other.** `WorkspaceBilling.tier` (`free | premium | pro | pro_plus`) remains the subscription source of truth for platform-wide unlocks (e.g. `aiEnabled` via BYOK v0). Module add-ons gate module-specific paid surfaces. Enforcement merges **tier limits** (shipped) with **add-on entitlement** (future) — add-ons do not silently override tier numeric caps unless an future RFC amends that rule.

- **Decision D — v1 implementation scope is module entitlements only.** The first implementation tranche (H1 2027) ships module add-on rows, webhook wiring, and at least one enforced consumer (automation or WMS — see companion doc §5). **Managed-AI credits** (`managed_ai_credits_*` add-on codes, pricebook, top-ups) remain Wave **E-full** deferred per [`docs/ROADMAP.md`](../ROADMAP.md); this RFC reserves the model shape only.

- **Decision E — Public alpha ships in `tier_only` enforcement mode.** July 2026 α uses existing `WorkspaceBilling` + `tierLimitsService` only. `EntitlementsService` runs with `enforcementMode: "tier_only"` — declared `addonCodes` are registered and collision-checked at boot but not purchase-enforced until the implementation tranche lands.

- **Decision F — Self-host posture.** Self-hosted deployments MAY treat all declared module add-ons as entitled (config flag) or ignore add-on SKUs entirely; the hosted service MUST enforce purchased add-ons once implementation ships.

---

## 2. Motivation

The failure mode matches RFC-0008 (notifications): once WMS, CRM, automation, and third-party verticals need paid module surfaces, each module adds Stripe products, stores entitlements locally, and drifts from the workspace-scoped billing model already committed in [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §3.6–§3.7.

Three properties require platform ownership:

1. **One invoice per workspace.** Base tier plus multiple module add-ons plus optional managed-AI packs should appear as subscription items on a single Stripe customer / RevenueCat entitlement graph — not N module-private billing integrations.
2. **SDK already declares the vocabulary.** Every shipped module registers `addonCodes` (`brewery_module`, `automation_module`, …) but nothing persists or enforces them today.
3. **Two product lines, one primitive.** Module entitlements and managed-AI credits share storage shape but differ in Stripe mapping (subscription item vs consumable/top-up). The RFC separates **contract now** from **implementation phasing**.

RFC-0001 §8.2 already names billing as a platform row with future `WorkspaceBillingAddon`. This RFC turns that into a concrete commitment and clarifies α vs H1 2027 delivery.

---

## 3. Decision A — Horizontal ownership (commit)

The platform owns:

- `WorkspaceBillingAddon` persistence (future) in `platform.*`,
- Stripe subscription-item and RevenueCat entitlement mapping,
- webhook idempotency with existing `BillingPurchaseIntent` / `BillingEvent` flows,
- `EntitlementsService` (query + enforcement mode),
- operator/admin surfaces for active add-ons per workspace,
- refund / VAT / credit-balance policy for managed-AI (when E-full lands).

Modules MUST NOT:

- create Stripe products/prices or RevenueCat offerings from module code,
- store parallel entitlement tables,
- call payment providers for add-on purchases,
- bypass platform entitlement checks (once enforcement is enabled).

Modules MUST:

- declare `addonCodes` on `registerModule()` ([RFC-0002](0002-canonical-module-physical-layout.md) §4),
- document which routes/features require which add-on in the module README / surface doc,
- contribute `tierLimits(tier)` slices for numeric caps that apply regardless of add-on (until a future RFC says otherwise).

---

## 4. Decision B — `WorkspaceBillingAddon` shape (commit; DDL deferred)

Committed logical model (Prisma names may adjust at implementation):

| Field | Role |
|-------|------|
| `workspaceId` | FK → `platform.Workspace` |
| `addonCode` | Stable SKU key; must match a code declared by exactly one registered module (or platform-reserved `managed_ai_credits_*`) |
| `status` | `active` \| `canceled` \| `past_due` |
| `periodStart`, `periodEnd` | Billing period boundaries |
| `monthlyAllowance` | JSON — e.g. `{ "credits": 5000 }` for managed AI; `{}` or omitted for boolean module entitlements |
| `stripeSubscriptionItemId` | Optional link to Stripe subscription item |
| `revenueCatEntitlementId` | Optional native mirror |

**Addon code convention (v1):**

- Module entitlements: `<module_code>_module` (e.g. `automation_module`, `wms_module`).
- Managed-AI packs (reserved, not sold in v1): `managed_ai_credits_<allowance>` (e.g. `managed_ai_credits_5k`).

Boot-time registry MUST reject duplicate `addonCodes` across modules ([`packages/module-sdk`](../../packages/module-sdk/) — shipped with this RFC).

---

## 5. Decision C — Tier vs add-on composition (commit)

| Mechanism | Shipped today | After H1 2027 implementation |
|-----------|---------------|------------------------------|
| `WorkspaceBilling.tier` | Base subscription; unlocks `aiEnabled` at `premium+` | Unchanged |
| `tierLimits(tier)` module slices | Numeric/boolean caps (recipes, vessels, …) | Unchanged — still evaluated from tier |
| `addonCodes` + `WorkspaceBillingAddon` | Declared only; **not enforced** | Boolean gate: feature requires active row for `addonCode` |
| Managed-AI credits | Not sold | Preflight balance check + post-call debit (E-full) |

**Rule:** A route MAY require both a paid tier **and** an active module add-on. Document the matrix in each module surface doc. Default α behavior: tier limits only.

---

## 6. Decision D — Implementation phasing (commit)

| Tranche | Calendar | Deliverable |
|---------|----------|-------------|
| **Contract (this RFC)** | Pre-α 2026 | RFC + companion surface + `EntitlementsService` stub + addon registry validation |
| **Module entitlements v1** | H1 2027 | Prisma model, webhooks, enforcement mode `tier_and_addons`, first enforced module |
| **Managed-AI credits (E-full)** | H1 2027+ | Pricebook, top-ups, orchestrator preflight — may be same or successor RFC |

Public alpha is **not blocked** on add-on implementation. Roadmap item **2h** remains H1 2027.

---

## 7. Decision E — Alpha boundary (commit)

Until the H1 2027 implementation lands:

- No `WorkspaceBillingAddon` table in production migrations.
- `EntitlementsService.enforcementMode === "tier_only"`.
- `hasActiveAddon()` returns `true` in `tier_only` mode (no DB lookup) so call sites can be wired without changing α behavior.
- Module READMEs MUST NOT claim add-ons are purchasable before the implementation tranche ships.
- Documentation MUST state that module `addonCodes` are **registered vocabulary**, not yet sold SKUs on the hosted service.

---

## 8. Decision F — Self-host (commit)

Self-hosted operators MAY:

- set `ENTITLEMENTS_MODE=all_addons_entitled` (or equivalent env) to skip add-on checks, or
- omit Stripe/RevenueCat entirely and rely on tier limits only.

The hosted Umbraculum service MUST enforce purchased add-ons once implementation ships. AGPL self-hosters are not required to run Stripe.

---

## 9. Consumption-contract row

This RFC extends [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §8.2 — the billing row's "future `WorkspaceBillingAddon`" cell is now **committed shape, deferred implementation**:

| Concern | Platform | Module obligation |
|---------|----------|-------------------|
| Billing / entitlements | `WorkspaceBilling`, `BillingTier`, `BillingPurchaseIntent`, **`WorkspaceBillingAddon` (H1 2027)** | Declare `addonCodes` + `tierLimits`; never integrate Stripe/RevenueCat from module code |

---

## 10. Resolution

**Status: Accepted 2026-05-28.**

Amendments require a successor RFC at `docs/rfcs/NNNN-<title>.md` with migration plan. Material changes to the `WorkspaceBillingAddon` shape or to managed-AI credit economics re-trigger the 30-day public-comment window post-public-alpha per [`LICENSING.md`](../LICENSING.md) §10.

**Touched docs:** [`docs/rfcs/README.md`](README.md), [`docs/design/canonical-workspace-billing-addons-surface.md`](../design/canonical-workspace-billing-addons-surface.md), [`docs/design/rfc-companion-documentation-audit.md`](../design/rfc-companion-documentation-audit.md), [`docs/ROADMAP.md`](../ROADMAP.md), [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §8.2, [`docs/README.md`](../README.md), [`packages/module-sdk/README.md`](../../packages/module-sdk/README.md).

---

*RFC-0009 is part of the Umbraculum platform's governance documentation set. See [`docs/rfcs/README.md`](README.md) for the full RFC index and [`docs/design/canonical-workspace-billing-addons-surface.md`](../design/canonical-workspace-billing-addons-surface.md) for the pre-implementation boundary surface.*
