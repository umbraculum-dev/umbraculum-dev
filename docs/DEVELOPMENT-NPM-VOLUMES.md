# npm install persistence — named volumes and cache (Composer-like dev loop)

**Tier:** Public  
**Status:** v1 — shipped 2026-06-01  
**Audience:** contributors, maintainers, AI agents  
**Related:** [`DEVELOPMENT.md`](../DEVELOPMENT.md), [`docs/VERIFICATION-TIERS.md`](VERIFICATION-TIERS.md), [`docs/CI-PARITY.md`](CI-PARITY.md), [`docs/TESTING.md`](TESTING.md), [`docker-compose.yml`](../docker-compose.yml)

---

## Problem this solves

Magento-style **`composer install`** on a warm machine mostly extracts tarballs from `~/.composer/cache` into a persistent **`vendor/`** tree. Tests do not reinstall on every run.

In this monorepo, slow installs usually came from:

1. **Ephemeral Docker one-shots** (`docker run --rm … npm ci`) — container filesystem and `/root/.npm` discarded after each run.
2. **`api` bind-mounted `./services/api/node_modules`** — easy to corrupt, prune, or root-own on the host; unlike `web` / `docs-site`, it was not a named volume.
3. **Full monorepo scope** — ~3 100 lockfile packages when only one workspace was needed.

The fix is **not** “run npm on the host.” It is **Composer-like persistence inside Docker**, portable on **Linux and macOS** (Docker Desktop), without `$HOME` path assumptions.

---

## Mental model

| Composer | Umbraculum (this doc) |
|----------|------------------------|
| `vendor/` on disk | **Named Docker volume** at service `node_modules` (e.g. `umbraculum_api_node_modules` → `/app/node_modules`) |
| `~/.composer/cache` | **Named Docker volume** `umbraculum_npm_cache` → `/root/.npm` |
| Reinstall when `composer.lock` changes | Reinstall when `package-lock.json` changes (`npm ci` or `npm install` in the affected volume) |
| PHPUnit without reinstall | `vitest` / `tsc` against existing volume — **no install per test** |

We use **named volumes**, not bind mounts of `$HOME/.npm`, so:

- Same compose file on Linux and Mac (no `/home/…` vs `/Users/…`).
- No root-owned cache files on the host.
- Install trees stay **outside** the git bind mount (repo stays clean).

---

## Canonical volume names

All use explicit `name:` in [`docker-compose.yml`](../docker-compose.yml) so folder renames do not orphan data (same discipline as `umbraculum_pgdata`).

| Docker volume name | Mount point | Role |
|--------------------|-------------|------|
| `umbraculum_npm_cache` | `/root/.npm` | Shared npm download cache (all Node services + one-shots) |
| `umbraculum_api_node_modules` | `/app/node_modules` | API service install tree |
| `umbraculum_web_node_modules` | `/app/node_modules` | Web (Next.js) install tree |
| `umbraculum_docs_site_root_node_modules` | `/repo/node_modules` | Docs-site workspace root hoist |
| `umbraculum_docs_site_node_modules` | `/repo/docs-site/node_modules` | Docs-site package |
| `umbraculum_root_node_modules` | `/repo/node_modules` | Monorepo root hoist for **one-shots**, ci-parity, scoped/full package builds |

Constants and mount arrays: [`scripts/lib/docker-npm-volumes.sh`](../scripts/lib/docker-npm-volumes.sh).

**Legacy:** `brewery_app_root_node_modules` was the pre-rename name for root hoist in `build-package-in-docker.sh`. New work uses `umbraculum_root_node_modules`. If you still have the old volume, either remove it (`docker volume rm brewery_app_root_node_modules`) or keep it unused — first run on the new name re-warms once.

---

## Where persistence is wired

### Long-running dev stack (`docker compose`)

| Service | `node_modules` volume | npm cache volume | Startup install |
|---------|----------------------|------------------|-----------------|
| `api` | `umbraculum_api_node_modules` | yes | `npm install --prefer-offline …` |
| `web` | `umbraculum_web_node_modules` | yes | same |
| `docs-site` | root + docs-site volumes | yes | skip-if-ready install + `npm run start` (see compose) |
| `beerproto-sync` | shares `api_node_modules` | yes | same as api |

After **`package-lock.json` changes**, refresh the affected service once:

```bash
docker compose exec -T api sh -c 'cd /app && npm install --no-audit --no-fund --prefer-offline'
# or, for a clean lockfile sync:
docker compose exec -T api sh -c 'cd /app && npm ci --no-audit --no-fund --prefer-offline'
```

Then **`docker compose restart api`** if tsx watch registered stale imports (rule 51).

### One-shot containers (T0/T1 slices, package tests)

Use the wrapper — do not hand-roll `docker run`:

```bash
./scripts/docker-npm-run.sh -r \
  'npm install --no-audit --no-fund --prefer-offline -w @umbraculum/contracts --include-workspace-root && npm test -w @umbraculum/contracts'
```

| Flag | Meaning |
|------|---------|
| `-r` | Mount `umbraculum_root_node_modules` at `/repo/node_modules` |
| `-w REL` | Working directory under `/repo` (e.g. `-w apps/native`) |

Always mounts `umbraculum_npm_cache` → `/root/.npm`.

Verification slices in [`.umbraculum/verification-slices.json`](../.umbraculum/verification-slices.json) call this script for L1 contract tests.

### Package `dist/` builds

