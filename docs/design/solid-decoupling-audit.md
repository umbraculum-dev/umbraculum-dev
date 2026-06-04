# SOLID / decoupling audit — system-wide (umbraculum-dev)

**Tier:** Internal  
**Status:** Signed off 2026-06-04 — **SOUND** (codify as architectural pillar with pragmatic scope)  
**Audience:** project lead, module authors, AI agents  
**Related:** [solid-audit-charter.md](./solid-audit-charter.md), [solid-audit-inventory.md](./solid-audit-inventory.md), [architectural-audit-template.md](./architectural-audit-template.md), [application-surfaces-vs-platform-backbone.md](./application-surfaces-vs-platform-backbone.md), [DATA-ACCESS-BOUNDARIES.md](../DATA-ACCESS-BOUNDARIES.md), [RFC-0001](../rfcs/0001-modules-tiers-governance-and-automation-placement.md), [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md)

---

## 1. Why this audit exists

**Trigger:** Milestone plan to assess whether SOLID heuristics, mapped to Umbraculum-native boundaries, should become a documented architectural pillar with agent enforcement — without mandating Java-style IoC everywhere.

**Scope:** `apps/`, `services/api/`, `packages/` (740+ TS/TSX files scanned).

**Method:** Automated inventory (`scripts/audit/solid-inventory.ts`) + manual slice review + six skeptical tests from [architectural-audit-template.md](./architectural-audit-template.md).

---

## 2. SOLID mapped to repo-native vocabulary

| Letter | Principle | Umbraculum expression |
|--------|-----------|----------------------|
| **S** | Single Responsibility | One URL-segment owner (`registerWebModule`); one Prisma schema per module; routes thin / services own logic; contracts wire-only |
| **O** | Open/Closed | `registerModule()` extension points; versioned `*V1` DTOs; new modules via registration |
| **L** | Liskov Substitution | Zod response schemas; `ValidatedSchema<T>` in ai-tool-sdk |
| **I** | Interface Segregation | Separate `*-contracts`; clients use `api-client`; UI layering in CODING-STANDARDS |
| **D** | Dependency Inversion | Apps → HTTP + contracts; modules → platform SDK; **not** every service class needs an interface |

**Guiding sentence:** *Follow dependency direction and single ownership; extend via registration and contracts; when coupling is intentional, say why in code (`@arch-boundary`).*

---

## 3. Slice-by-slice manual audit

### 3.1 API canonical modules (pim, mrp, crp, automation)

| Module | S | O | L | I | D | Notes |
|--------|---|---|---|---|---|-------|
| **pim** | Pass | Pass | Pass | Pass | Pass | Reference β-layout: thin routes → `ProductsService` |
| **automation** | Pass | Pass | Pass | Pass | Pass | Adapters folder for external seams |
| **mrp** | Partial | Partial | Pass | Partial | Partial | `MrpBreweryProjectionService` reads `brewery.*` schema (documented `@arch-boundary`) |
| **crp** | Partial | Partial | Pass | Partial | Fail (P0) | CRP→MRP `breweryProjectionIds` import — Tier A fix |

**Findings:**

- **PIM** is the target shape for canonical modules: route file ~130 LoC, service owns Prisma.
- **MRP/CRP** α projections intentionally cross-read brewery + automation tables until a `BreweryScheduleProjection` port (Tier B).
- **No other sibling module imports** detected besides CRP→MRP (P0).

### 3.2 Brewery vertical

| Area | S | D | Notes |
|------|---|---|-------|
| `modules/brewery/routes/` | Partial | Partial | Routes migrated (RFC-0002); services still in horizontal `services/api/src/services/` (P2 transitional) |
| `waterCalc` | Fail (P1) | Partial | ~1.4k LoC fat route — Tier A: extract `WaterCalcService` |
| `recipesService` / `brewSessionsService` | Fail (P1) | Partial | ~1.2–1.3k LoC god services — Tier B split |
| `domain/waterCalc/*` | Pass | Pass | Cohesive pure functions; large files acceptable if logically single domain |

### 3.3 Platform routes/services

| File | Severity | Notes |
|------|----------|-------|
| `routes/auth.ts` | P2 | ~530 LoC; Tier A: extract `AuthService` |
| `routes/ai.ts` | P2 | Usage aggregation inline; defer service extraction |
| `routes/integrationsTilt.ts` | P2 | Mixed service + raw Prisma |
| `services/ai/tools/*` | P2 | Platform AI binds to concrete module services (acceptable until tool registry ports) |

