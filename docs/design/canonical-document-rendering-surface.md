# Canonical document rendering — horizontal surface

**Tier:** Public  
**Status:** As-built post RFC-0007 PR1–7 (2026-05-25); registry updated for MRP/CRP Wave 6 (2026-05-27)  
**Audience:** module authors, API maintainers, AI consultant implementors, reviewers  
**Resolves:** [RFC-0007](../rfcs/0007-canonical-document-rendering.md) — operational companion to governance text (RFC-0003 shape: commitment in RFC, engines in rationale, as-built here)  
**Builds on:** [`canonical-document-rendering-engine-rationale.md`](canonical-document-rendering-engine-rationale.md), [`packages/rendering/README.md`](../../packages/rendering/README.md), [`packages/module-sdk/README.md`](../../packages/module-sdk/README.md)

> **Disclaimer.** This is the single source of truth for registered `module:template@version` refs, delivery-mode behavior, and the module-author checklist. RFC-0007 commits obligations; this doc tracks what ships. Update §2 in the same PR as any new `documentTemplates` registration.

---

## 1. Summary

| Concern | Owner | Doc / code |
|---------|-------|------------|
| Governance | RFC-0007 | [`docs/rfcs/0007-canonical-document-rendering.md`](../rfcs/0007-canonical-document-rendering.md) |
| Engine picks | Rationale | [`canonical-document-rendering-engine-rationale.md`](canonical-document-rendering-engine-rationale.md) |
| Adapter package | `@umbraculum/rendering` | [`packages/rendering/`](../../packages/rendering/) |
| Template registration | `registerModule({ documentTemplates })` | [`packages/module-sdk/src/moduleRegistry.ts`](../../packages/module-sdk/src/moduleRegistry.ts) |
| Job orchestration | API service | [`services/api/src/services/rendering/`](../../services/api/src/services/rendering/) |
| Platform AI tool | `render_document` | [`docs/AI-CONSULTANT.md`](../AI-CONSULTANT.md) |

Modules MUST NOT bundle parallel PDF/XLSX/DOCX/CSV/barcode libraries or a private job queue (RFC-0007 §8).

**OpenAPI:** `/rendering/*` job routes appear under tag `rendering` in the alpha partial spec — [`API-OPENAPI.md`](../API-OPENAPI.md).

Refs use `<module>:<name>@v<major>`. Collision across modules is forbidden; collision within a module is caught at `registerModule()` boot.

| Template ref | Kind | Module | Delivery (typical) | HTTP / entry | Input schema |
|--------------|------|--------|-------------------|--------------|--------------|
| `brewery:beerjson-export@v1` | json | brewery | `stream-response` | `GET` recipes export | [`brewery/documentTemplates.ts`](../../services/api/src/modules/brewery/documentTemplates.ts) |
| `pim:product-catalog-csv@v1` | csv | pim | `persist-to-media` (async job) | `POST /pim/channel-feeds/product-catalog-csv/jobs` | [`pim/documentTemplates.ts`](../../services/api/src/modules/pim/documentTemplates.ts) |
| `mrp:work-order-pdf@v1` | pdf | mrp | `persist-to-media` | `POST /mrp/work-orders/:orderId/render-jobs` | `@umbraculum/mrp-contracts` |
| `mrp:route-card-pdf@v1` | pdf | mrp | `persist-to-media` | render-job routes | `@umbraculum/mrp-contracts` |
| `mrp:material-requirements-xlsx@v1` | xlsx | mrp | `persist-to-media` | render-job routes | `@umbraculum/mrp-contracts` |
| `mrp:production-order-csv@v1` | csv | mrp | `persist-to-media` | render-job routes | `@umbraculum/mrp-contracts` |
| `crp:capacity-load-xlsx@v1` | xlsx | crp | `persist-to-media` | render-job routes | `@umbraculum/crp-contracts` |
| `crp:schedule-pdf@v1` | pdf | crp | `persist-to-media` | render-job routes | `@umbraculum/crp-contracts` |
| `crp:resource-calendar-csv@v1` | csv | crp | `persist-to-media` | render-job routes | `@umbraculum/crp-contracts` |
| `crp:conflict-report-pdf@v1` | pdf | crp | `persist-to-media` | render-job routes | `@umbraculum/crp-contracts` |