[`scripts/build-package-in-docker.sh`](../scripts/build-package-in-docker.sh) mounts **cache + root node_modules** for both scoped and full builds:

```bash
./scripts/build-package-in-docker.sh @umbraculum/contracts --include-dependents
./scripts/build-package-in-docker.sh --all --fresh   # npm ci into umbraculum_root_node_modules
```

### CI parity (T2)

[`.umbraculum/ci-parity.json`](../.umbraculum/ci-parity.json) declares:

```json
"docker": {
  "volumes": [
    { "name": "umbraculum_npm_cache", "containerPath": "/root/.npm" },
    { "name": "umbraculum_root_node_modules", "containerPath": "/repo/node_modules" }
  ]
}
```

`@umbraculum/ci-parity` **≥ 1.0.8** mounts these on the parity container. **Second local `npx @umbraculum/ci-parity` run on the same machine** reuses warm cache + root `node_modules` (large win on slow links).

**GitHub Actions:** runner volumes are **ephemeral per job** — parity still runs full `npm ci` each workflow run. GHA `setup-node` cache on non-parity workflows (`api.yml`, etc.) is separate. Future improvement: GHA cache export into parity Docker (toolset issue).

Pin in workflows: `ci_parity_version: "1.0.8"` (after `@umbraculum/ci-parity@1.0.8` is published from umbraculum-toolset).

---

## Default install flags

Shared default (scripts + compose):

```text
--no-audit --no-fund --prefer-offline
```

| Flag | Why |
|------|-----|
| `--prefer-offline` | Use `/root/.npm` cache first; network only on cache miss |
| `--no-audit` / `--no-fund` | Faster, non-interactive CI/agent runs |

When lockfile changes or deps are broken: add **`npm ci`** (full builds: `build-package-in-docker.sh --fresh`).

**Docs-site fast restart:** `docker-compose.yml` skips `npm install` when `/repo/node_modules/.bin/docusaurus` (or the workspace-local bin) already exists — restarts go straight to `npm run start` (~seconds).

---

## Migration from bind-mounted `services/api/node_modules`

1. Pull this change and recreate api with the new volume:

   ```bash
   docker compose up -d --force-recreate api
   ```

2. First start runs `npm install` into **`umbraculum_api_node_modules`** (~one-time cost; cache accelerates).

3. Optional — remove orphaned host directory (no longer used by compose):

   ```bash
   # Only after api is healthy on the named volume
   rm -rf services/api/node_modules
   ```

   `node_modules/` remains in `.gitignore`.

4. If api fails with missing packages, run once:

   ```bash
   docker compose exec -T api sh -c 'cd /app && npm install --no-audit --no-fund --prefer-offline'
   ```

---

## Operations

### Inspect volumes

```bash
docker volume ls | grep umbraculum_
docker volume inspect umbraculum_npm_cache
```

### Reset a stuck install tree (last resort)

```bash
docker compose stop api
docker volume rm umbraculum_api_node_modules   # destructive — reinstall on next up
docker compose up -d api
```

### Reset npm cache only

```bash
docker run --rm -v umbraculum_npm_cache:/root/.npm node:20-slim npm cache clean --force
```

### Clear legacy root volume name

```bash
docker volume rm brewery_app_root_node_modules 2>/dev/null || true
```

---

## Anti-patterns

| Do not | Do instead |
|--------|------------|
| `docker run --rm -v $PWD:/repo … npm ci` without cache/root volumes | `./scripts/docker-npm-run.sh -r '…'` or ci-parity |
| Root `npm ci` on every test iteration (T0) | `docker compose exec api npm run test:unit` |
| Bind-mount `$HOME/.npm` (OS-specific, permission issues) | Named volume `umbraculum_npm_cache` |
| Full monorepo install for one package test | Scoped `-w @umbraculum/…` via `docker-npm-run.sh -r` |
| Assume warm parity cache on **GitHub Actions** | Expect cold `npm ci` on CI; local parity is where volumes help |

---

## Scoped install vs api pruning (still applies)

Running **`npm install --workspaces`** from a one-shot that bind-mounts the **live** repo (without api’s named volume) can still prune `services/api` devDeps — see [`docs/TESTING.md`](TESTING.md) scoped-install notes.

Mitigations:

- Api uses a **named volume** (not repo bind mount) for `/app/node_modules`.
- Prefer **`docker compose exec api …`** for api tests.
- Use **`docker-npm-run.sh -r`** for package-only one-shots (does not mount api’s tree).

---

## Toolset / agent surfaces

| Artifact | Repo |
|----------|------|
| `scripts/lib/docker-npm-volumes.sh`, `scripts/docker-npm-run.sh` | umbraculum-dev |
| `docker.volumes` in ci-parity manifest | umbraculum-dev `.umbraculum/ci-parity.json` |
| `@umbraculum/ci-parity` runner mounts | umbraculum-toolset `packages/ci-parity` ≥ 1.0.8 |
| Skill **`docker-npm-volumes-runbook`** | umbraculum-toolset plugin |
| Skills **`scoped-package-build-in-docker`**, **`verify-slice-runbook`**, **`ci-parity-local-reproduction`** | updated to reference this doc |

---

## Related RFC / tier docs

- Verification tiers: [`VERIFICATION-TIERS.md`](VERIFICATION-TIERS.md) — T0/T1 must not run root `npm ci` unless lockfile changed.
- CI parity: [`CI-PARITY.md`](CI-PARITY.md) — clean snapshot + Docker job execution.
- Testing scoped installs: [`TESTING.md`](TESTING.md) § L1.
