# @umbraculum/brewery-api-client

Typed **brewery** vertical API client facades: recipes, brew sessions, water chemistry, inventory, equipment profiles, and related routes. Runtime validation uses parsers from `@umbraculum/brewery-contracts`; HTTP transport uses `@umbraculum/api-client` + `@umbraculum/api-client/transport`.

> [!NOTE]
> Part of [Umbraculum](../../../../README.md) — an open-source toolset for building workspace-shaped operational applications. Extracted from the platform api-client in RFC-0011 backlog (2026-06); brewery facades no longer ship under `@umbraculum/api-client`.

## Install

```bash
npm install @umbraculum/brewery-api-client@^0.0.3 @umbraculum/api-client@^0.0.3
```

Requires `@umbraculum/api-client` (create client + auth) in the same app.

## Usage

```typescript
import { bearerTokenAuth, createApiClient } from "@umbraculum/api-client";
import { listRecipes } from "@umbraculum/brewery-api-client";

const client = createApiClient(baseUrl, bearerTokenAuth(() => token));
const recipes = await listRecipes(client);
```

## Build / test / typecheck

From repo root (in container):

- **OpenAPI codegen**: `npm run openapi:codegen -w @umbraculum/brewery-api-client` (from `services/api/openapi/brewery.json`)
- **Build**: `npm run build -w @umbraculum/brewery-api-client`
- **Test**: `npm run test -w @umbraculum/brewery-api-client`
- **Typecheck**: `npm run typecheck -w @umbraculum/brewery-api-client`

Build `@umbraculum/api-client` (transport subpath) before this workspace on a clean tree.

## Cross-references

- [`packages/platform/api-client`](../../../platform/api-client/) — platform client + `./transport`.
- [`packages/verticals/brewery/contracts`](../contracts/) — wire schemas and parsers consumed by these facades.
- [RFC-0011](../../../../docs/rfcs/0011-application-surface-shell-layering.md) — vertical package extraction posture.
