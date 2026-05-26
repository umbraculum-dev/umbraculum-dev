# RFC-0003 — Validation-library adoption

**Tier:** Public
**Status:** Accepted 2026-05-19 (Phase 1 spike landed paper-design with PASS verdict on all three falsifiable tests; container-side bundle measurement pending as follow-up F7. This is a living RFC — see §15 Resolution for the change procedure.)
**Audience:** prospective contributors, self-hosters, third-party module developers, hosted-service customers, and anyone evaluating Umbraculum as a long-term operational dependency.
**Document role:** canonical runtime-validation decision for contracts packages and schema-bound API routes.

> **Disclaimer.** This RFC commits the project's runtime-validation discipline at the toolset-baseline tier. It supersedes the "stay on hand-rolled" decision recorded in [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) v1.0–v1.2 (audit history preserved). The change procedure mirrors [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §13 and [`docs/LICENSING.md`](../LICENSING.md) §10.

---

## 1. Summary

This RFC commits to **seven decisions** and defers one cluster of follow-on work:

- **Decision A — Adopt schema-driven runtime validation.** Replace hand-rolled `parseX(unknown): X` parsers and inline route validation with a single schema library across `packages/*-contracts/` and `services/api/src/routes/`.
- **Decision B — Library choice: Zod v4** (prior; subject to Phase 1 spike confirmation against Valibot per audit §5.6 falsifiable tests).
- **Decision C — `@umbraculum/module-sdk` exposes a library-agnostic `ValidatedSchema<T>` interface.** Internal codebase commits to one library; third-party module developers may use any library that satisfies the interface (option (iii) from the audit).
- **Decision D — Migration sequencing: four PRs**, in the order: contracts → automation-contracts → Fastify routes + internal clients → module-SDK interface.
- **Decision E — Plugin-pack rules from [`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md) §8 are co-authored on the new pattern during migration**, not retrofit afterward.
- **Decision F — Error-shape: direct migration to the chosen library's error envelope.** No permanent bridge layer. Internal `apps/web` + `apps/native` clients update in the same PR window (lead-confirmed 2026-05-19; software is pre-release, no external clients).
- **Decision G — Foundation-hardening synthesis update:** validation becomes a fifth landed slice in `docs/FOUNDATION-HARDENING.md`, with its own CI gate (lint rule) and its own plugin-pack discipline.

The deferred cluster (§10) covers OpenAPI generation, the Zod v5 tracker, and the public plugin-pack distribution story — all explicitly out-of-scope of this RFC because they are gated on the July 2026 public-alpha milestone.

---

## 2. Motivation

[RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) committed the conceptual module model. [RFC-0002](0002-canonical-module-physical-layout.md) committed the physical layout: five `@umbraculum/<code>-contracts/` packages plus a `@umbraculum/module-sdk` with `registerModule()`. [`docs/design/canonical-automation-module-surface.md`](../design/canonical-automation-module-surface.md) is the first canonical-module surface design (accepted 2026-05-19); its Phase A landed `packages/automation-contracts/` on the same day.

The contracts-validation strategy ([`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) v1.0–v1.2) committed to hand-rolled validators in May 2026 and re-confirmed twice (2026-05-16, 2026-05-18). Both re-confirmations were correct under the project state they audited. The re-confirmation pattern was calibrated to a steady-state assumption that has since been invalidated:

**What changed.** The 2026-05-18 milestone-aligned audit recorded the validation question as orthogonal-axis (not a slice). Within 24 hours:

- [RFC-0002](0002-canonical-module-physical-layout.md) accepted (β layout + 5 canonical-module contracts packages by H1 2027 + `@umbraculum/module-sdk` to be designed with or before the second canonical module).
- [`docs/design/canonical-automation-module-surface.md`](../design/canonical-automation-module-surface.md) accepted (Phase A landed `packages/automation-contracts/` as the *template* every future module-contracts package will copy from).

The project's trajectory is no longer "8 parsers + 28 routes, steady-state." It is "5+ contracts packages + ~50 routes + public module-SDK + third-party-developer audience post-H1-2027 public flip." Under that trajectory, hand-rolled becomes the wrong shape — not because hand-rolled is incorrect (it is correct; the types slice tightened compile-time guarantees on every existing parser), but because it does not extend.

A skeptical audit was conducted ([`docs/design/validation-library-adoption-audit.md`](../design/validation-library-adoption-audit.md), 597 lines) before opening this RFC. The audit's verdict — SOUND with one structural caveat (option (iii) library-agnostic SDK interface) — is the evidence base for this RFC. **When this RFC and the audit disagree, the audit is the deeper analysis; this RFC is the commitment artifact.**

