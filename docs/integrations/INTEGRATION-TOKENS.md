## Integration tokens (Option 1: deterministic + reveal)

This repo uses deterministic integration tokens so users can always re-visualize the “Cloud URL” from any browser/device, without storing plaintext tokens in the database.

For the full end-to-end integration overview (tokens + attach + readings + charts), see:

- `docs/integrations/FLOATING-HYDROMETERS.md`

### Key idea

- DB stores `token_hash` (SHA-256), not the token itself.
- Token is derived on demand from:
  - `integrationId`
  - `tokenVersion`
  - `INTEGRATIONS_TOKEN_SECRET`

This means:

- Tokens can be **revealed** again for authorized users.
- Tokens can be **rotated** by incrementing `tokenVersion`.
- Compromise risk is concentrated in `INTEGRATIONS_TOKEN_SECRET` (treat as a production secret).

### Required environment variable

- `INTEGRATIONS_TOKEN_SECRET`
  - **Required in production**
  - In dev, a fallback is used if unset (insecure; do not rely on it outside local development).

### Reveal endpoint

- Generic: `GET /api/workspaces/:workspaceId/integrations/:kind/reveal`
- Tilt alias: `GET /api/workspaces/:workspaceId/integrations/tilt/reveal`

Both require:

- authenticated session
- active workspace matches `:workspaceId`
- workspace membership

### Invalidation note (legacy random tokens)

When migrating from random tokens to deterministic tokens, old random-token URLs are invalidated by recomputing `token_hash`.

Backfill helper:

- `npm run db:backfill:integration-tokens`

