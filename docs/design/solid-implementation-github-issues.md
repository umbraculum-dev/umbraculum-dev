# SOLID implementation — GitHub issue tracker

**Tier:** Internal  
**Status:** Issue templates for manual creation (or `gh issue create` when CLI available)  
**Master plan:** [`.cursor/plans/solid-implementation-master.plan.md`](../../.cursor/plans/solid-implementation-master.plan.md)  
**Audit:** [`solid-decoupling-audit.md`](./solid-decoupling-audit.md)

Create labels if missing: `solid-audit`, `tier-A`, `tier-B`, `tier-ops`

---

## Issue index

| # | Title | Labels | Plan | Wave | Depends |
|---|-------|--------|------|------|---------|
| 1 | SOLID Ops: publish 03-layering toolset rule | solid-audit, tier-ops | [ops-toolset-publish](../../.cursor/plans/solid-impl-ops-toolset-publish.plan.md) | 1 | — |
| 2 | SOLID A1: unify breweryProjectionIds (P0 boundary) | solid-audit, tier-A | [A1-projection-ids](../../.cursor/plans/solid-impl-A1-projection-ids.plan.md) | 1 | — |
| 3 | SOLID A2: extract AuthService | solid-audit, tier-A | [A2-auth-service](../../.cursor/plans/solid-impl-A2-auth-service.plan.md) | 2 | #2 |
| 4 | SOLID A3: extract WaterCalcService | solid-audit, tier-A | [A3-water-calc-service](../../.cursor/plans/solid-impl-A3-water-calc-service.plan.md) | 2 | #2 |
| 5 | SOLID A4: boundaries eslint spike | solid-audit, tier-A | [A4-boundaries-spike](../../.cursor/plans/solid-impl-A4-boundaries-spike.plan.md) | 3 | #2 |
| 6 | SOLID B1: split god services (recipes/brewSessions) | solid-audit, tier-B | [B1-god-services](../../.cursor/plans/solid-impl-B1-god-services.plan.md) | 4 | Tier A |
| 7 | SOLID B2: recipe edit UI decomposition (web) | solid-audit, tier-B | [B2-recipe-edit-ui](../../.cursor/plans/solid-impl-B2-recipe-edit-ui.plan.md) | 5 | — |
| 8 | SOLID B2: recipe edit UI decomposition (native) | solid-audit, tier-B | [B2-recipe-edit-ui](../../.cursor/plans/solid-impl-B2-recipe-edit-ui.plan.md) | 5 | #7 |
| 9 | SOLID B3: BreweryScheduleProjection port | solid-audit, tier-B | [B3-projection-port](../../.cursor/plans/solid-impl-B3-projection-port.plan.md) | 6 | #2, #6 |
| 10 | SOLID B4: thin ai/tilt/brewSessions routes | solid-audit, tier-B | [B4-thin-routes](../../.cursor/plans/solid-impl-B4-thin-routes.plan.md) | 7 | #6 |
| 11 | SOLID B5: boundaries lint CI (if A4 SOUND) | solid-audit, tier-B | [B5-boundaries-ci](../../.cursor/plans/solid-impl-B5-boundaries-ci.plan.md) | 7 | #5 SOUND |

---

## Copy-paste: `gh issue create` examples

```bash
# After: gh label create solid-audit && gh label create tier-A && gh label create tier-B && gh label create tier-ops

gh issue create --title "SOLID A1: unify breweryProjectionIds (P0 boundary)" \
  --label "solid-audit,tier-A" \
  --body "$(cat <<'EOF'
Implement Subplan A1 from the SOLID audit implementation epic.

**Plan:** \`.cursor/plans/solid-impl-A1-projection-ids.plan.md\`
**Audit:** \`docs/design/solid-decoupling-audit.md\` §3.6

## Scope
- Create \`services/api/src/platform/breweryProjectionIds.ts\`
- Remove CRP→MRP sibling import
- @arch-boundary + README Known couplings

## Verify
- api-integration-tests-pre-push
- npm run audit:solid-inventory
EOF
)"
```

Repeat for each row in the index table, swapping title/body/plan path/labels.

---

## Epic link (optional)

Create a GitHub Project or milestone: **SOLID Implementation 2026-Q2** — attach issues #1–#11.

---

*Generated 2026-06-04 as part of solid-implementation subplans authoring.*
