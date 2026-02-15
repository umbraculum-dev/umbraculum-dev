## Mash pH model (v0 vs v1)

This app has two mash pH estimators:

- **v0**: `POST /api/water-calc/mash-ph-estimate`
  - Inputs: `amountKg`, `colorLovibond`, `maltClass` (4-bucket classification)
  - Status: legacy; kept for regression and fallback

- **v1 (experimental)**: `POST /api/water-calc/mash-ph-estimate-v1`
  - Inputs: `amountKg`, plus two per-fermentable parameters:
    - **DI mash pH** (`mashDiPh`): distilled-water mash pH (room temp, ~20–25°C)
    - **Titratable acidity to pH 5.7** (`mashTaToPh57_mEqPerKg`): Troester-style TA in **mEq/kg**
  - Status: accuracy-first direction; designed to support canonical DB defaults + per-recipe overrides

The mash water page will **prefer v1** automatically when any grist row includes `mashDiPh` and/or `mashTaToPh57_mEqPerKg`, otherwise it falls back to v0.

## Why we snapshot parameters into recipes

We snapshot DI pH + TA into `Recipe.gristJson` at save-time so results **don’t silently change** when the canonical ingredient database is updated.

- If a row has an `ingredientId` and the user did **not** override DI pH/TA, the API will fill these parameters from:
  1) the canonical `Fermentable` record (if values exist), else
  2) inferred defaults (`getMashPhModelDefaultsV1`) based on BeerProto-like group/type/name (+ dehusked inference).
- If the user sets DI pH and/or TA in the recipe editor, those values are treated as **overrides** and are what gets snapshotted.

## Parameter meanings and units

- **`mashDiPh`**:
  - Unit: pH (0–14), room temperature
  - Meaning: the mash pH you’d expect in distilled water (baseline for the grist)

- **`mashTaToPh57_mEqPerKg`**:
  - Unit: **mEq/kg**
  - Meaning: titratable acidity required to bring a mash slurry to pH 5.7 (Troester-style modeling parameter)

These are not usually present on malt spec sheets; for v1 we rely on conservative defaults by ingredient group, with user override support.

## v1 estimator (high level)

`mashPhEstimateV1`:

- Uses a **weighted average** of per-row `mashDiPh` as the baseline DI mash pH (falls back to 5.76 when unknown).
- Computes specialty malt acidity from TA:
  - `totalAcidity_mEq = Σ(amountKg * mashTaToPh57_mEqPerKg)`
- Applies a BrunWater-style normalization for mash thickness and alkalinity, producing `netAcidity_mEqPerL`.
- Converts `netAcidity_mEqPerL` into an estimated mash pH via a simple linear slope (currently shared with v0 for continuity).

## Known limitations (v1)

- This is still an empirical model. It will need calibration once we have real measured data for more malts.
- TA/DI pH are approximations; “dehusked” inference is intentionally conservative.
- Temperature effects and specific grist buffering behavior are not modeled yet.

## Developer notes

- Defaults + inference live in `services/api/src/domain/waterCalc/mashPhDefaultsV1.ts`.
- v1 estimator lives in `services/api/src/domain/waterCalc/mashPhEstimateV1.ts`.
- Recipe snapshot enrichment lives in `services/api/src/services/recipesService.ts` (`snapshotGristRows`).

