# Foundation hardening (slice summary + plugin-pack handoff)

**Tier:** Public
**Status:** v2.0 — **validation slice promoted from orthogonal axis to landed slice 2026-05-19** per [RFC-0003](rfcs/0003-validation-library-adoption.md) (Accepted same day, Zod v4 adopted, plugin-pack rules co-authored during migration per Decision E). Previous lint + types + tests + docs slices remain feature-complete (v1.0 status preserved as the audit trail for the foundation-hardening narrative). The validation slice's CI gate and plugin-pack alignment are tracked at the same maturity as the original four; total slice count is now **five**.
**Audience:** future contributors (single entry point to the foundation-hardening narrative); plugin-pack authors (slice → rule/skill/subagent mapping).
**Owners:** maintainers
**Related:** [`docs/LINTING.md`](LINTING.md) (lint slice SoT), [`docs/TYPING.md`](TYPING.md) (types slice SoT), [`docs/TESTING.md`](TESTING.md) (tests slice SoT), [`docs/DOCS-README-STANDARDS.md`](DOCS-README-STANDARDS.md) (docs slice SoT), [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) v2.0 (validation slice SoT — historical v1.x narrative preserved), [RFC-0003](rfcs/0003-validation-library-adoption.md) (validation-slice canonical commitment), [`docs/design/validation-library-adoption-audit.md`](design/validation-library-adoption-audit.md) (audit evidence base), [`spike/validation-library/`](../spike/validation-library/) (Phase 1 spike scaffold), [`docs/ROADMAP.md`](ROADMAP.md) (the foundation-hardening pass narrative is embedded in the H1 2027 milestone paragraph), [`MANIFESTO.md`](../MANIFESTO.md) (the values commitment that motivates "invest in foundations alongside features").

---

## 1. Why this doc

The foundation-hardening pass closed in May 2026 across four slices (lint → types → tests → docs). Each slice has its own canonical doc, its own CI gate, and its own decision log. This doc exists for two readers the per-slice docs cannot serve well:

