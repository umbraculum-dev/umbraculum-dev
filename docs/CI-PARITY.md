# CI parity (`@umbraculum/ci-parity`)

**Tier:** Public  
**Status:** v1 — manifest-driven parity gate shipped 2026-05-29  
**Audience:** contributors, maintainers, AI agents  
**Owners:** maintainers  
**Related:** [`docs/TYPING.md`](TYPING.md), [`docs/LINTING.md`](LINTING.md), [`docs/DOCS-README-STANDARDS.md`](DOCS-README-STANDARDS.md), [`DEVELOPMENT.md`](../DEVELOPMENT.md), [`AGENTS.md`](../AGENTS.md)

## One-command contract

From the repo root (host needs `git`, Docker, and Node to launch the CLI — **not** host Node/npm for job execution):

```bash
npx @umbraculum/ci-parity
```

Backward-compatible wrapper (same behavior):

```bash
./scripts/ci-parity-check.sh
```

Other commands:

| Command | Purpose |
|---------|---------|
| `npx @umbraculum/ci-parity explain` | Print job graph + install phases from the manifest |
| `npx @umbraculum/ci-parity validate` | Schema + filesystem checks |
| `npx @umbraculum/ci-parity validate --strict` | Also fail on undocumented nested `package.json` dirs |
| `npx @umbraculum/ci-parity run --jobs lint,typecheck` | Subset of jobs |

Flags: `--sha <rev>`, `--keep` (retain `/tmp/ci-parity-*` snapshot + logs).

Stable agent output line:

```
CI-PARITY-CHECK <short-sha>: docs-readmes=OK lint=OK typecheck=OK
```

## Fast loop vs parity gate (T0 / T1 / T2)

| Tier | When | Command |
|------|------|---------|
| **T0 — scoped** | Tight edit loop | `docker compose exec api npm run test:unit`, scoped L1 installs — see [`docs/VERIFICATION-TIERS.md`](VERIFICATION-TIERS.md) |
| **T1 — slice** | Before commit / agent handoff | `npm run verify:from-diff` or a named `npm run verify:*` script |
| **T2 — parity** | Before every push with non-trivial CI surface | `npm run verify:pre-push` or `npx @umbraculum/ci-parity` |

Dev-container checks use a different `node_modules` layout than CI (hoisting splits). **Never treat dev-container green as proof CI will pass.**

Full tier matrix: [`docs/VERIFICATION-TIERS.md`](VERIFICATION-TIERS.md).

## Cross-platform contract (agents and contributors)

`@umbraculum/ci-parity` exists so **pre-push verification is OS-neutral**: Linux, macOS, and Windows (Docker Desktop + `npx`). The CLI archives tracked files and runs manifest jobs inside `node:20-slim` — the same shape as GHA static-analysis jobs.

| Layer | Role |
|-------|------|
| **Host** | `git`, Docker, Node (launch `npx @umbraculum/ci-parity` only) |
| **Container** | `npm ci`, `npm run lint`, `python3 scripts/docs/…`, per `.umbraculum/ci-parity.json` |

**Not pre-push proof (debug / fast loop only):**

- Host `python3`, host `npm`, host `bash ./scripts/…` (Unix-only; skips clean snapshot)
- `docker compose exec …` on the live bind-mounted tree
- Ad-hoc `docker run -v $PWD:/repo …` mounting the **live** workspace (mechanism 3)

**When adding a GHA workflow:** register its verify commands as a **ci-parity job** in `.umbraculum/ci-parity.json`. One command list for local + CI; no parallel host-only bash scripts.

**When GHA is still required:** OIDC npm publish, tag-only deploys, secrets, first-time trusted-publisher setup — run ci-parity first, then trigger GHA.

Agent rule (toolset): `72-ci-parity-local-vs-ci-divergence.mdc` § Agent anti-patterns.

## Four divergence mechanisms

Local static-analysis can lie in four documented ways:

| # | Mechanism | Symptom |
|---|-----------|---------|
| 1 | Gitignored cross-references | Tracked README link 404s in CI |
| 2 | Nested-workspace install drift | `TS2307` for devDeps in workspaces not installed by root `npm ci --workspaces` (today: `apps/web/e2e`) |
| 3 | Stale `node_modules` bind-mount | Rules/types differ when mounting live tree vs clean snapshot |
| 4 | Workspace hoisting splits | Plugin augmentations missing under hoisted CI install |

The parity runner uses a **`git archive` snapshot** locally (not the live workspace) and the same `node:20-slim` image + install commands as CI.

Historical detail: [`docs/design/brewery-scope-migration-plan.md`](design/brewery-scope-migration-plan.md) §6.7.

## Repository split (why toolset vs umbraculum-dev)

CI for **this** monorepo is still **owned by umbraculum-dev**. The toolset repo supplies a **shared runner** so install topology is not copy-pasted into every sister repo.

