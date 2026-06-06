# SOLID audit charter

**Tier:** Internal  
**Status:** Active charter for milestone SOLID Architecture Audit (2026-06-04)  
**Audience:** core team, module authors, AI agents executing architectural work  
**Owners:** project lead  
**Related:** [solid-decoupling-audit.md](./solid-decoupling-audit.md), [solid-audit-inventory.md](./solid-audit-inventory.md), [application-surfaces-vs-platform-backbone.md](./application-surfaces-vs-platform-backbone.md), [DATA-ACCESS-BOUNDARIES.md](../DATA-ACCESS-BOUNDARIES.md), [RFC-0002](../rfcs/0002-canonical-module-physical-layout.md)

---

## 1. Purpose

This charter defines how we **score**, **slice**, and **document exceptions** for the system-wide SOLID audit in umbraculum-dev. SOLID is mapped to **repo-native boundaries** (contracts packages, module-sdk, data-access rules) — not generic Java OOP dogma.

**Guiding sentence:** *Follow dependency direction and single ownership; extend via registration and contracts; when coupling is intentional, say why in code.*

---

## 2. SOLID mapping (Umbraculum-native)

| Letter | Principle | Umbraculum expression |
|--------|-----------|----------------------|
| **S** | Single Responsibility | One owner per URL segment; one Prisma schema per module; routes thin / services own logic; contracts wire-only |
| **O** | Open/Closed | `registerModule()` extension points; versioned `*V1` DTOs; new modules via registration |
| **L** | Liskov Substitution | Zod response schemas; `ValidatedSchema<T>` in ai-tool-sdk |
| **I** | Interface Segregation | Separate `*-contracts`; clients use `api-client`; UI layering in CODING-STANDARDS |
| **D** | Dependency Inversion | Apps → HTTP + contracts; modules → platform SDK; no sibling module service imports |

Full table and examples: [solid-decoupling-audit.md §2](./solid-decoupling-audit.md).

---

## 3. Violation severity rubric

| Severity | Definition | Examples | Default action |
|----------|------------|----------|----------------|
| **P0** | Boundary break — violates documented module or data-access rule | Canonical module imports sibling module service; app imports `services/api` or Prisma | Fix in Tier A or block merge |
| **P1** | God unit — multiple unrelated reasons to change in one file | Route >800 LoC with inline business logic; service >800 LoC; page >1500 LoC mixing auth + domain + UI | Tier A/B refactor or split epic |
| **P2** | Transitional pattern — known RFC-0002 gap, not yet migrated | Brewery routes in `modules/brewery/` calling horizontal `services/`; fat platform route without service class | Document + backlog; align with β-layout over time |
| **P3** | Style / future debt — size or packaging hygiene without wrong dependency direction | Large cohesive domain file; barrel export size | Note in inventory; no urgent action |

---

## 4. Audit slices and owners

| Slice | Primary paths | Review focus | Default owner |
|-------|---------------|--------------|---------------|
| **API canonical modules** | `services/api/src/modules/{pim,mrp,crp,automation}/` | Route/service split; no sibling imports | Module code owner |
| **Brewery vertical** | `modules/brewery/routes/`, `services/api/src/services/*`, `domain/` | Transitional layout; service surface | Brewery vertical |
| **Platform routes/services** | `services/api/src/routes/`, `services/api/src/services/` | Auth, AI, integrations thickness | Platform API |
| **Packages** | `packages/*-contracts/`, `module-sdk`, `brewery-core`, `beerjson` | Package boundaries; contract purity | Package maintainer |
| **Apps** | `apps/web/app/`, `apps/native/src/modules/` | Page decomposition; api-client only | App shell |
| **Cross-module edges** | MRP↔CRP↔brewery projections, AI tools | Dependency direction; shared contracts | Planning modules + platform |

---

## 5. Per-slice pass criteria

For each file or cluster, answer:

