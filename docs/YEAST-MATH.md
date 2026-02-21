# Yeast Math Reference

Internal reference for all yeast-related formulas used in the recipe editor.

## Overview

This document describes the formulas and constants used to compute estimated yeast cells and amount (volume or mass) for pitching. The calculations support liquid, slurry, and dry yeast formats, with overridable cell density defaults.

## Estimated Cells Needed (B)

**Formula:**

```
cells_B = batchSize_L × OG_plato × pitch_rate
```

**Definitions:**

- `batchSize_L` – Kettle or batch volume in liters (from `recipeExtJson.batchSizeLiters` or analysis kettle volume)
- `OG_plato` – Original gravity converted from SG to °Plato (degrees Plato)
- `pitch_rate` – Million cells per mL per °Plato (from preset key)
- `cells_B` – Billions of cells needed

**Pitch rate presets (million cells per mL per °Plato):**

| Key               | Value |
|-------------------|-------|
| mfg_rec_0_35_ales | 0.35  |
| mfg_rec_0_5_ales  | 0.5   |
| pro_0_75_ales     | 0.75  |
| pro_1_0_ales      | 1.0   |
| pro_1_25_ales     | 1.25  |
| pro_1_5_lager     | 1.5   |
| pro_1_75_lager    | 1.75  |
| pro_2_0_lager     | 2.0   |

## Amount (L) for Liquid / Slurry

**Formula:**

```
amount_L = cells_B / cells_per_L
```

**Default cell densities (B/L):**

- Liquid: 2150 (White Labs PurePitch Next Gen)
- Slurry: 1200 (typical harvested slurry)

**Overridable:** The user can override `cells_per_L` per yeast row via "Cells per L (overridable)". Stored in `recipeExtJson.yeastCellsPerLOverrides`.

## Amount (kg) for Dry

**Formula:**

```
amount_kg = cells_B / cells_per_kg
```

**Default cell density (B/kg):** 1500 (yeastman-derived from ~1.5 B/g × 1000 g/kg; dry yeast typically ~1–2 billion cells per gram)

**Overridable:** The user can override `cells_per_kg` per yeast row via "Cells per KG (overridable)". Stored in `recipeExtJson.yeastCellsPerKGOverrides`.

## Constants

| Constant              | Value | Description                                  |
|-----------------------|-------|----------------------------------------------|
| CELLS_PER_L_LIQUID    | 2150  | Default cells per liter for liquid yeast     |
| CELLS_PER_L_SLURRY    | 1200  | Default cells per liter for slurry           |
| CELLS_PER_KG_DRY      | 1500  | Default cells per kg for dry yeast           |

## Data Flow

```mermaid
flowchart LR
  subgraph Inputs
    batchSize[batchSizeLiters]
    analysisOg[OG from analysis]
    pitchRate[pitch rate preset]
    format[format: dry/liquid/slurry]
    cellsPerL[cellsPerL override]
    cellsPerKG[cellsPerKG override]
  end
  subgraph Calc
    cellsB[cells_B = batch × OG_plato × rate]
    amount[amount_L or amount_kg]
  end
  batchSize --> cellsB
  analysisOg --> cellsB
  pitchRate --> cellsB
  cellsB --> amount
  format --> amount
  cellsPerL --> amount
  cellsPerKG --> amount
  amount --> RowState[yeast row amountL or amountKg]
```

## Source of Defaults

Default cell density values are from yeastman. Overrides are allowed when the user has lab or manufacturer data for a specific product.
