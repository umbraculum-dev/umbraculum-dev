# MRP/CRP Wave 2 brewery projection build log

**Tier:** Public
**Status:** Wave 2 brewery projection shipped
**Started:** 2026-05-26
**Completed:** 2026-05-26
**Executor model:** GPT-5.5
**Scope:** read-time brewery projections into the canonical `mrp` and `crp` read surfaces.

> [!NOTE]
> Wave 2 keeps brewery and automation as the source of truth. Projected MRP/CRP rows are deterministic read models only: no sync jobs, no projection tables, no MRP/CRP writes, no brewery data migration, no web/native pages, no AI runtime tools, and no rendering runtime jobs.

---

## Sources Of Truth

- [`mrp-crp-wave-1-build-log.md`](mrp-crp-wave-1-build-log.md)
- [`mrp-crp-august-2026-co-design-plan.md`](mrp-crp-august-2026-co-design-plan.md)
- [`canonical-mrp-module-surface.md`](canonical-mrp-module-surface.md)
- [`canonical-crp-module-surface.md`](canonical-crp-module-surface.md)
- [`../modules/verticals/brewery/BEERJSON-FIRST.md`](../modules/verticals/brewery/BEERJSON-FIRST.md)
- [`../NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md`](../NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md) §10

---

## Projection Defaults

- Projection IDs are deterministic and URL-safe, e.g. `brewery-recipe-<recipeId>`, `brewery-brew-session-<sessionId>`, and `automation-vessel-<vesselId>`.
- Persisted MRP/CRP rows win when a detail route receives a real persisted ID; projection IDs resolve only through projection services.
- Brewery projections are included by default on existing read routes.
- Timed CRP scheduled operations are projected only when source timing has enough information to satisfy the contract without inventing timestamps.

---

## Phase Log

| Phase | Status | Files / artifacts | Verification | Decision rationale |
|---|---|---|---|---|
| Phase 0 — preflight | Completed | This build log | `git status --short --branch` clean at start | Read-time projection is the least invasive way to prove brewery-to-canonical mapping while keeping Wave 1 contracts and brewery ownership intact. Persisted projection rows are intentionally avoided because sync semantics, conflict resolution, and backfill lifecycle are larger than this wave. |
| Phase A — projection identity | Completed | `services/api/src/modules/mrp/services/breweryProjectionIds.ts`, `services/api/src/modules/crp/services/breweryProjectionIds.ts` | `docker compose exec -T api npm run typecheck` passed | Projection IDs are deterministic and URL-safe, so list/detail routes round-trip without materializing `mrp.*` or `crp.*` rows. No contract schema changes were needed; existing `sourceModule`/`sourceRefId` fields carry provenance. |
| Phase B — MRP brewery projection | Completed | `services/api/src/modules/mrp/services/breweryProjectionService.ts`, `services/api/src/modules/mrp/services/mrpService.ts` | Targeted projection tests passed | Recipes project as BOMs through a local Zod BeerJSON ingredient parser, brew sessions project as production orders, session steps project as operations, and source recipe ingredients project as assumption-only material requirements. Persisted MRP rows still win detail resolution before projection IDs are considered. |
| Phase C — CRP brewery projection | Completed | `services/api/src/modules/crp/services/breweryProjectionService.ts`, `services/api/src/modules/crp/services/resourcesService.ts`, `services/api/src/modules/crp/services/planningService.ts` | Targeted projection tests passed | Automation vessels project as CRP resources, equipment profiles project as work centers, and timed brew-session steps project as scheduled operations when the source data satisfies contract-required timestamps. Capacity buckets are emitted only for assigned/timed projected operations; unavailable projected capacity is represented as `availableMinutes: 0`, and missing duration/resource inputs appear as read-only conflicts. |
| Phase D — route behavior | Completed | Existing Wave 1 routes only; no route shape changed | `docker compose exec -T api npm test -- src/tests/mrpBreweryProjection.test.ts src/tests/crpBreweryProjection.test.ts src/tests/mrpCrpBreweryProjectionIntegration.test.ts` passed | Brewery projections are included by default on authenticated workspace reads. Route handlers keep their existing Zod request/response declarations and parse every response through MRP/CRP contract schemas. |
| Phase E — tests | Completed | `services/api/src/tests/mrpBreweryProjection.test.ts`, `services/api/src/tests/crpBreweryProjection.test.ts`, `services/api/src/tests/mrpCrpBreweryProjectionIntegration.test.ts` | Targeted tests: 3 files, 11 tests passed | Tests cover MRP BOM/order/operation/material-requirement projections, CRP resource/work-center/scheduled-operation/load/conflict projections, cross-workspace isolation, same-code cross-workspace safety, contract parsing, and non-mutating/non-materializing read behavior. |
| Phase F — documentation | Completed | Surface docs, module pages, brewery README, module catalog, roadmap | `python3 scripts/docs/check-readmes.py` passed; `git diff --check` passed | Docs say Wave 2 brewery projection shipped without claiming public alpha completion or ready-to-sell MRP/CRP suites. |
| Phase G — verification | Completed | Full API suite, typecheck, public endpoint smoke | API typecheck passed; targeted projection tests passed; full API suite passed; endpoint smoke passed | Verification covered service-level TypeScript, route behavior, full regression surface, public GET reachability, docs structure, and whitespace. CI parity is intentionally deferred until a commit exists because clean-snapshot parity only captures committed state. |

---

## Verification Notes

- `docker compose exec -T api npm run typecheck` — passed.
- `docker compose exec -T api npm test -- src/tests/mrpBreweryProjection.test.ts src/tests/crpBreweryProjection.test.ts src/tests/mrpCrpBreweryProjectionIntegration.test.ts` — passed.
- `docker compose exec -T api npm test` — passed, 68 files / 505 tests.
- `python3 scripts/docs/check-readmes.py` — passed, 19/19 OK.
- `git diff --check` — passed.
- Public endpoint smoke against `http://127.0.0.1:18080/api/...` with a temporary authenticated dev session — passed for `/api/mrp/boms`, `/api/mrp/production-orders`, `/api/crp/resources`, `/api/crp/work-centers`, `/api/crp/capacity-load`, `/api/crp/scheduled-operations`, and `/api/crp/conflicts`.
- `contracts-zod-auditor` — not run because this wave did not change contract files or schema-bound route files.
- CI parity clean-snapshot reproduction — deferred until commit time because `git archive HEAD` does not include the uncommitted Wave 2 implementation.
