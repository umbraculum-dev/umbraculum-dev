# CI parity (`@umbraculum/ci-parity`)

**Tier:** Public  
**Status:** v1 — manifest-driven parity gate shipped 2026-05-29  
**Audience:** contributors, maintainers, AI agents  
**Owners:** maintainers  
**Related:** [`docs/TYPING.md`](TYPING.md), [`docs/LINTING.md`](LINTING.md), [`docs/DOCS-README-STANDARDS.md`](DOCS-README-STANDARDS.md), [`DEVELOPMENT.md`](../DEVELOPMENT.md), [`AGENTS.md`](../AGENTS.md)

## One-command contract

From the repo root (host needs `git`, Docker, and Node to launch the CLI — **not** host Node/npm for job execution):

```bash
./scripts/ci-parity-check.sh run
# or subset:
./scripts/ci-parity-check.sh run --jobs lint,typecheck
```

Backward-compatible wrapper (same behavior):

```bash
./scripts/ci-parity-check.sh
```

Direct CLI (must pass `--ci` for working-tree verification; use `--` before `run` with `npm exec`):

```bash
npm exec --yes @umbraculum/ci-parity@^1 -- run --ci --jobs lint,typecheck
```

The repo wrapper sets `PATH` for system Node and passes `--ci` by default — **agents must use `./scripts/ci-parity-check.sh`**, not bare `npx @umbraculum/ci-parity` (Cursor AppImage `npx` can ENOENT before jobs run). Prefer `./scripts/ci-parity-check.sh run`.

Other commands:

| Command | Purpose |
|---------|---------|
| `npx @umbraculum/ci-parity explain` | Print job graph + install phases from the manifest |
| `npx @umbraculum/ci-parity validate` | Schema + filesystem checks |
| `npx @umbraculum/ci-parity validate --strict` | Also fail on undocumented nested `package.json` dirs |
| `npx @umbraculum/ci-parity run --jobs lint,typecheck` | Subset of jobs |

| `--sha <ref>`, `--keep` | Retain logs; `--sha` selects a **git-archive** replay at `<ref>` (committed tree only) |
| `--ci` | Mount the live checkout (includes uncommitted edits). **Default via `./scripts/ci-parity-check.sh`.** |
| `--archive` | Wrapper-only: force `git archive` snapshot (omit `--ci`). Use when replaying a specific commit or debugging archive-only drift. |

**Snapshot modes (agents: read before push):**

| Mode | Command | What gets tested | When to use |
|------|---------|------------------|-------------|
| **Git archive (pre-push gate)** | `npm run verify:pre-push` or `./scripts/ci-parity-check.sh --archive run` | Committed tree at `HEAD` — cold `npm ci`, no warm-volume drift | **Agent mandatory before push** — after commit, clean working tree |
| **Working tree (WIP only)** | `./scripts/ci-parity-check.sh run` or `… run --ci` | Checkout on disk — **includes uncommitted edits** | Fast iteration during edits — **not** sufficient push proof alone |
| **Replay a ref** | `… run --sha <ref>` or `--archive` at a specific SHA | Tracked files at `<ref>` | Reproducing a historical CI failure |
| **GHA checkout** | `npx @umbraculum/ci-parity run --ci` in Actions | Checked-out branch (fresh runner, cold install) | CI job body |

**Common agent mistakes:**

- Pushing without running **`--archive`** (or `verify:pre-push` on a clean tree) after commit.
- Treating `--ci` green as push proof while fixes are still uncommitted — GHA runs committed code.
- Delegating pre-push to the operator ("run this before you push") — agents run T2 themselves per [`AGENTS.md`](../AGENTS.md) §Pre-push CI parity.
- Invoking bare **`npx @umbraculum/ci-parity`** from Cursor/agent shells on Linux — use **`./scripts/ci-parity-check.sh`** (wrapper fixes `PATH`; bare `npx` often fails with ENOENT and gives a false "can't verify" signal).

**Ephemeral files:** `--ci` writes `.ci-parity-*.log` and `.ci-parity-run.sh` at the repo root (gitignored). Safe to delete after a run.

Stable agent output line:

```
CI-PARITY-CHECK <short-sha>: docs-readmes=OK lint=OK typecheck=OK
```

## Fast loop vs parity gate (T0 / T1 / T2)

| Tier | When | Command |
|------|------|---------|
| **T0 — scoped** | Tight edit loop | `docker compose exec api npm run test:unit`, scoped L1 installs — see [`docs/VERIFICATION-TIERS.md`](VERIFICATION-TIERS.md) |
| **T1 — slice** | Before commit / agent handoff | `npm run verify:from-diff` or a named `npm run verify:*` script |
| **T2 — parity** | Agent runs before every push with non-trivial CI surface | `npm run verify:pre-push` (archive on clean tree) or `./scripts/ci-parity-check.sh --archive run` |

Dev-container checks use a different `node_modules` layout than CI (hoisting splits). **Never treat dev-container green as proof CI will pass.**

Full tier matrix: [`docs/VERIFICATION-TIERS.md`](VERIFICATION-TIERS.md).

## Cross-platform contract (agents and contributors)

