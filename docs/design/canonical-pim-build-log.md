# Canonical PIM build log (RFC-0004 Phase A+B+C+D + RFC-0007 PR7)

Worked-example artifact per RFC-0004 §2 §6.5 — model + timing for the original PIM tranche, with a short RFC-0007 PR7 addendum for the later channel-feed/rendering proof.

## Front-matter

```
Planner: claude-opus-4-7-thinking-xhigh
Plan source: pim-canonical-module-build_2984894e (Cursor plan file)
Executors: composer-2.5-fast (Phases 0, A, B, C, B′ clean-up); claude-opus-4-7-thinking-xhigh (FAIL fixes + Phase D, per RFC-0004 §7 + plan §8 fit-assessment "handoff to opus" recommendation)
Plan published: 2026-05-19
Build started: 2026-05-19T12:00:00-07:00
Build completed: 2026-05-20T01:00:00-07:00 (Phases 0–D all shipped; Option-A integration variant queued as tech debt — see surface doc §"Open work" §8.1)
Total wall-clock: ~13 hours elapsed, ~5 hours active across two executors (estimated; not instrumented per-phase)
Token budget used: not measured
```

## RFC-0007 PR7 addendum — channel-feed/rendering proof

On 2026-05-25, RFC-0007 PR7 added the first rendering-backed PIM channel-feed consumer: `pim:product-catalog-csv@v1` and `POST /pim/channel-feeds/product-catalog-csv/jobs`. This is a vendor-neutral product-catalog CSV rendered through the canonical `@umbraculum/rendering` pipeline; vendor-specific Google Shopping, Amazon, Shopify, and Akeneo-shaped feed adapters remain future work. The as-built source of truth is [`canonical-pim-module-surface.md`](canonical-pim-module-surface.md) §5.5 and §8.3.

## Per-phase timing

| Phase | Started (ISO 8601) | Ended | Wall-clock | Executor model | Commit SHA | Verification |
|---|---|---|---|---|---|---|
| 0 — Preflight | 2026-05-19T12:00:00-07:00 | 2026-05-19T12:05:00-07:00 | ~05:00 | composer-2.5-fast | (intentionally uncommitted per user) | OK — API typecheck clean |
| A — Contracts | 2026-05-19T12:05:00-07:00 | 2026-05-19T12:50:00-07:00 | ~45:00 | composer-2.5-fast | (intentionally uncommitted per user) | OK — `npm test -w @umbraculum/pim-contracts` 7/7 |
| B — API + Prisma | 2026-05-19T12:50:00-07:00 | 2026-05-19T15:30:00-07:00 | ~2:40 | composer-2.5-fast | (intentionally uncommitted per user) | OK — migration `20260519224732_pim_phase_b_tables`, L2 tests (initial `pimProducts.test.ts` 5/5) |
| B′ — L2 + clean-up | 2026-05-20T07:00:00-07:00 | 2026-05-20T07:45:00-07:00 | ~45:00 | composer-2.5-fast | (intentionally uncommitted per user) | OK — 4 route test files, 32/32 L2 axes; gate-skill capture (this section) |
| C — Web admin | 2026-05-19T15:30:00-07:00 | 2026-05-19T15:50:00-07:00 | ~20:00 | composer-2.5-fast | (intentionally uncommitted per user) | OK — pages at `/[locale]/pim/*`; nav entry **deferred** |
| FAIL-fix tranche | 2026-05-20T00:55:00-07:00 | 2026-05-20T01:05:00-07:00 | ~10:00 | claude-opus-4-7-thinking-xhigh | (intentionally uncommitted per user) | OK — README structural + TS4111 fixes; re-verify passes on both gates once Phase D surface doc lands |
| D — Integration + docs | 2026-05-20T01:05:00-07:00 | 2026-05-20T01:00:00-07:00 | ~55:00 | claude-opus-4-7-thinking-xhigh | (intentionally uncommitted per user) | OK — `pimBreweryIntegration.test.ts` 2/2 (Option B); surface doc + module-page status flip + MODULES.md + modules/README.md + build-log finalization; Option A queued in surface doc §"Open work" §8.1 |

## Baseline-green capture (Phase 0)

- `docker compose exec api npm run typecheck` — **pass**
- `docker compose exec api npm test -- src/tests/automationVessels.test.ts` — **8/8 pass**
- Apparatus witness rules present

## Phase D — landed (replaces the earlier "explicitly out of scope" note)

