# API module: `mrp`

Canonical `mrp` API slice for Wave 1.

> [!NOTE]
> This module is foundation-only. It registers canonical module metadata, `mrp` Prisma schema ownership, and read-only API routes. It does not ship web/native UI, write workflows, brewery projections, AI runtime tools, rendering jobs, or a complete MRP product.

## What this is

The API companion to [`@umbraculum/mrp-contracts`](../../../../../packages/mrp-contracts/README.md) and the public [canonical MRP surface design](../../../../../docs/design/canonical-mrp-module-surface.md).

## Routes

- `GET /mrp/production-orders`
- `GET /mrp/production-orders/:orderId`
- `GET /mrp/production-orders/:orderId/material-requirements`
- `GET /mrp/boms`
- `GET /mrp/boms/:bomId`

All routes require an authenticated session with an active workspace and scope reads by `workspaceId` through `WorkspacesService.assertMembership`.

## Cross-references

- [`docs/design/mrp-crp-wave-1-build-log.md`](../../../../../docs/design/mrp-crp-wave-1-build-log.md)
- [`docs/design/mrp-crp-august-2026-co-design-plan.md`](../../../../../docs/design/mrp-crp-august-2026-co-design-plan.md)
- [`docs/modules/canonical/mrp.md`](../../../../../docs/modules/canonical/mrp.md)
