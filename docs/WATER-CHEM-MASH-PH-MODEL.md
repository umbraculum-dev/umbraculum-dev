## Mash pH model

This app uses a single mash pH estimator:

- `POST /api/water-calc/mash-ph-estimate`
  - Inputs (canonical): `amountKg`, plus two per-fermentable parameters:
    - **DI mash pH** (`mashDiPh`): distilled-water mash pH (room temp, ~20–25°C)
    - **Titratable acidity to pH 5.7** (`mashTaToPh57_mEqPerKg`): Troester-style TA in **mEq/kg**
  - Back-compat: if a caller provides the older `maltClass` + `colorLovibond` fields, the API derives v1 defaults.

## References (Troester/Braukaiser + Palmer/RA)

- **Braukaiser PDF (effect of water and grist on mash pH)**:
  - Online: `https://braukaiser.com/documents/effect_of_water_and_grist_on_mash_pH.pdf`
  - Local mirror (if the website is unreachable): `docs/calculators/effect_of_water_and_grist_on_mash_pH.pdf`

## Approach comparison: Palmer (RA) vs Troester/Braukaiser (TA + DI pH)

Both approaches aim to help brewers predict and control mash pH, but they model different things.

- **Palmer / Kolbach (Residual Alkalinity, RA)**:
  - **Idea**: estimate how “alkaline” the water will behave in the mash after calcium/magnesium effects.
  - **Strength**: simple, familiar, quick sanity-check (especially for “pale vs dark” thinking).
  - **Limitations**: RA alone does not capture grist-specific buffering/acidity differences well (e.g. roasted vs crystal vs dehusked roasted).

- **Troester/Braukaiser-style (Titratable acidity + DI mash pH)**:
  - **Idea**: treat grist as having a baseline mash pH (DI mash pH) plus an acidity/buffering parameter measured by titration (TA to a reference pH; we use pH 5.7).
  - **Strength**: more directly expresses malt-to-malt differences in mash pH impact, and supports explicit overrides.
  - **Limitations**: TA/DI pH are rarely available per SKU; defaults are proxies unless you measure or curate values.

**Does one build on the other?** Not exactly. RA is a water-centric heuristic; TA/DI pH is a grist+water parameterization that can model cases RA can’t distinguish.

## Why we snapshot parameters into recipes

We snapshot DI pH + TA per fermentable row so results **don’t silently change** when the canonical ingredient database is updated.

In the BeerJSON-first model, we store:
- Canonical ingredients in `Recipe.beerJsonRecipeJson` (BeerJSON document)
- App-specific overrides and internal parameters in `Recipe.recipeExtJson` (versioned)

Behavior:
- If a fermentable row is linked to a canonical ingredient and the user did **not** override DI pH/TA, the app can fill defaults from the canonical ingredient database (when available) or inferred defaults.
- If the user sets DI pH and/or TA in the recipe editor, those values are treated as **overrides** and are stored on the recipe (so the recipe stays stable over time).

## Parameter meanings and units

- **`mashDiPh`**:
  - Unit: pH (0–14), room temperature
  - Meaning: the mash pH you’d expect in distilled water (baseline for the grist)

- **`mashTaToPh57_mEqPerKg`**:
  - Unit: **mEq/kg**
  - Meaning: titratable acidity required to bring a mash slurry to pH 5.7 (Troester-style modeling parameter)

These are not usually present on malt spec sheets; for v1 we rely on conservative defaults by ingredient group, with user override support.

### Roasted malts: dehusked/de-bittered and color-proxy defaults

Roasted malts have an important special case: **dehusked / de-bittered** products (e.g. Carafa Special).

- We treat dehusked/de-bittered roasted malts differently because **color is not a reliable proxy** for their mash pH effect.
- To “tell reality”, we store an additional optional field per fermentable row:
  - **`mashRoastDehuskedOverride`**: boolean (or null). If set, the user is explicitly forcing husked vs dehusked behavior for that fermentable row.
  - Provenance/source can be tracked internally (inferred vs override) as needed, but it is not required for v1 correctness.

For **non-dehusked** roasted malts, the v1 default TA uses a **weak saturating color proxy** (EBC), rather than a flat constant. This provides gentle differentiation between “dark” and “very dark” roasted malts while preventing runaway linear growth at extreme colors.

## Residual alkalinity (RA) appendix (Palmer/Kolbach)

We plan to surface RA as a **secondary recap metric** because many brewers are familiar with it (and tools like BrewersFriend often show RA-style summaries). RA should be presented as a **rule-of-thumb** check, not as the core mash pH predictor.

### Definitions and unit conventions

- **Alkalinity**: typically reported as **mg/L as CaCO₃** (a.k.a. “ppm as CaCO₃”).
- **Calcium/Magnesium**: often reported as **mg/L of the element** (Ca, Mg).
- **Hardness as CaCO₃** conversions:
  - `CaHardness_asCaCO3 = Ca_mgL * 2.497`
  - `MgHardness_asCaCO3 = Mg_mgL * 4.116`

