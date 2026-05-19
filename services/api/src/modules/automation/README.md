# `services/api/src/modules/automation/`

Canonical `automation` module — Phase B foundation.

> [!NOTE]
> First module in the new `services/api/src/modules/<code>/` β-layout per [RFC-0002](../../../../../docs/rfcs/0002-canonical-module-physical-layout.md). Brewery flat routes in `services/api/src/routes/` are not migrated yet (RFC-0002 Decision D — H1 2027 tranche).

## Scope by phase

| Phase | What lives here |
|---|---|
| B-1 | `index.ts` exporting `registerAutomationModule(app)` calling `registerModule({ code: "automation", prismaSchema: "automation" })`. No routes / services / AI tools yet — the skeleton exists so subsequent PRs focus on the read path. |
| B-2 | `adapters/mockAdapter.ts` (deterministic `automation.mock.v0`), `services/vesselsService.ts` (DB read + `VesselStateSchema.parse(...)` translation), `routes/automationVesselsRoutes.ts` (`GET /automation/vessels`, `GET /automation/vessels/:code`), AI tools `automation.listVessels` + `automation.vesselState` (registered in `app.ts` alongside the brewery tool family), and Zod-schema migration of `packages/automation-contracts/src/adapter.ts` per [RFC-0003](../../../../../docs/rfcs/0003-validation-library-adoption.md). |
| **B-3 (this commit)** | Web routes under `apps/web/app/[locale]/(automation)/` — vessel list + vessel detail — plus a top-nav entry, `automation` i18n namespace (English + Italian placeholder), and integration tests in `services/api/src/tests/automationVessels.test.ts` covering 401 unauth, list happy path with deterministic `code asc` ordering, get-by-code happy path + 404, and **L2 cross-workspace isolation pins** (two cases: shared-code collision across workspaces, and B-only code 404 from A's session). |
| C | Real `brewery.openplc.v1` adapter implementation; `adapter_connections` lifecycle + version handshake (`AdapterConnection.contractVersion` ↔ `MAILBOX_SPEC.contractVersion`). |
| D | `AutomationAlarmEvent` raise/clear semantics, `automation.activeAlarms` AI tool, integration-metadata bridge. |
| E (H1 2027+) | Write proposals (`applyCommand`) — human-in-the-loop. |

## Surface boundary — automation vs. crp (forward-looking guardrail)

This module exposes **live controller state** for the workspace's vessels: `mode`, `currentTempC`, `targetTempC`, `alarmActive`, `lastSeenAt`. The corresponding web surface at `apps/web/app/[locale]/(automation)/` answers "what is this vessel doing **right now**, according to the adapter?"

**Out of scope here, by design (per [`docs/design/canonical-automation-module-surface.md`](../../../../../docs/design/canonical-automation-module-surface.md) §11 Non-goals):** vessel **scheduling**, **utilization**, **capacity planning**, **booking**, "next planned use", or any forecasting view. Those views belong to the future `crp` canonical module (one of the six reserved codes from RFC-0001 Decision B alongside `mrp`, `wms`, `crm`, `automation`, `pim`). When `crp` ships, it will read the same `vesselId` through `@umbraculum/equipment-contracts` (extracted from the brewery-internal `EquipmentProfile` per [`docs/design/canonical-automation-module-surface.md`](../../../../../docs/design/canonical-automation-module-surface.md) §4) and render the vessel-as-planning-resource view on its own surface.

Concrete contributor guidance:

- **Do not** add scheduling, booking, utilization-%, "next-use", or "capacity left" data to this module's routes, services, or `(automation)/` pages.
- **Do not** link from `(automation)/` pages into a future scheduling surface; the lane separation is the design discipline.
- **Do** add operational/observational data (history snapshots, alarm timeline, adapter health) here when phases C/D land — those are still automation, not crp.
- If in doubt, ask: "would removing the controller make this data meaningless?" If yes → automation. If no → likely crp or another module.

## How to insert demo vessels locally (no seed)

The Phase B-3 web pages render an empty state for a fresh workspace because the canonical seed (`services/api/prisma/seed.ts`) intentionally does not insert demo `Vessel` rows — vessels are expected to land via the adapter supervisor (Phase C+) or via integration tests, not via static seed data.

To inspect the UI with realistic data during development, insert a couple of rows directly into Postgres (replace `<your-workspace-id>` with the active workspace's id from `auth/me`):

```sql
INSERT INTO automation.vessels
  (id, workspace_id, code, display_name, vessel_kind, mode,
   current_temp_c, target_temp_c, alarm_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), '<your-workspace-id>', 'FV-01', 'Fermenter 1', 'fermenter',
   'fermenting', 18.4, 18.0, false, NOW(), NOW()),
  (gen_random_uuid(), '<your-workspace-id>', 'K-01', 'Kettle 1', 'kettle',
   'idle', NULL, NULL, false, NOW(), NOW());
```

Run this from inside the database container — see [`scripts/runtime/mysql-debug-select.sh`](../../../../../scripts/runtime/) or the equivalent psql helper if present. Delete the rows with `DELETE FROM automation.vessels WHERE workspace_id = '<your-workspace-id>';` when finished.

## Cross-references

- [`docs/design/canonical-automation-module-surface.md`](../../../../../docs/design/canonical-automation-module-surface.md) §7 (Prisma sketch), §8 (AI tools, tier limits, registration), §9 (phasing).
- [`packages/automation-contracts/`](../../../../../packages/automation-contracts/) — `MailboxSpec`, `AutomationAdapterDefinition`, `CONTRACT_VERSION`.
- [`packages/module-sdk/`](../../../../../packages/module-sdk/) — `registerModule`.
- [`services/api/prisma/schema.prisma`](../../../../prisma/schema.prisma) §automation — `Vessel`, `AdapterConnection`, `AutomationAlarmEvent`.
