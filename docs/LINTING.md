# Linting (ESLint)

**Tier:** Public
**Status:** v1.0 — Medium scope landed; HIGH-scope upgrade is **TODO** (see below)
**Audience:** maintainers, contributors, anyone authoring web/native UI code or services

> [!IMPORTANT]
> **TODO — commit to HIGH scope ASAP.**
>
> The current configuration intentionally lands as the **Medium** scope
> below. The agreed plan is to upgrade to **HIGH** as soon as
> pre-existing warnings have been triaged to zero. Owners of this
> upgrade: maintainers. Tracking: this section + `eslint.config.js`
> top-of-file comment.
>
> Concretely, the HIGH upgrade flips:
>
> 1. CI invocation from `npm run lint` to `npm run lint -- --max-warnings 0` (no tolerance for outstanding warnings).
> 2. `react-hooks/exhaustive-deps` from `warn` to `error`.
> 3. Adds `@typescript-eslint/recommended-type-checked` (type-aware lint) — requires per-glob `tsconfig` parserOptions.
> 4. Lowers tolerance for `@typescript-eslint/no-explicit-any` from `warn` to `error` everywhere except test files.

## Why ESLint exists in this repo

For a TypeScript + React + React Native monorepo headed for a public
AGPLv3 release, lint coverage is a maturity expectation. TypeScript
catches a large class of bugs, but ESLint catches a complementary
class that TypeScript will never see — most importantly,
**`react-hooks/exhaustive-deps`** (stale-closure bugs) and
**`jsx-a11y/*`** (accessibility regressions at the source level,
complementing the axe-core checks in the Playwright smoke suite).

A specific guardrail also lives here: cross-platform components in
`packages/ui/src/{ai,charts}/**` MUST NOT import `Button`/`Input`/
`BrewCheckbox` directly from `tamagui`. They MUST import the
platform-forking wrappers from `packages/ui/src/primitives/*`. Raw
Tamagui leaks React Native a11y props (`accessibilityLabel`,
`accessibilityRole`) to the DOM on web, triggering React warnings.
This guardrail is enforced via `no-restricted-imports` and the
underlying bug is documented in commit
`221b193` (postmortem of `715bbea` / `d47f35a`).

## Scope tiers

This is the value/cost matrix that informed the current Medium-scope
landing and the planned HIGH upgrade. Keep this table updated as
project priorities shift.

| Scope | Effort | Value | Status |
|---|---|---|---|
| **Minimal** — only `no-restricted-imports` scoped to cross-platform UI folders. | Low (one config + one rule). | Low–medium: only catches the one bug class. Doesn't earn its tooling overhead. | Rejected as the lone scope. |
| **Medium** — full base preset (TS-recommended + React-Hooks + jsx-a11y + import) with per-glob overrides; `no-restricted-imports` on cross-platform UI; `react-hooks/exhaustive-deps` set to `warn` to land green. | Medium (one config + ~5 plugins + light cleanup of pre-existing warnings). | **High** — catches a real class of React bugs TypeScript misses, formalizes a11y, prevents future drift. | ✅ **Landed.** |
| **HIGH** — Medium + `--max-warnings 0` in CI + type-aware lint (`@typescript-eslint/recommended-type-checked`) + `react-hooks/exhaustive-deps` as `error`. | High (many pre-existing violations to triage). | Highest — production-grade lint hygiene; signals maturity to public contributors. | 🚧 **TODO — commit to upgrade ASAP.** See the TODO callout at top. |

## How to run locally

ESLint runs inside a `node:20-slim` container (per the no-npm-on-host
policy):

```bash
# From repo root
docker run --rm \
  -v "$PWD:/repo" -w /repo \
  node:20-slim \
  bash -lc "npm install --no-audit --no-fund --workspaces --include-workspace-root && npm run lint"
```

Or against a focused path:

```bash
docker run --rm \
  -v "$PWD:/repo" -w /repo \
  node:20-slim \
  bash -lc "npm install --no-audit --no-fund --workspaces --include-workspace-root && \
            npx eslint packages/ui/src/ai/"
```

## CI

The `.github/workflows/web-lint.yml` workflow runs the lint job
path-gated on changes under `apps/web/**`, `apps/native/**`,
`packages/**`, `services/api/src/**`, or `eslint.config.js` itself.

It mirrors the shape of `.github/workflows/api.yml` exactly so the
two are easy to maintain in lockstep:
- `node:20-slim` container
- workspaces install with `--no-audit --no-fund`
- single `npm run lint` invocation

When the HIGH upgrade lands, the only workflow change required is
appending `-- --max-warnings 0` to the `npm run lint` invocation.

## Adding a new rule

1. Decide whether the rule applies project-wide or to a specific
   glob (e.g. only TSX, only test files, only the AI cross-platform
   folder). Use a per-glob override in `eslint.config.js`.
2. **Land warnings as `warn` first.** Only promote to `error` after
   all pre-existing violations are fixed, otherwise CI breaks for
   reasons unrelated to the PR introducing the rule.
3. Document the rule's intent in a comment block in
   `eslint.config.mjs` — this file is also documentation, and a
   future contributor needs to understand *why* before they're asked
   to obey.
4. Update this doc (the value/cost table at minimum).

## Silencing a violation

Pre-existing violations should be silenced inline rather than by
disabling the rule globally. The required pattern:

```ts
// eslint-disable-next-line <rule-name> -- <brief reason, link to tracking issue/commit if applicable>
const offendingLine = …;
```

The `-- <reason>` is mandatory in this repo — silent
`eslint-disable-next-line` directives without a reason are not
acceptable and will be asked to be expanded in code review.

## Related

- `docs/TESTING.md` — test layer map (unit / integration / contract /
  Playwright). Lint complements but does not replace tests.
- `docs/PLATFORM-ARCHITECTURE.md` — the broader architectural
  context, especially §10.1.1 (go-public path) where public-quality
  lint hygiene is part of the pre-flip checklist.
- `packages/ui/README.md` — `@brewery/ui` package overview, including
  the platform-forking primitives that the cross-platform import
  guardrail above references.
