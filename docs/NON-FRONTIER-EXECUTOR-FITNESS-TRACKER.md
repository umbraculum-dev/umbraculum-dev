# Non-frontier executor fitness tracker

> [!NOTE]
> This is a **living document**. It exists to track the observed
> fitness of *non-frontier* AI executors (e.g. `composer-2.5-fast`,
> future Cursor-fast variants, future local models) when they are
> handed a *frontier-authored* execution plan to drive end-to-end.
> Append a new run section every time a non-frontier executor ships
> a plan that's worth assessing; do not edit prior run sections
> after they're recorded (they're the per-run snapshot).

## §1 What this is

A per-run record of how well a non-frontier executor adhered to its
plan, to the project's conventions, and to its rule/skill toolset —
plus an evolving compliance matrix and verdict snapshot that let us
compare runs over time.

This document is the answer to the question *"can I trust executor X
to drive this kind of plan, or do I need to scope down / pair it with
a verifier / hand it to a frontier model instead?"*

## §2 Why this exists

[`MANIFESTO.md`](../MANIFESTO.md) §1.2 frames Umbraculum as an
**AI-orchestrated-code project by design** — frontier models do the
planning and the judgment-dense work, and faster/cheaper executors
should be able to mechanically apply the resulting plans. That's the
target operating mode. The empirical question is: *how close to
that target are today's non-frontier executors?*

This tracker answers that question with data. Each row tells a future
plan author one of:

- "On this kind of plan, executor X is trustable end-to-end" → write
  plans at the usual specificity, hand them to X, expect a single
  verifier loop at most.
- "On this kind of plan, executor X is trustable for slices A/B/C
  but not D" → split the plan; hand A/B/C to X, hand D to a frontier
  model.
- "On this kind of plan, executor X needs extra-specific scaffolding
  on convention Y" → next plan should pre-name the rule, the skill,
  the file paths, and the gate command rather than expecting X to
  discover them.

## §3 Scope

**In scope:**

- Non-frontier executors when given a frontier-authored, detailed
  execution plan (e.g. Cursor plan files like
  `pim-canonical-module-build_2984894e`).
- Convention adherence (Zod schemas, workspace-scoping, L2 isolation
  tests, container-only npm, module-SDK registration, etc.).
- Rule/skill self-invocation (does the executor run the documented
  gate skill without being explicitly told to?).
- Cross-agent commit hygiene.
- Build-log + per-phase verification discipline.

**Out of scope:**

- Frontier executors (e.g. `claude-opus-4-7-thinking-xhigh`,
  `gpt-5.3-codex`). Their fitness is taken as the baseline; the bar
  the rest of the toolchain is calibrated to.
- Freeform asks (no plan). This tracker only assesses *plan-driven*
  runs, because that's the operating mode we're calibrating for.
- Per-run *speed* / *cost*. Those go in the per-build artifacts
  (e.g. `docs/design/canonical-pim-build-log.md`) — this tracker is
  about *correctness* and *trustability*.

## §4 How to use this document

**When a non-frontier executor finishes a plan-driven run worth
assessing:**

