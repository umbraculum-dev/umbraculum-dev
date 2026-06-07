# SOLID boundaries eslint spike — API flat `services/` fence

**Tier:** Internal  
**Status:** Frozen (2026-06-07) — RFC-0011 Phase 3 deliverable  
**Audience:** API maintainers, CI  
**Related:** [solid-boundaries-eslint-spike.md](./solid-boundaries-eslint-spike.md), [pre-flip-application-surface-backbone.md](./pre-flip-application-surface-backbone.md) §6.8, [LINTING.md](../LINTING.md)

---

## 1. Why this spike exists

**Trigger:** RFC-0011 Wave 3e moved brewery business logic from flat `services/api/src/services/` into `modules/brewery/services/`. B5 fences **sibling canonical modules** under `modules/**` but does **not** stop new brewery files landing back in flat `services/` — a regression vector called out in backbone §6.8.2.

**Goal:** Mechanical lint on flat horizontal services so Wave 3e colocation stays enforced without blocking intentional platform wiring.

---

## 2. Out of scope (unchanged)

Documented in [solid-boundaries-eslint-spike.md §2](./solid-boundaries-eslint-spike.md):

| Pattern | Rationale |
|---------|-----------|
| `services/api/src/services/ai/**` → `modules/*/services/*` | Horizontal AI advisor reads module services by design |
| `services/api/src/app.ts` → `register*Module()` | Boot wiring |
| `modules/**` → `domain/`, `platform/` | B5 spike scope |

---

## 3. Elements

| Type | Path | Role |
|------|------|------|
| `api-flat-services` | `services/api/src/services/**` (excluding `ai/**` via eslint `ignores`) | Horizontal orchestrators that must stay brewery-free |
| `canonical-module-services` | `services/api/src/modules/*/services/**` | Module-owned service layer |
| `platform`, `domain`, `plugins` | Same as B5 spike | Allowed imports from flat services |

---

## 4. Rule

**File glob:** `services/api/src/services/**/*.{ts,tsx}` with `ignores: ["services/api/src/services/ai/**"]`

**Rule:** `boundaries/element-types` at **`error`** — `api-flat-services` **disallows** `canonical-module-services`.

**Message:** *Flat API services must not import canonical module services — colocate in `modules/<code>/services/` (RFC-0011 Wave 3e).*

---

## 5. Allowlist (`@arch-boundary`)

Legacy orchestrators that intentionally delegate to module services until a follow-on refactor:

| File | Reason |
|------|--------|
| [`platformRecipesService.ts`](../../services/api/src/services/platformRecipesService.ts) | Platform-admin recipes import path; delegates to `RecipesService` / import parsers |

New allowlist entries require `@arch-boundary` comment + maintainer review — do not expand casually.

---

## 6. Test matrix

| Case | Expected |
|------|----------|
| `platformRecipesService.ts` imports `modules/brewery/services/*` | **Allow** (explicit file override / `@arch-boundary`) |
| `services/ai/tools/mrp/*.ts` imports `modules/mrp/services/*` | **Allow** (`ai/**` ignored by fence block) |
| New `services/fooService.ts` imports `modules/brewery/services/bar` | **Error** |
| `modules/brewery/services/*` imports sibling module | **Error** (existing B5 rule) |

---

## 7. Verification

```bash
./scripts/ci-parity-check.sh --archive run --jobs lint
```

Configuration: [`eslint.config.mjs`](../../eslint.config.mjs) block after SOLID B5.
