# RFC-0011 Wave 6 — doc capstone build log

**Status:** Complete (2026-06-07)  
**Scope:** Integrator docs sync after Waves 3a–3d (package tiers, platform purity, eslint fences).

## Phase 0 — baseline (pre-edit)

| Check | Result |
|-------|--------|
| `operator shell` / `WebShellNotice` / `/_shell/` in `docs/` + `apps/web/` | 1 file only — backbone §12 self-reference |
| `(brewery)/_components` imports outside `(brewery)/` | 24 `.tsx` files (known gap — doc-only wave) |
| `packages/platform/api-client/src/brewery/` | Vertical HTTP facade (known gap — extraction deferred) |

## §12 success criteria audit (post–Wave 6)

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Contributor can identify layout / module / vertical folders | **Partial** | Paths documented; cross-module `(brewery)/_components` imports remain |
| 2 | Zero deprecated slang | **Met** | Legacy terms only in backbone §12 list; **workspace web UI** retained per RFC-0011 §3.1 |
| 3 | Brewery naming only under `(brewery)/` or `@umbraculum/brewery-*` | **Partial** | Cross-module UI imports documented as known gap |
| 4 | No brewery under `packages/platform/` | **Partial** | Package purity landed (3c); `api-client/src/brewery/` facade documented |
| 5 | `@umbraculum/brewery-contracts`; platform contracts clean | **Met** | Wave 3b |
| 6 | Native README multi-app pattern | **Met** | Wave 4A umbrella + Wave 4B `@umbraculum/native-shell` |
| 7 | REPOSITORY-STRUCTURE ↔ RFC-0011 ↔ backbone linked | **Met** | Wave 6 |

## Deliverables

- [REPOSITORY-STRUCTURE.md](../REPOSITORY-STRUCTURE.md) — tier sync, `(platform-layout)/`, vertical sub-packages
- [BUILDING-YOUR-VERTICAL.md](../BUILDING-YOUR-VERTICAL.md) — filesystem diagram + expanded decision tree
- [GLOSSARY.md](../GLOSSARY.md) — terminology alignment; workspace web UI retained
- [RFC-0011 §10](../rfcs/0011-application-surface-shell-layering.md) — Wave 6 complete
- [backbone §9](pre-flip-application-surface-backbone.md) — Wave 6 Done
- [docs-site/reference-sidebar-items.ts](../../docs-site/reference-sidebar-items.ts) — brewery-contracts, brewery-i18n, brewery-media-assets
- [apps/web/README.md](../../apps/web/README.md), [apps/native/README.md](../../apps/native/README.md) — layering / multi-app target

## Post W6+W5 sequencing (2026-06-07)

| Track | Status | Next action |
|-------|--------|-------------|
| **Wave 4** (`@umbraculum/native-shell`, `apps/native/brewery/`) | **Done (2026-06-07)** | 4A re-home + 4B shell extraction; second native app scaffold deferred |
| **Wave 3e Phase 2** (flat orchestrators under `services/api/src/services/`) | Deferred | Opportunistic refactor |
| **umbraculum-website** extraction | Deferred | Parallel track per backbone |
| **Backlog** (cross-module `(brewery)/_components`, `api-client/src/brewery/`) | Known gaps | Document-only until dedicated wave |
| **Rule 63** b2c/b2b filename prefixes | Deferred | Optional follow-on PR |
| **Git push** | Not done | `master` is 7 commits ahead of `origin/master` (3a–3d + W6 + W5) — push when ready |

**Pre-flip §12 sign-off:** criteria 2, 5, 7 **Met**; 1, 3, 4, 6 **Partial** — honest gaps documented above and in backbone §12 audit table.