### 3.4 Packages

| Package | Assessment |
|---------|------------|
| `*-contracts` | **Strong** — ESLint forbids hand-rolled type guards (RFC-0003) |
| `module-sdk` | **Accepted** — process singleton registries are intentional composition root (OCP) |
| `beerjson` | P3 — large barrel; packaging split optional |
| `brewery-core` | Pass — shared domain math, no server imports |

**Apps → server:** No `services/api` or `@prisma` imports in apps (inventory clean after allowlist fix). Client packages (`ui`, `navigation`, `i18n`, etc.) correctly consumed.

### 3.5 Apps (web / native)

| Finding | Severity |
|---------|----------|
| `apps/web/app/recipes/[id]/edit/page.tsx` (~3.8k LoC) | P1 — god page; Tier B decompose into hooks + subcomponents |
| `apps/native/src/modules/*` | Pass — thin module slices |
| `apps/web/src/*` | Pass — re-exports only |

### 3.6 Cross-module edges

| Edge | Severity | Recommendation |
|------|----------|----------------|
| CRP imports MRP `breweryProjectionIds` | P0 | Unify in `platform/breweryProjectionIds.ts` (Tier A) |
| Duplicate `brewery-brew-session-step-` prefix | P1 | Same shared module (Tier A) |
| MRP/CRP brewery schema reads | P2 (accepted) | `@arch-boundary` + README § Known couplings until projection port (Tier A/B) |

---

## 4. Tier A / B / C desirability matrix

### Tier A — recommended near-term backlog (audit finding; not implemented in this milestone)

| Action | Rationale | Principles |
|--------|-----------|------------|
| Unify `breweryProjectionIds` in `platform/` | Removes duplicate prefix constants; fixes P0 CRP→MRP import | O, D |
| Remove CRP → MRP direct import | Only P0 sibling-module violation found | D |
| Extract `AuthService` from `routes/auth.ts` | Matches PIM pattern | S, D |
| Extract `WaterCalcService` from `waterCalc.ts` routes | Aligns brewery with β-layout | S |
| Add `@arch-boundary` on MRP/CRP brewery projection services | Documents intentional cross-schema read for α | S, D |
| Pilot `eslint-plugin-boundaries` on `modules/*` | Mechanical D enforcement (RFC-0002 footnote) | D |

**Inventory / charter tooling (this milestone — documentation only):**

| Action | Status |
|--------|--------|
| `scripts/audit/solid-inventory.ts` + `npm run audit:solid-inventory` | Delivered |
| Charter + audit + inventory snapshot | Delivered |
| CODING-STANDARDS § Architectural coupling | Delivered (append-only) |
| Toolset rule `03-layering-and-coupling-discipline.mdc` | Delivered in umbraculum-toolset |

### Tier B — desirable; follow-up epics

| Action | Rationale |
|--------|-----------|
| Split `recipesService` / `brewSessionsService` | High-churn brewery core; reduce merge conflicts |
| Decompose web recipe edit page | SRP for UI; native parity |
| `BreweryScheduleProjection` port for MRP/CRP | Anti-corruption layer for cross-schema reads |
| Thin `ai.ts`, `integrationsTilt.ts`, `brewSessions.ts` routes | PIM consistency |
| Pilot `eslint-plugin-boundaries` on `modules/*` | Mechanical D enforcement (RFC-0002 footnote) |

### Tier C — not desirable now (document why)

| Pattern | Why keep | Documentation |
|---------|----------|---------------|
| `new XxxService(app.prisma)` without interfaces | Fastify + vi.mock sufficient; IoC ceremony | Rule + audit §4 |
| Interface per Prisma service | No runtime polymorphism | Wont-fix |
| Full anti-corruption for brewery ↔ MRP/CRP now | α scope; cost >> benefit until ROADMAP H1 2027 | `@arch-boundary` |
| Split `beerjson` barrel | Stable; hygiene only | P3 backlog |
| `module-sdk` singleton registries | Boot-time composition root | Accepted OCP pattern |
| Large cohesive `domain/*` files | Logical SRP ≠ file size | Review logic only |

---

## 5. What we have today (strengths)

