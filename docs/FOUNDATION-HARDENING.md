# Foundation hardening (slice summary + plugin-pack handoff)

**Tier:** Public
**Status:** v1.0 — initial summary published 2026-05-18 at the close of the lint + types + tests + docs slices. Validation slice tracked separately as an orthogonal axis (audit re-confirmed hand-rolled the same day).
**Audience:** future contributors (single entry point to the foundation-hardening narrative); plugin-pack authors (slice → rule/skill/subagent mapping).
**Owners:** maintainers
**Related:** [`docs/LINTING.md`](LINTING.md) (lint slice SoT), [`docs/TYPING.md`](TYPING.md) (types slice SoT), [`docs/TESTING.md`](TESTING.md) (tests slice SoT), [`docs/DOCS-README-STANDARDS.md`](DOCS-README-STANDARDS.md) (docs slice SoT), [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) (validation axis), [`docs/ROADMAP.md`](ROADMAP.md) (the foundation-hardening pass narrative is embedded in the H1 2027 milestone paragraph), [`MANIFESTO.md`](../MANIFESTO.md) (the values commitment that motivates "invest in foundations alongside features").

---

## 1. Why this doc

The foundation-hardening pass closed in May 2026 across four slices (lint → types → tests → docs). Each slice has its own canonical doc, its own CI gate, and its own decision log. This doc exists for two readers the per-slice docs cannot serve well:

