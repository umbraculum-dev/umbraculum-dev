# API module: `brewery`

Reference vertical API slice — recipes, water chemistry, brew sessions, inventory, and related routes under the Prisma `brewery` schema.

> [!NOTE]
> Brewery **routes** live in `routes/`; brewery **domain services and math** live in `services/` (RFC-0011 Wave **3e**, [backbone §6.8](../../../../../docs/design/pre-flip-application-surface-backbone.md)). Legacy flat `src/domain/waterCalc/`, `src/domain/recipeAnalysis/`, and `src/services/recipeWaterHub|Compute/` trees were colocated here in 2026-06.

## Layout

| Path | Role |
|------|------|
| `routes/` | Fastify route plugins (`recipes.ts`, `waterCalc.ts`, `recipeWaterHubSummary.ts`, …) |
| `services/waterCalc/` | Water-chemistry math (merged ops + pure functions) and `waterCalcService.ts` facade |
| `services/recipeWaterHub/` | Water-hub summary builders |
| `services/recipeWaterCompute/` | Mash/sparge/boil compute-and-save ops |
| `services/recipeAnalysis/` | Gravity / efficiency analysis for recipe reads |
| `services/recipeWaterHubSummaryService.ts` | Hub summary orchestrator |
| `services/recipeWaterComputeAndSaveService.ts` | Compute-and-save orchestrator |
| `services/recipeWaterSettingsService.ts` | Re-export barrel → `services/recipeWaterSettings/` (Phase 2 colocation pending) |
| `services/ingredients/`, `stylesService.ts` | Ingredient catalog and BJCP styles |

HTTP paths are unchanged — this wave is filesystem clarity only.

## Cross-references

- [`docs/modules/verticals/brewery/README.md`](../../../../../docs/modules/verticals/brewery/README.md) §3.1
- [`docs/rfcs/0011-application-surface-shell-layering.md`](../../../../../docs/rfcs/0011-application-surface-shell-layering.md) §10
- [`@umbraculum/brewery-contracts`](../../../../../packages/brewery-contracts/README.md)
