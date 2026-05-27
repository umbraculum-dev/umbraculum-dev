# MRP/CRP Wave 5 AI planning advisor build log

**Tier:** Public
**Status:** In progress
**Started:** 2026-05-26
**Executor model:** GPT-5.5
**Scope:** read-only AI consultant tools for the canonical `mrp` and `crp` read surfaces.

> [!NOTE]
> Wave 5 adds module-owned AI tools that let the workspace AI consultant explain
> the deterministic Wave 4 planning proof. It does not add MRP/CRP writes,
> persisted projection rows, sync jobs, optimizer behavior, WMS reservations,
> native screens, rendering jobs, or autonomous AI mutations.

---

## Source Documents

- [`mrp-crp-wave-4-alpha-proof-hardening-build-log.md`](mrp-crp-wave-4-alpha-proof-hardening-build-log.md)
- [`canonical-mrp-module-surface.md`](canonical-mrp-module-surface.md)
- [`canonical-crp-module-surface.md`](canonical-crp-module-surface.md)
- [`../AI-CONSULTANT.md`](../AI-CONSULTANT.md)
- [`../NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md`](../NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md) §10

---

## Canonical / Vertical Guardrails

- `mrp` and `crp` expose canonical read tools over planning kernels.
- Brewery remains the vertical source of truth for recipes, brew sessions, and brewery-specific assumptions.
- Automation remains the canonical source of truth for vessel rows consumed as CRP resources.
- AI tools must call existing services and preserve explicit `sourceModule` / `sourceRefId` payload fields.
- AI tools must not parse projection IDs to infer source data or materialize MRP/CRP projection rows.

---

## Runtime Tool List

- `mrp.listProductionOrders`
- `mrp.getProductionOrder`
- `mrp.explainMaterialRequirements`
- `crp.listResources`
- `crp.listWorkCenters`
- `crp.listScheduledOperations`
- `crp.explainCapacityLoad`
- `crp.listConflicts`

---

## Phase Log

| Phase | Status | Files / artifacts | Verification | Decision rationale |
|---|---|---|---|---|
| Phase 0 — build log and guardrails | Completed | This build log | `git status --short --branch` clean at start | The first AI pass should attach to the module-owned tool registry and existing read services, not to ad hoc prompt text or new aggregate routes. |
| Phase A — contract and tool-surface audit | Completed | `packages/mrp-contracts/src/aiTools.test.ts`, `packages/crp-contracts/src/aiTools.ts`, `packages/crp-contracts/src/aiTools.test.ts`, `packages/crp-contracts/src/index.ts` | Pending Phase F gates | MRP's planned schemas already matched Wave 5. CRP still exposed future schedule aggregate schemas, so Wave 5 adds generic read schemas for the shipped work-center, scheduled-operation, capacity-load, and conflict surfaces without inventing schedule rows. |
| Phase B — runtime read tools | Completed | `services/api/src/services/ai/tools/mrp/*`, `services/api/src/services/ai/tools/crp/*` | Pending Phase F gates | Tool handlers call the same workspace-scoped MRP/CRP services as HTTP routes, preserving projection provenance and avoiding raw SQL or AI-specific aggregate routes. |
| Phase C — module registration | Completed | `services/api/src/modules/mrp/index.ts`, `services/api/src/modules/crp/index.ts`, `services/api/src/tests/mrpCrpModuleRegistration.test.ts` | Pending Phase F gates | The tools are registered through `registerModule({ registerAiTools })`, matching existing module-owned AI bundles and keeping the platform registry as the single orchestration point. |
| Phase D — API and orchestrator proof | Completed | `services/api/src/tests/ai/mrpCrpPlanningTools.test.ts`, `services/api/src/tests/ai/ai.integration.test.ts` | Pending Phase F gates | Direct tool tests seed deterministic source rows and assert projected read-model evidence without materializing MRP/CRP rows. The mocked AI integration test proves one chat turn can call representative MRP and CRP tools through the existing orchestrator without a real provider call. |
| Phase E — docs and operator-facing copy | Completed | `docs/AI-CONSULTANT.md`, `docs/design/canonical-mrp-module-surface.md`, `docs/design/canonical-crp-module-surface.md`, `docs/modules/canonical/mrp.md`, `docs/modules/canonical/crp.md`, `docs/modules/verticals/brewery/README.md`, `docs/MODULES.md`, `docs/ROADMAP.md` | Pending Phase F gates | Docs now state that Wave 5 read-only AI planning advisor shipped while avoiding "MRP/CRP alpha complete" language. The advisor wording preserves canonical MRP/CRP ownership and keeps brewery/automation as vertical/source projections. |
| Phase F — verification | Completed | Full Wave 5 change set | See verification notes below | The verification sequence found two local container dependency drifts (`api` missing transitive `pathe`, `packages/rendering` missing MJML transitive deps) and repaired them in container-only workflows without keeping lockfile drift. API watcher drift after package rebuild required `docker compose restart api`; no code change was made for that runtime-only issue. |

---

## Verification Notes

- `./scripts/build-packages-in-docker.sh` — PASS after restarting an interrupted first run.
- `docker compose exec -T api npm install --no-audit --no-fund --no-package-lock` — runtime repair only; restored missing `pathe` under API container `node_modules`.
- `docker run --rm -v "$PWD/packages/rendering:/repo/packages/rendering" -w /repo/packages/rendering node:20-slim npm install --no-audit --no-fund --no-package-lock` — runtime repair only; restored MJML transitive dependencies needed by API test imports.
- `docker compose exec -T api npm test -- src/tests/ai/mrpCrpPlanningTools.test.ts src/tests/ai/ai.integration.test.ts src/tests/mrpCrpModuleRegistration.test.ts` — PASS, 3 files / 17 tests.
- `docker compose exec -T api npm test -- src/tests/crpBreweryProjection.test.ts src/tests/mrpCrpBreweryProjectionIntegration.test.ts` — PASS, 2 files / 6 tests.
- `docker compose exec -T api npm run typecheck` — PASS.
- `docker run --rm -v "$PWD:/repo" -v brewery_app_root_node_modules:/repo/node_modules -w /repo node:20-slim bash -lc 'npm test -w @umbraculum/mrp-contracts && npm test -w @umbraculum/crp-contracts'` — PASS, MRP 8 files / 16 tests; CRP 13 files / 25 tests.
- `docker run --rm -v "$PWD:/repo" -v brewery_app_root_node_modules:/repo/node_modules -w /repo node:20-slim bash -lc 'npm run typecheck -w @umbraculum/mrp-contracts && npm run typecheck -w @umbraculum/crp-contracts'` — PASS.
- Targeted ESLint via repo-local binary in `node:20-slim` against Wave 5 API/contract files — PASS. The first attempt through `npm run lint -- ...` was discarded because that script expands to `eslint .` and picked up unrelated generated docs-site files.
- `python3 scripts/docs/check-readmes.py` — PASS, 19/19 OK.
- `git diff --check` — PASS.
- Public endpoint verification — PASS for `GET http://localhost:4000/health` and `GET http://localhost:3000/en/ai`. The plan's example `GET /api/health` returned 404 because this API's registered health route is `/health`.
- CI parity against final temporary tree `3ee93f82bd4fdd39e2534c25ada7da7ac1bdcc48` — PASS: docs-readmes OK, typecheck OK (15/15 workspaces), lint OK.
- Non-blocking `e2e-smoke` control-panel run — SKIPPED; no new web route or risky storefront/browser behavior was introduced, and the focused API/orchestrator proof covers the Wave 5 behavior.
