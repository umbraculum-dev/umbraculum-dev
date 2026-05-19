# Contracts validation strategy

**Tier:** Public
**Status:** v2.0 — **decision flipped 2026-05-19**: migrate to **Zod v4**. See [RFC-0003 — Validation-library adoption](rfcs/0003-validation-library-adoption.md) (Accepted) and [v2.0 decision rationale](#v20-decision-flip-2026-05-19) below for the commitment. v1.0–v1.2 ("stay on hand-rolled") is preserved as the historical narrative; the trigger criteria + audit log capture the four-day window in which the project's trajectory invalidated the steady-state assumption that the hand-rolled decision was calibrated to.
**Audience:** maintainers, future contributors, anyone considering a runtime-validation library migration
**Owners:** maintainers
**Related:** [RFC-0003](rfcs/0003-validation-library-adoption.md) (canonical commitment), [`docs/design/validation-library-adoption-audit.md`](design/validation-library-adoption-audit.md) (skeptical audit), [`spike/validation-library/`](../spike/validation-library/) (Phase 1 spike scaffold), [`docs/LINTING.md`](LINTING.md) (HIGH-staged Phase 7 references this doc), [`docs/TYPING.md`](TYPING.md) (the types slice tightened compile-time guarantees on the existing hand-rolled parsers — see Side-observation in the 2026-05-18 audit row), [`docs/FOUNDATION-HARDENING.md`](FOUNDATION-HARDENING.md) (the foundation-hardening summary will be updated v1.1 → v2.0 to promote validation from orthogonal axis to landed slice per RFC-0003 Decision G), [`docs/PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) §3.2 (cross-process boundaries), [`packages/contracts/README.md`](../packages/contracts/README.md) (the package-level README will be updated to cite this doc + RFC-0003 as the canonical "why Zod" reference during migration PR 1).

---

## v2.0 decision flip (2026-05-19)

**Commitment.** Migrate `packages/contracts/`, `packages/automation-contracts/`, `services/api/src/routes/`, and `packages/module-sdk/` to Zod v4 schemas. Plugin-pack rules from [`docs/FOUNDATION-HARDENING.md`](FOUNDATION-HARDENING.md) §8 co-author on the new pattern during migration. Internal `apps/web` and `apps/native` clients update in the same PR window as the route they consume — no permanent bridge layer (pre-release state confirmed by lead 2026-05-19).

**Canonical artifact for the commitment:** [RFC-0003](rfcs/0003-validation-library-adoption.md) (Accepted 2026-05-19). This doc records the decision-evolution context and per-criterion audit history; RFC-0003 holds the committed decisions A–G and the migration plan reference. **When this doc and RFC-0003 disagree, RFC-0003 wins.**

**Why the flip.** Two-criterion-window invalidation, recorded in the 2026-05-19 audit row below:

1. **Criterion (1) "new complex contract" newly satisfied.** [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) (Accepted 2026-05-19) commits to 5 `packages/<code>-contracts/` packages by H1 2027; [`docs/design/canonical-automation-module-surface.md`](design/canonical-automation-module-surface.md) (Accepted 2026-05-19) lands `packages/automation-contracts/` as the template for the other four. **Net: 4 new contracts packages incoming, each with its own deeply-discriminated-union + structural-drift-detection surface (the `mailbox-data.ts` MAILBOX_SPEC validator is the first worked example, at 168 hand-rolled lines).**
2. **Criterion (2) "OpenAPI requirement" partially satisfied via SDK trajectory.** [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) commits `packages/module-sdk/` as a public-facing artifact to be designed with or before the second canonical module. The "third-party AI-assisted module developers" audience makes Zod's ecosystem gravity + first-party OpenAPI support materially valuable, regardless of whether an OpenAPI spec is *required* day-one.

**Skeptical audit performed before commitment:** [`docs/design/validation-library-adoption-audit.md`](design/validation-library-adoption-audit.md) (597 lines, 2026-05-19). The audit examined six skeptical-tests-of-reasoning (novelty bias, cost honesty, intermediate-option exhaustion, timing of trigger, cost of being wrong, falsifiable verification) before recommending. Verdict: **SOUND with one structural caveat** (library-agnostic SDK interface — addressed as RFC-0003 Decision C). All migration PRs sequence from [`.cursor/plans/validation_library_adoption_<id>.plan.md`](../.cursor/plans/).

**Cost asymmetry that drove the timing.** Migrating now (~80–140 hours focused work, audit §5.5): one coherent rollout window covering 8 existing parsers + 28 routes + 5 incoming contracts packages + module-SDK design + plugin-pack co-authoring. Migrating after H1 2027 (~300–500 hours, audit §5.5): retrofit under public-flip launch pressure, 5 contracts packages already in steady-state, module-SDK already shipped to third parties, plugin-pack rules already in place teaching the wrong pattern. The ~3× cost asymmetry is the decisive timing argument.

**What is preserved from v1.x.** The trigger-criteria framework, the pros/cons analysis, the bundle-size sensitivity for `apps/native`, and the "no mixed adoption" anti-pattern all remain valid and inform the migration's PR sequencing (Decision D in RFC-0003). The 2026-05-18 side-observation that strict-flag enforcement closed the *correctness* gap on hand-rolled parsers is also preserved — it's the reason the migration is framed as ergonomics + ecosystem fit, not correctness fix.

---

## TL;DR (v1.x — historical, preserved)

> **NOTE:** This TL;DR captures the v1.x decision ("stay on hand-rolled"). It is preserved as the audit trail for the trigger-criteria re-evaluation that produced the v2.0 flip above. The current commitment is the v2.0 decision flip section + [RFC-0003](rfcs/0003-validation-library-adoption.md).

`packages/contracts` exposes 57 cross-process types and 8 hand-rolled `unknown → typed` parser functions. We do **not** use Zod, Valibot, Arktype, or TypeBox. The decision after HIGH-staged Phase 1 (commit `4fa663b`) is:

- **Stay on hand-rolled validators** for now.
- **Track migration as a future architectural decision**, not a type-discipline gap.
- **Re-evaluate** when one of the trigger criteria below is met.

This document captures the analysis behind that decision so a future maintainer (or a future version of us) doesn't have to redo the reasoning.

---

## What we have today

Inside `packages/contracts/src`:

| Metric | Count |
|---|---|
| TS source files (excl. tests) | 18 |
| Exported `interface` / `type` declarations | 57 |
| Exported parser functions (`parseX(unknown): X`) | 8 across 5 files |
| Source bytes | ~63 KB |
| Runtime dependencies | 0 (pure TypeScript) |
| Bundle-time deps in consumers | 0 added by contracts |

The 8 parsers:

```
parseAuthMeResponse                   (auth/meResponse.ts)
parseGravityAnalysisResponseV1        (analysis/parseGravityAnalysis.ts)
parseMashComputeAndSaveResponse       (water/parseComputeAndSave.ts)
parseSpargeComputeAndSaveResponse     (water/parseComputeAndSave.ts)
parseBoilComputeAndSaveResponse       (water/parseComputeAndSave.ts)
parseWaterProfileItem                 (water/waterProfile.ts)
parseWaterProfilesResponse            (water/waterProfile.ts)
parseRecipeWaterHubSummaryResponse    (water/parseHubSummary.ts)
```

Each parser:

1. Takes `unknown`.
2. Validates field-by-field with shared type-guard helpers (`isString`, `isNumber`, `isFiniteNumber`, `isObject`).
3. Returns the typed shape, or throws an `Error` with a path-tagged message (e.g. `"Invalid GravityAnalysisResponseV1.result"`).

After HIGH-staged Phase 1, all 8 parsers are properly typed (zero `any`) and pass 38/38 unit tests.

The Fastify side mirrors this: **services/api uses zero Fastify schema validation** in all 28 routes. Validation is hand-rolled inline using `BadRequestError`, `UnauthorizedError`, etc. AJV appears in the dependency tree as a transitive Fastify dep but is not used by route code.

This means **"migrate contracts to Zod"** is really **"migrate the entire boundary-validation surface (contracts + routes + future-MCP-tools + native Expo bridge)"**. Phase 1 surfaced this — it's a much larger scope than the four files we just cleaned.

---

## The candidate libraries

| Library | Bundle size (gzipped) | Type inference | Fastify integration | Tree-shakeable |
|---|---|---|---|---|
| **Zod v3** | ~14 KB | Excellent | `fastify-type-provider-zod` | Partial |
| **Zod v4** (2025+) | ~5 KB (claimed) | Excellent | Same provider | Yes |
| **Valibot** | ~2 KB (per schema) | Excellent | `@valibot/to-json-schema` + provider | Yes (modular) |
| **Arktype** | ~13 KB | Excellent (string DSL) | Less mature | Partial |
| **TypeBox** | ~3 KB | Good (schema-first) | First-class (it's the recommended Fastify type provider) | Yes |
| **Hand-rolled** (today) | 0 KB | Manual `interface` + parser | None (manual `BadRequestError`) | n/a |

Numbers are approximate as of mid-2026 and should be re-verified at decision time. The relative ordering is more stable than the absolute numbers.

### Why Zod is the obvious mention

Zod is the de-facto TypeScript-runtime-validation library in 2026. When most people say "use a runtime validation library", they mean Zod. The other options are real and worth considering, but Zod is the gravitational center of the conversation.

---

## Pros of migrating

1. **Single source of truth for shape.** Today: an `interface WaterProfile` and a `parseWaterProfile(v: unknown): WaterProfile` are two separate things that must be kept in sync manually. With a schema library: `const WaterProfile = z.object({...}); type WaterProfile = z.infer<typeof WaterProfile>;`. They cannot drift.
2. **Better error messages.** Schema libraries produce structured error objects (`{ path, code, message }`) with the full failure path. Hand-rolled gets `Error("Invalid WaterProfile.workspaceId")` strings. Our error UX is fine for developer-debug; structured errors make programmatic error handling (e.g. surfacing field-level form validation messages) much cleaner.
3. **Composability.** Schemas extend, partial, pick, omit, transform, refine. Useful when input shapes evolve or when client/server share most of a shape with one variant.
4. **Schema-driven OpenAPI.** With Zod (or TypeBox) on Fastify routes, an OpenAPI spec falls out of the route definitions automatically. Useful for the public-flip H1 2027 milestone — third-party module developers get an auto-generated API reference.
5. **Industry-recognizable.** Public-flip readiness: contributors immediately recognize `z.object(...)`. The hand-rolled pattern works but reads as "this codebase predates Zod" — which is true and not necessarily a problem, but is a visible signal.
6. **Synergy with services/api.** Migrating contracts and routes together lets the same schema validate request input on the server AND parse response output on the client. Today these are two parallel hand-rolled validators that drift independently.

---

## Cons of migrating

1. **Bundle size in React Native (Expo / Metro).** `packages/contracts` is consumed by `apps/native`. Native bundle size translates directly to OTA update size and app launch latency. Adding ~14 KB (Zod v3) is not trivial when bundle size is already a focus area for native. (Mitigation: Zod v4 is much smaller, or Valibot is ~2 KB. But this needs verification at decision time.)
2. **Migration surface is larger than it looks.** Honest scope:
   - 8 parser functions in `packages/contracts` ✅ (small)
   - 57 type declarations (most don't have parsers — they're consumed-as-types only) — would these become Zod schemas too, or stay as plain `interface`? Inconsistency creates worse drift than uniform hand-rolled.
   - 28 Fastify routes with hand-rolled inline validation (`BadRequestError("invalid_email", ...)` style). Half the value of Zod is lost if route validation stays hand-rolled.
   - The Fastify migration in turn implies rewriting handler signatures (`request.body` becomes typed via `FastifyTypeProvider`), error-mapping (Zod errors → our `BadRequestError` shape), and re-running the full integration test suite to catch behavior regressions.
   - Native + web *consumers* of the parsers — they call `parseX(json).foo` today. With Zod they call `Schema.parse(json).foo`. Trivial in isolation but ~25 call sites across apps to update.
   - Tooling: the existing 38 unit tests use error-message strings (`"Invalid WaterProfile.id"`) which become Zod-shaped — every test assertion changes.
   - Realistic effort estimate: **40–80 hours focused work** for a coherent migration that doesn't leave half-and-half coexistence.
3. **Mixed adoption is worse than either alone.** If contracts uses Zod and routes don't, every route handler does a Zod parse on output and a hand-rolled parse on input. Dual-pattern. Worse than either pure approach.
4. **Doesn't fix any current bug.** The runtime validation already works. Phase 1 just made the *types* tight. The remaining quality gap is *aesthetic* (concise schemas vs hand-rolled validators), not *correctness*.
5. **Locks us into a library's evolution.** Zod v3 → v4 was a non-trivial migration. Tomorrow's Zod v5, or a new contender (effect/Schema, ts-pattern), might re-open the question. Hand-rolled validators have no upstream migration cost.
6. **Diminishing returns vs. other foundation work.** With ~960 `any` warnings still outstanding repo-wide (see `docs/LINTING.md`), 40–80 hours of Zod migration competes against 40–80 hours of HIGH-staged Phases 2–6 (which deliver more measurable improvement: warnings cleared, drift gates expanded). Phase work compounds; one big migration doesn't.

---

## What we already gain without migrating

After HIGH-staged Phase 1, the contracts package has:

- ✅ Properly typed parsers (zero `any`).
- ✅ Locked at `--max-warnings 0` in CI (no future drift possible).
- ✅ 38/38 unit tests passing.
- ✅ Path-tagged error messages (`"Invalid Foo.bar.baz"`) — adequate for developer debugging.
- ✅ Zero runtime dependencies (works in any TS environment, no version-lock concerns).
- ✅ Trivial bundle impact in apps/native (validators are mostly dead-code-eliminable in non-test paths if consumers want to skip them).

These are the properties that *would* have been the immediate wins of a Zod migration. We have them already.

---

## When to revisit

Concrete trigger criteria that should re-open this decision:

1. **Adding a new contract from scratch** that is significantly more complex than current ones (e.g. a deeply discriminated union, transform pipeline, or recursive shape). At that point, write the new contract in Zod (or whichever candidate looks best) as an experiment and assess: does the API feel meaningfully better, or is hand-rolled comparable?
2. **OpenAPI requirement.** If the public-flip plan (`docs/PLATFORM-ARCHITECTURE.md` §10.1) or the third-party-module SDK (`docs/PLATFORM-ARCHITECTURE.md` §4.4) specifies an auto-generated OpenAPI spec, a schema-first library becomes the path of least resistance. TypeBox or Zod-via-OpenAPI become attractive at that point.
3. **Form-validation parity.** If the web/native UI starts wanting per-field validation messages from the same shape that the API validates, a structured-error library starts paying for itself.
4. **Drift in practice.** If we hit 2+ bugs in production where the parser and the interface diverged silently, the cost of "two definitions of truth" is no longer hypothetical — migrate.
5. **Bundle-size shift.** If Zod v4 (or a successor) lands at ≤2 KB gzipped with full tree-shaking, the React Native objection mostly evaporates and the decision tilts toward migration.
6. **Independent route migration.** If `services/api` migrates to a schema-validated route framework (Fastify with TypeBox is the natural path) for reasons unrelated to contracts, the contracts side should follow to keep one schema language across both.

---

## Migration mechanics (if/when we decide to go)

Sketch only — not a commitment.

### Recommended approach: **gradual, contract-by-contract**

1. **Pick one new contract** as the experiment. Use Zod v4 (or whichever candidate). Land it in `packages/contracts/src/<area>/__zod__/`. Compare ergonomics.
2. **Pick the corresponding route** in `services/api`. Migrate to `fastify-type-provider-zod`. Compare ergonomics.
3. **Decide based on real evidence**, not speculation. If after 1 + 2 the team agrees Zod earns its keep, plan a phased migration of the existing 8 parsers + 28 routes.
4. **Do NOT do contract-only migration.** As noted in con #3, that produces the worst of both worlds.
5. **Migrate test fixtures last.** Test assertions that depend on hand-rolled error message strings will need updating; do this in the same commit as the parser they test.

### Anti-patterns to avoid

- ❌ Big-bang migration in one PR. Unreviewable. Mixes architectural change with type-system change.
- ❌ "Zod everywhere" expanded beyond `packages/contracts` and `services/api/src/routes`. The native side and web pages consume the parsers — they should not need to know about Zod.
- ❌ Adding Zod as a `peerDependency`. Native bundles are bundle-size-sensitive; the dependency graph should be explicit.
- ❌ Mixing libraries (Zod for new code, hand-rolled for legacy). Pick one. The migration is worth doing only if it's complete.

---

## Decision log

| Date | Decision | Rationale |
|---|---|---|
| **2026-05-19** | **Migrate to Zod v4.** Decision flipped. Canonical commitment: [RFC-0003](rfcs/0003-validation-library-adoption.md) (Accepted). | Trajectory-window invalidation in the 4 days since the prior re-confirmation. **2/6 trigger criteria newly satisfied** (criterion 1 "new complex contract" via 4 incoming `packages/<code>-contracts/` from [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) — first worked example landed same day as `packages/automation-contracts/mailbox-data.ts` at 168 hand-rolled lines; criterion 2 "OpenAPI requirement / SDK trajectory" partially via [`docs/design/canonical-automation-module-surface.md`](design/canonical-automation-module-surface.md) §12.4 module-SDK commitment to a public artifact by H1 2027). **Skeptical audit performed before commitment** ([`docs/design/validation-library-adoption-audit.md`](design/validation-library-adoption-audit.md), 597 lines) — verdict SOUND with one structural caveat (library-agnostic SDK interface, addressed as RFC-0003 Decision C). **Cost asymmetry decisive** (~80–140 hours now vs ~300–500 hours retrofit at H1 2027 under public-flip launch pressure; audit §5.5). **Library choice: Zod v4** (Valibot was the strongest competitor, edged out on ecosystem gravity + AI-assistant pattern recognition + Fastify type-provider maturity; spike at [`spike/validation-library/`](../spike/validation-library/) recorded paper-design PASS verdict on all three falsifiable tests from audit §5.6, with container-side bundle measurement deferred to F7 follow-up). **Migration sequencing: 4 PRs** (contracts → automation-contracts → Fastify routes + internal clients → module-SDK interface) per RFC-0003 Decision D + [`.cursor/plans/validation_library_adoption_<id>.plan.md`](../.cursor/plans/). **Plugin-pack rules co-authored during migration**, not retrofit afterward (RFC-0003 Decision E). **Direct error-shape migration**, no bridge layer (RFC-0003 Decision F; pre-release state confirmed by lead 2026-05-19). |
| 2026-05-18 | Stay on hand-rolled (re-confirmed). | Milestone-aligned audit at the close of the foundation-hardening pass (lint slice ✅ 2026-05-16, types slice ✅ 2026-05-18, tests slice ✅ 2026-05-18, docs slice ✅ 2026-05-18). **0/6 trigger criteria met.** No new contracts authored in the 2-day window since the prior audit; OpenAPI requirement unchanged in `PLATFORM-ARCHITECTURE.md`; no per-field form-validation UI work; one potentially-relevant new bug surfaced (Phase 6f Side-finding 2 — cross-workspace data-leak in `routes/ingredients.ts` from a Prisma `Where` spread-OR overwrite) but it is a Prisma query-construction shape bug, NOT parser/interface drift; Zod schemas with Fastify type providers validate request bodies, not Prisma queries, so the bug class is orthogonal to this decision; bundle-size landscape unchanged (Zod v4 Mini still ~3.94 KB gzipped per the 2026-05-16 audit's web-checked numbers); `services/api` remains on hand-rolled `BadRequestError`-style Fastify validation (Phase 3b's `Where` unification kept that pattern). **Side-observation strengthening the hand-rolled position**: the types-slice Phases 6f + 6g (`noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` enabled across `packages/contracts`) tightened compile-time guarantees on the 8 existing hand-rolled parsers — every `arr[0]` access and `foo?: T` ambiguity is now compile-time-checked under maximally-strict TypeScript and green in CI. The "concise schema vs hand-rolled parser correctness" aesthetic argument from Pros §1 is partly addressed by the strict-flag enforcement; hand-rolled parsers no longer concede correctness ground to schema libraries on `unknown → typed` boundary-validation, only ergonomics ground. Per-criterion evidence in [Audit log](#audit-log) below. |
| 2026-05-16 | Stay on hand-rolled (re-confirmed). | First post-decision audit. **0/6 trigger criteria met** against master `4cbf461` (HIGH-full ESLint upgrade landed same day). No new complex contracts; no OpenAPI requirement firmed up in `PLATFORM-ARCHITECTURE.md`; no per-field form-validation UI work; one drift bug landed (`4d9ec1e`, `account → workspace` stale-consumer drift in 4 UI files) — but it's a stale-CONSUMER drift, not parser/interface drift, so Zod would have had the same surface (counts as 1, not the 2+ required); Zod v4 Mini bundle is 3.94 KB gzipped (web-checked) vs the doc's ≤2 KB bar; `services/api` remains on hand-rolled `BadRequestError`-style Fastify validation. Side observation: HIGH-full Phase 5's editor-config split slightly lowers the IDE-cost objection that contributes to the "stay on hand-rolled" position, but doesn't flip the calculation. Per-criterion evidence in [Audit log](#audit-log) below. |
| 2026-05-15 | Stay on hand-rolled. Track via this doc. | Phase 1 (commit `4fa663b`) showed the type-discipline gap was closeable without a library. The architectural question is real but separate. Public flip is not for ~12 months; the call can be made closer to that milestone with better data. |

When a new decision is recorded, append a row above (most recent first), not below.

---

## Audit log

Each scheduled audit walks the [trigger criteria](#when-to-revisit) and records per-criterion evidence. New audits append a column to the right (most recent rightmost). When the column count gets unwieldy, archive older columns into a separate `docs/CONTRACTS-VALIDATION-STRATEGY-AUDIT-ARCHIVE.md` and keep the 3 most recent here.

| Criterion | 2026-05-16 audit | 2026-05-18 audit | 2026-05-19 audit (decision flip) |
|---|---|---|---|
| **(1) New complex contract** added since the last decision | ❌ Not met. Only `packages/contracts` commits since 2026-05-15 are type-tightening (`d029e41` Phase 1 auto-fix, `4fa663b` HIGH-staged Phase 1) and tracking docs. No new contract authored. | ❌ Not met. Zero new contracts authored in the 2-day window. The 14 `services/api` errors closed by Phase 3b were *fixes* on existing parsers and Prisma boundary types (Prisma `Json` typing on `metadataJson` + `sectionsJson`/`customSectionsJson`/`defaultStepsJson`; `UnitConversionWarningV1` shape correction; transaction-lambda de-narrowing; the `routes/ingredients.ts` `Where` clause unification). The 36 TS2532 sites closed by Phase 6f and the 73 TS2375/TS2379/TS2322/TS2412 sites closed by Phase 6g were structural tightenings on existing parsers/contracts/inputs, not new contracts. | ✅ **NEWLY MET.** [`packages/automation-contracts/src/mailbox-data.ts`](../packages/automation-contracts/src/mailbox-data.ts) landed 2026-05-19 (Phase A of [`docs/design/canonical-automation-module-surface.md`](design/canonical-automation-module-surface.md)) at **168 hand-rolled lines** — a structurally-complex contract with cross-entry duplicate detection (PI_* name dedup + Modbus address dedup per kind), pattern validation (regex on PI_* names), and discriminated-union-shaped enums (Modbus kind × scalar type). [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) (Accepted 2026-05-19) commits to **4 more** `packages/<code>-contracts/` packages by H1 2027 (`brewing`, `inventory`, `quality`, `procurement`), each with comparable structural complexity. Net: 5 complex contracts incoming, with the first already exhibiting the exact pattern this criterion was authored to detect. |
| **(2) OpenAPI requirement** firmed up for public flip / module SDK | ❌ Not met. `docs/PLATFORM-ARCHITECTURE.md` §4.4 mentions a future `packages/ai-platform-contracts` extraction but does NOT specify schema-first or auto-generated OpenAPI. §10.1 (go-public path) is about license/governance, not API spec generation. | ❌ Not met. `docs/PLATFORM-ARCHITECTURE.md` unchanged. No new module-SDK or third-party-vertical specification that names auto-generated OpenAPI. The H1 2027 milestone in `docs/ROADMAP.md` mentions the module SDK becoming a public artifact but does not pin its API-description format. | ✅ **PARTIALLY MET via SDK trajectory.** [`docs/design/canonical-automation-module-surface.md`](design/canonical-automation-module-surface.md) §12.4 (Accepted 2026-05-19) commits `packages/module-sdk/` as a public-facing artifact, designed with or before the second canonical module. [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) accepts the β layout with `packages/module-sdk/` as part of the H1 2027 public-flip readiness checklist. The "third-party AI-assisted module developers" audience (the explicit audience for the plugin pack) makes Zod's ecosystem gravity + first-party OpenAPI support materially valuable, regardless of whether an auto-generated OpenAPI spec is required day-one. Cluster F1 in the migration plan tracks the actual OpenAPI generation activation. |
| **(3) Form-validation parity** required by UI | ❌ Not met. No per-field error-message UI work landed since 2026-05-15. The `apps/web` form-touching commits in this window (`0c5425e` `ferm-data-integration`, `a5a7afa` Medium-scope landing) are lint cleanup, not new validation UX. | ❌ Not met. No new form-validation UX in the 2-day window. The only UI commits are docs-slice README updates and the lint-slice / types-slice fixouts that are not user-facing. | ❌ Not met (unchanged). No per-field error-message UI work in the 1-day window. Criterion does not advance, but the 2026-05-19 flip is driven by criteria (1) + (2); criterion (3) is no longer the binding constraint. |
| **(4) Drift in practice** (2+ bugs where parser and interface diverged silently) | ❌ Not met (narrow miss, 1/2). Commit `4d9ec1e` ("restore workspace water profiles in 4 dropdowns, broken since `87876d0`") IS a drift case, but: (a) it's **stale-consumer drift** — UI code referenced `profiles?.account` after the `account → workspace` rename — not a parser/interface mismatch. (b) `parseWaterProfilesResponse()` was structurally correct: it accepts both `workspace` and `account` keys on the wire (for staged migration) and always normalises to `workspace` in output. (c) Zod schemas would have produced the same UI-consumer surface; the `WaterProfilesResponse` interface had the right shape, the consumers were stale. Lint promotion (HIGH-full Phase 4b) was the right detection tool. Counts as 1 instance; trigger requires 2+. | ❌ Not met (1/2 narrow miss UNCHANGED). Phase 6f's [Side-finding 2](TYPING.md#side-finding-2-phase-3b-uncovered-a-latent-cross-workspace-data-leak-bug-in-ingredients-search) IS a real silent bug — the `routes/ingredients.ts` Prisma `Where` clause spread-OR overwrite that exposed all workspaces' rows to authenticated search across `/ingredients/{fermentables,hops,yeasts}` whenever `activeWorkspaceId` AND `q` were both present. **But it is NOT parser/interface drift**: the `WhereInput` shape and the parser shapes were both structurally consistent; the bug was Prisma query-construction layering (the second `OR` silently overwrote the first `OR` in a single-object literal). Zod schemas with `fastify-type-provider-zod` validate request bodies, not the server-side Prisma queries that compose against those bodies — Zod would not have caught this. The fix was purely TypeScript-driven (refactor to `AND: Prisma.<Entity>WhereInput[]`). So this finding is orthogonal to the validation-library decision and does not advance criterion (4). The criterion 4 counter stays at 1/2. | ❌ Not met (1/2 narrow miss unchanged). No new drift bugs in the 1-day window. Criterion does not advance; not the binding constraint for the flip. |
| **(5) Bundle-size shift** to ≤2 KB gzipped with full tree-shaking | ❌ Not met. Web check 2026-05-16 (zod.dev/v4 release notes + zod.dev/packages/mini): Zod v4 standard is ~5 KB gzipped (down 57% from v3); Zod v4 Mini is 3.94 KB gzipped with full tree-shaking. A simple `z.boolean().parse(true)` import lands at 2.12 KB with Mini, but realistic object schemas (the contracts surface in this app: water profiles, gravity analysis, mash/sparge/boil compute) are 4-13 KB territory. The doc's ≤2 KB bar still requires deeper compression than Zod v4 achieves for our shape complexity. | ❌ Not met. No new web evidence in the 2-day window. The 2026-05-16 numbers stand: Zod v4 Mini at ~3.94 KB gzipped with full tree-shaking is still ~2× the doc's threshold for the realistic shape complexity in this contracts surface. | ❌ **Criterion threshold revised** by the [audit §5.3](design/validation-library-adoption-audit.md). The ≤2 KB bar was set when the only candidate was Zod v3 (~14 KB) and the comparison axis was "is Zod small enough to ignore the bundle objection." Under the new framing — adoption is paying for ecosystem fit + plugin-pack discipline, not just bundle parity — the realistic bar is **≤10 KB gzipped** for the full contracts surface. Zod v4 standard at ~5 KB (paper estimate ~6–8 KB tree-shaken into `apps/native`) is well within this revised bar. Container-side bundle measurement (F7 follow-up in the migration plan) confirms or invalidates the paper estimate. |
| **(6) Independent route migration** (services/api adopting a schema-validation framework) | ❌ Not met. The HIGH-full Phases 2-5 on `services/api` are lint promotions on the existing framework. No `fastify-type-provider-zod` / `fastify-type-provider-typebox` / equivalent adoption. Routes still use hand-rolled `BadRequestError`/`UnauthorizedError` validation. | ❌ Not met. Phase 3b's refactor of `routes/ingredients.ts` from spread-based to `AND: Prisma.<Entity>WhereInput[]` composition kept the hand-rolled `BadRequestError`/`UnauthorizedError` pattern; it was a Prisma typing fix, not a framework migration. The 13 typecheck-gated workspaces (Phase 5) include all of `services/api/src/**` and are clean under the existing hand-rolled validation pattern. No `fastify-type-provider-*` adoption proposed in any pending plan. | ❌ Not met (unchanged), but **criterion is now obsolete in this form**. The criterion assumed an *independent* services/api migration would force the contracts side to follow. The 2026-05-19 decision flips this: the contracts side commits first (via [RFC-0003](rfcs/0003-validation-library-adoption.md) Decision D, PR 1 + PR 2), and the services/api migration follows in PR 3 of the same migration plan. The trigger is supplied by criteria (1) + (2), not by criterion (6). |

Audit conclusions:

- **2026-05-16**: 0/6 met → no migration trigger fired → re-confirm "stay on hand-rolled."
- **2026-05-18**: 0/6 met → no migration trigger fired → re-confirm "stay on hand-rolled." Side-observation worth pinning forward: the types-slice Phases 6f + 6g (`noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` enabled in `packages/contracts`) tightened compile-time guarantees on the 8 hand-rolled parsers — every array-index access and `foo?: T` ambiguity is now CI-checked under maximally-strict TypeScript flags. The aesthetic "schema correctness vs hand-rolled correctness" argument is partly retired; the only remaining pro-migration arguments are *ergonomics* (single source of truth between interface and parser, schema composability) and *OpenAPI/SDK ecosystem fit*, both of which are still legitimate but tracked under criteria (1)+(2) rather than parser correctness. Recommend next audit at the next architecture review (typically aligned with foundation-hardening pass milestones in [`docs/ROADMAP.md`](ROADMAP.md)), or sooner if any single criterion fires unambiguously between scheduled audits.
- **2026-05-19**: **2/6 met → migration trigger fired → flip decision to "migrate to Zod v4."** Canonical commitment [RFC-0003](rfcs/0003-validation-library-adoption.md) (Accepted same day). Criteria (1) and (2) both newly satisfied within the 4-day window since the prior re-confirmation — driven by the 2026-05-19 acceptance of [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) (β layout commitment for 5 `packages/<code>-contracts/`) and [`docs/design/canonical-automation-module-surface.md`](design/canonical-automation-module-surface.md) (Phase A landed `packages/automation-contracts/` as the worked example + the template for the 4 remaining canonical-module contracts packages). **Reasoning audit performed before commitment** ([`docs/design/validation-library-adoption-audit.md`](design/validation-library-adoption-audit.md), 597 lines) examined six skeptical tests-of-reasoning (novelty bias, cost honesty, intermediate-option exhaustion, timing, cost of being wrong, falsifiable verification) before recommending. Verdict: SOUND with one structural caveat (library-agnostic SDK interface, addressed as RFC-0003 Decision C). **Cost asymmetry** was the decisive timing argument: ~80–140 hours now vs ~300–500 hours retrofit at H1 2027 under public-flip launch pressure. Library choice **Zod v4** over Valibot, decided by ecosystem gravity + AI-assistant pattern recognition + Fastify type-provider maturity; Valibot remains the documented fallback if the F7 container-bundle measurement invalidates the paper estimate. Next audit cadence: the next major architectural review post-migration; if the migration reveals unexpected pain, re-open RFC-0003 §15 via successor RFC per the change procedure.

---

## Follow-ups (F1–F9, opened 2026-05-19 alongside the v2.0 flip)

These follow-up trackers are the residual scope from RFC-0003 + the foundation-hardening v2.0 update that did not land in the initial migration commits. They are deliberately listed here rather than scattered across multiple docs so the strategy doc remains the single index for "what's still open on the validation slice." Each tracker is tagged with the artifact(s) it owns; when a tracker closes, replace `Open` with the resolving commit hash + ISO date.

| # | Tracker | State | Owner | Notes |
|---|---|---|---|---|
| **F1** | **OpenAPI generation from Zod schemas.** Wire `@asteasolutions/zod-to-openapi` (or `zod-openapi`) to emit an OpenAPI document from the Fastify route schemas registered via `fastify-type-provider-zod`. Pin the generated artifact under `services/api/openapi/openapi.json` + add a CI check that re-generates and diffs against the committed artifact to catch silent contract drift. | Open | maintainers | Lands after PR 3 (Fastify route migration). Per RFC-0003 Decision G: OpenAPI is the *signal* that the validation slice's external value compounds — once routes have schemas, the API doc + client SDK generation come for free. |
| **F2** | **Next validation-slice audit cadence.** The v1.x audit cadence ("aligned with foundation-hardening pass milestones") is superseded by RFC-0003. Replace with a *forward-only* cadence: re-audit when (a) a successor Zod major version ships (currently tracked under F3), (b) a new tier-1 canonical module commits a contracts package larger than ~200 hand-rolled lines equivalent (mirrors the criterion-1 threshold of the v1.x audit), or (c) bundle-size measurements (F7) show the slice imposing >5% gzipped delta on `apps/native`. | Open | maintainers | Replaces the v1.x 6-criteria audit. Document the new cadence in §"When to revisit" of this doc when F2 closes; update RFC-0003 §15 (Resolution) cross-reference. |
| **F3** | **Zod v5 tracker.** Zod v5 is in alpha planning at upstream (https://github.com/colinhacks/zod). When v5 ships, run a focused audit: bundle delta, breaking changes, migration LOC, Fastify type-provider compatibility, plugin-pack rule rewrite scope. If the delta is favorable, open a successor RFC referencing RFC-0003 §15. | Open | maintainers | Read-only watch — no action until v5 RC at least. The `22-typescript-contracts-runtime-validation.mdc` plugin-pack rule §"When the strategy changes" already encodes the change procedure. |
| **F4** | **DOCS-README-STANDARDS update.** Add a required `## Validation` section to the canonical module-README template in `docs/DOCS-README-STANDARDS.md` v1.2 (next version). New modules' READMEs must state which Zod schemas they own + where the schemas live + where the paired tests live. `scripts/docs/check-readmes.py` then enforces the structural presence. | Open | docs-slice owner | Co-update with the post-PR 1 docs sweep. Mirror the section in the rewritten existing module READMEs (`packages/contracts/README.md`, `packages/automation-contracts/README.md`, `packages/module-sdk/README.md`). |
| **F5** | **Sub-plan #9 alignment (`@brewery/*` → `@umbraculum/*` rename).** The `ValidatedSchema<T>` interface is published from `@brewery/module-sdk` today and from `@umbraculum/module-sdk` at the public flip (`docs/RENAME-DILIGENCE.md` §10). Sub-plan #9 must (a) update the published interface's npm scope, (b) update the rewritten `22-*.mdc` plugin-pack rule's code blocks, (c) update the `docs/design/pr1-contracts-migration-handoff.md` + `docs/design/pr3-routes-migration-handoff.md` examples, and (d) update the spike README's code samples. **Scoping pass done 2026-05-19**: see [`docs/design/brewery-scope-migration-plan.md`](design/brewery-scope-migration-plan.md) (plan) + [`docs/design/brewery-scope-migration-per-package-handoff.md`](design/brewery-scope-migration-per-package-handoff.md) (slot 11 `module-sdk` covers the F5 mechanical updates explicitly). | In progress (scoping done) | sub-plan #9 owner | Mechanical rename across documentation surfaces; not blocked by the validation slice but consumed by it. Mark `Done` when sub-plan #9 slot 11 (`module-sdk`) commits and the F5 surfaces are updated in the same PR. |
| **F6** | **Plugin-pack publication.** The rewritten `22-typescript-contracts-runtime-validation.mdc` rule, the new `zod-schema-scaffold` skill, and the new `contracts-zod-auditor` subagent live in `.cursor/plugins/local/umbraculum-node-react-cursor-assistant/`. Publication to a wider plugin-pack registry (when the project's Cursor plugin distribution strategy lands) needs (a) the rule's globs / patterns audited against external repos, (b) the skill's "absolute path" cross-references made relative, (c) the subagent's read-first list verified across the broader corpus. | Open | plugin-pack owner | Tracked alongside the §8 proposals from foundation-hardening v2.0 that already shipped (the new ones for the validation slice get the same publication discipline). |
| **F7** | **Native bundle audit (RFC-0003 F7).** Measure the `apps/native` (Expo / React Native) bundle delta with Zod adoption end-to-end (after PR 3 lands all route migrations). Paper-design estimate during the spike was ~5 KB gzipped (Zod v4 + zod/v4-mini tree-shake), well under the per-criterion threshold from the v1.x audit (≤2 KB threshold was retired during the v2.0 flip per the audit's `5.3` revision). F7 confirms or revises the paper-design number with container-side production-build measurement on a real bundler run. | Open | apps/native owner | The only RFC-0003 falsifiable test deferred from the spike. If the measurement reveals >10 KB gzipped delta on the native bundle, open a Zod-v4-mini-only adoption sub-RFC for `apps/native` to keep the cost asymmetry favorable. |
| **F8** | **RFC-0002 §13 cross-ref refresh.** RFC-0002 §13 (Cross-references) was written before RFC-0003 existed. Add a cross-reference to RFC-0003 ("validation-library choice for the `packages/*-contracts/` family — Zod v4 per RFC-0003") so future readers of RFC-0002 find the validation-library commitment via the layout doc's index, not just via this doc. | Open | RFC editors | One-paragraph edit; co-land with the next RFC-0002 amendment cycle. |
| **F9** | **Shared `expectStructuralError` / `expectFirstIssuePathStartsWith` test helpers.** Both helpers are inline-defined per-test-file today (in `packages/contracts/src/auth/meResponse.test.ts` for the per-schema helper, in the PR 3 handoff for the per-route helper). Extract to `packages/contracts/src/__test-helpers__/zodAssertions.ts` (or `services/api/src/tests/helpers/zodAssertions.ts` for the route-level variant) so new tests get the helper via import rather than per-file duplication. | Open | tests-slice owner | Defer until ~3 test files use the helper (currently 2). The extraction is mechanical; the timing prevents premature abstraction. |

When a follow-up tracker closes, mark it `Done — <commit-sha> — <ISO date>` and update the linked artifact (RFC-0003 §Resolution, RFC-0002 §13, `docs/FOUNDATION-HARDENING.md` §4.5, etc.) in the same commit so the cross-references stay consistent.

## Related

- [RFC-0003](rfcs/0003-validation-library-adoption.md) — **canonical commitment artifact for the v2.0 decision flip** (Accepted 2026-05-19). RFC-0003 holds the seven Decisions A–G and references the migration plan.
- [`docs/design/validation-library-adoption-audit.md`](design/validation-library-adoption-audit.md) — skeptical audit (597 lines) performed before the v2.0 commitment. Evidence base for RFC-0003.
- [`spike/validation-library/`](../spike/validation-library/) — Phase 1 spike scaffold; Zod v4 and Valibot side-by-side. README documents the measurement procedure + per-test stop conditions.
- [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) — canonical-module physical layout (β: `packages/<code>-contracts/` × 5 + `packages/module-sdk/`). The trigger that crossed criterion (1) of this doc into "met" status.
- [`docs/design/canonical-automation-module-surface.md`](design/canonical-automation-module-surface.md) — the first canonical-module surface design, accepted 2026-05-19; Phase A landed `packages/automation-contracts/` as the worked example of the template-pattern.
- [`docs/LINTING.md`](LINTING.md) — HIGH-staged roadmap; the Phase 7 (optional) bullet links here. Will be updated post-migration to remove the Phase 7 deferral.
- [`docs/FOUNDATION-HARDENING.md`](FOUNDATION-HARDENING.md) — foundation-hardening synthesis; v1.1 → v2.0 update post-migration promotes validation from §6 orthogonal axis to §2 landed slice per RFC-0003 Decision G.
- [`docs/PLATFORM-ARCHITECTURE.md`](PLATFORM-ARCHITECTURE.md) — public-flip readiness (§10.1) and module SDK (§4.4) — referenced by criteria (1) + (2) above.
- [`packages/contracts/src/water/parseComputeAndSave.ts`](../packages/contracts/src/water/parseComputeAndSave.ts) — canonical example of a hand-rolled parser after Phase 1 cleanup; migrated to Zod in PR 1 of the migration.
- [`packages/automation-contracts/src/mailbox-data.ts`](../packages/automation-contracts/src/mailbox-data.ts) — first-worked-example of a new-pattern complex contract (168 hand-rolled lines, the criterion-1 trigger); migrated to Zod in PR 2 of the migration.
- Zod docs: <https://zod.dev/>
- Valibot docs: <https://valibot.dev/>
- TypeBox docs: <https://github.com/sinclairzx81/typebox>
- Fastify type providers: <https://fastify.dev/docs/latest/Reference/Type-Providers/>
