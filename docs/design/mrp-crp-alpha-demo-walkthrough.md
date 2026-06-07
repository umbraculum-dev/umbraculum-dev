# MRP/CRP alpha demo walkthrough

**Tier:** Public
**Status:** Walkthrough ready (automated export UI + API tests); human execution pending
**Audience:** maintainers validating August 2026 co-design proof §6

> [!NOTE]
> This runbook closes the **public-alpha demo** row in [mrp-crp-august-2026-co-design-plan.md](mrp-crp-august-2026-co-design-plan.md) §6. It does **not** claim MRP/CRP alpha-complete (no propose-write, WMS, native writes).

---

## Prerequisites

1. Stack running with **api**, **web**, **gotenberg**, **redis** — local `docker compose up -d` **or** hosted demo at **`https://demo.umbraculum.dev`** ([`demo-host-runbook.md`](demo-host-runbook.md)). Use `E2E_BASE_URL` / browser origin accordingly.
2. **E2E seed (local stack, required):** `docker compose exec api npm run seed:e2e` — creates the smoke user `e2e-admin@brewery.local` (and fixture recipe/session/vessel rows). Without this, login and MRP/CRP projections fail. Password: `E2E_ADMIN_PASSWORD` on the **api** container if set, else default `e2e-admin-pw!` (must match Playwright — see [Automated export smoke](#automated-export-smoke-playwright) below).
3. Fixture IDs match [`apps/web/e2e/personas.json`](../../apps/web/e2e/personas.json):
   - `brewSessionId`: `e2e00000-0000-0000-0000-000000000bbe`
   - Projected production order id: `brewery-brew-session-e2e00000-0000-0000-0000-000000000bbe`
   - Projected resource id: `automation-vessel-e2e00000-0000-0000-0000-000000000e02`
4. Log in as `e2e-admin@brewery.local` (password from `E2E_ADMIN_PASSWORD` or personas default).
5. Active workspace: E2E primary workspace (`e2e00000-0000-0000-0000-0000000000aa`).

---

## Steps 1–4 — Read path (web)

| Step | URL | Expect |
|------|-----|--------|
| 1 | `/en/production-orders` | Heading “Production planning”; “Projected from brewery” on at least one row |
| 2 | `/en/production-orders/brewery-brew-session-e2e00000-0000-0000-0000-000000000bbe` | Material requirements (e.g. Pale Ale Malt); operations; links to schedule/capacity |
| 3 | `/en/schedule` | Scheduled operations; read-only conflict text if fixture present |
| 4 | `/en/capacity` | Capacity buckets; “0 available minutes (alpha read model)” possible |

Playwright reference: [`apps/web/e2e/canonical/mrp-crp-read-only-alpha.spec.ts`](../../apps/web/e2e/canonical/mrp-crp-read-only-alpha.spec.ts) (read path); export smoke: [`mrp-crp-export-alpha.spec.ts`](../../apps/web/e2e/canonical/mrp-crp-export-alpha.spec.ts) (requires gotenberg + redis + Playwright chromium).

> **Path note (RFC-0011 Wave 5, 2026-06-07):** specs moved from `smoke/` to `platform/`, `canonical/`, `verticals/brewery/`.

---

## Steps 5–6 — Rendering (web UI, primary)

On production order detail:

1. Click **Export work order (PDF)** — wait for **Download export** link; file non-empty.
2. Optional: **Export route card (PDF)**, **Export material requirements (XLSX)**.

On capacity page:

3. Click **Export capacity load (XLSX)** — download link appears.

Stretch (same pattern): schedule PDF / conflict report; production-order list CSV; resource calendar CSV on resources page.

### API fallback (curl from host via nginx)

Replace cookie with session cookie from browser devtools.

```bash
ORDER_ID="brewery-brew-session-e2e00000-0000-0000-0000-000000000bbe"
BASE="http://localhost:18080/api"

# Preview
curl -sf -b "$COOKIE" "$BASE/mrp/work-orders/$ORDER_ID/preview" | head -c 200

# Work-order PDF job
curl -sf -b "$COOKIE" -H 'content-type: application/json' \
  -d '{"templateRef":"mrp:work-order-pdf@v1"}' \
  "$BASE/mrp/work-orders/$ORDER_ID/render-jobs"

# Poll job (JOB_ID from 202 response)
curl -sf -b "$COOKIE" "$BASE/rendering/jobs/$JOB_ID"
curl -sf -b "$COOKIE" "$BASE/rendering/jobs/$JOB_ID/result"
# Open signedUrl from result (prepend /api if needed)

# Capacity load XLSX
curl -sf -b "$COOKIE" -H 'content-type: application/json' \
  -d '{}' "$BASE/crp/capacity-load/render-jobs"
```

---

## Step 7 — AI consultant

Open `/en/ai`. Sample prompts:

- “List production orders in this workspace.” (`mrp.listProductionOrders`)
- “Explain material requirements for production order `brewery-brew-session-…`.” (`mrp.explainMaterialRequirements`)
- “Explain capacity load for this workspace.” (`crp.explainCapacityLoad`)
- “List capacity conflicts.” (`crp.listConflicts`)

Rendering: prefer module export buttons; `render_document` is available for registered template refs per [`AI-CONSULTANT.md`](../AI-CONSULTANT.md) and [`canonical-document-rendering-surface.md`](canonical-document-rendering-surface.md) §3.

---

## Quick gates before Playwright

Run from **repo root** in order. Stop on the first failure — most Playwright auth/export failures are upstream (502 API, 500 web, missing seed, stale `.auth`).

```bash
docker compose up -d api web gotenberg redis
./scripts/smoke.sh
curl -sf http://localhost:18080/api/health | grep -q '"ok":true' \
  || { echo "FAIL: API unhealthy (often 502 — see troubleshooting)"; exit 1; }
curl -sf -o /dev/null -w '%{http_code}\n' http://localhost:18080/en/login | grep -q '^200$' \
  || { echo "FAIL: web login page not 200"; exit 1; }
docker compose exec api npm run seed:e2e
# After recovering a broken stack, clear stale Playwright cookies:
# rm -f apps/web/e2e/.auth/e2e-admin.json
```

Canonical copy also lives in [`apps/web/e2e/README.md`](../../apps/web/e2e/README.md) (all smoke specs) and [`docs/TESTING.md`](../TESTING.md) § L5.

---

## Automated export smoke (Playwright)

From repo root, after [Quick gates](#quick-gates-before-playwright). Uses the official Playwright image (not `api`/`web` containers). Full command: [`apps/web/e2e/README.md`](../../apps/web/e2e/README.md).

```bash
# Pass the same E2E_ADMIN_PASSWORD as the api container if you override it in .env
docker run --rm --network host \
  -e E2E_BASE_URL=http://localhost:18080 \
  -e E2E_ADMIN_PASSWORD="${E2E_ADMIN_PASSWORD:-e2e-admin-pw!}" \
  -v "$PWD/apps/web/e2e:/e2e" \
  -w /e2e \
  mcr.microsoft.com/playwright:v1.60.0-noble \
  bash -lc "npm install --no-audit --no-fund && npx playwright test --project=canonical canonical/mrp-crp-export-alpha.spec.ts --workers=1"
```

**Troubleshooting**

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| `Log out` not found / Sign-in page | **API 502** (`curl http://localhost:18080/api/health`) | `docker compose logs api`; `docker compose exec api npm install`; `docker compose restart api`. Api `predev` creates `/packages/node_modules` → `/app/node_modules` (rendering + contracts resolve). |
| Login form but Playwright cannot fill email | **Web 500** (`curl -o /dev/null -w '%{http_code}' http://localhost:18080/en/login`) | `docker compose logs web`; `docker compose exec web npm install`; `docker compose restart web` (rule 51 after large package/dist changes). |
| `waitForURL` timeout on `/login` | Seed not applied | `docker compose exec api npm run seed:e2e` |
| Stale session after stack recovery | Old `.auth` cookies | `rm -f apps/web/e2e/.auth/e2e-admin.json` then re-run Playwright |
| Password drift | `E2E_ADMIN_PASSWORD` on api only | Pass same `-e E2E_ADMIN_PASSWORD=…` into the Playwright `docker run` |
| Export button never shows download | gotenberg/redis down | `docker compose up -d gotenberg redis` |

**Smoke user:** `e2e-admin@brewery.local` (from `seed:e2e`, not a separate export-only user). The export spec uses `authenticatedPage` from [`auth-fixture.ts`](../../apps/web/e2e/support/auth-fixture.ts).

---

## Human sign-off (gap log)

| Step | Pass | Notes |
|------|------|-------|
| 1 Recipe/session → MRP order | | |
| 2 Material requirements visible | | |
| 3 CRP schedule / resources | | |
| 4 Capacity load / conflicts | | |
| 5 Work-order PDF export | | |
| 6 Capacity-load XLSX export | | |
| 7 AI explanation | | |

**Executed:** _pending_  
**Summary:** _pending_

---

## Cross-references

- [mrp-crp-wave-6-rendering-templates-build-log.md](mrp-crp-wave-6-rendering-templates-build-log.md)
- [canonical-mrp-module-surface.md](canonical-mrp-module-surface.md) §14
- [canonical-crp-module-surface.md](canonical-crp-module-surface.md) §16
