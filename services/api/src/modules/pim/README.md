# `services/api/src/modules/pim/`

Canonical `pim` module — RFC-0004 PIM API slice plus Phase E read/write paths.

> [!NOTE]
> Sixth module in the `services/api/src/modules/<code>/` β-layout per [RFC-0002](../../../../../docs/rfcs/0002-canonical-module-physical-layout.md), sibling of [`services/api/src/modules/automation/`](../automation/). Brewery has since joined the same API module shape under `services/api/src/modules/brewery/` via the RFC-0006 acceleration.

## What this is

The API-side slice of the canonical `pim` (Product Information Management) module — RFC-0004 Phase B read path, Phase E mutation routes, and the first RFC-0007 channel-feed rendering consumer. Workspace-scoped, workspace-isolated read/write APIs over the six PIM core entities (products, variants, attribute sets, attributes, categories, media-asset refs), four read-only AI tools (`pim.searchProducts`, `pim.getProductDetail`, `pim.listCategories`, `pim.listAttributeSets`), a vendor-neutral product-catalog CSV feed submitted through the canonical rendering job runner, and a `registerPimModule(app)` entry point wired into [`services/api/src/app.ts`](../../app.ts) alongside `registerAutomationModule` and the brewery tool family.

AI proposal/write tools, vendor-specific marketplace feed contracts, full web edit/delete UX, and cross-module FK references remain out of scope for this tranche by design — see [`docs/design/canonical-pim-module-surface.md`](../../../../../docs/design/canonical-pim-module-surface.md) for the surface design and phasing.

## Scope (this tranche)

| Area | Routes |
|---|---|
| Products | `GET /pim/products`, `GET /pim/products/:productId`, `POST /pim/products`, `PATCH /pim/products/:productId`, `DELETE /pim/products/:productId` |
| Variants | `GET /pim/products/:productId/variants`, `GET /pim/variants/:variantId`, `POST /pim/products/:productId/variants`, `PATCH /pim/variants/:variantId`, `DELETE /pim/variants/:variantId` |
| Attributes | `GET /pim/attributes`, `GET /pim/attributes/:attributeId`, `POST /pim/attributes`, `PATCH /pim/attributes/:attributeId`, `DELETE /pim/attributes/:attributeId` |
| Attribute sets | `GET /pim/attribute-sets`, `GET /pim/attribute-sets/:setId`, `POST /pim/attribute-sets`, `PATCH /pim/attribute-sets/:setId`, `DELETE /pim/attribute-sets/:setId` |
| Categories | `GET /pim/categories` (flat `items` + nested `tree`), `GET /pim/categories/:categoryId`, `POST /pim/categories`, `PATCH /pim/categories/:categoryId`, `DELETE /pim/categories/:categoryId` |
| Media asset refs | `GET /pim/products/:productId/media-asset-refs`, `GET /pim/media-asset-refs/:mediaAssetRefId`, `POST /pim/products/:productId/media-asset-refs`, `PATCH /pim/media-asset-refs/:mediaAssetRefId`, `DELETE /pim/media-asset-refs/:mediaAssetRefId` |
| Channel feeds | `POST /pim/channel-feeds/product-catalog-csv/jobs` |

AI tools (read-only): `pim.searchProducts`, `pim.getProductDetail`, `pim.listCategories`, `pim.listAttributeSets`.

Document templates: `pim:product-catalog-csv@v1` renders active products and variants as a workspace-scoped CSV artifact via `@umbraculum/rendering` + the API rendering job runner.

## Cross-references

- [RFC-0004](../../../../../docs/rfcs/0004-canonical-pim.md)
- [`@umbraculum/pim-contracts`](../../../../../packages/modules/pim-contracts/)
- [`services/api/prisma/schema.prisma`](../../../prisma/schema.prisma) — `pim` schema models