- **Contracts split** — wire DTOs isolated per module (`*-contracts`).
- **Data-access boundaries** — clients never touch Prisma.
- **Module registration** — `registerModule()` / `registerWebModule()` extension points.
- **PIM reference layout** — reproducible thin-route pattern.
- **Validation at boundary** — Zod + Fastify type provider (RFC-0003).

---

## 6. Six skeptical tests

### 6.1 Test A — Novelty bias

**Question:** Are we recommending SOLID because it is trendy?

**Evidence:** Umbraculum already encodes S/D/I via RFC-0001/0002 and boundary docs without the acronym. Recommendation maps SOLID to **existing** patterns, not a new framework.

**Verdict:** Passes — not novelty-driven.

### 6.2 Test B — Cost-estimate honesty

**Question:** Is the cost estimate credible?

**Evidence:** Tier A (documentation + inventory tooling) ≈ 2–3 days. Tier A **code refactors** ≈ 3–5 days additional — explicitly **deferred** to a follow-up implementation epic, not this audit milestone.

**Verdict:** Passes — scoped honestly.

### 6.3 Test C — Intermediate options

| Option | Assessment |
|--------|------------|
| Full SOLID + DI containers | Rejected — overkill |
| Docs-only (no agent rule) | Weaker agent signal; chosen: docs + scoped rule |
| **Map SOLID to native boundaries + `@arch-boundary`** | **Chosen** — middle ground |
| CI LoC gates | Rejected — too noisy; report-only inventory |
| Wait for RFC-0002 completion | Partial — audit proceeds with P2 transitional labels |

**Verdict:** Passes — middle ground selected.

### 6.4 Test D — Timing soundness

**Question:** Why now?

**Evidence:** Mid-modularization (RFC-0002) is when boundary violations compound — P0 CRP→MRP import, god services, fat routes. Delaying agent guidance until post-β-layout means agents replicate transitional anti-patterns.

**Verdict:** Passes — timing justified.

### 6.5 Test E — Cost of being wrong

| Scenario | Direct | Indirect | Recovery |
|----------|--------|----------|----------|
| Wrong: adopt SOLID pillar | Rule + doc churn | Agent confusion if over-specified | Narrow rule scope; amend charter |
| Wrong: defer | P0 imports recur | Agents copy fat-route pattern | Re-run audit; higher refactor cost |
| Right: adopt (scoped) | Tier A refactors | None significant | — |
| Right: defer docs-only | None | Continued drift in modules | Audit inventory still useful |

**Verdict:** Passes — asymmetric cost favors scoped codification.

### 6.6 Test F — Falsifiability

Would have **failed** SOUND if:

1. Inventory found >3 P0 sibling module imports — **found 1** (CRP→MRP); not fixed in this milestone.
2. Apps imported Prisma/server paths — **none found**.
3. PIM module violated route/service split — **passes**.
4. Tier A refactors would break typecheck if done carelessly — **spike recommended before implementation epic**.

**Verdict:** Passes for **audit + governance** scope; implementation falsifiers remain for the follow-up epic.

---

## 7. Verdict

**SOUND** — Codify SOLID as **repo-native coupling discipline** (charter + CODING-STANDARDS + toolset rule `03-layering-and-coupling-discipline.mdc`). **No new RFC required** — RFC-0001/0002 already commit module boundaries; this audit adds vocabulary, scoring, `@arch-boundary`, and inventory tooling.

**Structural caveat:** DIP is satisfied at **package/layer** boundary, not per service class. LSP applies primarily at **Zod wire contracts**, not TypeScript class hierarchies.

---

## 8. Recommended next actions

1. **Done (this milestone):** Charter, inventory script, inventory snapshot, this audit, governance docs/rule.
2. **Next (implementation epic):** Tier A code refactors — label `solid-audit` / tier-A.
3. **Backlog (Tier B):** Remaining items — optional section splits for recipe-edit content components; `apps/**` boundaries lint (future epic).

---

## 9. Sign-off

| Field | Value |
|-------|-------|
| Date | 2026-06-04 |
| Verdict | **SOUND** |
| Successor artifacts | [solid-audit-charter.md](./solid-audit-charter.md), CODING-STANDARDS § Architectural coupling, toolset `03-layering-and-coupling-discipline.mdc` |
| RFC | Not required (existing RFC-0001/0002 sufficient) |

---

*Audit body frozen 2026-06-04. Inventory rows regenerate via script; do not edit solid-audit-inventory.md by hand.*
