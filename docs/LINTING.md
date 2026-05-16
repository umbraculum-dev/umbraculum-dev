# Linting (ESLint)

**Tier:** Public
**Status:** v1.2 — HIGH-staged Phase 1 (`packages/contracts/**`) landed; Phase 2 (`packages/beerjson/**`) is next.
**Audience:** maintainers, contributors, anyone authoring web/native UI code or services
**Owners:** maintainers
**Related:** `docs/TAMAGUI.md` (Tamagui type-system caveats), `docs/TESTING.md`, `docs/PLATFORM-ARCHITECTURE.md` §10.1.1 (go-public path), `docs/CONTRACTS-VALIDATION-STRATEGY.md` (Phase 7 — Zod/Valibot/TypeBox decision, separate from ESLint scope), `eslint.config.mjs` (this file is also documentation — read the comment headers).

---

## TL;DR

| What | State |
|---|---|
| ESLint runs in CI | ✅ `web-lint` GitHub Action, path-gated |
| Errors block CI | ✅ |
| Warnings tolerated repo-wide | ⚠️ Yes (HIGH-staged work to remove them, see roadmap) |
| Warnings forbidden in clean packages | ✅ `npm run lint:packages-strict` — **10 of 11 packages** at `--max-warnings 0` (added `packages/contracts` in Phase 1) |
| Cross-platform UI primitives enforced | ✅ `no-restricted-imports` on `packages/ui/src/{ai,charts}/**` |
| React hook bug class blocked | ✅ `react-hooks/exhaustive-deps` is `error` |
| Type-aware lint enabled | ❌ Deferred to HIGH-full (alongside `no-explicit-any: error`) |
| Outstanding warnings | **1,050** (963 `no-explicit-any` + 86 `no-unused-vars` + ~1 misc) — was 1,127 before Phase 1 (-77 cleared in `packages/contracts`) |