1. Add a row to [§5 Run index](#5-run-index).
2. Add a per-run section under [§6 Per-run assessments](#6-per-run-assessments)
   with the four sub-sections: plan + context, RIGHT, WRONG,
   conventions narrative, verdict.
3. Add a column to [§7 Conventions compliance matrix](#7-conventions-compliance-matrix)
   and fill the cell for each convention (✅ PASS / 🟡 PARTIAL /
   ❌ FAIL / — N/A).
4. Add a column to [§8 Verdict snapshot](#8-verdict-snapshot) and
   fill each checkpoint (✅ YES / ❌ NO / 🟡 with-caveats).
5. If you see a new pattern that wasn't visible before, append a
   bullet under [§9 Trend notes](#9-trend-notes).
6. If the run surfaces a new "be extra-specific about X" lesson for
   future plan authors, append it under [§10 What this means for
   plan authors](#10-what-this-means-for-plan-authors).

**Do NOT edit prior run sections after they're recorded.** Each
per-run snapshot is the as-of-that-date record; it stands. If a
later run contradicts it, that contradiction goes in §9 Trend notes,
not retconned into the earlier snapshot.

## §5 Run index

| # | Date | Executor model | Plan source | Task family | Verifier | Summary verdict | Per-run section |
|---|---|---|---|---|---|---|---|
| 1 | 2026-05-19 → 2026-05-20 | `composer-2.5-fast` | `pim-canonical-module-build_2984894e` (Cursor plan file) | Canonical-tier module build (RFC-0004) — `API + WEB` slices, moderate data model | `claude-opus-4-7-thinking-xhigh` | 🟡 **GREEN-WITH-CAVEATS** — landed Phases 0/A/B/C materially correct; needed verifier loop for L2 coverage, README structural compliance, TS4111 fix-up, and Phase D escalation | [§6.1](#61-run-1--2026-05-1920--composer-25-fast--canonical-pim-build-rfc-0004) |

## §6 Per-run assessments

### §6.1 Run 1 — 2026-05-19/20 — `composer-2.5-fast` — canonical-PIM build (RFC-0004)

#### Plan + context

- **Plan source:** `pim-canonical-module-build_2984894e` (Cursor
  plan file; not in repo).
- **Sanctioning RFC:** [`RFC-0004 — Canonical PIM module
  allocation`](rfcs/0004-canonical-pim.md), supported by
  [`RFC-0001`](rfcs/0001-modules-tiers-governance-and-automation-placement.md).
- **Task family:** Canonical-tier module build (tier 1), `API + WEB`
  slices, moderate data model (six entities: product, variant,
  attribute, attributeSet, category, mediaAssetRef).
- **Executor:** `composer-2.5-fast` for Phases 0, A, B, C, and the
  B′ L2 clean-up pass.
- **Verifier (post-Composer):** `claude-opus-4-7-thinking-xhigh` —
  closed two structural gate FAILs and authored Phase D end-to-end
  per plan §8 fit-assessment "handoff to opus" recommendation.
- **Build artifact (full record):**
  [`docs/design/canonical-pim-build-log.md`](design/canonical-pim-build-log.md).

#### What got RIGHT (load-bearing positives)

| # | Area | Behavior | Why it matters |
|---|---|---|---|
| 1 | **Zod schemas (Phase A)** | Applied the canonical Zod v4 pattern from `22-typescript-contracts-runtime-validation.mdc` — preprocess + transform + superRefine where appropriate; tests assert on `ZodError.issues[0].path[0]` via the `expectFirstIssuePathStartsWith` helper. All 7 contract tests green first try. | This is the highest-volume convention in TS work in this repo; getting it right out-of-box means the contracts slice is review-ready without a frontier rewrite. |
| 2 | **Workspace-scoping on every route** | Every read and every write on the four PIM route files (`products`, `variants`, `attributeSets`, `categories`) filters by `workspaceId` and gates behind `requireUser`. No accidental cross-tenant read paths. | Workspace-scoping is a security-critical default; a single missed filter would have been an L2 isolation failure waiting to ship. |
| 3 | **Module SDK registration** | Used `@umbraculum/module-sdk`'s `registerModule()` correctly, with `code`, `tier`, `routes`, `tools` all wired in, and `app.ts` calls `registerPimModule()` + `registerPimTools()` cleanly. | This is the project's only sanctioned way to add a tier-1 surface; getting it wrong would have meant a code-shape divergence from the existing `automation` canonical module. |
| 4 | **Prisma multi-schema (Phase B)** | Extended `datasource db.schemas` to `["public", "automation", "pim"]`, added six models with `@@schema("pim")` directives, generated a clean migration (`20260519224732_pim_phase_b_tables`) without enabling extra preview flags. Relations between Pim* models scoped correctly. | Per-module schema isolation is the unit of physical separation between canonical modules; getting it wrong would have leaked PIM tables into the public/automation schemas and undone the architectural separation. |
| 5 | **Container-only npm execution** | Every `npm test`, `npm run typecheck`, `npx prisma migrate dev` invoked inside the `api` container (or workspace-equivalent for `web`). No host-side npm pollution. | Enforces `00-shared-node-npm-container-only.mdc` — the rule that keeps the host node_modules tree from drifting from the container tree. |
| 6 | **Plan-slice adherence (no scope creep)** | Phases 0/A/B/C executed exactly the prescribed slices. No bonus features, no opportunistic refactors of unrelated code, no premature optimization. | Plan adherence is the load-bearing assumption of the "plan-driven" operating mode. If the executor adds out-of-scope work, the verifier loop blows up. |
| 7 | **Per-phase verification execution** | Ran the documented verification step at the end of each phase (typecheck, `npm test`, migration dry-run, route smoke-curl). Recorded the results in the build-log. | This is the minimum executor-side hygiene that lets the verifier loop converge in one pass instead of N. |
| 8 | **Package-scope correctness** | Used `@umbraculum/pim-contracts` as the new package name (matching the post-rename convention from sub-plan #9), not `@brewery/pim-contracts`. | Sub-plan #9 was just-landed; getting this right meant Composer correctly picked up the new convention from the existing `@umbraculum/automation-contracts` reference, not the stale `@brewery/` artifacts. |

#### What got WRONG or scoped down (load-bearing negatives)

| # | Area | Behavior | Impact | Recovery |
|---|---|---|---|---|
| 1 | **L2 cross-workspace isolation tests** | First-pass delivery included `pimProducts.test.ts` only (1 of 4 route files). The `variants`, `attributeSets`, `categories` route files had no L2 tests despite being on the same plan line. | Would have shipped 3-of-4 PIM routes without isolation evidence — a real L2 gap. | User explicitly re-tasked Composer to add the missing 3 files; second pass (B′) added them cleanly. Plan §6 was technically clear ("L2 tests per route file"); Composer interpreted "per route file" as "one representative test" rather than "one per file." |
| 2 | **Module-README structural compliance** | `packages/pim-contracts/README.md` shipped without the canonical `> [!NOTE]` brand callout and with the wrong build heading (`## Build / test / typecheck` instead of `## Build / test / lint (local)`). `services/api/src/modules/pim/README.md` shipped without a `## What this is` / `## Why this exists` heading. | Both READMEs failed the `module-readme-verification` gate. The brand callout is mandated by the `DOCS-README-STANDARDS.md` + the `scripts/docs/check-readmes.py` checker. | Frontier verifier (opus) added the brand callouts + renamed the heading + added the `## What this is` section. Both gates re-verified PASS. Root cause: Composer didn't consult `DOCS-README-STANDARDS.md` nor run the `module-readme-verification` skill against the new READMEs before declaring the phase done. |
| 3 | **TS strict — TS4111** | `packages/pim-contracts/src/variant.test.ts:19` used `parsed.attributeValues.color?.value` against an index-signature type — illegal under `noPropertyAccessFromIndexSignature` (one of the 6 strict flags). | Failed the `typescript-strict-flag-verification` gate (1 error, flags all 6/6 set). | Frontier verifier (opus) changed `.color` → `["color"]`. One-character fix. Root cause: Composer's test scaffold didn't run `tsc --noEmit` against the new test file before declaring Phase A done — the contracts package's `npm test` (vitest) ran fine because vitest doesn't enforce the same strict flags as `tsc --noEmit`. |
| 4 | **Gate-skill self-invocation** | Composer ran `npm test` and `npm run typecheck` at phase boundaries but did *not* invoke the documented gate skills (`module-readme-verification`, `typescript-strict-flag-verification`, `public-endpoint-verification`) on the new files. Those skills were only invoked after the user explicitly tasked the verifier to run them. | The two FAILs in rows 2 + 3 would have been caught by Composer itself if it had self-invoked the gate skills; instead they were caught one verifier-pass later. | None — this is a behavioral pattern, not a fixable code defect. Mitigation: plans for non-frontier executors must explicitly enumerate every gate skill that should be run, by name, at each phase boundary (see [§10 lesson 1](#10-what-this-means-for-plan-authors)). |
| 5 | **Cross-agent commit hygiene** | When Composer ran `git add -A && git commit` during one of its phases, the sweep included this verifier-agent's in-progress edits on adjacent files (RFC drafts + plan flagging). The Composer commit therefore contained "mine + the other agent's" mixed content. | Polluted the git history attribution: a commit ostensibly authored by Composer for "Phase A" included work-in-progress by the verifier on unrelated files. | User decided not to rewrite history (the contamination wasn't load-bearing); verifier committed the remainder under its own attribution and documented the contamination in the build-log. Root cause: no formal cross-agent staging boundary — the two agents share a working tree. |
| 6 | **Build-log reasoning depth** | Build-log recorded *what happened* per phase (start/end times, exit codes, file lists) but did not record *why* certain choices were made (e.g. why `pim/` instead of `(pim)/`, why which Zod helper, why the migration was structured a certain way). | The verifier (and the user) had to reconstruct judgment context from the diffs rather than from the log, which slowed the verifier loop. | Verifier (opus) added "Lessons learned" + per-decision rationale to the build-log during Phase D. Future executors should be asked to record the *why*, not just the *what*, at phase boundaries. |
| 7 | **Choice-point escalation** | Composer silently chose `apps/web/app/[locale]/pim/` (no route group) over the plan's specified `(pim)/` group. The choice turned out to be empirically correct (the `(automation)/` reference was itself routing-broken), but Composer didn't surface it as a judgment call. | The deviation worked out, but it was decision-by-default rather than decision-by-escalation. A different silent choice could have been load-bearing wrong. | Verifier surfaced the deviation, audited the `(automation)/` reference, confirmed it was broken, kept Composer's choice, and queued a separate architectural audit. Future executors should be asked to surface any deviation from explicit plan paths via an AskQuestion rather than silently choosing. |
| 8 | **Build-log per-phase commit discipline** | Plan §6.5 called for per-phase commits with SHAs recorded in the build-log timing table. Composer left the entire tranche uncommitted (per user direction mid-stream) — but the build-log timing table still has "(intentionally uncommitted per user)" in the SHA column for every phase, meaning we can't bisect the build by phase if we ever need to. | Reduces the build-log's debugging value; not load-bearing for THIS build but would have been if a regression had appeared mid-build and needed bisection. | User-policy override; not a Composer failure per se. Pattern: when plan says "commit per phase" *and* user later says "leave uncommitted for review," document the policy override in the build-log explicitly so future readers know the SHA column was intentionally suppressed. |

#### Conventions assessment

Each convention below is one row in [§7 the compliance matrix](#7-conventions-compliance-matrix);
this subsection captures the **per-convention narrative** for this
run, which is what the matrix cell summarizes.

1. **Zod schemas (preprocess + transform + superRefine where appropriate)** —
   ✅ PASS. Used the `zod-schema-scaffold` skill's pattern correctly
   on all six contract files; tests assert on `ZodError.issues[0].path[0]`
   as required by `22-typescript-contracts-runtime-validation.mdc`.
2. **Workspace-scoping on every route** — ✅ PASS. Every PIM route
   filters by `workspaceId`; no cross-tenant read path possible.
3. **L2 cross-workspace isolation tests per route file** — 🟡 PARTIAL
   on first pass (1 of 4 files), then ✅ PASS after explicit re-task.
   Composer is capable of producing the correct pattern (it did so
   on the first file); the gap was scope interpretation, not pattern
   ignorance.
4. **Container-only npm** — ✅ PASS. No host-side npm invocations
   observed.
5. **Module SDK registration** — ✅ PASS. Used `registerModule()`
   correctly with all required fields.
6. **Prisma multiSchema per-module schema** — ✅ PASS. `pim` schema
   added cleanly; relations scoped to PIM models only.
7. **Module-README structural compliance** — ❌ FAIL on first delivery
   (missing brand callout, wrong build heading, missing `## What this is`),
   then ✅ PASS after frontier fix-up.
8. **TS strict (6 flags + `tsc --noEmit` clean)** — 🟡 6/6 flags set
   correctly but introduced a TS4111 error in the test file, then
   ✅ PASS after frontier fix-up.
9. **Gate-skill self-invocation** — ❌ FAIL. Did not invoke
   `module-readme-verification`, `typescript-strict-flag-verification`,
   nor `public-endpoint-verification` until explicitly told. This
   is the load-bearing weakness for "trustable unsupervised."
10. **Build-log discipline (per-phase commits, timing, model attribution,
    decision rationale)** — 🟡 PARTIAL. Timing + model attribution
    recorded; per-phase commits suppressed (user policy); decision
    rationale (`why X, not Y`) only added by verifier.
11. **Plan-slice adherence (no scope creep)** — ✅ PASS. Executed
    the prescribed slices, no out-of-scope work.
12. **Cross-agent commit hygiene** — ❌ FAIL. `git add -A` swept the
    other agent's in-progress edits.
13. **Brand callout in module READMEs** — ❌ FAIL on first delivery,
    then ✅ PASS after frontier fix-up.
14. **Choice-point escalation (asks before silent judgment)** — 🟡
    PARTIAL. Silent `pim/` choice happened to be correct but should
    have been an AskQuestion.

#### Bottom-line verdict

| # | Verdict checkpoint | Run 1 (`composer-2.5-fast`) |
|---|---|---|
| 1 | Can be trusted to execute a frontier-authored, *detailed* plan? | ✅ **YES** — Phases 0+A+B+C all landed materially correct on the first pass. |
| 2 | Can be trusted *unsupervised* (no verifier loop)? | ❌ **NO** — three independent failure modes (gate-skill skipping, partial L2 coverage, README structural FAILs) would each have shipped without a verifier. |
| 3 | Self-runs gate skills without being explicitly told? | ❌ **NO** — runs `npm test` + `npm run typecheck` but not the documented skills. |
| 4 | Self-discovers conventions from rules/skills it's not pointed at? | ❌ **NO** — needs the rule/skill named in the plan. Did not consult `DOCS-README-STANDARDS.md` for the README work. |
| 5 | Self-corrects on second-pass after a FAIL re-task? | ✅ **YES** — B′ pass closed the L2 gap cleanly. |
| 6 | Suitable as bulk-implementor for *template-fill* phases? | ✅ **YES** — Phase A (contracts) + Phase B services + Phase C pages all clean. |
| 7 | Suitable as judgment-finalist for *judgment-dense* phases? | ❌ **NO** — Phase D was correctly escalated to the verifier per plan §8 fit-assessment; silent choice-points (web route group) are a worked example of why. |
| 8 | Cross-agent commit hygiene? | ❌ **NO** — sweeps other agents' WIP into its commits. |

**Bottom line (Run 1):** Composer 2.5 fast is a **trustable
bulk-implementor on detailed, frontier-authored plans** — provided
the plan (i) explicitly enumerates every gate skill to run, (ii)
explicitly enumerates every per-file artifact to produce (not "per
route file" but "one per file: products + variants + attributeSets +
categories"), (iii) explicitly flags every choice-point as
"AskQuestion before deciding," and (iv) is paired with a verifier
loop. **Not** trustable unsupervised on canonical-tier work, and
**not** trustable on judgment-dense phases (escalate those to a
frontier model up front).

## §7 Conventions compliance matrix

Rows are conventions tracked across runs. Columns are individual
runs (per the §5 Run index numbering). Cells: ✅ PASS / 🟡 PARTIAL /
❌ FAIL / — N/A. Add a column when a new run is recorded; do not
edit prior columns.

| # | Convention | Source-of-truth rule / skill | Run 1 (2026-05-19/20 `composer-2.5-fast`) | Run 2 (TBD) | Run 3 (TBD) |
|---|---|---|---|---|---|
| 1 | Zod schemas (preprocess + transform + superRefine + `ZodError.issues[0].path[0]` assertions) | `22-typescript-contracts-runtime-validation.mdc` + `zod-schema-scaffold` skill | ✅ PASS | — | — |
| 2 | Workspace-scoping on every route (read + write) | (project convention; enforced by L2 isolation tests) | ✅ PASS | — | — |
| 3 | L2 cross-workspace isolation tests **per route file** | `l2-cross-workspace-isolation-test` skill | 🟡 PARTIAL → ✅ PASS after B′ | — | — |
| 4 | Container-only npm/npx invocations | `00-shared-node-npm-container-only.mdc` + `node-npm-container-only` skill | ✅ PASS | — | — |
| 5 | Module SDK registration (`registerModule()`, `registerTools()`) | `@umbraculum/module-sdk` README + reference impl in `automation` module | ✅ PASS | — | — |
| 6 | Prisma multi-schema (per-module `@@schema("...")`) | reference impl in `automation` schema slice | ✅ PASS | — | — |
| 7 | Module-README structural compliance (full-scope + sub-component checks) | `module-readme-verification` skill + `DOCS-README-STANDARDS.md` + `scripts/docs/check-readmes.py` | ❌ FAIL → ✅ PASS after verifier fix-up | — | — |
| 8 | TS strict — 6 flags set **and** `tsc --noEmit` clean | `typescript-strict-flag-verification` skill | 🟡 6/6 flags set but TS4111 error → ✅ PASS after verifier fix-up | — | — |
| 9 | Gate-skill **self-invocation** at phase boundaries | `12-skill-contract.mdc` + each gate skill's `## When to use` clause | ❌ FAIL | — | — |
| 10 | Build-log discipline (per-phase timing + model attribution + decision rationale) | RFC-0004 §6.5 + plan-template §8 | 🟡 PARTIAL (timing + model recorded; decision rationale only added by verifier; per-phase SHAs suppressed by user policy) | — | — |
| 11 | Plan-slice adherence (no scope creep, no opportunistic refactors) | (project policy) | ✅ PASS | — | — |
| 12 | Cross-agent commit hygiene (no `git add -A` sweep of other agents' WIP) | (no formal rule yet — see [§10 lesson 5](#10-what-this-means-for-plan-authors)) | ❌ FAIL | — | — |
| 13 | Brand callout (`> [!NOTE]` block with `docs/RENAME-DILIGENCE.md` link) in module READMEs | `module-readme-verification` checker + `DOCS-README-STANDARDS.md` | ❌ FAIL → ✅ PASS after verifier fix-up | — | — |
| 14 | Choice-point escalation (AskQuestion before silent judgment on deviations) | (no formal rule yet — see [§10 lesson 6](#10-what-this-means-for-plan-authors)) | 🟡 PARTIAL (silent `pim/` choice, happened to be correct) | — | — |
| 15 | Public-endpoint verification at phase end (where applicable) | `public-endpoint-verification` skill + `45-public-endpoint-verification.mdc` | ❌ FAIL (verifier had to run it) | — | — |

## §8 Verdict snapshot

Rows are verdict checkpoints; columns are runs. ✅ YES / ❌ NO / 🟡
with-caveats. Add a column when a new run is recorded.

| # | Verdict checkpoint | Run 1 (`composer-2.5-fast`) | Run 2 (TBD) | Run 3 (TBD) |
|---|---|---|---|---|
| 1 | Trustable to execute a *frontier-authored, detailed plan*? | ✅ YES | — | — |
| 2 | Trustable *unsupervised* (no verifier loop)? | ❌ NO | — | — |
| 3 | Self-runs gate skills without being told? | ❌ NO | — | — |
| 4 | Self-discovers conventions from rules/skills not pointed at? | ❌ NO | — | — |
| 5 | Self-corrects on second-pass after a FAIL re-task? | ✅ YES | — | — |
| 6 | Suitable as **bulk-implementor** for template-fill phases? | ✅ YES | — | — |
| 7 | Suitable as **judgment-finalist** for judgment-dense phases? | ❌ NO | — | — |
| 8 | Cross-agent commit hygiene? | ❌ NO | — | — |
| 9 | Choice-point escalation (asks before silent deviation)? | 🟡 PARTIAL | — | — |

## §9 Trend notes

Append patterns that span ≥ 2 runs. Don't add anything here until
we have ≥ 2 runs of data — single-data-point "trends" are noise.

- **(Single data point so far — no trends recordable yet.)** Will
  start populating after the second non-frontier executor run is
  recorded.
- *Open questions to track once Run 2 lands:*
  - Does Composer's gate-skill self-invocation improve if the plan
    names each skill explicitly?
  - Does Composer's L2 test coverage become file-complete on the
    first pass if the plan enumerates each file?
  - Does Composer's choice-point escalation behavior change after
    a rule formalizes it?

## §10 What this means for plan authors

These are the **load-bearing extra-specifications** to include in
plans for non-frontier executors, derived from each Run-section's
WRONG-table.

1. **Enumerate every gate skill to run, by name, at each phase
   boundary.** Don't write "run the standard checks" — write
   "after Phase B, run `module-readme-verification` on
   `packages/pim-contracts/README.md` and on `services/api/src/modules/pim/README.md`;
   run `typescript-strict-flag-verification` on `packages/pim-contracts/`;
   run `public-endpoint-verification` on `GET /pim/products` and
   `GET /pim/categories`." *(Source: Run 1 — WRONG row 4.)*
2. **Enumerate every per-file artifact, by file path, not by
   pattern.** Don't write "L2 isolation tests per route file" —
   write "create the following 4 L2 isolation test files:
   `pimProducts.test.ts`, `pimVariants.test.ts`,
   `pimAttributeSets.test.ts`, `pimCategories.test.ts` — one per
   route file." *(Source: Run 1 — WRONG row 1.)*
3. **Pre-author the README boilerplate** (brand callout block,
   exact heading list) or link to the exact section of
   `DOCS-README-STANDARDS.md` that applies, with a worked-example
   reference README to copy from. *(Source: Run 1 — WRONG row 2 +
   row 7 [brand callout].)*
4. **Specify the typecheck gate as `tsc --noEmit` on the package**,
   not as "vitest passes." Vitest doesn't enforce all 6 strict
   flags; `tsc --noEmit` does. *(Source: Run 1 — WRONG row 3.)*
5. **Document the cross-agent staging boundary explicitly** when
   more than one agent is sharing the working tree. E.g. "Composer:
   only `git add <explicit-file-list>`; never `git add -A` while
   verifier is editing." *(Source: Run 1 — WRONG row 5.)*
6. **Flag every plan-deviation choice-point as
   `AskQuestion` BEFORE deciding.** E.g. "if the canonical
   reference path doesn't match the plan's prescribed path,
   AskQuestion the planner before silently picking either." *(Source:
   Run 1 — WRONG row 7.)*
7. **Require *decision rationale* in the build-log, not just timing
   + exit codes.** "At each phase boundary, append a 2-3 sentence
   paragraph to the build-log explaining *why* this implementation
   shape was chosen over alternatives the plan didn't explicitly
   forbid." *(Source: Run 1 — WRONG row 6.)*
8. **Document the per-phase commit policy explicitly.** Either "commit
   per phase with SHAs recorded in the timing table" OR "leave the
   whole tranche uncommitted for verifier review; record the policy
   override in the build-log so SHA column suppression is intentional,
   not forgotten." *(Source: Run 1 — WRONG row 8.)*

These eight bullets are the **minimum extra-specification budget**
for the next non-frontier-executor plan in this repo. If the next
plan omits any of them, expect Run 2 to reproduce the corresponding
FAIL pattern.

## §11 Discoverability hooks

**Status: RESOLVED — 2026-05-20** — option **C (both A + B)** landed
the same session this document was authored. Belt-and-suspenders:
AGENTS.md pointer for immediate effect in this repo; plugin rule for
the structural cross-repo home.

| # | Hook | Where it lives | Effective when |
|---|---|---|---|
| A | "Adjacent context for plan authors and executors" section in [`AGENTS.md`](../AGENTS.md) (inserted between "What this file is NOT" and "Forward") | This repo, branch `pim-canonical-build-2026-05-19` | Immediately — every agent in this repo reads `AGENTS.md` at session start, no install step. |
| B | `rules/43-non-frontier-executor-fitness-tracker.mdc` in the `umbraculum-toolset-common` Cursor plugin | Plugin source repo (`~/dkprojects/rfapps/umbraculum-toolset/`); plugin version bumped `0.6.0 → 0.7.0` | Once the toolset plugin is re-installed locally (`cursor-plugins/scripts/install-local.sh`) and the Cursor window reloaded. Cross-repo: any sibling Umbraculum repo that adopts the toolset gets the rule automatically. |

### Reading-path summary (post-landing)

For agents working *in this repo today*:

- Read `AGENTS.md` at session start (apparatus self-check rule already enforces this).
- AGENTS.md's "Adjacent context" section now points to this tracker — plan authors land on §10 before drafting; non-frontier executors land on §6.x WRONG-rows before executing.
- Plugin rule 43 is the same guidance, delivered via the toolset, so it survives if AGENTS.md is ever pruned and propagates to sibling Umbraculum repos.

### Rejected options (recorded for posterity)

- **Plan-template embed** (originally listed as candidate option C): rejected at landing time because no formal plan template exists yet in this repo (plans live as Cursor plan files, not as a versioned project template). If/when a formal plan template is authored, embedding a §10 pointer as required boilerplate is a sensible second-order follow-up — append a row above and update this section's status from RESOLVED to RESOLVED+EXTENDED at that time.

## §12 References

- [`MANIFESTO.md`](../MANIFESTO.md) §1.2 — AI-orchestrated-code project
  framing (the operating mode this tracker calibrates).
- [`RFC-0001`](rfcs/0001-modules-tiers-governance-and-automation-placement.md)
  — modules + tiers + governance (the system this tracker's runs
  build *within*).
- [`RFC-0004`](rfcs/0004-canonical-pim.md) — Run 1's sanctioning RFC.
- [`docs/design/canonical-pim-build-log.md`](design/canonical-pim-build-log.md)
  — Run 1's full build artifact (this tracker's per-run section
  §6.1 summarizes from it; the build-log is the source of truth for
  the underlying observations).
- [`DOCS-README-STANDARDS.md`](DOCS-README-STANDARDS.md) — the
  README structural standard whose first-pass FAILs are tracked in
  Convention rows 7 + 13.
- [`CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md) — the apparatus
  (umbraculum-toolset plugin pack) referenced by AGENTS.md; option
  B in [§11](#11-discoverability-hooks) lands here.