1. **S** — How many distinct reasons to change?
2. **O** — Can behavior extend via `registerModule` / new package without editing stable core?
3. **L** — Are wire shapes contract-safe (Zod parse at boundary)?
4. **I** — Do consumers depend on a narrow surface?
5. **D** — Does dependency flow backbone → module → app (never reverse)?

**Pass:** no P0; P1 items have Tier A/B plan or `@arch-boundary`; P2 documented as transitional.

---

## 6. `@arch-boundary` exception convention

When we **choose not** to decouple (cost > benefit, α scope, intentional platform pattern), document at the coupling site:

```ts
/** @arch-boundary — intentional coupling
 * Reason: <why this coupling exists and what it enables>
 * Revisit: <trigger to reconsider — epic id, RFC, roadmap milestone>
 * Owner: <module or team>
 */
```

**Rules:**

- Place immediately above the import, call, or cross-schema read.
- Mirror one line in the module README under **§ Known couplings** (create section if missing).
- **No `@arch-boundary` without all three fields** (Reason, Revisit, Owner).
- Prefer fixing P0 over annotating; annotation is for P1–P3 accepted debt.

---

## 7. Automated inventory

Regenerate with:

```bash
npx tsx scripts/audit/solid-inventory.ts
```

Output: [solid-audit-inventory.md](./solid-audit-inventory.md) (committed snapshot; script is source of regeneration).

**CI:** P0 sibling imports on canonical modules are **merge-blocking** via `eslint-plugin-boundaries` (`boundaries/element-types` at `error` on `services/api/src/modules/**` — SOLID B5, 2026-06-04). The inventory script remains **report-only** (fat-file and drift signal).

---

## 8. Milestone success criteria

- [ ] Inventory complete for all six slices with severity scores
- [ ] Tier A/B/C desirability matrix in [solid-decoupling-audit.md](./solid-decoupling-audit.md)
- [ ] Six skeptical tests answered with evidence
- [ ] Verdict: SOUND / NOT SOUND / NEEDS BROADER ANALYSIS
- [ ] If SOUND: CODING-STANDARDS § Architectural coupling + toolset rule `03-layering-and-coupling-discipline.mdc`

---

## 9. What this audit explicitly avoids

- Mandating interfaces or DI containers on every service class
- Blocking CI on raw LoC thresholds without human triage
- Re-litigating RFC-0001/0002/0003 decisions
- Applying identical size rules to cohesive domain math and HTTP routes

---

## 10. Post–Wave 17 program closure

Mechanical Waves 11–17 and the Tier A/B implementation epic are **complete**. Inventory automation is green (P2/P3=0) except generated OpenAPI (P1 tooling).

**Canonical status for agents and maintainers:** [solid-post-wave17-closure.md](./solid-post-wave17-closure.md) — includes when to reopen hygiene waves, Tier C wont-fix list, and verification gates for SOLID PRs.

---

## 11. App boundaries (WS5)

Apps (`apps/web`, `apps/native`) enforce **Dependency (D)** direction via `eslint-plugin-boundaries` at **`error`**: no `services/api/**` source imports, no sibling feature-segment imports (water mash↔boil, native module↔module), and no cross-locale-vertical imports (`(pim)` ↔ `(mrp)` etc.). Belt-and-suspenders WS6 `no-restricted-imports` blocks `@prisma/*` and deep API paths by pattern.

**Agent gate:** [AGENTS.md](../../AGENTS.md) § SOLID and dependency direction (D).

**Contributor docs:** [LINTING.md § App layer boundaries (WS5)](../LINTING.md#app-layer-boundaries-ws5), [solid-boundaries-eslint-apps-spike.md](./solid-boundaries-eslint-apps-spike.md), [DATA-ACCESS-BOUNDARIES.md](../DATA-ACCESS-BOUNDARIES.md) §6.

---

*Charter frozen 2026-06-04. Amend only when the scoring rubric or slice model needs revision — not for individual inventory rows (those live in solid-audit-inventory.md).*
