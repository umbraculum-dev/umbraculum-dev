# MRP/CRP alpha demo closure build log

**Tier:** Public
**Status:** Shipped (2026-05-26) — automated proof; human walkthrough sign-off pending
**Started:** 2026-05-26
**Scope:** Public-alpha demo closure (post–Wave 6): operator export UI, walkthrough runbook, full render-job API matrix, Playwright export smoke.

> [!NOTE]
> This wave makes co-design §6 **repeatable in the browser and CI**. It does **not** claim MRP/CRP alpha-complete (no propose-write, WMS, native writes).

---

## Source documents

- [`mrp-crp-alpha-demo-walkthrough.md`](mrp-crp-alpha-demo-walkthrough.md) — operator runbook
- [`mrp-crp-wave-6-rendering-templates-build-log.md`](mrp-crp-wave-6-rendering-templates-build-log.md)
- [`mrp-crp-august-2026-co-design-plan.md`](mrp-crp-august-2026-co-design-plan.md) §6

---

## Phase table

| Phase | Status | Deliverable | Verification |
|-------|--------|-------------|--------------|
| 0 — Runbook | Shipped | `mrp-crp-alpha-demo-walkthrough.md` | Linked from Wave 6 log + surface docs |
| 1 — Web render client | Shipped | `apps/web/app/_lib/renderJobClient.ts`, `AsyncExportButton` | Web typecheck |
| 2 — Export UI | Shipped | MRP order detail + list; CRP capacity, schedule, resources | Playwright export smoke |
| 3 — API matrix | Shipped | All 8 module render-job routes in `mrpCrpRendering.test.ts` | Vitest (gotenberg + redis) |
| 4 — Playwright | Shipped | `mrp-crp-export-alpha.spec.ts` | Smoke profile |
| 5 — Human sign-off | Pending | Gap log in runbook | Maintainer execution |
| 6 — Docs | Shipped | Surface §14/§16, MODULES, brewery README, co-design pointer | `check-readmes` |

---

## Web export affordances

| Page | Route | Render-job POST |
|------|-------|-----------------|
| Production order detail | `/production-orders/[orderId]` | work-order PDF, route-card PDF, material-requirements XLSX |
| Production orders list | `/production-orders` | production-order CSV |
| Capacity | `/capacity` | capacity-load XLSX |
| Schedule | `/schedule` | schedule PDF, conflict-report PDF |
| Resources | `/resources` | resource-calendar CSV |

---

## Verification notes

- **API:** `docker compose exec -T api npx vitest run src/tests/mrpCrpRendering.test.ts src/tests/mrpCrpModuleRegistration.test.ts src/tests/pimChannelFeeds.test.ts`
- **Web:** `docker compose exec -T web npm run typecheck` (after `npm run build -w @umbraculum/i18n` if message bundles changed)
- **Playwright:** `mrp-crp-export-alpha.spec.ts` — run [quick gates](mrp-crp-alpha-demo-walkthrough.md#quick-gates-before-playwright) first (`seed:e2e`, api+web healthy, gotenberg + redis; pass `E2E_ADMIN_PASSWORD` if api overrides it). Verified green with Playwright Docker image + `--workers=1`.
- **Docs:** `python3 scripts/docs/check-readmes.py`

---

## Follow-up (tooling)

- **Repo docs are canonical** for Playwright prereqs: [`mrp-crp-alpha-demo-walkthrough.md`](mrp-crp-alpha-demo-walkthrough.md) § Quick gates, [`apps/web/e2e/README.md`](../../apps/web/e2e/README.md), [`docs/TESTING.md`](../TESTING.md) § L5.
- **Plugin (shipped 2026-05-27):** `umbraculum-node-react-cursor-assistant` v0.0.2 — rule `67-playwright-quick-gates-before-run.mdc` + expanded `playwright-runner-docs-gate` skill in `umbraculum-toolset` (`cursor-plugins/`). Re-run `bash cursor-plugins/scripts/install-local.sh` and reload Cursor to pick up.

---

## Explicitly not claimed

- MRP/CRP alpha-complete or mature commercial product
- Wave 7 propose-write tools (`mrp.proposeOrderAdjustment`, `crp.proposeScheduleAdjustment`)
- Email delivery of render artifacts
- Human walkthrough gap log filled (phase 5)
