# RFC-0007 — Canonical document rendering pipeline and async job runner

**Tier:** Public
**Status:** Accepted 2026-05-21; implemented / closed 2026-05-25 (solo-author + core-team approval per [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §13 change procedure; pre-public-flip)
**Audience:** prospective module developers (canonical Tier 1, tier-6 vertical-configuration, tier-3/4 third-party, tier-5 customer-private), self-hosters, hosted-service customers, the AI consultant orchestrator design conversation, future maintainers reviewing what the project committed and why.
**Document role:** canonical document/file rendering pipeline decision for module-owned templates and platform delivery.

> **Disclaimer.** This RFC extends [RFC-0001 §8.2](0001-modules-tiers-governance-and-automation-placement.md)'s horizontal-platform-services consumption contract with a **new row** covering document / file / report rendering, allocates a **new layer-3 horizontal package** (`@umbraculum/rendering`), adds a **new SDK extension point** (`registerDocumentTemplate`), and commits the project's first opinion on **rendering engines** (PDF / XLSX / CSV / DOCX / barcode / XML / template engine / job queue). The pattern is the [RFC-0003](0003-validation-library-adoption.md) "commit-the-stack-pick-inside-the-RFC" shape rather than the [RFC-0004](0004-canonical-pim.md) "defer-the-surface" shape — chosen explicitly during plan-confirmation so the engine debate happens in one review cycle. Net-new platform service; no existing module implementation needs to be refactored at allocation time (the only file generator today is BeerJSON JSON export at [`services/api/src/modules/brewery/routes/recipesExport.ts`](../../services/api/src/modules/brewery/routes/recipesExport.ts), which already conforms to the new contract's small-sync mode). The change procedure mirrors [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §13 and [`docs/LICENSING.md`](../LICENSING.md) §10.

---

## 1. Summary

This RFC commits to **five decisions** and explicitly defers two clusters of follow-on work:

- **Decision A — Document / file rendering is a horizontal platform concern.** Modules MUST consume the platform's rendering pipeline for any non-JSON file output (PDF, XLSX, CSV, DOCX, ODT, XML feeds, HTML emails, barcodes / QR). Modules MUST NOT bundle their own PDF / XLSX / DOCX / CSV / barcode libraries; modules MUST NOT run a parallel job queue for rendering work. Adds **one row** to [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §8.2's obligation table.

- **Decision B — Allocate `@umbraculum/rendering` as a new layer-3 horizontal infrastructure package.** Industry-agnostic per [RFC-0002](0002-canonical-module-physical-layout.md) §4. AGPLv3 (horizontal platform code default per [LICENSING.md](../LICENSING.md) §6.1). The package's **SDK-side types** (`RenderJob<TData>`, `DocumentTemplate<TData>`, `RenderResult`, `RenderKind`) are re-exported from `@umbraculum/module-sdk` and remain **MIT** per [LICENSING.md](../LICENSING.md) §6.2 enumeration — same pattern the AI-tool surface follows.

- **Decision C — SDK extension point `registerDocumentTemplate` in `@umbraculum/module-sdk`.** New slot on `registerModule()` alongside the existing `registerAiTools` / `addonCodes` / `tierLimits` slots. Per-template input shape validated via the library-agnostic `ValidatedSchema<T>` interface per [RFC-0003](0003-validation-library-adoption.md) Decision C. Modules contribute typed templates; the platform owns the engines.

- **Decision D — Engine selection (the stack pick).** **PDF + DOCX/ODT→PDF**: Gotenberg sidecar (Chromium HTML→PDF; LibreOffice for DOCX/ODT). **XLSX**: exceljs in-process. **CSV**: `@fast-csv/format` streaming. **Barcode / QR**: bwip-js. **XML feeds**: xmlbuilder2. **HTML / email template engine**: eta. **Email HTML composition**: MJML → HTML through the same pipeline. Rationale + rejected alternatives in §6.

- **Decision E — Async job runner.** Default delivery mode is **async-via-BullMQ on the existing Redis** ([`docs/REDIS-ARCHITECTURE.md`](../REDIS-ARCHITECTURE.md)). Sync mode (`delivery.mode: "stream-response"`) is restricted to small renders (single label, single small JSON, the existing BeerJSON export — anything that completes well under a second). Job state persists in Postgres under a new `rendering` schema (per [RFC-0002](0002-canonical-module-physical-layout.md) §4 convention 4 — Prisma multiSchema). PR3 kept v1 artifact persistence API-owned in that schema with signed-URL retrieval; a future media-layer follow-up can move the persistence handoff behind [`@umbraculum/media`](../../packages/platform/media/) once that package exposes the needed surface.

The **implementation closure / deferred clusters** (§12):

1. **Implementation surface** — package scaffold, engine adapters, BullMQ wiring, per-module template adoption, AI tool surface. This was out of scope of the acceptance PR, then completed as PR1-PR7 by 2026-05-25.
2. **Future render-kind additions** — new `RenderKind` values (e.g. `pdf-a-3` for archival compliance, `xlsx-pivot-template` for advanced reporting) follow the lightweight render-kind allocation procedure in §15.3.

---

## 2. Motivation

### 2.1 The failure mode RFC-0001 §8.2 prevents, and the rendering-shaped gap it has today

[RFC-0001 §8.2](0001-modules-tiers-governance-and-automation-placement.md) is the project's structural answer to *"how do we prevent N modules from each shipping their own auth / billing / i18n / observability …?"* — the WordPress-hell scenario named in [RFC-0001 §2](0001-modules-tiers-governance-and-automation-placement.md). The §8.2 table commits one row per cross-cutting concern: modules MUST consume the platform's implementation; MUST NOT ship a parallel one; MAY extend via SDK-declared extension points.

**Document / file / report rendering is a missing row in that table.** Today's repo state — verified by scanning every `package.json` in `apps/*`, `services/*`, and `packages/*` (2026-05-21) — confirms there is no pre-existing rendering stack to retrofit:

- **Zero** PDF libraries (`pdfkit`, `pdfmake`, `@react-pdf/renderer`, `puppeteer`, `jspdf`) pinned anywhere.
- **Zero** Office libraries (`exceljs`, `xlsx`, `docx`, `office-gen`) pinned anywhere.
- **Zero** CSV streaming libraries pinned anywhere.
- **Zero** barcode libraries pinned anywhere.
- **One** file generator in production: [`services/api/src/modules/brewery/routes/recipesExport.ts`](../../services/api/src/modules/brewery/routes/recipesExport.ts), which streams a JSON-payload BeerJSON document with `Content-Disposition: attachment` — a textual handcrafted export, not a rendered binary.

That clean-slate state is exactly the **right time** to commit the obligation. The predictable failure mode if we wait:

| Future module | Will reach for | Producing fragmentation |
|---|---|---|
| `pim` Phase E (channel feeds — [deferred per surface doc §3.2 / §8.3](../design/canonical-pim-module-surface.md)) | `xml2js` for Google Shopping; bespoke CSV writers for Amazon | Two CSV escapings, two XML serializers |
| `wms` (H2 2027 working assumption; native-mandatory per [MODULES.md](../MODULES.md) §3.1) | `pdfkit` for pick lists; `bwip-js` for barcodes | Per-module layout DSL; per-module barcode discipline |
| `mrp` (H1 2027 working assumption) | `exceljs` for MRP reports; another PDF lib for work orders / route cards | Two PDF stacks loaded into one Fastify process |
| `crm` (no firm horizon) | `nodemailer` for HTML emails; `puppeteer` for "branded quote PDF" | Three template engines, three security surfaces |
| `brewery` (Tier 6 vertical) | `pdfkit` for "brew-day sheet" (printed on paper at the brewery — a real native-mandatory use case) | + a sister-repo Pi sidecar that wants its own COA PDFs |

This is precisely the WordPress-hell scenario [RFC-0001 §2](0001-modules-tiers-governance-and-automation-placement.md) names, narrowed to one slice (file / doc generation) of the platform. The structural medicine is the same: a §8.2-row obligation, an SDK extension point, and a platform-owned implementation.

### 2.2 Cost-asymmetry — why now, not later

The cost-asymmetry argument from [RFC-0003 §2](0003-validation-library-adoption.md) (the validation-library RFC's "why now, not at H1 2027" framing) applies in the same shape here:

- **Allocate now (zero existing consumers):** ~0 hours of migration cost. The §8.2 row simply adds an obligation a hypothetical-future module honors from its first line of code. The one existing JSON-export route ([`recipesExport.ts`](../../services/api/src/modules/brewery/routes/recipesExport.ts)) becomes the first proof of the sync-mode delivery path in the follow-on PR sequence (§12); behavior is preserved (still a streamed JSON download), only the seam changes.
- **Allocate later (5+ modules already shipping documents):** each module's chosen PDF / XLSX / CSV / barcode stack becomes a migration the project must individually unwind. For each module: pick the library to remove, port the templates, port the data shapes, port the delivery code, port any tests, re-validate output equivalence, coordinate the deprecation. The Magento ecosystem's *N parallel PDF-invoice extensions* is the historical precedent for what happens when this is allowed to accrete.

The cost asymmetry is well-modeled. Acting now lets the very first lines of rendering-bearing module code land against the canonical pipeline — no rename pass, no consumer-side breakage when the canonical pipeline ships later.

### 2.3 AI-consultant context-principle extension

[`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.0 is the project's cornerstone principle: *"The AI consultant operates at workspace scope, not module scope. For the consultant to give competent operational advice, it must see all installed canonical modules ... in one coherent context."* Several seemingly-independent architectural choices flow from this principle (monorepo, one shell, consumption contract, canonical discipline, peer decomposition, vertical-configuration tier).

**Document rendering is a sixth.** Centralized rendering pays a dividend here that federated rendering would lose: the AI consultant gets **one tool** (`render_document`, implemented in PR6) instead of N per-module export tools. *"Give me the packing list for picking #4711 as a PDF, then attach it to a draft email to the supplier"* routes through one orchestrator surface; the consultant does not need to know that WMS uses `pdfkit-A`, PIM uses `pdfkit-B`, and brewery has its own brew-day-sheet pipeline. Cross-module document composition (an MRP work order that embeds a PIM spec sheet; a CRM quote that bundles a WMS stock-availability table) becomes a single-pipeline concern, not a federated-orchestration concern.

This is symmetric to the AI-tool-registry argument in [RFC-0001 §8.2](0001-modules-tiers-governance-and-automation-placement.md) row *"AI platform"*: one orchestrator over many module-contributed tools, not N orchestrators per module.

### 2.4 Self-host posture preservation

[`docs/LICENSING.md`](../LICENSING.md) §6.1 and [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §2.1 commit Umbraculum to a first-class self-host story. Any rendering-stack commitment must respect that. Decision D's picks are designed against this constraint:

- **Gotenberg** is a single Docker image (Chromium + LibreOffice + PDFtk + uno-bin) with a stable HTTP API; adds one entry to `docker-compose.yml` and one line to the self-host install. Alternative: in-process Puppeteer would inject a 100+ MB Chromium download, sandboxing requirements (`--no-sandbox` reduces self-host security), and N-process Chromium memory bloat into every API container. Rejected on self-host grounds.
- **exceljs / fast-csv / bwip-js / eta / xmlbuilder2** are **zero-native-dep pure JS / TS** libraries. No `node-gyp`, no system libraries, no platform-specific binaries. They install cleanly inside the existing Node container; self-hosters do not learn new operational concepts.
- **BullMQ** runs on the **Redis the project already requires** ([`docs/REDIS-ARCHITECTURE.md`](../REDIS-ARCHITECTURE.md)). Zero new infrastructure for self-hosters. Alternative: Temporal or a dedicated job-runner would add a new operational surface and is over-scope for v1.

The self-host story is preserved end-to-end: one new sidecar (Gotenberg) for the highest-leverage rendering kind (HTML→PDF), zero new sidecars for everything else.

---

## 3. Decision A — Document / file rendering is a horizontal platform concern (commit)

**Add one row to [RFC-0001 §8.2](0001-modules-tiers-governance-and-automation-placement.md) obligation table:**

| Concern | Platform service / convention | Module obligation | Extension point if module needs more |
|---|---|---|---|
| **Document / file rendering** | `@umbraculum/rendering` (this RFC, Decision B) — Gotenberg sidecar for HTML→PDF + DOCX/ODT→PDF; exceljs for XLSX; `@fast-csv/format` for CSV; bwip-js for barcodes / QR; xmlbuilder2 for XML feeds; eta for HTML/email templates; MJML for email composition; async-via-BullMQ on existing Redis | Submit render jobs via `renderJob.submit({ kind, template, data, locale, delivery })`; module-owned templates registered via `registerDocumentTemplate(...)`; modules MUST NOT bundle parallel PDF / XLSX / DOCX / CSV / barcode / XML / template-engine libraries; modules MUST NOT run a parallel job queue for rendering work | `registerDocumentTemplate({ kind, ref, schema, render })` per template via the SDK (Decision C); new `RenderKind` values via the lightweight render-kind allocation procedure sketched in §15.3 |

The row is committed by this RFC and lands physically in `docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md` §8.2 as a same-PR cross-doc update (§10), with an italic-paragraph footer at the end of §8 recording this RFC's extension event (same shape [RFC-0004](0004-canonical-pim.md) §6 + RFC-0001 §4 footer used for the `pim` allocation).

**Why this row, not "documents" or "exports" or "files":** the term *document / file rendering* is chosen for the same reason [RFC-0001 §4.3](0001-modules-tiers-governance-and-automation-placement.md) prefers `privacy` and `notifications` as §8.2-shaped concerns (every module participates uniformly) rather than as canonical codes. Rendering crosses every module that emits a file. *Documents* alone reads too narrow (excludes XLSX / CSV / XML feeds); *exports* reads too narrow (excludes inbound HTML emails, branded one-page artifacts); *files* alone reads too broad (would absorb [@umbraculum/media](../../packages/platform/media/)'s asset-pipeline scope, which is a different concern). *Document / file rendering* is the narrowest precise framing.

---

## 4. Decision B — `@umbraculum/rendering` as a new layer-3 horizontal package (commit)

**Allocate `packages/platform/rendering/` → `@umbraculum/rendering`** as the layer-3 horizontal infrastructure package that owns the engines. Per [`docs/REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) §2, this sits at **layer 3** (cross-cutting infrastructure, industry-agnostic). Per [RFC-0002 §4](0002-canonical-module-physical-layout.md), it carries the unprefixed `@umbraculum/<name>` scope — vertical-prefixed `@umbraculum/<vertical>-<name>` is reserved for vertical-scoped packages, which rendering is not.

### 4.1 Surface sketch

(TypeScript pseudocode — not a code spec; full surface published when the package scaffold lands per §12 follow-on PR #1.)

```ts
export type RenderKind =
  | "pdf"     // HTML → PDF via Gotenberg
  | "xlsx"    // exceljs in-process, streaming
  | "csv"     // @fast-csv/format streaming
  | "docx"    // DOCX template via LibreOffice (Gotenberg sub-route)
  | "odt"     // ODT template via LibreOffice (Gotenberg sub-route)
  | "html"    // eta-rendered HTML for emails or web previews
  | "json"    // already used (BeerJSON, future channel feeds)
  | "xml"     // xmlbuilder2 (Google Shopping feeds, Amazon, etc.)
  | "barcode" // bwip-js (GS1-128, EAN, Code 128, QR)
  | "qr";     // bwip-js QR subset

export interface RenderJob<TData> {
  readonly kind: RenderKind;
  readonly templateRef: string;     // e.g. "pim:google-shopping-feed@v1"
  readonly data: TData;             // typed via the template's registered ValidatedSchema<TData>
  readonly locale?: string;         // wires to @umbraculum/i18n
  readonly delivery: RenderDelivery;
}

export type RenderDelivery =
  | { readonly mode: "stream-response" }                                           // small + sync only
  | { readonly mode: "persist-to-media"; readonly visibility: "workspace" | "public" }
  | { readonly mode: "email"; readonly to: readonly string[]; readonly subject: string };

export interface RenderResult {
  readonly jobId: string;
  readonly status: "queued" | "running" | "succeeded" | "failed";
  readonly mediaAssetId?: string;   // resolves via @umbraculum/media
  readonly signedUrl?: string;
  readonly expiresAt?: string;      // ISO-8601
  readonly error?: { readonly code: string; readonly message: string };
}

export interface DocumentTemplate<TData> {
  readonly kind: RenderKind;
  readonly ref: string;             // module:template@version, e.g. "pim:google-shopping-feed@v1"
  readonly schema: ValidatedSchema<TData>; // per RFC-0003 Decision C
  readonly render: (data: TData, ctx: RenderContext) => Promise<Buffer | NodeJS.ReadableStream>;
}

export interface RenderContext {
  readonly workspaceId: string;
  readonly userId: string;
  readonly locale: string;
  readonly logger: PlatformLogger;
  // tools the template can request: i18n.t, media.resolveSignedUrl, ...
}
```

### 4.2 License posture

- **Package implementation** (`packages/platform/rendering/src/**`, engine adapters, BullMQ wiring): **AGPLv3** per [LICENSING.md](../LICENSING.md) §6.1 (horizontal platform code default; same as every other workspace, all of which inherit from the repo-root `LICENSE`).
- **SDK-side types** (`RenderJob<TData>`, `DocumentTemplate<TData>`, `RenderResult`, `RenderKind`, `RenderDelivery`, `RenderContext`): **re-exported from `@umbraculum/module-sdk`** and remain **MIT** per [LICENSING.md](../LICENSING.md) §6.2's MIT-SDK enumeration. Same pattern the AI-tool surface follows — [`docs/LICENSING.md`](../LICENSING.md) §6.2 already lists *"the AI tool interface (`AiTool<I, O>`, scope types, and `AiToolContext` definitions)"* as MIT; rendering types join that list.

The reason for the split is identical to the AI-tool case: a third-party module developer (closed-source consultancy vertical, indie contributor, customer in-house team) needs to write `DocumentTemplate<TheirData>` without their module source becoming AGPLv3 by virtue of importing the type. The *runtime* dependency from a module to the rendering implementation is mediated by the SDK's typed surface; the *source-level* dependency is via types and interfaces, which is the MIT scope.

### 4.3 Distribution shape

ESM + CJS dual emit per [RFC-0002](0002-canonical-module-physical-layout.md) Decision C (the same dual-emit pattern every existing layer-3 package follows; see [`packages/platform/i18n/package.json`](../../packages/platform/i18n/package.json) `exports` field for the canonical shape). `"private": true` workspace-internal until the public flip — no npm-registry publish before the [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1 cutover.

---

## 5. Decision C — SDK extension point `registerDocumentTemplate` (commit)

**Add a `documentTemplates` slot to `registerModule()` in `@umbraculum/module-sdk`,** alongside the existing `registerAiTools` / `addonCodes` / `tierLimits` / `routes` slots ([`packages/sdk/module-sdk/src/types.ts`](../../packages/sdk/module-sdk/src/types.ts) — surface published with the SDK extension follow-on PR per §12).

**Sketch:**

```ts
registerModule(app, {
  code: "pim",
  prismaSchema: "pim",
  routes: [...],
  registerAiTools(registry, app) {
    registerPimTools(registry, app.prisma);
  },
  documentTemplates: [
    googleShoppingFeedTemplateV1,
    amazonInventoryFeedTemplateV1,
    productSpecSheetPdfV1,
  ],
});
```

### 5.1 The split this preserves

Per [RFC-0001 §8](0001-modules-tiers-governance-and-automation-placement.md) enforcement layer #1 (*"The `registerModule()` signature exposes only legitimate slots. There is no `auth` slot, no `billing` slot, no `session` slot — modules cannot register a competing implementation because the platform's API does not accept it"*):

- The platform exposes one new slot: `documentTemplates`.
- Modules **register templates**; modules do NOT register **engines**. The engine selection lives in Decision D and is platform-owned.
- The platform decides where the rendered output goes (signed-URL retrieval, media-asset persistence, email delivery); modules express delivery intent via `RenderDelivery` discriminated-union variants but do not own the delivery mechanism.

This is the same split that already works for `registerAiTools` (modules contribute typed `AiTool<I,O>` definitions; the platform owns the orchestrator, tool registry, prompt composition, usage ledger, audit trail) and for `tierLimits` (modules contribute typed limit slices; the platform owns the composition into the tier-limits service).

### 5.2 Validation discipline (per RFC-0003)

`DocumentTemplate<TData>` carries a `schema: ValidatedSchema<TData>` field. Internal Umbraculum modules satisfy this via Zod v4 per [RFC-0003](0003-validation-library-adoption.md) Decision B; third-party modules may use Zod, Valibot, TypeBox, or hand-rolled validators that satisfy [RFC-0003](0003-validation-library-adoption.md) Decision C's library-agnostic interface. The platform's render-job submission path validates `data` against the template's schema before any engine work begins — invalid input fails fast at the seam, not mid-render.

### 5.3 Versioned `ref` discipline

The `ref` field on every `DocumentTemplate` is **`<module>:<template-name>@<version>`** (e.g. `"pim:google-shopping-feed@v1"`). Reasons:

- The module-scope prefix (`pim:` / `wms:` / `brewery:`) prevents cross-module template-name collision in the global template registry — same rationale as the AI-tool naming convention (`wms.lowStockItems`, `pim.searchProducts`) per [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §6.2.
- The `@v1` suffix lets a module ship `google-shopping-feed@v2` alongside `@v1` during a downstream-consumer migration — same shape `CONTRACT_VERSION` already provides in `@umbraculum/automation-contracts` and `@umbraculum/pim-contracts`.
- The platform enforces ref uniqueness at boot ( `registerModule` collision-checks the combined registry, same as the existing canonical-code uniqueness check in `@umbraculum/module-sdk`'s `RESERVED_CANONICAL_MODULE_CODES` validation).

---

## 6. Decision D — Engine selection (commit)

Per-engine commit with rejected alternatives. Each row is a single project-wide commitment; modules MUST NOT introduce alternative engines for the same kind.

The comparative shopping behind each pick — surveyed candidates, trade-off framing, when each pick would flip — lives at [`docs/design/canonical-document-rendering-engine-rationale.md`](../design/canonical-document-rendering-engine-rationale.md) (~588 lines, Tier: Public). **When that doc and this RFC disagree, the rationale doc is the deeper analysis; this RFC is the commitment artifact.** Same split [RFC-0003 §2](0003-validation-library-adoption.md) uses with [`validation-library-adoption-audit.md`](../design/validation-library-adoption-audit.md).

### 6.1 The engine table

| Need | Picked engine | Pinned major | Rationale | Rejected alternatives |
|---|---|---|---|---|
| **HTML → PDF + DOCX/ODT → PDF** | **Gotenberg** (sidecar, Docker image `gotenberg/gotenberg`) | v8.x | Sidecar isolation is mandatory for self-host; Gotenberg bundles Chromium + LibreOffice + PDFtk in one image; HTTP API is stable; deployment is a single `docker compose` entry. One sidecar covers PDF + DOCX/ODT in one operational surface. | **Puppeteer in-process** — security and memory liability for self-host; `--no-sandbox` reduces hardening; Chromium download bloats every API container. **`@react-pdf/renderer`** — layout vocabulary too narrow for the general case (deferred to §11 as an *optional second template kind* once a high-design one-pager use case warrants it; not load-bearing on this RFC). **Headless LibreOffice run directly inside the API container** — drags an `apt install libreoffice` (~600 MB) into the platform image. **Commercial Carbone** — re-evaluate post-public-flip if DOCX templating expressiveness exceeds LibreOffice; not a v1 dependency. |
| **XLSX** | **exceljs** (in-process) | v4.x | Most mature open-source streaming XLSX writer; supports XLSX read + write; ESM-friendly; pure JS (no native bindings). Streaming matters for WMS-scale annual-inventory reports. | **`xlsx` (SheetJS)** — split CE/community license complicates distribution under AGPL-default policy; readme-stated licensing model has been a recurring conversation in dependent projects. **`node-xlsx`** — read-only. **`xlsx-template`** — abandoned. |
| **CSV** | **`@fast-csv/format`** (streaming) | v5.x | Streaming is necessary at WMS / PIM-feed scale (WMS year-end snapshots can exceed 10⁶ rows); zero native deps; correct RFC-4180 escaping including embedded quotes and newlines. | **`papaparse`** — browser-first; streaming on Node less battle-tested. **`csv-stringify` (csv project)** — viable alternative; `fast-csv` chosen for marginally better Node-side streaming ergonomics and a single coherent monorepo. **Hand-rolled CSV** — every project that has tried this has been bitten by quote/newline escaping; rejected as known anti-pattern. |
| **Barcodes / QR** | **bwip-js** | v4.x | Pure JS, deterministic output (byte-identical across runs given identical input — important for snapshot tests); covers GS1-128, EAN-13, Code 128, QR, Data Matrix; no native deps; no system fonts required. | **`jsbarcode` / `qrcode`** (two libraries) — covers the surface but introduces two engines for one concern. **ImageMagick `convert`** — system-dep heavy; loses self-host simplicity. |
| **HTML / email template engine** | **eta** | v3.x | TS-native, fast (faster than EJS / Handlebars in published microbenchmarks), small (~10 KB gzipped), dual ESM+CJS. **One project-wide template-syntax choice is the load-bearing decision; the specific library is replaceable, the multiplicity isn't.** | **Handlebars** — viable; rejected for slightly heavier surface + non-TS-native ergonomics. **Nunjucks** — Jinja-shaped; powerful but verbose; over-scope. **Liquid** — Shopify-shaped; introduces a Liquid-dialect surface every module developer must learn. **EJS** — historical; eta is its modern TS-native successor. **Per-module freedom** — explicitly rejected as the WordPress-hell shape narrowed to template engines. |
| **Email HTML composition** | **MJML → HTML**, then rendered through the same pipeline | v5.x | MJML is the industry-standard responsive-email DSL; compiles down to email-client-compatible HTML (handles Outlook MSO, Gmail clipping, dark-mode variance). One template-development surface for cross-client correctness. The PR1 scaffold bumped the originally drafted v4.x pin to v5.x after `mjml@4` pulled a high-severity audit tree; `mjml@5.2.2` audited clean in isolation during implementation. | **Hand-written HTML emails** — known cross-client fragility; rejected. **react-email** — React-component email templating; viable alternative; MJML chosen for broader cross-client maturity at 2026-05-21; revisit at public flip. |
| **XML feeds** | **xmlbuilder2** | v3.x | TypeScript-native, declarative, type-safe XML emission; correct namespace and CDATA handling; streaming-capable for large feeds. | **`xml2js` write side** — primarily a parser, write API less idiomatic. **String concatenation** — unsafe at scale (Google Shopping schema has 50+ optional elements; namespace/escaping bugs hide in concatenation). |
| **Job queue** | **BullMQ on existing Redis** | v5.x | Redis is already required ([`docs/REDIS-ARCHITECTURE.md`](../REDIS-ARCHITECTURE.md)); BullMQ is the mature Node-ecosystem queue; native TypeScript types; first-class delayed jobs, retries, priorities; observable via existing Redis tools. | **Temporal** — overkill for v1; introduces a new operational surface (Temporal server) self-hosters must run; revisit only if cross-module workflow orchestration becomes a project need. **`agenda` (MongoDB-backed)** — would require a new persistence layer just for jobs; rejected on self-host grounds. **Postgres-backed job queue (e.g. `pg-boss`)** — viable; BullMQ chosen because Redis is already in the stack and BullMQ's TS ergonomics + ecosystem are stronger. |

**Email composition vs delivery.** The `eta` and MJML rows commit only the composition side: the rendering pipeline can produce email-ready HTML and attachments. This RFC does **not** commit SMTP/provider transport, recipient policy, unsubscribe/compliance handling, delivery audit, abuse/rate limits, or delivery billing. Those belong to the horizontal notifications / outbound-delivery service committed separately in [RFC-0008](0008-notifications-outbound-delivery.md). Until that service exists, `delivery.mode: "email"` remains intentionally disabled.

### 6.2 Pinning discipline

Engine major versions are pinned in `@umbraculum/rendering`'s `package.json` (per [RFC-0003 §4](0003-validation-library-adoption.md) precedent for the `zod ^4.x` pin). Minor / patch versions float per standard SemVer caret. Engine **major-version bumps** require:

1. A short tracker entry in `packages/platform/rendering/CHANGELOG.md` or an equivalent engine-versions subsection in `packages/platform/rendering/README.md`.
2. Output-equivalence regression tests against the previous major's golden fixtures (the test discipline lands with the engine-adapter PRs).
3. A note in the next-released contracts version's `CONTRACT_VERSION` rationale if any template kind's wire format changes — applies particularly to PDF reproducibility (Gotenberg ↔ Chromium version interactions can affect glyph rendering and PDF byte output).

### 6.3 The split this preserves with `@umbraculum/media`

[`@umbraculum/media`](../../packages/platform/media/) is the existing layer-3 horizontal package owning the asset pipeline (uploads, transforms, CDN, manifest, asset loader). `@umbraculum/rendering` is a **producer** for the media layer; it is not a parallel asset surface. The implemented v1 keeps rendered-artifact persistence API-owned in the `rendering` Prisma schema with signed-URL retrieval. A future media-layer follow-up can move that persistence handoff behind `@umbraculum/media` once the package exposes the needed API.

- Rendering owns: engines, templates registry, render job orchestration, format serialization.
- Media owns: persistent storage, transformation pipeline, CDN, asset manifest, public/private visibility, signed URLs.
- The handoff: `RenderResult.mediaAssetId` / `RenderResult.signedUrl` — produced by rendering, resolved by media.

This is the same split that already works for `@umbraculum/i18n` (mechanism platform-owned, strings module-owned) and `@umbraculum/ui` (primitives platform-owned, screens module-owned).

---

## 7. Decision E — Async job runner (commit)

### 7.1 Delivery modes

The `RenderDelivery` discriminated union (§4.1) commits three modes:

- **`{ mode: "stream-response" }` — sync, small only.** The render runs inside the request lifecycle; result is streamed in the HTTP response. **Restricted to renders that complete well under one second** — single label, single barcode, single small JSON, the existing BeerJSON export. Enforced by a per-template `maxSyncBytes` declaration (defaults to a conservative 256 KB; templates may opt up to 2 MB; anything above forces async).
- **`{ mode: "persist-to-media", visibility }` — async, default.** Submit returns a `jobId`; client polls (or subscribes via SSE — design choice deferred to §12 follow-on PR #4) for `RenderResult` with `signedUrl`. Visibility (`"workspace"` | `"public"`) maps to `@umbraculum/media`'s existing visibility model.
- **`{ mode: "email", to, subject }` — async, fire-and-forget-with-audit.** Render runs async; output is delivered via the platform's email service. Audit-trail entry written to the same audit ledger the platform already maintains.

The default mode is **persist-to-media** for any heavy render. Sync mode is a deliberate concession to the existing JSON-export use case and to the future "give me one barcode" use case; it is not the path most templates will take.

### 7.2 Job state model

Job state persisted in Postgres under a **new `rendering` Prisma schema** (per [RFC-0002 §4](0002-canonical-module-physical-layout.md) convention 4 — `multiSchema` preview; the same shape that landed for `automation` and `pim` schemas):

```
schema "rendering" {
  RenderJob {
    id              String
    workspaceId     String
    templateRef     String
    kind            RenderKind
    status          "queued" | "running" | "succeeded" | "failed"
    deliveryMode    String
    requestedAt     DateTime
    startedAt       DateTime?
    completedAt     DateTime?
    mediaAssetId    String?
    error           Json?
    requestedById   String
  }
  RenderJobAttempt {
    id              String
    jobId           String
    attemptNumber   Int
    startedAt       DateTime
    completedAt     DateTime?
    error           Json?
  }
}
```

(Sketch only — final Prisma surface lands with §12 follow-on PR #4.)

Job records are workspace-scoped (per [RFC-0001 §8.2](0001-modules-tiers-governance-and-automation-placement.md) tenancy row); ACL is enforced via the same `requireActiveWorkspace` middleware every other route uses ([`services/api/src/plugins/requestContext.ts`](../../services/api/src/plugins/requestContext.ts)).

### 7.3 Retry / failure semantics

- Default retry policy: exponential backoff, 3 attempts, max 60s between attempts.
- Per-template override: a template can declare `retryPolicy` (e.g. external-API-dependent templates may want longer backoff).
- Permanent failures (validation error, engine-side fatal) skip retries — fail fast.
- Job results expire per the platform's retention policy; signed URLs expire on a separate (shorter) clock.

### 7.4 Observability

Every render job emits structured-log events per the [RFC-0001 §8.2](0001-modules-tiers-governance-and-automation-placement.md) observability row: `render.job.queued`, `render.job.started`, `render.job.succeeded`, `render.job.failed`, `render.job.delivered`. Same shape the AI-usage ledger already uses; same logger discipline ([`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.3).

---

## 8. What this rule explicitly does NOT centralize

Per [RFC-0001 §8.4](0001-modules-tiers-governance-and-automation-placement.md)'s *"What this rule explicitly does NOT prohibit"* precedent — pinning the split out loud so the rule reads as enabling, not constraining.

- **Templates themselves stay module-owned.** A packing list is a WMS concern; a recipe spec sheet is brewery; a Google Shopping feed is PIM (or a future commerce canonical). The platform owns *how to render*; the module owns *what an invoice looks like*. The split is identical to the one [`@umbraculum/i18n`](../../packages/platform/i18n/) already enforces: mechanism platform-owned, strings module-owned.
- **Data shapes stay contracts-package-owned.** Template input shapes are typed in `packages/<code>-contracts/` per [RFC-0002 §3](0002-canonical-module-physical-layout.md), validated by the contracts package's chosen `ValidatedSchema<T>` per [RFC-0003](0003-validation-library-adoption.md). `@umbraculum/rendering` does not introduce a parallel typing surface for template data.
- **Document semantics stay with their owning module.** Invoice numbering, retention policy, archival format requirements (e.g. PDF/A-3 for regulated industries), legal validity of an invoice in jurisdiction X — those are billing-adjacent / compliance-adjacent concerns, owned by the canonical module (billing-system-of-record) or by a future `compliance` Tier 3/4 module if one ships. The rendering pipeline produces bytes; it does not arbitrate what those bytes mean.
- **Label printers and other physical-output devices.** The rendering pipeline produces the renderable artifact (a 4×6 PDF, a ZPL-shaped barcode, a printable label image); the *transport to a physical printer* belongs to the existing integrations framework ([RFC-0001 §8.2](0001-modules-tiers-governance-and-automation-placement.md) integrations row), the same way device readings flow through the integrations framework today. This split surfaces when WMS lands and is not load-bearing on this RFC.
- **Domain-specific output formats outside the engine table.** A future module might need PDF/A-3 (regulated archival), PDF/X (print), or HL7 / FHIR XML (healthcare). New `RenderKind` values are added via the lightweight allocation procedure in §15.3 — the §8.2 row's obligation persists (use the platform pipeline; don't bundle a parallel engine), but the engine list is not closed-forever.

---

## 9. Consumption-contract checklist — the obligation flowing INTO this package

Per [RFC-0001 §8.2](0001-modules-tiers-governance-and-automation-placement.md) / Decision F. `@umbraculum/rendering` itself consumes every horizontal platform service and does NOT ship a parallel implementation. Mirrors the shape [RFC-0004 §4](0004-canonical-pim.md) used for the PIM canonical allocation.

The checklist shape itself is documented as procedure in [`docs/modules/contribute/horizontal-package.md`](../modules/contribute/horizontal-package.md) §4 (lifted from [`docs/modules/contribute/canonical-module.md`](../modules/contribute/canonical-module.md) §3 step 4 + §5). **§9 below is the worked example for a horizontal package**; [RFC-0004 §4](0004-canonical-pim.md) is the worked example for a canonical module.

| Service | `@umbraculum/rendering`'s posture | Extension points used (if any) |
|---|---|---|
| Auth (cookie web + bearer native) | Consume | None — standard auth middleware on the submit / status / retrieval routes. |
| Tenancy (workspace scoping) | Consume | None — every `RenderJob` row carries `workspaceId`; all queries scoped via `requireActiveWorkspace`. |
| ACL (workspace + role) | Consume | Standard `requireWorkspaceRole` middleware. Per-template ACL declarations (e.g. a "GL export PDF" template may require `finance_admin`) lands as a template-side declaration, not a platform-side parallel ACL system. |
| Billing (Stripe web + RevenueCat native) | Consume | Declares addon codes (e.g. `rendering_high_volume` — illustrative for hosted customers who hit job-throughput limits). Does NOT integrate with Stripe / RevenueCat directly. |
| AI (orchestrator + tool registry) | Consume | The follow-on `render_document` AI tool (§12 PR #6) registers via `registerAiTools` — one platform tool, not per-module. |
| Observability (logging, metrics, audit) | Consume | None — standard structured logger + audit-ledger entries per the §8.2 observability row. |
| i18n | Consume | `@umbraculum/i18n` for any platform-owned UI surfaces (job-status page, error messages); template-level locale handling consumes `RenderContext.locale`. |
| UI (Tamagui design system) | Consume | `@umbraculum/ui` primitives for any rendering-management screens (job history, retry, cancel — these screens may or may not ship in v1; out of scope of this RFC). |
| Secrets | Consume | Standard secrets provider; no parallel secret store. (Used by the signed-URL signer and by template-side credential needs e.g. an email-template that pulls from a workspace-scoped SMTP config.) |
| Integrations framework | Consume | Label-printer device support, when WMS lands, registers through the integrations framework — not a parallel device-ingestion path. |
| HTTP framework (Fastify on API) | Consume | Standard route registration; submit / status / cancel / retrieval routes register via Fastify's plugin pattern, same as every other API surface. |
| DB (Prisma) | Consume | Own Postgres schema `rendering` (per [RFC-0002 §4](0002-canonical-module-physical-layout.md) convention 4). No parallel ORM. |

This checklist passes cleanly — no row triggers the *"but we want to own X"* pattern [`docs/modules/contribute/canonical-module.md`](../modules/contribute/canonical-module.md) §7 names as the single most common allocation-failure cause. (Note: `@umbraculum/rendering` is not a canonical module — it is a horizontal layer-3 package — but the consumption-contract checklist applies in the same shape because [RFC-0001 §8.2](0001-modules-tiers-governance-and-automation-placement.md) obligations bind every workspace, not only canonical modules.)

---

## 10. Cross-doc updates landing in the same PR

Per [RFC-0004 §8](0004-canonical-pim.md) precedent (a consumption-contract-extension RFC bundles its cross-doc updates so the docs do not drift between RFC acceptance and follow-on implementation):

- [`docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md`](0001-modules-tiers-governance-and-automation-placement.md) §8.2 — add the **Document / file rendering** row from §3 above; add an italic-paragraph footer at the end of §8 recording this RFC's §8.2-row extension event (same shape RFC-0001 §4 footer used for the `pim` allocation).
- [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §3.7 — add a "No centralized document/file rendering pipeline" entry to the *Real gaps to plan for (catalog, not commit)* list, with a forward-pointer to this RFC as the resolution path. Light edit per the doc's §10 update protocol (§3.7 is not in the *structural* list).
- [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.1 — add a *Document / file rendering* bullet to the *Horizontal platform layer* service list, alongside the existing *i18n* / *UI primitives* / *Observability* / *Integrations framework* bullets, with a forward-pointer to this RFC. The doc's §10 marks §4 edits as structural; the structural review is satisfied by the RFC review itself.
- (Note: no §8 edit. §8.1 is titled *"Resolved through the H2 2026 backbone"* — adding rendering would be off-topic for the H2 2026 AI-backbone scope. §8.2 *"Still open / deferred"* would have to mark this entry as resolved-on-day-one, which is redundant once §3.7 names the gap with a forward-pointer and §4.1 adds the service-list bullet. The §3.7 + §4.1 + the RFC-0007 file itself is the trio.)
- [`docs/MODULES.md`](../MODULES.md) §3.3 — add an `@umbraculum/rendering` row to the horizontal-packages table; after PR1-PR7 it links to the shipped package README and records the implemented pipeline.
- [`docs/REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) §3.3 — add an `@umbraculum/rendering` row to the layer-3 horizontal infrastructure packages table; after PR1-PR7 it links to the shipped package and records the implemented pipeline.
- [`docs/rfcs/README.md`](README.md) §2 — add the RFC-0007 row to the index table with the one-line commitment from §1.

**No code changes in this PR.** The `packages/sdk/module-sdk/src/types.ts` `documentTemplates` slot addition is deliberately deferred to the §12 follow-on package-scaffold PR — committing a SDK type without the runtime that gives it meaning is the kind of partial commit [`docs/LICENSING.md`](../LICENSING.md) §6.2 / [RFC-0002](0002-canonical-module-physical-layout.md) Decision C's "SDK is published, downstream consumers pin it" framing wants the project to avoid.

---

## 11. Alternatives considered

For each rejected alternative, the rationale.

### 11.1 Per-module freedom (the WordPress-hell shape, narrowed)

A model where modules pick their own PDF / XLSX / CSV / barcode / template engines, with the platform staying out of the way.

**Rejected.** This is exactly the failure mode [RFC-0001 §2](0001-modules-tiers-governance-and-automation-placement.md) names, narrowed to one slice (rendering). The Magento ecosystem's N parallel PDF-invoice extensions is the historical cost case. The consumption-contract pattern that already governs auth / billing / i18n / observability / AI / etc. — Decision F — exists precisely to prevent this; rendering belongs in the same table for the same reason. The cost asymmetry (§2.2) makes acting now strictly preferable.

### 11.2 In-process Puppeteer instead of Gotenberg sidecar

A model where the API container imports `puppeteer` and runs headless Chromium in-process for HTML→PDF.

**Rejected.** Three concerns:

- **Self-host security.** `puppeteer` defaults to launching Chromium with sandboxing; sandboxing requires kernel features that may or may not be present on commodity self-host targets (`unprivileged_userns_clone`, `seccomp`). The common mitigation (`--no-sandbox`) is a real hardening regression on the AGPLv3 self-host story.
- **Memory.** Each running Chromium process is hundreds of MB; Node's default of one process per API container would balloon a self-host VPS that today runs comfortably at 1 GB. Sharing a Chromium across requests requires the kind of process-pool plumbing Gotenberg already provides as a sidecar.
- **Image size.** Puppeteer's Chromium download adds ~150 MB to the API container image. Gotenberg moves that mass into its own image, where it belongs.

Gotenberg's HTTP API is mature and stable; the integration is a thin HTTP client.

### 11.3 `@react-pdf/renderer` as primary PDF engine

A model where PDF is produced by composing React components with `@react-pdf/renderer`'s small layout vocabulary (Page / View / Text / Image), no sidecar required.

**Rejected as primary; reserved as optional second template kind.** `@react-pdf/renderer` produces beautiful, designer-grade PDFs for **a few high-design one-pagers** (a branded invoice, a polished quote PDF, a marketing-style PDF report). For the general case (a 50-page MRP work-order document, a 400-row WMS pick list with conditional cell formatting, a year-end inventory snapshot), its layout vocabulary is too small — it does not have CSS, it does not have HTML tables, it does not have pagination cues, it has limited typography. Picking it as primary would push every heavy-PDF use case into a layout DSL it was not designed for.

The right shape is HTML→PDF as primary (handles 95% of cases, including the boring ones), with `@react-pdf/renderer` reserved as an *optional second template kind* — added via the §15.3 render-kind allocation procedure when a high-design use case warrants it (a polished customer-facing quote PDF for the CRM module is the most likely first trigger). Not load-bearing on this RFC.

### 11.4 LibreOffice-only via the same Gotenberg sidecar

A model where the platform commits only to DOCX/ODT → PDF (templates authored in Word / LibreOffice; rendered server-side via LibreOffice headless), no HTML→PDF route.

**Rejected as exclusive.** DOCX templating is the right tool when the *template author is a non-developer* — a finance team that wants control over invoice layout, a compliance team that maintains GMP records. But it is the wrong tool for *every* template: marketing emails (HTML/MJML), Shopify product feeds (XML), barcoded picking labels (combined HTML+barcode), AI-generated summary PDFs (HTML-shaped output). Forcing all templates through DOCX would invert the developer-friendliness gradient.

LibreOffice-via-Gotenberg ships **as a sub-route** of the same sidecar, available for any template that wants it; it is not the only route. The full template-author experience for DOCX templating (variable substitution syntax, table generation, partials) lands when a use case justifies it; out of scope of this RFC.

### 11.5 No async job runner (sync-only v1)

A model where the rendering pipeline ships sync-only first; async / job runner lands in v2 when a real heavy-render use case demands it.

**Rejected.** The contract a future heavy-render consumer needs is async; if v1 ships sync-only, every consumer writes its own *N-second-HTTP-request* glue, learns that workaround is fragile (browsers time out, load balancers time out, Cloudflare 524s), and then the platform has to ship the async contract anyway. Committing async + sync together in v1 is the more honest contract.

The reverse is also relevant: if the platform commits async-only, the sync use case (existing JSON-export, single label, single barcode) becomes awkward — every call goes through a queue for no good reason. Both modes need to coexist from day one; the discriminated union in `RenderDelivery` (§4.1) is how.

### 11.6 Defer the §8.2 row commit; allocate `@umbraculum/rendering` only

A weaker shape that lets the package exist as an optional convenience without committing modules to consume it.

**Rejected.** This is the strictest reading of YAGNI (one of the alternatives considered for the PIM allocation per [RFC-0004 §5.3](0004-canonical-pim.md)) and was the path that preceded the platform owner's decision to commit comprehensively. The package-without-obligation path defers all the §2.2 cost-asymmetry benefits to a future PR that will need to do the §8.2-row work plus a multi-module migration pass. The same reasoning that took RFC-0004 from watch-list-only to allocation-now applies here: when the platform owner has already committed to build the canonical surface, the watch-list path is the wrong shape.

### 11.7 Defer engine picks to a sibling surface design doc (the RFC-0004 shape)

A model where this RFC commits Decisions A + B + C + E (obligation + package + SDK extension point + async-job posture) and defers Decision D (engine picks) to `docs/design/canonical-document-rendering-surface.md` — the RFC-0004 → canonical-pim-module-surface.md split.

**Rejected during plan-confirmation 2026-05-21.** The plan-confirmation step explicitly evaluated this against the RFC-0003 "commit-the-stack-pick-inside-the-RFC" shape and picked the latter. Rationale: rendering engines are the kind of decision where deferral lets early implementation work begin against assumed defaults, and deferral creates a window where Decision D's engine table can drift relative to the obligation Decision A imposes. RFC-0003 set the precedent that stack picks live inside the RFC when the cost of *not* picking is real (modules will start choosing their own); same shape applies here.

(This RFC retains the *option* to add a surface design doc later for documentation-of-as-built-architecture purposes — the same way [`docs/design/canonical-pim-module-surface.md`](../design/canonical-pim-module-surface.md) documents PIM's as-built surface. That doc, if it lands, would be operational documentation, not a governance commitment.)

---

## 12. Implementation closure and remaining follow-ons

At acceptance time, the core implementation surface was intentionally sequenced as follow-on work so the RFC could commit the platform contract and engine choices before code landed. That follow-on sequence is now closed: each item below has shipped. Order is the dependency-order; later items depended on earlier items having landed.

1. **[Implemented — PR1] Package scaffold** — `packages/platform/rendering/` → `@umbraculum/rendering`. README per [`docs/DOCS-README-STANDARDS.md`](../DOCS-README-STANDARDS.md); `package.json` with pinned engine versions per §6.1; surface types matching §4.1; no implementation yet.
   - Note: PR1 also recorded the MJML v5 correction after dependency-audit review found MJML v4's transitive advisory posture unacceptable.
2. **[Implemented — PR1] SDK extension** — add the `documentTemplates` slot to [`packages/sdk/module-sdk/src/types.ts`](../../packages/sdk/module-sdk/src/types.ts) + the runtime collection in `registerModule()`. Same shape as the existing `registerAiTools` slot collection. Re-export the SDK-side types from `@umbraculum/module-sdk` per §4.2 MIT split.
3. **[Implemented — PR2] Engine adapters** — Gotenberg HTTP client, exceljs adapter, bwip-js adapter, `@fast-csv/format` adapter, eta integration, MJML integration, xmlbuilder2 integration. Acceptable to land one PR per engine if dependency volume warrants it.
4. **[Implemented — PR3] Job-runner wiring** — BullMQ + Postgres job-state model (new `rendering` Prisma schema per §7.2) + Fastify routes for submit / status / cancel / signed-URL retrieval inside [`services/api`](../../services/api/). Self-host docs update: Gotenberg sidecar entry in `docker-compose.yml`; [`docs/GETTING-STARTED.md`](../GETTING-STARTED.md) section explaining the new sidecar; [`docs/REDIS-ARCHITECTURE.md`](../REDIS-ARCHITECTURE.md) update noting BullMQ's coexistence with the existing session cache.
   - Note: PR3 keeps v1 artifact persistence API-owned in the `rendering` Prisma schema and signed retrieval route. A future media-layer follow-up can move artifact storage behind `@umbraculum/media` once that package exposes the needed persistence surface.
5. **[Implemented — PR5] First proof of the pipeline** — migrate [`services/api/src/modules/brewery/routes/recipesExport.ts`](../../services/api/src/modules/brewery/routes/recipesExport.ts) (today's only file generator) to `renderJob.submit({ delivery: { mode: "stream-response" } })`. Validates the sync delivery path against a working endpoint with zero behavior change. The BeerJSON export becomes the canonical worked example of sync-mode rendering, the same way [`canonical-automation-module-surface.md`](../design/canonical-automation-module-surface.md) is the worked example of canonical-module surface design.
6. **[Implemented — PR6] AI tool** — `render_document` tool in `services/api/src/services/ai/tools/rendering/`, registered by the platform AI boot path. One platform-owned tool, not per-module, per the §2.3 AI-consultant context-principle extension. The tool's inputs are template `ref` + data + delivery hint; the tool returns `RenderResult` shape; the AI consultant composes natural-language descriptions of resulting documents from those return values.
7. **[Implemented — PR7] First real heavy-render consumer** — PIM channel-feed templates when [PIM Phase E](../design/canonical-pim-module-surface.md) ships. PR7 starts with a narrow, vendor-neutral active product-catalog CSV feed (`pim:product-catalog-csv@v1`) submitted as an async `persist-to-media` render job from the PIM API.
   - Note: Vendor-specific Google Shopping XML, Amazon CSV, Shopify, and Akeneo-shaped feeds remain future feed adapters or commerce-module work. PR7 deliberately proves the heavy-render consumer path without prematurely moving storefront-specific contracts into PIM.

PRs 1–7 are complete. The RFC-0007 core pipeline is implemented: package scaffold + SDK extension, engine adapters, BullMQ/Postgres/Fastify job runner, sync BeerJSON proof, platform-owned `render_document` AI tool, and the first async PIM channel-feed consumer.

Remaining follow-ons are downstream product surfaces rather than core RFC-0007 blockers: vendor-specific PIM feeds, a future media-layer artifact handoff once `@umbraculum/media` exposes the persistence surface, email delivery, billing/add-on policy based on usage data, and UI affordances such as an export button once PIM write paths/seed data make manual feed generation useful. In particular, the pipeline can render HTML/email-shaped content via eta + MJML, but `delivery.mode: "email"` is intentionally rejected by `RenderingJobService` until an email transport, audit policy, recipient validation, unsubscribe/compliance rules, and billing/abuse limits are designed.

---

## 13. Impact across audiences

Same audience-impact shape [RFC-0004 §6](0004-canonical-pim.md) used.

### 13.1 Contributors

- One more cross-cutting concern to be aware of: when adding a new module slice (canonical, vertical, third-party), the module's file outputs go through `renderJob.submit()`; templates register via `registerDocumentTemplate()`.
- Contributor guides under [`docs/modules/contribute/`](../modules/contribute/) can point at this RFC and [`packages/platform/rendering/README.md`](../../packages/platform/rendering/README.md) when a guide needs to discuss module-owned file outputs. Further guide expansion is documentation polish, not a core RFC-0007 blocker.
- No new contributor process. The consumption-contract pattern is familiar from auth / billing / i18n / observability rows; rendering joins the same shape.

### 13.2 Self-hosters

- **Current impact:** the implemented pipeline adds **one new sidecar** (Gotenberg) to the recommended self-host `docker-compose.yml` for PDF / DOCX / ODT conversion, plus BullMQ work on the existing Redis.
- Self-hosters not needing PDF/DOCX rendering can omit the sidecar — the rendering pipeline detects its absence and rejects PDF/DOCX render jobs with a clear `engine_not_configured` error rather than failing opaquely. XLSX / CSV / barcode / XML rendering works without the sidecar because those engines are in-process.
- The `rendering` Prisma schema has landed with the job-state and artifact persistence models.

### 13.3 Third-party module developers (post-public-flip)

- A net-new extension point (`registerDocumentTemplate`) that lets a third-party module ship templated outputs without bundling a parallel rendering stack — same as `registerAiTools` does for AI tools. The MIT-licensed type surface (§4.2) preserves the third-party developer's license freedom for their own module source.
- The closed-source-consultancy vertical pattern that [RFC-0001 §11.3](0001-modules-tiers-governance-and-automation-placement.md) names becomes easier: a consultancy can ship a closed-source PDF-heavy vertical add-on (custom-branded invoices, custom regulatory reports) without re-implementing the rendering stack — and without their proprietary module source touching AGPLv3 code at the source level.

### 13.4 Hosted-service customers

- **Current impact:** rendering-backed product surfaces can now submit sync and async jobs through the platform pipeline; the first async consumer is the PIM product-catalog CSV feed.
- Rendering-specific add-on policy remains a downstream commercial decision. The illustrative addon code `rendering_high_volume` in §9 is not a commitment; the actual addon set, if any, is decided when usage data exists to size it.

### 13.5 Enterprises evaluating Umbraculum

- A more complete cross-cutting-services map. Document rendering is one of the three questions an evaluator asks after *"what's your AI story"* and *"what's your i18n story"* (per common ERP-evaluation playbooks); having a public RFC answer this concretely closes a visible gap relative to the SAP / Odoo / Salsify comparison set.
- The Gotenberg-sidecar architectural choice (single Docker image, HTTP API, isolated process) is the kind of operational story enterprise security reviewers prefer — easier to audit than a `puppeteer`-in-the-API alternative would be.

---

## 14. Cross-references

- [RFC-0001 §8](0001-modules-tiers-governance-and-automation-placement.md) — Decision F consumption contract; the §8.2 row this RFC extends.
- [RFC-0001 §8.4](0001-modules-tiers-governance-and-automation-placement.md) — *"What this rule explicitly does NOT prohibit"* precedent for §8 above.
- [RFC-0002 §4](0002-canonical-module-physical-layout.md) — naming convention `@umbraculum/<name>` vs `@umbraculum/<vertical>-<name>`; the AGPLv3 / MIT split point for SDK-side types.
- [RFC-0002 §4 convention 4](0002-canonical-module-physical-layout.md) — Prisma `multiSchema` per-module schema convention `rendering` follows for its job-state model.
- [RFC-0003](0003-validation-library-adoption.md) — Zod v4 standard; library-agnostic `ValidatedSchema<T>` interface that `DocumentTemplate<TData>.schema` uses.
- [RFC-0004 §4](0004-canonical-pim.md) — consumption-contract checklist shape this RFC's §9 mirrors.
- [RFC-0004 §8](0004-canonical-pim.md) — same-PR cross-doc-update discipline this RFC's §10 mirrors.
- [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.0 — AI-consultant context principle that §2.3 extends.
- [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §2.1 — self-host posture that §2.4 honors.
- [`docs/LICENSING.md`](../LICENSING.md) §6.1 — AGPLv3 horizontal-platform-code default.
- [`docs/LICENSING.md`](../LICENSING.md) §6.2 — MIT SDK-package enumeration that §4.2 extends with rendering types.
- [`docs/REDIS-ARCHITECTURE.md`](../REDIS-ARCHITECTURE.md) — the Redis BullMQ rides on per §7 / §6.1.
- [`packages/sdk/module-sdk/`](../../packages/sdk/module-sdk/) — the SDK the new extension point lives in.
- [`packages/platform/media/`](../../packages/platform/media/) — the asset pipeline `RenderResult` hands off to.
- [`packages/platform/i18n/`](../../packages/platform/i18n/) — the locale pipeline `RenderContext.locale` feeds.
- [`services/api/src/modules/brewery/routes/recipesExport.ts`](../../services/api/src/modules/brewery/routes/recipesExport.ts) — the first sync-mode proof per §12 PR #5.
- [`docs/design/canonical-pim-module-surface.md`](../design/canonical-pim-module-surface.md) §3.2, §8.3 — the PIM Phase E channel-feed deferral that becomes the first heavy-render consumer per §12 PR #7.
- [`docs/design/canonical-document-rendering-surface.md`](../design/canonical-document-rendering-surface.md) — horizontal as-built surface: template registry, delivery modes, module author checklist (update §2 when adding `documentTemplates`).
- [`docs/design/rfc-companion-documentation-audit.md`](../design/rfc-companion-documentation-audit.md) — companion-doc inventory row for RFC-0007.
- [`docs/design/canonical-document-rendering-surface.md`](../design/canonical-document-rendering-surface.md) — horizontal as-built surface: template registry, delivery modes, module author checklist (RFC §11.7 optional polish; landed 2026-05-27).
- [`docs/MODULES.md`](../MODULES.md) §3.3 — horizontal packages catalog `@umbraculum/rendering` joins.
- [`docs/REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) §3.3 — layer-3 packages inventory `@umbraculum/rendering` joins.

---

## 15. Resolution

### 15.1 Acceptance

Accepted 2026-05-21 (pre-public-flip; solo author + core team approval per [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §13 change procedure). Implementation PRs 1-7 closed the core pipeline on 2026-05-25: `@umbraculum/rendering`, SDK template registration, engine adapters, BullMQ/Postgres/Fastify job runner, sync BeerJSON export, platform-owned `render_document`, and the first async PIM channel-feed consumer.

### 15.2 Change procedure

Future amendments follow the same RFC process documented in [`docs/LICENSING.md`](../LICENSING.md) §10 and [RFC-0001](0001-modules-tiers-governance-and-automation-placement.md) §13. Amendments that affect Decision A (the §8.2 row obligation) are particularly consequential — they would change what modules MUST/MUST NOT do — and we expect them to be rare. Amendments that affect Decision D (engine selection) are expected as engines evolve; the discipline in §6.2 covers minor-version drift; major-version engine replacement requires an amendment to this RFC's §6 table.

### 15.3 Lightweight render-kind allocation procedure

New `RenderKind` values (e.g. `pdf-a-3` for archival compliance, `xlsx-pivot-template` for advanced reporting, `react-pdf` for high-design one-pagers per §11.3) are added by a short tracker-entry PR — NOT a full RFC — provided:

1. The new kind is an additional engine surface (extending §6.1), not a replacement of an existing one.
2. The new engine satisfies the §2.4 self-host posture (zero new native deps OR a single-image sidecar at most).
3. The tracker entry lives at `packages/platform/rendering/RENDER-KINDS.md` (created with §12 follow-on PR #1) and records: the new kind name, the engine, the rationale, the date added.

A *replacement* of an existing engine (e.g. swapping Gotenberg for a different sidecar; swapping exceljs for a different XLSX library) is **not** in the lightweight path — that is a §6 table amendment and requires the full RFC procedure per §15.2.

### 15.4 De-allocation

De-allocation of `@umbraculum/rendering` (the reverse operation — removing the §8.2 row and the package) requires a successor RFC explicitly named as a de-allocation, following [RFC-0001 §6](0001-modules-tiers-governance-and-automation-placement.md) step 5's forward-only rule applied analogously. We expect this never to happen.

---

*This RFC's "commit engine picks inside the RFC" shape (the RFC-0003 precedent, per §11.7) was chosen explicitly during plan-confirmation 2026-05-21, in preference to the alternative "defer engines to a sibling surface design doc" shape (the RFC-0004 precedent).*

*Implementation correction 2026-05-25: the MJML committed major moved from the originally drafted v4.x row to v5.x during PR1 scaffold implementation after dependency-audit review showed the v4 tree carried high-severity transitive advisories. The engine choice remains MJML; only the pinned major changed.*
