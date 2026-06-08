# Verification tiers (T0 / T1 / T2)

**Tier:** Public  
**Status:** v1 — partitioned verification shipped 2026-05-31  
**Audience:** contributors, maintainers, AI agents  
**Related:** [`docs/TESTING.md`](TESTING.md), [`docs/CI-PARITY.md`](CI-PARITY.md), [`DEVELOPMENT.md`](../DEVELOPMENT.md)

## Why tiers exist

The monorepo already defines **L1–L6 test layers** and a **ci-parity gate**, but day-to-day work often triggered the heaviest path anyway: full `npm ci`, full `build:packages`, and API `test:db:prepare` on every run. Verification tiers map **what you changed** to **minimum effective proof**.

| Tier | Goal | When | Must not do |
|------|------|------|-------------|
| **T0** | Fast feedback while editing | Every save / agent iteration | Root `npm ci`; full `build:packages`; full API suite |
| **T1** | Replicable proof for a PR theme | Before commit / agent handoff | Full monorepo dist rebuild unless diff requires it |
| **T2** | CI-equivalent | Before push | Host npm; live bind-mount as sole proof |

## One-command entry points

From repo root:

| Command | Tier | Purpose |
|---------|------|---------|
| `npm run verify:contracts` | T1 | Contracts dist + unit tests |
| `npm run verify:openapi` | T1 | OpenAPI artifact + scoped API tests |
| `npm run verify:api-platform` | T1 | Auth/workspaces routes + health check |
| `npm run verify:from-diff` | T1 | Auto-select slice(s) from diff vs `main` |
| `npm run verify:pre-push` | T2-PR | Path-aware ci-parity (parallel + archive on clean tree) + auto native companions (API vitest, expo-doctor when triggered) — **default before push** |
| `npm run verify:pre-push:release` | T2-release | Full sequential ci-parity manifest — SDK tags, manifest/pin changes |
| `npm run validate:gha-triggers` | — | Drift check: `.umbraculum/gha-trigger-map.json` vs GHA workflow `paths:` |

### Pre-push commands reference (contributors and agents)

Commit first; working tree must be clean for archive replay.

```bash
npm run verify:pre-push              # T2-PR — default before every push
npm run verify:pre-push:release      # T2-release — manifest / SDK tags / ci-parity pins
npm run validate:gha-triggers        # drift check (also runs in ci-parity-validate GHA)
python3 scripts/lib/verify-slice.py --repo-root . resolve-gha-triggers --base origin/master
```

WIP only (not push proof): `./scripts/ci-parity-check.sh run`. Full detail: [`docs/CI-PARITY.md`](CI-PARITY.md) § Pre-push commands reference. Agents: skill `path-aware-pre-push`.

Lower-level drivers:

```bash
./scripts/verify-slice.sh --tier T0 --slice openapi
./scripts/verify-slice.sh --tier T1 --from-diff main
./scripts/build-package-in-docker.sh @umbraculum/contracts --include-dependents
./scripts/check-packages-dist-up-to-date.sh          # scoped (default)
./scripts/check-packages-dist-up-to-date.sh --all    # SDK / release gate
```

Slice definitions live in [`.umbraculum/verification-slices.json`](../.umbraculum/verification-slices.json). Package build order and dependents live in [`.umbraculum/package-build-graph.json`](../.umbraculum/package-build-graph.json).

## Change-surface matrix

