# MRP/CRP alpha demo walkthrough

**Tier:** Public
**Status:** Walkthrough ready (automated export UI + API tests); human execution pending
**Audience:** maintainers validating August 2026 co-design proof §6

> [!NOTE]
> This runbook closes the **public-alpha demo** row in [mrp-crp-august-2026-co-design-plan.md](mrp-crp-august-2026-co-design-plan.md) §6. It does **not** claim MRP/CRP alpha-complete (no propose-write, WMS, native writes).

---

## Prerequisites

1. Stack running with **api**, **web**, **gotenberg**, **redis** — local `docker compose up -d` **or** hosted demo at **`https://demo.umbraculum.dev`** ([`demo-host-runbook.md`](demo-host-runbook.md)). Use `E2E_BASE_URL` / browser origin accordingly.
2. Database seeded for E2E (default admin workspace). Fixture IDs match [`apps/web/e2e/personas.json`](../../apps/web/e2e/personas.json):
   - `brewSessionId`: `e2e00000-0000-0000-0000-000000000bbe`
   - Projected production order id: `brewery-brew-session-e2e00000-0000-0000-0000-000000000bbe`
   - Projected resource id: `automation-vessel-e2e00000-0000-0000-0000-000000000e02`
3. Log in as `e2e-admin@brewery.local` (password from `E2E_ADMIN_PASSWORD` or personas default).
4. Active workspace: E2E primary workspace (`e2e00000-0000-0000-0000-0000000000aa`).

---

## Steps 1–4 — Read path (web)

| Step | URL | Expect |
|------|-----|--------|
| 1 | `/en/production-orders` | Heading “Production planning”; “Projected from brewery” on at least one row |
| 2 | `/en/production-orders/brewery-brew-session-e2e00000-0000-0000-0000-000000000bbe` | Material requirements (e.g. Pale Ale Malt); operations; links to schedule/capacity |
| 3 | `/en/schedule` | Scheduled operations; read-only conflict text if fixture present |
| 4 | `/en/capacity` | Capacity buckets; “0 available minutes (alpha read model)” possible |

Playwright reference: [`apps/web/e2e/smoke/mrp-crp-read-only-alpha.spec.ts`](../../apps/web/e2e/smoke/mrp-crp-read-only-alpha.spec.ts) (read path); export smoke: [`mrp-crp-export-alpha.spec.ts`](../../apps/web/e2e/smoke/mrp-crp-export-alpha.spec.ts) (requires gotenberg + redis + Playwright chromium).

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