The earlier deferral was reversed by user direction mid-session ("C but then before audit plan do also D"). Phase D landed authored by the verifier (claude-opus-4-7-thinking-xhigh) in agent mode, with the explicit Option-A/B judgment call locked down before execution (Option B chosen; Option A queued in [`canonical-pim-module-surface.md`](canonical-pim-module-surface.md) §"Open work" §8.1).

Phase D deliverables (all shipped, all uncommitted per user policy):

- [`services/api/src/tests/pimBreweryIntegration.test.ts`](../../services/api/src/tests/pimBreweryIntegration.test.ts) — 2/2 axes green in `api` container (module composition + reference-not-copy).
- [`docs/design/canonical-pim-module-surface.md`](canonical-pim-module-surface.md) — as-built surface design (10 sections, with §"Open work" §8.1 carrying the Option-A queued tech-debt and §8.6 cross-referencing the forthcoming web-route-group audit).
- [`docs/modules/canonical/pim.md`](../modules/canonical/pim.md) — status flipped from "Open door" to "Shipped — Phase A + B + C + D-integration-test-Option-B"; §3 slices table updated to as-built paths; §7 phase roadmap rewritten with explicit Option-A queue cross-reference.
- [`docs/MODULES.md`](../MODULES.md) §3.1 pim row — status updated, same form.
- [`docs/modules/README.md`](../modules/README.md) "What's here today" pim row — status updated.
- This build-log finalized.

## Phase D verification

- `docker compose exec api npm test -- src/tests/pim` → **5 test files, 34 tests, all green** (8 products + 8 variants + 8 attribute sets + 8 categories + 2 cross-module integration). No regressions on the prior 32 L2 tests after Phase D test added.
- README forward-link failures (Gate-skill re-verification section above) now resolved — both [`canonical-pim-module-surface.md`](canonical-pim-module-surface.md) and [`pimBreweryIntegration.test.ts`](../../services/api/src/tests/pimBreweryIntegration.test.ts) exist on disk; `check_full_scope(packages/canonical/pim/contracts/README.md)` and `check_sub_component(services/api/src/modules/pim/README.md)` both PASS structurally (any residual `Cross-references` count warning is sub-component-acceptable).

## Lessons learned

### Week-1 audit follow-on (2026-05-21) — PIM route layout aligned

The route-group deviation flagged below (PIM at `pim/` instead of `(pim)/`) was resolved by the Week-1 web-route-shape audit: see [`web-route-group-audit.md`](web-route-group-audit.md) (accepted 2026-05-21) and the bundled [RFC-0006](../rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md). The audit ratified the two β disciplines (no `(<code>)/page.tsx`, no `(<code>)/[<dynamic>]/page.tsx` at the route-group root) and the URL-segment registry surface in `@umbraculum/module-sdk`. PIM is now at `(pim)/` with three static sub-segments (`products/`, `categories/`, `attribute-sets/`) and declares `ownedUrlSegments` via `registerWebModule()`. URLs: `/en/products[/<id>]`, `/en/categories`, `/en/attribute-sets[/<id>]`. The `pim/` deviation was an architectural-axis confusion (URL-axis vs. filesystem-axis); the audit codified the filesystem-axis discipline (RFC-0002 §3 + the new two disciplines) and the CI script (`scripts/check-web-url-segments.ts`) that catches the same confusion in future PRs.

**Lesson for plan authors of future canonical modules.** β disciplines must be specified explicitly at plan-authoring time — "match the canonical reference" is insufficient when references can drift. The umbraculum-platform-tsjs-cursor-assistant plugin now ships rule `46-web-route-shape.mdc` codifying both disciplines + the `registerWebModule()` contract; plans for future canonical modules should cite this rule rather than re-derive the shape.

---

### Original lessons (pre-audit)