| You touched | T0 | T1 | T2 |
|-------------|----|----|-----|
| `packages/platform/contracts/src/**` | `npm test -w @umbraculum/contracts` (scoped container) | `npm run verify:contracts` | `./scripts/ci-parity-check.sh run --jobs typecheck` |
| API routes + OpenAPI | `docker compose exec api npm run test:unit` | `npm run verify:openapi` | ci-parity (`--ci`) + **`api-integration-tests-pre-push`** skill |
| `apps/native/**`, `native-shell`, root `overrides` | — | `./scripts/check-native-expo-doctor.sh` (WIP) | **`native-expo-doctor-pre-push`** skill (or `verify:pre-push` when `native-deps` paths match) |
| `services/api/src/routes/auth.ts`, `workspaces.ts` | scoped vitest | `npm run verify:api-platform` | T2 row above |
| Brewery batch routes | scoped vitest files | `./scripts/verify-slice.sh --tier T1 --slice api-brewery-batch1` | T2 row above |
| Docs / README only | — | `./scripts/ci-parity-check.sh run --jobs docs-readmes` | `npm run verify:pre-push` (typically `docs-readmes` only) |
| `docs-site/**` (pages, sidebars, static OpenAPI mirror) | — | `./scripts/verify-slice.sh --tier T1 --slice docs-site` | `npm run verify:pre-push` when `docs-site-build` paths match |
| SDK / multi-package dist | — | `./scripts/check-packages-dist-up-to-date.sh` | `npm run verify:pre-push:release` (`sdk-publish-prep` job) |
| Unknown mixed diff | — | `npm run verify:from-diff` | `npm run verify:pre-push` |
| SOLID hygiene / refactor PRs | scoped typecheck | `./scripts/verify-slice.sh --tier T1` as needed | `npm run verify:pre-push` — **D enforcement** (B5/WS5/WS6) via `lint` job when eslint surface changes; program closed — [solid-post-wave17-closure.md](design/solid-post-wave17-closure.md) §4–§8, [AGENTS.md](../AGENTS.md) § SOLID and dependency direction (D) |

**Hard rule:** T0/T1 never run root `npm ci` unless the lockfile changed or you pass `--fresh` to `build-package-in-docker.sh`.

**Install persistence:** Named Docker volumes (`umbraculum_npm_cache`, `umbraculum_root_node_modules`, service-specific `node_modules` volumes) keep warm trees between runs — Composer-`vendor/` analogue. See [`DEVELOPMENT-NPM-VOLUMES.md`](DEVELOPMENT-NPM-VOLUMES.md). L1 one-shots use `./scripts/docker-npm-run.sh -r`, not bare `docker run … npm install`.

## Relationship to TESTING.md layers

| Layer | Typical tier |
|-------|----------------|
| L1 unit | T0 |
| L2 API integration (scoped) | T1 |
| L4 contract snapshots | T1 when contracts change |
| L3 smoke | T1 optional for route/UI work |
| ci-parity (docs/lint/typecheck/openapi-check) | T2 |
| GHA `docs-site-build` (`npm run build -w @umbraculum/docs-site`) | T1 when `docs-site/**` changes |
| GHA `api.yml` (full vitest) | T2 via **`api-integration-tests-pre-push`** skill |
| L5/L6 E2E | On demand only |

## API test split

Inside the `api` container:

```bash
docker compose exec api npm run test:unit          # no DB migrate reset (openapi, entitlements, …)
docker compose exec api npm run test:integration  # full suite (CI-equivalent)
docker compose exec api npm test                  # alias for test:integration
```

## Agent skills (toolset)

| Skill | Tier |
|-------|------|
| `verify-slice-runbook` | T0/T1 driver |
| `docker-npm-volumes-runbook` | Warm cache + named volumes for one-shots |
| `scoped-package-build-in-docker` | Package `dist/` rebuild |
| `build-workspace-packages-dist-in-container` | Legacy full build fallback |
| `ci-parity-local-reproduction` | T2 static analysis (T2-PR / T2-release) |
| `path-aware-pre-push` | T2-PR default pre-push procedure |
| `api-integration-tests-pre-push` | T2 API vitest (auto-run from T2-PR when `api.yml` paths match) |

See [`docs/CURSOR-PLUGINS.md`](CURSOR-PLUGINS.md) for install paths.

## Anti-patterns

- Running bare `npx @umbraculum/ci-parity` before push without `--ci` — tests **committed HEAD only** and skips uncommitted edits. Use `./scripts/ci-parity-check.sh run` instead ([`CI-PARITY.md`](CI-PARITY.md) §Snapshot modes).
- Running `./scripts/build-packages-in-docker.sh` for a single-package edit — use `./scripts/build-package-in-docker.sh @umbraculum/<name>` instead.
- Treating `docker compose exec api npm run typecheck` as pre-push proof — use ci-parity (T2).
- Running full sequential ci-parity on every UI-only push — use **`npm run verify:pre-push`** (T2-PR) instead of `./scripts/ci-parity-check.sh --archive run` without `--jobs`.
- Running bare `docker run … npm install` without cache/root volumes — use [`./scripts/docker-npm-run.sh`](../scripts/docker-npm-run.sh) (see [`DEVELOPMENT-NPM-VOLUMES.md`](DEVELOPMENT-NPM-VOLUMES.md)).
