# Publishing `@umbraculum/ci-parity`

**Tier:** Public  
**Status:** v1 — first publish pending `NPM_TOKEN` on umbraculum-toolset (2026-05-29)  
**Audience:** maintainers  
**Related:** [`docs/CI-PARITY.md`](../CI-PARITY.md), [`docs/LICENSING.md`](../LICENSING.md) §6.2.1

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
| Reusable workflow definition (not a standalone run) | **umbraculum-toolset** | `ci-parity-reusable` (invoked *from* umbraculum-dev workflows) |

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

This pins the reusable workflow ref consumer workflows use:

`uses: umbraculum-dev/umbraculum-toolset/.github/workflows/ci-parity-reusable.yml@ci-parity-v1.0.0`

**Tag convention:** Git tag `ci-parity-v1.0.0`; `package.json` version `1.0.0` (no `v` in package.json).

### Step 2b — npm publish (pending)

Requires `@umbraculum` npm org + auth (below).

### Step 3 — umbraculum-dev commit + push

After `npm view @umbraculum/ci-parity version` returns `1.0.0`, commit migrated workflows + manifest in umbraculum-dev.

---

## 4. Automated publish via GHA (preferred)

**Trigger:** push a tag matching `ci-parity-v*` (e.g. `ci-parity-v1.0.0`).

**Workflow file:** `umbraculum-toolset/.github/workflows/publish-ci-parity.yml`

**Steps it runs:**

1. `npm ci`
2. `npm run typecheck -w @umbraculum/ci-parity`
3. `npm test -w @umbraculum/ci-parity`
4. `npm run build -w @umbraculum/ci-parity`
5. `npm publish -w @umbraculum/ci-parity --access public` with `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`

### Expected first-run failure (2026-05-29)

`publish-ci-parity` run #1 on tag `ci-parity-v1.0.0` **failed at step 5** with:

```text
npm error code ENEEDAUTH
npm error need auth This command requires you to be logged in to https://registry.npmjs.org/
```

**This is expected** when the `NPM_TOKEN` repository secret is not configured yet. Steps 1–4 (build + tests) passed — the package is publish-ready; only registry auth is missing.

### Fix: add `NPM_TOKEN` once

1. **npm** — [npmjs.com](https://www.npmjs.com) → avatar → **Access Tokens** → **Generate New Token** → **Granular Access Token**
   - Packages and scopes: **Read and write**, scope **`@umbraculum`** only (not local path scopes)
   - Organizations: **Read and write** for org **umbraculum**
   - **Bypass 2FA:** enabled (required for non-interactive CI publish)
   - **Expiration:** max **90 days** for read-write granular tokens (npm enforced)
   - **IP ranges:** leave empty (GitHub Actions runner IPs are not fixed)
   - **Never paste the token in chat, tickets, or commits** — only into GitHub Secrets
2. **GitHub** — repo **umbraculum-toolset** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
   - Name: `NPM_TOKEN` (exact spelling — workflow references this name)
   - Value: paste the npm token
3. **Re-run** — Actions → failed `publish-ci-parity` run → **Re-run all jobs**  
   (Do not need a new tag; `1.0.0` is not on npm yet.)

### Token rotation (required — 90-day max)

npm **read-write granular tokens expire after at most 90 days**. The `NPM_TOKEN` secret does not auto-refresh; when the token expires, `publish-ci-parity` will fail with auth errors on the next tag push or re-run.

| When | Action |
|------|--------|
| **At creation** | Note expiry date (e.g. in team calendar / password manager) |
| **~2 weeks before expiry** | Generate a **new** granular token (same settings as above) |
| **Rotate** | umbraculum-toolset → Settings → Secrets → Actions → `NPM_TOKEN` → **Update** with the new value |
| **Revoke old token** | npm → Access Tokens → revoke the superseded token |
| **If token was leaked** | Revoke immediately on npm, generate new, update `NPM_TOKEN`, re-run publish workflow |

**Rotation checklist (copy per cycle):**

1. npm: new granular token, 90-day expiry, `@umbraculum` read-write + org read-write, bypass 2FA
2. GitHub: update repository secret `NPM_TOKEN` on **umbraculum-toolset**
3. npm: revoke previous token
4. Optional smoke: re-run latest `publish-ci-parity` (will no-op if version already published) or wait until next `ci-parity-v*` tag

**Security:** If a token appears in chat, logs, or a commit, **revoke it on npm before doing anything else** — rotation is not optional in that case.

### Verify success

```bash
npm view @umbraculum/ci-parity version
# expect: 1.0.0
```

Or open: `https://www.npmjs.com/package/@umbraculum/ci-parity`

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
| npm org `@umbraculum` | Create at npm if missing; add publish-capable members |
| `NPM_TOKEN` on umbraculum-toolset | Automation token; not needed for manual publish from laptop |
| Version not already published | `npm view @umbraculum/ci-parity` → 404 until first publish |
| Tag `ci-parity-v1.0.0` on toolset | Already pushed (reusable workflow pin) |

---

## 7. Consumer pinning (after publish)

| Consumer | Pin |
|----------|-----|
| umbraculum-dev reusable workflow input | `ci_parity_version: "1.0.0"` |
| Local / docs | `npx @umbraculum/ci-parity@^1` |
| Reusable workflow ref | `@ci-parity-v1.0.0` on umbraculum-toolset |

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
| 2026-05-29 | After `NPM_TOKEN` + re-run or manual publish | ✅ `1.0.0` on npm |
