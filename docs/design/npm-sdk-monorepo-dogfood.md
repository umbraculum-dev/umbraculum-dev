# npm SDK monorepo dogfood (published `@umbraculum/*` SDK packages)

**Tier:** Public  
**Status:** v2 — module-sdk α batch adopted 2026-06-03; contracts + api-client since 2026-06-02  
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
| **Consumer apps** (`apps/web`, `apps/native`) | `"@umbraculum/contracts": "^0.0.1"`, `"@umbraculum/api-client": "^0.0.1"`, module-sdk batch at `^0.0.2` / `^0.1.1` where used | Matches external `npm install` manifests |
| **API service** (`services/api`) | `"@umbraculum/contracts": "^0.0.1"` + module-sdk batch pins | Route handlers + module registration import published SDK surface |
| **`packages/platform/rendering`** | `"@umbraculum/module-sdk": "^0.0.2"` | Same hybrid as other consumers |
| **Publisher package** (`packages/platform/api-client`) | `"@umbraculum/contracts": "file:../contracts"` | Co-develop client + contracts; publish workflow rewrites to registry semver in tarball only |
| **Publisher package** (`packages/modules/module-sdk`) | `"@umbraculum/ai-tool-sdk": "file:../ai-tool-sdk"`, `"@umbraculum/i18n-keys": "file:../i18n-keys"` | Co-develop spine + leaves; OIDC publish rewrites deps in tarball only |
| **Source package** (`packages/platform/contracts`) | *(none — it is the source)* | Built locally; published via laptop or `sdk-contracts-v*` OIDC |

**npm workspaces still symlink** in-tree published packages when they exist under `packages/*`. That is intentional: contributors editing SDK sources see changes immediately without republishing on every save.

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

**Also run before push** when touching contracts/api-client or module-sdk batch publish surfaces:

```bash
./scripts/ci-parity-check.sh run --jobs docs-readmes,typecheck,dogfood-npm-smoke
```

See [`docs/INTEGRATOR-QUICKSTART.md`](../INTEGRATOR-QUICKSTART.md) for the external-author walkthrough.

Or manually in a **temp directory outside the monorepo** (see script). Passing that check is the proof external integrators can install.

---

## When editing contracts or api-client heavily

1. Keep working in `packages/platform/contracts` / `packages/platform/api-client` — workspace symlink picks up builds.
2. Run `npm run build:packages` (or ci-parity `sdk-publish-prep`) before typecheck/lint that reads `dist/`.
3. Before merge / after bumping published semver: run `./scripts/dogfood-npm-smoke.sh` and update consumer `^` pins if version changed.

Do **not** switch publisher `packages/platform/api-client` or `packages/modules/module-sdk` to registry `file:` → `^` — that breaks co-development of publishers with their in-tree deps.

**Still `file:` in consumer manifests (unpublished monorepo packages):** `ui`, `i18n`, `i18n-react`, `navigation`, `media`, brewery vertical packages, `rendering` (private), etc.

---

## Module-sdk α batch (adopted 2026-06-03)

The **seven-package July α batch** (`ai-tool-sdk`, `i18n-keys`, `module-sdk`, four `*-contracts`) is on npm at **`0.1.1` / `0.0.2`**. Monorepo **consumers** now use registry semver pins (same hybrid as contracts/api-client):

| Package | Consumer pin |
|---------|--------------|
| `@umbraculum/ai-tool-sdk` | `^0.1.1` (`services/api`) |
| `@umbraculum/module-sdk` | `^0.0.2` |
| `@umbraculum/automation-contracts` | `^0.0.2` |
| `@umbraculum/pim-contracts` | `^0.0.2` |
| `@umbraculum/mrp-contracts` | `^0.0.2` |
| `@umbraculum/crp-contracts` | `^0.0.2` |

[`scripts/dogfood-npm-smoke.sh`](../../scripts/dogfood-npm-smoke.sh) phase 2 installs `module-sdk`, all four canonical `*-contracts`, and `ai-tool-sdk` from the registry in a temp dir (no new ci-parity job id).

---

## Tooling / CI

- **ci-parity job `dogfood-npm-smoke`:** runs [`scripts/dogfood-npm-smoke.sh`](../../scripts/dogfood-npm-smoke.sh) (npm registry network). GHA: [`.github/workflows/dogfood-npm-smoke.yml`](../../.github/workflows/dogfood-npm-smoke.yml) — on SDK path changes, consumer manifest pins (`apps/web`, `apps/native`, `services/api`, `packages/platform/rendering`), and weekly schedule (Mon 06:00 UTC).
- **umbraculum-toolset:** optional cross-link from publish checklist in sister-repo; not a daily Cursor rule in this repo.

---

## Execution log

| Date | Event |
|------|-------|
| 2026-06-02 | Consumers switched to `^0.0.1`; registry smoke confirmed; this doc added |
| 2026-06-03 | Module-sdk α batch consumer pins (`^0.0.2` / `^0.1.1`); `dogfood-npm-smoke.sh` phase 2 |