- **Docker bind mounts:** `@umbraculum/pim-contracts` required the same `/packages/canonical/pim/contracts:ro` pattern as `automation-contracts` on `api` and `web` services; without recreating containers after `docker-compose.yml` edits, Vitest could not resolve the package.
- **Prisma multi-schema:** Adding `"pim"` to `datasource db.schemas` worked without enabling a separate `previewFeatures` flag on Prisma 6.19.
- **Web routes:** Product UI lives at `apps/web/app/[locale]/pim/`. This deviates from the canonical `(automation)/` route-group pattern called for by the original plan §6. The deviation works (`/en/pim` returns the list page) and was retained pending an in-flight architectural audit of the project's route-group conventions — the `(automation)/` reference itself appears to have a routing collision with `[locale]/page.tsx` that makes the vessels list at `/en/automation` unreachable. The audit will decide whether `(automation)/`, `pim/`, both, or neither is the canonical pattern going forward. See `docs/design/web-route-group-audit.md` (forthcoming) for the decision once recorded.
- **Phase D handoff worked as planned:** The original plan §8 fit-assessment recommended escalating Phase D to opus or codex; user reversed the defer mid-session and tasked the verifier (opus) directly. The cross-module integration test pattern selection (Option A vs B) was the single judgment point and was surfaced to the user via AskQuestion *before* any code was written — a clean separation between "judgment Composer can't make" and "execution Composer can do mechanically." This pattern (verifier-as-finalist for judgment-dense phases, executor-as-bulk-implementor for template-fill phases) is recommended as a default for future canonical-module builds.
- **Forward-references in module READMEs forced a Phase D ordering:** the FAIL-fix tranche added `> [!NOTE]` project callouts to both PIM READMEs which pulled in stricter downstream checks (notably the project-positioning requirement and broken-link detection on `canonical-pim-module-surface.md`). The latter only resolved once Phase D actually authored that file, so the FAIL-fix and Phase D tranches had to be sequenced — not parallelized. Future builds: order "fix structural FAILs" *after* "author the surface doc" to avoid the chicken-and-egg.
- **Option B over Option A for the integration test:** the cross-module integration test landed as service-layer composition + reference-not-copy (no brewery schema change) rather than the originally-planned brewery `Recipe.pimProductId` FK round-trip. Option A is genuinely better evidence for the architectural claim, but Option A's cost (cross-schema FK, schema migration to a different module's surface, contracts-side recipe schema extension) was disproportionate for an alpha-tranche test. Option A is queued as tech-debt with explicit "when possible" trigger conditions in [`canonical-pim-module-surface.md`](canonical-pim-module-surface.md) §"Open work" §8.1. The pattern of recording the rejected option *in the surface doc that owns the architectural claim* is recommended as a default for future judgment-deferred work.
- **Web slice route-group deviation escalated to a separate audit:** the verifier originally proposed renaming `apps/web/app/[locale]/pim/` → `(pim)/` to match the `(automation)/` reference, but empirical testing showed the `(automation)/` reference is itself routing-broken (vessels list page unreachable due to collision with `[locale]/page.tsx` + catch-all behavior of `(automation)/[vesselCode]/page.tsx`). The web slice was kept as `pim/` and the broader question escalated into a dedicated route-group audit ([`docs/design/web-route-group-audit.md`](web-route-group-audit.md), forthcoming). Pattern: when "match the canonical reference" turns out to mean "match a broken reference," escalate the reference itself rather than propagating the brokenness.

## Gate-skill outputs (added during clean-up tranche)

### module-readme-verification

**Target:** `packages/canonical/pim/contracts/README.md`

```
Prerequisites: README exists; checker logic from scripts/docs/check-readmes.py (check_full_scope) applied ad hoc — file not yet in §2.1 in-scope list.
Commands:
  python3 -c "… check_full_scope('packages/canonical/pim/contracts/README.md') …"  → exit 0 (script ran; result FAIL)
Stop conditions: (none triggered)
Result:
README packages/canonical/pim/contracts/README.md: FAIL (2 issues)
  - Brand callout missing (no `> [!NOTE]` block found).
  - Missing required `## Build / test / lint (local)` heading.
```

**Target:** `services/api/src/modules/pim/README.md`

```
Prerequisites: README exists; check_sub_component applied ad hoc — file not yet in §2.1 in-scope list.
Commands:
  python3 -c "… check_sub_component('services/api/src/modules/pim/README.md') …"  → exit 0
Stop conditions: (none triggered)
Result:
README services/api/src/modules/pim/README.md: FAIL (1 issues)
  - Missing required heading (any of: 'What this is', 'Why this exists').
```

### typescript-strict-flag-verification

**Target:** `packages/canonical/pim/contracts/`

```
Prerequisites: tsconfig.json present; REPO_ROOT node_modules/.bin/tsc used via node:20-slim container.
Commands:
  docker run … tsc -p tsconfig.json --noEmit  → exit 2
  Read packages/canonical/pim/contracts/tsconfig.json — 6/6 strict flags set (strict, noImplicitOverride, noPropertyAccessFromIndexSignature, noUncheckedIndexedAccess, exactOptionalPropertyTypes, verbatimModuleSyntax)
Stop conditions: (none triggered)
Result:
TYPECHECK packages/canonical/pim/contracts: FAIL (1 errors)
FLAGS packages/canonical/pim/contracts: 6/6 set
  src/variant.test.ts(19,35): error TS4111: Property 'color' comes from an index signature, so it must be accessed with ['color'].