1. **A future contributor** opening the repo for the first time who needs the *bird's-eye narrative* — what got hardened, when, why those four slices and not others, what state the foundation is in today, and where to dig deeper for any one slice.
2. **A plugin-pack author** (the maintainers' own Cursor `.cursor/rules/` + `.cursor/skills/` + `.cursor/agents/` work) who needs the *slice → enforcement-mechanism mapping* — which rule encodes which discipline, which skill carries the procedure, which subagent runs the check. This is the deliverable that makes the foundation self-enforcing for future code, not just a one-time event.

This doc is **not a source of truth for any single slice** — it is a synthesis layer. When this doc and a per-slice doc disagree, the per-slice doc wins; please update this one to match.

---

## 2. The four slices at a glance

| Slice | Status | CI gate | Canonical doc | Started | Feature-complete |
|---|---|---|---|---|---|
| **Lint** | ✅ Feature-complete | `.github/workflows/web-lint.yml` (single `npm run lint` call; 0 warnings, 0 errors at `error` severity for all 12 type-aware rules + base preset) | [`docs/LINTING.md`](LINTING.md) | 2026-04 (HIGH-light) | 2026-05-16 (HIGH-full Phase 5) |
| **Types** | ✅ Feature-complete | `.github/workflows/typecheck.yml` (per-workspace `tsc --noEmit` across 13 CI-gated workspaces; all 6 candidate strict flags enabled) | [`docs/TYPING.md`](TYPING.md) | 2026-05-18 (Phase 1 audit) | 2026-05-18 (Phase 6h) |
| **Tests** | ✅ Feature-complete (non-deferred phases) | `.github/workflows/api.yml` + per-workspace test scripts; L1 + L2 + L4 + L5 layers wired; 521 vitest tests across 4 packages + 18 Playwright specs | [`docs/TESTING.md`](TESTING.md) | 2026-05-17 | 2026-05-18 (Phase 5b-5) |
| **Docs** | ✅ Feature-complete | `.github/workflows/docs-readmes.yml` (`scripts/docs/check-readmes.py` structural + link checks across 14 full-template + 1 sub-component README) | [`docs/DOCS-README-STANDARDS.md`](DOCS-README-STANDARDS.md) | 2026-05-18 | 2026-05-18 (Phase 4) |
| **Validation** *(orthogonal axis)* | 🟡 Decision: hand-rolled (re-confirmed 2026-05-18) | None directly; the types slice's CI gate enforces parser correctness via `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` on `packages/contracts` | [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) | 2026-05-15 (decision recorded) | n/a — explicitly tracked as a deferrable axis |

The four landed slices are the *bug-prevention foundation*: lint, types, and tests prevent three complementary bug classes that the others cannot reach (see §5). The docs slice is the *contributor-experience foundation* that makes the other three discoverable. The validation axis is *orthogonal*: it sits at the runtime-data-boundary tier and is decided per-criterion, not per-phase (see §6).

The ROADMAP's H1 2027 milestone paragraph ([`docs/ROADMAP.md`](ROADMAP.md) line 42) is the dense narrative form of this table; this doc is the structured form. Both should track the same state; if they drift, treat the per-slice docs as authoritative and update both.

---

## 3. What "by design" enforcement means

Every slice landed with two enforcement layers, and both are necessary:

### Layer 1 — CI gate (post-violation detection)

A GitHub Actions workflow that runs on push/PR and fails the build if the slice's discipline is violated. CI gates are the *floor*: nothing below them ships. They detect violations that already reached the codebase. Today every landed slice has its CI gate (`web-lint.yml`, `typecheck.yml`, `api.yml`, `docs-readmes.yml`).

### Layer 2 — Plugin-pack discipline (pre-violation prevention)

Cursor `.cursor/rules/`, `.cursor/skills/`, and `.cursor/agents/` artifacts that shape what an AI-assisted contributor (or the maintainer using Cursor as their daily IDE) writes *in the first place*. A rule that says "imports across workspace boundaries must use `import type` for type-only imports" prevents the violation from ever reaching the typecheck gate.

The plugin layer is **not a substitute** for the CI gate (an AI assistant might be off, a contributor might not be using Cursor, a rule might miss a case). The CI gate is **not a substitute** for the plugin layer (it tells you *after* the fact, not *before*; it doesn't compose with the contributor's mental model).

The two layers compound:
- CI gate: catches violations that escape the plugin layer.
- Plugin layer: prevents violations from reaching the CI gate, reduces revision cycles, encodes the *rationale* (not just the rule).

The maintainers' authoring meta-framework already governs how rules / skills / subagents are written:
- [`.cursor/rules/12-skill-contract.mdc`](../.cursor/rules/12-skill-contract.mdc) — skills must be input-driven, output-constrained, bounded.
- [`.cursor/rules/13-rule-skill-authoring-gate.mdc`](../.cursor/rules/13-rule-skill-authoring-gate.mdc) — every new artifact must explicitly answer "rule, skill, or subagent?"
- [`.cursor/rules/14-subagent-contract.mdc`](../.cursor/rules/14-subagent-contract.mdc) — subagents must have specific delegation triggers, ≤30-line bodies, references to a canonical skill.

§8 below maps each slice's discipline to the artifact type best suited under that meta-framework.

---

## 4. Slice deep-dives

For each slice: what it locks down, what bug class it owns, what artifacts ship the discipline, what the CI gate enforces. References point at the per-slice docs for full detail (status banners, phase logs, reproduction commands).

### 4.1 Lint slice — `eslint` discipline

**Bug class owned**: bugs the type system cannot see — stale-closure bugs in React hooks (`react-hooks/exhaustive-deps`), conditional hook calls, JSX a11y regressions, cross-platform UI primitive misuse (raw `tamagui` Button/Input leaking RN a11y props to the DOM on web), explicit-any leaks, unsafe-any class expansion, floating promises, missing-await on thenable function calls.

**Outcome (per [`docs/LINTING.md`](LINTING.md) v3.2)**:
- All 12 type-aware rules at `error` severity (HIGH-full Phase 5, 2026-05-16).
- `@typescript-eslint/no-explicit-any` and `@typescript-eslint/no-unused-vars` at `error` repo-wide.
- `@typescript-eslint/consistent-type-imports` at `error` (which transitively pre-paid the `verbatimModuleSyntax` cost in the types slice — see §5).
- 0 warnings + 0 errors across the entire monorepo under `npm run lint`.
- Cross-platform UI guardrail enforced via `no-restricted-imports` on `packages/ui/src/{ai,charts}/**` (the canonical bug class — postmortem in commit `221b193`).
- Editor-only ESLint config (`eslint.config.editor.mjs`) strips type-aware rules + `parserOptions.projectService` for ~6× wall-time savings (~42s CI → ~7s editor) and mechanically defeats the auto-fix-overreach failure mode.

**CI gate**: `.github/workflows/web-lint.yml` runs `npm run lint`; any new violation fails CI as an error.

**Plugin-pack alignment today**:
- `.cursor/rules/23-eslint-flat-config-hygiene.mdc` (production-config hygiene; rule promotion stages, flat-config block ordering, inline-disable reasons).
- `.cursor/rules/23a-eslint-fixall-discipline.mdc` (editor-config split; `source.fixAll.eslint: "explicit"` discipline; never `true`).
- The cross-platform UI primitive guardrail is enforced *only* by the lint rule today; a corresponding plugin-pack rule could pre-warn at authoring time.

### 4.2 Types slice — `tsc --noEmit` discipline

**Bug class owned**: compile-time bugs that lint cannot see and tests cannot reach — index-out-of-bounds (`arr[i]` returning `T | undefined` not `T`), `Map.get()` undefined-safety, `foo?: T` vs `foo: T | undefined` distinction (forgotten-field vs explicit-undefined), accidental method-name collisions in class hierarchies (`override` keyword), property access on index-signature types, dual-resolution of value-vs-type imports under modern bundler modes (`verbatimModuleSyntax`), per-file transpilability (`isolatedModules`).

**Outcome (per [`docs/TYPING.md`](TYPING.md) v0.13)**:
- `strict: true` floor across all 14 TS workspaces (was already on at the start of the slice).
- All 6 candidate stricter flags enabled across all 13 CI-gated workspaces (Phase 6a–6h):
  - `noImplicitOverride` — universal; 0-cost.
  - `noPropertyAccessFromIndexSignature` — universal; 2566 TS4111 sites fixed by bulk-mechanical Python script driven by tsc's own error-location output.
  - `noUncheckedIndexedAccess` — universal; 36 TS2532 sites fixed across 9 files (5 production, 4 test).
  - `exactOptionalPropertyTypes` — universal; 73 TS2375/TS2379/TS2322/TS2412 sites fixed across 5 workspaces using 3 fix patterns (type-widening, conditional spread, non-null assertion).
  - `verbatimModuleSyntax` — universal; 0-cost (the lint slice's `consistent-type-imports` rule pre-paid the discipline).
  - `isolatedModules` — universal; 0-cost (no `const enum`, no value-vs-type re-export ambiguities).
- 13 of 15 workspaces pass `tsc --noEmit` cleanly. 2 workspaces excluded by explicit Phase 4 decision: `apps/web` (585 errors) + `packages/ui` (25 errors), all in the Tamagui-accepted-cost class per [`docs/TAMAGUI.md`](TAMAGUI.md).
- `apps/web/typecheck` npm script wired (Phase 4) for local reproduction even though it's outside the gate.
- Methodology pinned: canonical baselines measured via one-off `node:20-slim` + monorepo-root hoisted `/repo/node_modules`, matching CI conditions and reproducible across machines.

**CI gate**: `.github/workflows/typecheck.yml` (sequential per-workspace `tsc --noEmit` under `set +e` with explicit pass/fail aggregation; ~33s wall + ~30s `npm install` = ~63s CI total).

**Plugin-pack alignment today**:
- `.cursor/rules/22-typescript-contracts-runtime-validation.mdc` (boundary payload validation discipline — closely related but anchored on the validation axis).
- *Gap*: no rule encoding the 6 strict flags. New TS code added to a non-gated workspace, or a future new workspace, can quietly drop a flag and the CI gate (which only runs on the gated set) might miss it. See §8.2 for the proposed rule.

### 4.3 Tests slice — layered coverage discipline

**Bug class owned**: behavioral regressions at runtime — drift between code and behavior across 5 test layers (L1 unit, L2 route integration, L3 service integration, L4 contract snapshots, L5 Playwright E2E). Catches what neither lint nor types can see: business-logic correctness, route-level ACL gates, contract-shape integrity at the wire, multi-step user flows.

**Outcome (per [`docs/TESTING.md`](TESTING.md))**:
- L1 contract parser coverage: 8/8 (was 5/8 at slice start). 70 unit tests across 5 suites in `packages/contracts`.
- L4 BeerJSON contract snapshots: 15/15 native-consumed endpoints (was 2/15). 7 contract suites with 16 tests in `services/api`.
- L5 Playwright regression pins for the Phase 4b workspace water-profile bug + Phase 5g render-prop bug. Smoke suite 13 → 18 specs.
- L2 route surface audit + 5 implementation sub-phases (Phase 4b-1 through 4b-5):
  - `services/api/src/tests/brewSessions.test.ts` — 7 cross-workspace isolation tests (404 expectations on detail/PATCH date/DELETE/start/pause/stop).
  - `services/api/src/tests/inventory.test.ts` — 20 tests (4 routes × 5 axes from scratch).
  - `services/api/src/tests/brewdaySettings.test.ts` — 9 tests (2 routes).
  - `services/api/src/tests/recipeWaterSettings.test.ts` — 8 auth-pin tests appended.
  - `services/api/src/tests/platformAdminRoutes.test.ts` — 27 tests covering all 12 platform-admin routes.
- L1 `packages/core` audit: 47 tests (was 26) across 4 files. `services/api/src/domain/waterCalc/*` L1 audit + 5 sub-phases (Phase 5b-1 through 5b-5) — every one of the 9 substantial files now has direct L1 tests.
- `services/api` test count: 162 → 400 across 40 → 49 files (+167 tests / +9 new files in 2 days).
- Repo total: 521 vitest tests across 4 packages + 18 Playwright specs. All green.

**CI gate**: `.github/workflows/api.yml` (services/api vitest suite); per-workspace test scripts; the pre-existing `apps/web/e2e` Playwright workflow continues to run the smoke suite.

**Plugin-pack alignment today**:
- `.cursor/rules/20-tests-must-follow-changes.mdc` (cross-stack — encodes the layered test-mapping discipline; refers contributors to project-local `docs/TESTING.md` for specifics).
- `.cursor/rules/90-testing.mdc` is Magento/PHPUnit-scoped (heritage from a different project) and does not apply to TS/JS work.
- `.cursor/rules/92-ci-safe-unit-tests.mdc` (CI-safe unit-test discipline).
- *Gap*: no skill that scaffolds an L2 cross-workspace isolation test against an existing route. The pattern is now well-established (40 files of evidence) but encoded only as prose.

### 4.4 Docs slice — module README discipline

**Bug class owned**: contributor-experience drift — module READMEs that drift from the code, omit the brand callout, link to absent docs, miss required sections. The slice anchors *public-flip-quality* documentation for the H1 2027 milestone.

**Outcome (per [`docs/DOCS-README-STANDARDS.md`](DOCS-README-STANDARDS.md) v1.1)**:
- Canonical README template + audit checklist published (Phase 1).
- 7 existing module READMEs standardized against the template (Phase 2c) — `api-client`, `contracts`, `i18n`, `media`, `recipes-ui`, `test-mcp`, `ui`.
- 1 apps READMEs standardized (Phase 2a) — `apps/web/e2e/README.md`.
- 6 missing module READMEs written from scratch (Phase 3) — `apps/web`, `apps/native`, `services/api`, `packages/beerjson`, `packages/i18n-react`, `packages/navigation`.
- Markdown structural + link checker published as `scripts/docs/check-readmes.py` (404 lines, zero-dependency Python). Enforces title matching `package.json` name, tagline presence, brand callout, required `##` headings, cross-reference count, link resolution, no `<PLATFORM_NAME>` placeholder leaks, no `@umbraculum/*` imports in code blocks (the future scope is parked behind sub-plan #9 — see §7).
- All 14 full-template + 1 sub-component README pass the gate locally.

**CI gate**: `.github/workflows/docs-readmes.yml` (path-gated; runs `check-readmes.py` on `ubuntu-latest`; ~2s wall).

**Plugin-pack alignment today**:
- `.cursor/rules/44-tsjs-project-docs-first.mdc` (read project-local docs before broad TS/JS changes — including `docs/TESTING.md`, `docs/LINTING.md`, `docs/CONTRACTS-VALIDATION-STRATEGY.md`).
- `.cursor/rules/11-cursor-package-files-edit-in-source-repo.mdc` (related — Cursor package files edited in source repo).
- *Gap*: no rule encoding the DOCS-README-STANDARDS.md template directly. A new module added to `packages/*` today does NOT have a Cursor rule that would prompt the AI to scaffold the README from the canonical template; the contributor learns the convention only by reading existing READMEs or by failing the CI gate. See §8.4 for the proposed rule.

---

## 5. Cross-slice findings

The strongest argument for the four-slice framing is the *compound discoveries* — bugs and properties that the slices surfaced because they reinforce each other, not in isolation. These are the most useful examples for plugin-pack design because they demonstrate that "by design" enforcement multiplies value across slices.

### 5.1 The lint slice surfaced a long-broken UI feature (`account → workspace` stale-consumer drift)

HIGH-full Phase 4b promoted `apps/web` `no-unsafe-*` rules to `error`. The expected "Tamagui wall" turned out to be a phantom: 95% of the 290+ `apps/web` `no-unsafe-*` warnings traced to a single stale `account → workspace` field rename in commit `87876d0` that missed four UI consumers. Fixing the lint **also restored a long-broken UI feature** where workspace water profiles silently never appeared in dropdowns. A type-driven correctness bug had been in production undetected because the runtime code path was a `?.account` chain that returned `undefined` and silently fell back to "no profiles found" — exactly the kind of bug L1 unit tests typically don't exercise (they test the parser, not the consumer composition) and that lint-without-`no-unsafe-*` doesn't see (it's a correctness bug, not a code-smell). **Lint promoted to type-aware caught a real shipping bug.**

### 5.2 The types slice surfaced a cross-workspace data-leak bug (`routes/ingredients.ts` Prisma `Where` spread-OR overwrite)

Types Phase 3b refactor of `routes/ingredients.ts` from spread-based literals with `as const` to explicit `AND: Prisma.<Entity>WhereInput[]` composition surfaced and fixed a latent bug: the original spread silently overwrote the workspace-scoping `OR` with the search-query `OR` whenever both `activeWorkspaceId` AND `q` were present, exposing all workspaces' rows to authenticated search across `/ingredients/{fermentables,hops,yeasts}`. Affected all three routes. **This is exactly the bug class L1+L2 tests don't catch** (they test a single workspace's listing, not the cross-workspace scoping under search), **ESLint can't see** (correctness, not code-smell), **and a runtime-validation library would not have caught** (Zod-with-Fastify-type-provider validates request bodies, not the Prisma queries that compose against those bodies — see §6 and the 2026-05-18 audit row in [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md)). **The type-driven refactor was the only tool that could have surfaced this bug.**

### 5.3 The lint slice pre-paid the types slice's `verbatimModuleSyntax` cost

Types Phase 6h surveyed `verbatimModuleSyntax` + `isolatedModules` across all 15 workspaces and found *0 new errors anywhere*. Investigation revealed the cause: the lint slice's `@typescript-eslint/consistent-type-imports` rule (severity `error` since the lint slice) had pre-paid the `verbatimModuleSyntax` discipline at lint-time. Every existing `import` was already type-erased correctly under the strict-flag's compile-time check because the lint rule had been requiring it. **The runtime-style enforcement (lint) was the runtime-style equivalent of the strict-flag's compile-time check (types).** This is documented as Side-finding 6 in [`docs/TYPING.md`](TYPING.md). The lesson generalizes: lint and type rules that target the same discipline reinforce each other; in plugin-pack design, a rule should ideally cite both layers when both apply (CI floor + authoring layer + the user's daily editor experience).

### 5.4 The tests slice surfaced that runtime tests do not substitute for `tsc --noEmit`

Types Phase 1 found 4 type errors in test files I authored during the test-coverage hardening pass (`gravityAnalysis.test.ts`, `overall.test.ts`). These tests ran green under `npm run test` (all 400 tests passed) because vitest's underlying transpiler (esbuild via vite) is **lenient by design** — it strips types without type-checking them. **The L1+L2 test layers are not a substitute for `tsc --noEmit`**; they catch behavioral regressions but not type-contract drift. This is part of why the foundation-hardening pass has three slices (lint, tests, types) instead of two — each bug class needs its own tool, and the slices are complementary rather than overlapping.

### 5.5 The docs slice depends on the types slice for one specific guardrail

The `scripts/docs/check-readmes.py` structural checker enforces "no `@umbraculum/*` imports in code blocks" (because the package-scope rename from `@brewery/*` to `@umbraculum/*` is parked behind sub-plan #9 — the prose name has been adopted but the package names have not). This is a *temporary* guardrail tied to a specific in-flight plan. The docs slice cannot enforce it permanently because the relationship between prose and package names is plan-dependent; the check exists to catch premature adoption while the rename is staged. The plugin-pack equivalent would be a rule with an explicit time-bound caveat, refreshed when sub-plan #9 lands. See §7.

### 5.6 The validation axis is genuinely orthogonal

Lint, types, and tests together are the *bug-prevention* foundation. The validation axis (boundary-payload validation, [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md)) sits at the *runtime-data-boundary* tier and is decided per-criterion, not per-phase. The 2026-05-18 audit confirmed this: 0/6 trigger criteria met, hand-rolled re-confirmed (see §6). The types slice's Phase 6f + 6g enabled `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` on `packages/contracts`, which **strengthened** the hand-rolled position by adding compile-time guarantees on the 8 hand-rolled parsers — the "schema-correctness vs hand-rolled-correctness" aesthetic argument is partly retired now that hand-rolled parsers are under maximally-strict TypeScript and green in CI. This is not a coincidence; the slices reinforce each other across the bug-prevention foundation, and the validation axis benefits even though it isn't itself a slice.

---

## 6. The validation question (orthogonal axis)

This section exists because plugin-pack authors will look at the bug-prevention foundation and reasonably ask "what about runtime validation? did we adopt Zod?" The honest answer is **no**, and the answer is recorded explicitly so that future contributors don't re-litigate the question without consulting the existing analysis.

### 6.1 What is and isn't decided

- **What is decided**: `packages/contracts` uses 8 hand-rolled `parseX(unknown): X` parsers with shared type-guard helpers, zero runtime dependencies. `services/api` uses hand-rolled `BadRequestError`/`UnauthorizedError`-style Fastify validation across 28 routes; no `fastify-type-provider-zod` / `-typebox` / equivalent. The decision was first recorded 2026-05-15 and re-confirmed at the 2026-05-16 + 2026-05-18 audits.
- **What is *not* decided**: whether to *eventually* migrate. The strategy doc is explicit that migration is tracked as a future architectural decision (not a type-discipline gap). The 6 trigger criteria in [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) §"When to revisit" are the explicit conditions under which the decision should be re-opened.

### 6.2 The 2026-05-18 milestone-aligned audit

Run at the close of the foundation-hardening pass to confirm that hardening did not move any of the 6 trigger criteria. Result: **0/6 met → re-confirm hand-rolled.** The audit row in [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) §Audit log records per-criterion evidence. The single notable finding (Phase 6f Side-finding 2 — cross-workspace data-leak in `routes/ingredients.ts`) is a Prisma-query-construction shape bug, NOT parser/interface drift, and Zod with a Fastify type provider would not have caught it. The decision stands.

### 6.3 What this means for the plugin pack

There is already a plugin-pack rule that encodes the validation discipline:
- [`.cursor/rules/22-typescript-contracts-runtime-validation.mdc`](../.cursor/rules/22-typescript-contracts-runtime-validation.mdc) — boundary payloads must be parsed not cast; the project's declared validation strategy must be followed; Zod / Valibot / TypeBox must NOT be introduced just because a parser is being edited.

This rule is well-aligned with the strategy doc and does not need rewriting. **The thing to add** at the plugin-pack level is a *pointer* from this rule (or its sibling docs-first rule) to the audit cadence — so that when a future contributor or AI reads the rule and is tempted to migrate, they're directed to the structured 6-criteria check, not to a free-form re-evaluation. See §8.5 for the proposed update.

The validation axis does not have its own CI gate. It does not need one — the 6 trigger criteria are explicit observations a maintainer (or auditing AI) can walk against the codebase and external state, and the audit cadence is "aligned with foundation-hardening pass milestones in `docs/ROADMAP.md`." This deliberately keeps validation as an architectural decision, not an automated rule.

---

## 7. Pending items + handoffs

What remains open after the foundation-hardening pass closes. Each item is tracked in a more specific doc; this section is the index, not the source of truth.

| Item | State | Tracked in | Notes |
|---|---|---|---|
| Tests Phase 4d — role-based ACL coverage | Deferred | [`docs/TESTING.md`](TESTING.md) (audit + non-goals) | Gated on the architectural decision to wire `AclService.requireRole` into routes (currently exists but is unwired). The audit explicitly documented the unwired state as known v0. |
| Types Phase 6e remediation in non-gated workspaces | n/a — already landed | [`docs/TYPING.md`](TYPING.md) | Phase 6e fixed all 2566 TS4111 errors across 8 workspaces in one bulk-mechanical pass on 2026-05-18; no remediation is pending. (A historic todo in earlier planning had this as pending — the todo is stale and should be resolved as completed.) |
| `apps/native` test runner | Deferred | [`docs/TESTING.md`](TESTING.md) non-goals | The L5 web-side regression pin for the Phase 5g render-prop bug shipped; the native-side equivalent is deferred until `apps/native` gets a test runner. |
| `@brewery/*` → `@umbraculum/*` package-scope rename | Out of scope of this pass | [`docs/RENAME-DILIGENCE.md`](RENAME-DILIGENCE.md), sub-plan #9 | The brand rename to Umbraculum landed in prose (this doc, all module READMEs, ROADMAP.md). The `@brewery/*` npm scope rename is tracked separately as sub-plan #9 because it requires lockfile + import-site cascade. The docs CI gate temporarily forbids `@umbraculum/*` in code blocks to catch premature adoption — see §5.5. |
| `docs/ROADMAP.md` mark docs slice feature-complete | Optional follow-up | [`docs/ROADMAP.md`](ROADMAP.md) | Mirror the types-slice pattern from commit `ed3bb84`. Defer-OK. The H1 2027 paragraph already references the docs slice via "remaining foundation workstream"; updating it to "feature-complete" is housekeeping. |
| Next contracts-validation re-audit | Scheduled | [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) audit log | Cadence: "aligned with foundation-hardening pass milestones in `docs/ROADMAP.md`." The 2026-05-18 audit was milestone-aligned at the close of this pass; the next audit fires when (a) any single trigger criterion fires unambiguously between scheduled audits, or (b) at the next major architectural milestone (likely H2 2026 AI-consultant landing or the public-flip preparation). |

There is no slice-level work pending in lint, types, tests, or docs. The four slices are feature-complete by their own status banners, the CI gates are wired, and the plugin-pack alignment is the explicit next step (this doc § 8).

---

## 8. Plugin-pack manifest (the actionable section)

This section maps each slice's discipline to specific artifacts in `.cursor/rules/`, `.cursor/skills/`, and `.cursor/agents/`, distinguishing what already exists from what's a gap. Each gap is sketched as a concrete proposal (artifact name + type + delegation trigger + body summary), in a form ready to drop into the plugin-pack refinement.

The proposals follow the meta-framework already in `.cursor/rules/`:
- Rule = guardrail + pointer (no procedure).
- Skill = runnable runbook (input-driven, output-constrained, ≤5 commands).
- Subagent = specialized AI assistant with delegation trigger, ≤30-line body, references a canonical skill.

When this doc and the plugin-pack files disagree about a rule's scope or content, the plugin-pack file wins (it's the live artifact); update §8 to match.

### 8.1 Cross-slice anchor (proposed new rule)

| Field | Value |
|---|---|
| **Type** | Rule |
| **File** | `.cursor/rules/02-foundation-hardening.mdc` (proposed) |
| **alwaysApply** | `true` |
| **Purpose** | Single pointer to this doc as the entry point to the foundation-hardening narrative. Any AI-assisted contributor opening the repo gets routed to the four slice docs (and this synthesis layer) before broad work. |
| **Body sketch** | Two-section: (a) "Read first" — pointer to `docs/FOUNDATION-HARDENING.md` and the four slice docs; (b) "Why this exists" — one-sentence framing of the four slices + validation axis. ≤30 lines. |

The existing `.cursor/rules/44-tsjs-project-docs-first.mdc` is similar but framed around per-doc reading rather than the synthesis-layer entry point. The new rule complements it; it does not replace it.

### 8.2 Lint slice mapping

**Existing alignment** (no gap):
- `.cursor/rules/23-eslint-flat-config-hygiene.mdc` (production-config hygiene; `globs: eslint.config.*` etc.).
- `.cursor/rules/23a-eslint-fixall-discipline.mdc` (editor-config split; `globs: .vscode/settings.json*` + `eslint.config.editor.*`).

These two rules together cover the lint slice's authoring-time discipline. The CI gate (`web-lint.yml`) covers the post-violation case. The cross-platform UI primitive guardrail (the canonical bug class — `packages/ui/src/{ai,charts}/**` cannot import raw `tamagui` Button/Input/BrewCheckbox) is enforced by the lint rule alone; an AI-authoring-time rule could pre-warn but the lint rule is sufficient.

**Proposed minor refinement**: extend `.cursor/rules/44-tsjs-project-docs-first.mdc` to explicitly list `docs/FOUNDATION-HARDENING.md` (this doc) alongside `docs/LINTING.md` so that a contributor reading the lint discipline gets the cross-slice context for free. ≤5-line edit.

### 8.3 Types slice mapping

**Existing alignment** (partial):
- `.cursor/rules/22-typescript-contracts-runtime-validation.mdc` (boundary payload discipline — adjacent to the types slice but anchored on validation; covers `interface` vs `type`, `null`/`undefined` modeling discipline, and the no-`as SomeDto` rule).
- `.cursor/rules/20-node-esm-imports-api.mdc` (Node ESM import discipline — adjacent, related to `verbatimModuleSyntax` rollout).

**Gap**: no rule encoding the 6 strict flags. A new TS workspace added to the repo today, or new TS code added to a non-gated workspace (`apps/web`, `packages/ui`), can quietly drop a strict flag and the typecheck CI gate (which runs only on the 13-workspace gated set) won't catch it. The types slice's `tsc --noEmit` discipline is enforced for the gated 13 but not authoring-time-encoded.

**Proposed new rule**:

| Field | Value |
|---|---|
| **Type** | Rule |
| **File** | `.cursor/rules/26-typescript-strict-flags.mdc` (proposed) |
| **globs** | `**/tsconfig*.json`, `apps/**/*.{ts,tsx}`, `services/**/*.{ts,tsx}`, `packages/**/*.{ts,tsx}` |
| **Purpose** | Encode the 6 strict flags (`strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `isolatedModules`) as the floor for any new TS workspace. New tsconfig must inherit / set them; new TS code must compile under them. |
| **Body sketch** | (a) "When creating a new tsconfig, all 6 flags must be on or inherited"; (b) "When fixing TS errors, the 4 fix patterns documented in `docs/TYPING.md` (type-widening, conditional spread, non-null assertion, `?.foo ?? null`) cover ~95% of cases — no `as any`, no `// @ts-expect-error` without a reason"; (c) pointer to `docs/TYPING.md` for the canonical baseline + methodology. ≤25 lines. |

**Proposed new subagent**:

| Field | Value |
|---|---|
| **Type** | Subagent |
| **File** | `.cursor/agents/types-baseline-verifier.md` (proposed) |
| **readonly** | `true` |
| **Description** | "Verifier for the TypeScript types slice. Use proactively after editing tsconfig.json, after adding a new TS file in a non-gated workspace, or after a strict-flag-related refactor. Confirms `tsc --noEmit` is green for the affected workspace and that the 6 strict flags are set." |
| **Body** | ≤30 lines; references a canonical skill (proposed `.cursor/skills/typescript-strict-flag-verification.md`) that walks: (1) detect affected workspace from edited file path, (2) run the canonical one-off-container `tsc --noEmit` per `docs/TYPING.md` §Methodology, (3) grep the workspace's tsconfig for the 6 flags, (4) report OK / FAIL summary, ≤1 line per failure. |

The skill must follow the Skill Contract (≤5 commands, no loops, output-constrained).

### 8.4 Tests slice mapping

**Existing alignment** (mostly):
- `.cursor/rules/20-tests-must-follow-changes.mdc` — cross-stack; encodes the layered test-mapping discipline; refers to project-local `docs/TESTING.md`.
- `.cursor/rules/92-ci-safe-unit-tests.mdc` — CI-safe unit-test discipline.

**Gap**: no skill encoding the L2 cross-workspace isolation pattern. The pattern is now well-established in 40 test files, but a new contributor (or AI) adding a new workspace-scoped route has to reverse-engineer the pattern from existing tests.

**Proposed new skill**:

| Field | Value |
|---|---|
| **Type** | Skill |
| **File** | `.cursor/skills/l2-cross-workspace-isolation-test.md` (proposed) |
| **Inputs required** | `<ROUTE_PATH>` (the route under test), `<METHOD>` (GET/POST/PATCH/DELETE), `<SECOND_PERSONA_ID>` (the cross-workspace persona — typically `e2e-multi-admin`), `<TEST_FILE_PATH>` (where the test should land) |
| **Output format** | Returns a single `describe` block with the 6 tests for the canonical 6-axis pattern (happy / cross-workspace 404 / unauthorized / validation 400 × 2 / shape pin). |
| **Bounds** | ≤5 commands. Stops at: route not workspace-scoped (different test pattern needed), missing persona, test file would conflict with existing block. |

**Optional refinement**: deprecate `.cursor/rules/90-testing.mdc` for TS/JS work (it's Magento/PHPUnit-scoped only) by tightening its `globs:` to PHPUnit paths only, so AI-authored TS/JS work does not see it. The rule itself stays valid for Magento heritage projects in the same plugin pack.

### 8.5 Docs slice mapping

**Existing alignment** (partial):
- `.cursor/rules/44-tsjs-project-docs-first.mdc` (read project-local docs before broad TS/JS work — including `docs/TESTING.md`, `docs/LINTING.md`, etc.).
- `.cursor/rules/11-cursor-package-files-edit-in-source-repo.mdc` (Cursor package files edited in source repo).

**Gap**: no rule encoding `docs/DOCS-README-STANDARDS.md` directly. A new module added to `packages/*` today does not get a Cursor rule prompting the AI to scaffold the README from the canonical template; the contributor learns the convention only by reading existing READMEs or by failing the CI gate.

**Proposed new rule**:

| Field | Value |
|---|---|
| **Type** | Rule |
| **File** | `.cursor/rules/45-tsjs-module-readme-standard.mdc` (proposed) |
| **globs** | `apps/*/README.md`, `services/*/README.md`, `packages/*/README.md` |
| **Purpose** | When creating or editing a module README, follow the canonical template + audit checklist in `docs/DOCS-README-STANDARDS.md`. Brand callout, required `##` headings, cross-reference count, link resolution. |
| **Body sketch** | (a) "When creating a new module README, scaffold from the template in `docs/DOCS-README-STANDARDS.md` §Template"; (b) "When editing an existing module README, run the audit checklist mentally (or via the proposed module-readme-checker subagent below)"; (c) pointer to `scripts/docs/check-readmes.py` as the structural floor. ≤20 lines. |

**Proposed new subagent**:

| Field | Value |
|---|---|
| **Type** | Subagent |
| **File** | `.cursor/agents/module-readme-checker.md` (proposed) |
| **readonly** | `true` |
| **Description** | "README structural validator. Use proactively after editing any module README under `apps/*/README.md`, `services/*/README.md`, or `packages/*/README.md`. Wraps `scripts/docs/check-readmes.py` and reports OK / FAIL on the structural + link checks, ≤1 line per failure." |
| **Body** | ≤30 lines; references `.cursor/skills/module-readme-verification.md` (proposed) which executes the script with the affected README path and post-processes output to the bounded format. |

### 8.6 Validation axis mapping

**Existing alignment** (no gap):
- `.cursor/rules/22-typescript-contracts-runtime-validation.mdc` already encodes the validation discipline well — boundary payloads must be parsed not cast, no introducing Zod / Valibot / TypeBox just because a parser is being edited, schema-library decisions are architectural and require explicit user request + bundle/scope/test analysis.

**Proposed minor refinement**: add a one-line cross-reference at the bottom of `22-typescript-contracts-runtime-validation.mdc` pointing to `docs/CONTRACTS-VALIDATION-STRATEGY.md` §"When to revisit" (the 6 trigger criteria) — so that an AI tempted to migrate is directed to the structured check, not to a free-form re-evaluation.

### 8.7 Summary of proposed plugin-pack changes

| Artifact | Type | Status | Effort |
|---|---|---|---|
| `02-foundation-hardening.mdc` | Rule | Proposed | New (≤30 lines) |
| `26-typescript-strict-flags.mdc` | Rule | Proposed | New (≤25 lines) |
| `45-tsjs-module-readme-standard.mdc` | Rule | Proposed | New (≤20 lines) |
| `types-baseline-verifier.md` | Subagent | Proposed | New (≤30 lines + paired skill) |
| `module-readme-checker.md` | Subagent | Proposed | New (≤30 lines + paired skill) |
| `typescript-strict-flag-verification.md` | Skill | Proposed | New (≤5 commands) |
| `module-readme-verification.md` | Skill | Proposed | New (≤5 commands) |
| `l2-cross-workspace-isolation-test.md` | Skill | Proposed | New (≤5 commands) |
| `44-tsjs-project-docs-first.mdc` | Rule | Refine | Append `docs/FOUNDATION-HARDENING.md` to the "Read first" list (~5 lines) |
| `22-typescript-contracts-runtime-validation.mdc` | Rule | Refine | Append cross-reference to `CONTRACTS-VALIDATION-STRATEGY.md` §"When to revisit" (~3 lines) |
| `90-testing.mdc` | Rule | Refine | Tighten `globs:` to PHPUnit paths only so it does not apply to TS/JS work (already mostly there; one-line scope tighten) |

Total proposed plugin-pack delta: 3 new rules, 2 new subagents, 3 new skills, 3 minor refinements. All proposals follow the meta-framework's contracts (Skill Contract / Subagent Contract / Authoring Gate); none are speculative; each has a specific delegation trigger and a bounded output format.

The plugin-pack work is **not in the scope of this commit** — this doc is the *handoff document* for that work, not the implementation. The foundation-hardening pass closes here; the plugin-pack refinement is the next discrete piece, owned at the maintainer-pack-author level rather than at the project-foundation level.

---

## Appendix — versioning + sign-off

| Version | Date | Change |
|---|---|---|
| v1.0 | 2026-05-18 | Initial publication at the close of the lint + types + tests + docs slices; bundled with the contracts-validation milestone-aligned re-audit (0/6 met → re-confirm hand-rolled) recorded in [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) v1.2. |

Sign-off: maintainers. Next milestone: plugin-pack refinement per §8.

