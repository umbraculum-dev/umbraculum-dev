## Floating hydrometers integrations

This document is the **end-to-end reference** for floating hydrometer integrations in Brewery App:

- **Tilt**: supported (HTTP ingest via gateway Cloud URL).
- **iSpindel**: not yet supported (token/UI + kind scaffolding exists).
- **RAPT**: not yet supported (token/UI + kind scaffolding exists).

See also:

- `docs/integrations/INTEGRATION-TOKENS.md` (token model, security, rotation)
- `docs/integrations/TILT.md` (Tilt-specific payload notes)

---

### Core concepts

- **Workspace integration**: one per `(workspaceId, kind)` (Tilt/iSpindel/RAPT).
- **Cloud URL**: the public URL a gateway posts to, shaped like:
  - `https://<our-domain>/api/integrations/<kind>/<token>`
- **Integration device**: a discovered device under a workspace integration (e.g. Tilt color BLUE).
- **Brew session attachment**: a device can be attached to a Brew Session; readings route to the active attachment.
- **Reading**: one temperature + gravity sample at a point in time; stored alongside the raw payload for debugging/forward-compat.

---

### Token model (Option 1: deterministic + reveal)

We do **not** store plaintext tokens. Tokens are:

- derived deterministically from:
  - `integrationId`
  - `tokenVersion`
  - `INTEGRATIONS_TOKEN_SECRET`
- hashed (SHA-256) and compared server-side for public ingest authentication
- **revealable** again via an authenticated endpoint (so users can re-copy Cloud URL from any browser/device)
- **rotatable** by incrementing `tokenVersion` (invalidating previous Cloud URLs)

Required env var (production):

- `INTEGRATIONS_TOKEN_SECRET`

More detail: `docs/integrations/INTEGRATION-TOKENS.md`.

---

### Data flow (Tilt supported)

Tilt devices broadcast readings over BLE. They cannot hit our API directly, so a **gateway** is required:

- TiltPi / Raspberry Pi gateway (common)
- Tilt mobile app (only logs while active/awake)

Flow:

1) User creates (or reveals) the workspace integration → copies **Cloud URL**.
2) User configures the gateway to POST to Cloud URL on an interval.
3) API ingests payload:
   - identifies/creates the integration device in the workspace
   - normalizes units (Tilt temp is assumed Fahrenheit; stored as °C)
   - stores a reading row + raw JSON
4) User attaches the device to a Brew Session.
5) Subsequent readings are routed to the Brew Session via the active attachment (single-active semantics).

Important routing rule:

- The ingest endpoint does **not** infer the brew session from the payload. Routing is done only via attachments.

---

### HTTP endpoints

#### Public ingest endpoint (gateway → API)

- `POST /api/integrations/:kind/:token`
- Current support: `kind=tilt` only

Authentication:

- the token is embedded in the URL
- server validates by hash (plaintext is never stored)

Tilt payload:

- The endpoint accepts Tilt Cloud JSON keys (and stores unknown keys in `rawJson`).
- Temperature is treated as Fahrenheit and converted to °C on ingest.

See `docs/integrations/TILT.md` for payload details.

#### Authenticated integration management (web session)

Generic (preferred, works for Tilt/iSpindel/RAPT):

- `GET /api/workspaces/:workspaceId/integrations/:kind` (status)
- `POST /api/workspaces/:workspaceId/integrations/:kind` (create or rotate)
- `POST /api/workspaces/:workspaceId/integrations/:kind/rotate-token`
- `POST /api/workspaces/:workspaceId/integrations/:kind/revoke`
- `GET /api/workspaces/:workspaceId/integrations/:kind/reveal` (re-visualize token + public path)
- `GET /api/workspaces/:workspaceId/integrations/:kind/devices`
  - Query:
    - `includeReadings=true|false` (default false)
    - `readingsLimit=<n>` (default: last reading; only used when includeReadings is true)

Tilt alias endpoints may exist for backwards-compat, but the generic routes are the long-term API surface.

#### Brew session integration (attach + read)

These operate on the Brew Session context:

- `GET /api/brew-sessions/:brewSessionId/integrations/attachments`
- `POST /api/brew-sessions/:brewSessionId/integrations/attach`
  - body: `{ kind, deviceId }`
- `POST /api/brew-sessions/:brewSessionId/integrations/detach`
  - body: `{ deviceId }`
- `GET /api/brew-sessions/:brewSessionId/integrations/readings?kind=<kind>&limit=<n>`

Notes:

- Attach is “single-active”: attaching a device detaches any previous active attachment for that device.
- Readings are scoped to the Brew Session via `brewSessionId` on the reading row.

---

### Database entities (Prisma)

High-level model relationships:

- `Integration` (workspace + kind)
  - has many `IntegrationDevice`
- `IntegrationDevice`
  - has many `IntegrationReading`
  - has many `IntegrationDeviceAttachment`
- `IntegrationDeviceAttachment`
  - links `IntegrationDevice` → `BrewSession` (active when `detachedAt` is null)
- `IntegrationReading`
  - belongs to `IntegrationDevice`
  - optionally belongs to a `BrewSession` when routed via active attachment

Implementation detail:

- Readings store both normalized numeric fields (`temperatureC`, `gravitySg`) and the gateway payload as `rawJson`.

---

### UI surfaces

#### Web

- **Ferm Data & Integration** page (token management + discovered devices + compact chart):
  - `apps/web/app/[locale]/ferm-data-integration/page.tsx`
- **Brew session detail** page (attach/detach + full chart):
  - `apps/web/app/recipes/[id]/brew-sessions/[brewSessionId]/page.tsx`

#### Native (Expo)

- Ferm Data & Integration screen:
  - `apps/native/src/screens/FermDataIntegrationScreen.tsx`
- Brew sessions flow:
  - `apps/native/src/screens/BrewSessionsListScreen.tsx`
  - `apps/native/src/screens/BrewSessionDetailScreen.tsx`

---

### Charting (Victory)

Charts are implemented in `@umbraculum/ui` for reuse:

- Web implementation: `packages/ui/src/charts/HydrometerChart.web.tsx`
- Native implementation: `packages/ui/src/charts/HydrometerChart.native.tsx`

Design notes:

- Gravity and temperature have different numeric ranges, so the chart uses:
  - a **gravity-driven Y-domain** (clamped)
  - temperature values **mapped** onto that Y-domain for plotting
  - the right axis labels and tooltips show **real °C**
- Current gravity clamp:
  - \(0.95 \le SG \le 1.20\)
  - This can be widened later if needed for high OG styles/mead.

---

### Troubleshooting

- **No devices show up**:
  - verify the gateway is actually posting to the Cloud URL
  - verify the integration exists and is not revoked
  - rotate and re-paste a new Cloud URL if in doubt
- **Readings show but chart looks wrong**:
  - verify we’re using `recordedAt` when present (it should vary by sample)
  - if the gateway sends only a receive timestamp, the chart will legitimately cluster
- **502 on `/api/*`**:
  - API container likely crashed or is still starting; restart `api` (and `web` if needed)
  - if Prisma client errors show up in API logs, run Prisma generate inside the API container

