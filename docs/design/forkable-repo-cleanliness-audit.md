# Forkable repo cleanliness audit

**Tier:** Public  
**Status:** v1 — July 2026 public-alpha flip readiness  
**Audience:** maintainers, integrators forking umbraculum-dev, agent executors  
**Related:** [`production-hosts.md`](production-hosts.md), [`PLATFORM-ARCHITECTURE.md`](../PLATFORM-ARCHITECTURE.md) §10.1.1, [`public-flip-deferral-register.md`](public-flip-deferral-register.md)

---

## Decision framework

Apply to every candidate tree before the **fresh public seed**:

| Criterion | Keep in forkable monorepo | Move to sister repo |
|-----------|---------------------------|---------------------|
| **Audience** | Integrators, self-hosters, module authors | VPS operators, marketing-only maintainers |
| **Runtime coupling** | Required for `docker compose up` / product build | Independent deploy (Discourse, Traefik-only) |
| **Workspace graph** | Referenced by root `package.json` workspaces / CI | Standalone clone + deploy |
| **Public seed question** | Clear answer for “why is this here?” | “Ops for umbraculum.dev VMs” → elsewhere |

---

## Inventory and disposition

| Path | Role today | Files (approx.) | Recommendation | CI / workspace touchpoints |
|------|------------|-----------------|----------------|----------------------------|
| [`infra/postgres/`](../../infra/postgres/) | Local/self-host Postgres init | 6 | **KEEP** — product runtime for forked dev | `docker-compose.yml`, api/web DB |
| [`infra/nginx/`](../../infra/nginx/) | Reverse proxy config | 2 | **KEEP** | compose stack |
| [`infra/pgpool/`](../../infra/pgpool/) | Connection pooling | 2 | **KEEP** | compose stack |
| [`infra/db-guard/`](../../infra/db-guard/) | DB guard scripts | 1 | **KEEP** | compose stack |
| [`infra/community-forum/`](../../infra/community-forum/) | Stub pointer only | 1 README (+ scripts stub removed) | **KEEP stub** — no VPS scripts; see [`production-hosts.md`](production-hosts.md) | None (not in product build) |
| [`apps/website/`](../../apps/website/) | Static brochure (`umbraculum.dev`) | 20 | **KEEP for flip** — pre-flip §6.2 (`noindex`, announcement JSON) | Deploy workflows; not root workspace |
| [`docs-site/`](../../docs-site/) | Docusaurus (`docs.umbraculum.dev`) | 757 | **KEEP for flip** — same Cloudflare/deploy coupling | `docs-site` CI; Docusaurus build |
| `internal/**` | Pre-flip working notes | 11 | **EXCLUDE from public seed** — policy in PLATFORM-ARCHITECTURE §10.1.1 | `check-public-docs-no-internal-links.py` |
| Forum **governance** | [`community-forum-runbook.md`](community-forum-runbook.md) §6–§7 | — | **KEEP in monorepo** | Docs-only |
| Forum/demo **VPS scripts** | Sister repos | — | **Done** — [`umbraculum-hosting-forum`](https://github.com/umbraculum-dev/umbraculum-hosting-forum), [`umbraculum-hosting-demo`](https://github.com/umbraculum-dev/umbraculum-hosting-demo) | GHA in hosting repos |
| [`apps/web/e2e/`](../../apps/web/e2e/) | Product Playwright E2E | 240 | **KEEP** | `apps/web` test workflows |
| Legacy `apps/web/app/recipes/**` | Brewery recipe UI (pre-β layout) | 253 TS/TSX | **CONSOLIDATED** → `(brewery)/recipes/**` (2026-06); legacy tree deleted | WS5 `eslint.config.mjs`, `check-web-url-segments`, Playwright |
| `(brewery)/recipes/**` | β brewery web slice — sole recipe web SoT | ~262 TS/TSX | **KEEP** | Same as above |
| `(platform)/recipes/**` | Platform admin cross-workspace | separate | **KEEP** — not brewery | Platform routes only |
| ROADMAP **F-mod** (optional brewery SKU) | Future decouple | — | **Document only** — post-alpha | Deferral register if blocked |

---

## Web dual-tree (Part B linkage)

Before consolidation (2026-06-06), brewery recipe **implementation** lived under legacy `apps/web/app/recipes/` while `(brewery)/recipes/` held list/import plus **re-export shims**. **Consolidation is complete:** single tree under `apps/web/app/[locale]/(brewery)/recipes/**` per RFC-0002 β layout. URLs unchanged (`/en/recipes/…`).

See [`REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) § “Finding vertical module code on web” and [`web-brewery-tree-consolidation-inventory.md`](web-brewery-tree-consolidation-inventory.md).

---

## Pre-flip hygiene cross-check

| Check | Command / artifact | Status (2026-06-06) |
|-------|-------------------|---------------------|
| No `internal/**` links in public docs | `python3 scripts/docs/check-public-docs-no-internal-links.py` | Run at commit |
| Seed manifest excludes `internal/**` | Flip tooling (when landed) — policy in PLATFORM-ARCHITECTURE §10.1.1 | Pending flip tooling |
| Forum stub has no operator scripts | `infra/community-forum/` — README + pointer only | **Done** — `scripts/` removed |
| WS5 boundaries match web tree | `./scripts/ci-parity-check.sh --archive run --jobs lint` | **Done** — paths retargeted |
| Web dual-tree removed | `test ! -d apps/web/app/recipes` | **Done** |

---

## Execution record (2026-06-06)

| Deliverable | Artifact |
|-------------|----------|
| Fork assessment | This doc |
| Deferral register | [`public-flip-deferral-register.md`](public-flip-deferral-register.md) |
| Web tree move map + verification | [`web-brewery-tree-consolidation-inventory.md`](web-brewery-tree-consolidation-inventory.md) |
| Navigation cheat sheet | [`REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) § Finding vertical module code on web |
| Brewery module web paths | [`modules/verticals/brewery/README.md`](../modules/verticals/brewery/README.md) §3.2 |
| Migration helper | [`scripts/migrate-recipes-tree-to-brewery.py`](../../scripts/migrate-recipes-tree-to-brewery.py) |
| Route audit follow-up | [`web-route-group-audit.md`](web-route-group-audit.md) §9 — legacy recipes anomaly closed |

---

## Post-alpha optional skim (not flip blockers)

- **`apps/website/` → `umbraculum-marketing`** — only if Cloudflare project split is ready (reason code **R-SISTER** in deferral register).
- **`docs-site/` → `umbraculum-docs`** — same posture.
- **F-mod brewery-less SKU** — ROADMAP; cite **R-COUPLING** only if tree work truly depends on it.

---

## Revision history

| Date | Change |
|------|--------|
| 2026-06-06 | Initial audit (fork cleanliness + web tree epic) |
