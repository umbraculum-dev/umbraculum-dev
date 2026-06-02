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
# CI equivalent:
./scripts/ci-parity-check.sh run --jobs dogfood-npm-smoke
```

**Also run before push** when touching contracts/api-client publish surfaces:

```bash
./scripts/ci-parity-check.sh run --jobs docs-readmes,typecheck,dogfood-npm-smoke
```

See [`docs/INTEGRATOR-QUICKSTART.md`](../INTEGRATOR-QUICKSTART.md) for the external-author walkthrough.

Or manually in a **temp directory outside the monorepo** (see script). Passing that check is the proof external integrators can install.

---

## When editing contracts or api-client heavily

1. Keep working in `packages/contracts` / `packages/api-client` — workspace symlink picks up builds.
2. Run `npm run build:packages` (or ci-parity `sdk-publish-prep`) before typecheck/lint that reads `dist/`.
3. Before merge / after bumping published semver: run `./scripts/dogfood-npm-smoke.sh` and update consumer `^` pins if version changed.

Do **not** switch publisher `packages/api-client` to registry `file:` → `^` — that breaks co-development of the client with its parser map.

---

## Tooling / CI

- **ci-parity job `dogfood-npm-smoke`:** runs [`scripts/dogfood-npm-smoke.sh`](../../scripts/dogfood-npm-smoke.sh) (npm registry network). GHA: [`.github/workflows/dogfood-npm-smoke.yml`](../../.github/workflows/dogfood-npm-smoke.yml) — on SDK path changes + weekly schedule.
- **umbraculum-toolset:** optional cross-link from publish checklist in sister-repo; not a daily Cursor rule in this repo.

---

## Why not dogfood the module-sdk α batch (yet)?

The **seven-package July α batch** (`ai-tool-sdk`, `i18n-keys`, `module-sdk`, four `*-contracts`) is on npm at **`0.1.1` / `0.0.2`**, but monorepo consumers (`apps/web`, `apps/native`, `packages/rendering`, `services/api`) still use **`file:../../packages/...`** links.

| Factor | contracts + api-client (dogfooded) | module-sdk batch (still `file:`) |
|--------|-----------------------------------|----------------------------------|
| **Change frequency** | Hot path — OpenAPI facades, web/native HTTP, route parsers co-evolve | Stable spine; fewer cross-cutting edits per week |
| **Coupling** | `api-client` tarball must prove registry deps resolve | `module-sdk` pulls two leaves; publish workflow already rewrites deps at OIDC time |
| **Blast radius** | External integrators **just** started installing `@0.0.1` — registry proof is highest ROI | Third-party modules already pin published semver per [`third-party-module.md`](../modules/contribute/third-party-module.md); monorepo symlink does not block them |
| **Contributor ergonomics** | Workspace symlink + semver manifest = hybrid (documented above) | Module registration + AI tool work touches `module-sdk` daily; forced registry-only would slow iteration unless paired with `npm link` discipline |

**When to dogfood module-sdk batch:** after a quiet period or before a **major** module-sdk semver — run the same playbook (consumer `^` pins + optional ci-parity job extension). Not required for OpenAPI Phase E closure.

---

## Execution log

| Date | Event |
|------|-------|
| 2026-06-02 | Consumers switched to `^0.0.1`; registry smoke confirmed; this doc added |
