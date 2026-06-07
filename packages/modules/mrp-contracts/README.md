# @umbraculum/mrp-contracts

Canonical `mrp` module contract package: production-order, bill-of-material, operation, material-requirement, work-order, planned AI-tool, and planned rendering-template wire schemas.

> [!NOTE]
> Part of [Umbraculum](../../README.md) — an open-source toolset for building workspace-shaped operational applications. `mrp` is a canonical extensible domain kernel, not a finished vertical MRP suite.

## Install

```bash
npm install @umbraculum/mrp-contracts@^0.0.1
```

Public alpha — see [third-party-module.md](../../docs/modules/contribute/third-party-module.md).

## What this is

AGPL-adjacent public contract types for the canonical `mrp` module ([`docs/design/canonical-mrp-module-surface.md`](../../docs/design/canonical-mrp-module-surface.md)). Wave 1 adds schema-bound contracts so the API skeleton can expose read-only, workspace-scoped data without pretending that the August 2026 public-alpha proof is complete.

Exported surfaces:

- **`CONTRACT_VERSION` + `classifyContractVersionSkew`** — version-handshake primitives shared with other `@umbraculum/*-contracts` packages. Wave 1 version: `0.1.0-alpha.1`.
- **`ProductionOrderSchema` / `ProductionOrderLineSchema`** — planned production demand and output lines.
- **`BomSchema` / `BomLineSchema`** — source-agnostic bill-of-material shape for vertical projections such as brewery recipes.
- **`OperationSchema` / `OperationTemplateSchema` / `ScheduleableOperationSchema`** — operation payloads that can later be handed to `crp` without embedding capacity scheduling inside `mrp`.
- **`MaterialRequirementSchema`** — read-side material demand lines with availability as an assumption, not WMS inventory truth.
- **`WorkOrderPreviewSchema`** — renderable work-order preview input.
- **AI/rendering schemas** — typed payloads for module-owned AI tools (Wave 5) and RFC-0007 document templates (Wave 6): `mrp:work-order-pdf@v1`, `mrp:route-card-pdf@v1`, `mrp:material-requirements-xlsx@v1`, `mrp:production-order-csv@v1`.

## Scope

- **Contains**: Zod v4 schemas, inferred TypeScript types, response envelopes, parse wrappers, version helpers, planned AI-tool payload schemas, and planned document-template payload schemas.
- **Does not contain**: web/native pages, write request schemas, brewery projection code, API runtime tool/template registration (those live under `services/api/src/modules/mrp/`), inventory reservation logic, WMS behavior, or a full ready-to-sell MRP product.

## Build / test / lint (local)

From repo root, run Node/npm inside the project container:

- **Build**: `npm run build -w @umbraculum/mrp-contracts`
- **Test**: `npm run test -w @umbraculum/mrp-contracts`
- **Typecheck**: `npm run typecheck -w @umbraculum/mrp-contracts`
- **Dist refresh**: `bash scripts/build-packages-in-docker.sh`

## Cross-references

- [`docs/design/mrp-crp-august-2026-co-design-plan.md`](../../docs/design/mrp-crp-august-2026-co-design-plan.md)
- [`docs/design/canonical-mrp-module-surface.md`](../../docs/design/canonical-mrp-module-surface.md)
- [`docs/design/mrp-crp-wave-6-rendering-templates-build-log.md`](../../docs/design/mrp-crp-wave-6-rendering-templates-build-log.md)
- [`docs/design/canonical-crp-module-surface.md`](../../docs/design/canonical-crp-module-surface.md)
- [`docs/modules/canonical/mrp.md`](../../docs/modules/canonical/mrp.md)
- [`services/api/src/modules/mrp/`](../../services/api/src/modules/mrp/)