**Update trigger:** any PR that adds or renames entries in a module's `documentTemplates.ts` MUST add or update the row above and cite this file in the PR description.

**Discovery at runtime:** `listRegisteredDocumentTemplates()` (module registry) — see [`renderingJobs.test.ts`](../../services/api/src/tests/renderingJobs.test.ts) for registration tests.

---

## 3. Delivery modes

| Mode | Meaning | Shipped today |
|------|---------|---------------|
| `stream-response` | Synchronous bytes returned on the HTTP response (e.g. BeerJSON export) | Yes — brewery proof |
| `persist-to-media` | Async BullMQ job; artifact stored; signed retrieval URL when complete | Yes — PIM channel feed, MRP/CRP render-jobs |
| `email` | Rendered body handed to outbound delivery | **Rejected** — [RFC-0008](../rfcs/0008-notifications-outbound-delivery.md); composition only until notifications service lands |

Job state lives in Prisma `rendering` schema (RFC-0002 convention 4). Redis hosts BullMQ per [`docs/REDIS-ARCHITECTURE.md`](../REDIS-ARCHITECTURE.md). Gotenberg sidecar: `gotenberg/gotenberg:8` in Compose for HTML→PDF.

---

## 4. Module author checklist

1. **Define** `DocumentTemplate<TData>` in the module's API `documentTemplates.ts` with Zod `schema` ([RFC-0003](../rfcs/0003-validation-library-adoption.md)).
2. **Export** stable `MODULE_*_TEMPLATE_REF` constants from `packages/<code>-contracts` when the payload is shared or cited by routes/tests.
3. **Register** via `registerModule({ documentTemplates: [...] })` in `services/api/src/modules/<code>/index.ts`.
4. **Implement** `render(data, context)` using `@umbraculum/rendering` adapters only — no direct Gotenberg/exceljs in module code except through the shared helpers used by existing templates.
5. **Expose** routes: either sync stream (brewery pattern) or async `RenderingJobService.submit` (PIM / MRP / CRP pattern — copy [`pimChannelFeedsRoutes.ts`](../../services/api/src/modules/pim/routes/channelFeedsRoutes.ts)).
6. **Test:** registration + L2 isolation + job success (see [`pimChannelFeeds.test.ts`](../../services/api/src/tests/pimChannelFeeds.test.ts), [`mrpCrpRendering.test.ts`](../../services/api/src/tests/mrpCrpRendering.test.ts)).
7. **Document:** add a row to §2 above; add a **Rendering** subsection on the module surface doc pointing here for horizontal rules and listing module-specific refs.

Reference consumer for async CSV: [canonical-pim-module-surface.md](canonical-pim-module-surface.md) §8.3. Reference consumer for eight templates: [mrp-crp-wave-6-rendering-templates-build-log.md](mrp-crp-wave-6-rendering-templates-build-log.md).

---

## 5. Platform entry points

| Entry | Path |
|-------|------|
| `RenderingJobService` | `services/api/src/services/rendering/renderingJobService.ts` |
| `render_document` AI tool | `services/api/src/services/ai/tools/rendering/renderDocument.ts` |
| HTML→PDF helper | `services/api/src/services/rendering/htmlToPdf.ts` |
| Job routes (generic) | `services/api/src/routes/renderingJobs.ts` |

---

## 6. Cross-references

- [RFC-0007](../rfcs/0007-canonical-document-rendering.md) §12 implementation closure  
- [RFC-0008](../rfcs/0008-notifications-outbound-delivery.md) — email transport boundary  
- [`rfc-companion-documentation-audit.md`](rfc-companion-documentation-audit.md) — matrix row 0007  
- [`docs/modules/contribute/horizontal-package.md`](../modules/contribute/horizontal-package.md)  
- [`DEVELOPMENT.md`](../../DEVELOPMENT.md) — Gotenberg + Redis stack for local dev  
