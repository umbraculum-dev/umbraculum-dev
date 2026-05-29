# npm Trusted Publishing (OIDC) for MIT SDK batch

**Tier:** Public  
**Status:** v1 — workflow landed SP-2; first publish pending `sdk-batch-v*` tag  
**Audience:** maintainers  
**Related:** [`npm-sdk-publish-execution-plan.md`](npm-sdk-publish-execution-plan.md), [`npm-sdk-publish-preflight.md`](npm-sdk-publish-preflight.md), [`ci-parity-npm-trusted-publishing.md`](ci-parity-npm-trusted-publishing.md)

Publishes the seven-package MIT SDK batch from **umbraculum-dev** via GitHub Actions OIDC — same explicit token-exchange pattern as [`@umbraculum/ci-parity`](ci-parity-npm-trusted-publishing.md) (no long-lived `NPM_TOKEN`).

---

## Packages in this batch

| Package | Exchange URL path (escaped) |
|---------|----------------------------|
| `@umbraculum/ai-tool-sdk` | `/-/npm/v1/oidc/token/exchange/package/@umbraculum%2fai-tool-sdk` |
| `@umbraculum/i18n-keys` | `/-/npm/v1/oidc/token/exchange/package/@umbraculum%2fi18n-keys` |
| `@umbraculum/module-sdk` | `/-/npm/v1/oidc/token/exchange/package/@umbraculum%2fmodule-sdk` |
| `@umbraculum/automation-contracts` | `/-/npm/v1/oidc/token/exchange/package/@umbraculum%2fautomation-contracts` |
| `@umbraculum/pim-contracts` | `/-/npm/v1/oidc/token/exchange/package/@umbraculum%2fpim-contracts` |
| `@umbraculum/mrp-contracts` | `/-/npm/v1/oidc/token/exchange/package/@umbraculum%2fmrp-contracts` |
| `@umbraculum/crp-contracts` | `/-/npm/v1/oidc/token/exchange/package/@umbraculum%2fcrp-contracts` |

Full URL prefix: `https://registry.npmjs.org`

---

## Step 1 — Configure trusted publishers on npm

**Repository:** `umbraculum-dev` (not toolset).  
**Workflow filename:** `publish-sdk-batch.yml` (exact, case-sensitive).

For **each** package above, after the package exists on npm (or via org-level scope trusted publishing if enabled):

1. Open `https://www.npmjs.com/package/@umbraculum/<name>/access`
2. **Trusted publishing** → **GitHub Actions**:

| Field | Value |
|-------|--------|
| Organization or user | `umbraculum-dev` |
| Repository | `umbraculum-dev` |
| Workflow filename | `publish-sdk-batch.yml` |
| Environment name | *(empty)* |
| Allowed actions | `npm publish` |

3. Save (2FA required). Confirm the entry persists after page reload.

**First-time packages:** npm has no `/access` page until the first version is published. Options:

1. **Org-level** trusted publishing for `@umbraculum` scope (preferred if available on the org account).
2. **Manual first publish** of each package from a maintainer laptop (`npm login` + `npm publish -w …`), then per-package trusted publisher entries before using GHA for the batch tag.

**Chicken-and-egg for batch tag:** If no packages exist yet, run leaves manually once, configure trusted publishers, then use `sdk-batch-v0.1.0` for the full automated batch — or rely on org-level scope trust for all seven on first GHA run.

---

## Step 2 — Workflow

File: `umbraculum-dev/.github/workflows/publish-sdk-batch.yml`

- Trigger: push tag `sdk-batch-v*`
- `permissions.id-token: write`
- **No** `registry-url` on `setup-node`
- `npm install -g npm@11.6.2`
- `npm ci` → `build:packages` → `test:packages`
- Ordered OIDC publish: leaves → `module-sdk` (deps rewritten to `^0.1.0` registry semver **in workflow only**) → four contracts packages
- Explicit GitHub OIDC fetch + npm exchange per package (diagnostic logging)

`module-sdk` committed `package.json` keeps `file:../…` for monorepo CI; only the publish tarball gets registry deps.

---

## Step 3 — Publish (maintainer)

```bash
git checkout master && git pull
# confirm versions in packages/*/package.json
git tag sdk-batch-v0.1.0
git push origin sdk-batch-v0.1.0
```

Watch **umbraculum-dev** → Actions → `publish-sdk-batch` → green.

```bash
npm view @umbraculum/ai-tool-sdk version
npm view @umbraculum/module-sdk version
```

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| HTTP 404 `OIDC token exchange error - package not found` | Trusted publisher not saved on package `/access`, or wrong repo/workflow filename |
| `ENEEDAUTH` | `registry-url` on setup-node, or `NODE_AUTH_TOKEN` set during publish |
| `403` version already exists | Bump version + new tag; never republish same semver |
| `module-sdk` missing peer on install | Leaf packages not published before module-sdk step; check workflow order |

Official guide: https://docs.npmjs.com/trusted-publishers/

---

## Execution log

| Date | Event | Status |
|------|-------|--------|
| — | SP-2 workflow + manifests merged | Pending tag push |
| — | `sdk-batch-v0.1.0` GHA publish | Not run yet |
