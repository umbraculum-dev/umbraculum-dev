# @umbraculum/rendering

Canonical document and file rendering adapter layer for Umbraculum. RFC-0007 PR1-PR7 have landed the adapter layer, API-owned job orchestration, sync and async consumers, and the platform AI tool.

> [!NOTE]
> Part of [Umbraculum](../../../README.md) — an open-source toolset for building workspace-shaped operational applications.

## What this is

`@umbraculum/rendering` is the implementation package for the canonical document / file rendering pipeline committed in [RFC-0007](../../../docs/rfcs/0007-canonical-document-rendering.md). It owns adapter-level helpers for the selected engines while API-specific job orchestration, persistence, HTTP routes, and delivery mechanisms live in `services/api`.

## Scope

- **Contains**: engine-major dependency pins, SDK type re-exports, adapter-level helpers for eta, MJML v5, CSV, XLSX, XML, barcode/QR, and an injectable Gotenberg HTTP client.
- **Does not contain**: Fastify route handlers, Prisma `rendering` models, process lifecycle wiring, AI tools, BeerJSON migration, or PIM channel-feed templates. RFC-0007 keeps BullMQ workers, signed retrieval, the `render_document` AI tool, BeerJSON export migration, and the PIM product-catalog CSV template API-owned under `services/api`.

## Exports / Surface

| Symbol | Purpose |
|---|---|
| `DocumentTemplate<TData>` | Module-owned template definition registered via `registerModule({ documentTemplates })`. |
| `RenderKind` | Canonical render-kind union committed by RFC-0007 §4.1. |
| `RenderDelivery` | Delivery intent union: `stream-response`, `persist-to-media`, or `email`. |
| `RenderJob<TData>` | Typed render request shape used by future job submission APIs. |
| `RenderResult` | Status/result shape returned by the future rendering pipeline. |
| `RenderContext` / `RenderLogger` | Minimal SDK-side execution context contracts for template rendering. |
| `RenderedArtifact` | Implementation-owned immediate adapter output: kind, content type, filename extension, and SDK-compatible body. |
| `renderEtaTemplate` / `renderEtaHtmlArtifact` | eta template rendering helpers for HTML output. |
| `renderMjmlToHtml` / `renderMjmlHtmlArtifact` | MJML v5 email composition helpers that preserve validation messages. |
| `renderCsv` | `@fast-csv/format` helper for CSV byte output. |
| `renderXlsxWorkbook` | exceljs workbook helper for XLSX byte output. |
| `renderXml` | xmlbuilder2 helper for XML byte output. |
| `renderBarcode` / `renderQr` | bwip-js helpers for PNG barcode and QR output. |
| `createGotenbergClient` | Injectable Gotenberg HTTP client for HTML-to-PDF and DOCX/ODT-to-PDF request construction. |

The source of truth for these types is `@umbraculum/module-sdk` so third-party module authors can import the SDK surface under the MIT scope described in [`docs/LICENSING.md`](../../../docs/LICENSING.md) §6.2. This package re-exports them for discoverability alongside the future AGPLv3 rendering implementation.

## Usage

Module authors should import rendering types from the SDK boundary:

```ts
import type { DocumentTemplate } from "@umbraculum/module-sdk";
```

This package offers the same type exports for readers looking at the rendering package directly:

```ts
import type { RenderKind, RenderResult } from "@umbraculum/rendering";
```

Runtime usage such as `renderJob.submit(...)` is intentionally not exported from this package. The adapter helpers render one artifact at a time; RFC-0007 wires BullMQ-backed job submission, DB-backed artifact persistence, Fastify routes, the BeerJSON sync proof, the `render_document` AI tool, and the PIM product-catalog CSV consumer in `services/api`.

## Build / test / lint (local)

Run commands from the repo root inside the project container, not via host `npm`:

- **Build**: `npm run build:packages` (or `./scripts/build-packages-in-docker.sh` for the Docker route)
- **Test**: `npm run test --workspace=@umbraculum/rendering`
- **Lint**: `npm run lint --workspace=@umbraculum/rendering`
- **Typecheck**: `npm run typecheck --workspace=@umbraculum/rendering`

## Consumer modules

Registered templates and convenience routes are indexed in the horizontal surface doc (source of truth for operators and plan authors):

- [`docs/design/canonical-document-rendering-surface.md`](../../../docs/design/canonical-document-rendering-surface.md) §3 — template registry
- **brewery** — `brewery:beerjson-export@v1` (sync proof)
- **pim** — `pim:product-catalog-csv@v1` (first async consumer, PR7)
- **mrp** / **crp** — eight templates (Wave 6); see module surface docs §11 / §13

When adding a module-owned template, update the registry row in the same PR.

## How it fits in

- **Consumed by**: module templates registered through `@umbraculum/module-sdk`; `services/api` rendering job orchestration that submits and executes rendering jobs. Current worked consumers include BeerJSON export, PIM product-catalog CSV, and MRP/CRP Wave 6 templates.
- **Depends on**: `@umbraculum/module-sdk` for the MIT-owned type surface and the selected engine packages from RFC-0007 §6.1.
- **Hands off to**: `services/api` for `persist-to-media` delivery, v1 DB-backed artifacts, and signed URLs until a future media persistence layer exists.

## Status

RFC-0007 PR1-PR7 are complete. Engine-major pins are present in `package.json`: Gotenberg is wired as an internal `gotenberg/gotenberg:8` Compose sidecar, while the npm-backed engines are pinned to the RFC-0007 §6.1 major families except MJML, which is pinned to v5 after PR1 dependency-audit review found the v4 tree carried high-severity transitive advisories. Gotenberg client code remains injectable and tested with mocks in this package; BullMQ, Prisma schema, Fastify routes, v1 DB-backed artifact persistence, AI tooling, and first consumers live outside this package in the API service.

## Consumer modules

Registered template refs and delivery-mode rules are maintained in the horizontal surface doc (single source of truth for agents and reviewers):

- [`docs/design/canonical-document-rendering-surface.md`](../../../docs/design/canonical-document-rendering-surface.md) §2 — template registry (`module:template@version`)
- [`docs/AI-CONSULTANT.md`](../../../docs/AI-CONSULTANT.md) — `render_document` tool and consultant-visible refs

When adding templates from a new module, update the registry table in the same PR.

## Further reading

- [`docs/rfcs/0007-canonical-document-rendering.md`](../../../docs/rfcs/0007-canonical-document-rendering.md) — commitment artifact for canonical rendering
- [`docs/design/canonical-document-rendering-surface.md`](../../../docs/design/canonical-document-rendering-surface.md) — as-built horizontal surface
- [`docs/design/canonical-document-rendering-engine-rationale.md`](../../../docs/design/canonical-document-rendering-engine-rationale.md) — comparative rationale behind the engine picks
- [`docs/modules/contribute/horizontal-package.md`](../../../docs/modules/contribute/horizontal-package.md) — horizontal-package contribution path and consumption-contract checklist
- [`packages/sdk/module-sdk/README.md`](../../modules/module-sdk/README.md) — SDK package that owns the MIT type surface
- [`packages/platform/media/README.md`](../media/README.md) — package that will own persisted render artifacts and signed URLs
