# Web route shape audit — decision-of-record

**Tier:** Public
**Status:** v1.0 — Accepted 2026-05-21 (audit verdict + decisions; living document for the post-Week-1 lessons addendum). The audit is paired with [RFC-0006](../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md) (the narrow governance amendment to RFC-0002 D) — RFC-0006 commits the calendar; this doc commits the route-shape disciplines, the URL-segment registry surface, and the Week 1 execution plan.
**Audience:** prospective contributors, third-party module developers, future-self running the next route-shape audit, plugin-pack maintainers, anyone reading the post-Week-1 codebase trying to understand why brewery moved into `(brewery)/` and why PIM moved out of `pim/` into `(pim)/`.
**Owners:** maintainers
**Related:** [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md) (β layout; the route-group convention being audited), [RFC-0006](../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md) (the brewery-file-move calendar amendment), [`docs/design/architectural-audit-template.md`](architectural-audit-template.md) (the six-skeptical-tests template this audit follows), [`docs/design/canonical-pim-module-surface.md`](canonical-pim-module-surface.md) §8.4 (the open-question item this audit closes), [`docs/design/canonical-automation-module-surface.md`](canonical-automation-module-surface.md) (the canonical-automation surface this audit's `/vessels` URL contract supersedes), [`docs/ROADMAP.md`](../ROADMAP.md) Week 1 (the calendar wrapper).

> [!NOTE]
> This document is the decision-of-record for the Week 1 (2026-05-20 → 2026-05-26) route-shape audit and the implementing PR. It captures the architectural disciplines, the URL-segment registry surface, the empirical bugs uncovered in `(automation)/`, the canonical good example `(auth)/`, and the verdict + rationale for each of the audit's five decision points. RFC-0006 is the governance amendment; this doc is the audit substrate the amendment rests on.

---

## 1. Why this audit exists

Three triggers converged in the late-H1-2026 tranche:

**Trigger 1 — PIM shipped without a route group, contradicting RFC-0002 Decision B.** [RFC-0004](../rfcs/0004-canonical-pim.md) accepted on 2026-05-19 and the PIM module's API + Web + Contracts surface landed the same day across Phases A–D. PIM's web slice landed as `apps/web/app/[locale]/pim/page.tsx` (no route group, explicit `pim/` folder, URL prefix `/en/pim/*`) — directly contradicting RFC-0002 Decision B which prescribes `apps/web/app/[locale]/(<code>)/` route groups with URLs unchanged. The deviation was flagged in [`docs/design/canonical-pim-module-surface.md`](canonical-pim-module-surface.md) §8.4 as an open question pending audit; the post-execution discovery is exactly the failure mode RFC-0002 was written to prevent (modules inventing their own shape because the convention's discipline was not enforced).

**Trigger 2 — The `(automation)/` route group ships visible bugs.** Empirical browser verification during planning surfaced two distinct bugs in the existing `apps/web/app/[locale]/(automation)/` layout: a collision between `(automation)/page.tsx` and `[locale]/page.tsx` (both wanting to serve `/en`; Next.js silently picks the Dashboard, leaving the Automation Vessels list functionally unreachable), and a dynamic-segment shadow from `(automation)/[vesselCode]/page.tsx` catching every non-static URL under `/en/*` (`/en/FAKE-CODE` renders the vessel-detail page instead of 404). Both bugs are visible in production-mode container response; both escaped CI because routes return 200 with the wrong content rather than 500. The route-group convention is currently uneven: `(auth)/` is well-formed and bug-free, `(automation)/` is well-intentioned but bugged, `pim/` ignores the convention entirely.

**Trigger 3 — The brewery file-move calendar question.** RFC-0002 Decision D deferred brewery's flat-to-β migration to H1 2027. Pulling it forward closes the CI blind spot the new URL-segment registry needs to be useful and removes a permanently-dual codebase shape. This is RFC-0006's narrow commit.

The audit's job is binary in spirit: SOUND → open the RFC, ship the execution PR; NOT SOUND → leave it alone, tighten the trigger criteria. Verdict in §10: **SOUND**.

---

## 2. What we have today

### 2.1 Route-shape inventory (snapshot 2026-05-20)

| Module / area | Shape | URL contract | Status |
|---|---|---|---|
| `(auth)/` (login, signup, select-workspace, select-account) | Route group, static sub-segments only, NO group-root `page.tsx`, NO group-root dynamic segment | `/en/login`, `/en/signup`, `/en/select-workspace`, `/en/select-account` | **Good** — canonical reference for the convention RFC-0002 B prescribes |
| `(automation)/` (vessels list + vessel detail) | Route group, but has `(automation)/page.tsx` AND `(automation)/[vesselCode]/page.tsx` at group root | Intended `/en/automation` (list) + `/en/automation/<code>` (detail) — but neither actually resolves; see bugs below | **Broken** — Bug 1 (root collision), Bug 2 (dynamic shadow) |
| `pim/` (products list + detail + categories + attribute-sets + attr-set detail) | NO route group, explicit folder, URL prefix `/en/pim/*` | `/en/pim`, `/en/pim/<id>`, `/en/pim/categories`, `/en/pim/attribute-sets`, `/en/pim/attribute-sets/<id>` | **Contradicts RFC-0002 B** — module-code-in-URL is a URL-axis layout the RFC explicitly rejected in favor of filesystem-axis (Decision B "no URL prefix change") |
| Brewery (flat: recipes, inventory, equipment, water-profiles, brewday-steps-settings, ferm-data-integration) | NO route group, segments at `[locale]/` root | `/en/recipes`, `/en/inventory`, etc. | **Deferred** per RFC-0002 D (H1 2027); pulled forward by RFC-0006 |
| Platform (login, signup, ai, platform, about, contact, accessibility, contributing, i18n-contributing) | NO route group, segments at `[locale]/` root | `/en/login`, `/en/ai`, etc. | **Out of module-shape scope** — platform doesn't get a `(platform)/` group; segments live directly under `[locale]/` |

### 2.2 The two empirical bugs in `(automation)/` (Step 0 browser verification)

Verified against `localhost:3000` Web container + `localhost:4000` API container on 2026-05-20:

| URL | Expected (developer intent) | Actual response | Diagnosis |
|---|---|---|---|
| `/en` | `[locale]/page.tsx` (Dashboard) | Dashboard | Works — but `(automation)/page.tsx` is competing for the same URL; Next.js silently picks Dashboard, so the Automation Vessels list is unreachable |
| `/en/automation` | Automation Vessels list (per developer intent — every `Link href="/automation"` in `(automation)/[vesselCode]/page.tsx:98` and `(automation)/page.tsx:145` assumes this) | Vessel-DETAIL page rendering with `vesselCode = "automation"` (heading "Automation", "Back to vessels" link) | **Bug 1 — root collision**; **Bug 2 — dynamic shadow**: `[vesselCode]` catches the literal string "automation" |
| `/en/inventory` | Inventory Management | Inventory Management | Works — static segment beats dynamic per Next.js precedence |
| `/en/FAKE-CODE` | 404 | Vessel-DETAIL page with `vesselCode = "FAKE-CODE"` | **Bug 2 — dynamic shadow**: every non-static URL under `/en/*` is captured by `[vesselCode]`; SEO + analytics + observability all corrupted |
| `/en/pim` | PIM Products list | PIM Products list | Works — but URL-axis layout contradicts RFC-0002 B |
| `/en/login` | Sign in (auth) | Sign in (auth) | Works — `(auth)/` is the canonical good example (only static sub-segments under the group; no `(auth)/page.tsx`; no dynamic at group root) |

### 2.3 The two β disciplines `(auth)/` honors and `(automation)/` violates

Reading `(auth)/` against `(automation)/` against the literal Next.js App Router resolution rules surfaces two disciplines that distinguish "works under RFC-0002 B" from "ships visible bugs":

- **Discipline 1 — No `(code)/page.tsx` at the route-group root.** If `(code)/page.tsx` exists, it resolves to `/en` (because route groups don't contribute path segments per RFC-0002 B), competing with `[locale]/page.tsx`. Next.js silently picks one; the other is unreachable. `(auth)/` honors this discipline; `(automation)/` violates it.
- **Discipline 2 — No `(code)/[dynamicSegment]/page.tsx` at the route-group root.** If `(code)/[dyn]/page.tsx` exists, it resolves to `/en/*` where `*` is any non-static URL — shadowing every other module's static segments that don't yet exist as a literal folder under `[locale]/`. `(auth)/` honors this discipline (it has `(auth)/login/page.tsx`, not `(auth)/[authPath]/page.tsx`); `(automation)/` violates it (`[vesselCode]` at the group root catches `/en/anything`).

Both disciplines are interpretive clarifications of RFC-0002 B, not amendments. RFC-0002 B says "Web route group = `(<code>)/`. Next.js route groups do not affect URLs"; the two disciplines spell out what "doesn't affect URLs" requires in practice to avoid the collision + shadow failure modes.

### 2.4 Three problems with the current registration surface

`packages/modules/module-sdk/src/registerWebModule.ts` is a stub: it accepts only the module `code` and tracks it in a `Set<string>`. The docstring says "navigation metadata land with the H1 2027 migration" — stale because PIM shipped without the H1 2027 work being done, leaving PIM's nav entry to be hand-coded in `apps/web/app/_components/PrimaryNav.tsx`. Three concrete problems:

- **No URL-segment registration.** Modules can claim arbitrary URL segments by adding folders; the second module to want `/inventory` silently shadows the first.
- **No nav-entry registration.** Every new module requires editing `PrimaryNav.tsx` by hand, contradicting RFC-0002's "modules are self-contained" goal.
- **No CI check.** The route-shape conventions (β disciplines + URL-segment uniqueness) are not enforced anywhere; a future contributor can ship a `(myModule)/page.tsx` and CI passes.

---

## 3. What the proposed change looks like in practice

### 3.1 The two β disciplines codified

Plugin rule `46-web-route-shape.mdc` (lands in Week 1 in `umbraculum-platform-tsjs-cursor-assistant`) encodes both disciplines with `(auth)/` as the GOOD example and the pre-Week-1 `(automation)/` as the BAD example:

```text
// BAD — collides with [locale]/page.tsx
apps/web/app/[locale]/(automation)/page.tsx

// BAD — shadows every non-static segment under [locale]/
apps/web/app/[locale]/(automation)/[vesselCode]/page.tsx

// GOOD — static sub-segment inside the route group
apps/web/app/[locale]/(automation)/vessels/page.tsx
apps/web/app/[locale]/(automation)/vessels/[vesselCode]/page.tsx
```

### 3.2 The URL-segment registry surface

`packages/modules/module-sdk/src/registerWebModule.ts` extends to:

```ts
export interface RegisterWebModuleOptions {
  code: string;
  ownedUrlSegments?: readonly string[];
  navEntry?: {
    primarySegment: string;
    labelKey: string;
    order?: number;
  };
}

export function registerWebModule(options: RegisterWebModuleOptions): { code: string };
export function listOwnedUrlSegments(code: string): readonly string[];
export function getSegmentOwner(segment: string): string | undefined;
```

Internal `segmentOwnership: Map<string, string>` detects double-claims at registration time; `scripts/check-web-url-segments.ts` runs the AST-level check against `apps/web/app/[locale]/(*)/` folders at CI time.

### 3.3 Worked examples — three modules registering together

```ts
// services/api/src/modules/automation/registerAutomationModule.ts
registerWebModule({
  code: "automation",
  ownedUrlSegments: ["vessels"],
  navEntry: { primarySegment: "vessels", labelKey: "nav.automation" },
});

// services/api/src/modules/pim/registerPimModule.ts
registerWebModule({
  code: "pim",
  ownedUrlSegments: ["products", "categories", "attribute-sets"],
  navEntry: { primarySegment: "products", labelKey: "nav.pim" },
});

// services/api/src/modules/brewery/registerBreweryModule.ts
registerWebModule({
  code: "brewery",
  ownedUrlSegments: [
    "recipes", "inventory", "equipment",
    "water-profiles", "brewday-steps-settings", "ferm-data-integration",
  ],
  navEntry: { primarySegment: "recipes", labelKey: "nav.recipes", order: 1 },
});
```

If a future WMS module tries `registerWebModule({ code: "wms", ownedUrlSegments: ["inventory"] })`, the `segmentOwnership.set("inventory", "wms")` call throws because brewery already owns it. The build fails at registration time AND at `scripts/check-web-url-segments.ts`.

### 3.4 Three URL-contract corrections that land in Week 1

| Module | Before Week 1 | After Week 1 | Source of correction |
|---|---|---|---|
| `automation` | Intended `/en/automation` + `/en/automation/<code>`; actually shipped broken (Bug 1 + 2) | `/en/vessels` (list) + `/en/vessels/<code>` (detail) | Discipline 1 + 2 applied to `(automation)/` |
| `pim` | `/en/pim`, `/en/pim/<id>`, `/en/pim/categories`, `/en/pim/attribute-sets/<id>` | `/en/products`, `/en/products/<id>`, `/en/categories`, `/en/attribute-sets/<id>` | URL-axis → filesystem-axis (RFC-0002 B alignment) |
| `brewery` | `/en/recipes`, `/en/inventory`, etc. | `/en/recipes`, `/en/inventory`, etc. (unchanged; only filesystem moves under `(brewery)/`) | β-semantics file-move per RFC-0006 |

---

## 4. What is genuinely LOST

Honest inventory.

- **PIM's URL-axis precedent.** PIM was the first module to ship URL-prefixed (`/en/pim/*`). Any external documentation, screenshots, demos, or evaluation material that referenced `/pim` URLs becomes stale. Mitigation: PIM is pre-public-flip; no external link surface exists yet.
- **The "every Link href in `(automation)/` already says `/automation`" pattern.** Five `Link href="/automation/..."` call sites must be rewritten to `Link href="/vessels/..."`. Mechanical but not free.
- **`PrimaryNav.tsx`'s hardcoded list.** The current PrimaryNav has 6 hardcoded entries; the post-Week-1 PrimaryNav still hardcodes 6+ entries (Dashboard, Recipes, Equipment, Vessels, Products, AI, About) — the URL-segment registry can be *read* by PrimaryNav (D2c registry surface), but full nav-from-registry refactor is deferred (the in-scope work is correctness, not registry-driven nav).
- **The "brewery is the only module that's flat" implicit assumption** in code review, in plugin rules, in onboarding docs. After Week 1, brewery is structurally indistinguishable from any other canonical module. This is the *goal*, but it does mean reviewer muscle memory must update.
- **Reversibility friction.** β-discipline file moves are mechanically reversible (a git revert + container restart). The RFC-0006 amendment is reversible via successor RFC. The CI script is reversible by removing one workflow file. The plugin rule is reversible by removing one `.mdc` file and bumping the plugin version. No commitment is permanently sticky; but the brewery file-move's import-path churn means a revert touches ~50 files even though it's "just" a revert.

What is NOT lost: URL contracts for brewery (preserved end-to-end), API endpoint contracts (preserved end-to-end), database schema (no Prisma changes), authentication flow (no `(auth)/` changes), platform package scopes (sub-plan #9 already closed), test suite coverage (paths change; coverage doesn't).

---

## 5. The six skeptical tests

Following [`docs/design/architectural-audit-template.md`](architectural-audit-template.md) §4. Each test asked retrospectively against the matrix the planning conversation worked through.

### 5.1 Test A — Novelty bias

**Question:** Are we recommending the new option because it is *newer* / *trendier* than what we have?

**Evidence:** The RFC-0002 β shape isn't new — it was committed 2026-05-19 (two days before this audit's verdict) and the README §3 of `docs/rfcs/` already anticipates a successor RFC amending RFC-0002 D. The plugin rule we're adding (`46-web-route-shape.mdc`) is the *codification* of disciplines that already exist in `(auth)/` and that RFC-0002 B already prescribes. The URL-segment registry surface extends an existing stub (`registerWebModule()`), it does not introduce a new dependency or framework.

**Verdict:** passes. The recommendation is the project's own existing convention, applied uniformly.

### 5.2 Test B — Cost-estimate honesty

**Question:** Is the cost estimate credible, or am I optimistically lowballing?

**Evidence:** Estimate is 14–18 days in a single PR per Cursor plan `web_route_shape_finalized_0edbdf7e.plan.md` (author-local; not in-repo) §3. Breakdown: Phase 1 (registry infra + RFC + doc) 3–4 days; Phase 2 (automation refactor) 2 days; Phase 3 (PIM refactor) 2 days; Phase 4 (brewery file-move) 4–5 days; Phase 5 (platform + nav) 1 day; Phase 6 (plugin rule) 1 day; Phase 7 (cross-doc updates) 1 day; Phase 8 (verification) 1–2 days. Each phase has explicit acceptance criteria. The 14–18 day estimate is from the planning conversation; reality may run hotter due to test-import path cascades in Phase 4 (brewery has ~400 services/api tests that reference moved paths).

**Worst-case scenarios surfaced:**

- Brewery import-path cascade exceeds estimate → Phase 4 grows from 4–5 days to 7 days.
- `scripts/check-web-url-segments.ts` AST detection has false positives → tuning campaign extends Phase 1 by 1 day.
- A native screen move surfaces a hidden coupling → Phase 4c grows by 1 day per screen affected.
- The plugin rule's discipline check breaks pre-existing `(auth)/` shape (false positive) → Phase 6 grows by 1 day and the rule's discipline-detection logic refines.

Realistic worst case: 21–25 days. The user accepted this risk explicitly in the audit's D4 + D5 decisions ("commit to D4b, single tranche"); the project's pilot status (no public users) mitigates the impact of overrun on external commitments.

**Verdict:** passes with the realistic worst-case noted.

### 5.3 Test C — Intermediate options

**Question:** Have we considered the middle ground between "full adoption" and "no adoption?"

**Evidence:** The planning conversation explicitly worked through 5 intermediate options before committing:

- **D1 = α** (URL-axis modules, drop the route groups) — rejected because it requires a successor RFC reversing RFC-0002 B's "no URL change" commitment AND inflates brewery's H1 2027 migration cost (URL changes for brewery users). PIM was already on this axis but the *project's* convention is the other axis.
- **D1 = γ** (route group AND literal `<code>/` segment inside) — rejected as ugly (worst of both axes).
- **D1 = δ** (bespoke per-module shape) — rejected; defeats the convention's purpose.
- **D2 = D2a** (defer the registry; PrimaryNav direct edits only) — rejected because it leaves the discipline unenforced and the next module's claim on `/inventory` still silently shadows brewery's.
- **D2 = D2b** (minimal registry without build-time check) — rejected because the registry's value is the collision check; without it, the registry is just a documentation overlay.
- **D3 = D3b** (don't grow `RouteId`) — rejected because the new modules become second-class citizens in the typed RouteRef system; consistency loss.
- **D4 = D4a** (legacy-registration shim for brewery) — rejected (see RFC-0006 §7.2); leaves codebase in permanently-dual state.
- **D4 = D4c** (don't register brewery at all) — rejected; CI collision check has a giant blind spot.
- **D5 = D5b** (split into 2 PRs) — rejected per the single-tranche verification campaign cost.

**Verdict:** passes. The matrix explicitly considered 9 intermediate options across 5 decision axes.

### 5.4 Test D — Timing soundness (why NOW vs natural trigger?)

**Question:** What changes between "now" and the next natural trigger window that justifies acting now?

**Evidence:** What does NOT change in the late-H1-2026 → H1 2027 window: the β shape itself, the RFC-0002 conventions, Next.js App Router semantics, Tamagui, Fastify, the canonical-module list.

What DOES change in that window that justifies acting now: (a) Week 2's docs site (RFC-0005) renders RFC-0006 + this audit publicly; (b) Week 3's public-flip cutover (per [`docs/ROADMAP.md`](../ROADMAP.md)) is when third parties may start pinning module URLs in their own evaluations; (c) every additional canonical module that lands BEFORE the route-shape audit increases the eventual migration cost (compounding refactor surface); (d) PIM's URL-axis precedent is already in the codebase — every additional day before the audit normalizes the wrong axis in contributor muscle memory; (e) the new URL-segment registry IS the cheap-cost moment for brewery's file-move (Phase 4 takes 4–5 days bundled vs ~6–7 days standalone because the verification campaign + container restart + plugin rule are paid once).

**Verdict:** passes. Timing is dominated by "Week 3 public-flip" + "compounding refactor surface as more modules land before the audit"; both push toward NOW.

### 5.5 Test E — Stakeholder buy-in

**Question:** Have the people most affected by the change been consulted?

**Evidence:** Pre-public-flip the project is solo-author + core-team. The audit's matrix was worked through interactively with the project lead; all 5 decisions were explicitly committed during the planning conversation. The audit's verdict in §10 is the lead's verdict, recorded.

**Verdict:** passes (within the pre-public-flip governance shape).

### 5.6 Test F — Reversibility

**Question:** If the verdict turns out to be wrong, how expensive is the reversal?

**Evidence:** RFC-0006 amendment is reversible via successor RFC (small governance overhead). β-discipline file moves are mechanically reversible (git revert + container restart). The CI script is reversible by removing one workflow file. The plugin rule is reversible by removing one `.mdc` file. The URL-segment registry is reversible by reverting the `module-sdk` extension (the existing code-only stub stays valid). The most expensive thing to reverse is PIM's URL-contract correction (`/en/pim/*` → `/en/products/*`) — under pilot status with no public users, this is acceptable; post-public-flip it would require a 301 redirect plan.

**Verdict:** passes under pilot status; the reversibility-cost differential vs the deferral cost favors acting now.

---

## 6. The five decisions (committed)

The planning conversation worked the matrix to closure; this audit records the verdicts:

### 6.1 D1 — Architectural axis

**Verdict: β (filesystem-axis, route group `(<code>)/`).** Module identity is filesystem-only; URLs are global. Two disciplines (no group-root `page.tsx`, no group-root dynamic segment) make β bug-free in practice. `(auth)/` is the canonical good example.

Rejected: α (URL-axis), γ (route group + literal segment), δ (bespoke).

### 6.2 D2 — URL-segment registry shape

**Verdict: D2c (full URL-segment reservation + build-time CI collision check).** Extend `registerWebModule({ ownedUrlSegments, navEntry })` in `packages/modules/module-sdk/`; write `scripts/check-web-url-segments.ts` that fails build on (a) any segment registered by two modules, (b) any `(code)/<static-segment>/` folder not registered, (c) any `(code)/page.tsx` existing (Discipline 1 violation), (d) any `(code)/[<dynamic>]/page.tsx` at group root (Discipline 2 violation).

Rejected: D2a (defer registry — leaves discipline unenforced); D2b (registry without build-time check — registry's value IS the check).

### 6.3 D3 — `@umbraculum/navigation` RouteId growth

**Verdict: D3a (add minimum new RouteIds).** Add `vessels`, `vesselDetail`, `products`, `productDetail`, `categories`, `attributeSets`, `attributeSetDetail` to `RouteId`, `RouteParamsById`, and `routeToPath`. Add TODO + forward-pointer noting this hardcoded growth is the next-RFC module-registry refactor's responsibility.

Rejected: D3b (defer — new modules become second-class in the typed RouteRef system).

### 6.4 D4 — Brewery file-move calendar

**Verdict: D4b (pull brewery file-move forward into Week 1).** Brewery API + Web + Native slices move into β layout this week. Successor RFC-0006 amends RFC-0002 D's calendar interpretation (the principle stays; only the H1 2027 working assumption flips to late-H1-2026 Week 1).

Rejected: D4a (legacy-registration shim — leaves codebase permanently dual-shaped); D4c (don't register brewery — CI blind spot).

### 6.5 D5 — Single tranche vs split

**Verdict: D5a (single tranche / single PR).** All 8 phases ship together; verification campaign runs once against the post-refactor codebase.

Rejected: D5b (split — three review cycles, verification-cost-per-PR not per-file).

---

## 7. The Week 1 execution plan (forward-pointer)

The execution detail (phase-by-phase, file-by-file, with acceptance criteria and risks) lives in Cursor plan `web_route_shape_finalized_0edbdf7e.plan.md` (author-local; not in-repo) — 8 phases, 14–18 days estimated, ~50–70 files touched, single PR. This audit doc and RFC-0006 do not duplicate that plan; together the three docs (RFC + audit + plan) form the Week 1 commitment surface.

Summary of the eight phases:

1. Registry infrastructure + RFC + decision-of-record (this doc + RFC-0006 + module-sdk extension + CI script).
2. `(automation)/` refactor (move page → vessels/page; fix Link hrefs; register).
3. `(pim)/` refactor (move from `pim/` to `(pim)/`; split into static sub-segments; register).
4. Brewery file-move (API + Web + Native; register).
5. Platform + nav (register platform segments; grow RouteId; update PrimaryNav).
6. Plugin rule `46-web-route-shape.mdc` + version bump.
7. Cross-doc updates (RFC-0002, MODULES.md, PLATFORM-ARCHITECTURE.md, canonical-pim, canonical-pim-build-log, canonical-automation, NON-FRONTIER-EXECUTOR-FITNESS-TRACKER, module-sdk README).
8. Verification (CI collision check; browser matrix; nav-click traversal; npm test; API smoke; grep anti-pattern absence).

---

## 8. Plugin-pack handoff

The two β disciplines become a hard rule in `umbraculum-platform-tsjs-cursor-assistant` as `46-web-route-shape.mdc` (Phase 6). The rule's structure:

- **Trigger.** `alwaysApply: true` for files matching `apps/web/app/[locale]/**/*.{ts,tsx}`.
- **Discipline 1.** No `apps/web/app/[locale]/(<code>)/page.tsx`. Anti-example: the pre-Week-1 `(automation)/page.tsx`. Symptom: silent collision with `[locale]/page.tsx`; the module's "root" page is unreachable.
- **Discipline 2.** No `apps/web/app/[locale]/(<code>)/[<dynamic>]/page.tsx` at the group root. Anti-example: the pre-Week-1 `(automation)/[vesselCode]/page.tsx`. Symptom: shadowing every non-static URL under `/en/*`; `/en/FAKE-CODE` rendering the module's detail page instead of 404.
- **Discipline 3.** Module web slices MUST call `registerWebModule({ code, ownedUrlSegments, navEntry? })` from the module bootstrap. The CI script `scripts/check-web-url-segments.ts` enforces this and the collision check.
- **Canonical good example.** `(auth)/` — only static sub-segments under the group; no `(auth)/page.tsx`; no dynamic at group root.
- **Canonical bad example (frozen as a teaching reference).** The pre-Week-1 `(automation)/` state — both Discipline 1 and Discipline 2 violations in the same module; demonstrates how the failure modes manifest.

Plugin version bumps once Week 1 lands: `umbraculum-platform-tsjs-cursor-assistant` minor version bump; README "Notable rules" section adds rule 46; version-history entry.

---

## 9. Open questions for follow-up (NOT in scope for Week 1)

These are explicitly out-of-scope for Week 1 and deferred to a future RFC or audit. The audit verdict in §10 is not contingent on resolving any of them.

- **Full nav-from-registry refactor.** PrimaryNav today reads a hardcoded list; the URL-segment registry could drive nav rendering, but doing so well requires a typed nav-metadata contract that touches `@umbraculum/navigation`. Deferred to a successor RFC, ideally bundled with the open `(crp)/` module work in H2 2026.
- **Platform-pseudo-module registration.** Phase 5 calls `registerWebModule({ code: "platform", ownedUrlSegments: [...the 10+ platform segments] })`. If `assertValidModuleCode` rejects non-canonical codes, the implementation either widens the validator or introduces a `markAsPlatformReservation: true` flag. Either choice is execution detail; Week 1 will record the actual approach in this doc's post-Week-1 addendum.
- **~~The `apps/web/app/page.tsx` and `apps/web/app/recipes/**` non-locale routes.~~** **Resolved 2026-06** — legacy flat `apps/web/app/recipes/**` consolidated into `(brewery)/recipes/**`; tree deleted. See [`web-brewery-tree-consolidation-inventory.md`](web-brewery-tree-consolidation-inventory.md). The non-locale `apps/web/app/page.tsx` root redirect remains a separate follow-up if needed.
- **Mobile-shell route shape (`apps/native/`).** Native screens use a different navigation surface; the route-group convention applies only to web. Phase 4c moves brewery's native screens under `apps/native/src/modules/brewery/`, but the broader "what is the native equivalent of route groups?" question is open.
- **Future module-aware tier limits.** PLATFORM-ARCHITECTURE.md §5.2's fourth bullet remains unresolved; the URL-segment registry's `navEntry` shape is intentionally minimal so it can extend later without breaking change.

---

## 10. Verdict

**Verdict: SOUND.**

The audit recommends:

1. Open [RFC-0006](../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md) — Accepted 2026-05-21 in parallel with this audit's acceptance.
2. Execute the Week 1 PR per Cursor plan `web_route_shape_finalized_0edbdf7e.plan.md` (author-local; not in-repo).
3. Land plugin rule `46-web-route-shape.mdc` in `umbraculum-platform-tsjs-cursor-assistant` alongside the implementing PR.
4. Append a post-Week-1 lessons addendum to this doc when the PR merges.

**Structural caveats the verdict rests on:**

- The 14–18 day Week 1 estimate carries a realistic worst case of 21–25 days; if Week 1 overruns, Weeks 2–3 of the late-H1-2026 tranche slide one-for-one per [`docs/ROADMAP.md`](../ROADMAP.md) — RFC-0005 acceptance and the public-flip cutover both tolerate the slip.
- The verdict assumes pilot status (no public users); a post-public-flip identical audit would weight URL-contract changes (`/en/pim/*` → `/en/products/*`) more heavily and likely defer some of the URL renames.
- The verdict does NOT amend RFC-0002 B (the route-group convention) — only RFC-0002 D (the calendar). If the disciplines codified here turn out to need RFC-level governance (e.g. third-party modules contest them), a successor RFC promotes them from plugin-rule to RFC commitment.

---

## 11. Sign-off

- **Date:** 2026-05-21
- **Reviewer:** project lead (pre-public-flip solo-author governance per [`docs/LICENSING.md`](../LICENSING.md) §10)
- **Verdict:** SOUND
- **Successor RFC:** [RFC-0006](../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md) (Accepted 2026-05-21)
- **Implementing plan:** Cursor plan `web_route_shape_finalized_0edbdf7e.plan.md` (author-local; not in-repo)
- **Frozen after sign-off:** §1–§10 are the audit substrate; the post-Week-1 lessons addendum lands in a §12 appended after the implementing PR merges.

---

*This audit is part of the Umbraculum design-document set. See [`docs/design/`](.) for siblings, [`docs/rfcs/`](../rfcs/) for the governance artifacts this audit references, and [`docs/ROADMAP.md`](../ROADMAP.md) for the calendar context.*
