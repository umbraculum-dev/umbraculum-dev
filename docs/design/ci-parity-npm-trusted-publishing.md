# npm Trusted Publishing (OIDC) for `@umbraculum/ci-parity`

**Tier:** Public  
**Status:** v1 — adopt after `1.0.0` token publish (2026-05-29)  
**Audience:** maintainers  
**Related:** [`ci-parity-npm-publish.md`](ci-parity-npm-publish.md), [`CI-PARITY.md`](../CI-PARITY.md)

Replaces the **90-day granular `NPM_TOKEN`** rotation cycle for `publish-ci-parity` with short-lived OIDC credentials from GitHub Actions. See [npm trusted publishers docs](https://docs.npmjs.com/trusted-publishers/).

---

## What changes

| Before (token) | After (OIDC) |
|----------------|--------------|
| `NPM_TOKEN` secret on umbraculum-toolset | **Not used** on publish step |
| Rotate npm granular token every 90 days | No publish-token rotation |
| Manual secret paste into GitHub | Trust link configured once on npmjs.com |

**Manual publish from a laptop** still uses `npm login` / a personal token — OIDC only applies to the GHA workflow.

---

## Step 1 — Configure trusted publisher on npm (one-time)

1. Open: https://www.npmjs.com/package/@umbraculum/ci-parity/access  
   *(not `/admins` — Trusted publishing lives on the **access** page)*
2. **Trusted publishing** → **GitHub Actions** → fill **exactly** (case-sensitive):

| Field | Value |
|-------|--------|
| Organization or user | `umbraculum-dev` |
| Repository | `umbraculum-toolset` |
| Workflow filename | `publish-ci-parity.yml` |
| Environment name | *(empty)* |
| Allowed actions | `npm publish` |

3. **Set up connection** / Save

**Account 2FA:** npm requires passkey/security-key 2FA on your user before editing package settings (no authenticator app for new setups). Use Chrome; phone passkey via QR if no USB key.

npm does **not** validate these fields at save time — errors appear only on the next publish if something is wrong.

**Fork note:** `packages/ci-parity/package.json` `repository.url` must match `github.com/umbraculum-dev/umbraculum-toolset` (already set).

---

## Step 2 — Workflow (already in toolset)

File: `umbraculum-toolset/.github/workflows/publish-ci-parity.yml`

- `permissions.id-token: write` on the **publish job**
- **No** `registry-url` on `setup-node` (writes empty `_authToken` → blocks OIDC)
- `npm install -g npm@11.6.2` (requires npm CLI **≥ 11.5.1**)
- Explicit GitHub OIDC fetch → `NPM_ID_TOKEN` with audience `npm:registry.npmjs.org`
- `npm publish` with **no** `NODE_AUTH_TOKEN`

---

## Step 3 — Verify OIDC publish

Bump patch version, tag, push:

```bash
cd umbraculum-toolset
# edit packages/ci-parity/package.json → "version": "1.0.1"
git add packages/ci-parity/package.json
git commit -m "chore(ci-parity): release 1.0.1 — OIDC publish smoke"
git tag ci-parity-v1.0.1
git push origin master ci-parity-v1.0.1
```

Watch **umbraculum-toolset** → Actions → `publish-ci-parity` → green.

```bash
npm view @umbraculum/ci-parity version
# expect: 1.0.1
```

---

## Step 4 — Retire `NPM_TOKEN` (after Step 3 is green)

1. **GitHub** — umbraculum-toolset → Settings → Secrets → Actions → delete **`NPM_TOKEN`**
2. **npm** — Access Tokens → revoke the granular **publish** token (keep personal tokens you use for `npm login` locally if any)
3. **Optional hardening** — package Settings → Publishing access → **Require two-factor authentication and disallow tokens**  
   (Trusted publishing keeps working; only long-lived automation tokens are blocked.)

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `ENEEDAUTH` with HTTP 404 `OIDC token exchange error - package not found` | Trusted-publisher entry on the package's npm `/access` page is missing or one field doesn't match the OIDC JWT claims. Capture the JWT claims block from the publish workflow, open https://www.npmjs.com/package/@umbraculum/ci-parity/access, delete any existing entry, and re-add: org `umbraculum-dev`, repo `umbraculum-toolset`, workflow filename `publish-ci-parity.yml` (no path, **`.yml` not `.yaml`**), env empty, allowed action `npm publish`. Save (2FA required); page must reload showing the entry. |
| `404` on PUT | Often empty `_authToken` from `setup-node` `registry-url` (same fix: omit `registry-url` or strip `_authToken` only) |
| Publish still uses token | `NODE_AUTH_TOKEN` still set on publish step — remove it |
| `npm ci` fails on private deps | OIDC does not help install — use a **read-only** token only on `npm ci` (not needed for `@umbraculum/ci-parity` today; deps are public) |

Official guide: https://docs.npmjs.com/trusted-publishers/

---

## Execution log

| Date | Event | Status |
|------|-------|--------|
| 2026-05-29 | `1.0.0` published via granular `NPM_TOKEN` | ✅ |
| 2026-05-29 | Trusted publisher configured on npm (Chrome) | ✅ |
| 2026-05-29 | `1.0.1`–`1.0.5` OIDC attempts → `E404` / `ENEEDAUTH` (setup-node `registry-url` empty `_authToken`; first trusted-publisher save did not persist) | ❌ |
| 2026-05-29 | `1.0.6` OIDC publish green after explicit `NPM_ID_TOKEN` fetch + `/-/npm/v1/oidc/token/exchange` POST in workflow, and re-saving trusted-publisher entry on npm `/access` | ✅ |
