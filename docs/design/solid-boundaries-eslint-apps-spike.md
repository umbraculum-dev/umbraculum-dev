# SOLID boundaries eslint spike — eslint-plugin-boundaries on apps/web + apps/native

**Tier:** Internal  
**Status:** Frozen (2026-06-06) — SOLID WS5 deliverable (**error**, CI-blocking; locale vertical expansion complete). Recipe-cluster element paths retargeted to `(brewery)/recipes/**` in the same month (fork-cleanliness epic); see [`web-brewery-tree-consolidation-inventory.md`](web-brewery-tree-consolidation-inventory.md).  
**Audience:** app maintainers, lint/CI maintainers  
**Related:** [solid-boundaries-eslint-spike.md](./solid-boundaries-eslint-spike.md), [solid-decoupling-audit.md](./solid-decoupling-audit.md), [LINTING.md](../LINTING.md#app-layer-boundaries-ws5)

---

## 1. Why this spike exists

**Trigger:** SOLID Phase 3 WS5 asks for an app-surface counterpart to the API canonical-module boundaries pilot: define practical import boundaries for `apps/web` and `apps/native`, prototype them, and promote to **error** when violation count is zero.

**Outcome:** WS5 is **CI-blocking** at `error`. WS6 `no-restricted-imports` provides belt-and-suspenders for `@prisma/*` and deep `services/api/**` paths.

---

## 2. What we have today

| Artifact | Role |
|----------|------|
| `docs/design/solid-boundaries-eslint-spike.md` | API-side pilot pattern (canonical modules in `services/api/src/modules/**`) |
| `eslint.config.mjs` | WS5 app boundaries + B5 API boundaries (`error`) |
| `docs/LINTING.md` § App layer boundaries (WS5) | Contributor-facing element table and fix guidance |
| `apps/web/README.md`, `apps/native/README.md` | App ownership/scope docs (apps consume API over HTTP, not source imports) |

**Intentional app coupling (modelled as allowed layers):**

- App-internal shared surfaces (`apps/web/app/_components`, `apps/web/app/_lib`, `apps/web/src/**`, `apps/native/src/{auth,components,…}`).
- Route-scoped shared folders (`water/{_lib,_hooks}`, `edit/{_lib,_hooks}`).
- Shared package imports (`@umbraculum/*`) used by both apps.

---

## 3. Prototype configuration

**File:** [`eslint.config.mjs`](../../eslint.config.mjs) — block scoped to `apps/{web,native}/**/*.{ts,tsx}`.

**Elements:**

| Type | Path | Purpose |
|------|------|---------|
| `api-service` | `services/api/**` | Detect and forbid direct app → API source imports |
| `web-app-shared` | `apps/web/{src,app/_components,app/_lib}/**` | Allowed shared UI/helpers for web routes |
| `web-water-shared` | `apps/web/app/[locale]/(brewery)/recipes/[id]/water/{_lib,_hooks}/**` | Cross-segment water helpers |
| `web-water-segment` | `apps/web/app/[locale]/(brewery)/recipes/[id]/water/*/**` | Capture water route segment ownership (`capture: ["segmentCode"]`) |
| `web-recipe-edit-shared` | `apps/web/app/[locale]/(brewery)/recipes/[id]/edit/{_lib,_hooks}/**` | Cross-section edit helpers |
| `web-recipe-edit-surface` | `apps/web/app/[locale]/(brewery)/recipes/[id]/edit/**` | Edit route surface (explicit allow list) |
| `web-recipe-cluster` | `apps/web/app/[locale]/(brewery)/recipes/**` | Recipes App Router tree; must not import locale vertical admin UI |
| `web-locale-vertical` | `apps/web/app/[locale]/(pim\|mrp\|crp\|brewery\|automation)/**` | Locale route-group ownership (`capture: ["verticalCode"]`) |
| `native-app-shared` | `apps/native/src/{auth,components,…}/**` | Allowed shared runtime/navigation surfaces |
| `native-module-segment` | `apps/native/src/modules/*/**` | Capture native module ownership (`capture: ["moduleCode"]`) |

**Rule:** `boundaries/element-types` at **`error`**.

**Forbidden imports:**

1. Any app element importing from `services/api/**` source files (WS5 + WS6).
2. `web-water-segment` importing a different `web-water-segment` (e.g. mash → boil).
3. `web-locale-vertical` importing a different `web-locale-vertical` (e.g. `(mrp)` → `(pim)`).
4. `web-recipe-cluster` importing any `web-locale-vertical` source.
5. `native-module-segment` importing a different `native-module-segment`.

---

## 4. Spike measurements

| Check | Result |
|-------|--------|
| Pilot promotion (2026-06-05) | **0** WS5 violations; water-shared + recipe-edit extension landed |
| Locale vertical expansion (2026-06-06) | **0** violations after adding `web-locale-vertical` + `web-recipe-cluster` fences |
| Config shape parity with API spike | Pass (same plugin, element capture model, `error` severity) |
| CI impact | Blocking on `lint` job via ci-parity |

---

## 5. Six skeptical tests

### 5.1 Test A — Novelty bias

**Verdict:** Passes — mirrors API B5 pattern; encodes DATA-ACCESS-BOUNDARIES §6.

### 5.2 Test B — Replacement value

**Verdict:** Passes — editor-time enforcement for deep relative imports code review misses.

### 5.3 Test C — Cost of adoption

**Verdict:** Passes — one flat-config block; no new package dependencies.

### 5.4 Test D — False-positive budget

**Verdict:** Passes — sibling fences scoped to high-signal segment families; shared layers explicitly allowed.

### 5.5 Test E — Expressiveness gap

**Verdict:** Passes — `boundaries/element-types` handles absolute disallow and capture-based inequality.

### 5.6 Test F — Operational fit

**Verdict:** Passes — runs under existing root ESLint + ci-parity `lint` job.

---

## 6. Verdict

**SOUND** — WS5 app boundaries at **`error`**, CI-blocking. Locale vertical expansion complete (2026-06-06).

---

## 7. Open questions (non-blocking)

- **`apps/web/e2e/**`:** Explicitly **excluded** from WS5 today (same relaxation philosophy as test globs). Revisit if E2E helpers begin importing locale vertical source.
- **Other recipe sub-routes** (`brew-sessions/`, `yeast/`): Covered by `web-recipe-cluster`; no additional sibling fence needed until cross-import drift appears.

---

## 8. Recommended next actions

| Action | Owner | When |
|--------|-------|------|
| Keep WS5 app boundaries at **error** in root ESLint config | maintainers | done |
| Keep spike doc + LINTING.md in sync with `eslint.config.mjs` | SOLID / lint maintainers | on each WS5 change |
| Locale vertical expansion | SOLID WS5 epic | **done** (2026-06-06) |
| Optional e2e exclusion policy | app maintainers | when e2e import surface grows |

---

## 9. Sign-off

| Field | Value |
|-------|-------|
| Date | 2026-06-06 |
| Workstream | SOLID WS5 (app-layer D enforcement) |
| Verdict | **SOUND** at **error** (pilot + locale vertical expansion) |
