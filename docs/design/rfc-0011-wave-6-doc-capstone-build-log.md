# RFC-0011 Wave 6 — doc capstone build log

**Status:** Complete — pre-flip epic closed (2026-06-07)  
**Scope:** Integrator docs sync after Waves 3a–3d (package tiers, platform purity, eslint fences) + post-W6 backlog closure.  
**Sign-off:** [rfc-0011-pre-flip-closure.md](rfc-0011-pre-flip-closure.md)

## Phase 0 — baseline (pre-edit)

| Check | Result |
|-------|--------|
| `operator shell` / `WebShellNotice` / `/_shell/` in `docs/` + `apps/web/` | 1 file only — backbone §12 self-reference (historical) |
| `(brewery)/_components` imports outside `(brewery)/` | **0** (2026-06-07 backlog) |
| `packages/platform/api-client/src/brewery/` | Removed (2026-06-07) — facades live in `@umbraculum/brewery-api-client` |

## §12 success criteria audit (post–Wave 6 + backlog)

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Contributor can identify layout / module / vertical folders | **Met** | `_shared-layout/`, `(platform-layout)/`, `(brewery)/`; cross-module UI cleared |
| 2 | Zero deprecated slang | **Met** | **workspace web UI** retained per RFC-0011 §3.1 |
| 3 | Brewery naming only under `(brewery)/` or `@umbraculum/brewery-*` | **Met** | Cross-module `(brewery)/_components` imports cleared |
| 4 | No brewery under `packages/platform/` | **Met** | `@umbraculum/brewery-api-client` extracted; platform `./brewery` shim only |
| 5 | `@umbraculum/brewery-contracts`; platform contracts clean | **Met** | Wave 3b |
| 6 | Native README multi-app pattern | **Met** | Wave 4A umbrella + Wave 4B `@umbraculum/native-shell` |
| 7 | REPOSITORY-STRUCTURE ↔ RFC-0011 ↔ backbone linked | **Met** | Wave 6 + closure doc |

**Pre-flip §12 sign-off:** all seven criteria **Met**.

## Deliverables

- [REPOSITORY-STRUCTURE.md](../REPOSITORY-STRUCTURE.md) — tier sync, `(platform-layout)/`, vertical sub-packages
- [BUILDING-YOUR-VERTICAL.md](../BUILDING-YOUR-VERTICAL.md) — filesystem diagram + expanded decision tree
- [GLOSSARY.md](../GLOSSARY.md) — terminology alignment; workspace web UI retained
- [RFC-0011 §10](../rfcs/0011-application-surface-shell-layering.md) — pre-flip implementation complete
- [backbone §8–§13](pre-flip-application-surface-backbone.md) — pre-flip epic closed banner
- [docs-site/reference-sidebar-items.ts](../../docs-site/reference-sidebar-items.ts) — brewery packages + brewery-api-client
- [apps/web/README.md](../../apps/web/README.md), [apps/native/README.md](../../apps/native/README.md) — layering / multi-app target

## Post W6 backlog closure (2026-06-07)

| Track | Status | Notes |
|-------|--------|-------|
| **Wave 3e Phase 2** | **Done** | `equipmentProfilesService`, brewery AI tools/prompts → `modules/brewery/services/` |
| **Cross-module `(brewery)/_components`** | **Done** | Generic UI → `app/_shared-layout/_components/`; brewery re-export stubs retained |
| **`@umbraculum/brewery-api-client`** | **Done** | Facades extracted from `packages/platform/api-client/src/brewery/` |
| **Rule 63 E2E prefixes** | **Done** | 11 specs renamed `b2b-registered-*` under `apps/web/e2e/` |
| **umbraculum-brochure** extraction | **Done** | Sister repo + `@umbraculum/brochure` vendor sync |

## Post W6+ sequencing (2026-06-07)

| Track | Status | Notes |
|-------|--------|-------|
| **Wave 4** (`@umbraculum/native-shell`, `apps/native/brewery/`) | **Done** | Second native app scaffold deferred post-alpha |
| **Wave 3e Phase 2** (flat orchestrators) | **Done** | `platformRecipesService` remains `@arch-boundary` allowlist |
| **Docs-site foundations** | **Done** | Reference registry, OpenAPI static gate, flip runbook |
| **API flat-services eslint fence** | **Done** | Phase 3 — see [solid-boundaries-eslint-api-flat-services-spike.md](solid-boundaries-eslint-api-flat-services-spike.md) |
