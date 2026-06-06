import { DEFAULT_STEPS_SEED } from "../brewdaySettingsService.js";
import type { BuildStepSeedFromSettingsArgs } from "./brewSessionStepSeedingTypes.js";

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
