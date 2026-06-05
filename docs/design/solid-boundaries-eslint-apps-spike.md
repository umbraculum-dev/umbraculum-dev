# SOLID boundaries eslint spike — eslint-plugin-boundaries on apps/web + apps/native

**Tier:** Internal  
**Status:** Frozen (2026-06-05) — SOLID Phase 3 / WS5 deliverable  
**Audience:** app maintainers, lint/CI maintainers  
**Related:** [solid-boundaries-eslint-spike.md](./solid-boundaries-eslint-spike.md), [solid-decoupling-audit.md](./solid-decoupling-audit.md), [LINTING.md](../LINTING.md)

---

## 1. Why this spike exists

**Trigger:** SOLID Phase 3 WS5 asks for an app-surface counterpart to the API canonical-module boundaries pilot: define practical import boundaries for `apps/web` and `apps/native`, prototype them at **warn** level, and decide whether the policy is viable without introducing blocking noise.

**Decision deadline:** This spike gates any future "warn -> error" discussion for app-layer boundaries. WS5 itself is explicitly **non-blocking**.

---

## 2. What we have today

| Artifact | Role |
|----------|------|
| `docs/design/solid-boundaries-eslint-spike.md` | API-side pilot pattern (canonical modules in `services/api/src/modules/**`) |
| `eslint.config.mjs` | Existing API boundaries enforcement (`error` for canonical-module sibling imports) |
| `apps/web/README.md`, `apps/native/README.md` | App ownership/scope docs (apps consume API over HTTP, not source imports) |

**Intentional app coupling (kept in scope as allowed):**

- App-internal shared surfaces (`apps/web/app/_components`, `apps/web/app/_lib`, `apps/web/src/**`, `apps/native/src/{auth,components,i18n,lib,media,navigation,theme,types}`).
- Shared package imports (`@umbraculum/*`) used by both apps.

---

## 3. Prototype configuration

**File:** [`eslint.config.mjs`](../../eslint.config.mjs) — new block scoped to `apps/{web,native}/**/*.{ts,tsx}`.

**Elements:**

| Type | Path | Purpose |
|------|------|---------|
| `api-service` | `services/api/**` | Detect and forbid direct app -> API source imports |
| `web-app-shared` | `apps/web/{src,app/_components,app/_lib}/**` | Allowed shared UI/helpers for web routes |
| `web-water-segment` | `apps/web/app/recipes/[id]/water/*/**` | Capture water route segment ownership (`capture: ["segmentCode"]`) |
| `native-app-shared` | `apps/native/src/{auth,components,i18n,lib,media,navigation,screens,theme,types}/**` | Allowed shared runtime/navigation surfaces |
| `native-module-segment` | `apps/native/src/modules/*/**` | Capture native module ownership (`capture: ["moduleCode"]`) |

**Rule:** `boundaries/element-types` at **`warn`**.

**Forbidden imports in this WS5 prototype:**

1. Any `apps/web` or `apps/native` element importing from `services/api/**` source files.
2. `web-water-segment` importing a different `web-water-segment` (e.g. `mash -> boil`).
3. `native-module-segment` importing a different `native-module-segment`.

---

## 4. Spike measurements (2026-06-05)

| Check | Result |
|-------|--------|
| Config shape parity with API spike pattern | Pass (same plugin, element capture model, non-blocking severity) |
| Dependency impact | None (reuses existing root `eslint-plugin-boundaries` + resolver setup) |
| CI impact surface | None at blocking level (warn-only, no `error` promotion in WS5) |

---

## 5. Six skeptical tests

### 5.1 Test A — Novelty bias

**Question:** Is this app-surface lint just "more lint" without charter linkage?

**Evidence:** It mirrors the already-landed API boundaries spike pattern and directly answers WS5's explicit scope (`apps/web`, `apps/native`, app->API source fence, sibling segment fences).

**Verdict:** Passes.

### 5.2 Test B — Replacement value

**Question:** Does this add signal beyond review conventions?

**Evidence:** It provides editor-time warnings for accidental architectural drift that code review may miss (especially deep relative imports across feature segments).

**Verdict:** Passes.

### 5.3 Test C — Cost of adoption

**Question:** Is the lint configuration cost acceptable?

**Evidence:** One additional flat-config block and no package dependency churn.

**Verdict:** Passes.

### 5.4 Test D — False-positive budget

**Question:** Is the scope narrow enough for warn-only adoption?

**Evidence:** The sibling fence is intentionally constrained to high-signal segment sets (`web` water route siblings, `native` module siblings), while app-shared surfaces are explicitly modelled as allowed layers.

**Verdict:** Passes for warn-only pilot.

### 5.5 Test E — Expressiveness gap

**Question:** Can we encode both app-to-API and sibling-segment constraints in one rule family?

**Evidence:** `boundaries/element-types` supports both by combining absolute disallow (`api-service`) and capture-based inequality (`!${from.segmentCode}` / `!${from.moduleCode}`).

**Verdict:** Passes.

### 5.6 Test F — Operational fit

**Question:** Does this fit current lint/ci-parity flow without new workflow plumbing?

**Evidence:** Yes. It runs under existing root ESLint execution and remains non-blocking at `warn`.

**Verdict:** Passes.

---

## 6. Verdict

### Warn-only / report-only adoption (WS5 target)

**SOUND** — ship the prototype as non-blocking warnings in root `eslint.config.mjs`.

### Error-level / merge-blocking adoption

**NOT SOUND (yet)** — this spike does not include a stabilization cycle proving warning volume and developer ergonomics over time; keep as warn until that evidence exists.

---

## 7. Open questions (non-blocking)

- Should web sibling boundaries expand beyond `recipes/[id]/water/*` to broader App Router segment families after warning telemetry is collected?
- Should `apps/web/e2e/**` be explicitly excluded from future app-boundary hardening, similar to other test relaxations?

---

## 8. Recommended next actions

| Action | Owner | When |
|--------|-------|------|
| Keep WS5 scope at **warn** in root ESLint config | SOLID Phase 3 | now |
| Observe warning telemetry on active app feature branches | app maintainers | next cycle |
| Reassess warn -> error promotion with measured noise budget | SOLID follow-up | after telemetry |

---

## 9. Sign-off

| Field | Value |
|-------|-------|
| Date | 2026-06-05 |
| Workstream | SOLID Phase 3 / WS5 |
| Verdict | **SOUND** for warn-only pilot; **NOT SOUND** for immediate error-level promotion |
