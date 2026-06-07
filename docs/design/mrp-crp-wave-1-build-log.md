# MRP/CRP Wave 1 build log

**Tier:** Public  
**Status:** Wave 1 foundation shipped  
**Started:** 2026-05-26  
**Completed:** 2026-05-26  
**Executor model:** GPT-5.5  
**Scope:** contracts packages, Prisma-backed read-only API skeletons, module registration, L2 isolation tests, and documentation updates for canonical `mrp` and `crp`.

> [!NOTE]
> This build log records implementation decisions for Wave 1 only. It does not claim that the August 2026 public-alpha proof is complete. Web/native pages, brewery projections, AI runtime tools, rendering jobs, write workflows, WMS behavior, and `@umbraculum/equipment-contracts` are intentionally out of scope unless a later plan explicitly adds them.

---

## Sources Of Truth

- [`mrp-crp-august-2026-co-design-plan.md`](mrp-crp-august-2026-co-design-plan.md)
- [`canonical-mrp-module-surface.md`](canonical-mrp-module-surface.md)
- [`canonical-crp-module-surface.md`](canonical-crp-module-surface.md)
- [`RFC-0001`](../rfcs/0001-modules-tiers-governance-and-automation-placement.md)
- [`RFC-0002`](../rfcs/0002-canonical-module-physical-layout.md)
- [`RFC-0003`](../rfcs/0003-validation-library-adoption.md)
- [`RFC-0007`](../rfcs/0007-canonical-document-rendering.md)
- [`CONTRACTS-VALIDATION-STRATEGY.md`](../CONTRACTS-VALIDATION-STRATEGY.md)
- [`TESTING.md`](../TESTING.md)
- [`DOCS-README-STANDARDS.md`](../DOCS-README-STANDARDS.md)
- [`NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md`](../NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md) §10

---

## Phase Log

| Phase | Status | Files / artifacts | Verification | Decision rationale |
|---|---|---|---|---|
| Phase 0 — preflight | Done | This build log | `git status --short --branch` clean at start | Wave 1 needs a durable build artifact because the plan is intended to be executable by non-frontier agents later. Recording rationale here prevents future readers from having to infer why Wave 1 stopped at contracts + read-only APIs. |
| Phase A — contracts | Done | `packages/modules/mrp-contracts/`, `packages/modules/crp-contracts/`, root/API package manifests + lockfiles, committed `dist/` outputs | Contract typecheck/test/build gates passed for both packages; `contracts-zod-auditor` OK after fixing paired AI tool output type aliases | Contracts are the public boundary for later web/native/API/AI/rendering work. Wave 1 intentionally includes planned AI/rendering payload schemas but no runtime registration. |
| Phase B — Prisma | Done | `services/api/prisma/schema.prisma`, `services/api/prisma/migrations/20260526090000_add_mrp_crp_wave1/migration.sql` | `docker compose exec -T api npx prisma migrate dev --name mrp_crp_wave1_foundation` applied successfully; full test reset replayed the migration | `mrp` and `crp` get separate schemas with app-level string references across module boundaries. CRP capacity load is computed from calendars + scheduled operations rather than persisted as a premature aggregate table. |
| Phase C — API | Done | `services/api/src/modules/mrp/`, `services/api/src/modules/crp/` | `docker compose exec -T api npm run typecheck` passed; targeted route tests passed | Routes are read-only and schema-bound with Fastify's Zod type provider. Services call `WorkspacesService.assertMembership` and scope all Prisma reads by `workspaceId`. |
| Phase D — registration | Done | `services/api/src/app.ts`, `services/api/src/modules/mrp/index.ts`, `services/api/src/modules/crp/index.ts`, `services/api/src/tests/mrpCrpModuleRegistration.test.ts` | Module-registration test passed; `scripts/check-web-url-segments.ts` passed | Both modules are recorded in `@umbraculum/module-sdk` with Prisma schema ownership and planned web segment ownership. No nav entry, AI tool registrar, or document-template registration ships in Wave 1. |
| Phase E — L2 tests | Done | `services/api/src/tests/mrpProductionOrders.test.ts`, `mrpBoms.test.ts`, `crpResources.test.ts`, `crpPlanningReadModels.test.ts` | Targeted route tests passed; full API test suite passed | Tests seed rows directly through Prisma and assert authenticated, no-active-workspace, validation, same-code/same-number, cross-workspace list, and detail isolation behavior. |
| Phase F — docs | Done | Surface docs, module pages, `docs/MODULES.md`, `docs/ROADMAP.md`, package/API READMEs, this build log | Targeted module README checker OK | Public docs now say "Wave 1 foundation shipped" and still preserve the non-goal: no public-alpha proof, web/native UI, brewery projection, AI/runtime rendering, optimizer, or write workflows. |

---

## Verification Notes

- `docker compose exec -T api npx prisma migrate dev --name mrp_crp_wave1_foundation` — OK.
- `docker run ... npm run typecheck/test/build -w @umbraculum/mrp-contracts` — OK, 8 files / 16 tests.
- `docker run ... npm run typecheck/test/build -w @umbraculum/crp-contracts` — OK, 13 files / 25 tests.
- `docker compose exec -T api npm run typecheck` — OK.
- `docker compose exec -T api npm test -- src/tests/mrpProductionOrders.test.ts src/tests/mrpBoms.test.ts src/tests/crpResources.test.ts src/tests/crpPlanningReadModels.test.ts src/tests/mrpCrpModuleRegistration.test.ts` — OK, 5 files / 20 tests.
- `docker compose exec -T api npm test` — OK.
- `docker run ... npx tsx scripts/check-web-url-segments.ts` — OK, 0 violations.
- Public endpoint verification through nginx (`/api/mrp/production-orders`, `/api/mrp/boms`, `/api/crp/resources`, `/api/crp/work-centers`, `/api/crp/capacity-load`, `/api/crp/scheduled-operations`, `/api/crp/conflicts`) — OK, all authenticated GETs returned `ok: true`.
- `contracts-zod-auditor` — OK after paired AI tool output type aliases were added.
- `module-readme-checker` — OK after the package README heading fix.
- `types-baseline-verifier` — OK for `packages/modules/mrp-contracts`, `packages/modules/crp-contracts`, and `services/api`.
- CI-parity clean-snapshot reproduction — deferred until commit time. The canonical `scripts/ci-parity-check.sh` uses `git archive HEAD`, which cannot include this uncommitted Wave 1 working tree without creating a temporary commit; do not claim CI parity before a real commit/push gate runs.

## Local Runtime Notes

- The API container needed to be recreated so the new `packages/modules/mrp-contracts` and `packages/modules/crp-contracts` bind mounts were visible.
- The existing `@umbraculum/rendering` nested dependency issue reappeared after container/npm operations; restoring `packages/platform/rendering/node_modules/@fast-csv/format` with a one-off container install made the API dev server healthy again. This is the same runtime-dependency shape previously observed for the rendering package, not a new MRP/CRP behavior.
