# RFC-0006 — Amend RFC-0002 Decision D — brewery file-move acceleration

**Tier:** Public
**Status:** Accepted 2026-05-21 (pre-public-flip solo-author + core-team approval recorded; this is a living RFC — see §8 Resolution for the change procedure). Scheduled for execution in Week 1 (2026-05-20 → 2026-05-26) of the late-H1-2026 three-week tranche per [`docs/ROADMAP.md`](../ROADMAP.md), bundled with the web-route-shape audit committed in [`docs/design/web-route-group-audit.md`](../design/web-route-group-audit.md).
**Audience:** prospective contributors, third-party module developers, self-hosters, hosted-service customers, evaluators preparing to adopt Umbraculum as a long-term operational dependency.
**Document role:** amendment to RFC-0002's brewery file-move sequencing.

> **Disclaimer.** This RFC is a narrow amendment to [RFC-0002](0002-canonical-module-physical-layout.md) Decision D. It does not relitigate the four committed decisions of RFC-0002 (β layout, naming conventions, `registerModule()` location, the principle of bundling brewery's migration with the second canonical module). It changes only the *calendar* portion of Decision D: which release window the brewery file-move lands in. RFC-0002's sequencing *principle* — "validate β coexistence in the same window the second canonical module ships" — is honored, not overridden, because the second canonical module (`pim`, [RFC-0004](0004-canonical-pim.md)) has already shipped and the third (the `automation` web slice fix) is landing in the same audit tranche.

---

## 1. Summary

This RFC commits to **one decision** and references one piece of bundled work:

- **Decision A — Amend [RFC-0002](0002-canonical-module-physical-layout.md) Decision D: pull the brewery file-move tranche forward from H1 2027 into Week 1 of the late-H1-2026 tranche.** Brewery's `services/api/src/routes/{recipes,inventory,equipment,...}.ts` move to `services/api/src/modules/brewery/routes/`; brewery's `apps/web/app/[locale]/{recipes,inventory,equipment,water-profiles,brewday-steps-settings,ferm-data-integration}/` segments move under `apps/web/app/[locale]/(brewery)/`; brewery native screens move under `apps/native/src/modules/brewery/`. URLs are preserved end-to-end (β semantics: route groups do not affect URLs per RFC-0002 Decision B). Brewery's API surface registers via a single `registerBreweryModule()` call from `services/api/src/app.ts`. Prisma schema for brewery tables remains `public` (RFC-0002 §11.4 deferral retained — this RFC does NOT touch Prisma schema names).

**Bundled work, separately documented:** the architectural decision-of-record for the route-group β disciplines, the URL-segment registry in `@umbraculum/module-sdk`, the `RouteId` growth in `@umbraculum/navigation`, the `(automation)/` and `(pim)/` refactors, the new Cursor plugin rule, and the Week 1 execution plan all live in [`docs/design/web-route-group-audit.md`](../design/web-route-group-audit.md). RFC-0006's commitment surface is narrow on purpose: only the calendar amendment to RFC-0002 D requires governance ratification; the implementing work is captured as an audit + execution plan, not as additional RFC decisions.

This RFC defers nothing. RFC-0002 §11.4's three post-H1-2027 deferrals (full brewery Postgres schema split, ESLint per-module import boundaries, external-repo packaging) remain deferred under their original terms.

---

## 2. Motivation

RFC-0002 Decision D committed to *sequencing principle*, not *calendar date*: brewery's flat surface migrates to β "in the same release window the second canonical module ships." The working assumption was H1 2027 because that was the trajectory in [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §5.2 when RFC-0002 was drafted (2026-05-19). Two project-state changes since RFC-0002 was accepted invalidate the H1 2027 working assumption while *strengthening* the underlying principle:

**Change 1 — The second canonical module already shipped.** [RFC-0004](0004-canonical-pim.md) (Accepted 2026-05-19) allocates `pim` as the 6th canonical-module reserved code; the PIM module's API + Web + Contracts surface landed across Phases A–D on the same day. RFC-0002 D's principle ("bundle the brewery file-move with the second canonical module's arrival") is therefore *due now*, not in H1 2027. Leaving brewery flat after PIM has shipped maintains exactly the failure mode RFC-0002 was written to prevent: half the canonical-module ecosystem on β, half on the legacy flat shape, with no enforced boundary in CI to keep new contributions consistent.

**Change 2 — The route-shape audit introduces a CI collision-check that needs every module registered.** [`docs/design/web-route-group-audit.md`](../design/web-route-group-audit.md) commits the URL-segment registry in `@umbraculum/module-sdk` plus the build-time check at `scripts/check-web-url-segments.ts`. The check is only useful when every module that owns top-level URL segments is registered. Brewery owns 6 top-level web segments (`recipes`, `inventory`, `equipment`, `water-profiles`, `brewday-steps-settings`, `ferm-data-integration`); leaving those unregistered creates a CI blind spot exactly where future collisions are most likely (a new WMS module wanting `/inventory`, an MRP module wanting `/recipes`). Two options were considered for closing the blind spot:

- **Legacy-registration shim** — brewery files stay flat, but `registerWebModule({ code: "brewery", ownedUrlSegments: [...the 6 flat segments] })` runs at boot from a separate platform-bootstrap file. Closes the blind spot without moving files.
- **Pull the file-move forward** — brewery files move into the β layout, and the registration call lives in `services/api/src/modules/brewery/registerBreweryModule.ts` alongside every other module's bootstrap.

The legacy-registration shim option works for the CI gap. It does NOT remove the "two coexisting shapes in the codebase" problem. Under the shim, brewery would be the only module whose physical layout disagrees with its registration call's pretense; the discrepancy compounds as more modules land. The pull-forward option pays the file-move cost once, in the same window the rest of the route-shape work is happening, and removes the dual-shape state of the codebase permanently.

**Cost honesty.** The file-move is real engineering work — estimated 4–5 days of focused effort across ~14 API route files, 6 web segments, and ~6–10 native screens, with cascading import-path updates and test-import updates. This RFC does not pretend the work is free. It claims the work is cheaper *now* (bundled with the route-shape audit's verification campaign, while brewery URLs are pre-empt-fully unchanged by β) than *later* (running standalone against a more complex codebase that has already accumulated additional canonical modules under β).

**What does NOT change.** RFC-0002 D's three rationale bullets remain accurate; only the calendar interpretation flips:

- "No-op restructure teaches nothing" — *honored*. The move is not no-op: it lands alongside the new collision-check infrastructure, the `(automation)/` fixes, and the new `(pim)/` refactor; brewery joins three coexisting β-aligned modules, exercising exactly the cross-module boundary RFC-0002 D wanted validated.
- "PLATFORM-ARCHITECTURE.md §5.2 pairs the moves" — *honored*. PLATFORM-ARCHITECTURE.md §5.2 pairs route-group wrap, `registerModule()` adoption, `@brewery/*` scope split, and module-aware tier limits. Three of those four already shipped (the `@brewery/*` → `@umbraculum/*` scope migration closed 2026-05-19 as sub-plan #9; `registerModule()` is partly built and extended in Week 1; the brewery web slice's route-group wrap IS the brewery file-move). Only "module-aware tier limits" remains for a future RFC. Pulling the file-move forward completes a strictly larger fraction of the §5.2 tranche in Week 1 than RFC-0002 D originally contemplated.
- "RFC-0001 pins brewery as tier 6, not tier 1" — *honored*. The β shape applies identically to tier-6 and tier-1 modules per RFC-0002 §3; this amendment changes only the *when*, not the *what*. Brewery's tier-6 status is recorded in the `code: "brewery"` registration and in the folder name `services/api/src/modules/brewery/` (versus, say, `services/api/src/modules/canonical-brewery/`); the governance distinction stays visible.

---

## 3. Decision A — Amend RFC-0002 Decision D — brewery file-move acceleration (commit)

**[RFC-0002](0002-canonical-module-physical-layout.md) Decision D is amended as follows.** RFC-0002 D's body (§6 of RFC-0002) is *not* rewritten in-place — the original text is preserved as a historical record per [`docs/LICENSING.md`](../LICENSING.md) §10 forward-only amendment principle. This RFC is the authoritative interpretation going forward; cross-references in downstream docs point to RFC-0002 D *as amended by RFC-0006*.

**The amended Decision D, in committed form:**

Brewery DOES migrate to the β layout in Week 1 (2026-05-20 → 2026-05-26) of the late-H1-2026 tranche, bundled with the web-route-shape audit. Specifically:

| From (flat, today) | To (β target) | Owner |
|---|---|---|
| `services/api/src/routes/{brewdaySettings,brewSessions,equipmentProfiles,ingredients,inventory,recipes,recipesExport,recipesImport,recipeWaterComputeAndSave,recipeWaterHubSummary,recipeWaterSettings,styles,waterCalc,waterProfiles}.ts` (14 files) | `services/api/src/modules/brewery/routes/{...}.ts` (same 14 files, same exports) | tier-6 brewery vertical |
| `services/api/src/app.ts` flat brewery `register*` calls | One `registerBreweryModule(app)` call from `services/api/src/modules/brewery/registerBreweryModule.ts` | tier-6 brewery vertical |
| `apps/web/app/[locale]/{recipes,inventory,equipment,water-profiles,brewday-steps-settings,ferm-data-integration}/` (6 segments) | `apps/web/app/[locale]/(brewery)/{recipes,inventory,equipment,water-profiles,brewday-steps-settings,ferm-data-integration}/` (same 6 segments under the route group; URLs unchanged) | tier-6 brewery vertical |
| Brewery native screens under `apps/native/src/` | `apps/native/src/modules/brewery/` (~6–10 screen files, enumerated during Week 1 execution) | tier-6 brewery vertical |

**Registration.** `registerBreweryModule()` calls `registerModule({ code: "brewery", routes: [...the 14 registrar functions], prismaSchema: undefined /* see Prisma below */ })` and `registerWebModule({ code: "brewery", ownedUrlSegments: ["recipes", "inventory", "equipment", "water-profiles", "brewday-steps-settings", "ferm-data-integration"], navEntry: { primarySegment: "recipes", labelKey: "nav.recipes", order: 1 } })`. The registration is the single source of truth for brewery's URL segment ownership and unblocks the CI collision check.

**URL contract.** Every brewery URL is preserved end-to-end. `/en/recipes` still serves the recipes list; `/en/inventory` still serves inventory management; etc. Next.js route groups (`(brewery)/`) do not affect URL paths per RFC-0002 Decision B. No 301 redirects are required. No external link breaks. Brewery's daily-routine use is preserved.

**Prisma deferral retained.** RFC-0002 §11.4 deferred the brewery Postgres schema split (`public.*` → `brewery.*`) to a separate post-H1-2027 migration; RFC-0006 honors that deferral. Brewery tables stay in `public` for now. `registerModule({ prismaSchema: undefined })` is the explicit "no `multiSchema` for brewery yet" marker.

**Native scope.** This RFC commits to brewery's web slice and API slice file-move. The native screen list is enumerated and committed during Week 1 execution; if the count or shape diverges materially from the ~6–10 estimate, the audit decision-of-record records the actual count without re-opening this RFC (it is execution detail, not governance commitment).

---

## 4. What this RFC does NOT do (non-goals)

- **Re-litigate β.** RFC-0002 Decisions A–C remain in force unchanged.
- **Change brewery's tier classification.** Brewery is tier 6 per [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) Decision C; this RFC does not promote brewery to tier 1.
- **Touch the Prisma schema for brewery.** RFC-0002 §11.4 defers the `public.*` → `brewery.*` schema split; that deferral is unchanged.
- **Touch the `@umbraculum/brewery-*` package scope.** Sub-plan #9 closed 2026-05-19 and committed the brewery-vertical package scope (`@umbraculum/brewery-core`, `@umbraculum/brewery-beerjson`, `@umbraculum/brewery-recipes-ui`); this RFC adds no new package renames.
- **Commit module-aware tier limits.** PLATFORM-ARCHITECTURE.md §5.2's fourth bullet ("module-aware tier limits") remains for a future RFC.
- **Wire `eslint-plugin-boundaries` per-module import boundaries.** RFC-0001 §8.3 post-RFC follow-on; not bundled here.
- **Commit the web-route-shape β disciplines or the URL-segment registry shape.** Those are decision-of-record material, captured in [`docs/design/web-route-group-audit.md`](../design/web-route-group-audit.md), not in this RFC's commitment surface. RFC-0006's only commitment is the calendar amendment to RFC-0002 D.

---

## 5. Impact across audiences

Per [`docs/LICENSING.md`](../LICENSING.md) §10's standard impact section structure.

### 5.1 Contributors

Contributors gain a single consistent module shape across brewery, PIM, automation, and any future canonical module. Module ownership becomes path-derived for every module; the "is this brewery flat-surface code or platform code?" question (which today requires reading `services/api/src/routes/*` and inferring) becomes mechanical (path under `services/api/src/modules/brewery/` is brewery; outside is platform). Short-term cost: one large Week 1 PR touching ~50–70 files. Mitigation: the route-shape audit's verification campaign covers brewery's URL preservation explicitly (`/en/recipes`, `/en/inventory`, etc.) so regressions are caught before merge.

### 5.2 Self-hosters

No immediate impact. URLs are preserved; API endpoints are preserved; database schema is preserved. Self-hosted deployments that pin to specific commits will see file paths move in the diff; deployments that pin to released versions see no change in published artifacts.

### 5.3 Module developers

The β shape becomes the only canonical-module-development shape. Documentation and examples (e.g. [`docs/MODULES.md`](../MODULES.md), [`docs/modules/canonical/pim.md`](../modules/canonical/pim.md), the `@umbraculum/module-sdk` README) flip from "β-with-brewery-as-a-flat-exception" to "β-everywhere," reducing the surface area module developers must reason about.

### 5.4 Hosted customers

No immediate impact (no hosted-service customers exist yet pre-public-flip per [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1). Long-term: coherent module folders support faster incident triage and feature rollout per module.

### 5.5 Enterprises

Enterprises auditing codebase structure for compliance reviews get a single uniform module shape that matches RFC-0002 Decision A across all tiers. Tier-6 vertical configurations are visible as the `*/modules/brewery/` folder pattern, matching the convention third-party tier-1/2/4 module repos will follow.

---

## 6. Migration plan

The migration is the Week 1 PR scoped in [`docs/design/web-route-group-audit.md`](../design/web-route-group-audit.md) §3 Phase 4. RFC-0006 does not duplicate that scope; it ratifies that the work is in-scope for Week 1.

Verification gates (per the audit's §3 Phase 8):

1. **CI collision check (`scripts/check-web-url-segments.ts`) is green after brewery registration lands.** Brewery's 6 owned URL segments must be registered and must not collide with platform-reserved segments or other module-owned segments.
2. **All brewery URLs respond as before.** Browser verification matrix asserts `/en/recipes`, `/en/inventory`, `/en/equipment`, `/en/water-profiles`, `/en/brewday-steps-settings`, `/en/ferm-data-integration` all render the same pages they did pre-refactor.
3. **All brewery API endpoints respond as before.** L2 + L4 test suites (`services/api/src/tests/*`) pass against the new module-tree route registration.
4. **`docker compose restart api web` after the file moves.** The post-merge container-restart heuristic from rule `51-restart-dev-server-after-git-tree-mutations.mdc` applies — git operations that mutate many files under the dev container's bind-mounted source tree can race with `tsx watch`.

---

## 7. Alternatives considered

### 7.1 Alternative — keep RFC-0002 D as-is (H1 2027 deferral)

**Rejected because the rationale that produced the H1 2027 calendar has been overtaken by events.** RFC-0002 D's "bundle with the second canonical module" principle is honored *more strongly* by Week 1 acceleration than by H1 2027 deferral, because (a) the second canonical module has already shipped (PIM, RFC-0004), and (b) Week 1 lands the brewery move alongside two other module changes (`(automation)/` fix + `(pim)/` refactor), exercising the cross-module boundary in exactly the way RFC-0002 D's rationale wanted.

### 7.2 Alternative — legacy-registration shim (D4a in the audit's decision matrix)

Brewery files stay flat; `registerWebModule({ code: "brewery", ownedUrlSegments: [...] })` runs from a separate platform-bootstrap file. Closes the CI collision-check blind spot without moving brewery's files.

**Rejected because it leaves the codebase in a permanently-dual state** — every other canonical module's physical layout matches its registration call; brewery would be the only module whose layout disagrees with its registration's pretense. The discrepancy compounds as more modules land and as new contributors read the codebase. Pull-forward pays the cost once; the shim pays it forever in maintenance attention.

### 7.3 Alternative — split brewery's file-move across multiple PRs

Pull the API slice in PR-A, the web slice in PR-B, the native slice in PR-C — each separately reviewable.

**Rejected because the verification cost is per-PR, not per-file.** Each PR would re-run the full browser-verification matrix, re-run the L2+L4 test suite, re-run the CI collision check, re-trigger `docker compose restart api web`. The single-tranche cost (one verification campaign) is materially lower than three. The audit decision-of-record's D5 = D5a single-tranche choice already considered and selected this trade-off.

### 7.4 Alternative — wait for the docs site (Week 2) before amending RFC-0002

Defer this amendment to Week 2 so the new RFC renders under the Docusaurus site that launches in Week 2 (RFC-0005).

**Rejected because the amendment is operationally needed in Week 1.** The Week 1 file-move PR cannot land without an RFC ratifying the calendar amendment — otherwise it silently contradicts the most-recent governance commit (RFC-0002 D). Authoring the amendment AFTER the implementing PR would invert the governance discipline this project's RFC process is built to maintain. The RFC renders on GitHub today and will render under `docs.umbraculum.dev` when Week 2 ships; no information is lost.

---

## 8. Resolution

**Status: Accepted 2026-05-21.**

Decision A is committed. Implementers MUST treat the brewery file-move as in-scope for Week 1 (2026-05-20 → 2026-05-26). [RFC-0002](0002-canonical-module-physical-layout.md) Decision D's original text remains intact as a historical record; downstream docs that cite RFC-0002 D should add a parenthetical "as amended by RFC-0006" when the calendar is the load-bearing point.

The 30-day public-comment period in [`docs/LICENSING.md`](../LICENSING.md) §10 applies post-public-alpha (target: July 2026 per [`docs/ROADMAP.md`](../ROADMAP.md) §"Late H1 / July 2026"). Until then, solo author drafts → core team reviews → core team approves; this RFC was written as if it WILL be public-readable so the public alpha re-publishes without rewrite.

**Change procedure for this RFC.** Successor RFC at `docs/rfcs/NNNN-<title>.md` with motivation, alternatives, impact, migration plan. Amendments that change Decision A (the brewery-file-move calendar commitment) are themselves narrow-amendment material and follow the same shape as this RFC amends RFC-0002 D.

---

## 9. Touched docs (sweep summary)

Documentation cross-reference sweep for RFC-0006 (applied on acceptance, 2026-05-21):

- **NEW**: `docs/rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md` (this file).
- **NEW (companion)**: [`docs/design/web-route-group-audit.md`](../design/web-route-group-audit.md) — decision-of-record for the route-shape audit and execution detail RFC-0006 references.
- **Substantive cross-ref**: [`docs/rfcs/0002-canonical-module-physical-layout.md`](0002-canonical-module-physical-layout.md) §6 — annotate Decision D as "amended by RFC-0006"; add §6.1 pointer to the amended interpretation; preserve original §6 text unchanged.
- **Index update**: [`docs/rfcs/README.md`](README.md) §2 — add RFC-0006 row; the README §4 forward-reference to "a successor RFC amending RFC-0002 D" resolves to this RFC.
- **Cross-ref amendment**: [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §5.2 — note that the brewery file-move portion of the H1 2027 tranche lands in late-H1-2026 Week 1 per RFC-0006.
- **Cross-ref amendment**: [`docs/MODULES.md`](../MODULES.md) §5.1 — note brewery is now β-aligned; URL-segment registration discipline applies to brewery alongside other canonical modules.
- **Cross-ref amendment**: [`docs/modules/canonical/pim.md`](../modules/canonical/pim.md) — flip PIM's pim/-without-route-group status from "deviation pending audit" to "aligned per RFC-0006 + audit decision-of-record."
- **Cross-ref amendment**: [`docs/design/canonical-pim-module-surface.md`](../design/canonical-pim-module-surface.md) §8.4 — flip from open to closed; URL contract is now `/products/*` etc.
- **Cross-ref amendment**: [`docs/design/canonical-pim-build-log.md`](../design/canonical-pim-build-log.md) — append "Lessons learned" entry on PIM's original URL-axis deviation, fixed by RFC-0006 + audit.
- **Cross-ref amendment**: [`docs/design/canonical-automation-module-surface.md`](../design/canonical-automation-module-surface.md) — record the `/automation/*` → `/vessels/*` URL contract correction landed in the same Week 1 tranche.
- **Cross-ref amendment**: [`docs/NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md`](../NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md) — append a "lessons for plan authors" entry: PIM's URL-axis deviation should have been caught in PRE-execution planning, not post-execution audit; future canonical-module plans must specify β disciplines explicitly.
- **Cross-ref amendment**: [`packages/sdk/module-sdk/README.md`](../../packages/sdk/module-sdk/README.md) — document the extended `registerWebModule({ ownedUrlSegments, navEntry })` surface and remove the stale "H1 2027 migration" reference in the inline docstring of `packages/sdk/module-sdk/src/registerWebModule.ts`.
- **No-change-with-reason**: [`docs/LICENSING.md`](../LICENSING.md) (no license change); [`MANIFESTO.md`](../../MANIFESTO.md) (values unchanged); [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) (runtime validation strategy unchanged); [`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md) (orthogonal); the four sub-plan #9 docs in `docs/design/brewery-scope-migration-*.md` (sub-plan #9 closed 2026-05-19 and committed package scopes only; file moves are this RFC's purview).

---

## 12. Forward amendment (RFC-0010 supersession note)

**2026-05-28 — [RFC-0010](0010-platform-brewery-postgres-schema-split.md) supersedes the Prisma deferral in §3 and §4.** The historical text above (including `prismaSchema: undefined` and "brewery tables stay in `public`") records RFC-0006's intent at acceptance time and is **not rewritten**. Current state: platform tables live in `platform.*`, brewery domain tables in `brewery.*`, and `registerBreweryModule()` sets `prismaSchema: "brewery"`. See RFC-0010 and [`docs/design/platform-brewery-postgres-schema-split.md`](../design/platform-brewery-postgres-schema-split.md) for the migration runbook.

---

*RFC-0006 is part of the Umbraculum platform's governance documentation set. See [`docs/rfcs/README.md`](README.md) for the full RFC index, [RFC-0002](0002-canonical-module-physical-layout.md) for the physical-layout commitment this RFC amends, [`docs/design/web-route-group-audit.md`](../design/web-route-group-audit.md) for the audit decision-of-record and Week 1 execution detail, and [`docs/ROADMAP.md`](../ROADMAP.md) for the late-H1-2026 tranche calendar context.*
