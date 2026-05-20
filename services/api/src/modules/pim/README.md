# `services/api/src/modules/pim/`

Canonical `pim` module — RFC-0004 Phase B read path.

> [!NOTE]
> Sixth module in the `services/api/src/modules/<code>/` β-layout per [RFC-0002](../../../../../docs/rfcs/0002-canonical-module-physical-layout.md), sibling of [`services/api/src/modules/automation/`](../automation/). Brewery flat routes in `services/api/src/routes/` are not migrated yet (RFC-0002 Decision D — H1 2027 tranche).

## What this is

The API-side slice of the canonical `pim` (Product Information Management) module — RFC-0004 Phase B read path. Workspace-scoped, workspace-isolated read APIs over the six PIM core entities (products, variants, attribute sets, attributes, categories, media-asset refs), four read-only AI tools (`pim.searchProducts`, `pim.getProductDetail`, `pim.listCategories`, `pim.listAttributeSets`), and a `registerPimModule(app)` entry point wired into [`services/api/src/app.ts`](../../app.ts) alongside `registerAutomationModule` and the brewery tool family.

Write paths (POST/PATCH/DELETE), channel feeds, and cross-module FK references are out of scope for this tranche by design — see [`docs/design/canonical-pim-module-surface.md`](../../../../../docs/design/canonical-pim-module-surface.md) for the surface design and phasing.

## Scope (this tranche)

| Area | Routes |
|---|---|
| Products | `GET /pim/products`, `GET /pim/products/:productId` |
| Variants | `GET /pim/products/:productId/variants`, `GET /pim/variants/:variantId` |
| Attribute sets | `GET /pim/attribute-sets`, `GET /pim/attribute-sets/:setId` |
| Categories | `GET /pim/categories` (flat `items` + nested `tree`), `GET /pim/categories/:categoryId` |

AI tools (read-only): `pim.searchProducts`, `pim.getProductDetail`, `pim.listCategories`, `pim.listAttributeSets`.

## Cross-references

- [RFC-0004](../../../../../docs/rfcs/0004-canonical-pim.md)
- [`@umbraculum/pim-contracts`](../../../../../packages/pim-contracts/)
- [`services/api/prisma/schema.prisma`](../../../prisma/schema.prisma) — `pim` schema models
