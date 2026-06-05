import { isObject } from "../../lib/typeGuards.js";
import type {
  BeerJsonDoc,
  FermentableNode,
  HopNode,
  CultureNode,
  MashNode,
  MashStepNode,
  MiscNode,
  ParsedRecipeStepContext,
  RecipeExtLoose,
  RecipeNode,
  WaterSettingsLoose,
} from "./brewSessionStepSeedingTypes.js";

export const toFiniteNumber = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

export const filterObjects = <T,>(v: unknown): T[] =>
  Array.isArray(v) ? (v.filter((x) => isObject(x)) as T[]) : [];

export const extractMashStepMinutes = (s: MashStepNode): number => {
  const rawStepTime = s.step_time;
  if (isObject(rawStepTime)) {
    const unit = typeof rawStepTime["unit"] === "string" ? rawStepTime["unit"].trim().toLowerCase() : "";
    const value = toFiniteNumber(rawStepTime["value"]);
    if (value == null) return 0;
    if (!unit || unit.startsWith("min")) return Math.max(0, Math.round(value));
    if (unit.startsWith("h")) return Math.max(0, Math.round(value * 60));
    return 0;
  }

  const direct = toFiniteNumber(rawStepTime);
  if (direct != null) return Math.max(0, Math.round(direct));

  const rawDuration = s.duration;
  if (isObject(rawDuration)) {
    const unit = typeof rawDuration["unit"] === "string" ? rawDuration["unit"].trim().toLowerCase() : "";
    const value = toFiniteNumber(rawDuration["value"]);
    if (value == null) return 0;
    if (!unit || unit.startsWith("min")) return Math.max(0, Math.round(value));
    if (unit.startsWith("h")) return Math.max(0, Math.round(value * 60));
    return 0;
  }

  return 0;
};

export function parseRecipeStepContext(args: {
  beerJsonRecipeJson: unknown;
  recipeExtJson: unknown;
  waterSettings: unknown;
}): ParsedRecipeStepContext {
  const d: BeerJsonDoc = isObject(args.beerJsonRecipeJson) ? args.beerJsonRecipeJson : {};
  const recipesArr = Array.isArray(d.beerjson?.recipes) ? d.beerjson.recipes : [];
  const r0: RecipeNode | null = isObject(recipesArr[0]) ? recipesArr[0] : null;
  const ing = r0?.ingredients ?? {};
  const ext: RecipeExtLoose | null = isObject(args.recipeExtJson) ? args.recipeExtJson : null;

  const boilTimeMinutes =
    ext && typeof ext.boilTimeMinutesOverride === "number" && Number.isFinite(ext.boilTimeMinutesOverride)
      ? ext.boilTimeMinutesOverride
      : 60;
  const boilBaseStepId = crypto.randomUUID();

  const fermentables = filterObjects<FermentableNode>(ing.fermentable_additions);
  const hops = filterObjects<HopNode>(ing.hop_additions);
  const cultures = filterObjects<CultureNode>(ing.culture_additions);
  const misc = filterObjects<MiscNode>(ing.miscellaneous_additions);
  const mash: MashNode | null = isObject(r0?.mash) ? r0.mash : null;
  const mashStepsRaw: MashStepNode[] = mash
    ? filterObjects<MashStepNode>(mash.mash_steps).length > 0
      ? filterObjects<MashStepNode>(mash.mash_steps)
      : filterObjects<MashStepNode>(mash.mashSteps)
    : [];

  const hasBoilHops = hops.some(
    (h) =>
      (typeof h.timing?.use === "string" && h.timing.use === "add_to_boil") ||
      (typeof h.brewery_app_use === "string" && (h.brewery_app_use === "boil" || h.brewery_app_use === "whirlpool")),
  );
  const hasBoilMiscWithTiming = misc.some((m) => {
    if (typeof m.timing?.use !== "string" || m.timing.use !== "add_to_boil") return false;
    const fromDuration = m.timing.duration?.unit === "min" && Number.isFinite(Number(m.timing.duration?.value));
    const fromTime = m.timing.time != null && Number.isFinite(Number(m.timing.time));
    return fromDuration || fromTime;
  });

  const mashScheduleSteps = mashStepsRaw
    .filter((s) => typeof s.name === "string" && s.name.trim().length > 0)
    .filter((s) => !(typeof s.type === "string" && s.type === "sparge"))
    .map((s) => {
      const name = String(s.name).trim();
      const minutes = extractMashStepMinutes(s);
      return { name, minutes };
    });

  const waterSettings: WaterSettingsLoose | null = isObject(args.waterSettings) ? args.waterSettings : null;

  return {
    boilTimeMinutes,
    boilBaseStepId,
    fermentables,
    hops,
    cultures,
    misc,
    mashScheduleSteps,
    hasBoilHops,
    hasBoilMiscWithTiming,
    waterSettings,
  };
}
