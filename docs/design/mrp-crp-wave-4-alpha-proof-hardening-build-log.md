# MRP/CRP Wave 4 alpha proof hardening build log

**Tier:** Public
**Status:** Completed 2026-05-26 — deterministic read-only alpha proof shipped; full August alpha remains open
**Started:** 2026-05-26
**Executor model:** GPT-5.5
**Scope:** deterministic read-only alpha proof for the canonical `mrp` and `crp` brewery projections.

> [!NOTE]
> Wave 4 hardens the Wave 3 read-only web proof by seeding deterministic
> brewery/equipment/automation source rows and strengthening assertions over the
> existing Wave 2 read-time projections. It does not create persisted MRP/CRP
> projection rows, add write routes, rewrite brewery ownership, add native
> screens, register AI runtime tools, introduce rendering workflows, or add
> optimizer behavior.

---

## Sources Of Truth

- [`mrp-crp-wave-3-read-only-alpha-experience-build-log.md`](mrp-crp-wave-3-read-only-alpha-experience-build-log.md)
- [`mrp-crp-wave-2-brewery-projection-build-log.md`](mrp-crp-wave-2-brewery-projection-build-log.md)
- [`canonical-mrp-module-surface.md`](canonical-mrp-module-surface.md)
- [`canonical-crp-module-surface.md`](canonical-crp-module-surface.md)
- [`mrp-crp-august-2026-co-design-plan.md`](mrp-crp-august-2026-co-design-plan.md)
- [`../NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md`](../NON-FRONTIER-EXECUTOR-FITNESS-TRACKER.md) §10

---

## Fixture Guardrails

- Seed only deterministic E2E fixture rows under the existing E2E workspaces.
- Use stable IDs for equipment profile, automation vessel, and brew-session steps.
- Keep `seed:e2e` idempotent: repeat runs update the same rows, not duplicates.
- Keep `seed:e2e -- --clean` bounded to E2E fixture rows and delete in dependency order.
- Do not materialize rows in `mrp.*` or `crp.*`; projections remain read-time only.

---

## Alpha-Proof Criteria

Wave 4 can claim deterministic read-only alpha proof coverage when a seeded E2E run shows:

- the brewery recipe/session as an MRP production order,
- recipe ingredients as material requirements,
- the automation vessel as a CRP resource,
- the brewery equipment profile as CRP work-center context where surfaced,
- timed brew-session steps as scheduled operations and capacity-load buckets,
- missing duration/resource inputs as read-only CRP conflicts,
- visible provenance labels showing brewery/automation remain source systems.

This still does not close rendering, AI tools, write workflows, optimizer behavior, native screens, or WMS constraints.

---

## Phase Log

| Phase | Status | Files / artifacts | Verification | Decision rationale |
|---|---|---|---|---|
| Phase 0 — preflight | Completed | This build log | `git status --short --branch` clean at start | The least risky next step after Wave 3 is deterministic proof quality. Fixture-backed proof avoids adding premature MRP/CRP ownership, sync, or write semantics. |
| Phase A — deterministic fixture | Completed | `services/api/src/cli/seedE2eFixture.ts`, `apps/web/e2e/personas.json`, `apps/web/e2e/support/personas.ts`, `docs/TESTING.md` | Pending Phase F gates | Stable E2E source rows give reviewers one repeatable brewery planning story without adding persisted MRP/CRP rows. |
| Phase B — API proof | Completed | `services/api/src/tests/crpBreweryProjection.test.ts`, `services/api/src/tests/mrpCrpBreweryProjectionIntegration.test.ts` | Pending Phase F gates | API tests pin the source-of-truth projection contracts before the browser relies on deterministic labels. |
| Phase C — web proof | Completed | CRP read-only pages and i18n strings | Pending Phase F gates | The UI now exposes explicit source labels and links that are already present in API payloads; no projection ID parsing was added. |
| Phase D — E2E proof | Completed | `apps/web/e2e/smoke/mrp-crp-read-only-alpha.spec.ts` | Pending Phase F gates | The smoke now asserts fixture-backed content across MRP materials and CRP resource/capacity/schedule/conflict surfaces. |
| Phase E — documentation | Completed | Surface docs, module docs, brewery README, module catalog, roadmap, this build log | Pending docs checker | Docs say "deterministic read-only proof" and avoid claiming full MRP/CRP alpha completion. |
| Phase F — verification | Completed | Container checks, Playwright, endpoint checks, CI parity | See verification notes | The deterministic proof is green in focused checks and in a temporary commit-tree CI-parity snapshot. |

---

## Verification Notes

Commands and gate-skill results will be appended here as implementation proceeds.

- `playwright-runner-docs-gate` was read before editing `apps/web/e2e/smoke/mrp-crp-read-only-alpha.spec.ts`.
- `docker compose exec -T api npm run seed:e2e` — passed; seeded the Wave 4 fixture IDs.
- `docker compose exec -T api npm test -- src/tests/crpBreweryProjection.test.ts src/tests/mrpCrpBreweryProjectionIntegration.test.ts` — passed, 2 files / 6 tests.
- `docker compose exec -T api npm run typecheck` — passed.
- `./scripts/build-packages-in-docker.sh` — passed; rebuilt package `dist/` outputs after i18n changes.
- `docker run --rm -v "$PWD:/repo" -w /repo node:20-slim bash -lc "npm run check-web-url-segments"` — passed, 0 violations.
- Targeted ESLint over Wave 4 API/web/E2E files — passed.
- First focused Playwright run exposed expected dev-watcher drift after package rebuild (`tsx` preload / `packages/platform/rendering` realpath dependency issue). Services were restarted and `packages/platform/rendering` dependencies were bootstrapped with `npm install --no-package-lock`; the E2E seed then passed again.
- `docker run --rm --network host -e E2E_BASE_URL=http://localhost:18080 -v "$PWD/apps/web/e2e:/e2e" -w /e2e mcr.microsoft.com/playwright:v1.60.0-noble bash -lc "npm install --no-audit --no-fund && npx playwright test smoke/mrp-crp-read-only-alpha.spec.ts --project=smoke"` — passed on rerun, 4/4.
- `python3 scripts/docs/check-readmes.py` — passed, 19/19 OK.
- `git diff --check` — passed.
- `docker compose exec -T web npm run typecheck` — exits non-zero on the existing Tamagui baseline; targeted search found no Wave 4 touched-file matches in the command output. `types-baseline-verifier` confirmed `services/api`, `apps/web/e2e`, and `packages/platform/i18n` typecheck clean; `apps/web` still fails on the documented Tamagui baseline, with no Wave 4-introduced changed-line type issues.
- Public endpoint verification on `http://localhost:18080`: `/api/health`, `/en/production-orders`, `/en/resources`, `/en/capacity`, and `/en/schedule` all returned HTTP 200.
- `e2e-smoke` non-blocking signal was skipped by the subagent because no agentic control-panel CLI/container inputs were discoverable in this checkout or running stack.
- Verification-time lockfile drift in `apps/web/e2e/package-lock.json` and `services/api/package-lock.json` was manually restored; those files are not part of the Wave 4 diff.
- `bash scripts/ci-parity-check.sh --sha caf611d8696fd37a52d0f27d61a9afa3b6d45be9` — passed on a temporary commit-tree snapshot of the Wave 4 working tree; docs-readmes OK, lint OK, typecheck OK.
