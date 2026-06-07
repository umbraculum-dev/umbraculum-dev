# Public flip deferral register

**Tier:** Public  
**Status:** v1 — active for July 2026 public-alpha flip  
**Audience:** maintainers — items **not** landing before flip must be logged here with an allowed reason code  
**Related:** [`forkable-repo-cleanliness-audit.md`](forkable-repo-cleanliness-audit.md), [`public-alpha-preflip-hygiene-checklist.md`](public-alpha-preflip-hygiene-checklist.md)

---

## Schema

Each deferred row **must** include:

| Field | Required content |
|-------|------------------|
| **Item** | Concrete path, feature, or epic slice |
| **Target milestone** | July 2026 public alpha / post-alpha / H1 2027 |
| **Why not feasible** | One **primary** reason code + 1–2 sentence evidence |
| **Risk if deferred** | What confuses forkers or agents |
| **Revisit trigger** | Date, event, or dependency |
| **Owner** | maintainer / agent wave |

### Allowed reason codes

| Code | When to use |
|------|-------------|
| **R-SCOPE** | Exceeds flip window with higher-priority blockers |
| **R-COUPLING** | Depends on unfinished prerequisite |
| **R-REGRESSION** | Insufficient test signal to move safely |
| **R-CI** | Requires ci-parity release or new job id |
| **R-SISTER** | Sister repo / DNS / Cloudflare not ready |
| **R-POLICY** | Explicit maintainer decision to keep in monorepo for flip |

Vague “ran out of time” without code + risk + revisit trigger is **not acceptable**.

---

## Active deferrals

| Item | Target | Code | Why / evidence | Risk | Revisit | Owner |
|------|--------|------|----------------|------|---------|-------|
| F-mod optional brewery SKU (brewery-less product) | post-alpha | R-SCOPE | ROADMAP F-mod; not flip scope | Forkers may assume brewery is mandatory | F-mod plan lands | maintainer |
| `docs-site/` → standalone docs repo | post-alpha | R-POLICY | Deploy coupling with monorepo flip window | None for flip | Post-alpha hygiene | maintainer |

---

## Pre-approved (document only — do not block flip)

Listed in [`forkable-repo-cleanliness-audit.md`](forkable-repo-cleanliness-audit.md) § Post-alpha optional skim.

---

## Completed (removed from deferral)

| Item | Completed | Notes |
|------|-----------|-------|
| Forum/demo VPS scripts in monorepo | 2026-06 | Sister repos + [`production-hosts.md`](production-hosts.md) |
| WS5 apps boundaries eslint | 2026-06 (`97f583d`) | Paths migrated with web tree consolidation |
| SOLID water/edit mechanical splits | 2026-06 | S closure; Part B was move-only |
| Path-aware T2-PR pre-push | 2026-06 | `npm run verify:pre-push` |
| Legacy `apps/web/app/recipes/` dual tree | 2026-06 | Consolidated to `(brewery)/recipes/**` |
| Brochure (`apps/website/`) → `umbraculum-brochure` | 2026-06-07 | Pre-flip extraction; `@umbraculum/brochure`; Cloudflare Worker unchanged |
| RFC-0011 application-surface backbone (waves 0–6 + post-W6 backlog) | 2026-06-07 | [rfc-0011-pre-flip-closure.md](rfc-0011-pre-flip-closure.md) |

---

## Flip blockers (must NOT defer without maintainer override)

- `internal/**` leaking into public seed or public doc links
- Secrets / personal paths in pre-flip hygiene §2–§3
