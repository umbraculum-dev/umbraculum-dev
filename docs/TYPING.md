# Typing (TypeScript)

**Tier:** Public
**Status:** v0.2 — **Phase 1 audit landed 2026-05-18; Phase 2 methodology correction landed same day.** Baselined `tsc --noEmit` across all 15 workspaces (14 TS workspaces + the JS-only `packages/core`); piloted 4 candidate stricter flags (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride`) in 8 clean workspaces to size the rollout cost. Findings (canonical method — see [Methodology](#methodology) below): **3 workspaces currently fail `tsc --noEmit` on `main`** (apps/web 585, packages/ui 25, services/api 19; total 629 errors), **12 workspaces are clean** (apps/native, apps/web/e2e, services/api/prisma, packages/api-client, packages/beerjson, packages/contracts, packages/test-mcp, packages/i18n, packages/i18n-react, packages/media, packages/navigation, packages/recipes-ui). The failing baselines are NOT a regression introduced by this audit — they're latent debt that has never been gated in CI; today only `apps/native` runs `tsc --noEmit` as a CI gate (via `.github/workflows/native-deps.yml`). Sub-phases 3–6 below are scoped to (a) bring the 3 failing workspaces to green and (b) roll out stricter flags one at a time across the monorepo. **Phase 2 correction note**: v0.1 of this doc (initial commit `6f3c2cc`) reported 5 failing workspaces and 1103 errors; that count was inflated by inconsistent measurement methodology — `packages/beerjson` (was 1) and `packages/contracts` (was 5) were measured via the `web` container where `/packages/node_modules` is symlinked to `apps/web`'s deps (no `vitest`), and `apps/web` (was 1062) included stale `.next/types/*.ts` declarations from a prior dev-server build. The canonical method now uses a one-off `node:20-slim` container + monorepo-root hoisted `/repo/node_modules` (same as the existing `apps/native` CI gate), which is reproducible and matches CI conditions.
**Audience:** maintainers, contributors, anyone authoring TypeScript code in this repo
**Owners:** maintainers
**Related:** `docs/TAMAGUI.md` (already documents the dominant apps/web + packages/ui type-error class — Tamagui shorthand props and theme tokens; accepted cost), `docs/TESTING.md` (the SoT for the testing layers), `docs/LINTING.md` (the SoT for ESLint; the ESLint slice already eliminated the explicit-`any` and unsafe-`any` classes that TypeScript was leaking through), `docs/ROADMAP.md` (the foundation-hardening pass ahead of the H1 2027 public-AGPLv3 flip), `docs/CONTRACTS-VALIDATION-STRATEGY.md` (Phase 7 — runtime-validation library decision; orthogonal to compile-time strictness but tracked together).

---

## TL;DR

| What | State |
|---|---|
| `strict: true` set across all 14 TS workspaces | ✅ |
| Stricter flags (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride`) | ❌ Not set anywhere. Phase-6 sub-phases will enable them one-at-a-time after baselines are green. |
| `tsc --noEmit` passes per-workspace | 🟡 12 of 15 workspaces green; 3 failing (629 latent type errors total). See [Per-workspace baseline](#per-workspace-baseline). |
| `tsc --noEmit` enforced in CI | 🟡 Only `apps/native` is gated today. Phase 5 will add a `typecheck` workflow once the 3 failing baselines are green. |
| `apps/web` has a `typecheck` npm script | ❌ Missing. Phase 4 will add one. |
| Existing `any` / `as any` / `@ts-expect-error` budget | ~17 `: any` annotations + ~58 `as any` casts + 5 `@ts-expect-error` markers, almost entirely in tests. The ESLint HIGH-full slice already eliminated explicit-`any` in source via `no-explicit-any: error`. |

---

## Why types-hardening exists in this repo

The ESLint slice ([`docs/LINTING.md`](LINTING.md)) caught the bug classes that TypeScript will never see (stale `useEffect` closures, raw Tamagui leaking RN a11y props to the DOM, `no-floating-promises` discipline, etc.). The test-coverage slice ([`docs/TESTING.md`](TESTING.md)) catches behavioral regressions at runtime across 5 layers (L1 unit through L5 Playwright). Types-hardening fills the third corner of the bug-prevention foundation: **the compile-time class of bugs that lint can't see and tests can't reach** — most notably, index-out-of-bounds (`arr[i]` returns `T`, but `arr[i]` might be `undefined`), `Map.get()` returning `undefined`, the `foo?: T` vs `foo: T | undefined` distinction (which silently swallows "I forgot to pass this" bugs), and accidental method-name collisions in class hierarchies.

`strict: true` is already on across all 14 TS workspaces — that's the floor. The high-yield next-class flags are off:

- `noUncheckedIndexedAccess` — forces `T[]` index access and `Map.get()` returns to be `T | undefined`. Highest-value flag for the next bug class; catches a category of latent crash that L1 unit tests typically don't exercise.
- `exactOptionalPropertyTypes` — pins the `foo?: T` vs `foo: T | undefined` distinction. Matters for Prisma DTOs and contract parsers where "absent" and "explicitly undefined" should mean different things.
- `noPropertyAccessFromIndexSignature` — forces `obj['key']` (not `obj.key`) for index-signature properties; catches accidental dotted-access on untyped keys.
- `noImplicitOverride` — requires the `override` keyword on subclass methods; catches accidental name collisions.

The headline cost of these flags **is not** the count of new errors they introduce (the pilot data below shows that count is small — 5 errors in apps/native for `noUncheckedIndexedAccess`, 0 across 7 other clean workspaces). The headline cost is the **5 existing failing baselines** that need to be brought to green first.

---

## Methodology

`tsc --noEmit` baseline measurements are **sensitive to which `node_modules` tree TypeScript resolves from**. The dev environment uses three different trees:

1. **Long-running `web` container**: `/packages/node_modules` is a symlink to `apps/web`'s `node_modules` (set up at container startup per [`DEVELOPMENT-LOCAL.md`](../DEVELOPMENT-LOCAL.md) lines 122–124). Packages that aren't in `apps/web`'s dependency tree (e.g. `vitest`, which only `services/api` + the test-specific packages depend on) are not resolvable from here.
2. **Long-running `api` container**: bind-mounts `services/api/node_modules` directly. Includes Prisma client generated in-container, which may differ from the host's view.
3. **One-off `node:20-slim` container**: mounts the entire repo at `/repo` and uses the **monorepo-root hoisted `/repo/node_modules`** (npm workspaces install). This is what `apps/native`'s CI gate uses (`.github/workflows/native-deps.yml`), and it's reproducible across machines because the lockfile pins the hoisted tree.

**The canonical baseline method for this slice is #3** — one-off `node:20-slim` container + `/repo/node_modules/.bin/tsc` — because (a) it's reproducible, (b) it matches CI conditions, (c) it's symmetric across all workspaces (no per-workspace tooling difference), and (d) it's the method the existing `apps/native` CI gate already uses, so a future `typecheck` workflow can match it directly.

The v0.1 of this doc (commit `6f3c2cc`) measured `apps/web` from the `web` container (1062 errors — included stale `.next/types/*.ts` from prior dev-server builds; the Next.js plugin populates these at build time and `tsc` picks them up); `packages/beerjson` + `packages/contracts` from the `web` container's `/packages/*` path (1 + 5 errors — none of which exist when measured canonically because `vitest` is resolvable from `/repo/node_modules`); and `packages/ui` similarly inflated by 3 `victory-native` resolution errors. **v0.2 reports the canonical numbers and is the source-of-truth from here on.**

To reproduce a baseline measurement:

```bash
docker run --rm -v "$PWD:/repo" -w /repo node:20-slim bash -lc '
  cd /repo/<workspace>
  /repo/node_modules/.bin/tsc -p tsconfig.json --noEmit
'
```

---

## Per-workspace baseline (2026-05-18, v0.2 canonical)

Measured via the canonical method above. All workspaces have `strict: true` already.

### Failing baselines (3 workspaces, 629 latent type errors)

| Workspace | Errors | Runtime | Primary cause |
|---|---:|---:|---|
| `apps/web` | **585** | ~2.6s | Tamagui shorthand props (`mt`, `bg`, `w`, `p`, `items`, `minW`, etc.) — already documented in [`docs/TAMAGUI.md`](TAMAGUI.md) §"Caveat 2: Shorthand props" as accepted cost. TAMAGUI.md previously reported 590 errors here; the canonical count is within 1% of that documented number. Spread across ~30 files. |
| `packages/ui` | **25** | ~4.7s | Tamagui shorthand props (`marginTop`, `gap`) + Tamagui `ThemeName "alt2"` (theme-token caveat from TAMAGUI.md §"Caveat 1"). All errors are in the Tamagui-accepted class. |
| `services/api` | **19** | ~7.9s | Five independent classes: (a) Prisma `Json` column typing on `metadataJson` in `brewdaySettingsService.ts` + `inventoryService.ts` (4 errors); (b) `UnitConversionWarningV1` shape mismatch in `recipesImportService.ts` (2 errors); (c) Prisma `Where` clause structural mismatch in `routes/ingredients.ts` (4 errors — `OR` array readonly-tuple branches not unifying with `FermentableWhereInput`/`HopWhereInput`); (d) Prisma client missing `$on/$connect/$disconnect/$transaction/$extends` properties in `brewSessionsService.ts:924` (1 error — Prisma client de-narrowing inside a transaction lambda); (e) **L1 test-level type errors I added in earlier hardening sub-phases that vitest didn't catch** — `gravityAnalysis.test.ts:36` (Phase 5b — `form` property on hop union), `gravityAnalysis.ts:548` (`buGuRatio` missing from `GravityAnalysis`), `overall.test.ts:197+213` (Phase 5b-5 — `baseProfile` missing from `SaltAdditionsResult` mock; 4 errors total in the test-vs-types path). Notable: tests passed cleanly at runtime because vitest uses esbuild (lenient transpilation, not type-checking) — this is the first time these have been surfaced. |

### Clean baselines (12 workspaces)

| Workspace | Errors | Runtime |
|---|---:|---:|
| `apps/native` | 0 | ~4.9s |
| `apps/web/e2e` | 0 | ~1.5s |
| `services/api/prisma` | 0 | ~2.5s |
| `packages/api-client` | 0 | ~1.5s |
| `packages/beerjson` | 0 | ~1.9s |
| `packages/contracts` | 0 | ~1.8s |
| `packages/i18n` | 0 | ~1.4s |
| `packages/i18n-react` | 0 | ~1.5s |
| `packages/media` | 0 | ~1.5s |
| `packages/navigation` | 0 | ~2.4s |
| `packages/recipes-ui` | 0 | ~3.8s |
| `packages/test-mcp` | 0 | ~1.8s |

`packages/core` is intentionally JavaScript-only (no `tsconfig.json`); it has its own L1 vitest coverage ([`docs/TESTING.md`](TESTING.md) Phase 5a) and is consumed as `.js`. Not in scope for `tsc --noEmit` gating.

**Total cumulative runtime (sequential):** ~42s for all 14 workspaces. Parallel (e.g. via `npm run --workspaces typecheck`): ~8s wall (bounded by the slowest — services/api at ~7.9s). This is well below the ~42s CI lint cost; acceptable as a CI gate once baselines are green.

### Side-finding: vitest's runtime laxness hides type errors that `tsc --noEmit` catches

Among the 19 `services/api` errors are 4 in test files I authored during the test-coverage hardening pass (`gravityAnalysis.test.ts:36`, `overall.test.ts:197+213`). These tests run green under `npm run test` (all 400 tests across 49 files passed) because vitest's underlying transpiler (esbuild via vite) is **lenient by design** — it strips types without type-checking them. This is the first time these have surfaced because `services/api` has no CI `typecheck` gate. Phase 5 adds that gate; Phase 3 fixes these alongside the other services/api errors.

This is a useful corollary finding: **the L1+L2 test layers are not a substitute for `tsc --noEmit`** — they catch behavioral regressions but not type contract drift. This is part of why the foundation-hardening pass has three slices (lint, tests, types) instead of two.

### Typecheck infrastructure today

- **CI gate (1 workspace)**: `apps/native` is the only workspace with `tsc --noEmit` enforced in CI, via `.github/workflows/native-deps.yml` (runs on PRs touching `apps/native/**`, `packages/**`, or the lockfiles; designed to catch shared-package `dist/` drift). Documented in [`DEVELOPMENT-LOCAL.md`](../DEVELOPMENT-LOCAL.md) lines 101–118.
- **Workspaces with a `typecheck` npm script (12 of 14)**: `services/api`, `packages/api-client`, `packages/beerjson`, `packages/contracts`, `packages/i18n`, `packages/i18n-react`, `packages/media`, `packages/navigation`, `packages/recipes-ui`, `packages/ui`, `packages/test-mcp`, `apps/native`. Convention: `"typecheck": "tsc -p tsconfig.json --noEmit"`.
- **Workspaces missing a `typecheck` script (2 of 14)**: `apps/web` (relies on `next build` for typecheck, but that path is different from `npx tsc --noEmit` — `.next/types/**/*.ts` declarations are only generated by a prior build, and the `"plugins": [{ "name": "next" }]` typescript plugin is only used by the editor language service, not by the CLI `tsc`); `apps/web/e2e` (no script wired but the tsconfig is set up correctly — adding one is trivial).

---

## Candidate stricter flags — pilot results (2026-05-18)

Inline-piloted each flag against 8 clean workspaces (1 large: `apps/native`; 7 small: `apps/web/e2e`, `packages/media`, `packages/i18n`, `packages/i18n-react`, `packages/api-client`, `packages/navigation`, `packages/recipes-ui`). Method: `tsc -p tsconfig.json --noEmit --<flag>` (no file mutation, just CLI override). Counts are NEW errors beyond the (zero) baseline.

| Flag | apps/native | apps/web/e2e | packages/media | packages/i18n | packages/i18n-react | packages/api-client | packages/navigation | packages/recipes-ui | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `noUncheckedIndexedAccess` | **5** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **5** |
| `exactOptionalPropertyTypes` | **6** | 0 | 0 | 0 | 0 | **3** | 0 | **3** | **12** |
| `noPropertyAccessFromIndexSignature` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| `noImplicitOverride` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |

### Reading the pilot

- **`noUncheckedIndexedAccess`** — the 5 new errors in `apps/native` are real latent bugs (not test-only friction):
  - `src/screens/FermDataIntegrationScreen.tsx` lines 129, 131 — `arr[idx]` indexing without an undefined check.
  - `src/screens/WaterMashScreen.tsx` lines 629, 673, 674 — same pattern in mash-step row access (`row` possibly undefined, `EditorMashStep | undefined` assigned to `EditorMashStep`).
  - These are exactly the bug class the flag is designed to catch — likely TODO when first written, now formalizable.
- **`exactOptionalPropertyTypes`** — 12 new errors, with a distinctive friction signature: most are `Partial<T>` argument shape mismatches (`TS2379`), e.g. `Partial<EditorGristRow>` requires every optional field to be present or omitted, but the call site passes `{ ingredientId: undefined }` (explicit-undefined, which the flag now rejects). This is real value — it forces a discipline distinction — but the cleanup is not trivial (each call site needs either a `delete`+spread pattern or a destination-type tweak from `field?: T` to `field?: T | undefined`).
- **`noPropertyAccessFromIndexSignature`** + **`noImplicitOverride`** — essentially free across all 8 clean workspaces. Likely free across the failing 5 too (once those are green). Strong candidates for an early, low-cost sub-phase.

The pilot **does not** measure the failing 5 workspaces — adding a stricter flag on top of an already-failing baseline is noise. Phase 2–4 (bringing the 5 baselines green) is a hard prerequisite for the Phase 6 flag rollout.

---

## Bounded sub-phase plan

Mirroring the test-coverage and lint phase logs: one PR per sub-phase, single-purpose commits, doc + status-banner updates per sub-phase.

| Phase | Scope | Estimated cost | Blocks |
|---|---|---|---|
| **1 — Audit + baseline + SoT doc** (THIS doc) | Inventory `tsc --noEmit` per workspace; pilot 4 candidate flags; publish this doc. **✅ Landed 2026-05-18** (commit `6f3c2cc`). | 1 session | — |
| **2 — Methodology correction + canonical re-baseline** | The v0.1 baseline mixed measurement methods across workspaces (long-running `web`/`api` container vs. one-off `node:20-slim`). v0.2 standardizes on the one-off-container method (same as `apps/native`'s CI gate) and republishes correct numbers: failing workspaces 5 → **3**, total errors 1103 → **629**. Originally-planned scope ("add `vitest` to `packages/beerjson` + `packages/contracts` tsconfig types") **CANCELLED** — those errors were measurement artifacts, not real type debt. **✅ Landed 2026-05-18.** | <1 session | Phase 3 (without correct baselines, Phase 3 scope estimates would be wrong) |
| **3 — services/api remediation** | Five issue classes (19 total errors): (a) Prisma JSON column typing for `metadataJson` in `brewdaySettingsService.ts` + `inventoryService.ts` (canonical patterns: explicit `Prisma.InputJsonValue` cast vs Zod-parse-then-assign — pick one and pin); (b) `UnitConversionWarningV1` shape mismatch in `recipesImportService.ts` (add missing `message` field upstream in the warning constructor or change consumer's expected shape); (c) Prisma `Where` clause unification in `routes/ingredients.ts` (readonly-tuple `OR` branches); (d) Prisma client de-narrowing in `brewSessionsService.ts:924` transaction lambda; (e) **4 test-level type errors I added during the test-coverage hardening pass** that vitest didn't catch — `gravityAnalysis.test.ts:36` (Phase 5b — hop union `form` property), `gravityAnalysis.ts:548` (`buGuRatio` missing from `GravityAnalysis`), `overall.test.ts:197+213` (Phase 5b-5 — `baseProfile` missing from `SaltAdditionsResult` mock). All behaviorally-equivalent tests stay green; this is pure type-shape cleanup. | 1–2 sessions | Phase 5 (services/api CI gate), Phase 6 (strict-flag rollout for services/api) |
| **4 — apps/web infrastructure** | (a) Add `"typecheck": "tsc -p tsconfig.json --noEmit"` to `apps/web/package.json`. (b) Confirm [`docs/TAMAGUI.md`](TAMAGUI.md) §"Accepted cost" table is up to date: apps/web 590 → 585 (still within 1%; effectively unchanged), packages/ui 25 unchanged. (c) **Decide explicitly** whether the apps/web Tamagui baseline is "accepted cost (do not gate in CI)" — the current TAMAGUI.md position — or whether the slice should drive the count down via a wrapper-primitive pass. Recommended: keep TAMAGUI.md's accept-and-document position for now; Phase 5 gates the OTHER 13 workspaces but leaves apps/web non-gating; reassess after Phase 6 rollout. | 1 session | Phase 5 (decides whether apps/web is in or out of the CI gate) |
| **5 — Per-workspace CI gate** | Add a `typecheck` workflow that runs `npm run typecheck` for all workspaces with a green baseline. Conservative initial scope: gate the 12 currently-clean workspaces + the 1 made-clean-by-Phase-3 (services/api) = 13 of 14 workspaces. apps/web's inclusion is the Phase-4 decision (packages/ui's inclusion is the Phase-3-or-later decision since its 25 errors are Tamagui-class). Workflow runs in parallel per-workspace via one-off `node:20-slim` containers; expected CI wall time ~10s. | 1 session | Phase 6 (without a gate, strict-flag regressions silently re-accumulate) |
| **6a — Enable `noPropertyAccessFromIndexSignature` + `noImplicitOverride` repo-wide** | Pilot data shows 0 new errors across all 8 measured clean workspaces. Add both flags to each `tsconfig.json` (no per-workspace exceptions expected). | <1 session | Phase 6b |
| **6b — Enable `noUncheckedIndexedAccess` repo-wide** | Pilot data shows 5 new errors in `apps/native` (2 files: `FermDataIntegrationScreen.tsx` + `WaterMashScreen.tsx`), 0 elsewhere. Fix the 5 apps/native sites (the real latent bugs the flag catches), then enable. | 1 session | Phase 6c |
| **6c — Enable `exactOptionalPropertyTypes` (one workspace at a time)** | Pilot data shows 12 new errors across 3 workspaces (apps/native 6, api-client 3, recipes-ui 3) — biggest cost. The dominant friction is `Partial<T>` call sites with explicit-`undefined`. Enable per-workspace in a deliberate order (smallest first: api-client → recipes-ui → apps/native), with a clear migration pattern documented. | 1–3 sessions | — |
| **6d — Optional: `verbatimModuleSyntax` + `isolatedModules` audit** | `apps/web` already has `isolatedModules: true`; others don't. Cheap to enable, useful for ESM correctness, but lower-priority than 6a–6c. Decide whether to ship as Phase 6d or defer. | — | — |

**Order rationale.** Phase 2 (this commit) is a measurement-methodology correction needed before any "fix" phase. Phase 3 is the real first fix — pure debt cleanup with low coordination cost. Phase 4 is the gnarliest decision-point (Tamagui acceptance vs. wrapper-primitive pass — but TAMAGUI.md already takes the accept position). Phase 5 is the gate that prevents regression once green. Phase 6 is the actual hardening payoff; the cheapest flags (6a) ship first to build flag-rollout muscle memory, then the lowest-risk substantive flag (6b), then the most expensive (6c).

**What this slice explicitly does NOT do.**

- Does not propose a wrapper-primitive pass for Tamagui shorthand props. [`docs/TAMAGUI.md`](TAMAGUI.md) explicitly accepts that cost and documents the localized-cast pattern; revisit only if upstream Tamagui ships better shorthand-prop typing.
- Does not introduce a runtime-validation library (Zod/Valibot/TypeBox). That's the separate Phase 7 decision tracked in [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md), with its own per-criterion trigger conditions; the latest audit (2026-05-16) re-confirmed "stay on hand-rolled" (0/6 criteria met).
- Does not change `packages/core` from JavaScript to TypeScript. `packages/core` is consumed as `.js` by both web and native and has L1 vitest coverage; converting it is out of scope for this slice.

---

## How to run locally

Per the container-only Node/npm rule ([`.cursor/rules/00-shared-node-npm-container-only.mdc`](../.cursor/rules/00-shared-node-npm-container-only.mdc)), all typecheck commands run inside Docker.

### Single workspace (the common case)

```bash
# services/api (running api container has node_modules bind-mounted)
docker compose exec -T api npm run typecheck

# apps/web (running web container; no typecheck script yet, use npx tsc directly until Phase 4)
docker compose exec -T web bash -lc 'cd /app && npx tsc --noEmit'

# any other workspace via the running web container, which has all packages mounted
docker compose exec -T web bash -lc \
  'cd /packages/contracts && /packages/node_modules/.bin/tsc -p tsconfig.json --noEmit'
```

### A workspace that isn't mounted in the running containers

`apps/native`, `apps/web/e2e`, `services/api/prisma`, `packages/api-client`, and `packages/test-mcp` aren't mounted in the long-running dev containers. Use a one-off `node:20-slim` container that mounts the entire monorepo:

```bash
docker run --rm -v "$PWD:/repo" -w /repo node:20-slim bash -lc '
  cd /repo/apps/native
  /repo/node_modules/.bin/tsc -p tsconfig.json --noEmit
'
```

(Reuses the monorepo's hoisted `node_modules`. Same pattern is used in `.github/workflows/native-deps.yml` for the apps/native CI gate.)

### Pilot a stricter flag without mutating tsconfig

```bash
docker run --rm -v "$PWD:/repo" -w /repo node:20-slim bash -lc '
  cd /repo/packages/recipes-ui
  /repo/node_modules/.bin/tsc -p tsconfig.json --noEmit --noUncheckedIndexedAccess
'
```

CLI flags override the `tsconfig.json` for that single invocation. Use this when sizing the impact of enabling a flag before committing to the tsconfig change.

### Counting errors

Errors come out one per `<file>(<line>,<col>): error TS<code>: <message>` line at the start of the output, followed by indented detail lines. To count just the top-level error count, grep for the leading non-space pattern:

```bash
tsc -p tsconfig.json --noEmit 2>&1 | grep -cE '^[^ ].+\(.+\): error'
```

---

## Anti-patterns (do not adopt while landing this slice)

- **Don't add blanket `// @ts-expect-error` to silence the 1062 apps/web Tamagui errors.** TAMAGUI.md §"Caveat 2" already accepts these; suppressing them in source obscures the count and risks hiding a genuine non-Tamagui error inside the noise.
- **Don't enable a stricter flag in `tsconfig.json` while the baseline is failing.** The new errors will compound with the existing ones and make it impossible to tell which were pre-existing. Always: bring baseline green → then enable flag → then commit both as one PR.
- **Don't migrate `packages/core` to TypeScript "while you're in there."** It's intentionally JS, consumed by both web and native; the conversion has cross-cutting native-bundle implications out of scope for this slice.
- **Don't add a `tsc --noEmit` step to the existing `web-lint` workflow.** Typecheck has different inputs (Prisma client generation, shared-package `dist/`) than lint and should be its own workflow with its own path-gating.

---

## Cross-references

- [`docs/TAMAGUI.md`](TAMAGUI.md) — the dominant type-error class in `apps/web` and `packages/ui`. **TAMAGUI.md is the SoT for what to do with Tamagui-driven type errors;** this doc only references its position.
- [`docs/LINTING.md`](LINTING.md) — the lint slice already eliminated explicit-`any` and unsafe-`any` classes; this slice is the compile-time complement.
- [`docs/TESTING.md`](TESTING.md) — runtime regression protection across 5 layers; this slice is the compile-time complement.
- [`docs/ROADMAP.md`](ROADMAP.md) → "Foundation hardening pass" — the slice this doc belongs to.
- [`docs/CONTRACTS-VALIDATION-STRATEGY.md`](CONTRACTS-VALIDATION-STRATEGY.md) — the runtime-validation library decision (Zod/Valibot/TypeBox); orthogonal to compile-time strictness.
- [`DEVELOPMENT-LOCAL.md`](../DEVELOPMENT-LOCAL.md) lines 94–121 — shared-package `dist/` build chain (beerjson → recipes-ui ordering matters for typecheck correctness) and the apps/native CI gate.
