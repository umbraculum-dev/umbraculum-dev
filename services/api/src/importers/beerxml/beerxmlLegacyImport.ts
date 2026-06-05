import { isObject } from "../../lib/typeGuards.js";

import { normMaltClass, normMiscType, normMiscUse, normUseHop } from "./beerxmlNormalize.js";
import { asArray, newId, toNumber } from "./beerxmlParse.js";
import type {
  BeerXmlGristRow,
  BeerXmlHopRow,
  BeerXmlMiscRow,
  BeerXmlRecipe,
  BeerXmlYeastRow,
  ImportWarning,
  LegacyImportResult,
  StyleCandidate,
} from "./beerxmlTypes.js";

export function extractStyleCandidateFromBeerXmlRecipe(recipe: BeerXmlRecipe): StyleCandidate | null {
  const style = isObject(recipe["STYLE"]) ? recipe["STYLE"] : null;
  if (!style) return null;

  const nameRaw = typeof style["NAME"] === "string" ? style["NAME"].trim() : "";
  const category = typeof style["CATEGORY"] === "string" ? style["CATEGORY"].trim() : "";

  const categoryNumberRaw = style["CATEGORY_NUMBER"];
  const categoryNumber =
    typeof categoryNumberRaw === "number" && Number.isFinite(categoryNumberRaw)
      ? String(categoryNumberRaw)
      : typeof categoryNumberRaw === "string"
        ? categoryNumberRaw.trim()
        : "";

  const styleLetter = typeof style["STYLE_LETTER"] === "string" ? style["STYLE_LETTER"].trim() : "";
  const code = categoryNumber && styleLetter ? `${categoryNumber}${styleLetter}` : "";

  const name = nameRaw || (category && code ? `${category} ${code}` : category || "");

  if (!name && !code) return null;
  return { name: name || null, code: code || null };
}

