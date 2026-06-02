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

Use a **temp directory** or your own repo — not inside `umbraculum-dev`:

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

## 4. Node example — bearer + brewery catalog

Minimal script: login → workspaces → beer styles. Requires a running stack with a seeded user (local: `docker compose exec api npm run seed:e2e`).

```javascript
// quickstart.mjs — run: node quickstart.mjs
import {
  bearerTokenAuth,
  createApiClient,
  getAuthMe,
  listWorkspaces,
  loginNative,
} from "@umbraculum/api-client";
import { listStyles } from "@umbraculum/api-client/brewery";

const BASE_URL = process.env.UMBRACULUM_BASE_URL ?? "http://localhost:18080";
const EMAIL = process.env.UMBRACULUM_EMAIL ?? "e2e-admin@brewery.local";
const PASSWORD = process.env.UMBRACULUM_PASSWORD ?? "e2e-admin-pw!";

let token = "";

const client = createApiClient(
  BASE_URL,
  bearerTokenAuth(() => token),
);

const login = await loginNative(client, {
  email: EMAIL,
  password: PASSWORD,
  preferredLocale: "en",
});
token = login.token;

const me = await getAuthMe(client);
console.log("auth/me workspaces:", me.workspaces.length);

const { workspaces } = await listWorkspaces(client);
console.log("workspaces:", workspaces.map((w) => w.name).join(", "));

const { styles } = await listStyles(client);
console.log("styles:", styles.length, "first.version=", styles[0]?.version);

console.log("OK: integrator quickstart passed");
```

Expected: `first.version` is a **string** (e.g. `"2021"`) — contracts enforce wire shape; numeric version throws at parse time.

Errors on non-2xx responses surface as `ApiClientError` (status + parsed body).

---

## 5. Shell example — cookie session (web path)

Same flow as first-party web integrators — no npm required on the caller beyond `curl` + `jq`:

```bash
git clone git@github.com:umbraculum-dev/umbraculum-dev.git
cd umbraculum-dev
./scripts/integrator-api-smoke.sh http://localhost:18080
```

Steps exercised: `POST /api/auth/login` (cookie) → `/api/auth/me` → `/api/workspaces` → `/api/styles`.

---

## 6. What to read next

| Topic | Document |
|-------|----------|
| Full facade inventory | [`packages/api-client/README.md`](../packages/api-client/README.md) |
| Contract parsers | [`packages/contracts/README.md`](../packages/contracts/README.md) |
| Module registration (not HTTP) | [`third-party-module.md`](modules/contribute/third-party-module.md) |
| OpenAPI maintainer runbook | [`API-OPENAPI.md`](API-OPENAPI.md) |
| Building a non-brewery vertical | [`BUILDING-YOUR-VERTICAL.md`](BUILDING-YOUR-VERTICAL.md) |

---

## Maintainer verification

After changing `@umbraculum/contracts` or `@umbraculum/api-client` publish metadata:

```bash
./scripts/ci-parity-check.sh run --jobs docs-readmes,typecheck,dogfood-npm-smoke
```

See [`CI-PARITY.md`](CI-PARITY.md) job `dogfood-npm-smoke`.
