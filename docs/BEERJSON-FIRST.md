# BeerJSON-first recipes (canonical storage)

**Status:** Implemented (2026-02-17)  
**Scope:** Backend (API + DB) and web recipe editor are BeerJSON-first.  

## Goals
- Use **BeerJSON** as the canonical representation of recipe ingredients for import/export interoperability.
- Keep app-specific inputs and overrides in **`recipeExtJson`** (versioned), without polluting canonical BeerJSON.

## Canonical storage (Postgres + Prisma)
- **`recipes.beer_json_recipe_json`**: canonical BeerJSON document.
- **`recipes.recipe_ext_json`**: internal extensions (versioned).

Legacy recipe JSON columns were removed:
- `recipes.grist_json`
- `recipes.hops_json`
- `recipes.yeast_json`
- `recipes.misc_json`

## API contract (recipes)
Recipe create/update is BeerJSON-first:
- `POST /recipes`
  - Requires: `name`, `styleKey`, `beerJsonRecipeJson`
  - Optional: `notes`, `recipeExtJson`
- `PATCH /recipes/:id`
  - Supports updates to: `name`, `notes`, `styleKey`, `beerJsonRecipeJson`, `recipeExtJson`

### Name/notes synchronization rule
The DB columns `recipes.name` and `recipes.notes` are treated as the human-facing summary fields.
On create/update, the API **normalizes** BeerJSON so:
- `beerjson.recipes[0].name` matches `recipes.name`
- `beerjson.recipes[0].notes` matches `recipes.notes` (or is removed if notes are empty)

## `recipeExtJson` v1
Validated by AJV in the API.

### Canonical “v1 real” fields (not defaults)
- `batchSizeLiters?: number` (must be > 0)
- `brewhouseEfficiencyPercent?: number` (0..100)
- Optional targets:
  - `ogTarget?: { sg: number }`
  - `fgTarget?: { sg: number }`
  - `abvTarget?: { percent: number }`

### Internal mapping helpers
BeerJSON does not carry our internal linking/override metadata, so `recipeExtJson` also supports:
- `ingredientLinks`: best-effort mapping from **UI row IDs** → canonical ingredient IDs
  - `grist`, `hops`, `yeast`, `misc`: objects mapping `{ [rowId: string]: ingredientId }`
- `mashPhModel`: per-grist-row mash pH model overrides keyed by row ID
  - `mashDiPh`, `mashTaToPh57_mEqPerKg`, `roastDehuskedOverride`

## Row IDs inside BeerJSON (pragmatic extension)
To keep stable editor row identity across edits, the web editor includes an `id` field on BeerJSON *addition* objects:
- `ingredients.fermentable_additions[*].id`
- `ingredients.hop_additions[*].id`
- `ingredients.culture_additions[*].id`
- `ingredients.miscellaneous_additions[*].id`

This `id` is **not part of the BeerJSON standard**, but it is accepted by the upstream JSON-Schema (these addition types do not set `additionalProperties: false`).

**Portability note:** if you export BeerJSON to other systems, they should ignore unknown fields; if we later add a “strict export” mode, we can strip `id` on export.

## Import/export behavior
- **Import** routes validate BeerJSON and map it into canonical storage.
- **Export** uses `beerJsonRecipeJson` directly (canonical).

## Files (source of truth)
- API BeerJSON validation: `services/api/src/beerjson/beerjsonValidator.ts`
- API recipe ext validation: `services/api/src/beerjson/recipeExtValidator.ts`
- API recipe persistence: `services/api/src/services/recipesService.ts`
- Web BeerJSON/editor mapping: `apps/web/app/recipes/_lib/beerjsonRecipe.ts`

