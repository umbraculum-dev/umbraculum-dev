# External integrator quickstart — npm SDK + live API

**Tier:** Public  
**Status:** v1 — `@umbraculum/contracts@0.0.1`, `@umbraculum/api-client@0.0.1` on npm (2026-06-02)  
**Audience:** third-party module authors, automation scripts, ISVs calling Umbraculum HTTP APIs  
**Related:** [`API-OPENAPI.md`](API-OPENAPI.md), [`AUTH-STRATEGY.md`](AUTH-STRATEGY.md), [`modules/contribute/third-party-module.md`](modules/contribute/third-party-module.md), [`design/npm-sdk-monorepo-dogfood.md`](design/npm-sdk-monorepo-dogfood.md)

This guide gets you from **zero** to a **validated HTTP round-trip** using published npm packages — no monorepo clone required.

---

## 1. Choose your SKU

| You integrate with… | OpenAPI catalog | npm subpaths |
|---------------------|-----------------|--------------|
| Platform only (auth, workspaces, automation, PIM, MRP, CRP, …) | [openapi-platform](https://docs.umbraculum.dev/openapi-platform) | `@umbraculum/api-client`, `@umbraculum/api-client/automation`, … |
| Reference brewery vertical (recipes, water, styles, …) | [openapi-brewery](https://docs.umbraculum.dev/openapi-brewery) | `@umbraculum/api-client/brewery` |

Wire-shape authority stays in **`@umbraculum/contracts`** parsers — facades call those parsers on every response.

---

## 2. Install (outside the monorepo)

**Sample repo (recommended):** clone [`umbraculum-integrator-sample`](https://github.com/umbraculum-dev/umbraculum-integrator-sample) — public, platform-only, no monorepo required.

```bash
git clone https://github.com/umbraculum-dev/umbraculum-integrator-sample.git
cd umbraculum-integrator-sample
npm install
UMBRACULUM_BASE_URL=http://localhost:18080 node quickstart.mjs
```

Or use a **temp directory** — not inside `umbraculum-dev`:

```bash
mkdir -p /tmp/my-umbraculum-integrator && cd /tmp/my-umbraculum-integrator
npm init -y
npm install @umbraculum/contracts@0.0.1 @umbraculum/api-client@0.0.1
```

Optional canonical modules:

```bash
npm install @umbraculum/automation-contracts@0.0.2   # when calling /automation/*
```

Registry smoke (maintainers / CI): [`scripts/dogfood-npm-smoke.sh`](../scripts/dogfood-npm-smoke.sh).

---

## 3. Pick an auth mode

| Client | Auth | api-client helper |
|--------|------|-------------------|
| Node script, native app, CI | Bearer token | `bearerTokenAuth(() => token)` + `loginNative` |
| Browser / Next.js (same origin) | Cookie session (`sid`) | `cookieAuth()` + `login` |
| curl / shell | Cookie jar | See §5 |

See [`AUTH-STRATEGY.md`](AUTH-STRATEGY.md) for platform direction.

**Base URL:** facades prepend `/api` internally. Point `createApiClient` at the **origin** (nginx or API host), not `/api`:

```text
http://localhost:18080          # local stack
https://demo.umbraculum.dev     # public demo (when available)
```

---

## 4. Node example — bearer + platform API (no vertical required)

Canonical script: [`scripts/integrator-bearer-smoke.mjs`](../scripts/integrator-bearer-smoke.mjs) (synced to [`umbraculum-integrator-sample`](https://github.com/umbraculum-dev/umbraculum-integrator-sample) as `quickstart.mjs`).

Flow: health wait → `loginNative` → `getAuthMe` → `listWorkspaces` → `getHealth`. Requires a running stack with a seeded user (local: `docker compose exec api npm run seed:e2e`).

```bash
# From umbraculum-dev (workspace deps):
./scripts/integrator-bearer-smoke.sh

# From npm registry only (external integrator path):
./scripts/integrator-bearer-npm-smoke.sh
```

See the script source for env vars (`UMBRACULUM_BASE_URL`, `UMBRACULUM_EMAIL`, `UMBRACULUM_PASSWORD`).

### Optional — brewery add-on (reference vertical only)

If your deployment includes the brewery module, add `@umbraculum/api-client/brewery` and call `listStyles` — see [openapi-brewery](https://docs.umbraculum.dev/openapi-brewery). Platform-only integrators can skip this ([`BUILDING-YOUR-VERTICAL.md`](BUILDING-YOUR-VERTICAL.md)).

Errors on non-2xx responses surface as `ApiClientError` (status + parsed body).

---

## 5. Shell example — cookie session (web path)

Same flow as first-party web integrators — no npm required on the caller beyond `curl` + `jq`:

```bash
git clone git@github.com:umbraculum-dev/umbraculum-dev.git
cd umbraculum-dev
./scripts/integrator-api-smoke.sh http://localhost:18080
```

Steps exercised: `POST /api/auth/login` (cookie) → `/api/auth/me` → `/api/workspaces` → `/api/styles` (brewery route — reference stack only).

---

## 6. Maintainer verification

Bearer (published npm + `@umbraculum/api-client` facades):

```bash
./scripts/integrator-bearer-npm-smoke.sh
```

Live stack (cookie + bearer) in CI (~4.5 min, opt-in while GHA budget is constrained): [`.github/workflows/integrator-live-smoke.yml`](../.github/workflows/integrator-live-smoke.yml). On a PR that touches `scripts/integrator-*`, add label **`run-integrator-smoke`**. After merge, use Actions → **Run workflow** (no automatic push trigger).

After changing publish metadata:

```bash
./scripts/ci-parity-check.sh run --jobs docs-readmes,typecheck,dogfood-npm-smoke
```

See [`CI-PARITY.md`](CI-PARITY.md) job `dogfood-npm-smoke`.

---

## 7. What to read next

| Topic | Document |
|-------|----------|
| Full facade inventory | [`packages/api-client/README.md`](../packages/api-client/README.md) |
| Contract parsers | [`packages/contracts/README.md`](../packages/contracts/README.md) |
| Module registration (not HTTP) | [`third-party-module.md`](modules/contribute/third-party-module.md) |
| OpenAPI maintainer runbook | [`API-OPENAPI.md`](API-OPENAPI.md) |
| Building a non-brewery vertical | [`BUILDING-YOUR-VERTICAL.md`](BUILDING-YOUR-VERTICAL.md) |
| Minimal external sample repo | [`umbraculum-integrator-sample`](https://github.com/umbraculum-dev/umbraculum-integrator-sample) |
