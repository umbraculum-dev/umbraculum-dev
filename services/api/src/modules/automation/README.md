# `services/api/src/modules/automation/`

Canonical `automation` module — Phase B foundation.

> [!NOTE]
> First module in the new `services/api/src/modules/<code>/` β-layout per [RFC-0002](../../../../../docs/rfcs/0002-canonical-module-physical-layout.md). Brewery flat routes in `services/api/src/routes/` are not migrated yet (RFC-0002 Decision D — H1 2027 tranche).

## Scope by phase

| Phase | What lives here |
|---|---|
| **B-1 (this commit)** | `index.ts` exporting `registerAutomationModule(app)` calling `registerModule({ code: "automation", prismaSchema: "automation" })`. No routes / services / AI tools yet — the skeleton exists so subsequent PRs focus on the read path. |
| B-2 | `adapters/mockAdapter.ts`, `services/vesselsService.ts`, `routes/automationVesselsRoutes.ts`, `aiTools/{listVessels,vesselState}.ts`, vitest unit tests. |
| B-3 | Web routes under `apps/web/app/[locale]/(automation)/` and integration tests covering workspace scoping + adapter wiring. |
| C | Real `brewery.openplc.v1` adapter implementation; `adapter_connections` lifecycle + version handshake (`AdapterConnection.contractVersion` ↔ `MAILBOX_SPEC.contractVersion`). |
| D | `AutomationAlarmEvent` raise/clear semantics, `automation.activeAlarms` AI tool, integration-metadata bridge. |
| E (H1 2027+) | Write proposals (`applyCommand`) — human-in-the-loop. |

## Cross-references

- [`docs/design/canonical-automation-module-surface.md`](../../../../../docs/design/canonical-automation-module-surface.md) §7 (Prisma sketch), §8 (AI tools, tier limits, registration), §9 (phasing).
- [`packages/automation-contracts/`](../../../../../packages/automation-contracts/) — `MailboxSpec`, `AutomationAdapterDefinition`, `CONTRACT_VERSION`.
- [`packages/module-sdk/`](../../../../../packages/module-sdk/) — `registerModule`.
- [`services/api/prisma/schema.prisma`](../../../../prisma/schema.prisma) §automation — `Vessel`, `AdapterConnection`, `AutomationAlarmEvent`.
