# SOLID boundaries eslint spike — eslint-plugin-boundaries on canonical modules

**Tier:** Internal  
**Status:** Frozen (2026-06-04) — Subplan A4 deliverable  
**Audience:** module authors, CI maintainers  
**Related:** [solid-decoupling-audit.md](./solid-decoupling-audit.md) §4 Tier A, [solid-audit-charter.md](./solid-audit-charter.md), [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md), [LINTING.md](../LINTING.md)

---

## 1. Why this spike exists

**Trigger:** SOLID audit Tier A recommended piloting `eslint-plugin-boundaries` on `services/api/src/modules/**` (RFC-0002 footnote; [solid-decoupling-audit.md](./solid-decoupling-audit.md) §4). Subplan A1 removed the only known P0 sibling import (CRP→MRP for projection IDs); this spike asks whether mechanical lint can **prevent recurrence** without blocking the repo on false positives.

**Decision deadline:** Gates Subplan **B5** (promote warn → error + blocking CI). This spike does **not** enable blocking CI.

---

## 2. What we have today

| Artifact | Role |
|----------|------|
| `scripts/audit/solid-inventory.ts` | Report-only sibling-import + fat-file scanner |
| `npm run audit:solid-inventory` | Regenerates [solid-audit-inventory.md](./solid-audit-inventory.md) |
| `@arch-boundary` convention | Documents accepted in-process coupling (charter §6) |
| A1 `platform/breweryProjectionIds.ts` | Shared ID helpers; zero sibling imports in `modules/**` (2026-06-04) |

**Intentional cross-layer imports (out of this spike's scope):**

- `services/api/src/services/ai/tools/**` → `modules/*/services/*` (horizontal AI advisor reads module services)
- `services/api/src/app.ts` → module `register*Module()` entrypoints
- `modules/brewery/**` → `services/api/src/domain/**` (vertical domain; not a sibling module)

---

## 3. Prototype configuration

**File:** [`eslint.config.mjs`](../../eslint.config.mjs) — block scoped to `services/api/src/modules/**/*.{ts,tsx}`.

**Elements:**

| Type | Path | Purpose |
|------|------|---------|
| `platform` | `services/api/src/platform/**` | Shared cross-module helpers (A1) |
| `domain` | `services/api/src/domain/**` | Brewery vertical domain (allowed from modules) |
| `plugins` | `services/api/src/plugins/**` | Fastify plugins (allowed from modules) |
| `canonical-module` | `services/api/src/modules/*/**` | One element per module folder; `capture: ["moduleCode"]` |

**Rule:** `boundaries/element-types` at **`warn`** — canonical modules **disallow** imports where `dependency.moduleCode !== from.moduleCode`.

**Dependencies added:** `eslint-plugin-boundaries@^5`, `eslint-import-resolver-typescript@^4` (root devDependencies).

---

## 4. Spike measurements (2026-06-04)

| Check | Result |
|-------|--------|
| `npx eslint services/api/src/modules` on clean tree | **0 warnings, 0 errors** |
| Synthetic probe (`crp` importing `../../mrp/...`) | **1 warning** (`boundaries/element-types`) — rule fires |
| False positives on legitimate `domain/`, `platform/`, `plugins/` imports | **0** observed |
| Full-repo `npm run lint` (ci-parity `lint` job) | Green after adding `scripts/audit/solid-inventory.ts` to `allowDefaultProject` |

---

## 5. Six skeptical tests

### 5.1 Test A — Novelty bias

**Question:** Are we adopting boundaries lint because it is trendy?

**Evidence:** RFC-0001 §8.2 and RFC-0002 footnote already committed to boundaries lint post-β-layout. The spike implements a **previously planned** enforcement path, not a new architectural direction.

**Verdict:** Passes — not novelty-driven.

### 5.2 Test B — Replacement value

**Question:** Does eslint-plugin-boundaries add signal beyond `solid-inventory.ts`?

**Evidence:** Inventory runs in CI only if wired separately; ESLint runs on every `web-lint` / `npm run lint` touch of `services/api/src/**`. ESLint gives **editor-time** feedback; inventory catches fat files and non-import heuristics ESLint does not.

**Verdict:** Passes — complementary, not redundant for sibling imports.

### 5.3 Test C — Cost of adoption

**Question:** Is the config + resolver cost acceptable?

**Evidence:** One flat-config block (~60 LoC), two devDependencies, ~8s incremental lint on `modules/**`. No changes to runtime or contracts.

**Verdict:** Passes — low cost for scoped rule.

### 5.4 Test D — False-positive budget

**Question:** Does the rule fire incorrectly on the current tree?

**Evidence:** 0 warnings on 741-file inventory scan surface under `modules/**`. AI tools and `app.ts` registration are **outside** the scoped `files` glob by design.

**Verdict:** Passes — false-positive count **0** (threshold for blocking CI: spike plan used **>5** as fail).

### 5.5 Test E — Expressiveness gap

**Question:** Can we express “AI tools may import module services” without breaking module rules?

**Evidence:** Horizontal `services/ai/tools/**` is not in the `canonical-module` element set; those imports are unaffected. Extending lint to **forbid modules → horizontal services** would be a **separate** rule set (out of A4 scope).

**Verdict:** Passes for **sibling-module** enforcement; horizontal direction not covered (documented deferral).

### 5.6 Test F — Operational fit

**Question:** Does this fit ci-parity / GHA without a new `@umbraculum/ci-parity` release?

**Evidence:** Prototype piggybacks on existing `lint` job (`npm run lint` → full repo ESLint). Optional non-blocking inventory workflow added separately (report-only).

**Verdict:** Passes — no ci-parity manifest job id required for prototype.

---

## 6. Verdict

### Blocking CI adoption (error-level, merge-blocking)

**SOUND** — with conditions:

1. Keep scope at `services/api/src/modules/**` only (not `services/ai/tools`, not `apps/`).
2. Ship **warn** for one release cycle on `master` (current prototype); promote to **error** in Subplan B5.
3. Pair with `npm run audit:solid-inventory` on `services/api/**` PRs as **report-only** (non-blocking) drift signal.

### Warn-only / report-only adoption (immediate)

**SOUND** — land as-is on `master`.

---

## 7. Open questions (none blocking B5)

- Should `modules/brewery` → `domain/**` remain allowed indefinitely, or move behind a port when B3 lands?
- When module count exceeds ~8, revisit single `canonical-module` capture vs per-module element types for clearer messages.

---

## 8. Recommended next actions

| Action | Owner | When |
|--------|-------|------|
| Keep prototype at **warn** on `master` | merged A4 | now |
| Subplan **B5**: warn → error + inventory drift check (optional blocking) | Tier B wave | after Tier A push |
| Re-evaluate if new sibling import bypasses relative paths (package-scope imports) | inventory script | ongoing |

---

## 9. Sign-off

| Field | Value |
|-------|-------|
| Date | 2026-06-04 |
| Subplan | A4 |
| Verdict | **SOUND** (warn now; blocking CI in B5 with conditions above) |
| Successor | [solid-impl-B5-boundaries-ci.plan.md](../../.cursor/plans/solid-impl-B5-boundaries-ci.plan.md) unblocked |
