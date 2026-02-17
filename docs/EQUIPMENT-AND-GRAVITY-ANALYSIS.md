# Equipment and gravity analysis (v0)

This document describes the current (v0) “equipment + analysis” implementation for:

- volumes (kettle and pre-boil)
- gravity estimates (OG, FG, PBG)
- ABV estimate
- yeast attenuation selection (including user overrides)

This is intentionally **best-effort** and explainable. It is **not** a full brew process model yet.

## Storage: `recipeExtJson` (v1)

We store equipment and overrides on the recipe as internal extensions:

- `recipeExtJson.equipment`
  - `kettle.*`
  - `mash.*`
  - `misc.*`
- `recipeExtJson.equipmentSource`
  - `{ equipmentProfileId: string; copiedAt: string }`
  - records which account-level equipment template was copied into `equipment` (snapshot provenance)
- `recipeExtJson.yeastAttenuationOverridesPercent`
  - `{ [yeastRowId: string]: number }`
  - keys are BeerJSON culture addition IDs (`beerjson.recipes[0].ingredients.culture_additions[*].id`)

Validation lives in `services/api/src/beerjson/recipeExtValidator.ts`.

## Equipment templates (account-scoped)

Equipment templates are stored per account and selected by recipes via snapshot copy:

- DB model: `EquipmentProfile` (`services/api/prisma/schema.prisma`) mapped to `equipment_profiles`
- API:
  - `GET /api/equipment-profiles` (active account required)
  - `POST /api/equipment-profiles` (admin-only)
  - `PATCH /api/equipment-profiles/:id` (admin-only)
  - `DELETE /api/equipment-profiles/:id` (admin-only)
- Web:
  - Company-wide templates page: `apps/web/app/[locale]/equipment/page.tsx`
  - Recipe selection lives in the recipe editor section `#equipment` (`apps/web/app/recipes/[id]/edit/page.tsx`)

Semantics:

- Selecting a template copies values into `recipeExtJson.equipment`
- `recipeExtJson.equipmentSource` is updated to record the template ID + copy time
- Templates are not “live linked”: editing a template does not change existing recipes unless the user explicitly reloads/applies it

## Derived outputs: `recipe.analysis`

The API computes a derived analysis payload (never stored in DB) and attaches it to:

- `GET /api/recipes/:id`

The calculator lives in:

- `services/api/src/domain/recipeAnalysis/gravityAnalysis.ts`

All values are `number | null`. `null` means “insufficient data”.

## Gravity model (v0)

### Inputs used

- fermentables: BeerJSON `fermentable_additions[*]`
  - amount: `kg` (or `g` converted to kg)
  - yield/potential:
    - `yield.potential` (`sg`), or
    - `yield.fine_grind` (`%`)
- efficiency:
  - preferred: `equipment.mash.mashEfficiencyPercent`
  - fallback: `recipeExtJson.brewhouseEfficiencyPercent`
  - fallback: BeerJSON `efficiency.brewhouse`
- volumes:
  - kettle volume: `equipment.kettle.kettleVolumeLiters` (required for OG)
  - pre-boil volume: derived (required for PBG)

### OG (estimated)

We compute gravity points from fermentables using a PPG-based approximation:

- if potential `sg`: \(PPG = (SG - 1) \cdot 1000\)
- if yield `%`: \(PPG = 46 \cdot (yield\\% / 100)\)

Then:

- \(points = \\frac{\\sum(PPG_i \\cdot lb_i)}{gal} \\cdot efficiency\)
- \(OG = 1 + points/1000\)

### PBG (pre-boil gravity, estimated)

Same numerator as OG, but uses **pre-boil volume** instead of kettle volume.

### FG (estimated)

Given OG and an effective yeast attenuation percent \(A\\):

- \(FG = 1 + (OG - 1) \\cdot (1 - A/100)\)

### ABV (estimated)

- \(ABV\\% \\approx (OG - FG) \\cdot 131.25\)

## Pre-boil volume derivation (v0)

We infer boil time from BeerJSON hop additions:

- max duration of hop additions with `timing.use = add_to_boil`
- default: 60 min

We then work backward from the kettle target volume using a simple model:

- add losses: kettle losses + hops absorption + misc “other losses”
  - hops absorption is computed as \(kettleHopsAbsorption(L/g) \times kettleHopMass(g)\) (using boil hop additions)
- undo cooling shrinkage (treated as a % applied to volume)
- undo evaporation (treated as a linear % per hour for the inferred boil time)

If evaporation inputs imply an invalid denominator (zero/negative volume), pre-boil volume becomes `null` and a warning is returned.

## Yeast attenuation selection (v0)

For each yeast row:

- effective attenuation = user override (if present) else BeerJSON attenuation (single % value)

Across multiple yeasts:

- sort effective attenuations descending
- take the top 2 (or 1 if only one yeast)
- average them

This produces `attenuationEffectivePercent`.

## Future improvements (tracked)

- Fermenter volume stage (post-kettle) and a clearer hot-side vs cold-side model
- Explicit boil time input (instead of inference)
- Persist attenuation min/max ranges for better uncertainty reporting
- Fermenter volume stage (post-kettle) and a clearer hot-side vs cold-side model

