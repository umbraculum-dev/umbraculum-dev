export {
  DEFAULT_STEPS_SEED,
  PRESET_KEYS,
  type BrewdayCustomStep,
  type BrewdayCustomSectionConfig,
  type BrewdayDefaultStep,
  type BrewdaySectionConfig,
  type BrewdaySettingsPayload,
  type PresetSectionKey,
} from "./brewdaySettingsPresetSeed.js";
import type { BrewdayDefaultStep } from "./brewdaySettingsPresetSeed.js";

export function isLegacyDefaultStepsSeed(steps: BrewdayDefaultStep[]) {
  if (!Array.isArray(steps) || steps.length === 0) return true;
  // Back-compat: earlier seed contained just these steps.
  if (steps.some((s) => s?.name === "Start boil timer")) return true;
  if (steps.some((s) => s?.name === "Make sure all ingredients are on hand")) return true;
  return false;
}
