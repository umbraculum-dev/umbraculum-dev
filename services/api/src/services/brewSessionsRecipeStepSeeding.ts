import { isObject } from "../lib/typeGuards.js";
import { BrewdaySettingsService, DEFAULT_STEPS_SEED } from "./brewdaySettingsService.js";
import { RecipeWaterSettingsService } from "./recipeWaterSettingsService.js";

/**
 * Loose structural shapes for the BeerJSON document and related extension JSON
 * blobs that brew session step seeding walks. Each field is `unknown` (or a nested
 * shape with `unknown` leaves) so the parser is forced to type-narrow before
 * use, while avoiding both `any` and a full runtime validator. This is the
 * same pattern used in `packages/beerjson/src/index.ts`. A real Zod-style
 * validator is tracked as Phase 7 in `docs/LINTING.md` /
 * `docs/CONTRACTS-VALIDATION-STRATEGY.md`.
 */
type AmtUnit = { unit?: unknown; value?: unknown };
type FermentableNode = {
  name?: unknown;
  amount?: AmtUnit;
  brewery_app_late_addition?: unknown;
};
type HopNode = {
  name?: unknown;
  amount?: AmtUnit;
  brewery_app_use?: unknown;
  timing?: { use?: unknown; duration?: AmtUnit; time?: unknown };
};
type CultureNode = { name?: unknown };
type MiscNode = {
  name?: unknown;
  amount?: AmtUnit;
  timing?: { use?: unknown; duration?: AmtUnit; time?: unknown };
};
type MashStepNode = {
  name?: unknown;
  type?: unknown;
  step_time?: unknown;
  duration?: unknown;
};
type MashNode = {
  mash_steps?: unknown;
  mashSteps?: unknown;
};
type RecipeNode = {
  ingredients?: {
    fermentable_additions?: unknown;
    hop_additions?: unknown;
    culture_additions?: unknown;
    miscellaneous_additions?: unknown;
  };
  mash?: unknown;
};
type BeerJsonDoc = { beerjson?: { recipes?: unknown } };
type RecipeExtLoose = { boilTimeMinutesOverride?: unknown };
type WaterSettingsLoose = {
  mashWaterVolumeLiters?: unknown;
  mashSaltAdditionsJson?: unknown;
  mashLastAcidRequiredMl?: unknown;
  mashAcidType?: unknown;
  spargeVolumeLiters?: unknown;
  spargeMethodType?: unknown;
  spargeSaltAdditionsJson?: unknown;
  boilWaterVolumeLiters?: unknown;
};

export type RecipeDrivenStepSeed = {
  id?: string;
  sectionId: string;
  sectionName?: string | null;
  name: string;
  minutesPlanned?: number | null;
  relativeToStepId?: string | null;
  offsetMinutesFromEnd?: number | null;
  breweryAppStepKind?: "fermentable_early" | "fermentable_late" | null;
};

