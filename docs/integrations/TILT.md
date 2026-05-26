## Tilt integration (device attach)

This document describes how Tilt Hydrometer logging is integrated into Brewery App.

For the full end-to-end integration overview (tokens + attach + readings + charts), see:

- `docs/integrations/FLOATING-HYDROMETERS.md`

### How data reaches our API

Tilt Hydrometers broadcast readings via BLE. They cannot call our API directly. A gateway must be used, typically:

- **TiltPi** (Raspberry Pi / Node-RED)
- **Tilt phone app** (only logs while the app is open/awake)

The gateway is configured with a **Cloud URL**. It performs HTTP POST requests to that URL on an interval (often 15 minutes, depending on gateway settings).

### Public ingest endpoint (Cloud URL)

- **URL to paste in Tilt gateway**: `https://<our-domain>/api/integrations/tilt/<token>`
- **Method**: `POST`
- **Auth**: token in URL; server stores only a SHA-256 hash of the token

#### Token reveal (Option 1)

Tokens are deterministic and can be re-visualized from any browser (no client-side remembering):

- **Reveal**: `GET /api/workspaces/:workspaceId/integrations/tilt/reveal`
- Generic (by kind): `GET /api/workspaces/:workspaceId/integrations/:kind/reveal`

Token generation uses `INTEGRATIONS_TOKEN_SECRET` (required in production). The DB does not store plaintext tokens.

#### Supported payload (v1)

We support the Tilt “Cloud URL” JSON keys and accept extra keys for forward compatibility (stored in `rawJson`).

Typical fields (strings or numbers):

- `Temp`: temperature (assumed Fahrenheit, converted to °C on ingest)
- `SG`: specific gravity (stored as float)
- `Color`: Tilt color (used as identity if no `uuid`/`mac` is provided)
- `Beer`, `Comment`, `Timepoint`: stored in `rawJson`

Optional identity fields (if present):

- `uuid`
- `mac` / `macid`
- `timestamp`

#### Routing to brew sessions (Option B)

The ingest endpoint does **not** infer the brew session from the payload.

Instead:

- each discovered device is registered under the workspace integration
- the user attaches the device to a **Brew Session**
- future readings are routed to the currently active attachment (“single-active”)

### Management endpoints (authenticated, workspace-scoped)

All endpoints below require an authenticated web session and an active workspace.

- **Create integration / generate token**: `POST /api/workspaces/:workspaceId/integrations/tilt`
- **Rotate token**: `POST /api/workspaces/:workspaceId/integrations/tilt/rotate-token`
- **Revoke integration**: `POST /api/workspaces/:workspaceId/integrations/tilt/revoke`
- **Reveal token + Cloud URL**: `GET /api/workspaces/:workspaceId/integrations/tilt/reveal`
- **Integration status**: `GET /api/workspaces/:workspaceId/integrations/tilt`
- **Devices list (with active attachment + last reading)**: `GET /api/workspaces/:workspaceId/integrations/tilt/devices`
- **Attach device**: `POST /api/workspaces/:workspaceId/integrations/tilt/devices/:deviceId/attach` body `{ brewSessionId }`
- **Detach device**: `POST /api/workspaces/:workspaceId/integrations/tilt/devices/:deviceId/detach`
- **Recent brew sessions**: `GET /api/workspaces/:workspaceId/brew-sessions/recent?limit=25`

### Web UI

The initial UX lands here:

- `apps/web/app/[locale]/ferm-data-integration/page.tsx` → accordion section **Integrations**

Flow:

- Create integration → copy Cloud URL into Tilt gateway
- Reveal Cloud URL anytime to reconfigure gateways
- Wait for first log (device appears)
- Attach device to brew session