`@umbraculum/ci-parity` exists so **pre-push verification is OS-neutral**: Linux, macOS, and Windows (Docker Desktop + `npx`). The CLI runs manifest jobs inside `node:20-slim`. **Agent pre-push uses `--archive`** (committed tree, cold install); **`--ci`** is for WIP iteration only — see [Snapshot modes](#snapshot-modes-read-this-before-pre-push) below.

| Layer | Role |
|-------|------|
| **Host** | `git`, Docker, Node — launch via **`./scripts/ci-parity-check.sh`** or **`npm run verify:pre-push`** (not bare `npx` in Cursor agent shells) |
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

The parity runner uses either a **live checkout mount (`--ci`)** for local pre-push or a **`git archive` snapshot** when replaying a specific ref. Both use the same `node:20-slim` image + install commands as CI. See [Snapshot modes](#snapshot-modes-read-this-before-pre-push).

**Local install persistence (≥ `@umbraculum/ci-parity` 1.0.8):** the manifest may declare `docker.volumes` — umbraculum-dev mounts `umbraculum_npm_cache` and `umbraculum_root_node_modules` so repeat local parity runs reuse warm cache/trees on the same Docker host. See [`DEVELOPMENT-NPM-VOLUMES.md`](DEVELOPMENT-NPM-VOLUMES.md). GitHub Actions runners remain cold per job.

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
| Where does `publish-ci-parity` run? | **umbraculum-toolset** → Actions (npm publish on `ci-parity-v*` tags only — **not** laptop `npm publish`; agents: [`AGENTS.md`](../AGENTS.md) § "npm publish discipline") |
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
| `dogfood-npm-smoke` | `.github/workflows/dogfood-npm-smoke.yml` | Registry install of `@umbraculum/contracts` + `@umbraculum/api-client` outside monorepo (`scripts/dogfood-npm-smoke.sh`) |

**Outside ci-parity (needs live stack):**

| Workflow | Purpose |
|----------|---------|
| [`integrator-live-smoke.yml`](../.github/workflows/integrator-live-smoke.yml) | Docker Compose + `seed:e2e` + cookie (`integrator-api-smoke.sh`) + bearer npm (`integrator-bearer-npm-smoke.sh`) |

**Excluded from typecheck gate (explicit):** `apps/web`, `packages/ui` (Tamagui accepted-cost class — see [`docs/TAMAGUI.md`](TAMAGUI.md)).

**Before adding a manifest job id that requires a new `@umbraculum/ci-parity` release:** follow **[`AGENTS.md`](../AGENTS.md) § ci-parity manifest / version changes** (agent-owned checklist — not optional). Summary: toolset tag publish first → bump **every** `ci_parity_version` + `CI_PARITY_PKG_VERSION` in one commit → `./scripts/ci-parity-check.sh --archive run --jobs lint,typecheck` before push.

**Local vs GHA version skew (2026-06-02 lesson):** GHA uses an **exact** `ci_parity_version` per workflow. `scripts/ci-parity-check.sh` pins the same version (`CI_PARITY_PKG_VERSION`, default `1.0.9`) — do not use bare `@^1` or a built toolset `dist/cli.js` as pre-push proof. When you publish a new `@umbraculum/ci-parity`, bump **every** pin in the AGENTS.md table **and** `CI_PARITY_PKG_VERSION` in the **same commit** as manifest job-id changes.

**Before `sdk-batch-v*` or `sdk-contracts-v*` tag push:** `./scripts/ci-parity-check.sh run --jobs docs-readmes,sdk-publish-prep,dogfood-npm-smoke` (or full ci-parity).

## Adding a typecheck-gated workspace

1. Ensure the workspace typechecks clean under hoisted root `npm ci --workspaces`.
2. Add an entry to `jobs[].workspaces` in `.umbraculum/ci-parity.json` (`mode`: `npm` or `tsc` for tsconfig-only dirs).
3. Update `.github/workflows/typecheck.yml` path filters if needed (workflow delegates to `@umbraculum/ci-parity` but keeps path triggers).
4. Run `./scripts/ci-parity-check.sh run --jobs typecheck` (not bare `npx`).
5. Run `./scripts/ci-parity-check.sh validate --strict` or `npx @umbraculum/ci-parity@<CI_PARITY_PKG_VERSION> validate --strict`.

## Sister-repo adoption (sketch)

1. Add `.umbraculum/ci-parity.json` with appropriate `profile` (`ts-npm-monorepo` today; `python` etc. later).
2. Vendor or call reusable workflow: copy `ci-parity-reusable.yml` from toolset into `.github/workflows/` (umbraculum-dev uses a local copy to avoid cross-repo GHA access policy), or pin `uses: org/toolset/.github/workflows/ci-parity-reusable.yml@ci-parity-v*` if org Actions sharing is enabled.
3. Pin `@umbraculum/ci-parity` via `ci_parity_version` on callers (today `1.0.9`).
4. Document the one-liner in that repo's `DEVELOPMENT.md`.

## npm package

Published as **`@umbraculum/ci-parity`** (MIT). Publish runbook: [`docs/design/ci-parity-npm-publish.md`](design/ci-parity-npm-publish.md). **OIDC (no token rotation):** [`docs/design/ci-parity-npm-trusted-publishing.md`](design/ci-parity-npm-trusted-publishing.md).

Interim escape hatch if npm is unavailable: `npx github:umbraculum-dev/umbraculum-toolset#ci-parity-v1.0.8 -- packages/ci-parity` (not for CI — publish first).
