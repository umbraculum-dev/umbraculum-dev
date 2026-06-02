# npm SDK monorepo dogfood (`@umbraculum/contracts` + `@umbraculum/api-client`)

**Tier:** Public  
**Status:** v1 — adopted 2026-06-02 after `@0.0.1` publish  
**Audience:** monorepo contributors  
**Related:** [`npm-sdk-publish-preflight.md`](npm-sdk-publish-preflight.md), [`npm-sdk-trusted-publishing.md`](npm-sdk-trusted-publishing.md), [`DEVELOPMENT.md`](../../DEVELOPMENT.md)

---

## What “dogfood” means

**Dogfooding** = consuming your own published npm packages the way external integrators do — registry semver pins (`^0.0.1`), not ad-hoc `file:` paths.

Goal: manifest parity with third-party module repos and early detection of “green in monorepo, broken on npm” drift.

---

## Daily practice (recommended hybrid)

| Layer | Dependency style | Why |
|-------|------------------|-----|
| **Consumer apps** (`apps/web`, `apps/native`) | `"@umbraculum/contracts": "^0.0.1"`, `"@umbraculum/api-client": "^0.0.1"` | Matches external `npm install` manifests |
| **API service** (`services/api`) | `"@umbraculum/contracts": "^0.0.1"` | Route handlers import wire parsers/types from contracts |
| **Publisher package** (`packages/api-client`) | `"@umbraculum/contracts": "file:../contracts"` | Co-develop client + contracts; publish workflow rewrites to registry semver in tarball only |
| **Source package** (`packages/contracts`) | *(none — it is the source)* | Built locally; published via laptop or `sdk-contracts-v*` OIDC |

**npm workspaces still symlink** in-tree `@umbraculum/contracts` / `@umbraculum/api-client` when those packages exist under `packages/*`. That is intentional: contributors editing contracts see changes immediately without republishing on every save.

So dogfood here is **manifest + periodic registry verification**, not “download from npm on every `npm ci` while hacking contracts.”

---

## When to run registry-only verification

Run after:

- First publish of a new SDK package
- Any semver bump you push to npm
- Suspicion of publish-tarball drift (missing `files`, wrong `dependencies` rewrite)

From repo root:

```bash
./scripts/dogfood-npm-smoke.sh
```

Or manually in a **temp directory outside the monorepo** (see script). Passing that check is the proof external integrators can install.

---

## When editing contracts or api-client heavily

1. Keep working in `packages/contracts` / `packages/api-client` — workspace symlink picks up builds.
2. Run `npm run build:packages` (or ci-parity `sdk-publish-prep`) before typecheck/lint that reads `dist/`.
3. Before merge / after bumping published semver: run `./scripts/dogfood-npm-smoke.sh` and update consumer `^` pins if version changed.

Do **not** switch publisher `packages/api-client` to registry `file:` → `^` — that breaks co-development of the client with its parser map.

---

## Tooling / CI follow-up (not daily)

- **ci-parity:** optional future job `dogfood-npm-smoke` mirroring [`scripts/dogfood-npm-smoke.sh`](../../scripts/dogfood-npm-smoke.sh) in `.umbraculum/ci-parity.json` (network to registry).
- **umbraculum-toolset:** optional cross-link from `umbraculum-toolset-common` publish checklist — track in sister-repo; not duplicated as a Cursor rule in this repo unless enforcement gap is observed.

---

## Execution log

| Date | Event |
|------|-------|
| 2026-06-02 | Consumers switched to `^0.0.1`; registry smoke confirmed; this doc added |