export function buildRecipeDrivenSteps(args: {
  beerJsonRecipeJson: unknown;
  recipeExtJson: unknown;
  waterSettings: Awaited<ReturnType<RecipeWaterSettingsService["get"]>>;
}): RecipeDrivenStepSeed[] {
  const steps: RecipeDrivenStepSeed[] = [];
  // Single typed view-cast over otherwise-`unknown` JSON. Real validation is Phase 7.
  const d: BeerJsonDoc = isObject(args.beerJsonRecipeJson)
    ? (args.beerJsonRecipeJson)
    : {};
  const recipesArr = Array.isArray(d.beerjson?.recipes) ? d.beerjson.recipes : [];
  const r0: RecipeNode | null = isObject(recipesArr[0]) ? (recipesArr[0]) : null;
  const ing = r0?.ingredients ?? {};
  const ext: RecipeExtLoose | null = isObject(args.recipeExtJson)
    ? (args.recipeExtJson)
    : null;

  const boilTimeMinutes =
    ext && typeof ext.boilTimeMinutesOverride === "number" && Number.isFinite(ext.boilTimeMinutesOverride)
      ? ext.boilTimeMinutesOverride
      : 60;
  const boilBaseStepId = crypto.randomUUID();

  const filterObjects = <T,>(v: unknown): T[] =>
    Array.isArray(v) ? (v.filter((x) => isObject(x)) as T[]) : [];

  const fermentables = filterObjects<FermentableNode>(ing.fermentable_additions);
  const hops = filterObjects<HopNode>(ing.hop_additions);
  const cultures = filterObjects<CultureNode>(ing.culture_additions);
  const misc = filterObjects<MiscNode>(ing.miscellaneous_additions);
  const mash: MashNode | null = isObject(r0?.mash) ? (r0.mash) : null;
  const mashStepsRaw: MashStepNode[] = mash
    ? filterObjects<MashStepNode>(mash.mash_steps).length > 0
      ? filterObjects<MashStepNode>(mash.mash_steps)
      : filterObjects<MashStepNode>(mash.mashSteps)
    : [];

  const toFiniteNumber = (v: unknown): number | null => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim()) {
      const n = Number(v.trim());
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  for (const f of fermentables) {
    const name = typeof f?.name === "string" ? f.name.trim() : "";
    if (!name) continue;
    const amountKg =
      f?.amount?.unit === "kg"
        ? toFiniteNumber(f?.amount?.value)
        : f?.amount?.unit === "g"
          ? ((toFiniteNumber(f?.amount?.value) ?? 0) / 1000)
          : null;
    const amountSuffix =
      amountKg != null && Number.isFinite(amountKg) && amountKg > 0 ? ` (${Math.round(amountKg * 1000) / 1000} kg)` : "";
    const lateAddition = f?.brewery_app_late_addition === true;
    steps.push({
      sectionId: "mash",
      sectionName: null,
      name: `Add fermentable: ${name}${amountSuffix}`,
      breweryAppStepKind: lateAddition ? "fermentable_late" : "fermentable_early",
    });
  }

  const extractMashStepMinutes = (s: MashStepNode): number => {
    const rawStepTime = s.step_time;
    if (isObject(rawStepTime)) {
      const unit = typeof rawStepTime['unit'] === "string" ? rawStepTime['unit'].trim().toLowerCase() : "";
      const value = toFiniteNumber(rawStepTime['value']);
      if (value == null) return 0;
      if (!unit || unit.startsWith("min")) return Math.max(0, Math.round(value));
      if (unit.startsWith("h")) return Math.max(0, Math.round(value * 60));
      return 0;
    }

    const direct = toFiniteNumber(rawStepTime);
    if (direct != null) return Math.max(0, Math.round(direct));

    const rawDuration = s.duration;
    if (isObject(rawDuration)) {
      const unit = typeof rawDuration['unit'] === "string" ? rawDuration['unit'].trim().toLowerCase() : "";
      const value = toFiniteNumber(rawDuration['value']);
      if (value == null) return 0;
      if (!unit || unit.startsWith("min")) return Math.max(0, Math.round(value));
      if (unit.startsWith("h")) return Math.max(0, Math.round(value * 60));
      return 0;
    }

    return 0;
  };

  const hasBoilHops = hops.some(
    (h) =>
      (typeof h.timing?.use === "string" && h.timing.use === "add_to_boil") ||
      (typeof h.brewery_app_use === "string" && (h.brewery_app_use === "boil" || h.brewery_app_use === "whirlpool"))
  );
  const hasBoilMiscWithTiming = misc.some((m) => {
    if (typeof m.timing?.use !== "string" || m.timing.use !== "add_to_boil") return false;
    const fromDuration =
      m.timing.duration?.unit === "min" && Number.isFinite(Number(m.timing.duration?.value));
    const fromTime = m.timing.time != null && Number.isFinite(Number(m.timing.time));
    return fromDuration || fromTime;
  });
  if (hasBoilHops || hasBoilMiscWithTiming) {
    steps.push({
      id: boilBaseStepId,
      sectionId: "boil",
      sectionName: null,
      name: "Start boil",
      minutesPlanned: boilTimeMinutes,
    });
  }

  for (const h of hops) {
    const name = typeof h?.name === "string" ? h.name : "";
    if (!name) continue;
    const use =
      typeof h?.brewery_app_use === "string" && (h.brewery_app_use === "boil" || h.brewery_app_use === "whirlpool" || h.brewery_app_use === "dryhop")
        ? h.brewery_app_use
        : typeof h?.timing?.use === "string" && h.timing.use === "add_to_fermentation"
          ? "dryhop"
          : "boil";
    const timeMinutes =
      (h?.timing?.duration?.unit === "min" ? toFiniteNumber(h?.timing?.duration?.value) : null) ??
      (h?.timing?.time != null ? toFiniteNumber(h?.timing?.time) : null);

    if (use === "dryhop") {
      const amountGrams =
        h?.amount?.unit === "g"
          ? toFiniteNumber(h?.amount?.value)
          : h?.amount?.unit === "kg"
            ? (toFiniteNumber(h?.amount?.value) ?? 0) * 1000
            : null;
      const dryHopSuffix =
        amountGrams != null && amountGrams >= 0 ? ` ${Math.round(amountGrams * 10) / 10} g` : "";
      steps.push({
        sectionId: "fermentor",
        sectionName: null,
        name: `Add dry hop: ${name}${dryHopSuffix}`,
      });
    } else {
      const offset = timeMinutes != null && Number.isFinite(timeMinutes) ? -timeMinutes : null;
      const amountGrams =
        h?.amount?.unit === "g"
          ? toFiniteNumber(h?.amount?.value)
          : h?.amount?.unit === "kg"
            ? (toFiniteNumber(h?.amount?.value) ?? 0) * 1000
            : null;
      const hopSuffix =
        amountGrams != null && amountGrams >= 0 ? ` ${Math.round(amountGrams * 10) / 10} g` : "";
      steps.push({
        sectionId: "boil",
        sectionName: null,
        name: `Add hops: ${name}${hopSuffix}`,
        relativeToStepId: boilBaseStepId,
        offsetMinutesFromEnd: offset,
      });
    }
  }

  for (const c of cultures) {
    const name = typeof c?.name === "string" ? c.name : "";
    if (!name) continue;
    steps.push({
      sectionId: "fermentor",
      sectionName: null,
      name: `Pitch yeast: ${name}`,
    });
  }

  const miscUseToSection: Record<string, string> = {
    mash: "mash",
    boil: "boil",
    primary: "fermentor",
    secondary: "fermentor",
    bottling: "post_boil",
  };
  for (const m of misc) {
    const name = typeof m?.name === "string" ? m.name : "";
    if (!name) continue;
    const useRaw = typeof m?.timing?.use === "string" ? m.timing.use : "";
    const use = useRaw === "add_to_mash" ? "mash" : useRaw === "add_to_boil" ? "boil" : useRaw === "add_to_fermentation" ? "primary" : useRaw === "add_to_secondary" ? "secondary" : useRaw === "add_to_package" ? "bottling" : "boil";
    const sectionId = miscUseToSection[use] ?? "boil";
    const timeMinutes =
      (m?.timing?.duration?.unit === "min" ? toFiniteNumber(m?.timing?.duration?.value) : null) ??
      (m?.timing?.time != null ? toFiniteNumber(m?.timing?.time) : null);
    const amount = m?.amount;
    let amountSuffix = "";
    if (amount && typeof amount === "object") {
      const unit = typeof amount.unit === "string" ? amount.unit.trim().toLowerCase() : "";
      const value = toFiniteNumber(amount.value);
      if (value != null && value >= 0) {
        const rounded = Math.round(value * 100) / 100;
        if (unit === "g") amountSuffix = ` ${rounded} g`;
        else if (unit === "kg") amountSuffix = ` ${rounded} kg`;
        else if (unit === "l" || unit === "L") amountSuffix = ` ${rounded} L`;
        else if (unit) amountSuffix = ` ${rounded} ${unit}`;
      }
    }
    const miscStep: RecipeDrivenStepSeed = {
      sectionId,
      sectionName: null,
      name: `Add ${name}${amountSuffix}`,
    };
    if (sectionId === "boil" && (hasBoilHops || hasBoilMiscWithTiming) && timeMinutes != null && Number.isFinite(timeMinutes)) {
      miscStep.relativeToStepId = boilBaseStepId;
      miscStep.offsetMinutesFromEnd = -timeMinutes;
    }
    steps.push(miscStep);
  }

  const mashScheduleSteps = mashStepsRaw
    .filter((s) => typeof s.name === "string" && s.name.trim().length > 0)
    .filter((s) => !(typeof s.type === "string" && s.type === "sparge"))
    .map((s) => {
      const name = String(s.name).trim();
      const minutes = extractMashStepMinutes(s);
      return { name, minutes };
    });

  if (mashScheduleSteps.length > 0) {
    const mashBaseStepId = crypto.randomUUID();
    const totalMashMin = mashScheduleSteps.reduce(
      (acc: number, s: { minutes: number }) => acc + s.minutes,
      0
    );

    steps.push({
      id: mashBaseStepId,
      sectionId: "mash",
      sectionName: null,
      name: "Start mash",
      minutesPlanned: totalMashMin,
    });

    let startAtMin = 0;
    for (const st of mashScheduleSteps) {
      const offsetMinutesFromEnd = -(totalMashMin - startAtMin);
      steps.push({
        sectionId: "mash",
        sectionName: null,
        name: st.name,
        minutesPlanned: st.minutes,
        relativeToStepId: mashBaseStepId,
        offsetMinutesFromEnd,
      });
      startAtMin += st.minutes;
    }
  }

  const ws: WaterSettingsLoose | null = isObject(args.waterSettings)
    ? (args.waterSettings)
    : null;
  if (ws) {
    const mashVol = ws.mashWaterVolumeLiters;
    if (typeof mashVol === "number" && mashVol > 0) {
      steps.push({ sectionId: "mash", sectionName: null, name: `Add mash water (${Math.round(mashVol * 10) / 10} L)` });
    }
    const mashSalts = ws.mashSaltAdditionsJson;
    if (Array.isArray(mashSalts) && mashSalts.length > 0) {
      const parts = mashSalts
        .filter((a): a is Record<string, unknown> => isObject(a))
        .map((a) => {
          const saltKey = typeof a['saltKey'] === "string" ? a['saltKey'] : "";
          const grams = typeof a['grams'] === "number" && Number.isFinite(a['grams']) ? a['grams'] : null;
          if (!saltKey || grams == null) return null;
          const saltLabel = saltKey.replaceAll("_", " ");
          const gramsLabel = Math.round(grams * 10) / 10;
          return `${saltLabel} ${gramsLabel} g`;
        })
        .filter((p): p is string => p != null);
      steps.push({
        sectionId: "pre_mash",
        sectionName: null,
        name: parts.length > 0 ? `Add mash salts: ${parts.join(", ")}` : "Add mash salts",
      });
    }
    const mashAcidMl = ws.mashLastAcidRequiredMl;
    if (typeof mashAcidMl === "number" && Number.isFinite(mashAcidMl) && mashAcidMl > 0) {
      const acidType = typeof ws.mashAcidType === "string" ? ws.mashAcidType.trim() : "";
      const mlLabel = Math.round(mashAcidMl * 10) / 10;
      steps.push({
        sectionId: "pre_mash",
        sectionName: null,
        name: acidType ? `Add mash acid (${acidType}): ${mlLabel} ml` : `Add mash acid: ${mlLabel} ml`,
      });
    }
    const spargeVol = ws.spargeVolumeLiters;
    if (typeof spargeVol === "number" && spargeVol > 0) {
      const spargeMethodType = ws.spargeMethodType;
      const spargeMethodLabel = spargeMethodType === "batch_sparge" ? "Batch Sparge" : "Fly Sparge";
      steps.push({ sectionId: "sparge", sectionName: null, name: `Sparge - ${spargeMethodLabel}` });
      steps.push({ sectionId: "sparge", sectionName: null, name: `Add sparge water (${Math.round(spargeVol * 10) / 10} L)` });
    }
    const spargeSalts = ws.spargeSaltAdditionsJson;
    if (Array.isArray(spargeSalts) && spargeSalts.length > 0) {
      steps.push({ sectionId: "sparge", sectionName: null, name: "Add sparge salts" });
    }
    const boilVol = ws.boilWaterVolumeLiters;
    if (typeof boilVol === "number" && boilVol > 0) {
      steps.push({ sectionId: "boil", sectionName: null, name: `Add boil water (${Math.round(boilVol * 10) / 10} L)` });
    }
  }

  return steps;
}

