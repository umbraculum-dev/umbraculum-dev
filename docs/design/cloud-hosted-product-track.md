# Cloud hosted product track (`cloud.umbraculum.dev`)

**Tier:** Public  
**Status:** Future track — not started; demo host is separate  
**Audience:** planners distinguishing **demo** from **hosted production**

---

## Summary

| Host | Purpose | Status |
|------|---------|--------|
| **`demo.umbraculum.dev`** | Demonstration: EAS smoke, walkthroughs, invite-only try-it. Illustrative seed data; resets OK. | See [`demo-host-runbook.md`](demo-host-runbook.md) |
| **`cloud.umbraculum.dev`** | **Customer-facing hosted** Umbraculum — PIM/MRP/CRP/brewery vertical operated for real use | **Not started** |

This repository (`umbraculum-dev`) ships the **toolset and reference brewery vertical**. Your **operational brewery in production** (the deployment that will actually brew) is **outside this project**—it will **use** Umbraculum but is not the same as the demo stack in this repo.

---

## What cloud will include (when started)

- Hosted API + web (+ optional native clients) with production operational policy (backups, SLAs, tenant isolation — TBD)
- Real customer/workspace data — not E2E fixture seed
- Separate EAS build profile / env from demo `preview` (do not repoint demo APK at cloud without a deliberate release)

---

## Explicit non-goals for cloud (until planned)

- Renaming `demo` → `cloud` in place without a migration plan
- Treating demo seed data as production brewery records

---

## Cross-links

- [`demo-host-runbook.md`](demo-host-runbook.md)
- [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1 — public source release vs hosted-service GA
- [`ROADMAP.md`](../ROADMAP.md) — July 2026 public-alpha tranche (source visibility; not cloud GA)
