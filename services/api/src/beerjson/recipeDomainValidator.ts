import { BadRequestError } from "../errors.js";

type BeerJsonMassUnit = "kg" | "g";
type BeerJsonVolumeUnit = "l" | "ml";

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function readMassKg(amount: any): number | null {
  const unit = amount?.unit;
  const value = amount?.value;
  if (!isFiniteNumber(value)) return null;
  if (unit === "kg") return value;
  if (unit === "g") return value / 1000;
  return null;
}

function readMassGrams(amount: any): number | null {
  const unit = amount?.unit;
  const value = amount?.value;
  if (!isFiniteNumber(value)) return null;
  if (unit === "g") return value;
  if (unit === "kg") return value * 1000;
  return null;
}

function readVolumeLiters(amount: any): number | null {
  const unit = amount?.unit;
  const value = amount?.value;
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
  const d = (doc ?? {}) as any;
  const r0 = d?.beerjson?.recipes?.[0];
  if (!r0 || typeof r0 !== "object") {
    throw new BadRequestError("invalid_beerjson_recipe", "BeerJSON is missing beerjson.recipes[0]");
  }

  const ing = r0.ingredients ?? {};

  const fermentables = asArray<any>(ing.fermentable_additions);
  for (let idx = 0; idx < fermentables.length; idx += 1) {
    const f = fermentables[idx];
    const name = typeof f?.name === "string" ? f.name.trim() : "";
    if (!name) {
      throw new BadRequestError(
        "invalid_grist_row_name",
        `BeerJSON.ingredients.fermentable_additions[${idx}].name is required`,
      );
    }

    const amountKg = readMassKg(f?.amount);
    if (amountKg === null) {
      const unit = typeof f?.amount?.unit === "string" ? f.amount.unit : null;
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

    const color = f?.color;
    if (color !== undefined && color !== null) {
      const colorUnit = color?.unit;
      const colorValue = color?.value;
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

  const hops = asArray<any>(ing.hop_additions);
  for (let idx = 0; idx < hops.length; idx += 1) {
    const h = hops[idx];
    const name = typeof h?.name === "string" ? h.name.trim() : "";
    if (!name) {
      throw new BadRequestError(
        "invalid_hop_row_name",
        `BeerJSON.ingredients.hop_additions[${idx}].name is required`,
      );
    }

    const amountGrams = readMassGrams(h?.amount);
    if (amountGrams === null) {
      const unit = typeof h?.amount?.unit === "string" ? h.amount.unit : null;
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

  const cultures = asArray<any>(ing.culture_additions);
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

  const misc = asArray<any>(ing.miscellaneous_additions);
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
    const amount = m?.amount;
    const unit = amount?.unit;
    const value = amount?.value;
    if (!isFiniteNumber(value) || typeof unit !== "string") {
      throw new BadRequestError(
        "invalid_misc_row_amount",
        `BeerJSON.ingredients.miscellaneous_additions[${idx}].amount is required`,
      );
    }

    const asLiters = readVolumeLiters(amount);
    const asKg = readMassKg(amount);
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