export function buildStepSeedFromSettings(args: {
  settings: Awaited<ReturnType<BrewdaySettingsService["getSettings"]>>;
}) {
  const settings = args.settings;
  const sections = settings?.sections ?? { presetExcludes: {}, customSections: [], customBrewingMethods: [] };
  const customSectionNameById = new Map<string, string>();
  for (const cs of sections.customSections ?? []) {
    if (cs && typeof cs.id === "string" && typeof cs.name === "string") {
      customSectionNameById.set(cs.id, cs.name);
    }
  }

  const sectionExcluded = new Set<string>();
  for (const [k, v] of Object.entries(sections.presetExcludes ?? {})) {
    if (v === true) sectionExcluded.add(k);
  }
  for (const cs of sections.customSections ?? []) {
    if (cs?.exclude === true && typeof cs.id === "string") sectionExcluded.add(cs.id);
  }

  const stepsRaw =
    settings
      ? [...(settings.defaultSteps ?? []), ...(settings.customSteps ?? [])]
      : [...DEFAULT_STEPS_SEED];

  return stepsRaw
    .filter((s) => s && typeof s === "object")
    .filter((s) => s.exclude !== true)
    .filter((s) => !sectionExcluded.has(String(s.sectionId ?? "")))
    .map((s) => {
      const sectionId = String(s.sectionId ?? "").trim() || "preparation";
      const sectionName = customSectionNameById.get(sectionId) ?? null;
      const minutesPlanned =
        typeof s.minutes === "number" && Number.isInteger(s.minutes) && s.minutes >= 0 ? s.minutes : null;
      return {
        sectionId,
        sectionName,
        name: String(s.name ?? "").trim(),
        minutesPlanned,
      };
    })
    .filter((s) => s.name.length > 0);
}