**Why now, not at H1 2027.** Three of the five upcoming `@umbraculum/<code>-contracts/` packages and the entire `@umbraculum/module-sdk` design happen between 2026-Q3 and 2027-Q1. If we author them on hand-rolled and then migrate at H1 2027, the migration is ~300–500 hours under public-flip launch pressure. If we adopt now, the migration is ~80–140 hours of focused pre-trajectory work. Cost asymmetry favors acting now by ~3× (audit §5.5).

---

## 3. Decision A — Adopt schema-driven runtime validation (commit)

**Replace hand-rolled `parseX(unknown): X` parsers and inline route validation with a single schema library across all `packages/*-contracts/` and all routes in `services/api/src/routes/`.**

The library is contract-defined by Decision B; the *pattern* is decision A.

**Pattern shape:**

- Each contracts module exports a `FooSchema` (schema) and a `Foo` type (inferred via the library's type-inference helper).
- Existing `parseFoo(v: unknown): Foo` exports are preserved as thin wrappers (`return FooSchema.parse(v)`) during migration to minimize call-site churn at consumer call sites in `apps/web` and `apps/native`.
- Server-side route validation moves from hand-rolled `BadRequestError(code, message)` to framework-driven `schema: { body, query, params, response }` declarations.
- Drift-detection logic (duplicate-detection in `MAILBOX_SPEC`, etc.) is expressed via library primitives (`superRefine` / `pipe` / equivalent), not external pre-validators.

**Rationale.**

- The types slice (Phases 6f + 6g enabled `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` on `packages/contracts`) closed the *correctness* gap on hand-rolled parsers. Under maximally-strict TypeScript, hand-rolled and schema-driven are equally correct. The remaining gaps are *ergonomics* and *ecosystem fit*, both of which compound with the project's trajectory toward 5+ contracts packages and a public module-SDK.
- A single source of truth (the schema) eliminates the drift class where the type declaration and the parser implementation evolve independently. Hand-rolled requires manual synchronization between an `interface Foo {...}` and a separate `parseFoo()` function; schema-driven makes them one artifact.
- Schema libraries provide standard primitives (discriminated unions, partial / pick / omit / extend, transform, refine) that hand-rolled validators duplicate per-file. The discriminated-union case in [`packages/contracts/src/water/parseComputeAndSave.ts`](../../packages/contracts/src/water/parseComputeAndSave.ts) lines 207–235 is a 30-line hand-rolled equivalent of a 12-line `z.discriminatedUnion(...)` call (audit §3.2).

**Rejected: stay on hand-rolled with tightened triggers.** Audit §5.3 option (iv). Defensible at the technical level but fails the toolset-coherence framing — the plugin-pack rules from [`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md) §8 are unbuilt and would have to be authored on a pattern that will change within 6 months. Net cost of "wait for natural trigger": ~70 hours of work that gets redone; loss of one coherent rollout window.

**Rejected: "light Zod" / side-by-side (audit §5.3 options (i), (ii)).** Both produce dual-pattern coexistence in the same repo, which the [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) con #3 already named as worst-of-both-worlds.

---

## 4. Decision B — Library choice: Zod v4 (commit, contingent on spike)

**The chosen library is [Zod v4](https://zod.dev/v4/)** (MIT-licensed, maintained by Colin McDonnell and a 470-contributor community), pending Phase 1 spike confirmation against Valibot under the falsifiable tests in audit §5.6.

**Why Zod v4 (prior):**

- **Ecosystem gravity.** Zod is the de-facto TypeScript runtime-validation library as of 2026. `fastify-type-provider-zod` is mature; `zod-to-openapi` exists and Zod v4 ships first-party OpenAPI support; every TypeScript-aware AI assistant recognizes `z.object(...)` patterns. The "AI-assisted module development" framing (third-party developers using AI assistants to scaffold modules against `@umbraculum/module-sdk`) makes this materially valuable.
- **Bundle size.** Zod v4 ships at ~5 KB gzipped (standard) or ~4 KB (Mini) — meaningful improvement from Zod v3's ~14 KB. Realistic shape complexity for the contracts surface (water profiles, gravity analysis, mash/sparge/boil compute, mailbox spec) lands in the 4–13 KB gzipped range per the [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) 2026-05-16 audit.
- **License fit.** MIT — universally compatible with both Umbraculum's AGPLv3 core and MIT SDK tiers per [`docs/LICENSING.md`](../LICENSING.md) §6.1–§6.2. Zero supply-chain license concerns for any consumer (including closed-source third-party modules per §7.3 of the licensing doc).
- **Project health.** Zero runtime dependencies (deliberate); v4 stable; ~470 contributors (sufficient bus-factor); active development through at least 2026-02-15.

**Valibot comparison axis (Phase 1 spike will verify):**

- **Bundle:** ~2 KB per-schema (modular). Tree-shake-aware bundlers may produce smaller results than Zod's monolithic-but-tree-shakable shape.
- **Type inference:** comparable to Zod.
- **Ecosystem:** newer and growing; `@valibot/to-json-schema` exists for OpenAPI; Fastify provider exists but less battle-tested than `fastify-type-provider-zod`.
- **AI-assistant recognition:** lower than Zod (smaller training-data footprint).

**Decision authority:** the Phase 1 spike (RFC-0003 §15 Resolution) selects between Zod v4 and Valibot based on the audit §5.6 falsifiable tests. If both pass all stop conditions, Zod v4 wins on the ecosystem-gravity argument. If Zod v4 fails any test that Valibot passes (most likely: bundle delta on `apps/native`), Valibot becomes the choice.

**TypeBox** (the schema-first Fastify-native alternative) is considered and rejected for the internal-codebase choice: TypeBox is JSON-Schema-shaped and reads as alien to TypeScript-native module developers; its OpenAPI story is best but its ergonomic story is worst. TypeBox remains valid for third parties who choose it via Decision C's library-agnostic interface.

**Rejected: defer library choice until after public flip.** Same as Decision A's rejected alternative; loses the toolset-coherence window.

---

## 5. Decision C — Library-agnostic SDK interface (commit)

**`@umbraculum/module-sdk` exposes `interface ValidatedSchema<T> { parse(input: unknown): T }` as the boundary contract for module-registered schemas. Third-party module developers may use any library that satisfies this interface — Zod, Valibot, TypeBox, or hand-rolled.**

```typescript
export interface ValidatedSchema<T> {
  parse(input: unknown): T;
}

export interface RegisterModuleOptions {
  code: string;
  routes: ModuleRouteRegistration[];
  prismaSchema?: string;
  registerAiTools?: (registry: AiToolRegistry, app: unknown) => void;
  tierLimits?: (tier: Tier) => TierLimitsSlice;
  addonCodes?: string[];
}
```

**Rationale.**

- Zod schemas satisfy `ValidatedSchema<T>` by construction (`Schema.parse` already has the required signature). Valibot, TypeBox, and hand-rolled parsers can satisfy it via a one-line adapter.
- The internal Umbraculum codebase still commits to one library (Decision B) for consistency, plugin-pack alignment, and tooling investment. The library-agnostic interface costs the internal codebase nothing — Zod schemas naturally satisfy it.
- Third-party module developers retain library autonomy. A future better library can be adopted by a third party without requiring an SDK major-version bump.
- This option (iii from audit §5.3) was the audit's most important structural catch; it weakens the lock-in pressure of Decision B while preserving its toolset-coherence benefits.

**What this is *not*.** The library-agnostic interface does not mean Umbraculum is library-agnostic. The internal codebase uses Zod v4 (per Decision B). Documentation in `@umbraculum/module-sdk/README.md` shows the Zod pattern as the recommended path with a one-line note that alternative libraries are supported.

**Rejected: force third parties to use the same library as the internal codebase.** Cuts off long-term ecosystem flexibility for zero internal-codebase gain.

**Rejected: no library commitment at all (anything satisfying `ValidatedSchema<T>`).** Defeats the plugin-pack discipline and AI-assistant pattern recognition — internal contributors and AI assistants would have no canonical pattern to encode.

---

## 6. Decision D — Migration sequencing: four PRs (commit)

**Four migration PRs, in the order below.** Each PR is independently typechecked, tested, and reviewable; partial state (PRs 1+2 landed, 3+4 pending) is a valid intermediate.

| PR | Scope | Estimated effort | Plugin-pack co-land |
|---|---|---|---|
| **PR 1** | `packages/contracts/` — 8 parsers + 38 unit tests + ~25 consumer call sites in `apps/web` and `apps/native` | ~3 days | Plugin rule `22-typescript-contracts-runtime-validation.mdc` rewritten + new lint rule (`no-restricted-syntax` forbidding hand-rolled drift in `packages/*-contracts/`) |
| **PR 2** | `packages/automation-contracts/` — `mailbox-data.ts` (168→~55 lines) + `mailbox.ts` types collapse to `z.infer` + 28 mailbox tests | ~2 days | Plugin skill `scaffold-contracts-package` |
| **PR 3** | `services/api/src/routes/` — 28 routes + `fastify-type-provider-zod` adoption + ~30 route-local `assert*` helpers + `apps/web` + `apps/native` client updates (no bridge layer) + ~80–100 integration tests | ~5 days | New plugin rule `<NN>-fastify-route-schema-validation.mdc` |
| **PR 4** | `packages/module-sdk/` — `ValidatedSchema<T>` interface + `RegisterModuleOptions` (concurrent with sub-plan #9 module-SDK design) | ~1–2 days | Library-agnostic interface documented in `packages/module-sdk/README.md` |

**Rationale for this order:**

- **Contracts before routes.** `packages/contracts/` is the upstream dependency; routes consume contract types. Migrating contracts first means the route migration in PR 3 reads typed schemas already in the library's shape.
- **Automation-contracts second.** The freshest contracts package + the template for the next 4 canonical-module contracts packages. Migrating it second establishes the canonical pattern for module-contracts packages before PR 3 amplifies the surface.
- **Routes third (biggest single PR).** The 28-route migration + internal-client coordination is the highest-risk PR; landing PRs 1+2 first means the schemas it consumes are stable.
- **Module-SDK fourth, concurrent with sub-plan #9.** The library-agnostic interface only needs to be present before the second canonical module's contracts package is authored against the SDK. Sub-plan #9 (`@brewery/*` → `@umbraculum/*` scope rename) is the natural co-landing window.

**Rejected: big-bang migration in one PR.** Strategy doc anti-pattern; unreviewable; mixes architectural change with type-system change.

**Rejected: routes first, then contracts.** Inverts the dependency direction; routes would consume hand-rolled parsers via schemas, requiring throwaway adapter code.

---

## 7. Decision E — Plugin-pack rules co-authored during migration (commit)

**The plugin-pack rules proposed in [`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md) §8 — currently unbuilt — are authored on the Zod pattern co-landing with the migration PRs that exercise them.** The validation-related rules land *with* their migration PR; the cross-slice rules (§8.1 `02-foundation-hardening.mdc`) land with Phase 4 of the migration plan.

**Co-landing schedule:**

| Migration PR | Plugin-pack artifact |
|---|---|
| PR 1 | Rewrite plugin rule `22-typescript-contracts-runtime-validation.mdc` (was: "do NOT introduce Zod"; becomes: "use Zod v4 schemas, here is the canonical pattern, refer to `docs/CONTRACTS-VALIDATION-STRATEGY.md` v2.0") + new lint rule |
| PR 2 | New plugin skill `scaffold-contracts-package` for new `packages/<code>-contracts/` |
| PR 3 | New plugin rule `<NN>-fastify-route-schema-validation.mdc` + new plugin skill `scaffold-fastify-route-with-schema` |
| PR 4 | Documentation in `@umbraculum/module-sdk/README.md` showing the library-agnostic pattern |
| Foundation update (Phase 4) | Plugin rules `02-foundation-hardening.mdc`, `26-typescript-strict-flags.mdc`, and `45-tsjs-module-readme-standard.mdc`; plugin subagent `validation-baseline-verifier.md`; plugin subagents `types-baseline-verifier.md` + `module-readme-checker.md` (originally proposed in §8.3 and §8.5 of the foundation-hardening doc) |

**Rationale.** Authoring rules *during* the migration that exercises them (rather than *after*) ensures:

- The rule reflects the actual landed pattern, not the proposed pattern.
- The migration PR itself is the worked example the rule references.
- AI-assisted contributors picking up subsequent migration PRs see the rule already in effect.
- The plugin-pack work is not deferred to a separate window where it could be dropped or de-scoped.

**Rejected: defer plugin-pack rewrite until all migration PRs land.** Loses the "migration PR is the worked example" benefit; risks the plugin-pack work being de-prioritized after the migration glow fades.

---

## 8. Decision F — Error-shape direct migration; no bridge layer (commit)

**The migration switches error-shape directly from `BadRequestError(code, message)` to the chosen library's error envelope. No permanent translation layer.** Internal `apps/web` and `apps/native` clients that catch specific error codes are updated in the same PR window as the route they target.

**Rationale.**

- **Pre-release state confirmed by lead 2026-05-19.** Umbraculum has not been released. There are no external clients depending on the `BadRequestError(code, message)` wire format. The only consumers are `apps/web` and `apps/native` (both internal monorepo workspaces) and the integration test suite.
- **A permanent translation layer (the audit's option (a)) adds ~50 lines of ongoing-maintenance code for compatibility with zero external clients.** Pure overhead with no benefit at this project stage.
- **Internal client updates land in the same PR as the route they target.** PR 3 includes the route migration AND the corresponding `apps/web` / `apps/native` call-site updates AND the integration test rewrites. One atomic transition per route family.

**Implementation note for PR 3.** Each route file is migrated together with:

- Its body / query / params schema (declared once at the top of the route file).
- The corresponding integration tests (`services/api/src/tests/*.test.ts`) updated to assert on the new error envelope.
- The `apps/web` and `apps/native` consumers identified via `rg 'BadRequestError\\("<code>"' apps/`. Each match is updated to read the new envelope.
- A 1-line note in the PR description per behavior delta discovered (the audit §3.3 email-validation case is the canonical example).

**Rejected: permanent bridge layer.** Wrong choice at this project stage; useful only if external clients exist (which they do not).

**Rejected: defer client updates to a follow-on PR.** Would leave PR 3 in a broken state at merge time. PR 3 must be atomic.

---

## 9. Decision G — Foundation-hardening synthesis update (commit)

**Validation is promoted from "orthogonal axis" to "landed slice" in [`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md) after the migration completes.**

Concrete changes to the foundation-hardening doc, scheduled for Phase 4 of the migration plan:

- §2 (Four slices at a glance) → table grows to **five slices**: lint, types, tests, docs, **validation**.
- §4 (Slice deep-dives) → add **§4.5 Validation slice deep-dive** mirroring the §4.1–§4.4 structure (bug class owned, outcome, CI gate, plugin-pack alignment).
- §6 (Validation question — orthogonal axis) → header rewritten to "Validation slice — formerly orthogonal axis"; preserve the historical 2026-05-15 / -16 / -18 "hand-rolled re-confirmed" narrative for the audit trail; flip the verdict to record the 2026-XX-XX migration.
- §8 (Plugin-pack manifest) → add **§8.6 Validation slice mapping** listing the rules + skills authored during migration.
- Version banner: v1.1 → **v2.0** (major bump reflecting the addition of a fifth slice).

**Why this matters.** Treating validation as a landed slice (with its own CI gate and plugin-pack discipline) rather than an orthogonal axis ensures the discipline survives contributor turnover, AI-assistant pattern drift, and the July 2026 public-alpha transition. The orthogonal-axis framing was correct for the steady-state assumption that has been invalidated.

---

## 10. What this RFC defers (open follow-ons)

Three clusters of work are explicitly out-of-scope of RFC-0003 and tracked as follow-ups (F1, F2, F3 in the migration plan):

**1. OpenAPI generation.** Now achievable via `zod-to-openapi` or Zod v4 first-party OpenAPI. Tracked for activation when the public module-SDK ships (H1 2027 working assumption per [`docs/ROADMAP.md`](../ROADMAP.md)). Adoption requires a follow-on sub-plan.

**2. Zod major-version migration tracker.** Zod v3 → v4 was a non-trivial migration. When Zod v5 alpha is announced, open a sub-plan for proactive evaluation + scheduled migration. This RFC does not commit to perpetual upgrade.

**3. Public plugin-pack distribution.** Once the plugin-pack rules from Decision E are stable for 30 days post-migration, consider publishing them to a public Cursor plugin marketplace so third-party module developers get the same toolset experience. Extends the "right tools from day one" framing externally. Out of scope of this RFC; tracked as F6.

---

## 11. Cross-references and non-goals

### 11.1 What this RFC builds on (and does NOT relitigate)

- **[RFC-0001](0001-modules-tiers-governance-and-automation-placement.md)** — canonical-module rule, reserved codes, tier model. Validation library choice is invisible to the conceptual module model.
- **[RFC-0002](0002-canonical-module-physical-layout.md)** — β layout (`packages/<code>-contracts/` × N) and `packages/module-sdk/`. RFC-0003 adopts the contracts-package pattern as the migration boundary.
- **[`docs/design/canonical-automation-module-surface.md`](../design/canonical-automation-module-surface.md)** — Phase A's `packages/automation-contracts/` is migrated in PR 2.
- **[`docs/design/validation-library-adoption-audit.md`](../design/validation-library-adoption-audit.md)** — the skeptical audit that produced this RFC's verdict. Audit is the deep evidence; RFC is the commitment.
- **[`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md)** — historical decision-log v1.0–v1.2 (preserved); v2.0 row appended on acceptance of this RFC.
- **[`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md)** §6 (validation as orthogonal axis — historical), §8 (plugin-pack manifest — built on the Zod pattern per Decision E).
- **[`docs/LICENSING.md`](../LICENSING.md)** §6.1–§6.2 — Zod's MIT license is compatible with both AGPLv3 core and MIT SDK tiers; closed-source third-party modules per §7.3 are unaffected.

### 11.2 What this RFC explicitly does NOT do (non-goals)

- **OpenAPI / schema → JSON-Schema export.** Deferred to F1 (§10 above).
- **Replacement of any error-handling framework other than the validation-specific `BadRequestError` paths.** Auth, session, rate-limit, and orchestrator errors are unchanged.
- **Migration of test runners.** vitest stays; only assertions inside tests change shape.
- **Migration of any non-validation runtime library.** Argon2, Prisma, Fastify, Next.js, Expo are all unchanged.
- **Re-litigating RFC-0001's tier model or RFC-0002's β layout.**
- **Selecting a specific version of `fastify-type-provider-zod`.** That is a Phase 1 spike output.

---

## 12. Alternatives considered

For each commit decision, the rejected alternative and why. Audit §5 contains the full skeptical analysis; this section summarizes.

### 12.1 Decision A alternatives

- **Stay on hand-rolled (audit §5.3 option (iv)).** Defensible at the technical level; fails the toolset-coherence framing. Rejected.
- **"Light Zod" / side-by-side coexistence (audit §5.3 options (i), (ii)).** Dual-pattern worst-of-both-worlds per the strategy doc con #3. Rejected.

### 12.2 Decision B alternatives

- **Valibot.** Comparison axis in Phase 1 spike. If Zod v4 fails any stop condition (audit §5.6), Valibot becomes the choice.
- **TypeBox.** Best Fastify + OpenAPI story; worst ergonomic story for TypeScript-native module developers. Rejected for internal-codebase choice; remains valid for third parties via Decision C's interface.
- **Arktype.** String-DSL ergonomic risk + smaller ecosystem. Rejected as long-term toolset commitment.
- **Hand-rolled (no library).** Decision A already rejected this.

### 12.3 Decision C alternatives

- **Force third parties to use Zod.** Locks the ecosystem to one library. Rejected as long-term inflexibility.
- **No library commitment internally (anything satisfying `ValidatedSchema<T>`).** Defeats plugin-pack discipline and AI-pattern-recognition. Rejected.

### 12.4 Decision D alternatives

- **Big-bang single PR.** Unreviewable, mixes concerns. Rejected.
- **Routes-first (then contracts).** Inverts dependency direction. Rejected.

### 12.5 Decision E alternatives

- **Defer plugin-pack rewrite until all migration PRs land.** Loses worked-example coupling. Rejected.

### 12.6 Decision F alternatives

- **Permanent bridge layer (Zod → BadRequestError mapper).** Useful if external clients exist; they do not. Rejected at this project stage.
- **Defer client updates to follow-on PR.** Leaves PR 3 broken at merge. Rejected.

### 12.7 Decision G alternatives

- **Keep validation as orthogonal axis indefinitely.** Was correct under the steady-state assumption that has been invalidated. Rejected post-migration.

---

## 13. Impact across audiences

Per [`docs/LICENSING.md`](../LICENSING.md) §10's standard impact-section structure.

### 13.1 Contributors

After migration, contributors gain a single canonical pattern for boundary validation: declare a Zod schema, infer the type, parse at the boundary. The plugin-pack rule rewrite (Decision E) means AI-assisted contributors see the pattern in their editor before opening the strategy doc. Short-term cost: contributors actively migrating in PR 3 see ~80–100 test-shape updates land in one window.

### 13.2 Self-hosters

No immediate runtime-behavior impact. Self-hosted deployments running against the API see the new error envelope after the migration ships; the change is documented in the next release's CHANGELOG.

### 13.3 Module developers (the most important audience)

After migration:

- The recommended pattern (in `@umbraculum/module-sdk/README.md`) is Zod v4 with full worked examples.
- The `ValidatedSchema<T>` interface (Decision C) preserves library autonomy. Modules may use Valibot, TypeBox, or hand-rolled if they prefer — they implement the interface with a one-line adapter where the library doesn't naturally satisfy it.
- AI-assistant pattern recognition is strongest for Zod, which is the dominant ecosystem choice. Modules authored with AI assistants will default to Zod naturally.

### 13.4 Hosted customers

No immediate impact. Long-term, schema-driven OpenAPI generation (F1 follow-on) enables auto-generated API reference docs for hosted-tier customers.

### 13.5 Enterprises

Enterprises auditing the codebase will see one validation pattern across all routes and contracts packages, with explicit schema-driven contracts at every boundary. The pre-release status as of 2026-05-19 means no migration coordination is required for any production deployment.

---

## 14. Migration plan

The full migration plan lives in `.cursor/plans/validation_library_adoption_<id>.plan.md` (created 2026-05-19 from this RFC's predecessor audit). Phase summary:

| Phase | Scope | Estimated effort |
|---|---|---|
| 1 | RFC-0003 draft + spike | 2–3 days |
| 2 | [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) v2.0 flip | 0.5 day |
| 3 | Migration PRs 1+2+3+4 | 10–15 days (parallelisable to ~11) |
| 4 | [`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md) v2.0 + plugin-pack §8 build | 3 days |
| 5 | Resume canonical-automation-module Phase B-2 on new pattern | 3 days |
| **Total** | | **17–22 working days** |

Compares favorably to the deferred-migration estimate (300–500 hours at H1 2027 under public-flip launch pressure per audit §5.5).

### 14.1 Phase 1 spike — stop conditions (audit §5.6)

The Phase 1 spike implements `MAILBOX_SPEC` + `parseMashAcidBlock` + the `/auth/signup` route in both Zod v4 and Valibot. The spike is a stop-or-proceed gate. Stop conditions:

1. All candidate libraries produce *worse* ergonomics than hand-rolled for `MAILBOX_SPEC` and `parseMashAcidBlock`. → Mark RFC-0003 **Rejected**; tighten triggers in [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md); resume Phase B-2 hand-rolled.
2. Bundle delta on `apps/native` exceeds 10 KB gzipped at realistic shape complexity. → Switch from Zod v4 to Valibot, or reconsider.
3. `fastify-type-provider-zod` has unfixable issues with existing plugins (sessionAuth, rate-limit). → Reconsider library choice or migrate Fastify.

If none of these fire, the RFC stays **Accepted** and Phase 2 begins.

### 14.2 Per-PR rollout

See Decision D table (§6) for per-PR scope and plugin-pack co-landing.

---

## 15. Resolution

**Status: Accepted 2026-05-19** by lead sign-off on the Phase 1 spike paper-design (see §16 evidence). Sign-off carries two follow-up conditions:

1. **Container-side bundle measurement** of [`spike/validation-library/`](../../spike/validation-library/) by `npm run bundle:zod` + `npm run bundle:valibot` (tracked as **F7** in the migration plan). Must confirm Zod gzipped delta ≤ 10 KB on the contracts surface; if fails, RFC-0003 §B rolls back from Zod v4 to Valibot and migration PRs 1–4 are re-scoped accordingly.
2. **Fastify plugin-compat verification** in PR 3 of the migration. Must demonstrate `fastify-type-provider-zod` co-exists with the existing `@fastify/cookie` session pattern and `@fastify/rate-limit` plugin without regressions. If unfixable, route migration uses a thinner per-route `body.parse()` adapter (still Zod-based) instead of the framework type provider.

The 30-day public-comment period in [`docs/LICENSING.md`](../LICENSING.md) §10 applies post-public-alpha (target: July 2026). Until then: lead alone, mirrors the [RFC-0002](0002-canonical-module-physical-layout.md) sign-off pattern.

**Change procedure for this RFC.** Successor RFC at `docs/rfcs/NNNN-<title>.md` with motivation, alternatives, impact, migration plan. The validation library is intended to be stable for ≥5 years; library churn is tracked separately as the F3 follow-on (Zod v5 migration tracker).

**Open follow-ups F1–F9.** The complete list of residual scope (OpenAPI generation, next-audit cadence, Zod v5 tracker, DOCS-README-STANDARDS update, sub-plan #9 alignment, plugin-pack publication, native bundle audit, RFC-0002 §13 refresh, shared test helpers) is maintained in [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) §"Follow-ups (F1–F9)". When any tracker closes, mark it `Done` in that table and update the cross-referencing artifact in the same commit. RFC-0003 stays the canonical commitment artifact; the strategy doc stays the live tracker index.

---

## 16. Phase 1 spike evidence

Spike scaffold at [`spike/validation-library/`](../../spike/validation-library/) — Zod v4 and Valibot side-by-side, both implementing `MAILBOX_SPEC`, `parseMashAcidBlock`, and `/auth/signup`. See [spike README](../../spike/validation-library/README.md) for the full measurement procedure + per-file LOC counts + error-shape comparison.

| Falsifiable test (audit §5.6) | Zod v4 result | Valibot result | Pass / Fail |
|---|---|---|---|
| (1) Ergonomics vs hand-rolled | LOC schema-only: 56 (mailbox), 67 (acid-block), 7 (signup body). Reduction vs hand-rolled: -67% / -48% / -70%. Type inference: byte-equivalent to hand-rolled interfaces under all 6 strict flags. Error shape: structured `path` arrays + machine-readable `code` (richer than hand-rolled string format) | LOC schema-only: 75 / 84 / 9. Reduction vs hand-rolled: -55% / -35% / -61%. Type inference: byte-equivalent. Error shape: structured paths (richer than hand-rolled) | **PASS** for both. Zod wins on ergonomics by ~12% smaller schema-only LOC + chained-method API |
| (2) Bundle delta on `apps/native` ≤ 10 KB gzipped | Paper estimate: 6–8 KB gzipped (Zod v4 standard, contracts-surface tree-shaken). Container-side measurement deferred to F7 follow-up | Paper estimate: 3–5 KB gzipped (Valibot, modular). Container-side measurement deferred to F7 follow-up | **PASS (paper-design)**, **PENDING (container)**. Both libraries' paper estimates are well under the 10 KB stop condition |
| (3) Fastify type-provider compatibility | `fastify-type-provider-zod` mature, well-documented, no known incompatibilities with `@fastify/cookie` or `@fastify/rate-limit`. Spike route file compiles cleanly | Valibot Fastify integration via `@valibot/to-json-schema` + custom validator-compiler. More verbose than Zod (no first-class type provider). Spike route file compiles | **PASS (paper-design)** for both; Zod wins on ergonomics. Full plugin-compat testing deferred to PR 3 of migration |

**Library choice locked: Zod v4.** Deciding factors:

- Ergonomics edge over Valibot (chained API + `.extend()` vs Valibot's pipe-imports-per-primitive verbosity).
- Ecosystem gravity (mature Fastify provider, first-party OpenAPI in Zod v4, ~10× more npm weekly downloads than Valibot as of 2026-05).
- AI-assistant pattern recognition (Zod is the dominant TypeScript-runtime-validation library in 2026; AI-assisted module developers — the explicit audience for the plugin pack — will produce Zod by default).

Valibot remains the documented fallback if F7 (container bundle measurement) shows Zod exceeds 10 KB despite the paper estimate. The spike code in [`spike/validation-library/valibot/`](../../spike/validation-library/valibot/) is preserved as the migration template for that contingency.

---

## 17. Touched docs (sweep summary)

Documentation cross-reference sweep for RFC-0003, applied on draft creation 2026-05-19:

- **NEW**: `docs/rfcs/0003-validation-library-adoption.md` (this file).
- **NEW**: `docs/design/validation-library-adoption-audit.md` (audit; created 2026-05-19 as the evidence base).
- **NEW**: `spike/validation-library/` (Phase 1 spike scaffold; created during this session).
- **Substantive cross-ref**: [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md) — v2.0 decision-log row appended on RFC acceptance; v1.0–v1.2 preserved.
- **Substantive cross-ref**: [`docs/FOUNDATION-HARDENING.md`](../FOUNDATION-HARDENING.md) — flipped to v2.0 post-migration (validation slice promoted from orthogonal axis to landed slice).
- **One-line pointer**: [`docs/ROADMAP.md`](../ROADMAP.md) — H1 2027 paragraph references RFC-0003 alongside RFC-0001 / RFC-0002.
- **Index**: [`docs/README.md`](../README.md) — Governance (RFCs) section lists RFC-0001, RFC-0002, RFC-0003.
- **Cross-ref amendment**: [`docs/rfcs/0002-canonical-module-physical-layout.md`](0002-canonical-module-physical-layout.md) §13 — Touched docs gains RFC-0003 entry; `CONTRACTS-VALIDATION-STRATEGY.md` row flips from "No-change-with-reason" to "Substantive cross-ref".
- **No-change-with-reason**: [`docs/LICENSING.md`](../LICENSING.md) (Zod is MIT-licensed; no licensing impact); [`MANIFESTO.md`](../../MANIFESTO.md) (values unchanged); [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) (tier model unchanged).

---

*RFC-0003 is part of the Umbraculum platform's governance documentation set. See [`docs/README.md`](../README.md) for the full doc index, [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) for the platform vision, [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) and [RFC-0002](0002-canonical-module-physical-layout.md) for the governance and layout this RFC builds on, [`docs/design/validation-library-adoption-audit.md`](../design/validation-library-adoption-audit.md) for the skeptical audit that produced this RFC's verdict, [`docs/LICENSING.md`](../LICENSING.md) for license posture, and [`MANIFESTO.md`](../../MANIFESTO.md) for project values.*