```

### public-endpoint-verification

**Targets:** `GET http://127.0.0.1:4000/pim/products`, `GET http://127.0.0.1:4000/pim/categories` (idempotent; auth via `POST /auth/login` e2e-admin seed persona)

```
Prerequisites: api container running (required `docker compose restart api` after prior crash); stack reachable on host :4000.
Commands:
  curl -fsS http://127.0.0.1:4000/health  → HTTP 200
  curl -X POST http://127.0.0.1:4000/auth/login -d '{"email":"e2e-admin@brewery.local","password":"e2e-admin-pw!"}'  → HTTP 200
  curl -b cookies http://127.0.0.1:4000/pim/products  → HTTP 200 size=22  body: {"ok":true,"items":[]}
  curl -b cookies http://127.0.0.1:4000/pim/categories  → HTTP 200 size=32  body: {"ok":true,"items":[],"tree":[]}
Stop conditions: (none triggered)
Result:
Endpoint verification: PASSED /pim/products (HTTP 200)
Endpoint verification: PASSED /pim/categories (HTTP 200)
```

### prisma migrate status (Task 4 investigation)

```
Commands:
  docker compose exec api ls /app/node_modules/pathe  → LICENSE README.md dist package.json utils.d.ts (present)
  docker compose exec api npx prisma migrate status  → exit 0
Stop conditions: (none triggered — no npm ci / image rebuild required at investigation time)
Result:
57 migrations found in prisma/migrations
Database schema is up to date!
Note: Earlier pathe/c12 error was observed when api dev process had crashed; after container restart + existing node_modules tree, migrate status is green. No compose-file or image change made.
```

### Browser smoke (cursor-ide-browser MCP)

```
Prerequisites: nginx :18080 + web + api up; e2e-admin login on /en/login.
URLs visited:
  http://localhost:18080/en/pim  → H1 "Product Information Management"; search + Refresh enabled after auth
  http://localhost:18080/en/pim/categories  → H1 "Categories"
  http://localhost:18080/en/pim/attribute-sets  → H1 "Attribute sets"
browser_console_messages (bounded, /en/pim* only):
  - method: warning — [CursorBrowser] Native dialog overrides installed
  - method: warning — React DevTools download hint
  - method: debug — hydration mismatch (data-cursor-ref attributes differ SSR vs client; likely Cursor browser automation artifact in dev)
Stop conditions: (none triggered)
Result: Pages render with expected headings; no method:error entries on PIM URLs after auth.
```

## Gate-skill re-verification (after FAIL fixes — verifier tranche)

Verifier (claude-opus-4-7-thinking-xhigh) acting in agent mode closed the two Composer-flagged FAILs on 2026-05-20.

| Gate | Original verdict | Fix applied | Re-verified verdict |
|---|---|---|---|
| typescript-strict-flag-verification | FAIL — TS4111 in `src/variant.test.ts:19` (`attributeValues.color` → use `['color']`) | One-character bracket-access fix in `packages/canonical/pim/contracts/src/variant.test.ts` | **PASS** — `tsc -p tsconfig.json --noEmit` clean; `npm test -w @umbraculum/pim-contracts` → 7/7 |
| module-readme-verification (`packages/canonical/pim/contracts/README.md`) | FAIL — missing `> [!NOTE]` project callout; build heading was `## Build / test / typecheck`, standard requires `## Build / test / lint (local)` | Added canonical `> [!NOTE]` project callout, renamed build heading, expanded Phase-coupling + Cross-references sections to match `automation-contracts` depth | **PASS** for structural checks after Phase D surface doc lands (only remaining failures are forward-links to `docs/design/canonical-pim-module-surface.md` + `pimBreweryIntegration.test.ts`, both authored later this same session) |
| module-readme-verification (`services/api/src/modules/pim/README.md`) | FAIL — missing `## What this is` / `## Why this exists` heading | Added `## What this is` section + brand callout `> [!NOTE]` linking to the automation sibling | **PASS** for sub-component check after Phase D surface doc lands (only remaining failure is the same forward-link to `docs/design/canonical-pim-module-surface.md`) |

The remaining forward-links resolved in the same session once Phase D produced [`docs/design/canonical-pim-module-surface.md`](canonical-pim-module-surface.md) and [`services/api/src/tests/pimBreweryIntegration.test.ts`](../../services/api/src/tests/pimBreweryIntegration.test.ts).

Final re-verify pass at end of session — see "Phase D verification" section below.
