# Contribute — a new canonical module

**Tier:** Public
**Ceremony level:** **High** (the only gated path in the ecosystem).
**Audience:** anyone proposing a new reserved canonical code (e.g. `quality`, `maintenance`, `hr`).

> [!NOTE]
> This page is for **allocating a new canonical code**, not for implementing one of the six already-allocated codes (`mrp`, `wms`, `crm`, `crp`, `automation`, `pim`). For those, see the per-canonical pages — the surface design doc is the immediate next step, not a mini-RFC.

---

## 1. When this path applies

You want to add a new code to `RESERVED_CANONICAL_MODULE_CODES` ([`packages/modules/module-sdk/src/reservedCodes.ts`](../../../packages/modules/module-sdk/src/reservedCodes.ts)). Examples [RFC-0001 §4.2](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) names as plausible-but-not-allocated:

- `quality` — QC, NCR, CAPA.
- `maintenance` — preventive / predictive / asset registry.
- `hr` — workforce, payroll-adjacent.

Adding a canonical code is **forward-only** ([RFC-0001 §6 step 5](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md)) — un-allocation requires a separate de-allocation mini-RFC. The bar is high on purpose: a reserved code is a structural commitment future contributors and external module developers depend on.

If what you're building doesn't *need* to be canonical (i.e. doesn't need to be the *one* implementation of a cross-vertical domain), you almost certainly want [`third-party-module.md`](third-party-module.md) instead.

---

## 2. What canonical means for implementation scope

A canonical module is an **extensible domain kernel**, not a promise that the first implementation is a complete commercial suite for that domain. The first implementation should expose stable primitives, contracts, module registration, extension points, AI-tool hooks, rendering-template hooks when relevant, tier-limit/add-on declarations, and clear ownership boundaries. Vertical configurations and third-party modules build on that surface.

Do not turn a canonical module into a vertical product in disguise. A brewery proof can validate `mrp` or `crp`, for example, but brewery assumptions cannot become canonical invariants unless they generalize cleanly across other process-manufacturing verticals. Likewise, shipping `crp` does not mean the project must ship a full APS optimizer on day one; shipping `mrp` does not mean the project must ship procurement, accounting, WMS, MES, and enterprise planning integrations on day one.

---

## 3. Preconditions — when to start the mini-RFC vs wait

[RFC-0001 §6 (Decision D)](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) lays out the promotion path. In practice, the right time to start the mini-RFC is when **all four** of these are true:

1. **Cross-vertical applicability is demonstrated** — at least two of the platform's vertical configurations (current or imminent) want the same domain primitives. A canonical code with one consumer is a Tier 6 vertical disguised as a canonical.
2. **A reference implementation is underway** at Tier 3 or Tier 4. The mini-RFC is a *promotion* artifact, not a *speculation* artifact ([RFC-0001 §4.2](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) — "added when there is concrete demand and a reference implementation underway, not on speculation").
3. **The consumption contract is satisfiable.** Your domain does not require owning auth, billing, AI orchestration, or any other concern in [RFC-0001 §8.2's](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) per-service table.
4. **The domain is genuinely peer-level**, not a sub-concern of an existing canonical. "Quality alerting" probably belongs inside `automation`; "quality control records with NCR/CAPA workflows" might be a new `quality` canonical.

If you cannot tick all four, the right path today is Tier 3/4 ([`third-party-module.md`](third-party-module.md)), not a canonical mini-RFC.

---

## 4. The mini-RFC — required structure

Create `docs/rfcs/NNNN-canonical-<code>.md`. The number is the next available; copy the section structure from [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) or [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md). At minimum, the mini-RFC contains:

1. **Summary** — the one-sentence commit ("we allocate `<code>` as a reserved canonical module").
2. **Motivation** — concrete cross-vertical demand. Name the verticals; cite the reference implementation. Avoid "we *might* need this" framing — by the time a mini-RFC starts, "we *do* need this" must be defensible.
3. **Domain scope** — what's in scope, what's out of scope, the boundaries with other canonicals (especially the closest neighbors).
4. **Consumption-contract checklist** — explicit confirmation for every row in [RFC-0001 §8.2](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) that you consume the platform service, naming the extension points you'll use if you need more. A mini-RFC without this checklist is incomplete.
5. **Alternatives considered** — at minimum: (a) leave it at Tier 3/4; (b) absorb into an existing canonical; (c) introduce a different code shape. Per [RFC-0001 §10's](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) format.
6. **Impact across audiences** — contributors / self-hosters / module developers / hosted customers / enterprises. Same structure as RFC-0001 §11.
7. **Migration plan** — what changes for existing consumers when this code lands. For a brand-new canonical, this is usually "no migration; net-new code."
8. **Resolution** — left blank until core team approves.

The mini-RFC is written **as if it will be public-readable**, even pre-public-flip — same standard as RFC-0001 and RFC-0002.

---

## 5. Procedure

1. **Draft the mini-RFC** in a branch. Cite the reference implementation.
2. **Solo author drafts → core team reviews → core team approves** (pre-public-flip procedure per [RFC-0001 §13](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md)). Post-public-flip, a 30-day public-comment period applies ([LICENSING.md §10](../../LICENSING.md)).
3. **Once approved**, the code lands in [`packages/modules/module-sdk/src/reservedCodes.ts`](../../../packages/modules/module-sdk/src/reservedCodes.ts) in the same PR as the mini-RFC, alongside any cross-doc reference updates ([RFC-0001 §4](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) reserved-code table, [PLATFORM-ARCHITECTURE.md](../../PLATFORM-ARCHITECTURE.md) §1.1.1 canonical-set sentence, `docs/MODULES.md` catalog).
4. **The implementation work follows**, on the normal phase rhythm: surface design doc → Phase A contracts → Phase B read path → … This is the same trajectory `automation` followed ([`canonical-automation-module-surface.md`](../../design/canonical-automation-module-surface.md) is the worked example).

The mini-RFC allocates the code; the surface design doc and subsequent PRs implement the module. They are separate artifacts.

---

## 6. Common pitfalls

- **Pre-allocating without a reference implementation.** RFC-0001 §4.2 explicitly rejects speculative allocation. If you don't have working code at Tier 3 or Tier 4, you don't have a mini-RFC yet — you have a wish.
- **Naming the code with a vertical-specific prefix.** Canonical codes are *cross-vertical*. `brewery-quality` is not a canonical code; `quality` is. The vertical prefix lives on the Tier 6 vertical configuration's pages and packages, not on canonicals.
- **Treating the first implementation as a full product suite.** Canonical status means the module owns the shared primitives and extension points for a domain. It does not require the first PR sequence to implement every advanced workflow that commercial products in that domain eventually accumulate.
- **Skipping the consumption-contract checklist.** The single most common reason a canonical-allocation proposal fails review is "but we want to own X" where X is a row in RFC-0001 §8.2. The checklist forces you to confront this in writing before review.
- **Drafting the surface design inside the mini-RFC.** The mini-RFC allocates the code; the surface design lives in a separate `docs/design/canonical-<code>-module-surface.md` doc that lands later. Keep the artifacts separate.

---

## 7. Cross-references

- [RFC-0001](../../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §4 (reserved codes), §6 (governance), §8 (consumption contract), §13 (change procedure).
- [RFC-0002](../../rfcs/0002-canonical-module-physical-layout.md) — the layout the new canonical will follow.
- [`docs/design/canonical-automation-module-surface.md`](../../design/canonical-automation-module-surface.md) — surface design template.
- [`packages/modules/module-sdk/src/reservedCodes.ts`](../../../packages/modules/module-sdk/src/reservedCodes.ts) — where new codes land.
- [`docs/MODULES.md`](../../MODULES.md) §6 — governance & license signals.
