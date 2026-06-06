# SOLID post–Wave 17 closure

**Tier:** Internal  
**Status:** Active — canonical SOLID program status after Wave 17 (`bfd6214`)  
**Audience:** maintainers, module authors, AI agents  
**Related:** [solid-audit-charter.md](./solid-audit-charter.md), [solid-decoupling-audit.md](./solid-decoupling-audit.md), [solid-audit-inventory.md](./solid-audit-inventory.md)

---

## 1. Verdict

Hand-written **Single Responsibility (S)** debt from the 2026-06 SOLID audit is **resolved** for P0/P1 god units (services, routes, pages). Automated inventory is **green**:

| Metric | Value (post–Wave 17) |
|--------|----------------------|
| P0 | 0 |
| P1 | 2 (generated OpenAPI client blobs only) |
| P2 | 0 |
| P3 | 0 |

The mechanical Wave 11–17 program is **closed**. Do **not** schedule Wave 18+ proactively.

**Guiding sentence:** *Follow dependency direction and single ownership; extend via registration and contracts; when coupling is intentional, say why in code.*

---

## 2. What landed

| Track | Scope | Reference |
|-------|--------|-----------|
| Tier A | Projection IDs, AuthService, WaterCalcService, boundaries spike | Child plans A1–A4 |
| Tier B | God services, recipe-edit shells, projection port, thin routes, B5 CI | Child plans B1–B5 |
| Waves 15–17 | Hygiene band + tail parity + Tier A route thinning + test barrels | `54b4f06`, `bfd6214` |
| S closure epic | Composer thinning, WS6 promotion, water/brew-session tail | This doc + successor commits |

Regenerate inventory after structural changes:

```bash
npm run audit:solid-inventory
```

---

## 3. Tier C — explicit wont-fix (do not split as hygiene)

| Pattern | Why keep |
|---------|----------|
| `domain/waterCalc/mashAcidificationTargetMashPh.ts`, `spargeAcidification.ts` | Cohesive domain math; logical SRP ≠ file size |
| `packages/module-sdk/src/moduleRegistry.ts` | Boot composition root |
| Generated OpenAPI under `packages/api-client/src/generated/` | Codegen output — tooling epic, not runtime S |
| DI containers / interface per Prisma service | Audit Tier C — Fastify + vi.mock sufficient |

See [solid-audit-charter.md §9](./solid-audit-charter.md).

---

## 4. When to reopen mechanical waves

Run `npm run audit:solid-inventory` on major feature merges. Re-open a scheduled hygiene wave **only** if:

- New **P2** or **P3** production findings appear, or
- A production file reaches **≥400 LoC** without a documented `@arch-boundary`, or
- A **P0** boundary violation appears (`boundaries/element-types` on `modules/**`).

Otherwise: split opportunistically when touching an area for a feature — not inventory-driven waves.

---

## 5. Remaining S backlog (S closure epic)

**Status: complete** (S closure epic landed on `master`).

All targeted composer thinning and native parity work from the epic is done:

- Recipe edit: web `useRecipeEditPage` + native `useRecipeEditScreen` composers thinned; native mashing hook parity.
- Water + brew-session: mash/sparge handlers, hub recap, brew-session detail hook splits.
- Equipment + section tail: native equipment mutations, hops rows, save-recipe payload split.

Further splits are **opportunistic only** (feature-driven) or **Tier C / tooling** — see §3 and §8.

---

## 6. Verification for SOLID PRs

These gates **already exist**. They are **not** a new SOLID initiative — agents and contributors run them before every push.

| When | Command | What it is |
|------|---------|------------|
| **Every push** with TS/lint surface | `npm run verify:pre-push` | **T2-PR** — path-aware ci-parity on committed `HEAD` + auto API vitest when diff matches `api.yml` paths |
| WIP iteration only | `./scripts/ci-parity-check.sh run --jobs …` | Fast feedback; **not** push proof |
| API behavior or tests changed | Skill `api-integration-tests-pre-push` | Full vitest (332/332); complements ci-parity when API paths touched |
| Manifest / SDK tags / ci-parity pins | `npm run verify:pre-push:release` | **T2-release** — not the default pre-push |

### Agent rules

1. **Agents run T2 before push** — never delegate to the operator. See [AGENTS.md](../../AGENTS.md) § Pre-push CI parity.
2. Use **`./scripts/ci-parity-check.sh`** — not bare `npx @umbraculum/ci-parity` (Cursor AppImage PATH issue).
3. **Do not** schedule Wave 18+ proactively; run inventory on large merges instead.
4. **Do not** split Tier C files or generated OpenAPI as “SOLID hygiene.”
5. Commit first; working tree must be **clean** for archive replay push proof.

Full tier reference: [VERIFICATION-TIERS.md](../VERIFICATION-TIERS.md), [CI-PARITY.md](../CI-PARITY.md).

---

## 7. Enforcement status

| Rule | Level | Scope |
|------|-------|-------|
| B5 `boundaries/element-types` | **error** | `services/api/src/modules/**` |
| WS6 client-safe imports | **error** (post S-closure epic) | `apps/{web,native}/**` — see [solid-client-safe-imports-spike.md](./solid-client-safe-imports-spike.md) |
| WS5 apps boundaries | deferred | Separate epic (Dependency **D**, not S) |

---

## 8. Out of scope (separate epics)

- OpenAPI generator / client split (P1 inventory — **I** segregation)
- WS5 `apps/**` boundaries eslint spike
- Full `BreweryScheduleProjection` port (Tier B — on-demand with MRP/CRP features)

---

*Closure doc introduced with S closure epic. Amend when program status or enforcement promotion changes.*
