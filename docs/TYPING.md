# Typing (TypeScript)

**Tier:** Public
**Status:** v0.1 — **Phase 1 audit landed 2026-05-18.** Baselined `tsc --noEmit` across all 15 workspaces (14 TS workspaces + the JS-only `packages/core`); piloted 4 candidate stricter flags (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride`) in 8 clean workspaces to size the rollout cost. Findings: **5 workspaces currently fail `tsc --noEmit` on `main`** (apps/web 1062, services/api 7, packages/ui 28, packages/contracts 5, packages/beerjson 1; total 1103 errors), **10 workspaces are clean** (apps/native, apps/web/e2e, services/api/prisma, packages/api-client, packages/test-mcp, packages/i18n, packages/i18n-react, packages/media, packages/navigation, packages/recipes-ui). The failing baselines are NOT a regression introduced by this audit — they're latent debt that has never been gated in CI; today only `apps/native` runs `tsc --noEmit` as a CI gate (via `.github/workflows/native-deps.yml`). Sub-phases 2–6 below are scoped to (a) bring the 5 failing workspaces to green and (b) roll out stricter flags one at a time across the monorepo.
**Audience:** maintainers, contributors, anyone authoring TypeScript code in this repo
**Owners:** maintainers
**Related:** `docs/TAMAGUI.md` (already documents the dominant apps/web + packages/ui type-error class — Tamagui shorthand props and theme tokens; accepted cost), `docs/TESTING.md` (the SoT for the testing layers), `docs/LINTING.md` (the SoT for ESLint; the ESLint slice already eliminated the explicit-`any` and unsafe-`any` classes that TypeScript was leaking through), `docs/ROADMAP.md` (the foundation-hardening pass ahead of the H1 2027 public-AGPLv3 flip), `docs/CONTRACTS-VALIDATION-STRATEGY.md` (Phase 7 — runtime-validation library decision; orthogonal to compile-time strictness but tracked together).

---

## TL;DR

| What | State |
|---|---|
| `strict: true` set across all 14 TS workspaces | ✅ |
| Stricter flags (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride`) | ❌ Not set anywhere. Phase-6 sub-phases will enable them one-at-a-time after baselines are green. |
| `tsc --noEmit` passes per-workspace | 🟡 10 of 15 workspaces green; 5 failing (1103 latent type errors total). See [Per-workspace baseline](#per-workspace-baseline). |
| `tsc --noEmit` enforced in CI | 🟡 Only `apps/native` is gated today. Phase 5 will add a `typecheck` workflow once the 5 failing baselines are green. |
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

## Per-workspace baseline (2026-05-18)

Measured via `tsc --noEmit` per workspace, running TypeScript 5.x as hoisted at the monorepo root (`/repo/node_modules/.bin/tsc`). All workspaces have `strict: true` already.

### Failing baselines (5 workspaces, 1103 latent type errors)

| Workspace | Errors | Runtime | Primary cause |
|---|---:|---:|---|
| `apps/web` | **1062** | ~12.5s | Tamagui shorthand props (`mt`, `bg`, `w`, `p`, `items`, `minW`, etc.) — already documented in [`docs/TAMAGUI.md`](TAMAGUI.md) §"Caveat 2: Shorthand props" as accepted cost. TAMAGUI.md previously reported 590 errors here; count has grown ~80% since then. Spread across 30+ files. |
| `packages/ui` | **28** | ~3.7s | Mix of Tamagui shorthand props (`marginTop`, `gap`), Tamagui `ThemeName "alt2"` (theme-token caveat from TAMAGUI.md §"Caveat 1"), 1 `Cannot find module 'victory-native'`, and 1 implicit-`any` binding element (`TS7031` in `HydrometerChart.native.tsx`). |
| `services/api` | **7** | ~10s | Three independent issues: (a) Prisma `Json` column type incompatibility on `metadataJson` in `brewdaySettingsService.ts` (2 errors) + `inventoryService.ts` (2 errors) — Prisma's `InputJsonValue` union narrowing vs `Record<string, unknown>`; (b) shape mismatch in `recipesImportService.ts` (2 errors) — `UnitConversionWarningV1` lacks `message` required by a downstream type, currently bridged by `as`-casts that `--strict` rejects under `TS2352`. |
| `packages/contracts` | **5** | ~1.4s | `Cannot find module 'vitest'` across 5 test files — tsconfig `types` array doesn't include `vitest` or `vitest/globals`. Pure tsconfig fix. |
| `packages/beerjson` | **1** | ~1.4s | Same `Cannot find module 'vitest'` pattern, single test file. Pure tsconfig fix. |

### Clean baselines (10 workspaces)

| Workspace | Errors | Runtime |
|---|---:|---:|
| `apps/native` | 0 | ~10.5s (slowest — Expo type deps) |
| `apps/web/e2e` | 0 | ~1.3s |
| `services/api/prisma` | 0 | ~1.7s |
| `packages/api-client` | 0 | ~1.5s |
| `packages/test-mcp` | 0 | ~1.1s |
| `packages/i18n` | 0 | ~1.3s |
| `packages/i18n-react` | 0 | ~1.4s |
| `packages/media` | 0 | ~1.2s |
| `packages/navigation` | 0 | ~1.4s |
| `packages/recipes-ui` | 0 | ~2.4s |

`packages/core` is intentionally JavaScript-only (no `tsconfig.json`); it has its own L1 vitest coverage ([`docs/TESTING.md`](TESTING.md) Phase 5a) and is consumed as `.js`. Not in scope for `tsc --noEmit` gating.

**Total cumulative runtime (sequential):** ~50s for all 14 workspaces. Parallel (e.g. via `npm run --workspaces typecheck`): ~12s wall (bounded by the slowest two — apps/web and apps/native at ~10–12s each). This is comparable to the ~42s CI lint cost; acceptable as a CI gate once baselines are green.

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
| **1 — Audit + baseline + SoT doc** (THIS doc) | Inventory `tsc --noEmit` per workspace; pilot 4 candidate flags; publish this doc. **✅ Landed 2026-05-18.** | 1 session | — |
| **2 — tsconfig vitest types fix** | Add `vitest` (or `vitest/globals`) to `compilerOptions.types` in `packages/beerjson/tsconfig.json` + `packages/contracts/tsconfig.json`. Eliminates 6 of 1103 errors (0.5%). Pure tsconfig change; no source mutations. | <30 min | Phases 4, 5, 6 |
| **3 — services/api remediation** | Three fixes: (a) Prisma JSON column typing for `metadataJson` (canonical patterns: explicit `Prisma.InputJsonValue` cast vs Zod-parse-then-assign — pick one and pin); (b) `UnitConversionWarningV1` shape — either add the missing `message` field upstream in the warning constructor or change the consumer's expected shape; tests exist for both surfaces (Phase 4b-2 inventoryService + 5b-1 waterCalc), so behavior is pinned. | 1–2 sessions | Phase 5 (services/api CI gate), Phase 6 (strict-flag rollout for services/api) |
| **4 — apps/web infrastructure** | (a) Add `"typecheck": "tsc -p tsconfig.json --noEmit"` to `apps/web/package.json`. (b) Update [`docs/TAMAGUI.md`](TAMAGUI.md) §"Accepted cost" table: apps/web 590 → 1062 errors (current measured baseline), packages/ui 25 → 28. (c) **Decide explicitly** whether the apps/web Tamagui baseline is "accepted cost (do not gate in CI)" — the current TAMAGUI.md position — or whether the slice should drive the count down via a wrapper-primitive pass. Recommended: keep TAMAGUI.md's accept-and-document position for now; Phase 5 gates the OTHER 14 workspaces but leaves apps/web non-gating; reassess after Phase 6 rollout. | 1 session | Phase 5 (decides whether apps/web is in or out of the CI gate) |
| **5 — Per-workspace CI gate** | Add a `typecheck` workflow that runs `npm run typecheck` for all workspaces with a green baseline. Conservative initial scope: gate the 10 currently-clean workspaces + the 3 made-clean-by-Phase-2-and-3 = 13 of 14 workspaces. apps/web's inclusion is the Phase-4 decision. Workflow runs in parallel per-workspace; expected CI wall time ~15s. | 1 session | Phase 6 (without a gate, strict-flag regressions silently re-accumulate) |
| **6a — Enable `noPropertyAccessFromIndexSignature` + `noImplicitOverride` repo-wide** | Pilot data shows 0 new errors across all 8 measured clean workspaces. Add both flags to each `tsconfig.json` (no per-workspace exceptions expected). | <1 session | Phase 6b |
| **6b — Enable `noUncheckedIndexedAccess` repo-wide** | Pilot data shows 5 new errors in `apps/native` (3 files), 0 elsewhere. Fix the 5 apps/native sites (the real latent bugs the flag catches), then enable. | 1 session | Phase 6c |
| **6c — Enable `exactOptionalPropertyTypes` (one workspace at a time)** | Pilot data shows 12 new errors across 3 workspaces (apps/native 6, api-client 3, recipes-ui 3) — biggest cost. The dominant friction is `Partial<T>` call sites with explicit-`undefined`. Enable per-workspace in a deliberate order (smallest first: api-client → recipes-ui → apps/native), with a clear migration pattern documented. | 1–3 sessions | — |
| **6d — Optional: `verbatimModuleSyntax` + `isolatedModules` audit** | `apps/web` already has `isolatedModules: true`; others don't. Cheap to enable, useful for ESM correctness, but lower-priority than 6a–6c. Decide whether to ship as Phase 6d or defer. | — | — |

**Order rationale.** Phases 2–3 are pure debt cleanup with low coordination cost. Phase 4 is the gnarliest decision-point (Tamagui acceptance vs. wrapper-primitive pass). Phase 5 is the gate that prevents regression once green. Phase 6 is the actual hardening payoff; the cheapest flags (6a) ship first to build flag-rollout muscle memory, then the lowest-risk substantive flag (6b), then the most expensive (6c).

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