```
umbraculum-dev                          umbraculum-toolset
─────────────────                       ────────────────────
.umbraculum/ci-parity.json    ───────►  packages/ci-parity (npm CLI)
.github/workflows/ci-parity-reusable.yml  (vendored copy; canonical in toolset)
.github/workflows/{typecheck,web-lint,docs-readmes}.yml
scripts/ci-parity-check.sh              cursor-plugins/ (rules/skills only)
docs/CI-PARITY.md
```

| Question | Answer |
|----------|--------|
| Where do I edit which jobs run? | `.umbraculum/ci-parity.json` in **umbraculum-dev** |
| Where do I see `typecheck` / `lint` CI on PRs? | **umbraculum-dev** → Actions tab |
| Where does `publish-ci-parity` run? | **umbraculum-toolset** → Actions (npm publish on `ci-parity-v*` tags only) |
| Did we break Cursor plugins? | No — `packages/ci-parity/` is a **sibling** of `cursor-plugins/`, not inside it |

Full publish runbook: [`docs/design/ci-parity-npm-publish.md`](design/ci-parity-npm-publish.md). OIDC trusted publishing setup, troubleshooting, and execution log: [`docs/design/ci-parity-npm-trusted-publishing.md`](design/ci-parity-npm-trusted-publishing.md).

## Manifest (source of truth)

Path: [`.umbraculum/ci-parity.json`](../.umbraculum/ci-parity.json)

Edit the manifest when:

- Adding a typecheck-gated workspace
- Adding a nested workspace that needs its own `npm ci`
- Changing docs-readmes, lint, or typecheck commands to match CI

After editing: `npx @umbraculum/ci-parity validate --strict`

JSON Schema (published with the npm package): `@umbraculum/ci-parity/schema/ci-parity-v1.schema.json`

Implementation package: [`umbraculum-toolset` `packages/ci-parity`](https://github.com/umbraculum-dev/umbraculum-toolset/tree/master/packages/ci-parity)

## Jobs (current)

| Job id | CI workflow | What it runs |
|--------|-------------|--------------|
| `docs-readmes` | `.github/workflows/docs-readmes.yml` | Three Python doc checkers |
| `lint` | `.github/workflows/web-lint.yml` | `npm run lint` after root `npm ci` |
| `typecheck` | `.github/workflows/typecheck.yml` | 15 workspaces + nested `apps/web/e2e` install |
| `sdk-publish-prep` | `.github/workflows/publish-sdk-batch.yml` (verify steps only; OIDC publish is GHA-only) | `build:packages`, `test:packages`, batch workspace tests, `npm pack --dry-run` for seven MIT SDK packages |

**Excluded from typecheck gate (explicit):** `apps/web`, `packages/ui` (Tamagui accepted-cost class — see [`docs/TAMAGUI.md`](TAMAGUI.md)).

**Before `sdk-batch-v*` tag push:** `npx @umbraculum/ci-parity run --jobs docs-readmes,sdk-publish-prep` (or full `npx @umbraculum/ci-parity`).

## Adding a typecheck-gated workspace

1. Ensure the workspace typechecks clean under hoisted root `npm ci --workspaces`.
2. Add an entry to `jobs[].workspaces` in `.umbraculum/ci-parity.json` (`mode`: `npm` or `tsc` for tsconfig-only dirs).
3. Update `.github/workflows/typecheck.yml` path filters if needed (workflow delegates to `@umbraculum/ci-parity` but keeps path triggers).
4. Run `npx @umbraculum/ci-parity run --jobs typecheck`.
5. Run `npx @umbraculum/ci-parity validate --strict`.

## Sister-repo adoption (sketch)

1. Add `.umbraculum/ci-parity.json` with appropriate `profile` (`ts-npm-monorepo` today; `python` etc. later).
2. Vendor or call reusable workflow: copy `ci-parity-reusable.yml` from toolset into `.github/workflows/` (umbraculum-dev uses a local copy to avoid cross-repo GHA access policy), or pin `uses: org/toolset/.github/workflows/ci-parity-reusable.yml@ci-parity-v*` if org Actions sharing is enabled.
3. Pin `@umbraculum/ci-parity` via `ci_parity_version` on callers (today `1.0.7`).
4. Document the one-liner in that repo's `DEVELOPMENT.md`.

## npm package

Published as **`@umbraculum/ci-parity`** (MIT). Publish runbook: [`docs/design/ci-parity-npm-publish.md`](design/ci-parity-npm-publish.md). **OIDC (no token rotation):** [`docs/design/ci-parity-npm-trusted-publishing.md`](design/ci-parity-npm-trusted-publishing.md).

Interim escape hatch if npm is unavailable: `npx github:umbraculum-dev/umbraculum-toolset#ci-parity-v1.0.7 -- packages/ci-parity` (not for CI — publish first).