### Kolbach/Palmer-style RA (as mg/L as CaCO₃)

One common expression is:

- `RA_asCaCO3 = Alkalinity_asCaCO3 - (CaHardness_asCaCO3 / 3.5) - (MgHardness_asCaCO3 / 7)`

With elemental Ca/Mg mg/L substituted directly, this becomes:

- `RA_asCaCO3 = Alkalinity_asCaCO3 - (0.713 * Ca_mgL) - (0.588 * Mg_mgL)`

### “Style expected RA” (heuristic)

There are two reasonable ways to implement this later:

- **Style table**: map style families to an RA range (explicit targets; simplest to explain).
- **Color-based guideline**: approximate an RA range from beer color (SRM/EBC), with clear caveats (dehusked malts, unusual grists, etc.).

## Water correction tables: conventions and precision

Our water management pages show “ion tables” at different stages (mixed water, after salts, after salts + acid, overall snapshots). These tables are intended to be the **most precise summary possible under the model we are using**, while staying consistent across mash/sparge (and future boil/kettle additions).

### Alkalinity vs bicarbonate in tables

- **Alkalinity (ppm as CaCO₃)** is a measure of **acid-neutralizing capacity** (ANC) relative to a standard endpoint (commonly near pH 4.3).
- Alkalinity can be **negative** after acidification. This does not mean “impossible water”; it indicates **mineral acidity** (the sample would require base to reach the endpoint).
- **Bicarbonate concentration (ppm as HCO₃⁻) cannot be negative** as a reported/speciated concentration, even though alkalinity can be negative.

We therefore follow this reporting rule for ion tables:

- We treat **final alkalinity** (ppm as CaCO₃) as the source of truth.
- When we show **HCO₃** in an “after acid” ion table, it is a **display proxy** derived from alkalinity:
  - `HCO3_ppm_proxy = max(0, Alkalinity_asCaCO3 * 61/50)`
  - If alkalinity is negative, HCO₃ in the table is clamped to **0** and the negative alkalinity is still shown elsewhere (e.g. “Final alkalinity”).

Reference guidance:
- USGS notes that carbonate/bicarbonate/hydroxide concentrations cannot be negative, while alkalinity/ANC can be negative and indicates mineral acidity: `https://or.water.usgs.gov/alk/reporting.html`

### What “after salts” vs “after salts + acid” means

- **After salts**: a mass-balance ion summary from salt additions (Ca/Mg/Na/SO4/Cl/HCO3). This is “ppm bookkeeping”.
- **After salts + acid**: combines:
  - the **salt ion profile**, plus
  - acid **counter-ion contributions** (SO₄ from sulfuric, Cl from hydrochloric), plus
  - alkalinity-driven **HCO₃ proxy** derived from the acid solver’s `finalAlkalinityPpmCaCO3` (clamped to >= 0).

### Known limitations (tables)

- We do **not** attempt full carbonate speciation at arbitrary pH/CO₂ conditions for the displayed ion tables.
- “HCO₃” shown after acidification is an **alkalinity-equivalent proxy**, not a full equilibrium species calculation.

## Estimator (high level)

`mashPhEstimateV1`:

- Uses a **weighted average** of per-row `mashDiPh` as the baseline DI mash pH (falls back to 5.76 when unknown).
- Computes specialty malt acidity from TA:
  - `totalAcidity_mEq = Σ(amountKg * mashTaToPh57_mEqPerKg)`
- Applies a BrunWater-style normalization for mash thickness and alkalinity, producing `netAcidity_mEqPerL`.
- **RA-like Ca/Mg effect (heuristic)**: before converting alkalinity into charge, we compute an **effective alkalinity**:
  - `effectiveAlk_asCaCO3 = max(0, alkalinity_asCaCO3 - 0.713*Ca_mgL - 0.588*Mg_mgL)`
  - This is an intentional, modest “calcium/magnesium makes water behave less alkaline in the mash” adjustment.
  - It affects **predicted mash pH** (v0 + v1) and the **acid-to-target-mash-pH** solver, but **not** the standalone water-acidification pH solver.
- Converts `netAcidity_mEqPerL` into an estimated mash pH via a simple linear slope (currently shared with v0 for continuity).

## Known limitations (v1)

- This is still an empirical model. It will need calibration once we have real measured data for more malts.
- TA/DI pH are approximations; “dehusked/de-bittered” detection is inferred unless explicitly overridden.
- Temperature effects and specific grist buffering behavior are not modeled yet.

## Developer notes

- Defaults + inference live in `services/api/src/domain/waterCalc/mashPhDefaultsV1.ts`.
- v1 estimator lives in `services/api/src/domain/waterCalc/mashPhEstimateV1.ts`.
- Recipe-side overrides live in `Recipe.recipeExtJson` (see `docs/BEERJSON-FIRST.md`).

