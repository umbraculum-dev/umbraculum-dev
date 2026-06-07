# npm Trusted Publishing (OIDC) for MIT SDK batch

**Tier:** Public  
**Status:** v1 — **SP-3 complete (2026-05-29)** — first versions on npm; OIDC for future bumps  
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

### Contracts + api-client extension (Phase E post-α)

| Package | Workflow | Tag pattern |
|---------|----------|-------------|
| `@umbraculum/contracts` | `publish-contracts-api-client.yml` | `sdk-contracts-v*` |
| `@umbraculum/api-client` | `publish-contracts-api-client.yml` | `sdk-contracts-v*` |
| `@umbraculum/brewery-contracts` | `publish-contracts-api-client.yml` | `sdk-contracts-v*` |
| `@umbraculum/brewery-api-client` | `publish-contracts-api-client.yml` | `sdk-contracts-v*` |

**First-time (platform pair, 2026-06-02):** npm requires a package record before OIDC trust attaches. Publish `0.0.1` from a maintainer laptop:

```bash
npx @umbraculum/ci-parity run --jobs sdk-publish-prep
./scripts/publish-contracts-api-client-laptop.sh
```

**First-time (brewery vertical pair, 2026-06-07):**

```bash
npx @umbraculum/ci-parity run --jobs sdk-publish-prep
./scripts/publish-brewery-sdk-laptop.sh
```

If `brewery-contracts` is on the registry but `brewery-api-client` 404s (second publish failed or ran before contracts propagated), republish only the client:

```bash
./scripts/publish-brewery-api-client-laptop.sh
```

Configure OIDC trust **after each package exists on npm** (trusted publisher exchange 404s for unknown package names):

```bash
REPO="umbraculum-dev/umbraculum-dev"
WF="publish-contracts-api-client.yml"

for pkg in \
  @umbraculum/contracts \
  @umbraculum/api-client \
  @umbraculum/brewery-contracts \
  @umbraculum/brewery-api-client
do
  npx npm@11.16.0 trust github "$pkg" --repo "$REPO" --file "$WF" --allow-publish -y
  sleep 2
done
```

**Future bumps:** increment semver in the affected `package.json`(s), push a **new** tag (e.g. `sdk-contracts-v0.0.2`). The workflow skips packages whose version is already on the registry.

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

**First-time packages:** npm requires a package record before OIDC trust can attach. For this batch, **first versions were published from a maintainer laptop** (`npm login` + `npm publish -w …`), then trusted publishers were configured via `npx npm@11.16.0 trust github …` (see Step 1b below). **Do not** push `sdk-batch-v0.1.0` — those versions already exist. Future bumps: increment semver in `packages/*/package.json`, push `sdk-batch-v*` tag, GHA publishes via OIDC.

**Alternative (not used here):** org-level scope trusted publishing if enabled on the org account.

### Step 1b — Bulk CLI (what we used for SP-3)

Requires npm ≥ 11.10 (`npx npm@11.16.0` if global npm is older). On the **host** (not Docker):

```bash
REPO="umbraculum-dev/umbraculum-dev"
WF="publish-sdk-batch.yml"

for pkg in \
  @umbraculum/ai-tool-sdk \
  @umbraculum/i18n-keys \
  @umbraculum/module-sdk \
  @umbraculum/automation-contracts \
  @umbraculum/pim-contracts \
  @umbraculum/mrp-contracts \
  @umbraculum/crp-contracts
do
  npx npm@11.16.0 trust github "$pkg" --repo "$REPO" --file "$WF" --allow-publish -y
  sleep 2
done
```

Enable **skip 2FA for 5 minutes** on the first browser prompt. Verify: `npx npm@11.16.0 trust list @umbraculum/module-sdk`.

---

## Step 2 — Workflow

File: `umbraculum-dev/.github/workflows/publish-sdk-batch.yml`

- Trigger: push tag `sdk-batch-v*`
- `permissions.id-token: write`
- **No** `registry-url` on `setup-node`
- `npm install -g npm@11.6.2`
- `npm ci` → `build:packages` → `test:packages`
- Ordered OIDC publish: leaves → `module-sdk` (deps rewritten to `^0.1.1` registry semver **in workflow only** — match current leaf version) → four contracts packages
- Explicit GitHub OIDC fetch + npm exchange per package (diagnostic logging)

`module-sdk` committed `package.json` keeps `file:../…` for monorepo CI; only the publish tarball gets registry deps.

---

## Step 3 — Publish (maintainer)

**First batch (2026-05-29):** published from maintainer laptop — see [`npm-sdk-publish-preflight.md`](npm-sdk-publish-preflight.md) §7. `sdk-batch-v0.1.0` was **not** pushed.

**Future bumps:**

```bash
npx @umbraculum/ci-parity run --jobs docs-readmes,sdk-publish-prep
```

```bash
git checkout master && git pull
# bump version(s) in packages/*/package.json
git tag sdk-batch-v0.1.2   # example — never reuse a published semver (`sdk-batch-v0.1.1` already published)
git push origin sdk-batch-v0.1.2
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
| 2026-05-29 | SP-2 workflow + manifests merged | Done |
| 2026-05-29 | First publish (laptop) + OIDC trust (CLI) | Done — seven packages on registry |
| 2026-05-29 | `sdk-batch-v0.1.1` GHA OIDC publish | **Green** — patch bump to `0.1.1` / `0.0.2` |
| — | `sdk-batch-v0.1.0` GHA publish | Skipped — versions already published manually |
| 2026-06-02 | `publish-contracts-api-client.yml` + laptop script | Done — `@umbraculum/contracts` / `@umbraculum/api-client` `0.0.1` on registry + OIDC trust |
| 2026-06-07 | Brewery vertical SDK (`brewery-contracts`, `brewery-api-client`) | In progress — `publish-brewery-sdk-laptop.sh` + workflow skip-if-exists |
