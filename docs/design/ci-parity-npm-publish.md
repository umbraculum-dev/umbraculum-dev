# Publishing `@umbraculum/ci-parity`

**Tier:** Public  
**Status:** v1 — `1.0.0` published via granular `NPM_TOKEN` (2026-05-29); **`1.0.1`+ via OIDC trusted publishing** (current of `1.0.6`)  
**Audience:** maintainers  
**Related:** [`docs/CI-PARITY.md`](../CI-PARITY.md), [`docs/LICENSING.md`](../LICENSING.md) §6.2.1, [`ci-parity-npm-trusted-publishing.md`](ci-parity-npm-trusted-publishing.md)

**Package source:** `umbraculum-toolset/packages/ci-parity`  
**npm name:** `@umbraculum/ci-parity`  
**License:** MIT (`publishConfig.access: public`)

---

## 1. Why the package lives in umbraculum-toolset (not umbraculum-dev)

CI parity is **configured** in umbraculum-dev but **implemented** in umbraculum-toolset. That split is intentional.

| Repo | Role | What lives there |
|------|------|------------------|
| **umbraculum-dev** | Consumer | `.umbraculum/ci-parity.json` (what jobs to run), `.github/workflows/typecheck.yml` / `web-lint.yml` / `docs-readmes.yml` (when to run), `scripts/ci-parity-check.sh`, `docs/CI-PARITY.md` |
| **umbraculum-toolset** | Shared engine | `packages/ci-parity/` (npm CLI), `.github/workflows/ci-parity-reusable.yml` (workflow other repos call), `.github/workflows/publish-ci-parity.yml` (npm publish on tag) |
| **cursor-plugins/** (inside toolset) | Agent apparatus only | Rule `72-ci-parity-local-vs-ci-divergence` and skill `ci-parity-local-reproduction` **reference** `npx @umbraculum/ci-parity`; they do not contain the runner |

The toolset repo is **not** “plugins only.” Its README documents `packages/` as a sibling of `cursor-plugins/` for shared CLIs. Adding `@umbraculum/ci-parity` does not change plugin install paths or marketplace layout.

**Mental model:** umbraculum-dev owns the **recipe card** (manifest + triggers). umbraculum-toolset owns the **kitchen appliance** (CLI + reusable GHA). Sister repos can adopt the appliance without copying 260 lines of bash.

---

## 2. GitHub Actions (GHA) — which repo, which workflow

**GHA** = GitHub Actions (the **Actions** tab on GitHub).

| What you are looking for | Open this repo | Workflow name |
|--------------------------|----------------|---------------|
| App CI (`typecheck`, `lint`, `docs-readmes` on PRs) | **umbraculum-dev** | `typecheck`, `web-lint`, `docs-readmes` (after step 3 lands) |
| Package unit tests on toolset `master` | **umbraculum-toolset** | `ci-parity-package` |
| **npm publish** on version tag | **umbraculum-toolset** | `publish-ci-parity` |
| Reusable workflow definition | **umbraculum-toolset** (canonical); **umbraculum-dev** vendors a copy at `.github/workflows/ci-parity-reusable.yml` |

URL for publish runs:

`https://github.com/umbraculum-dev/umbraculum-toolset/actions/workflows/publish-ci-parity.yml`

---

## 3. Release sequence (checklist)

### Step 2a — toolset tag (done 2026-05-29)

```bash
cd umbraculum-toolset
git tag ci-parity-v1.0.0 e4fca59
git push origin ci-parity-v1.0.0
```

This pins the npm package and documents the reusable-workflow snapshot. umbraculum-dev callers use a **local** vendored copy:

`uses: ./.github/workflows/ci-parity-reusable.yml` with `ci_parity_version: "1.0.0"`

Sister repos with org Actions sharing enabled may instead pin `uses: umbraculum-dev/umbraculum-toolset/.github/workflows/ci-parity-reusable.yml@ci-parity-v1.0.0`.

**Tag convention:** Git tag `ci-parity-v1.0.0`; `package.json` version `1.0.0` (no `v` in package.json).

### Step 2b — npm publish (pending)

Requires `@umbraculum` npm org + auth (below).

### Step 3 — umbraculum-dev commit + push

After `npm view @umbraculum/ci-parity version` returns `1.0.0`, commit migrated workflows + manifest in umbraculum-dev.

---

## 4. Automated publish via GHA

**Trigger:** push a tag matching `ci-parity-v*` (e.g. `ci-parity-v1.0.0`).

**Workflow file:** `umbraculum-toolset/.github/workflows/publish-ci-parity.yml`

### Preferred auth: Trusted Publishing (OIDC) — current

No long-lived `NPM_TOKEN`. Live since `1.0.6` on 2026-05-29. See **[`ci-parity-npm-trusted-publishing.md`](ci-parity-npm-trusted-publishing.md)** for one-time npm + GitHub setup, the explicit token-exchange workflow, and the troubleshooting matrix.

Workflow requirements (as deployed):

- `permissions.id-token: write` on the publish job
- **No** `registry-url` on `setup-node` (avoids `_authToken=${NODE_AUTH_TOKEN}` short-circuit; see actions/setup-node#1551)
- npm CLI ≥ 11.5.1 — pinned `npm install -g npm@11.6.2`
- Explicit GitHub OIDC fetch (audience `npm:registry.npmjs.org`) → `POST /-/npm/v1/oidc/token/exchange/package/<name>` → publish with the short-lived exchanged token
- `npm publish` runs from `packages/ci-parity/` (not `npm publish -w`)
- Trusted publisher saved on https://www.npmjs.com/package/@umbraculum/ci-parity/access (org `umbraculum-dev`, repo `umbraculum-toolset`, workflow filename `publish-ci-parity.yml`, env empty)

### Legacy auth: granular `NPM_TOKEN` (retired 2026-05-29)

Used for the initial `1.0.0` publish only. After OIDC was verified at `1.0.6`, the GitHub Actions secret `NPM_TOKEN` and the granular npm publish token were removed. Token-based publish from CI is no longer supported.

---

## 5. Manual publish (fallback)

If you cannot set GitHub secrets or need a one-off publish:

```bash
cd umbraculum-toolset
npm login                    # user with @umbraculum publish rights
npm run build -w @umbraculum/ci-parity
npm test -w @umbraculum/ci-parity
npm publish -w @umbraculum/ci-parity --access public
```

---

## 6. Prerequisites

| Requirement | Notes |
|-------------|--------|
| npm org `@umbraculum` | Created (`umbraculum-dev` is publishing user) |
| Trusted publisher entry on `@umbraculum/ci-parity` | Saved on npm `/access` page; verified at `1.0.6` |
| Version not already published | `npm view @umbraculum/ci-parity` returns the latest published version |
| Tag `ci-parity-vX.Y.Z` on toolset | Triggers `publish-ci-parity` workflow |

---

## 7. Consumer pinning (after publish)

| Consumer | Pin |
|----------|-----|
| umbraculum-dev reusable workflow input | `ci_parity_version: "1.0.6"` |
| Local / docs | `npx @umbraculum/ci-parity@^1` |
| Reusable workflow ref (vendored) | `./.github/workflows/ci-parity-reusable.yml` in umbraculum-dev |

Patch releases: bump `packages/ci-parity/package.json`, tag `ci-parity-v1.0.1`, push tag → GHA publishes.

---

## 8. Escape hatch (pre-publish only — not for CI)

```bash
node /path/to/umbraculum-toolset/packages/ci-parity/dist/cli.js validate --strict \
  --repo . --manifest .umbraculum/ci-parity.json
```

Do not use git/npm install shortcuts in umbraculum-dev GHA — publish to npm first.

---

## 9. Execution log

| Date | Event | Result |
|------|--------|--------|
| 2026-05-29 | `ci-parity-package` on toolset `master` (`e4fca59`) | ✅ pass |
| 2026-05-29 | Tag `ci-parity-v1.0.0` pushed | ✅ |
| 2026-05-29 | `publish-ci-parity` #1 on `ci-parity-v1.0.0` | ❌ `ENEEDAUTH` — `NPM_TOKEN` not set (expected) |
| 2026-05-29 | After `NPM_TOKEN` + re-run | ✅ `1.0.0` on npm |
| 2026-05-29 | OIDC workflow + trusted-publisher docs shipped on toolset `master` | ✅ |
| 2026-05-29 | `1.0.1`–`1.0.5` OIDC iterations failing on `setup-node` `_authToken` and an unsaved npm trusted-publisher entry | ❌ |
| 2026-05-29 | `1.0.6` published via OIDC after explicit token-exchange workflow + re-saved trusted publisher | ✅ |
| 2026-05-29 | `NPM_TOKEN` GitHub secret deleted; granular npm publish token revoked | ✅ |
