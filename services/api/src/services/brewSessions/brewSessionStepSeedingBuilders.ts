import { isObject } from "../../lib/typeGuards.js";
import { DEFAULT_STEPS_SEED } from "../brewdaySettingsService.js";
import type {
  BuildStepSeedFromSettingsArgs,
  ParsedRecipeStepContext,
  RecipeDrivenStepSeed,
} from "./brewSessionStepSeedingTypes.js";
import { toFiniteNumber } from "./brewSessionStepSeedingParsers.js";

export function buildStepsFromParsedRecipe(ctx: ParsedRecipeStepContext): RecipeDrivenStepSeed[] {
  const steps: RecipeDrivenStepSeed[] = [];
  const {
    boilTimeMinutes,
    boilBaseStepId,
    fermentables,
    hops,
    cultures,
    misc,
    mashScheduleSteps,
    hasBoilHops,
    hasBoilMiscWithTiming,
    waterSettings: ws,
  } = ctx;

  for (const f of fermentables) {
    const name = typeof f?.name === "string" ? f.name.trim() : "";
    if (!name) continue;
    const amountKg =
      f?.amount?.unit === "kg"
        ? toFiniteNumber(f?.amount?.value)
        : f?.amount?.unit === "g"
          ? (toFiniteNumber(f?.amount?.value) ?? 0) / 1000
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
      typeof h?.brewery_app_use === "string" &&
      (h.brewery_app_use === "boil" || h.brewery_app_use === "whirlpool" || h.brewery_app_use === "dryhop")
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
      const dryHopSuffix = amountGrams != null && amountGrams >= 0 ? ` ${Math.round(amountGrams * 10) / 10} g` : "";
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
      const hopSuffix = amountGrams != null && amountGrams >= 0 ? ` ${Math.round(amountGrams * 10) / 10} g` : "";
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
    const use =
      useRaw === "add_to_mash"
        ? "mash"
        : useRaw === "add_to_boil"
          ? "boil"
          : useRaw === "add_to_fermentation"
            ? "primary"
            : useRaw === "add_to_secondary"
              ? "secondary"
              : useRaw === "add_to_package"
                ? "bottling"
                : "boil";
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

  if (mashScheduleSteps.length > 0) {
    const mashBaseStepId = crypto.randomUUID();
    const totalMashMin = mashScheduleSteps.reduce((acc, s) => acc + s.minutes, 0);

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
          const saltKey = typeof a["saltKey"] === "string" ? a["saltKey"] : "";
          const grams = typeof a["grams"] === "number" && Number.isFinite(a["grams"]) ? a["grams"] : null;
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

export function buildStepSeedFromSettings(args: BuildStepSeedFromSettingsArgs) {
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

  const stepsRaw = settings
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
