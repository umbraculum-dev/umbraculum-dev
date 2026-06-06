import { isObject } from "../../lib/typeGuards.js";
import type { RecipeDrivenStepSeed, WaterSettingsLoose } from "./brewSessionStepSeedingTypes.js";

export function buildRecipeWaterSteps(
  steps: RecipeDrivenStepSeed[],
  ws: WaterSettingsLoose | null,
): void {
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
}
