import { BadRequestError } from "../errors.js";
import { isObject, isFiniteNumber } from "../lib/typeGuards.js";

type BeerJsonMassUnit = "kg" | "g";
type BeerJsonVolumeUnit = "l" | "ml";

type AmountNode = { unit?: unknown; value?: unknown };

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function readAmount(amount: unknown): AmountNode {
  return isObject(amount) ? (amount) : {};
}

function readMassKg(amount: unknown): number | null {
  const a = readAmount(amount);
  const { unit, value } = a;
  if (!isFiniteNumber(value)) return null;
  if (unit === "kg") return value;
  if (unit === "g") return value / 1000;
  return null;
}

function readMassGrams(amount: unknown): number | null {
  const a = readAmount(amount);
  const { unit, value } = a;
  if (!isFiniteNumber(value)) return null;
  if (unit === "g") return value;
  if (unit === "kg") return value * 1000;
  return null;
}

function readVolumeLiters(amount: unknown): number | null {
  const a = readAmount(amount);
  const { unit, value } = a;
  if (!isFiniteNumber(value)) return null;
  if (unit === "l") return value;
  if (unit === "ml") return value / 1000;
  return null;
}

/**
 * Validate the BeerJSON subset we treat as “supported and real” for recipes.
 *
 * This intentionally keeps **error codes stable** vs the previous legacy-row validators,
 * but uses BeerJSON paths in messages so errors are not confusing.
 */
export function validateBeerJsonRecipeDomain(doc: unknown): void {
  const beerjson = isObject(doc) && isObject(doc.beerjson) ? doc.beerjson : null;
  const recipes = beerjson && Array.isArray(beerjson.recipes) ? beerjson.recipes : [];
  const r0 = isObject(recipes[0]) ? recipes[0] : null;
  if (!r0) {
    throw new BadRequestError("invalid_beerjson_recipe", "BeerJSON is missing beerjson.recipes[0]");
  }

  const ing = isObject(r0.ingredients) ? r0.ingredients : {};

  const fermentables = asArray<Record<string, unknown>>(ing.fermentable_additions);
  for (let idx = 0; idx < fermentables.length; idx += 1) {
    const f = fermentables[idx];
    const name = typeof f?.name === "string" ? f.name.trim() : "";
    if (!name) {
      throw new BadRequestError(
        "invalid_grist_row_name",
        `BeerJSON.ingredients.fermentable_additions[${idx}].name is required`,
      );
    }

    const fAmount = readAmount(f?.amount);
    const amountKg = readMassKg(f?.amount);
    if (amountKg === null) {
      const unit = typeof fAmount.unit === "string" ? fAmount.unit : null;
      const allowed: BeerJsonMassUnit[] = ["kg", "g"];
      const unitNote = unit ? ` (unit=${unit})` : "";
      throw new BadRequestError(
        "invalid_grist_row_amount",
        `BeerJSON.ingredients.fermentable_additions[${idx}].amount must be a mass in ${allowed.join("|")}${unitNote}`,
      );
    }
    if (!(amountKg > 0)) {
      throw new BadRequestError(
        "invalid_grist_row_amount",
        `BeerJSON.ingredients.fermentable_additions[${idx}].amount.value must be > 0`,
      );
    }

    const color = isObject(f?.color) ? f.color : null;
    if (color !== null) {
      const colorUnit = color.unit;
      const colorValue = color.value;
      if (colorUnit === "Lovi" && isFiniteNumber(colorValue)) {
        if (!(colorValue >= 0)) {
          throw new BadRequestError(
            "invalid_grist_row_color",
            `BeerJSON.ingredients.fermentable_additions[${idx}].color.value must be >= 0`,
          );
        }
      }
    }
  }

  const hops = asArray<Record<string, unknown>>(ing.hop_additions);
  for (let idx = 0; idx < hops.length; idx += 1) {
    const h = hops[idx];
    const name = typeof h?.name === "string" ? h.name.trim() : "";
    if (!name) {
      throw new BadRequestError(
        "invalid_hop_row_name",
        `BeerJSON.ingredients.hop_additions[${idx}].name is required`,
      );
    }

    const hAmount = readAmount(h?.amount);
    const amountGrams = readMassGrams(h?.amount);
    if (amountGrams === null) {
      const unit = typeof hAmount.unit === "string" ? hAmount.unit : null;
      const allowed: BeerJsonMassUnit[] = ["kg", "g"];
      const unitNote = unit ? ` (unit=${unit})` : "";
      throw new BadRequestError(
        "invalid_hop_row_amount",
        `BeerJSON.ingredients.hop_additions[${idx}].amount must be a mass in ${allowed.join("|")}${unitNote}`,
      );
    }
    if (!(amountGrams >= 0)) {
      throw new BadRequestError(
        "invalid_hop_row_amount",
        `BeerJSON.ingredients.hop_additions[${idx}].amount.value must be >= 0`,
      );
    }
  }

  const cultures = asArray<Record<string, unknown>>(ing.culture_additions);
  for (let idx = 0; idx < cultures.length; idx += 1) {
    const c = cultures[idx];
    const name = typeof c?.name === "string" ? c.name.trim() : "";
    if (!name) {
      throw new BadRequestError(
        "invalid_yeast_row_name",
        `BeerJSON.ingredients.culture_additions[${idx}].name is required`,
      );
    }
  }

  const misc = asArray<Record<string, unknown>>(ing.miscellaneous_additions);
  for (let idx = 0; idx < misc.length; idx += 1) {
    const m = misc[idx];
    const name = typeof m?.name === "string" ? m.name.trim() : "";
    if (!name) {
      throw new BadRequestError(
        "invalid_misc_row_name",
        `BeerJSON.ingredients.miscellaneous_additions[${idx}].name is required`,
      );
    }

    // Misc additions can be weight or volume. We only enforce positivity.
    const mAmount = readAmount(m?.amount);
    const { unit, value } = mAmount;
    if (!isFiniteNumber(value) || typeof unit !== "string") {
      throw new BadRequestError(
        "invalid_misc_row_amount",
        `BeerJSON.ingredients.miscellaneous_additions[${idx}].amount is required`,
      );
    }

    const asLiters = readVolumeLiters(m?.amount);
    const asKg = readMassKg(m?.amount);
    if (asLiters === null && asKg === null) {
      const allowed: Array<BeerJsonMassUnit | BeerJsonVolumeUnit> = ["kg", "g", "l", "ml"];
      throw new BadRequestError(
        "invalid_misc_row_amount",
        `BeerJSON.ingredients.miscellaneous_additions[${idx}].amount.unit must be one of ${allowed.join("|")} (unit=${String(unit)})`,
      );
    }

    if (!(value > 0)) {
      throw new BadRequestError(
        "invalid_misc_row_amount",
        `BeerJSON.ingredients.miscellaneous_additions[${idx}].amount.value must be > 0`,
      );
    }
  }
}