If you want to make a change touching `apps/web`, `apps/native`, `packages/**`, `services/api/src/**`, or `eslint.config.mjs`, the `web-lint` workflow will run automatically. Locally run lint with the commands in [How to run](#how-to-run-locally).

---

## Why ESLint exists in this repo

For a TypeScript + React + React Native monorepo headed for a public AGPLv3 release, lint coverage is a maturity expectation. TypeScript catches a large class of bugs, but ESLint catches a complementary class that TypeScript will never see:

- **`react-hooks/exhaustive-deps`** — stale-closure bugs (`useEffect` reads stale state). TypeScript can't see this; it's a semantic bug. We promoted this to `error` in HIGH-light.
- **`react-hooks/rules-of-hooks`** — conditional hook calls. Also semantic. Already `error`.
- **`jsx-a11y/*`** — accessibility regressions at the source level, complementing the runtime axe-core checks in the Playwright smoke suite.
- **`no-restricted-imports`** — bans specific imports (see below) for cross-platform safety.

### The canonical guardrail: cross-platform UI primitives

Components in `packages/ui/src/{ai,charts}/**` MUST NOT import `Button`/`Input`/`BrewCheckbox` directly from `tamagui`. They MUST import the platform-forking wrappers from `packages/ui/src/primitives/*`. Raw Tamagui leaks React Native a11y props (`accessibilityLabel`, `accessibilityRole`) to the DOM on web, triggering React console warnings.

This guardrail is enforced via `no-restricted-imports` and the underlying bug is documented in commit `221b193` (postmortem of `715bbea` / `d47f35a`).

This is exactly the kind of bug that:
- TypeScript cannot catch (Tamagui's types accept the props),
- Tests cannot easily catch (the warning is a console message, not a thrown error),
- Code review missed for two releases.

It's the reason ESLint is worth its tooling overhead in this repo.

---

## Scope tiers — value/cost analysis

Lint configuration has a fundamental value/cost trade-off: stricter rules catch more bugs but require more triage of pre-existing violations. We staged this in four tiers. Keep this table updated as project priorities shift.

| Tier | Effort to land | Value | Status |
|---|---|---|---|
| **Minimal** — only `no-restricted-imports` scoped to cross-platform UI folders. | Low (one config + one rule). | Low–medium: only catches the one bug class. Doesn't earn its tooling overhead. | ❌ Rejected as the lone scope. |
| **Medium** — full base preset (TS-recommended + React-Hooks + jsx-a11y) with per-glob overrides; `no-restricted-imports` on cross-platform UI; `react-hooks/exhaustive-deps` set to `warn`. | Medium (one config + ~5 plugins + light cleanup of pre-existing warnings). | High — catches a real class of React bugs TypeScript misses, formalizes a11y, prevents future drift. | ✅ Superseded by HIGH-light. |
| **HIGH-light** — Medium + `exhaustive-deps` as **error** + `--max-warnings 0` on 9 clean packages + `allowInterfaces: "with-single-extends"` to keep Tamagui's module-augmentation pattern legal. | Medium-high (1 PR, ~3 hours focused work). | High — locks in the clean parts; gates against drift; gives an honest "where are we" picture. | ✅ **Landed.** |
| **HIGH-staged** — HIGH-light + clean `any` warnings package-by-package, expanding `lint:packages-strict` glob with each cleanup. | Medium-high per phase (4–6 phases). | High — real type-safety wins where the money is (contracts, services, web pages). | 🚧 In progress — see [HIGH-staged roadmap](#high-staged-roadmap) below. |
| **HIGH-full** — HIGH-staged + `@typescript-eslint/recommended-type-checked` (type-aware) + `no-explicit-any` as **error** + `--max-warnings 0` repo-wide. | High (CI gets slower; many pre-existing violations surface from type-aware rules). | Highest — production-grade hygiene; signals maturity to public contributors. | 🚧 **Target: Q4 2026 / Q1 2027**, aligned with the public AGPLv3 flip (`docs/ROADMAP.md`). |

### Why we did not go HIGH-full in one shot

Roughly 1,040 of 1,127 outstanding warnings are `@typescript-eslint/no-explicit-any`. Mechanically fixing them would take an estimated 20–60 hours. More importantly, `recommended-type-checked` makes ESLint significantly slower (likely 5–10× in our monorepo), and Tamagui's type ecosystem (`docs/TAMAGUI.md`) generates large amounts of friction with `no-unsafe-*` rules. Doing HIGH-full as one mega-PR would:

1. Block other work for 1–2 weeks,
2. Generate a diff so large that meaningful review is impossible,
3. Conflate "real bug fixes" with "scope-creep refactors",
4. Risk landing semantic regressions (e.g. `catch (err: any)` → `unknown` requires careful narrowing).

HIGH-staged converts that monolith into ~5 reviewable PRs spread over months, each delivering measurable value (one more package gated against drift).

---

## HIGH-staged roadmap

Each phase below clears a slice of pre-existing `any` warnings, then expands the strict gate to cover it. Phases can be done independently and in any order, but **`packages/contracts/**` should go first** because contracts types flow downstream into services + apps.

### Phase 1 — `packages/contracts/**` (~77 `any` warnings) — ✅ **Landed**

- [x] Triage `packages/contracts/src/water/parseComputeAndSave.ts` (32 `any`) — done
- [x] Triage `packages/contracts/src/analysis/parseGravityAnalysis.ts` (22 `any`) — done
- [x] Triage `packages/contracts/src/water/waterProfile.ts` (13 `any`) — done
- [x] Triage `packages/contracts/src/auth/meResponse.ts` (10 `any`) — done
- [x] Expand `lint:packages-strict` to include `packages/contracts` — done
- [x] Update this doc's TL;DR table — done
- [x] Verify zero behavior change: 38/38 contracts unit tests pass; all downstream TS error counts (services/api, apps/web, apps/native, packages/ui) identical to pre-change baseline.

**Why this was first:** contracts types are the source of truth for cross-process data (services → apps). Tightening them improves type safety in every downstream consumer.

**Strategy used:** "tighten in place" — replaced `any` with `Record<string, unknown>` (after `isObject` narrowing), used proper return types on helper functions, used named union casts (`WaterCalcDerivationKind`, `NumberFormatUnit`, etc.) instead of `any` for unvalidated string-to-union narrowing. No Zod migration. See the commit (linked from this section after merge) and the discussion in the related session transcript for the full pros/cons of the Zod alternative.

### Phase 2 — `packages/beerjson/**` (~21 `any` warnings)

- [ ] Triage `packages/beerjson/src/index.ts`
- [ ] Expand `lint:packages-strict` to include `packages/beerjson`
- [ ] Update this doc's TL;DR table

### Phase 3 — `services/api/src/routes/**` and `services/api/src/services/**` (~328 `any` warnings)

This is the highest-leverage slice for runtime safety. API request/response shapes are exactly where Zod schemas should be the source of truth.

- [ ] Add a per-route audit checklist (each route's `any` triage)
- [ ] Introduce typed Zod-derived inference helpers if missing
- [ ] Add a new strict gate script `lint:api-routes-strict` once clean
- [ ] Update this doc's TL;DR table

### Phase 4 — `apps/web/app/recipes/**` (~250 `any` warnings)

The recipe edit pages have the highest accumulated `any` debt. Expect Tamagui friction here — coordinate with `docs/TAMAGUI.md`.

- [ ] Phase 4a: `apps/web/app/recipes/[id]/edit/page.tsx` (112 `any`)
- [ ] Phase 4b: water sub-pages (mash/sparge/boil/page) (~115 `any`)
- [ ] Phase 4c: yeast + brew-sessions pages
- [ ] Add `lint:web-recipes-strict` script once clean

### Phase 5 — `apps/native/src/screens/**` (~162 `any` warnings)

Same patterns as Phase 4 but for the React Native side. May land easier or harder depending on how `docs/TAMAGUI.md` migration goes.

- [ ] Phase 5a: `RecipeEditScreen.tsx` (68 `any`)
- [ ] Phase 5b: `YeastScreen.tsx` + remaining screens
- [ ] Add `lint:native-screens-strict` script once clean

### Phase 6 — Mop-up

- [ ] Clean 86 `no-unused-vars` warnings (mostly unused imports — mechanical deletions)
- [ ] Promote `no-unused-vars` from `warn` to `error`
- [ ] Verify no remaining pre-existing warnings outside known carve-outs

### Phase 7 (optional, separate decision) — runtime-validation library migration

This is **not** an ESLint phase per se — it's an architectural decision adjacent to the type-discipline work. Phase 1 surfaced the question ("should `packages/contracts` use Zod / Valibot / TypeBox instead of hand-rolled validators?"). The current decision is **no**, but the question deserves to be tracked rather than forgotten.

- [ ] Re-evaluate when one of the trigger criteria in `docs/CONTRACTS-VALIDATION-STRATEGY.md` is met (new complex contract, OpenAPI requirement, form-validation parity, drift bugs, bundle-size shift, independent route migration).

See `docs/CONTRACTS-VALIDATION-STRATEGY.md` for the full pros/cons, candidate libraries (Zod, Valibot, Arktype, TypeBox), migration mechanics if/when we go, and the decision log.

---

## HIGH-full upgrade

When HIGH-staged is complete (target: Q4 2026 / Q1 2027), the final upgrade is:

- [ ] Promote `@typescript-eslint/no-explicit-any` from `warn` to `error` (project-wide, with surgical per-file disables for the genuine "this is dynamic" cases).
- [ ] Add `@typescript-eslint/recommended-type-checked` with per-glob `parserOptions.project`. This enables ~30 type-aware rules including `no-floating-promises`, `no-misused-promises`, `await-thenable`, `no-unsafe-*`.
- [ ] Triage the new violations (expect 100s–1000s — many will be in Tamagui-adjacent code, see `docs/TAMAGUI.md`).
- [ ] Change `npm run lint` to `npm run lint -- --max-warnings 0`.
- [ ] Update `web-lint.yml` to drop the separate `lint:packages-strict` step (no longer needed — the main lint is strict everywhere).
- [ ] Update this doc to mark HIGH-full as ✅ landed.

The expected output of HIGH-full: 0 warnings repo-wide, every error is real, every PR catches type-safety regressions before merge.

---

## How to run locally

ESLint runs inside a `node:20-slim` container (per the no-npm-on-host policy):

```bash
# From repo root — full repo lint
docker run --rm \
  -v "$PWD:/repo" -w /repo \
  node:20-slim \
  bash -lc "npm install --no-audit --no-fund --workspaces --include-workspace-root && npm run lint"
```

For the strict gate that runs in CI:

```bash
docker run --rm \
  -v "$PWD:/repo" -w /repo \
  node:20-slim \
  bash -lc "npm install --no-audit --no-fund --workspaces --include-workspace-root && npm run lint:packages-strict"
```

For a focused path (much faster iteration):

```bash
docker run --rm \
  -v "$PWD:/repo" -w /repo \
  node:20-slim \
  bash -lc "npm install --no-audit --no-fund --workspaces --include-workspace-root && \
            npx eslint packages/ui/src/ai/"
```

Auto-fix safe issues (mostly unused `eslint-disable` directives):

```bash
docker run --rm \
  -v "$PWD:/repo" -w /repo \
  node:20-slim \
  bash -lc "npm install --no-audit --no-fund --workspaces --include-workspace-root && npm run lint -- --fix"
```

---

## CI

The `.github/workflows/web-lint.yml` workflow runs two ESLint invocations on every PR that touches `apps/web/**`, `apps/native/**`, `packages/**`, `services/api/src/**`, or `eslint.config.mjs`:

1. **`npm run lint`** — full repo. Errors block CI; warnings reported but tolerated.
2. **`npm run lint:packages-strict`** — gated packages (`packages/api-client`, `core`, `i18n`, `i18n-react`, `media`, `navigation`, `recipes-ui`, `test-mcp`, `ui`) with `--max-warnings 0`. Any new warning here blocks merge.

Both run inside a `node:20-slim` container to mirror the CI environment exactly. Adding a new package to the strict gate requires editing the `lint:packages-strict` script in the root `package.json` (see [HIGH-staged roadmap](#high-staged-roadmap) for the per-phase update).

---

## Adding a new rule

1. Decide whether the rule applies project-wide or to a specific glob (e.g. only TSX, only test files, only the AI cross-platform folder). Use a per-glob override in `eslint.config.mjs`.
2. **Land warnings as `warn` first.** Only promote to `error` after all pre-existing violations are fixed, otherwise CI breaks for reasons unrelated to the PR introducing the rule.
3. Document the rule's intent in a comment block in `eslint.config.mjs` — this file is also documentation, and a future contributor needs to understand *why* before they're asked to obey.
4. Update this doc (the value/cost table + TL;DR row at minimum).

### Flat-config gotcha — order matters

`eslint.config.mjs` uses ESLint's flat-config format. **Later blocks override earlier blocks for matching files.** Specifically:

- Project-wide rule tweaks (no `files:` predicate) MUST appear *before* any file-glob override blocks. Otherwise the project-wide rules will re-enable rules that file-glob blocks tried to disable.
- This was a real bug in the Medium-scope landing — the test override (`files: ["**/tests/**"]` → `no-explicit-any: off`) was being overridden by a project-wide block that came after it. Fix landed in HIGH-light.

---

## Silencing a violation

Pre-existing violations should be silenced inline rather than by disabling the rule globally. The required pattern:

```ts
// eslint-disable-next-line <rule-name> -- <brief reason, link to tracking issue/commit/doc if applicable>
const offendingLine = …;
```

The `-- <reason>` is mandatory in this repo — silent `eslint-disable-next-line` directives without a reason are not acceptable and will be asked to be expanded in code review.

**Note:** unused/redundant `eslint-disable-next-line` directives are automatically flagged by ESLint (`reportUnusedDisableDirectives` is enabled in the base config). `npm run lint -- --fix` will remove them.

Where the violation is structurally impossible to fix in the current PR (e.g. would change behavior, requires migrating a dependency), open a tracking issue and reference it in the comment:

```ts
// eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only effect; tracked in #1234.
useEffect(() => { /* ... */ }, []);
```

---

## Tamagui interaction

A large fraction of `any` warnings (and the future-HIGH-full `no-unsafe-*` violations) come from interactions with Tamagui's loose prop types. Before triaging Tamagui-adjacent warnings, read `docs/TAMAGUI.md` for the project's adaptation strategy and known upstream issues. Don't burn time fixing what is fundamentally a Tamagui type-system gap.

---

## Related

- `docs/TAMAGUI.md` — Tamagui type-system caveats and our adaptation strategy.
- `docs/TESTING.md` — test layer map (unit / integration / contract / Playwright). Lint complements but does not replace tests.
- `docs/PLATFORM-ARCHITECTURE.md` — broader architectural context, especially §10.1.1 (go-public path) where public-quality lint hygiene is part of the pre-flip checklist.
- `docs/ROADMAP.md` — milestone alignment; HIGH-full targets Q4 2026 / Q1 2027 alongside the public AGPLv3 flip.
- `packages/ui/README.md` — `@brewery/ui` package overview, including the platform-forking primitives that the cross-platform import guardrail references.