export function importBeerXmlRecipeToLegacy(recipe: BeerXmlRecipe): LegacyImportResult {
  const warnings: ImportWarning[] = [];

  const recipeName = typeof recipe["NAME"] === "string" ? recipe["NAME"].trim() : "";
  if (!recipeName) throw new Error("BeerXML: recipe NAME is required");
  const notes = typeof recipe["NOTES"] === "string" ? recipe["NOTES"].trim() || null : null;

  const batchSizeLitersRaw = toNumber(recipe["BATCH_SIZE"]);
  if (batchSizeLitersRaw == null || !(batchSizeLitersRaw > 0)) {
    throw new Error("BeerXML: recipe BATCH_SIZE is required and must be > 0 (liters)");
  }
  const batchSizeLiters = batchSizeLitersRaw;

  const fermentablesContainer = isObject(recipe["FERMENTABLES"]) ? recipe["FERMENTABLES"] : null;
  const hopsContainer = isObject(recipe["HOPS"]) ? recipe["HOPS"] : null;
  const yeastsContainer = isObject(recipe["YEASTS"]) ? recipe["YEASTS"] : null;
  const miscsContainer = isObject(recipe["MISCS"]) ? recipe["MISCS"] : null;
  const fermentables = asArray<unknown>(fermentablesContainer?.["FERMENTABLE"]).filter((f): f is BeerXmlRecipe =>
    isObject(f),
  );
  const hops = asArray<unknown>(hopsContainer?.["HOP"]).filter((h): h is BeerXmlRecipe => isObject(h));
  const yeasts = asArray<unknown>(yeastsContainer?.["YEAST"]).filter((y): y is BeerXmlRecipe => isObject(y));
  const miscs = asArray<unknown>(miscsContainer?.["MISC"]).filter((m): m is BeerXmlRecipe => isObject(m));

  const gristJson: BeerXmlGristRow[] = fermentables
    .map((f) => {
      const name = typeof f["NAME"] === "string" ? f["NAME"].trim() : "";
      const amountKg = toNumber(f["AMOUNT"]);
      if (!name || amountKg == null) {
        warnings.push({
          code: "fermentable_skipped",
          message: `Skipped fermentable missing NAME/AMOUNT: ${String(name)}`,
        });
        return null;
      }
      const colorLovibond = toNumber(f["COLOR"]);
      const yieldPercent = toNumber(f["YIELD"]);
      const potential =
        yieldPercent != null ? ({ kind: "yieldPercent", value: yieldPercent } as const) : null;
      const typeRaw = typeof f["TYPE"] === "string" ? f["TYPE"] : null;
      const addAfterBoilRaw =
        typeof f["ADD_AFTER_BOIL"] === "string" ? f["ADD_AFTER_BOIL"].trim().toUpperCase() : "";
      const addAfterBoil = addAfterBoilRaw === "TRUE" || addAfterBoilRaw === "1" || addAfterBoilRaw === "YES";
      return {
        id: newId(),
        name,
        amountKg,
        colorLovibond: colorLovibond != null ? colorLovibond : null,
        potential,
        maltClass: normMaltClass(typeRaw),
        addAfterBoil: addAfterBoil || undefined,
      } as BeerXmlGristRow;
    })
    .filter((g): g is BeerXmlGristRow => g != null);

  const hopsJson: BeerXmlHopRow[] = hops
    .map((h) => {
      const name = typeof h["NAME"] === "string" ? h["NAME"].trim() : "";
      const amountKg = toNumber(h["AMOUNT"]);
      if (!name || amountKg == null) {
        warnings.push({
          code: "hop_skipped",
          message: `Skipped hop missing NAME/AMOUNT: ${String(name)}`,
        });
        return null;
      }
      const alpha = toNumber(h["ALPHA"]);
      const timeMinutes = toNumber(h["TIME"]);
      const use = normUseHop(typeof h["USE"] === "string" ? h["USE"] : null);
      return {
        id: newId(),
        name,
        amountGrams: amountKg * 1000,
        alphaAcidPercent: alpha != null ? alpha : null,
        use,
        timeMinutes: timeMinutes != null ? timeMinutes : null,
      } as BeerXmlHopRow;
    })
    .filter((h): h is BeerXmlHopRow => h != null);

  const yeastJson: BeerXmlYeastRow[] = yeasts
    .map((y) => {
      const name = typeof y["NAME"] === "string" ? y["NAME"].trim() : "";
      if (!name) {
        warnings.push({ code: "yeast_skipped", message: "Skipped yeast missing NAME" });
        return null;
      }
      const lab = typeof y["LABORATORY"] === "string" ? y["LABORATORY"].trim() || null : null;
      const productId = typeof y["PRODUCT_ID"] === "string" ? y["PRODUCT_ID"].trim() || null : null;
      const attenuation = toNumber(y["ATTENUATION"]);
      return {
        id: newId(),
        name,
        lab,
        productId,
        attenuationMin: attenuation != null ? attenuation : null,
        attenuationMax: attenuation != null ? attenuation : null,
      } as BeerXmlYeastRow;
    })
    .filter((y): y is BeerXmlYeastRow => y != null);

  const miscJson: BeerXmlMiscRow[] = miscs
    .map((m) => {
      const name = typeof m["NAME"] === "string" ? m["NAME"].trim() : "";
      const amount = toNumber(m["AMOUNT"]);
      if (!name || amount == null) {
        warnings.push({
          code: "misc_skipped",
          message: `Skipped misc missing NAME/AMOUNT: ${String(name)}`,
        });
        return null;
      }
      const type = normMiscType(typeof m["TYPE"] === "string" ? m["TYPE"] : null);
      const use = normMiscUse(typeof m["USE"] === "string" ? m["USE"] : null);
      const timeMinutes = toNumber(m["TIME"]);
      const useFor = typeof m["USE_FOR"] === "string" ? m["USE_FOR"].trim() || null : null;
      const miscNotes = typeof m["NOTES"] === "string" ? m["NOTES"].trim() || null : null;
      const amountIsWeightRaw =
        typeof m["AMOUNT_IS_WEIGHT"] === "string" ? m["AMOUNT_IS_WEIGHT"].trim().toLowerCase() : null;
      const amountIsWeight = amountIsWeightRaw === "false" ? false : true;

      return {
        id: newId(),
        name,
        type,
        use,
        timeMinutes: timeMinutes != null ? timeMinutes : null,
        amount,
        amountIsWeight,
        useFor,
        notes: miscNotes,
      } as BeerXmlMiscRow;
    })
    .filter((m): m is BeerXmlMiscRow => m != null);

  if (gristJson.length === 0) {
    warnings.push({
      code: "no_fermentables",
      message: "No fermentables found in BeerXML; recipe will import with an empty grist.",
    });
  }

  return { recipeName, notes, batchSizeLiters, gristJson, hopsJson, yeastJson, miscJson, warnings };
}
