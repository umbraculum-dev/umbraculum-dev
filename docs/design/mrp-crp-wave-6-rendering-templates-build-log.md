# MRP/CRP Wave 6 rendering templates build log

**Tier:** Public
**Status:** Shipped (2026-05-26)
**Started:** 2026-05-26
**Scope:** RFC-0007 document templates and module-owned render-job routes for canonical `mrp` and `crp`.

> [!NOTE]
> Wave 6 registers eight module-owned templates and convenience HTTP routes that
> submit async `persist-to-media` rendering jobs through the platform pipeline.
> It does not add MRP/CRP writes, persisted projection rows, new AI export tools,
> or email delivery.

---

## Source Documents

- [`mrp-crp-wave-5-ai-planning-advisor-build-log.md`](mrp-crp-wave-5-ai-planning-advisor-build-log.md)
- [`canonical-mrp-module-surface.md`](canonical-mrp-module-surface.md)
- [`canonical-crp-module-surface.md`](canonical-crp-module-surface.md)
- [`../rfcs/0007-canonical-document-rendering.md`](../rfcs/0007-canonical-document-rendering.md)
- [`canonical-pim-module-surface.md`](canonical-pim-module-surface.md) §8.3 (PIM PR7 reference consumer)

---

## Canonical / Vertical Guardrails

- Templates call `@umbraculum/rendering` only; no module-private PDF/XLSX/CSV libraries.
- Payload builders reuse Wave 5 read services and brewery/automation projections.
- Preserve `sourceModule` / `sourceRefId` on all projected entities in template data.
- Do not parse projection IDs to infer ownership or materialize MRP/CRP rows.

---

## Template Registry (8)

| Ref | Kind | Module |
|-----|------|--------|
| `mrp:work-order-pdf@v1` | pdf | mrp |
| `mrp:route-card-pdf@v1` | pdf | mrp |
| `mrp:material-requirements-xlsx@v1` | xlsx | mrp |
| `mrp:production-order-csv@v1` | csv | mrp |
| `crp:capacity-load-xlsx@v1` | xlsx | crp |
| `crp:schedule-pdf@v1` | pdf | crp |
| `crp:resource-calendar-csv@v1` | csv | crp |
| `crp:conflict-report-pdf@v1` | pdf | crp |

---

## Phase Log

| Phase | Status | Files / artifacts | Verification |
|---|---|---|---|
| Phase 0 — build log | Shipped | This file | — |
| Phase A — contracts | Shipped | `packages/modules/mrp-contracts`, `packages/modules/crp-contracts` `documentTemplates.ts` + dist | `npm run test -w @umbraculum/mrp-contracts` / `crp-contracts` in container |
| Phase B — payload builders | Shipped | `workOrderDocumentService.ts`, `capacityExportService.ts` | Covered by render integration tests |
| Phase C — templates + registration | Shipped | `mrp/documentTemplates.ts`, `crp/documentTemplates.ts`, `htmlToPdf.ts` | `mrpCrpModuleRegistration.test.ts` (8 refs) |
| Phase D — HTTP routes | Shipped | `workOrdersRoutes.ts`, `capacityRenderRoutes.ts` | `mrpCrpRendering.test.ts` |
| Phase E — render_document proof | Shipped | `renderDocumentTool.test.ts` | Vitest (MRP + CRP template refs) |
| Phase F — tests | Shipped | `mrpCrpRendering.test.ts`, registration + AI tests | 12 tests green in `api` container (Gotenberg + Redis) |
| Phase G — docs | Shipped | surface docs, MODULES, ROADMAP, AI-CONSULTANT, module pages, package READMEs | `check-readmes` |
| Phase H — verification | Shipped | typecheck, vitest, eslint (targeted), check-readmes | See notes below |

---

## Verification Notes

- **Packages:** `./scripts/build-packages-in-docker.sh`; contract package tests in container.
- **API:** `docker compose exec -T api npm run typecheck`.
- **Tests:** `docker compose exec -T api npx vitest run src/tests/mrpCrpRendering.test.ts src/tests/mrpCrpModuleRegistration.test.ts src/tests/ai/renderDocumentTool.test.ts` (requires `gotenberg` + `redis`).
- **Docs:** `python3 scripts/docs/check-readmes.py`.
- **Not claimed:** MRP/CRP alpha-complete, propose/write tools, email delivery.
- **Follow-on:** [`mrp-crp-alpha-demo-closure-build-log.md`](mrp-crp-alpha-demo-closure-build-log.md) — web export buttons, walkthrough runbook, full render-job test matrix, Playwright export smoke.
