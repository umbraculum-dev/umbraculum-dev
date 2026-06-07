# RFC-0011 pre-flip closure — sign-off

**Tier:** Public  
**Status:** Pre-flip epic **closed** (2026-06-07)  
**Audience:** maintainers, integrators, agent executors  
**Related:** [RFC-0011](../rfcs/0011-application-surface-shell-layering.md), [pre-flip-application-surface-backbone.md](pre-flip-application-surface-backbone.md), [rfc-0011-wave-6-doc-capstone-build-log.md](rfc-0011-wave-6-doc-capstone-build-log.md)

---

## Criteria (backbone §12)

| # | Criterion | Pre-flip status |
|---|-----------|-----------------|
| 1 | Contributor can identify layout / module / vertical folders | **Met** |
| 2 | Zero deprecated slang | **Met** |
| 3 | Brewery naming only under `(brewery)/` or `@umbraculum/brewery-*` | **Met** |
| 4 | No brewery under `packages/platform/` | **Met** |
| 5 | `@umbraculum/brewery-contracts`; platform contracts clean | **Met** |
| 6 | Native README multi-app pattern | **Met** |
| 7 | REPOSITORY-STRUCTURE ↔ RFC-0011 ↔ backbone linked | **Met** |

Full audit trail: [wave-6 build log §12 audit](rfc-0011-wave-6-doc-capstone-build-log.md).

---

## What shipped (waves 0–6 + post-W6 backlog)

| Track | Outcome |
|-------|---------|
| Web shared layout | `app/_shared-layout/` + `(platform-layout)/`; WS5 elements |
| Package tiers | `packages/{platform,modules,verticals}/`; Wave 3a–3d eslint fences |
| Brewery contracts / purity | `@umbraculum/brewery-contracts`, `@umbraculum/brewery-i18n`, UI/i18n split |
| API colocation | Brewery services under `modules/brewery/services/` (Wave 3e Phase 1 + 2) |
| Cross-module UI | Generic components → `_shared-layout/_components/` |
| `@umbraculum/brewery-api-client` | Facades extracted; platform `./brewery` shim removed (2026-06-07) |
| Native multi-app | `apps/native/brewery/` + `@umbraculum/native-shell` |
| E2E taxonomy | `e2e/{platform,canonical,verticals/brewery}/`; Rule 63 prefixes **closed** |
| Brochure | `umbraculum-brochure` sister repo + `@umbraculum/brochure` vendor sync |
| Doc capstone | REPOSITORY-STRUCTURE, BUILDING-YOUR-VERTICAL, GLOSSARY, docs-site reference registry |

---

## Deferred / post-flip only

| Item | Decision | Notes |
|------|----------|-------|
| **Rule 63 E2E prefixes** | **Closed** | All 11 specs under `apps/web/e2e/` use `b2b-registered-*` filenames |
| **F-mod brewery-less SKU** | **Keep deferred (product SKU)** | Runtime `UMBRACULUM_MODULE_PROFILE=platform` **documented pre-flip** ([`BUILDING-YOUR-VERTICAL.md`](../BUILDING-YOUR-VERTICAL.md)); full install SKU post-alpha. **Demo:** `demo.umbraculum.dev` stays reference profile (core + brewery), not platform-only. |
| **Second native app scaffold** | **Keep deferred** | Pattern in [`apps/native/README.md`](../../apps/native/README.md). **2026-06-07:** choose PIM vs quality module app **after** application-surface structure is stable — not pre-flip. |
| **`docs-site/` extraction** | **Keep deferred** | R-POLICY — monorepo through public alpha; foundations pass pre-flip |
| **API flat-services eslint fence** | **Land pre-flip (Phase 3)** | Prevents Wave 3e regression; see [backbone §13](pre-flip-application-surface-backbone.md) |
| **Apps → `@umbraculum/brewery-api-client` direct imports** | **Done pre-flip (2026-06-07)** | Web + native brewery migrated; platform `./brewery` shim deleted |
| **Website / forum VPS automation** | **Done / sister repos** | Brochure extracted; forum/demo in hosting repos |

### “pim-floor” naming note

**Floor** is standard manufacturing / ERP vocabulary for **shop floor** (handheld operator devices). It is industry terminology, not RFC-0011 deprecated slang (which targeted `operator shell`, `_shell/`, etc.). If a second native app is scaffolded pre-flip, prefer **`apps/native/pim/`** or **`apps/native/pim-handheld/`** (`@umbraculum/native-pim`) unless shop-floor jargon is intentional in the repo path.

---

## Post-flip opportunistic backlog

See [pre-flip-application-surface-backbone.md §13](pre-flip-application-surface-backbone.md).

---

## Flip coordination

Docs-site flip runbook: [docs-site-flip-runbook.md](docs-site-flip-runbook.md). Maintainer sign-off questions: [public-alpha-preflip-hygiene-checklist.md §7](public-alpha-preflip-hygiene-checklist.md).
