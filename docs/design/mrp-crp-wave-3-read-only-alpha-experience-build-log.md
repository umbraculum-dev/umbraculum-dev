# MRP/CRP Wave 3 read-only alpha experience build log

**Tier:** Public
**Status:** Completed 2026-05-26 — read-only alpha experience shipped; full August alpha proof still open
**Started:** 2026-05-26
**Executor model:** GPT-5.5
**Scope:** read-only web alpha experience for the canonical `mrp` and `crp` read surfaces.

> [!NOTE]
> Wave 3 consumes Wave 2 projections through existing HTTP APIs. It does not
> create persisted MRP/CRP projection rows, add write routes, rewrite brewery
> ownership, add native screens, register AI runtime tools, or introduce
> rendering workflows.

---

## Sources Of Truth

- [`mrp-crp-wave-2-brewery-projection-build-log.md`](mrp-crp-wave-2-brewery-projection-build-log.md)
- [`canonical-mrp-module-surface.md`](canonical-mrp-module-surface.md)
- [`canonical-crp-module-surface.md`](canonical-crp-module-surface.md)
- [`mrp-crp-august-2026-co-design-plan.md`](mrp-crp-august-2026-co-design-plan.md)
- [`web-route-group-audit.md`](web-route-group-audit.md)
- [`../NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md`](../NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md) §10

---

## Route-Shape Constraints

- No `(mrp)/page.tsx` or `(crp)/page.tsx` group-root pages.
- No group-root dynamic routes such as `(mrp)/[id]/page.tsx` or `(crp)/[id]/page.tsx`.
- MRP uses existing owned segments: `production-orders`, `work-orders`, `material-requirements`.
- CRP uses existing owned segments: `capacity`, `schedule`, `resources`.
- `work-orders` remains registered for future work, but Wave 3 does not need to render it.

---

## Alpha-Proof Criteria

Wave 3 can claim the read-only alpha experience only when the web UI shows:

- brewery recipes/sessions as MRP production planning read models,
- material requirements derived from source recipe ingredients,
- automation vessels and brewery equipment profiles as CRP planning read models,
- timed brew-session steps as CRP scheduled operations/load/conflicts where source data permits,
- clear provenance labels showing projected rows remain owned by brewery/automation.

---

## Phase Log

| Phase | Status | Files / artifacts | Verification | Decision rationale |
|---|---|---|---|---|
| Phase 0 — preflight | Completed | This build log | `git status --short --branch` clean at start | A visible read-only web experience is the next proof step after Wave 2 API projections. Keeping the first web pass read-only avoids creating premature MRP/CRP ownership, sync, or write semantics. |
| Phase A — route ownership, navigation, i18n | Completed | `packages/navigation/src/index.ts`, `packages/navigation/src/native.ts`, `apps/web/app/_components/PrimaryNav.tsx`, `scripts/check-web-url-segments.ts`, `packages/i18n/src/en.json`, `packages/i18n/src/it.json`, `apps/web/package.json`, lockfiles, `docker-compose.yml` web mounts | Focused E2E verifies localized nav/page labels; route-segment gate passed | MRP/CRP use their already-registered owned URL segments. Native route availability remains blocked. |
| Phase B — MRP read pages | Completed | `apps/web/app/[locale]/(mrp)/production-orders/page.tsx`, `production-orders/[orderId]/page.tsx`, `material-requirements/page.tsx`, `_components/MrpReadOnly.tsx` | Focused E2E passed | Pages call existing MRP read APIs and parse responses through `@umbraculum/mrp-contracts`; no write controls, projection ID parsing, or new aggregate routes were added. |
| Phase C — CRP read pages | Completed | `apps/web/app/[locale]/(crp)/resources/page.tsx`, `resources/[resourceId]/page.tsx`, `capacity/page.tsx`, `schedule/page.tsx`, `_components/CrpReadOnly.tsx` | Focused E2E passed | Pages call existing CRP read APIs and parse responses through `@umbraculum/crp-contracts`; conflicts are read-only warnings. |
| Phase D — cross-links and alpha proof labels | Completed | MRP/CRP pages above | Focused E2E pins at least one "Projected from brewery" label and no write controls | Cross-links use explicit payload fields such as `productionOrderId` and `resourceId`. The UI does not guess brewery or automation source URLs from opaque projection IDs. |
| Phase E — tests | Completed | `apps/web/e2e/smoke/mrp-crp-read-only-alpha.spec.ts` | `npx playwright test smoke/mrp-crp-read-only-alpha.spec.ts --project=smoke` passed in the documented Playwright container | The E2E seed contains enough brewery data for MRP projection proof. It does not contain deterministic CRP resource/schedule data, so the CRP smoke pins page shells and no-write behavior without changing global seed scope. |
| Phase F — docs | Completed | This build log, MRP/CRP surface docs, canonical module pages, brewery README, module catalog, roadmap | README structural check and whitespace check passed | Docs say "Wave 3 read-only alpha experience shipped" and do not claim MRP/CRP alpha completion. |

---

## Verification Notes

- `docker compose exec -T web npm install` — completed; refreshed web workspace symlinks for `@umbraculum/mrp-contracts` and `@umbraculum/crp-contracts`.
- `./scripts/build-packages-in-docker.sh` — completed; rebuilt committed `dist/` outputs after i18n/navigation changes.
- `docker compose exec -T web npm run typecheck` — exits non-zero on the existing Tamagui shorthand baseline outside Wave 3; the final rerun had no matches for Wave 3 files, `PrimaryNav`, `packages/navigation`, or `scripts/check-web-url-segments.ts`.
- `docker run --rm -v "$PWD:/repo" -w /repo/packages/navigation node:20-slim bash -lc "npm run typecheck"` — passed.
- `docker run --rm -v "$PWD:/repo" -w /repo node:20-slim bash -lc "npx eslint apps/web/app/'[locale]'/'(mrp)' apps/web/app/'[locale]'/'(crp)' apps/web/e2e/smoke/mrp-crp-read-only-alpha.spec.ts apps/web/app/_components/PrimaryNav.tsx packages/navigation/src/index.ts packages/navigation/src/native.ts scripts/check-web-url-segments.ts --max-warnings 0"` — passed.
- `docker run --rm -v "$PWD:/repo" -w /repo node:20-slim bash -lc "npm run check-web-url-segments"` — passed, 0 violations.
- `docker compose exec -T api npm run seed:e2e` — completed before focused E2E.
- `docker run --rm --network host -e E2E_BASE_URL=http://localhost:18080 -v "$PWD/apps/web/e2e:/e2e" -w /e2e mcr.microsoft.com/playwright:v1.60.0-noble bash -lc "npm install --no-audit --no-fund && npx playwright test smoke/mrp-crp-read-only-alpha.spec.ts --project=smoke"` — passed, 3/3.
- `python3 scripts/docs/check-readmes.py` — passed, 19/19 OK.
- `git diff --check` — passed.
- `bash scripts/ci-parity-check.sh --sha b29b576cd116957a127cb4aea07e9e9aecc856d9` — passed on a temporary dangling commit object made from the Wave 3 working tree; docs-readmes OK, typecheck OK, lint OK.
- Public endpoint verification on `http://localhost:18080`: `/api/health` returned 200; `/en/production-orders`, `/en/material-requirements`, `/en/capacity`, `/en/schedule`, and `/en/resources` all returned HTTP 200.
- API health was restored to HTTP 200 after the package rebuild by restarting the API and applying the documented `packages/rendering` dependency bootstrap for the known rendering package realpath resolution gap.
