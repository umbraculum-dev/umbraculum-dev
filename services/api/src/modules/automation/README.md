# `services/api/src/modules/automation/`

Canonical `automation` module — Phase B foundation.

> [!NOTE]
> First module in the new `services/api/src/modules/<code>/` β-layout per [RFC-0002](../../../../../docs/rfcs/0002-canonical-module-physical-layout.md). Brewery flat routes in `services/api/src/routes/` are not migrated yet (RFC-0002 Decision D — H1 2027 tranche).

## Scope by phase

| Phase | What lives here |
|---|---|
| B-1 | `index.ts` exporting `registerAutomationModule(app)` calling `registerModule({ code: "automation", prismaSchema: "automation" })`. No routes / services / AI tools yet — the skeleton exists so subsequent PRs focus on the read path. |
| **B-2 (this commit)** | `adapters/mockAdapter.ts` (deterministic `automation.mock.v0`), `services/vesselsService.ts` (DB read + `VesselStateSchema.parse(...)` translation), `routes/automationVesselsRoutes.ts` (`GET /automation/vessels`, `GET /automation/vessels/:code`), AI tools `automation.listVessels` + `automation.vesselState` (registered in `app.ts` alongside the brewery tool family), and Zod-schema migration of `packages/automation-contracts/src/adapter.ts` per [RFC-0003](../../../../../docs/rfcs/0003-validation-library-adoption.md). |
| B-3 | Web routes under `apps/web/app/[locale]/(automation)/` and integration tests covering workspace scoping + adapter wiring. |
| C | Real `brewery.openplc.v1` adapter implementation; `adapter_connections` lifecycle + version handshake (`AdapterConnection.contractVersion` ↔ `MAILBOX_SPEC.contractVersion`). |
| D | `AutomationAlarmEvent` raise/clear semantics, `automation.activeAlarms` AI tool, integration-metadata bridge. |
| E (H1 2027+) | Write proposals (`applyCommand`) — human-in-the-loop. |

## Cross-references

- [`docs/design/canonical-automation-module-surface.md`](../../../../../docs/design/canonical-automation-module-surface.md) §7 (Prisma sketch), §8 (AI tools, tier limits, registration), §9 (phasing).
- [`packages/automation-contracts/`](../../../../../packages/automation-contracts/) — `MailboxSpec`, `AutomationAdapterDefinition`, `CONTRACT_VERSION`.
- [`packages/module-sdk/`](../../../../../packages/module-sdk/) — `registerModule`.
- [`services/api/prisma/schema.prisma`](../../../../prisma/schema.prisma) §automation — `Vessel`, `AdapterConnection`, `AutomationAlarmEvent`.
