# Canonical document-rendering engine rationale

> [!NOTE]
> **Companion to [RFC-0007](../rfcs/0007-canonical-document-rendering.md) (Accepted 2026-05-21).**
> RFC-0007 is the commitment artifact — its [§6.1 engine table](../rfcs/0007-canonical-document-rendering.md) commits one engine per render kind in a single project-wide opinion.
> This document is the comparative shopping that produced each pick: candidates surveyed, trade-offs walked, pick + why, when each pick would flip.
>
> **When this document and RFC-0007 disagree, this document is the deeper analysis; RFC-0007 is the commitment artifact.** Same precedent [RFC-0003](../rfcs/0003-validation-library-adoption.md) set with [`docs/design/validation-library-adoption-audit.md`](./validation-library-adoption-audit.md).
>
> Living document — engine-major-version replacements per [RFC-0007 §6.2](../rfcs/0007-canonical-document-rendering.md) update this doc and amend RFC-0007's §6 table in the same PR.

**Tier:** Public
**Status:** Companion to RFC-0007 (Accepted 2026-05-21). Living document.
**Audience:** future contributors evaluating engine swaps; reviewers of RFC-0007 amendments that touch §6; third-party module developers wondering "why did Umbraculum pick X over Y?"; enterprise evaluators auditing the rendering stack's operational shape.
**Owners:** project lead
**Related:** [`docs/rfcs/0007-canonical-document-rendering.md`](../rfcs/0007-canonical-document-rendering.md) (the canonical commitment artifact), [`docs/LICENSING.md`](../LICENSING.md) §4 (the precedent of carrying a "fair survey of license families" before §6 commits — same shape this document follows), [`docs/design/validation-library-adoption-audit.md`](./validation-library-adoption-audit.md) (the precedent for "RFC commits; sibling design doc carries the comparative depth"), [`docs/REDIS-ARCHITECTURE.md`](../REDIS-ARCHITECTURE.md) (the Redis state-of-play that informs the job-queue pick in §10), [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §2.1 (the self-host posture every pick in this document was tested against).

---

## 1. Why this document exists

[RFC-0007](../rfcs/0007-canonical-document-rendering.md) commits, in §6.1, a specific stack: Gotenberg sidecar for HTML→PDF + DOCX/ODT→PDF; exceljs for XLSX; `@fast-csv/format` for CSV; bwip-js for barcodes / QR; xmlbuilder2 for XML feeds; eta for HTML / email templates; MJML for email composition; BullMQ on existing Redis for the async job runner. Each pick is one row in the table, with one or two rejected alternatives listed alongside.

That table is the right shape for a commitment artifact. It is the wrong shape for **the deeper question a future contributor will ask**, which is *"if we want to swap engine X, what's the full set of candidates I should be aware of, and what was the analysis that ruled them out?"*

The validation-library audit ([`docs/design/validation-library-adoption-audit.md`](./validation-library-adoption-audit.md), 597 lines) is the project's precedent for splitting these two concerns:

- **RFC-0003** commits Zod v4 in one decision paragraph.
- **The audit doc** carries 597 lines of "what was on the table, what were the falsifiable tests, how did each library score, what would flip the answer."

The same split applies here. A future contributor evaluating "should we swap Gotenberg for Carbone?" or "should we swap BullMQ for Temporal?" deserves the prior analysis on hand rather than re-doing it from scratch — and rendering, like validation, is a cross-cutting concern where the swap decision affects every module that consumes the surface.

The bar this document sets: each engine slot answers four questions in the same order.

1. **Candidates surveyed** — who else was looked at, and what their shapes are.
2. **The trade-off frame** — what axes the candidates were compared on (per the §2 decision frame below).
3. **The pick + why** — the winning candidate and the one or two specific reasons it won.
4. **When the answer would flip** — concrete conditions under which the pick should be re-evaluated.

The fourth question is the most important one. *"BullMQ won at 2026-05-21"* tells you nothing about whether to re-pick at 2027-05-21; *"BullMQ would flip to Temporal if cross-module workflow orchestration becomes a need; would flip to pg-boss if Redis is dropped from the stack for unrelated reasons; would flip to RabbitMQ if AMQP topic-routing semantics for heterogeneous consumers becomes a need"* gives the next reviewer their actual evaluation criteria.

---

## 2. The decision frame — four constraints every pick was tested against

Every engine slot in §3-§10 was tested against the same four constraints, in this order of weight:

### 2.1 Self-host posture

[`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §2.1 and [`docs/LICENSING.md`](../LICENSING.md) §6.1 commit Umbraculum to a first-class self-host story. Concretely, what this constraint excludes:

- **New sidecars are expensive and must earn their keep.** Adding a Docker image to the recommended `docker-compose.yml` is a real operational cost imposed on every self-hoster — they have one more container to monitor, secure, back up (where stateful), upgrade, and resource-plan. Gotenberg passes this bar because no Node-side library does HTML→PDF acceptably (see §3); RabbitMQ does not (§10).
- **Native bindings drag operational complexity.** A pure-JS / pure-TS library installs cleanly through `npm` inside the existing Node container. A library with `node-gyp` rebuilds, system-library dependencies (`libvips`, `libreoffice-headless`, `imagemagick`), or platform-specific binaries adds CI surface, Docker-image-size, and "it works on my machine" failure modes. Every pick that survived §3-§10 is either pure-JS / pure-TS or a sidecar with a stable HTTP API.
- **No license that forces self-hosters into commercial-only paths.** Per [`docs/LICENSING.md`](../LICENSING.md) §4-§6, the project's AGPLv3 default expects every operational dependency to be OSI-approved at the source. Commercial-source dependencies (Carbone, PrinceXML) are listed as candidates in §3 for completeness but are systematically rejected on this axis.

### 2.2 Node-ecosystem maturity

The project runs Node 20+ on the API service and ships ESM-first per [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md) Decision C. Engines were tested for:

- **TypeScript types** — first-party types preferred; `@types/<name>` acceptable; no types = harder review and worse AI-assistant ergonomics. Bias toward libraries that ship `.d.ts` themselves.
- **Active maintenance** — released at least once in the trailing 12 months at the survey date (2026-05-21); no orphan packages.
- **Issue triage health** — qualitative; surveyed by reading recent GitHub Issues and PRs to confirm the maintainer is responsive.
- **Bus-factor** — not a single-maintainer single-point-of-failure (unless the library is so small that single-maintenance is appropriate).

### 2.3 License fit

[`docs/LICENSING.md`](../LICENSING.md) §6 commits the platform AGPLv3 default + MIT for the SDK enumeration. Engine licenses had to be:

- **OSI-approved and compatible with AGPLv3.** MIT, Apache 2.0, BSD-2/3-Clause, ISC, LGPL, MPL 2.0, and AGPLv3 itself all clear this bar. SSPL, BSL, Elastic License 2.0 do not (per [`docs/LICENSING.md`](../LICENSING.md) §4.5 — same posture that ruled out MongoDB-since-2018, Elasticsearch-2021-2024, Redis-2024-2025).
- **Clean redistribution semantics under AGPLv3.** Some packages with split CE/community + enterprise tiers ship under licenses with subtle redistribution constraints; sheetjs is the §4 example. Where the redistribution semantics are ambiguous, the engine is ruled out in favor of a cleaner-licensed alternative even at some functional cost.

### 2.4 AI-assistant familiarity

[`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.0 and [RFC-0001 §8.2](../rfcs/0001-modules-tiers-governance-and-automation-placement.md) name *"AI-assisted module development"* (third-party developers using AI assistants to scaffold modules against the SDK) as a load-bearing axis. The same argument applied to engine picks: the larger the engine's training-data footprint in mainstream AI assistants at 2026-05-21, the lower the friction for a developer who has the model write a `DocumentTemplate` against it.

This is the same reasoning [RFC-0003 §4](../rfcs/0003-validation-library-adoption.md) used to pick Zod v4 over Valibot even when bundle-size tests slightly favored Valibot. It is a real constraint, not a tiebreaker — but it is the weakest of the four, used only when (1)-(3) leave two or more candidates standing.

### 2.5 Operational state at the survey date

The fifth implicit axis: what the project's operational surface already contains at 2026-05-21. **Redis is required** ([`docs/REDIS-ARCHITECTURE.md`](../REDIS-ARCHITECTURE.md)). **Postgres is required** (Prisma multi-schema preview per [RFC-0002 §4 convention 4](../rfcs/0002-canonical-module-physical-layout.md)). **Node 20+ is required.** Engines that ride on existing infrastructure win against engines that introduce new infrastructure, all else equal. This is why BullMQ wins over pg-boss (Redis is already there; pg-boss would route load through Postgres which is fine but redundant) and why BullMQ wins decisively over RabbitMQ (which would introduce an entirely new ops surface).

---

## 3. HTML→PDF + DOCX/ODT→PDF — Gotenberg

### 3.1 Candidates surveyed

| Candidate | Shape | License | Operational footprint |
|---|---|---|---|
| **Gotenberg** (picked) | Sidecar; Chromium (headless) for HTML→PDF; LibreOffice headless for DOCX/ODT/RTF; PDFtk for PDF manipulation; HTTP API | MIT | One Docker image (~600 MB), HTTP-only — no shared filesystem required |
| Puppeteer | In-process; bundles Chromium download (~150 MB); spawns headless Chromium per render | Apache 2.0 | Memory-resident Chromium in API container; requires sandboxing kernel features |
| Playwright | In-process; bundles Chromium + Firefox + WebKit downloads (~400 MB); orchestrator for cross-browser | Apache 2.0 | Same as Puppeteer plus ~3× the image size |
| `@react-pdf/renderer` | In-process pure JS; React-component layout vocabulary; no HTML/CSS layout | MIT | Pure-JS; ~100 KB; bundle into API process |
| Headless LibreOffice (direct) | In-container CLI; `libreoffice --headless --convert-to pdf input.docx` | MPL 2.0 (the LibreOffice license) | Adds `apt install libreoffice` (~600 MB) to the API container image |
| WeasyPrint | Python; CSS Paged Media support; HTML/CSS-to-PDF | BSD-3-Clause | Adds Python runtime to API container OR requires a separate sidecar |
| Carbone | DOCX/XLSX templating engine that compiles to PDF via LibreOffice; commercial CE edition with strong template DSL | Commercial CE (LGPL community fork exists but with different feature set) | One Docker image; sidecar shape; commercial-track surface |
| PrinceXML | Best-in-class CSS Paged Media; commercial only | Commercial | Commercial license required for production; ruled out on §2.3 |
| pdfkit | In-process pure JS; programmatic drawing API (no HTML) | MIT | Pure-JS; no HTML/CSS layout — every line of layout is hand-coded |
| pdfmake | In-process pure JS; declarative document description format (own DSL) | MIT | Pure-JS; own layout DSL — not HTML, not CSS, not React |

### 3.2 The trade-off frame

HTML→PDF was tested on three axes specific to this slot:

1. **Layout vocabulary** — what authoring shape does a template author work in? *HTML + CSS* is the lingua franca; *React components* is a smaller vocabulary that wins for highly-designed one-pagers but loses for the "boring 50-page MRP work order" general case; *programmatic drawing* (pdfkit) and *declarative DSL* (pdfmake) lose for both shapes because the template author can't grab any existing HTML/CSS pattern.
2. **Self-host security profile** — does the engine require kernel features that may or may not be present on commodity self-host targets? In-process Chromium (Puppeteer / Playwright) wants `unprivileged_userns_clone` and `seccomp` for sandboxing; the common mitigation (`--no-sandbox`) is a real hardening regression. Sidecar Chromium isolates the surface — the API container does not run Chromium, the Gotenberg container does, and the API talks to it over HTTP.
3. **Memory profile and image size** — each running Chromium is hundreds of MB. Per-API-container Chromium balloons the platform image and the running memory footprint. Sidecar Chromium pays this cost once, in its own container, where it belongs.

### 3.3 The pick + why

**Gotenberg** wins on all three axes:

- **Layout vocabulary:** HTML + CSS (via headless Chromium) is the maximum-coverage shape — same engine that renders every modern web page also renders to PDF. Boring 50-page documents, branded marketing PDFs, accessibility-checked compliance documents — all work in the same vocabulary the project's frontend already uses ([`@umbraculum/ui`](../../packages/platform/ui/) Tamagui primitives compile to HTML/CSS on web; template authors can reuse familiar primitives).
- **Self-host security:** Chromium is contained inside the Gotenberg image with its own sandboxing; the API container doesn't need any kernel-feature special-casing. The Docker default-runtime gives Gotenberg the kernel features it needs; the API container doesn't have to.
- **Memory and image size:** Chromium memory is paid for in one place, in proportion to the rendering workload. The API container stays small (the existing Node image, ~150 MB).
- **DOCX/ODT bonus:** Gotenberg's LibreOffice route handles DOCX/ODT/RTF → PDF as a sub-route of the same HTTP API, no separate engine. Two render kinds, one sidecar.

The HTTP API surface is small and stable: POST a multipart request with the input file, get back a PDF. Errors are HTTP status codes. Versioning is clear. The integration is a thin HTTP client (~100-200 lines).

### 3.4 Rejected alternatives — specific reasons

- **Puppeteer / Playwright in-process** — rejected on self-host security (sandboxing kernel requirements) and memory (Chromium per API container). Both are excellent for in-browser testing and end-to-end automation; they are the wrong shape for server-side PDF rendering in a self-host-first product.
- **`@react-pdf/renderer` as primary** — rejected as primary because its layout vocabulary (Page / View / Text / Image; no HTML, no CSS, no tables) is too narrow for the general case. **Reserved as an optional second template kind** for high-design one-pagers (a polished customer-facing CRM quote PDF is the most likely first trigger). Per [RFC-0007 §11.3](../rfcs/0007-canonical-document-rendering.md). Added via the [RFC-0007 §15.3 lightweight render-kind allocation procedure](../rfcs/0007-canonical-document-rendering.md) when a use case warrants it.
- **Headless LibreOffice direct** — rejected because adding `apt install libreoffice` to the API container drags ~600 MB of system libraries into the platform image. Gotenberg packages this dependency in its own image where the cost is paid once, in isolation.
- **WeasyPrint** — rejected because adding Python runtime to the Node API container (or running a Python sidecar separately) introduces a new operational surface (Python version management, pip vs. system packages, CVE tracking for an additional runtime). Gotenberg avoids the multi-runtime cost.
- **Carbone** — strong DOCX templating expressiveness; CE edition is commercially licensed with a community LGPL fork that lags in features. Rejected on §2.3 (commercial track) and §2.2 (community fork's maintenance health). **Re-evaluate at public flip** if DOCX templating expressiveness materially exceeds what LibreOffice headless provides.
- **PrinceXML** — best-in-class CSS Paged Media support (the gold standard for academic/legal/governmental PDF rendering). Commercial-only; rejected on §2.3.
- **pdfkit / pdfmake** — rejected on layout vocabulary (programmatic drawing or own DSL; no HTML/CSS reuse). Either would force every template author to learn a new authoring surface that resembles nothing they already know.

### 3.5 When the answer would flip

- **Carbone if DOCX templating expressiveness exceeds LibreOffice headless materially.** If a real consumer (e.g. an enterprise finance team that wants pixel-perfect DOCX-templated invoices with conditional sections and variable-substitution beyond LibreOffice's mail-merge surface) shows the LibreOffice route is materially limiting, Carbone becomes the candidate. The §2.3 license concern would need to be resolved (CE edition for paid customers; LGPL fork for the AGPL core) — possibly via the [RFC-0007 §15.3 render-kind allocation](../rfcs/0007-canonical-document-rendering.md) procedure adding a `docx-carbone` kind alongside the default `docx-libreoffice` kind.
- **`@react-pdf/renderer` as a second template kind.** Added via the [RFC-0007 §15.3 render-kind allocation](../rfcs/0007-canonical-document-rendering.md) procedure when the first polished customer-facing PDF use case demands it. Not load-bearing on this RFC; the §3.3 reservation is the placeholder.
- **A new entrant that bundles Chromium + LibreOffice in a smaller image with a better API.** Unlikely in the 12-month horizon; would need to demonstrate parity with Gotenberg's stability + HTTP API + community size to justify a swap.

---

## 4. XLSX — exceljs

### 4.1 Candidates surveyed

| Candidate | Shape | License | Maintenance |
|---|---|---|---|
| **exceljs** (picked) | In-process pure JS; read + write; streaming writer | MIT | Active; v4.x; mature; broad community |
| sheetjs (xlsx) | In-process pure JS; read + write; the historical reference implementation | CE/community split (Apache 2.0 community; commercial Pro) | Active; license model evolved and is sometimes contested in OSS contexts |
| node-xlsx | Wrapper around sheetjs CE; simpler API | Apache 2.0 (depends on sheetjs CE) | Active but read-focused; write API is limited |
| xlsx-stream-writer | Streaming-only writer; no read API | MIT | Maintained but smaller community than exceljs |
| xlsx-template | Take XLSX template + variable substitution | BSD-style | **Abandoned** (last release 2022); no longer a candidate |
| convert-excel-to-json | Read-only utility | MIT | Read-only; not in scope for the write side |

### 4.2 The trade-off frame

XLSX writing was tested on:

1. **Streaming support** — can the engine write a 1M-row XLSX without holding the entire workbook in memory? WMS year-end snapshot reports are the worst case (every SKU × every warehouse × every lot/serial = easily 10⁶ rows).
2. **Feature coverage** — formulas, conditional formatting, frozen panes, charts, data validation, named ranges. WMS pick lists and MRP work-order schedules use most of these.
3. **License clarity** — does the redistribution story under AGPLv3 hold up to a careful read?

### 4.3 The pick + why

**exceljs** wins on:

- **Streaming writer** — `WorkbookWriter` API streams to disk or to a readable stream; the in-memory state is bounded by row buffer size, not by workbook size. Tested at the survey date with 10⁶-row workbooks at <100 MB resident memory.
- **Feature coverage** — formulas (including shared formulas), conditional formatting, frozen panes, basic charts, data validation, named ranges, merged cells, defined styles. Covers every WMS / MRP / PIM-report use case the project's foreseeable roadmap names.
- **License clarity** — MIT, unambiguous, clean redistribution under AGPLv3 without commercial-edition footnotes.

The community size + AI-assistant familiarity tiebreaker (§2.4) also lands here; exceljs is the de-facto Node XLSX library at 2026-05-21 and AI assistants scaffold it cleanly.

### 4.4 Rejected alternatives — specific reasons

- **sheetjs (xlsx)** — feature-richer than exceljs (broader format coverage; CSV / ODS / XLS / XLSB / Numbers; better formula engine); rejected on §2.3 license clarity. The CE/community + commercial Pro split has historically generated friction in OSS dependent projects; the AGPL-default posture wants no ambiguity. exceljs covers the realistic feature set with a clean license — net trade is favorable for the project's posture.
- **node-xlsx** — limited write API; effectively a read-side wrapper. Rejected on coverage.
- **xlsx-stream-writer** — viable for streaming-only use cases; smaller community than exceljs; no read API. Rejected on the "one engine per slot" discipline — having exceljs for write + xlsx-stream-writer for streaming-write would be a split for no real reason.
- **xlsx-template** — abandoned 2022; no longer a candidate. (Documented here so a future contributor doesn't re-survey it.)
- **convert-excel-to-json** — read-only; out of scope for the rendering pipeline (which is write-side).

### 4.5 When the answer would flip

- **sheetjs if their license model stabilizes acceptably for AGPL-default projects.** Watch the sheetjs license posture; a clarification or simplification that removes the CE/Pro ambiguity would re-open the comparison. sheetjs's feature coverage is genuinely broader.
- **A streaming-only alternative if WMS year-end snapshots hit memory ceilings in exceljs.** The 10⁶-row tests at the survey date passed at <100 MB; if a real consumer ships a workload that hits exceljs's streaming-writer ceiling (e.g. WMS deployments at large breweries with 10⁷-row inventory), xlsx-stream-writer becomes the candidate to migrate to (write-only, smaller community accepted as a trade for streaming purity).
- **An entirely new ground-up entrant** — possible but unlikely; the OOXML spec is dense enough that new pure-JS implementations have a high bar to reach exceljs's coverage.

---

## 5. CSV — `@fast-csv/format`

### 5.1 Candidates surveyed

| Candidate | Shape | License | Streaming |
|---|---|---|---|
| **`@fast-csv/format`** (picked) | Pure JS; streaming writer; part of fast-csv monorepo | MIT | First-class |
| csv-stringify (csv project) | Pure JS; streaming writer; mature alternative | MIT | First-class |
| papaparse (write side) | Pure JS; browser-first; Node support secondary | MIT | Streaming via Node streams adapter; less idiomatic |
| Hand-rolled | N/A | N/A | Trivial to start; production bugs guaranteed |

### 5.2 The trade-off frame

CSV writing has a deceptively small surface (rows in, escaped text out). The real bar is **correctness on the edge cases**:

- Embedded commas (the most common bug — the field becomes split).
- Embedded double-quotes (escape as `""` per RFC-4180).
- Embedded newlines (must be quoted; many ad-hoc implementations break this).
- Optional Unicode BOM for Excel compatibility.
- Streaming at WMS / PIM-feed scale (10⁶+ rows without OOM).

### 5.3 The pick + why

**`@fast-csv/format`** wins on:

- **Streaming-first design** — the API is Node-stream-shaped from the ground up; `csv.format()` returns a Transform stream that pipes cleanly into HTTP responses or media-asset upload streams.
- **RFC-4180 correctness** — quote, newline, and Unicode handling are correct by default; the option surface is small.
- **Bundle membership** — the fast-csv monorepo also covers parsing (`@fast-csv/parse`), so future read-side use cases (re-import of generated feeds for validation; round-trip tests) don't introduce a second library family.

### 5.4 Rejected alternatives — specific reasons

- **csv-stringify** — viable; mature; equally correct. **`@fast-csv/format` chosen for marginally better Node-side streaming ergonomics and the single-coherent-monorepo argument.** This is the closest call in the entire engine table; a future swap to csv-stringify is low-cost and would not violate any RFC-0007 §6 principle.
- **papaparse (write side)** — browser-first design; Node streaming requires adapter code; less idiomatic on the server. Rejected on §2.5 operational state (the project's CSV work is server-side; browser CSV needs are negligible).
- **Hand-rolled CSV** — every project that has tried this has been bitten by quote/newline escaping. Rejected as a known anti-pattern; explicitly documented here so a contributor evaluating "this is just CSV, how hard can it be" sees the prior verdict.

### 5.5 When the answer would flip

- **Node ecosystem consolidates around csv-stringify.** If fast-csv's maintenance frequency drops materially relative to csv-stringify's, the marginal preference flips. Low-cost migration.
- **Streaming-API divergence with Node's stream APIs.** Node's stream APIs evolve (Readable/Writable v3, async iterators, etc.); if fast-csv lags adoption of a new pattern that csv-stringify embraces, the comparison re-opens.

---

## 6. Barcodes / QR — bwip-js

### 6.1 Candidates surveyed

| Candidate | Shape | License | Format coverage |
|---|---|---|---|
| **bwip-js** (picked) | Pure JS; covers GS1-128, EAN-13, UPC-A, Code 128, QR, Data Matrix, PDF417, and 90+ other symbologies | MIT | Comprehensive (it is the JS port of BWIPP, the canonical PostScript barcode reference) |
| jsbarcode | Pure JS; 1D barcodes only (Code 128, EAN, UPC, Code 39, ITF, MSI, Pharmacode) | MIT | 1D only |
| qrcode | Pure JS; QR only | MIT | QR only |
| ZXing-js | Port of the ZXing library; primarily read-focused | Apache 2.0 | Read-focused; write API is secondary |
| node-bwipjs | Wrapper around bwip-js for older Node | MIT | Same as bwip-js but unmaintained wrapper layer |
| ImageMagick `convert` | CLI; barcode generation via plugins | Apache 2.0-like | System-dep heavy; loses self-host simplicity |

### 6.2 The trade-off frame

Barcode rendering has three loadable axes:

1. **Format coverage** — WMS needs GS1-128 (logistics standard) + EAN-13 (retail). PIM channel feeds may need EAN/UPC for product feeds. CRM might want QR for landing-page URLs in PDFs. The engine needs to cover all of these without a second library.
2. **Deterministic output** — the same input must produce byte-identical output across runs and environments. This matters for snapshot tests (a CI run can compare the generated barcode bytes to a fixture; non-determinism breaks the test).
3. **Self-host simplicity** — pure JS preferred over native bindings or CLI dependencies.

### 6.3 The pick + why

**bwip-js** wins on all three:

- **Format coverage** — covers GS1-128, EAN, UPC, Code 128, QR, Data Matrix, PDF417, and 90+ other symbologies. One library for every realistic use case the project's modules will hit (WMS / PIM / CRM / brewery — brewery uses QR for tank labeling per the sister-repo automation surface).
- **Deterministic output** — bwip-js produces byte-identical output given identical input (no random seed, no timestamp embedding). Snapshot tests work cleanly.
- **Self-host simplicity** — pure JS; no native bindings; no system libraries; no font files required (bwip-js bundles its own font subset).

### 6.4 Rejected alternatives — specific reasons

- **jsbarcode + qrcode** — covers the surface but requires two libraries for one concern; doubles the maintenance surface and the upgrade discipline. Rejected on the "one engine per slot" framing.
- **ZXing-js** — read-focused; write API is secondary. Rejected on coverage of the write side.
- **node-bwipjs (wrapper)** — unmaintained; rejected on §2.2.
- **ImageMagick `convert`** — system-dep heavy; introduces ImageMagick to the API container's image. Pure-JS avoids the cost.

### 6.5 When the answer would flip

- **A single Node-native library that covers GS1-128 + EAN + Code 128 + QR + Data Matrix at parity and ships smaller** — would be evaluated on merit; unlikely to emerge given bwip-js's BWIPP-port heritage.
- **A specialized GS1-only library reaches WMS-grade accuracy that bwip-js misses.** GS1 has subtleties (application identifiers, check digits, sub-element separators) where a GS1-specialist library could in principle do better. No such library exists at the survey date.

---

## 7. HTML / email template engine — eta

### 7.1 Candidates surveyed

| Candidate | Shape | License | Surface |
|---|---|---|---|
| **eta** (picked) | TS-native template engine; modern EJS-shaped syntax; ~10 KB | MIT | `<%= var %>` interpolation; partials; layouts; async support |
| Handlebars | Mustache-derived; logic-less philosophy; large community | MIT | `{{var}}` interpolation; helpers; partials |
| Nunjucks | Jinja-shaped (Mozilla port); powerful and verbose | BSD-2-Clause | `{{var}}` + block macros + inheritance |
| Liquid | Shopify-derived; DSL with strict object/method distinctions | MIT | `{{var}}` + tag-based filtering |
| EJS | The historical "embedded JS" template engine; predecessor of eta | Apache 2.0 | `<%= var %>` interpolation; full JS in templates |
| Pug (formerly Jade) | Whitespace-significant HTML DSL | MIT | Indented blocks; mixins; conditionals |
| @react-email components | React components compile to email HTML | MIT | Componentized; same React as the rest of the app |

### 7.2 The trade-off frame

The load-bearing decision for this slot is **a single project-wide template-syntax choice**. Allowing each module to pick its own template syntax recreates the Magento extension ecosystem's *N parallel template engines* problem narrowed to one slice. The specific library is replaceable; the multiplicity is not.

Within the constraint "one syntax across the project," the candidates were tested on:

1. **TS-native ergonomics** — the project is TypeScript end-to-end; an engine that ships first-party `.d.ts` and has TS-aware tooling wins over an engine where types are bolted on.
2. **Performance** — template compilation + rendering should not be the bottleneck; published microbenchmarks at the survey date are the proxy.
3. **Surface size** — the smaller the DSL surface a template author has to learn, the lower the friction for the third-party-module-developer audience.

### 7.3 The pick + why

**eta** wins on:

- **TS-native** — written in TypeScript; ships first-party types; works cleanly with ESM + Node 20.
- **Performance** — faster than EJS / Handlebars in published microbenchmarks at the survey date; small (~10 KB gzipped); negligible overhead vs. the engine work (Gotenberg / exceljs / bwip-js).
- **Modern EJS-shaped syntax** — `<%= var %>` interpolation is universally familiar; partials and layouts work as expected; no exotic DSL to learn.
- **Dual ESM + CJS** — distributes cleanly into the project's existing build pattern.

### 7.4 Rejected alternatives — specific reasons

- **Handlebars** — viable; the logic-less philosophy is principled. Rejected on slightly heavier surface (helpers registry, custom block helpers, partial loading discipline) and non-TS-native ergonomics. Marginal call.
- **Nunjucks** — Jinja-shaped; powerful but verbose. Rejected on surface size (block macros + inheritance + filters add a lot to learn) and TS ergonomics. Strong choice for Python-heritage teams; wrong shape for TS-native.
- **Liquid** — Shopify-derived DSL; strict object/method semantics (an object's methods must be whitelisted before templates can call them). Rejected on surface size; the Liquid dialect is a noticeable learning curve.
- **EJS** — historical predecessor of eta. eta is its modern TS-native successor; no reason to pick EJS over eta.
- **Pug** — whitespace-significant HTML DSL; loses the "HTML in a template, no DSL to learn" advantage. Rejected on surface size.
- **@react-email components** — viable for email templating (see §8); rejected as the *project-wide* template engine because forcing every template through React compilation is heavy and doesn't match the non-email use cases (a CSV file generated from a template doesn't need React).

### 7.5 When the answer would flip

- **A TS-native engine with materially better ergonomics emerges.** The bar is high — eta is already best-in-class for TS-native EJS-shaped templating at the survey date.
- **React-component templating becomes the project-wide norm.** If `@umbraculum/ui` Tamagui primitives ship a renderer that produces HTML for both UI surfaces AND template surfaces, react-email + Tamagui-on-server could become the project-wide template engine. Speculative at the survey date.
- **A consumer demands per-template-author choice.** Explicitly out of scope of RFC-0007's "one syntax across the project" commitment. If this ever becomes a real ask, it's an RFC-0007 §6 amendment, not a covert per-module deviation.

---

## 8. Email HTML composition — MJML

### 8.1 Candidates surveyed

| Candidate | Shape | License | Cross-client coverage |
|---|---|---|---|
| **MJML** (picked) | DSL that compiles to email-client-compatible HTML; handles Outlook MSO, Gmail clipping, dark-mode | MIT | Industry-standard for cross-client correctness |
| react-email | React components that render to email HTML at build/render time | MIT | Growing; cross-client correctness matures with each release |
| Maizzle | Tailwind-CSS-for-email | MIT | Good; smaller community than MJML |
| Hand-written HTML emails | Tables, inline styles, conditional MSO comments | N/A | Known cross-client fragility |
| Foundation for Emails | Zurb's email framework (Inky DSL) | MIT | Mature but less active than MJML at the survey date |

### 8.2 The trade-off frame

Email HTML is the hardest cross-client compatibility surface in modern web. Email clients (Outlook desktop on Windows uses MSO/Word's HTML rendering engine; Gmail clips HTML over a size threshold; Apple Mail has its own quirks; Outlook for Mac/iOS/Android each rendering differently from each other) make hand-written HTML emails effectively unreliable for B2B-correct delivery.

The pick is tested on:

1. **Cross-client coverage** — does the engine handle Outlook MSO, Gmail size limits, dark mode variations, mobile vs. desktop layouts?
2. **Maturity of the ecosystem** — example templates, community-tested patterns, easy onboarding.
3. **Compose-into-the-pipeline** — does the engine fit cleanly into the project's rendering pipeline (MJML compiles to HTML, then HTML flows through the same eta-templating path as everything else)?

### 8.3 The pick + why

**MJML** wins on:

- **Cross-client coverage** — built specifically to abstract the cross-client compatibility problem; output HTML is tested against Outlook, Gmail, Apple Mail, Yahoo Mail, etc.
- **Mature ecosystem** — large library of MJML components (buttons, columns, images, sections, social links) battle-tested across thousands of B2B emails.
- **Compose-into-the-pipeline** — MJML → HTML compilation runs once at template-build time (or at render time, configurable); the resulting HTML flows through eta variable substitution exactly like any other HTML template. The rendering pipeline has one HTML path, not two.

Implementation note (2026-05-25): PR1 pinned `mjml` to the v5 major, not the originally drafted v4 major. The v4 tree pulled a high-severity transitive audit surface through `mjml-core` / `mjml-cli` / `html-minifier`; `mjml@5.2.2` audited clean in isolation during the PR1 dependency review. This does not change the engine pick, only the committed major.

### 8.4 Rejected alternatives — specific reasons

- **react-email** — viable alternative; growing rapidly; cross-client coverage maturing with each release. **MJML chosen for broader cross-client maturity at 2026-05-21; revisit at public flip.** This is the closest call after CSV (§5.4) in the entire engine table.
- **Maizzle** — Tailwind-CSS-for-email; cleaner authoring than MJML for teams already using Tailwind. Rejected on community size at the survey date; Maizzle is high-quality but smaller.
- **Hand-written HTML emails** — known cross-client fragility; rejected as a known anti-pattern. Documented here so a contributor evaluating "this is just HTML, how hard can it be" sees the prior verdict.
- **Foundation for Emails** — Zurb's framework; mature but less active than MJML at the survey date. Rejected on §2.2 maintenance.

### 8.5 When the answer would flip

- **react-email reaches MJML-parity on cross-client coverage and the project converges on React-component email templating.** Re-evaluate during the July 2026 public-alpha hardening window; the comparison gap is narrowing.
- **A consumer with extreme cross-client requirements (heavily-regulated industry email; legal-notice delivery) needs a more conservative shape.** Foundation for Emails or hand-written HTML with MSO conditionals could re-emerge as candidates for those narrow use cases. Add via [RFC-0007 §15.3 render-kind allocation](../rfcs/0007-canonical-document-rendering.md) if it becomes real.

---

## 9. XML feeds — xmlbuilder2

### 9.1 Candidates surveyed

| Candidate | Shape | License | TypeScript |
|---|---|---|---|
| **xmlbuilder2** (picked) | TS-native; declarative XML construction; namespace + CDATA handling | MIT | First-party types |
| xml2js (write side) | Primarily a parser; write API is secondary | MIT | Types via DefinitelyTyped |
| fast-xml-parser write API | Object-to-XML; fast but write API less idiomatic | MIT | First-party types |
| jsdom (DOM API) | Full HTML DOM; can produce XML | MIT | First-party types |
| String concatenation | N/A | N/A | Unsafe at scale |

### 9.2 The trade-off frame

XML feed generation has the same shape as CSV (§5) — easy to start, unsafe at scale. The complications:

- **Namespace handling** — Google Shopping XML uses an `xmlns:g="http://base.google.com/ns/1.0"` namespace for product fields; namespace-aware emitters do this correctly, string-concat needs explicit care.
- **Element escaping** — `<`, `>`, `&`, `'`, `"` in element values need entity encoding; CDATA blocks have their own escaping rules.
- **Streaming** — large feeds (10⁵+ products in a Google Shopping feed) should stream, not buffer-and-flush.
- **Schema breadth** — Google Shopping schema has 50+ optional elements; bugs hide in concatenation.

### 9.3 The pick + why

**xmlbuilder2** wins on:

- **TypeScript-native** — first-party types; the API reads as TypeScript ("create a root element with attribute X, add child Y with text Z") rather than as untyped object-to-XML conversion.
- **Correct namespace and CDATA handling** — namespace-aware by default; CDATA blocks are explicit.
- **Streaming-capable** — supports incremental document building for large feeds.

### 9.4 Rejected alternatives — specific reasons

- **xml2js (write side)** — primarily a parser; the write API is secondary and less idiomatic. Rejected on Node ecosystem standing for the write side.
- **fast-xml-parser write API** — fast; write API exists but is less idiomatic than xmlbuilder2's declarative shape. Rejected on developer ergonomics.
- **jsdom (DOM API)** — full HTML DOM (heavyweight); overkill for XML feed generation. Rejected on overhead.
- **String concatenation** — unsafe at scale (Google Shopping schema 50+ optional elements; namespace + escaping bugs hide in concatenation). Rejected as a known anti-pattern.

### 9.5 When the answer would flip

- **A streaming-first TypeScript-native XML emitter emerges that materially beats xmlbuulder2 on either ergonomics or memory.** Unlikely; xmlbuilder2 is mature.
- **A consumer needs XSD validation on the write side.** Add a validation step (xsd-schema-validator or equivalent) rather than swapping the emitter.

---

## 10. Job queue — BullMQ

This is the §10 slot whose latent question — *"why BullMQ instead of RabbitMQ?"* — surfaced the need for this whole document. The depth here is correspondingly larger.

### 10.1 Candidates surveyed

| Candidate | Shape | Persistence | New infrastructure cost |
|---|---|---|---|
| **BullMQ** (picked) | Redis-backed; native TS types; delayed jobs, retries, priorities, rate limits, repeatable jobs | Redis (AOF) | Zero (Redis is already required) |
| RabbitMQ | AMQP broker; exchanges, queues, bindings; pub/sub + work queues + topic routing | Disk + memory; mirrored or quorum queues for HA | New service (Erlang VM, ~150 MB image, AMQP-aware ops, separate cluster/HA story) |
| Temporal | Workflow orchestration platform; durable executions, sagas, signals | Postgres or Cassandra cluster | Very high (Temporal server + history service + matching service + UI) |
| pg-boss | Postgres-backed job queue; same SQL semantics as the app database | Postgres | Routes load through Postgres (already required, but adds queue load) |
| agenda | MongoDB-backed cron + jobs | MongoDB | New service (MongoDB not in the stack) |
| graphile-worker | Postgres-backed; LISTEN/NOTIFY-driven | Postgres | Routes load through Postgres |
| Bee-Queue | Redis-backed; simpler than BullMQ; same Redis backend | Redis | Zero |
| Kue | Older Redis-backed; predecessor of Bull | Redis | Zero |
| Bull (v3 — predecessor of BullMQ) | Redis-backed; the historical "Bull" library | Redis | Zero |

### 10.2 The trade-off frame — the decisive framing

The decisive framing for this slot is: **the queue is not the job-state-of-record.** Per [RFC-0007 §7.2](../rfcs/0007-canonical-document-rendering.md), the source of truth for job state is the **Postgres `rendering` schema** (`RenderJob`, `RenderJobAttempt`). The queue is the *delivery hint* — *"hey worker, there's a job at this ID waiting in Postgres"*. If the queue loses a message, the worst case is a delayed job, recoverable by re-enqueuing from the Postgres state (a small reconciliation job that runs periodically).

This framing matters because it changes which axes are load-bearing:

- **Durability** of the queue itself is *not* load-bearing. (Postgres is the source of truth.) RabbitMQ's persistent-message + acked-delivery semantics are stronger than BullMQ's, but we don't need them. BullMQ's Redis-AOF durability is sufficient — and even AOF disabled would be acceptable, since recoverability comes from Postgres.
- **Operational footprint** *is* load-bearing. Redis is already required. RabbitMQ, Temporal, MongoDB are not.
- **Throughput and latency** are not bottlenecks at the project's scale (renders are seconds-to-minutes; queue overhead is microseconds either way).
- **Feature surface** (delayed jobs, retries, priorities, rate limits, repeatable jobs) is load-bearing. BullMQ has all of these first-class; RabbitMQ requires composing them out of AMQP primitives; Temporal has them but at much higher abstraction.
- **AI-assistant familiarity** matters here — BullMQ + Redis is the de-facto Node-ecosystem job-queue pattern at 2026-05-21; AI assistants scaffold it cleanly.

### 10.3 The pick + why

**BullMQ** wins on:

- **Zero new infrastructure** — rides on the Redis the project already requires per [`docs/REDIS-ARCHITECTURE.md`](../REDIS-ARCHITECTURE.md). Self-hosters do not learn a new operational surface for the job queue.
- **First-class feature surface** — delayed jobs (for "send this report at 9am tomorrow"), retries (with backoff per-job), priorities (urgent invoice ahead of bulk report), rate limits (per-tenant render throttle), repeatable jobs (for cron-shaped rendering). All built-in, not composed.
- **Native TypeScript types** — `Queue<DataType, ResultType, NameType>` is typed; workers are typed; results are typed. No `@types/<x>` bolt-on.
- **Postgres-as-source-of-truth fits the project's existing data discipline** — the rendering jobs schema lives in the same Prisma multi-schema database as the rest of the app; reconciliation between queue and Postgres is a SQL-side concern, not a cross-system distributed problem.
- **AI-assistant familiarity** (§2.4) — BullMQ + Redis is the dominant Node job-queue pattern at the survey date; AI-assisted module development scaffolds it cleanly.

### 10.4 Rejected alternatives — specific reasons

#### 10.4.1 RabbitMQ

The closest comparison and the question that triggered this document. Three reasons rejected:

1. **Self-host posture (§2.1).** RabbitMQ is a whole new service for self-hosters: separate process (Erlang VM, ~150 MB image), AMQP-aware ops (exchanges, vhosts, queue durability flags, mirrored-queue or quorum-queue choice), separate clustering / HA story, separate management UI, separate persistence model. Redis is already required; BullMQ rides on it. RabbitMQ would double the queue-related operational surface every self-hoster has to learn and run.
2. **Durability is not load-bearing.** RabbitMQ's strongest argument over BullMQ is its persistent-message + acked-delivery semantics. Per §10.2, the project doesn't need those — Postgres is the source of truth. RabbitMQ wins on an axis the project isn't paying for.
3. **AMQP routing semantics aren't needed.** RabbitMQ's exchange + binding + routing-key surface is exactly right for *one producer, many heterogeneous consumers, topic-routed*. The project's rendering pattern is *one producer (the Fastify submit route), many homogeneous workers (render workers in the same Node process or a sibling worker process)*. This is the AMQP "work queue" pattern, which BullMQ does fine without needing AMQP's broader vocabulary.

The §10.5 "when the answer would flip" subsection covers when RabbitMQ would become the right call.

#### 10.4.2 Temporal

Workflow orchestration platform; the right tool when the queue *is* the system of record AND when the workflows are multi-hour stateful sagas with signals and timers.

Rejected on:

- **Over-scope for v1.** Rendering jobs are short-running (seconds to minutes), single-step, no inter-job state. Temporal's workflow abstractions add nothing for this shape.
- **Operational complexity.** Temporal requires a Temporal server (cluster of services: frontend, history, matching, worker; backed by Postgres or Cassandra). Adds an entire new operational layer for a problem the project doesn't have.
- **Steeper learning curve.** Temporal's workflow programming model (signals, queries, activities, deterministic replay) is a real shift for contributors used to "submit a job, wait for a result."

**Revisit if cross-module workflow orchestration becomes a project need** — e.g., "when this WMS shipment ships, send a notification, generate the bill of lading PDF, post to the CRM activity feed, schedule a follow-up email in 7 days, and roll back all of the above if step 3 fails." That kind of multi-step saga is Temporal's home turf.

#### 10.4.3 pg-boss

Postgres-backed job queue; same SQL semantics as the app database.

Rejected on:

- **Routes job load through Postgres.** Postgres is the source of truth for job state already; pg-boss would route the *delivery* path through Postgres too. Doubles Postgres's role; risks Postgres becoming the bottleneck under heavy render load. Redis-as-queue separates the concerns.
- **Smaller community and feature surface** than BullMQ at the survey date.

**Would flip if Redis is dropped from the stack for unrelated reasons.** If a future architectural decision removes Redis (unlikely; Redis is load-bearing for the session cache + rate-limit counters per [`docs/REDIS-ARCHITECTURE.md`](../REDIS-ARCHITECTURE.md)), pg-boss becomes the natural replacement.

#### 10.4.4 agenda

MongoDB-backed cron + jobs.

Rejected on:

- **Introduces MongoDB to the stack.** Mongo is not currently required; adding it just for the job queue is over-cost.

Documented for completeness; not a serious contender.

#### 10.4.5 graphile-worker

Postgres-backed; LISTEN/NOTIFY-driven.

Rejected on:

- **Same "routes job load through Postgres" concern as pg-boss.**
- **LISTEN/NOTIFY has known scaling caveats at high notification rates** — fine for many use cases but a non-trivial axis to monitor.

#### 10.4.6 Bee-Queue, Kue, Bull (v3)

All Redis-backed; smaller communities than BullMQ at the survey date. Bee-Queue is BullMQ-shaped but simpler; Bull (v3) is BullMQ's predecessor; Kue is older still.

Rejected on:

- **BullMQ is the current mature Redis-backed leader.** Picking a smaller-community alternative would trade BullMQ's ecosystem benefits for no real gain.

### 10.5 When the answer would flip

- **Temporal if cross-module workflow orchestration becomes a project need.** Sagas, multi-hour stateful flows, distributed-transaction coordination — these are Temporal's home turf. Concrete trigger: a real consumer asks for "when X happens, do Y then Z then W, with rollback if any step fails." Add a §15.3 amendment to RFC-0007 §6 swapping BullMQ for Temporal for that consumer's specific use case (keeping BullMQ for the rendering-job-runner role; Temporal and BullMQ can coexist).
- **RabbitMQ if AMQP topic-routing semantics for heterogeneous consumers becomes a need.** Concrete trigger: a real consumer needs "one producer fans out to N different consumer kinds in N different languages with topic-based routing." This would be a real architectural shift; not just a queue swap. Re-evaluate at that point.
- **pg-boss if Redis is dropped from the stack for unrelated reasons.** See §10.4.3.
- **A new Redis-backed entrant materially better than BullMQ.** Unlikely; BullMQ is the current mature leader and the community is consolidating around it.

---

## 11. Cross-cutting non-decisions

The following candidate decisions came up during analysis but were **explicitly ruled out of scope of RFC-0007**, and are documented here so a future contributor doesn't re-survey them.

### 11.1 Image processing

Image resizing, format conversion (PNG → JPEG → WebP → AVIF), thumbnailing, EXIF stripping — these are real cross-cutting concerns but they belong to **[@umbraculum/media](../../packages/platform/media/)**, not to the rendering pipeline. RFC-0007's `RenderKind` set explicitly excludes image processing.

If a render-time concern requires image manipulation (e.g., "this PDF needs the workspace's brand logo inlined as base64"), the rendering template requests the image asset from `@umbraculum/media`'s resolver — `@umbraculum/media` handles the resize / format-conversion, and the rendering pipeline uses the result.

### 11.2 PDF/A-3 archival compliance

PDF/A-3 (the archival-grade PDF format with embedded resources and long-term-readability guarantees) is required by some regulated industries (German tax law's GoBD, EU e-invoicing under the ZUGFeRD/Factur-X standard, US 21 CFR Part 11 for pharma records). Gotenberg's HTML→PDF route produces standard PDF, not PDF/A-3.

**Deferred per [RFC-0007 §15.3](../rfcs/0007-canonical-document-rendering.md) lightweight render-kind allocation procedure.** A future PDF/A-3 use case adds a `pdf-a-3` render kind, routes to either Gotenberg's PDF/A profile (if Gotenberg ships one by the time the use case lands) or a specialist engine (e.g., veraPDF or PDFCreator's PDF/A mode running as a separate sidecar). Not load-bearing on RFC-0007 today.

### 11.3 Label-printer transport

Producing a printable label (PDF/PNG of a 4×6 shipping label; a ZPL command stream for a Zebra thermal printer) is the rendering pipeline's job. **Sending the label to the physical printer is the integrations framework's job** (per [RFC-0001 §8.2](../rfcs/0001-modules-tiers-governance-and-automation-placement.md) integrations row). The split: rendering produces the artifact; integrations transports it.

This split surfaces when WMS lands (the integrations framework will need a "label printer" device kind alongside the existing Tilt / Reveal sensor patterns) and is not load-bearing on RFC-0007 today.

### 11.4 DOCX/XLSX templating with variable substitution

The Carbone shape — author a DOCX/XLSX template in Word/Excel/LibreOffice with `{{variable}}` placeholders; render-time substitution produces a finished document — is genuinely powerful for finance/compliance teams that want non-developer template authoring.

**Out of scope of RFC-0007 v1.** RFC-0007 §3 (Decision A) commits HTML + eta as the template-author surface; DOCX/ODT templating with substitution is an authoring shape that requires a separate engine (Carbone, docxtemplater, easy-template-x). Add via [RFC-0007 §15.3](../rfcs/0007-canonical-document-rendering.md) when a real consumer demands it; the §3.5 "when the answer would flip" note on Carbone is the entry point.

### 11.5 Server-side React rendering for documents

The pattern "use React to compose document layouts" (react-pdf, react-email, server-rendered React-to-HTML for document generation) is real and growing. RFC-0007 picks eta + MJML + HTML+CSS at 2026-05-21; this could become the project-wide pattern post public flip if the React-component approach matures and the project decides the unified surface is worth the cost.

**Speculative; out of scope today.** Documented here so a future contributor evaluating "should we move to react-email + react-pdf?" sees the prior framing and the path (it would be an RFC-0007 §6 amendment, not a covert per-module migration).

---

## 12. How to use this document going forward

The pattern this document inherits from [validation-library-adoption-audit.md §10](./validation-library-adoption-audit.md):

### 12.1 When a future contributor proposes an engine swap

1. **Read the relevant §3-§10 section here first.** The prior survey, trade-off frame, and "when it would flip" subsection give the comparison baseline.
2. **Identify which "when the answer would flip" condition the proposal claims is now met.** If none, the proposal needs to first argue why the prior framing is wrong (this is the higher bar; document the argument).
3. **Open a tracker entry in the relevant §3-§10 section** as a `### N.X New evidence (date)` subsection capturing the new candidate / new test data / new constraint.
4. **Propose the RFC-0007 §6 amendment** per the [RFC-0007 §15.2 change procedure](../rfcs/0007-canonical-document-rendering.md). The amendment is the *commitment* change; this doc is the *analysis* change.

### 12.2 When a new render kind needs adding (not an engine swap)

Different procedure: use the [RFC-0007 §15.3 lightweight render-kind allocation procedure](../rfcs/0007-canonical-document-rendering.md). This document grows a new §X "New render kind: <name>" section recording the candidate engines surveyed for the new kind, without amending the existing §3-§10 picks.

### 12.3 When this document and RFC-0007 disagree

**This document is the deeper analysis; RFC-0007 is the commitment artifact.** If you find a mismatch — e.g., this doc names an alternative as preferred but RFC-0007 §6.1 picks another, OR the conditions in this doc's "when it would flip" subsection are met but RFC-0007 §6.1 still lists the old pick — file an RFC-0007 amendment to bring the artifacts back into alignment. Drift between them is itself a defect.

The two-document split is intentional: RFC-0007 is a stable, easily-cited commitment text; this doc is a comparison artifact that grows over time. They serve different audiences with different needs.

---

## 13. Cross-references

- [`docs/rfcs/0007-canonical-document-rendering.md`](../rfcs/0007-canonical-document-rendering.md) — the canonical commitment artifact (Accepted 2026-05-21). §6.1 engine table; §6.2 pinning discipline; §11 alternatives considered; §15.2 change procedure; §15.3 lightweight render-kind allocation procedure.
- [`docs/design/validation-library-adoption-audit.md`](./validation-library-adoption-audit.md) — the precedent for "RFC commits; sibling design doc carries the comparative depth." This document mirrors its shape and self-positioning relative to its RFC.
- [`docs/LICENSING.md`](../LICENSING.md) §4 — "A fair survey of license families." The precedent for carrying a comparative survey before §6 commits; this document is the engine-specific analogue.
- [`docs/REDIS-ARCHITECTURE.md`](../REDIS-ARCHITECTURE.md) — the Redis state-of-play that informs the §10 job-queue pick.
- [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §2.1 — self-host posture every pick in this document was tested against.
- [`docs/PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §4.0 — AI-consultant context principle that informs the §2.4 AI-assistant-familiarity axis.
- [`docs/rfcs/0001-modules-tiers-governance-and-automation-placement.md`](../rfcs/0001-modules-tiers-governance-and-automation-placement.md) §8.2 — the consumption-contract row for document/file rendering that RFC-0007 added, this document operationalizes.
- [`docs/rfcs/0002-canonical-module-physical-layout.md`](../rfcs/0002-canonical-module-physical-layout.md) §4 convention 4 — Prisma multi-schema convention that the §10 BullMQ pick's Postgres-as-source-of-truth shape follows.
- [`docs/rfcs/0003-validation-library-adoption.md`](../rfcs/0003-validation-library-adoption.md) — the precedent for "library choice committed inside the RFC" (Decision B) which RFC-0007 §6 mirrors. The validation audit is this document's parallel.
- [`packages/platform/media/`](../../packages/platform/media/) — the asset pipeline that §11.1 image-processing concerns route through; rendering is a producer for `@umbraculum/media`.
