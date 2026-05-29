# @umbraculum/crp-contracts

Canonical `crp` module contract package: resource, work-center, calendar, scheduled-operation, capacity-load, conflict, MRP-handoff, planned AI-tool, and planned rendering-template wire schemas.

> [!NOTE]
> Part of [Umbraculum](../../README.md) — an open-source toolset for building workspace-shaped operational applications. `crp` is a canonical extensible domain kernel, not a finished vertical CRP suite or equipment-control layer.

## Install

```bash
npm install @umbraculum/crp-contracts@^0.0.1
```

Public alpha — see [third-party-module.md](../../docs/modules/contribute/third-party-module.md).

## What this is

Public contract types for the canonical `crp` module ([`docs/design/canonical-crp-module-surface.md`](../../docs/design/canonical-crp-module-surface.md)). Wave 1 adds schema-bound contracts so the API skeleton can expose read-only, workspace-scoped capacity data without claiming finite scheduling, automation control, or public-alpha completion.

Exported surfaces:

- **`CONTRACT_VERSION` + `classifyContractVersionSkew`** — version-handshake primitives shared with other `@umbraculum/*-contracts` packages. Wave 1 version: `0.1.0-alpha.1`.
- **`ResourceSchema`** — constrained capacity resources: work centers, equipment, labor, external capacity, and buffers.
- **`WorkCenterSchema`** — resource groupings for capacity planning.
- **`ResourceCalendarSchema` / `AvailabilityWindowSchema`** — availability windows with explicit source-module/source-ref fields.
- **`ScheduledOperationSchema`** — scheduled placements of MRP operations onto CRP resources/work centers.
- **`CapacityBucketSchema` / `CapacityLoadSchema`** — read-side load summaries.
- **`CapacityConflictSchema`** — open or historical capacity conflicts.
- **`CrpScheduleableOperationSchema` / `MrpHandoffBatchSchema`** — typed MRP-to-CRP handoff payloads.
- **AI/rendering schemas** — typed payloads for module-owned AI tools (Wave 5) and RFC-0007 document templates (Wave 6): `crp:capacity-load-xlsx@v1`, `crp:schedule-pdf@v1`, `crp:resource-calendar-csv@v1`, `crp:conflict-report-pdf@v1`.

## Scope

- **Contains**: Zod v4 schemas, inferred TypeScript types, response envelopes, parse wrappers, version helpers, MRP handoff payload schemas, planned AI-tool payload schemas, and planned document-template payload schemas.
- **Does not contain**: web/native pages, write request schemas, brewery projection code, API runtime tool/template registration (those live under `services/api/src/modules/crp/`), automation/equipment-control commands, WMS behavior, or a full ready-to-sell CRP product.

## Build / test / lint (local)

From repo root, run Node/npm inside the project container:

- **Build**: `npm run build -w @umbraculum/crp-contracts`
- **Test**: `npm run test -w @umbraculum/crp-contracts`
- **Typecheck**: `npm run typecheck -w @umbraculum/crp-contracts`
- **Dist refresh**: `bash scripts/build-packages-in-docker.sh`

## Cross-references

- [`docs/design/mrp-crp-august-2026-co-design-plan.md`](../../docs/design/mrp-crp-august-2026-co-design-plan.md)
- [`docs/design/canonical-crp-module-surface.md`](../../docs/design/canonical-crp-module-surface.md)
- [`docs/design/mrp-crp-wave-6-rendering-templates-build-log.md`](../../docs/design/mrp-crp-wave-6-rendering-templates-build-log.md)
- [`docs/design/canonical-mrp-module-surface.md`](../../docs/design/canonical-mrp-module-surface.md)
- [`docs/modules/canonical/crp.md`](../../docs/modules/canonical/crp.md)
- [`services/api/src/modules/crp/`](../../services/api/src/modules/crp/)
