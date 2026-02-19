import {
  isMassUnitV1,
  isVolumeUnitV1,
  massToGrams,
  massToKg,
  volumeToLiters,
  type UnitConversionWarningV1,
} from "@brewery/core";

function safeNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function warnNormalized(warnings: UnitConversionWarningV1[], args: { path: string; fromUnit: string; toUnit: string }) {
  warnings.push({ code: "unit_normalized", path: args.path, fromUnit: args.fromUnit, toUnit: args.toUnit });
}

function warnUnsupported(warnings: UnitConversionWarningV1[], args: { path: string; fromUnit: string; toUnit: string }) {
  warnings.push({ code: "unsupported_unit", path: args.path, fromUnit: args.fromUnit, toUnit: args.toUnit });
}

/**
 * Normalize supported BeerJSON units into canonical metric units.
 *
 * Canonical targets (v1):
 * - batch_size: liters (`l`)
 * - fermentable_additions[*].amount: kilograms (`kg`)
 * - hop_additions[*].amount: grams (`g`)
 * - miscellaneous_additions[*].amount:
 *   - if mass: kilograms (`kg`)
 *   - if volume: liters (`l`)
 *
 * This function mutates `doc` in-place and returns warnings describing conversions.
 */
export function normalizeBeerJsonRecipeUnits(doc: unknown): { normalized: unknown; warnings: UnitConversionWarningV1[] } {
  const warnings: UnitConversionWarningV1[] = [];
  const d = (doc ?? {}) as any;
  const r0 = d?.beerjson?.recipes?.[0];
  if (!r0 || typeof r0 !== "object") return { normalized: doc, warnings };

  const batch = r0.batch_size;
  if (batch && typeof batch === "object") {
    const unit = typeof batch.unit === "string" ? batch.unit : "";
    const value = safeNum(batch.value);
    if (value != null && isVolumeUnitV1(unit)) {
      const liters = volumeToLiters(value, unit);
      if (liters != null && liters > 0) {
        if (unit !== "l") warnNormalized(warnings, { path: "beerjson.recipes[0].batch_size", fromUnit: unit, toUnit: "l" });
        batch.unit = "l";
        batch.value = liters;
      }
    } else if (unit) {
      warnUnsupported(warnings, { path: "beerjson.recipes[0].batch_size", fromUnit: unit, toUnit: "l" });
    }
  }

  const ing = r0.ingredients ?? {};

  const ferms = asArray<any>(ing.fermentable_additions);
  for (let idx = 0; idx < ferms.length; idx += 1) {
    const f = ferms[idx];
    const amount = f?.amount;
    if (!amount || typeof amount !== "object") continue;
    const unit = typeof amount.unit === "string" ? amount.unit : "";
    const value = safeNum(amount.value);
    if (value == null || !unit) continue;
    if (isMassUnitV1(unit)) {
      const kg = massToKg(value, unit);
      if (kg != null && kg > 0) {
        if (unit !== "kg") warnNormalized(warnings, { path: `beerjson.recipes[0].ingredients.fermentable_additions[${idx}].amount`, fromUnit: unit, toUnit: "kg" });
        amount.unit = "kg";
        amount.value = kg;
      }
    } else {
      warnUnsupported(warnings, {
        path: `beerjson.recipes[0].ingredients.fermentable_additions[${idx}].amount`,
        fromUnit: unit,
        toUnit: "kg",
      });
    }
  }

  const hops = asArray<any>(ing.hop_additions);
  for (let idx = 0; idx < hops.length; idx += 1) {
    const h = hops[idx];
    const amount = h?.amount;
    if (!amount || typeof amount !== "object") continue;
    const unit = typeof amount.unit === "string" ? amount.unit : "";
    const value = safeNum(amount.value);
    if (value == null || !unit) continue;
    if (isMassUnitV1(unit)) {
      const grams = massToGrams(value, unit);
      if (grams != null && grams >= 0) {
        if (unit !== "g") warnNormalized(warnings, { path: `beerjson.recipes[0].ingredients.hop_additions[${idx}].amount`, fromUnit: unit, toUnit: "g" });
        amount.unit = "g";
        amount.value = grams;
      }
    } else {
      warnUnsupported(warnings, {
        path: `beerjson.recipes[0].ingredients.hop_additions[${idx}].amount`,
        fromUnit: unit,
        toUnit: "g",
      });
    }
  }

  const misc = asArray<any>(ing.miscellaneous_additions);
  for (let idx = 0; idx < misc.length; idx += 1) {
    const m = misc[idx];
    const amount = m?.amount;
    if (!amount || typeof amount !== "object") continue;
    const unit = typeof amount.unit === "string" ? amount.unit : "";
    const value = safeNum(amount.value);
    if (value == null || !unit) continue;

    if (isMassUnitV1(unit)) {
      const kg = massToKg(value, unit);
      if (kg != null && kg > 0) {
        if (unit !== "kg") warnNormalized(warnings, { path: `beerjson.recipes[0].ingredients.miscellaneous_additions[${idx}].amount`, fromUnit: unit, toUnit: "kg" });
        amount.unit = "kg";
        amount.value = kg;
      }
      continue;
    }
    if (isVolumeUnitV1(unit)) {
      const liters = volumeToLiters(value, unit);
      if (liters != null && liters > 0) {
        if (unit !== "l") warnNormalized(warnings, { path: `beerjson.recipes[0].ingredients.miscellaneous_additions[${idx}].amount`, fromUnit: unit, toUnit: "l" });
        amount.unit = "l";
        amount.value = liters;
      }
      continue;
    }

    warnUnsupported(warnings, {
      path: `beerjson.recipes[0].ingredients.miscellaneous_additions[${idx}].amount`,
      fromUnit: unit,
      toUnit: "kg|l",
    });
  }

  return { normalized: doc, warnings };
}

