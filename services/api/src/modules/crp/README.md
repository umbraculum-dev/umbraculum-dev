# API module: `crp`

Canonical `crp` API slice for Wave 1.

> [!NOTE]
> This module is foundation-only. It registers canonical module metadata, `crp` Prisma schema ownership, and read-only API routes. It does not ship web/native UI, write workflows, brewery projections, AI runtime tools, rendering jobs, automation control, or a complete CRP product.

## What this is

The API companion to [`@umbraculum/crp-contracts`](../../../../../packages/crp-contracts/README.md) and the public [canonical CRP surface design](../../../../../docs/design/canonical-crp-module-surface.md).

## Routes

- `GET /crp/resources`
- `GET /crp/resources/:resourceId`
- `GET /crp/work-centers`
- `GET /crp/capacity-load`
- `GET /crp/scheduled-operations`
- `GET /crp/conflicts`

All routes require an authenticated session with an active workspace and scope reads by `workspaceId` through `WorkspacesService.assertMembership`.

## Known couplings

- MRP/CRP brewery schedule reads go through `BreweryScheduleProjection` (`services/api/src/platform/breweryScheduleProjection.ts`); `PrismaBreweryScheduleProjection` is the sole cross-schema adapter.

## Cross-references

- [`docs/design/mrp-crp-wave-1-build-log.md`](../../../../../docs/design/mrp-crp-wave-1-build-log.md)
- [`docs/design/mrp-crp-august-2026-co-design-plan.md`](../../../../../docs/design/mrp-crp-august-2026-co-design-plan.md)
- [`docs/modules/canonical/crp.md`](../../../../../docs/modules/canonical/crp.md)