1. **A future contributor** opening the repo for the first time who needs the *bird's-eye narrative* — what got hardened, when, why those four slices and not others, what state the foundation is in today, and where to dig deeper for any one slice.
2. **A plugin-pack author** (the maintainers' own Cursor plugin `rules/` + `skills/` + `agents/` work) who needs the *slice → enforcement-mechanism mapping* — which rule encodes which discipline, which skill carries the procedure, which subagent runs the check. This is the deliverable that makes the foundation self-enforcing for future code, not just a one-time event.

This doc is **not a source of truth for any single slice** — it is a synthesis layer. When this doc and a per-slice doc disagree, the per-slice doc wins; please update this one to match.

---

## 2. The five slices at a glance

| Slice | Status | CI gate | Canonical doc | Started | Feature-complete |
|---|---|---|---|---|---|
| **Lint** | ✅ Feature-complete | `.github/workflows/web-lint.yml` (single `npm run lint` call; 0 warnings, 0 errors at `error` severity for all 12 type-aware rules + base preset) | [`docs/LINTING.md`](LINTING.md) | 2026-04 (HIGH-light) | 2026-05-16 (HIGH-full Phase 5) |
| **Types** | ✅ Feature-complete | `.umbraculum/ci-parity.json` + `@umbraculum/ci-parity` / `.github/workflows/typecheck.yml` (15 CI-gated workspaces; all 6 candidate strict flags enabled) | [`docs/TYPING.md`](TYPING.md), [`docs/CI-PARITY.md`](CI-PARITY.md) | 2026-05-18 (Phase 1 audit) | 2026-05-18 (Phase 6h) |
| **Tests** | ✅ Feature-complete (non-deferred phases) | `.github/workflows/api.yml` + per-workspace test scripts; L1 + L2 + L4 + L5 layers wired; 521 vitest tests across 4 packages + 18 Playwright specs | [`docs/TESTING.md`](TESTING.md) | 2026-05-17 | 2026-05-18 (Phase 5b-5) |
| **Docs** | ✅ Feature-complete | `.github/workflows/docs-readmes.yml` (`scripts/docs/check-readmes.py` structural + link checks across 14 full-template + 1 sub-component README) | [`docs/DOCS-README-STANDARDS.md`](DOCS-README-STANDARDS.md) | 2026-05-18 | 2026-05-18 (Phase 4) |
| **Validation** | ✅ Decision landed (PR2 + PR4 complete; PR1 + PR3 staged with worked examples + handoff docs) — **Zod v4 adopted 2026-05-19 per [RFC-0003](rfcs/0003-validation-library-adoption.md)** | Existing lint rule (`no-restricted-syntax` in `eslint.config.mjs`) forbids hand-rolled type-guard helpers in `packages/*-contracts/`; existing typecheck CI gate enforces parsed-type correctness; route schemas under Fastify type provider after PR3 | [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) v2.0 | 2026-05-15 (hand-rolled decision); 2026-05-19 (flipped to Zod per RFC-0003) | 2026-05-19 — RFC-0003 Accepted; spike findings recorded; library-agnostic SDK boundary published (`packages/module-sdk` PR4 landed) |

The first three landed slices are the *bug-prevention foundation*: lint, types, and tests prevent three complementary bug classes that the others cannot reach (see §5). The docs slice is the *contributor-experience foundation* that makes the other three discoverable. The validation slice — **formerly tracked as an orthogonal axis** through 2026-05-18 — was promoted to a landed slice on 2026-05-19 when RFC-0003 was accepted and the migration began; the slice owns the *runtime-data-boundary* tier (request/response payloads, persisted-JSON shapes, AI-tool input/output, BeerJSON pass-through), and the canonical library is **Zod v4** for the internal codebase, **library-agnostic `ValidatedSchema<T>`** for the public-facing SDK. See §4.5 for the deep-dive and §6 for the historical narrative of why the orthogonal-axis framing was abandoned.

The ROADMAP's H1 2027 milestone paragraph ([`docs/ROADMAP.md`](ROADMAP.md) line 42) is the dense narrative form of this table; this doc is the structured form. Both should track the same state; if they drift, treat the per-slice docs as authoritative and update both.

---

## 3. What "by design" enforcement means

Every slice landed with two enforcement layers, and both are necessary:

### Layer 1 — CI gate (post-violation detection)

A GitHub Actions workflow that runs on push/PR and fails the build if the slice's discipline is violated. CI gates are the *floor*: nothing below them ships. They detect violations that already reached the codebase. Today every landed slice has its CI gate (`web-lint.yml`, `typecheck.yml`, `api.yml`, `docs-readmes.yml`).

### Layer 2 — Plugin-pack discipline (pre-violation prevention)

Cursor plugin `rules/`, `skills/`, and `agents/` artifacts that shape what an AI-assisted contributor (or the maintainer using Cursor as their daily IDE) writes *in the first place*. A rule that says "imports across workspace boundaries must use `import type` for type-only imports" prevents the violation from ever reaching the typecheck gate. Repo-local `.cursor/rules/` remains fallback-only for troubleshooting an observed plugin `alwaysApply` enforcement gap.

The plugin layer is **not a substitute** for the CI gate (an AI assistant might be off, a contributor might not be using Cursor, a rule might miss a case). The CI gate is **not a substitute** for the plugin layer (it tells you *after* the fact, not *before*; it doesn't compose with the contributor's mental model).

The two layers compound:
- CI gate: catches violations that escape the plugin layer.
- Plugin layer: prevents violations from reaching the CI gate, reduces revision cycles, encodes the *rationale* (not just the rule).

The maintainers' authoring meta-framework already governs how rules / skills / subagents are written:
- `12-skill-contract.mdc` (shipped by `umbraculum-toolset-common`) — skills must be input-driven, output-constrained, bounded.
- `13-rule-skill-authoring-gate.mdc` (shipped by the plugin pack) — every new artifact must explicitly answer "rule, skill, or subagent?"
- `14-subagent-contract.mdc` (shipped by the plugin pack) — subagents must have specific delegation triggers, ≤30-line bodies, references to a canonical skill.

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
- `rules/23-eslint-flat-config-hygiene.mdc` (production-config hygiene; rule promotion stages, flat-config block ordering, inline-disable reasons).
- `rules/23a-eslint-fixall-discipline.mdc` (editor-config split; `source.fixAll.eslint: "explicit"` discipline; never `true`).
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
- `rules/22-typescript-contracts-runtime-validation.mdc` (boundary payload validation discipline — closely related but anchored on the validation axis).
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
- `rules/20-tests-must-follow-changes.mdc` (cross-stack — encodes the layered test-mapping discipline; refers contributors to project-local `docs/TESTING.md` for specifics).
- `rules/90-testing.mdc` is Magento/PHPUnit-scoped (heritage from a different project) and does not apply to TS/JS work.
- `rules/92-ci-safe-unit-tests.mdc` (CI-safe unit-test discipline).
- *Gap*: no skill that scaffolds an L2 cross-workspace isolation test against an existing route. The pattern is now well-established (40 files of evidence) but encoded only as prose.

### 4.4 Docs slice — module README discipline

**Bug class owned**: contributor-experience drift — module READMEs that drift from the code, omit the brand callout, link to absent docs, miss required sections. The slice anchors *public-flip-quality* documentation for the H1 2027 milestone.

**Outcome (per [`docs/DOCS-README-STANDARDS.md`](DOCS-README-STANDARDS.md) v1.1)**:
- Canonical README template + audit checklist published (Phase 1).
- 7 existing module READMEs standardized against the template (Phase 2c) — `api-client`, `contracts`, `i18n`, `media`, `recipes-ui`, `test-mcp`, `ui`.
- 1 apps READMEs standardized (Phase 2a) — `apps/web/e2e/README.md`.
- 6 missing module READMEs written from scratch (Phase 3) — `apps/web`, `apps/native`, `services/api`, `packages/beerjson`, `packages/i18n-react`, `packages/navigation`.
- Markdown structural + link checker published as `scripts/docs/check-readmes.py` (zero-dependency Python). Enforces title matching `package.json` name, tagline presence, project callout, required `##` headings, cross-reference count, link resolution, and no obsolete placeholder-token leaks.
- All 14 full-template + 1 sub-component README pass the gate locally.

**CI gate**: `.github/workflows/docs-readmes.yml` (path-gated; runs `check-readmes.py` on `ubuntu-latest`; ~2s wall).

**Plugin-pack alignment today**:
- `rules/44-tsjs-project-docs-first.mdc` (read project-local docs before broad TS/JS changes — including `docs/TESTING.md`, `docs/LINTING.md`, `docs/CONTRACTS-VALIDATION-STRATEGY.md`).
- `rules/11-cursor-package-files-edit-in-source-repo.mdc` (related — Cursor package files edited in source repo).
- *Gap*: no rule encoding the DOCS-README-STANDARDS.md template directly. A new module added to `packages/*` today does NOT have a Cursor rule that would prompt the AI to scaffold the README from the canonical template; the contributor learns the convention only by reading existing READMEs or by failing the CI gate. See §8.4 for the proposed rule.

### 4.5 Validation slice — Zod v4 boundary discipline (added v2.0)

**Bug class owned**: runtime data-boundary drift — request/response payload mismatches that the type system cannot see at compile time (because external callers, persisted JSON, or AI tools deliver `unknown` over the wire), forgotten field renames between client + server, AI-tool input-schema drift (the H2 2026 work the canonical-automation-module RFC introduces), persisted-JSON evolution (BeerJSON pass-through, sandbox-trial recipes, `mailbox.json` mirror, future plan rows), and back-compat shape negotiation (e.g., the `account` → `workspace` rename that surfaced as a stale-consumer bug in lint slice §5.1). **Response-body validation is now symmetric with request-body validation** (F10 Done — 2026-06-01): Fastify routes declare `schema.response` and framework serializers reject malformed 200s at the source; see [`CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) F10 row + §F10 appendix. The slice owns the layer that is *outside* the TypeScript guarantee — the runtime-data-boundary tier — and it does so with a single canonical library so that all four bug-prevention slices (lint + types + tests + validation) compound rather than fragmenting across hand-rolled, Zod, Valibot, and ad-hoc validators.

**Outcome (per [RFC-0003](rfcs/0003-validation-library-adoption.md) Accepted 2026-05-19 + [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) v2.0)**:
- **Library committed**: Zod v4 (MIT licensed, compatible with AGPLv3 platform per [`docs/LICENSING.md`](LICENSING.md) §6.2) for all internal `packages/*-contracts/` and Fastify route schemas; **library-agnostic `ValidatedSchema<T>` interface** exported from `packages/module-sdk` for third-party / public-SDK use (per RFC-0003 Decision C — Zod schemas satisfy the interface directly; Valibot / TypeBox / hand-rolled wrap via `fromParser`).
- **PR 1 — packages/contracts migration**: worked example complete (`meResponse.ts` migrated from hand-rolled parser to `AuthMeResponseSchema = z.preprocess(...)` with `z.transform()` for soft-tolerance fallbacks + `ZodError`-shape tests). Pending mechanical migration of 7 remaining parsers tracked in [`docs/design/pr1-contracts-migration-handoff.md`](design/pr1-contracts-migration-handoff.md).
- **PR 2 — packages/automation-contracts migration (full)**: `mailbox-data.ts` collapsed from 168 → 16 lines of core logic via `MailboxSpecSchema.parse(mailboxData)`; `mailbox.ts` types collapsed to `z.infer<typeof MailboxSpecSchema>`; duplicate-name + duplicate-address validation expressed as `z.superRefine()`. Tests intact (test surface is `MAILBOX_SPEC` value, not the parser).
- **PR 3 — Fastify route migration**: prep + worked example pattern documented in [`docs/design/pr3-routes-migration-handoff.md`](design/pr3-routes-migration-handoff.md) (28 routes, ~30 `assert*` helpers, ~80-100 integration tests, `apps/web` + `apps/native` client updates co-landed per RFC-0003 Decision G — no bridge layer). Container-side verification deferred from this session; PR3 is staged for the next session.
- **PR 4 — packages/module-sdk SDK boundary**: `ValidatedSchema<T>` interface + `fromParser` adapter published; README documents the Zod-internal / library-agnostic-SDK split; tests verify the structural contract (hand-rolled, inline-object, and parser-wrapper all satisfy the interface).
- **Lint guardrail** (co-landed in PR 1): `no-restricted-syntax` rule in `eslint.config.mjs` forbids hand-rolled type-guard helpers (`function isX(v: unknown): v is X`) in `packages/*-contracts/src/**`. This is the *post-migration* enforcement layer; existing helpers grandfathered until each parser migrates.
- **Plugin-pack rule** (rewritten in PR 1): `.cursor/plugins/local/umbraculum-node-react-cursor-assistant/rules/22-typescript-contracts-runtime-validation.mdc` rewritten to encode Zod v4 as the standard. Schema-first declaration via `z.object/...`, type inference via `z.infer<typeof Schema>`, backward-compat via `z.preprocess()`, soft-tolerance fallbacks via `z.transform()`, structured errors via `ZodError.issues[]`, library-agnostic SDK boundary discipline, explicit anti-patterns.
- **Spike scaffold** (`spike/validation-library/`): side-by-side Zod v4 + Valibot implementations of `MAILBOX_SPEC`, `parseMashAcidBlock` (discriminated union), and `/auth/signup` (Fastify type provider integration); LOC + DX + bundle-size paper-design comparison recorded in the spike README and in RFC-0003 §Evidence. Falsifiable tests F1–F7 enumerated; F7 (container-side bundle measurement) deferred to a follow-up.

**CI gate (today)**:
- Lint slice's CI (`web-lint.yml`) enforces `no-restricted-syntax` (no hand-rolled type-guards in `packages/*-contracts/`); the rule is the floor that prevents drift back to hand-rolled.
- Types slice's CI (`typecheck.yml`) enforces `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` on `packages/contracts` — strengthening the Zod-inferred types under maximally-strict TypeScript.
- Tests slice's CI (`api.yml`) runs the migrated unit + integration tests; `ZodError`-shape assertions land per PR 1's `expectFirstIssuePathStartsWith` test helper pattern.
- Per-route Fastify type provider (after PR 3) — `fastify-type-provider-zod`'s `setValidatorCompiler` + `setSerializerCompiler` route every request body through `ZodSchema.parse()`; failures surface as `400` with the structured `issues[]` envelope.
- No new dedicated CI gate (the validation slice is enforced through the existing lint + types + tests gates, plus the boundary-runtime guarantee from Fastify type provider). This matches RFC-0003 Decision F (no new workflow added to the matrix; reuse existing gates).

**Plugin-pack alignment today**:
- `.cursor/plugins/local/umbraculum-node-react-cursor-assistant/rules/22-typescript-contracts-runtime-validation.mdc` — **rewritten 2026-05-19** to Zod v4 standard.
- *Gap*: no Cursor skill yet that scaffolds the canonical Zod schema pattern (preprocess + transform + superRefine + Fastify-type-provider integration) — the pattern is exemplified in `meResponse.ts` and the spike, but a future plugin-pack PR will add a `zod-schema-scaffold.md` skill. Tracked in `plugin-pack-build` todo.
- *Gap*: no Cursor subagent yet that audits a `packages/*-contracts/` file against the lint guardrail + the rewritten rule. Tracked in `plugin-pack-build` todo.

**Cross-slice reinforcement**: the validation slice does not stand alone. The lint guardrail (no hand-rolled type-guards) is *only* possible because the lint slice already enforces type-aware rules at `error` severity. The Zod-inferred types are *only* maximally useful because the types slice's `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` are on. The `ZodError`-shape tests are *only* a maintenance improvement because the tests slice already runs vitest at the L1+L2 layers. The docs slice's README template (DOCS-README-STANDARDS.md) gets a new required cross-reference (the validation strategy doc + RFC-0003), tracked as a docs-slice follow-up. The five-slice framing is not five independent slices; it is five reinforcing layers, and the validation slice's late promotion (one day after the original four hit feature-complete) is the proof that the framing scales.

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

The `scripts/docs/check-readmes.py` structural checker previously enforced "no `@umbraculum/*` imports in code blocks" while sub-plan #9 was in flight — the prose brand had been adopted (Umbraculum) but the npm scope was still `@brewery/*`, so the gate caught premature adoption. Sub-plan #9 closed 2026-05-19 and the gate's `@umbraculum/*` exclusion check was retired in an earlier slot of that sub-plan; the structural checker no longer enforces this guard. The lesson generalizes: lint/docs guardrails tied to in-flight plans should carry an explicit time-bound caveat and be retired the moment the plan ships, otherwise they ossify into rules that are wrong but not visibly so. See §7.

### 5.6 The validation axis was orthogonal until it wasn't (v1.x → v2.0)

**Preserved as v1.x historical finding** — superseded by §4.5 and §6 on 2026-05-19.

Through 2026-05-18, lint + types + tests together were the *bug-prevention* foundation, and the validation axis (boundary-payload validation, [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md)) sat at the *runtime-data-boundary* tier, decided per-criterion not per-phase. The 2026-05-18 audit confirmed this: 0/6 trigger criteria met, hand-rolled re-confirmed (see §6.1). The types slice's Phase 6f + 6g enabled `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` on `packages/contracts`, which **strengthened** the hand-rolled position by adding compile-time guarantees on the 8 hand-rolled parsers — the "schema-correctness vs hand-rolled-correctness" aesthetic argument was partly retired by maximally-strict TypeScript.

**What changed in v2.0**: the 2026-05-19 audit added two new trigger criteria (canonical-automation-module AI-tool schemas + public SDK boundary) that the v1.x audits did not include because the underlying RFCs landed *after* the prior audits. Under the expanded criteria, the orthogonality argument no longer held — boundary surface area was about to grow non-trivially, and the cost asymmetry of late-retrofit vs early-adoption tilted decisively toward early adoption. The flip is documented in §6.2, and the validation slice is now §4.5 (a landed slice, not an orthogonal axis). This v1.x finding is preserved verbatim because the *reasoning chain* — "orthogonality holds when boundary surface is stable" — remains correct; it was the *premise* (stable boundary surface) that changed.

---

## 6. The validation question (historical: orthogonal axis → landed slice)

This section exists because plugin-pack authors will look at the bug-prevention foundation and reasonably ask "what about runtime validation? did we adopt Zod?" The honest answer as of **2026-05-19 is yes — Zod v4 was adopted via [RFC-0003](rfcs/0003-validation-library-adoption.md), and the validation work was promoted from an orthogonal axis to a landed slice**. The earlier v1.x narrative (hand-rolled re-confirmed 0/6 trigger criteria met) is preserved here as the audit trail that produced the eventual flip — future contributors should read this whole section, not just the v2.0 conclusion, because the flip would not have been possible without the rigor of the prior re-confirmations.

### 6.1 What was decided (v1.x — hand-rolled re-confirmed three times)

Through 2026-05-18 the project shipped 8 hand-rolled `parseX(unknown): X` parsers in `packages/contracts` with shared type-guard helpers, zero runtime dependencies, and a 6-criteria revisit trigger documented in `docs/CONTRACTS-VALIDATION-STRATEGY.md` v1.x. The decision was first recorded 2026-05-15 and re-confirmed at the 2026-05-16 + 2026-05-18 audits with **0/6 trigger criteria met** at each audit. The 2026-05-18 milestone-aligned re-confirmation (run at the close of lint + types + tests + docs) explicitly noted that hardening did *not* move any of the 6 criteria; the single notable finding (Phase 6f Side-finding 2 — cross-workspace data-leak in `routes/ingredients.ts`) was a Prisma-query-construction bug, not parser/interface drift, and Zod would not have caught it.

### 6.2 What changed on 2026-05-19 (v2.0 — Zod v4 adopted)

On 2026-05-19 the user raised the validation question explicitly, framed as "the toolset goal — pick the right tools before the project kicks, not after." The maintainer conducted a fourth audit ([`docs/design/validation-library-adoption-audit.md`](design/validation-library-adoption-audit.md)) that re-examined the 6 trigger criteria *and* added two new criteria reflecting state changes that landed between the 2026-05-18 re-confirmation and the 2026-05-19 question: (1) the canonical-automation-module RFC adding new "complex contracts" with AI-tool schemas (per [`docs/design/canonical-automation-module-surface.md`](design/canonical-automation-module-surface.md)), and (2) the public-facing module SDK boundary committed in [RFC-0002](rfcs/0002-canonical-module-physical-layout.md) Decision C. Under the new + old criteria together, criteria (1) (parser/interface drift cost) and (2) (boundary surface area growth — AI tools + module SDK) were **met** for the first time. Criterion (5) (cost asymmetry) was revised: an early migration before the canonical-automation-module Phase B-2 work is dramatically cheaper than a late retrofit; the cost-asymmetry threshold the prior audits implicitly assumed was wrong because they did not account for the H2 2026 AI-tool / canonical-module scope. RFC-0003 was drafted, the spike (Zod vs Valibot) was run, the spike findings + paper-design bundle analysis confirmed Zod v4 satisfied falsifiable tests F1–F6 (F7 deferred to a follow-up), and RFC-0003 was Accepted the same day.

### 6.3 What this means for the plugin pack

The plugin-pack rule [`.cursor/plugins/local/umbraculum-node-react-cursor-assistant/rules/22-typescript-contracts-runtime-validation.mdc`](../.cursor/plugins/local/umbraculum-node-react-cursor-assistant/rules/22-typescript-contracts-runtime-validation.mdc) was **rewritten 2026-05-19** to encode Zod v4 as the standard. The rewrite was a discrete deliverable inside PR 1 of the migration (per RFC-0003 Decision E — plugin pack must land with the migration so the AI assistant produces correctly-shaped code as the migration proceeds, not after). The lint guardrail (`no-restricted-syntax` in `eslint.config.mjs`, forbidding `function isX(v: unknown): v is X` helpers in `packages/*-contracts/src/**`) co-landed with the rewritten rule. See §8.6 for the v2.0 plugin-pack mapping (replacing the v1.x version that pointed to the 6-criteria audit cadence).

### 6.4 Lesson: orthogonal-axis tracking did its job

The v1.x "orthogonal axis" framing was not wrong — it was the correct framing through three audits when the answer was "no." It produced the rigor that made the eventual flip defensible: when the audit criteria changed (because two new architectural commitments landed), the structured re-evaluation surfaced the change cleanly rather than producing a vibes-driven "let's just add Zod." The lesson for future plugin-pack authors and future architectural decisions is: **orthogonal-axis tracking with explicit revisit criteria is a *feature*, not a delay tactic** — it lets a decision flip on evidence without re-litigating it on each individual code change, and it lets a flip happen *fast* (one-day audit + spike + RFC + migration kickoff) when the evidence arrives, because the prior audits already eliminated the easy wrong answers.

---

## 7. Pending items + handoffs

What remains open after the foundation-hardening pass closes. Each item is tracked in a more specific doc; this section is the index, not the source of truth.

| Item | State | Tracked in | Notes |
|---|---|---|---|
| Tests Phase 4d — role-based ACL coverage | Deferred | [`docs/TESTING.md`](TESTING.md) (audit + non-goals) | Gated on the architectural decision to wire `AclService.requireRole` into routes (currently exists but is unwired). The audit explicitly documented the unwired state as known v0. |
| Types Phase 6e remediation in non-gated workspaces | n/a — already landed | [`docs/TYPING.md`](TYPING.md) | Phase 6e fixed all 2566 TS4111 errors across 8 workspaces in one bulk-mechanical pass on 2026-05-18; no remediation is pending. (A historic todo in earlier planning had this as pending — the todo is stale and should be resolved as completed.) |
| `apps/native` test runner | Deferred | [`docs/TESTING.md`](TESTING.md) non-goals | The L5 web-side regression pin for the Phase 5g render-prop bug shipped; the native-side equivalent is deferred until `apps/native` gets a test runner. |
| `@brewery/*` → `@umbraculum/*` package-scope rename | ✅ Done (sub-plan #9, closed 2026-05-19) | [`docs/design/brewery-scope-migration-plan.md`](design/brewery-scope-migration-plan.md) | Sub-plan #9 closed across 14 slots. Horizontal packages now live under `@umbraculum/*`; brewery-vertical packages re-scoped under `@umbraculum/brewery-*` per the §1.3 TRAP-avoidance discipline. Application workspaces (slot 14) flipped on closure. The docs CI gate's former `@umbraculum/*` exclusion check (described in §5.5) was retired at the corresponding slot. |
| `docs/ROADMAP.md` mark docs slice feature-complete | Optional follow-up | [`docs/ROADMAP.md`](ROADMAP.md) | Mirror the types-slice pattern from commit `ed3bb84`. Defer-OK. The H1 2027 paragraph already references the docs slice via "remaining foundation workstream"; updating it to "feature-complete" is housekeeping. |
| Validation slice — PR 1 mechanical migration (7 remaining parsers) | Staged with handoff doc | [`docs/design/pr1-contracts-migration-handoff.md`](design/pr1-contracts-migration-handoff.md) | `waterProfile.ts`, `parseGravityAnalysis.ts`, `parseComputeAndSave.ts`, `parseHubSummary.ts`, plus 3 smaller siblings. Worked example (`meResponse.ts`) and migration patterns documented; remaining work is mechanical schema-by-schema rewrites with `expectFirstIssuePathStartsWith` test helper. |
| Validation slice — PR 3 Fastify route migration (28 routes) | Staged with handoff doc | [`docs/design/pr3-routes-migration-handoff.md`](design/pr3-routes-migration-handoff.md) | Prep steps (Fastify type provider wiring, `errorHandlerPlugin` `ZodError` handling), per-route migration pattern (`/auth/signup` as canonical example), `apps/web` + `apps/native` client coordination, integration-test rewrite with `expectStructuralError`, latent-bug audit per route. Container-side verification required; partition into sub-PRs by route family suggested. |
| Validation slice — F1–F9 follow-up trackers | Scheduled | [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) §Follow-ups (v2.0) | **F1 partial (alpha) 2026-05-28** — OpenAPI artifact + CI; full closure with PR3. Also: next audit cadence, Zod v5 tracker, DOCS-README-STANDARDS Zod-aware section, module-SDK sub-plan #9 alignment, plugin-pack publication, native-bundle measurement (RFC-0003 F7), RFC-0002 §13 cross-ref refresh, shared test helpers extraction. |
| Validation slice — plugin-pack build (proposed skill + subagent + cross-slice anchor) | Scheduled | This doc §8.1 + §8.6 + plugin-pack work | The rewritten `22-typescript-contracts-runtime-validation.mdc` is the floor; the proposed `zod-schema-scaffold` skill + `contracts-zod-auditor` subagent (§8.6) are the discoverability layer. Tracked alongside the rest of the §8 proposed plugin-pack changes (e.g., `02-foundation-hardening.mdc`, `26-typescript-strict-flags.mdc`, `45-tsjs-module-readme-standard.mdc`) under a single plugin-pack-build effort. |

There is no slice-level work pending in lint, types, tests, or docs. The four original slices are feature-complete by their own status banners, the CI gates are wired, and the plugin-pack alignment is the explicit next step (this doc § 8). The validation slice (added v2.0) has the RFC and worked-example tier complete; the remaining migration mechanics + plugin-pack scaffolding are staged via the handoff documents above and the `plugin-pack-build` + `migration-pr-1` + `migration-pr-3` todos.

---

## 8. Plugin-pack manifest (the actionable section)

This section maps each slice's discipline to specific plugin-pack artifacts under `rules/`, `skills/`, and `agents/`, distinguishing what already exists from what's a gap. Each gap is sketched as a concrete proposal (artifact name + type + delegation trigger + body summary), in a form ready to drop into the plugin-pack refinement.

The proposals follow the plugin-pack meta-framework:
- Rule = guardrail + pointer (no procedure).
- Skill = runnable runbook (input-driven, output-constrained, ≤5 commands).
- Subagent = specialized AI assistant with delegation trigger, ≤30-line body, references a canonical skill.

When this doc and the plugin-pack files disagree about a rule's scope or content, the plugin-pack file wins (it's the live artifact); update §8 to match.

### 8.1 Cross-slice anchor (proposed new rule)

| Field | Value |
|---|---|
| **Type** | Rule |
| **File** | `rules/02-foundation-hardening.mdc` (proposed) |
| **alwaysApply** | `true` |
| **Purpose** | Single pointer to this doc as the entry point to the foundation-hardening narrative. Any AI-assisted contributor opening the repo gets routed to the four slice docs (and this synthesis layer) before broad work. |
| **Body sketch** | Two-section: (a) "Read first" — pointer to `docs/FOUNDATION-HARDENING.md` and the four slice docs; (b) "Why this exists" — one-sentence framing of the four slices + validation axis. ≤30 lines. |

The existing plugin rule `44-tsjs-project-docs-first.mdc` is similar but framed around per-doc reading rather than the synthesis-layer entry point. The new rule complements it; it does not replace it.

### 8.2 Lint slice mapping

**Existing alignment** (no gap):
- `rules/23-eslint-flat-config-hygiene.mdc` (production-config hygiene; `globs: eslint.config.*` etc.).
- `rules/23a-eslint-fixall-discipline.mdc` (editor-config split; `globs: .vscode/settings.json*` + `eslint.config.editor.*`).

These two rules together cover the lint slice's authoring-time discipline. The CI gate (`web-lint.yml`) covers the post-violation case. The cross-platform UI primitive guardrail (the canonical bug class — `packages/ui/src/{ai,charts}/**` cannot import raw `tamagui` Button/Input/BrewCheckbox) is enforced by the lint rule alone; an AI-authoring-time rule could pre-warn but the lint rule is sufficient.

**Proposed minor refinement**: extend plugin rule `44-tsjs-project-docs-first.mdc` to explicitly list `docs/FOUNDATION-HARDENING.md` (this doc) alongside `docs/LINTING.md` so that a contributor reading the lint discipline gets the cross-slice context for free. ≤5-line edit.

### 8.3 Types slice mapping

**Existing alignment** (partial):
- `rules/22-typescript-contracts-runtime-validation.mdc` (boundary payload discipline — adjacent to the types slice but anchored on validation; covers `interface` vs `type`, `null`/`undefined` modeling discipline, and the no-`as SomeDto` rule).
- `rules/20-node-esm-imports-api.mdc` (Node ESM import discipline — adjacent, related to `verbatimModuleSyntax` rollout).

**Gap**: no rule encoding the 6 strict flags. A new TS workspace added to the repo today, or new TS code added to a non-gated workspace (`apps/web`, `packages/ui`), can quietly drop a strict flag and the typecheck CI gate (which runs only on the 13-workspace gated set) won't catch it. The types slice's `tsc --noEmit` discipline is enforced for the gated 13 but not authoring-time-encoded.

**Proposed new rule**:

| Field | Value |
|---|---|
| **Type** | Rule |
| **File** | `rules/26-typescript-strict-flags.mdc` (proposed) |
| **globs** | `**/tsconfig*.json`, `apps/**/*.{ts,tsx}`, `services/**/*.{ts,tsx}`, `packages/**/*.{ts,tsx}` |
| **Purpose** | Encode the 6 strict flags (`strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `isolatedModules`) as the floor for any new TS workspace. New tsconfig must inherit / set them; new TS code must compile under them. |
| **Body sketch** | (a) "When creating a new tsconfig, all 6 flags must be on or inherited"; (b) "When fixing TS errors, the 4 fix patterns documented in `docs/TYPING.md` (type-widening, conditional spread, non-null assertion, `?.foo ?? null`) cover ~95% of cases — no `as any`, no `// @ts-expect-error` without a reason"; (c) pointer to `docs/TYPING.md` for the canonical baseline + methodology. ≤25 lines. |

**Proposed new subagent**:

| Field | Value |
|---|---|
| **Type** | Subagent |
| **File** | `agents/types-baseline-verifier.md` (proposed) |
| **readonly** | `true` |
| **Description** | "Verifier for the TypeScript types slice. Use proactively after editing tsconfig.json, after adding a new TS file in a non-gated workspace, or after a strict-flag-related refactor. Confirms `tsc --noEmit` is green for the affected workspace and that the 6 strict flags are set." |
| **Body** | ≤30 lines; references a canonical skill (proposed `skills/typescript-strict-flag-verification/SKILL.md`) that walks: (1) detect affected workspace from edited file path, (2) run the canonical one-off-container `tsc --noEmit` per `docs/TYPING.md` §Methodology, (3) grep the workspace's tsconfig for the 6 flags, (4) report OK / FAIL summary, ≤1 line per failure. |

The skill must follow the Skill Contract (≤5 commands, no loops, output-constrained).

### 8.4 Tests slice mapping

**Existing alignment** (mostly):
- `rules/20-tests-must-follow-changes.mdc` — cross-stack; encodes the layered test-mapping discipline; refers to project-local `docs/TESTING.md`.
- `rules/92-ci-safe-unit-tests.mdc` — CI-safe unit-test discipline.

**Gap**: no skill encoding the L2 cross-workspace isolation pattern. The pattern is now well-established in 40 test files, but a new contributor (or AI) adding a new workspace-scoped route has to reverse-engineer the pattern from existing tests.

**Proposed new skill**:

| Field | Value |
|---|---|
| **Type** | Skill |
| **File** | `skills/l2-cross-workspace-isolation-test/SKILL.md` (proposed) |
| **Inputs required** | `<ROUTE_PATH>` (the route under test), `<METHOD>` (GET/POST/PATCH/DELETE), `<SECOND_PERSONA_ID>` (the cross-workspace persona — typically `e2e-multi-admin`), `<TEST_FILE_PATH>` (where the test should land) |
| **Output format** | Returns a single `describe` block with the 6 tests for the canonical 6-axis pattern (happy / cross-workspace 404 / unauthorized / validation 400 × 2 / shape pin). |
| **Bounds** | ≤5 commands. Stops at: route not workspace-scoped (different test pattern needed), missing persona, test file would conflict with existing block. |

**Optional refinement**: deprecate plugin rule `90-testing.mdc` for TS/JS work (it's Magento/PHPUnit-scoped only) by tightening its `globs:` to PHPUnit paths only, so AI-authored TS/JS work does not see it. The rule itself stays valid for Magento heritage projects in the same plugin pack.

### 8.5 Docs slice mapping

**Existing alignment** (partial):
- `rules/44-tsjs-project-docs-first.mdc` (read project-local docs before broad TS/JS work — including `docs/TESTING.md`, `docs/LINTING.md`, etc.).
- `rules/11-cursor-package-files-edit-in-source-repo.mdc` (Cursor package files edited in source repo).

**Gap**: no rule encoding `docs/DOCS-README-STANDARDS.md` directly. A new module added to `packages/*` today does not get a Cursor rule prompting the AI to scaffold the README from the canonical template; the contributor learns the convention only by reading existing READMEs or by failing the CI gate.

**Proposed new rule**:

| Field | Value |
|---|---|
| **Type** | Rule |
| **File** | `rules/45-tsjs-module-readme-standard.mdc` (proposed) |
| **globs** | `apps/*/README.md`, `services/*/README.md`, `packages/*/README.md` |
| **Purpose** | When creating or editing a module README, follow the canonical template + audit checklist in `docs/DOCS-README-STANDARDS.md`. Brand callout, required `##` headings, cross-reference count, link resolution. |
| **Body sketch** | (a) "When creating a new module README, scaffold from the template in `docs/DOCS-README-STANDARDS.md` §Template"; (b) "When editing an existing module README, run the audit checklist mentally (or via the proposed module-readme-checker subagent below)"; (c) pointer to `scripts/docs/check-readmes.py` as the structural floor. ≤20 lines. |

**Proposed new subagent**:

| Field | Value |
|---|---|
| **Type** | Subagent |
| **File** | `agents/module-readme-checker.md` (proposed) |
| **readonly** | `true` |
| **Description** | "README structural validator. Use proactively after editing any module README under `apps/*/README.md`, `services/*/README.md`, or `packages/*/README.md`. Wraps `scripts/docs/check-readmes.py` and reports OK / FAIL on the structural + link checks, ≤1 line per failure." |
| **Body** | ≤30 lines; references `skills/module-readme-verification/SKILL.md` (proposed) which executes the script with the affected README path and post-processes output to the bounded format. |

### 8.6 Validation slice mapping (v2.0 — Zod v4)

**Existing alignment** (rewritten 2026-05-19 as part of PR 1):
- Plugin rule `22-typescript-contracts-runtime-validation.mdc` (shipped by `umbraculum-node-react-cursor-assistant`) encodes Zod v4 as the standard. Schema-first declaration (`z.object/...`); type inference (`z.infer<typeof Schema>`); backward-compat (`z.preprocess`); soft-tolerance fallbacks (`z.transform`); structured errors (`ZodError.issues[]`); library-agnostic SDK boundary (`ValidatedSchema<T>` from `@umbraculum/module-sdk`); explicit anti-patterns (hand-rolled type-guards forbidden, dual-library mixing rejected per RFC-0003 Decision A).
- `eslint.config.mjs` carries the `no-restricted-syntax` rule that forbids hand-rolled type-guards in `packages/*-contracts/src/**`. The rule co-landed with the rewritten plugin-pack rule in PR 1.

**Proposed new skill** (tracked under `plugin-pack-build` todo):

| Field | Value |
|---|---|
| **Type** | Skill |
| **File** | `.cursor/plugins/local/umbraculum-node-react-cursor-assistant/skills/zod-schema-scaffold/SKILL.md` (proposed) |
| **Inputs required** | `<SCHEMA_NAME>` (the schema being introduced), `<TARGET_FILE>` (where it should land), `<BACK_COMPAT_PAYLOAD_KEYS>` (optional list of legacy field names to preprocess), `<SOFT_TOLERANCE_FIELDS>` (optional list of fields that should fall back to `null` / a default when input is malformed) |
| **Output format** | Returns the canonical Zod schema template (preprocess → object → transform; `z.superRefine` example for cross-entry constraints if needed; `z.infer<typeof Schema>` type alias; thin wrapper function for legacy API compatibility), plus a paired `*.test.ts` template using `expectFirstIssuePathStartsWith` per PR 1's pattern. |
| **Bounds** | ≤5 commands. Stops at: schema name conflicts with existing exports; target file is outside `packages/*-contracts/src/`; back-compat keys requested but the destination has no upstream rename history. |

**Proposed new subagent** (tracked under `plugin-pack-build` todo):

| Field | Value |
|---|---|
| **Type** | Subagent |
| **File** | `.cursor/plugins/local/umbraculum-node-react-cursor-assistant/agents/contracts-zod-auditor.md` (proposed) |
| **readonly** | `true` |
| **Description** | "Auditor for the validation slice. Use proactively after editing any file under `packages/*-contracts/src/**` or after adding a new schema-bound route under `services/api/src/routes/**`. Confirms: (1) no hand-rolled type-guard helpers (lint rule satisfied); (2) every exported schema has `z.infer` type aliases; (3) route schemas register via the Fastify type provider (`fastify-type-provider-zod` + `setValidatorCompiler` + `setSerializerCompiler`); (4) tests assert on `ZodError.issues[]` paths, not error message regexes." |
| **Body** | ≤30 lines; references the proposed `zod-schema-scaffold` skill + the rewritten 22-* rule; reports OK / FAIL ≤1 line per check. |

The validation slice does *not* get its own dedicated CI workflow (per RFC-0003 Decision F — reuse existing lint + types + tests gates plus the Fastify type provider runtime guarantee). The plugin-pack mapping is therefore lighter than the other slices: the rule rewrite + lint guardrail are the floor; the proposed skill + subagent are the discoverability layer; no separate workflow is needed.

**Retired v1.x proposal**: the prior v1.x §8.6 proposed adding a cross-reference from the 22-* rule to the 6-criteria audit cadence in `CONTRACTS-VALIDATION-STRATEGY.md`. That proposal is now obsolete — the 6-criteria audit cadence is itself superseded by RFC-0003. The v2.0 strategy doc carries a forward-only audit cadence (next audit fires at the next major architectural milestone, scoped to "should we reconsider the library choice?" not "should we adopt one?").

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
| v2.0 | 2026-05-19 | Validation slice promoted from orthogonal axis to landed slice per [RFC-0003](rfcs/0003-validation-library-adoption.md) (Accepted). §2 table extended to five slices; §4.5 deep-dive added; §5.6 (orthogonal-axis framing) preserved as historical context with the v2.0 flip explained; §6 rewritten as a historical narrative ("orthogonal axis → landed slice") with the four-audit trail preserved; §8.6 rewritten for the v2.0 plugin-pack mapping (Zod-aware skill + subagent proposals, retired v1.x audit-cadence cross-reference). Status banner updated. Previous lint/types/tests/docs slices unchanged. Concurrent updates: [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) v2.0; `packages/contracts/src/auth/meResponse.ts` (worked example); `packages/automation-contracts/src/mailbox-data.ts` (full migration); `packages/module-sdk/src/validatedSchema.ts` (`ValidatedSchema<T>` + `fromParser`); `eslint.config.mjs` (`no-restricted-syntax` guardrail); rewritten `22-typescript-contracts-runtime-validation.mdc` plugin-pack rule. |

Sign-off: maintainers. Next milestone: plugin-pack refinement per §8.

