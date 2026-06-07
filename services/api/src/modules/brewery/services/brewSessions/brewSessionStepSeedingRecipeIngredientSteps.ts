import type {
  ParsedRecipeStepContext,
  RecipeDrivenStepSeed,
} from "./brewSessionStepSeedingTypes.js";
import { toFiniteNumber } from "./brewSessionStepSeedingParsers.js";

export function buildRecipeIngredientSteps(
  steps: RecipeDrivenStepSeed[],
  ctx: ParsedRecipeStepContext,
): void {
  const {
    boilTimeMinutes,
    boilBaseStepId,
    fermentables,
    hops,
    cultures,
    misc,
    hasBoilHops,
    hasBoilMiscWithTiming,
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
}
