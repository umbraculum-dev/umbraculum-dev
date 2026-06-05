import type { BoilComputeAndSaveInput, RecipeWaterComputeDeps } from "../recipeWaterComputeAndSaveService.js";
import { BadRequestError } from "../../errors.js";
import { applySaltAdditions, type IonProfilePpm } from "../../domain/waterCalc/saltAdditions.js";
import {
  spargeAcidification,
  type SpargeAcidificationResult,
} from "../../domain/waterCalc/spargeAcidification.js";
import {
  spargeAcidificationManual,
  type SpargeAcidificationManualResult,
} from "../../domain/waterCalc/spargeAcidificationManual.js";
import {
  alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult,
  combineAfterSaltsAndAcid,
} from "../../domain/waterCalc/overall.js";
import { buildSaltAdditionsDerivation } from "../../domain/waterCalc/derivation/saltAdditionsDerivation.js";
import { buildAcidificationDerivation } from "../../domain/waterCalc/derivation/acidificationDerivation.js";
import type { WaterCalcDerivation } from "../../domain/waterCalc/derivation/types.js";
import {
  ensureFinite,
  mixIonProfilesByVolume,
  parseAcidType,
  parseSaltAdditions,
  parseStrength,
  parseStrengthKind,
  strengthValueOrNull,
  type Mode,
} from "./recipeWaterComputeHelpers.js";

export async function computeAndSaveBoil(
  deps: RecipeWaterComputeDeps,
  userId: string,
  workspaceId: string,
  recipeId: string,
  input: BoilComputeAndSaveInput,
) {
    await deps.workspaces.assertMembership(userId, workspaceId);
    await deps.recipes.getRecipe(userId, workspaceId, recipeId);

    if (!input.boilSourceWaterProfileId) {
      throw new BadRequestError("invalid_profile_id", "Body.boilSourceWaterProfileId is required");
    }

    await deps.assertProfileAccessible(workspaceId, input.boilSourceWaterProfileId);
    if (input.boilDilutionWaterProfileId) await deps.assertProfileAccessible(workspaceId, input.boilDilutionWaterProfileId);

    const tap = ensureFinite(input.boilTapWaterVolumeLiters, "boilTapWaterVolumeLiters");
    const dil = ensureFinite(input.boilDilutionWaterVolumeLiters, "boilDilutionWaterVolumeLiters");
    const derivedVolumeLiters = Math.max(0, tap) + Math.max(0, dil);
    if (!(derivedVolumeLiters > 0)) {
      throw new BadRequestError("invalid_volume_liters", "Boil water volume must be > 0 (tap+dilution volumes).");
    }

    const source = await deps.loadProfileLite(input.boilSourceWaterProfileId);
    const dilution = input.boilDilutionWaterProfileId ? await deps.loadProfileLite(input.boilDilutionWaterProfileId) : null;
    if (!(tap > 0)) throw new BadRequestError("invalid_volume_liters", "Body.boilTapWaterVolumeLiters must be > 0");
    if (dil > 0 && !dilution) throw new BadRequestError("invalid_profile_id", "Body.boilDilutionWaterProfileId is required when dilution volume > 0");

    const baseSource: IonProfilePpm = {
      calcium: source.calcium,
      magnesium: source.magnesium,
      sodium: source.sodium,
      sulfate: source.sulfate,
      chloride: source.chloride,
      bicarbonate: source.bicarbonate,
    };
    const mixedBase: IonProfilePpm =
      dil > 0 && dilution
        ? (mixIonProfilesByVolume(
            baseSource,
            tap,
            {
              calcium: dilution.calcium,
              magnesium: dilution.magnesium,
              sodium: dilution.sodium,
              sulfate: dilution.sulfate,
              chloride: dilution.chloride,
              bicarbonate: dilution.bicarbonate,
            },
            dil,
          ) ?? baseSource)
        : baseSource;

    const additions = parseSaltAdditions(input.boilSaltAdditionsJson, "boilSaltAdditionsJson");
    const salts = applySaltAdditions(mixedBase, derivedVolumeLiters, additions);
    const saltsDerivation = buildSaltAdditionsDerivation({ volumeLiters: derivedVolumeLiters, baseProfile: mixedBase, result: salts });

    const acidType = parseAcidType(input.boilAcidType, "boilAcidType");
    const strengthKind = parseStrengthKind(input.boilStrengthKind, "boilStrengthKind");
    const strengthValue = input.boilStrengthValue;
    const strength = parseStrength({ strengthKind, strengthValue });

    const startingAlkalinityPpmCaCO3 = ensureFinite(input.boilStartingAlkalinityPpmCaCO3, "boilStartingAlkalinityPpmCaCO3");
    const startingPh = ensureFinite(input.boilStartingPh, "boilStartingPh");
    const targetPh = ensureFinite(input.boilTargetPh, "boilTargetPh");

    const nowIso = new Date().toISOString();
    const mode: Mode = input.boilAcidificationMode === "manual" ? "manual" : "targetPh";

    type BoilAcidResult = SpargeAcidificationManualResult | SpargeAcidificationResult;
    let acidResult: BoilAcidResult | null = null;
    let acidDerivation: WaterCalcDerivation | null = null;
    const calciumPpm = salts.resultingProfile.calcium;
    const magnesiumPpm = salts.resultingProfile.magnesium;

    if (mode === "manual") {
      const acidAddedMl = input.boilManualAcidAddedMl === null ? undefined : input.boilManualAcidAddedMl ?? undefined;
      const acidAddedGrams = input.boilManualAcidAddedGrams === null ? undefined : input.boilManualAcidAddedGrams ?? undefined;
      const manual = spargeAcidificationManual({
        startingAlkalinityPpmCaCO3,
        startingPh,
        volumeLiters: derivedVolumeLiters,
        calciumPpm,
        magnesiumPpm,
        acidType,
        strength,
        acidAddedMl,
        acidAddedGrams,
      });
      acidResult = manual;
      acidDerivation = buildAcidificationDerivation({
        mode: "manual",
        startingAlkalinityPpmCaCO3,
        startingPh,
        targetPh: manual.achievedPh,
        volumeLiters: derivedVolumeLiters,
        acidType,
        strengthKind,
        strengthValue: strengthValueOrNull(strength),
        result: manual.predicted,
      });
    } else {
      const r = spargeAcidification({
        startingAlkalinityPpmCaCO3,
        startingPh,
        targetPh,
        volumeLiters: derivedVolumeLiters,
        calciumPpm,
        magnesiumPpm,
        acidType,
        strength,
      });
      acidResult = r;
      acidDerivation = buildAcidificationDerivation({
        mode: "target",
        startingAlkalinityPpmCaCO3,
        startingPh,
        targetPh,
        volumeLiters: derivedVolumeLiters,
        acidType,
        strengthKind,
        strengthValue: strengthValueOrNull(strength),
        result: r,
      });
    }

    if (!acidResult) throw new Error("acidResult was not set");
    const acidPredicted: SpargeAcidificationResult =
      "predicted" in acidResult ? acidResult.predicted : acidResult;
    const achievedPh: number | null =
      "achievedPh" in acidResult ? acidResult.achievedPh : null;
    const ionsPpm = combineAfterSaltsAndAcid({ afterSalts: salts.resultingProfile, acidResult: acidPredicted });
    const alkalinityAfterSaltsPpmCaCO3 = alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult(salts);

    const overall = {
      calculatedAt: nowIso,
      ionsPpm,
      finalAlkalinityPpmCaCO3: acidPredicted.finalAlkalinityPpmCaCO3,
      ph: {
        kind: mode === "manual" ? ("estimated" as const) : ("target" as const),
        value: mode === "manual" && achievedPh !== null ? achievedPh : targetPh,
      },
      debug: {
        startingAlkalinityPpmCaCO3,
        startingAlkalinityAfterSaltsPpmCaCO3: alkalinityAfterSaltsPpmCaCO3,
        saltsDeltaBicarbonatePpm: salts.deltasPpm.bicarbonate,
        acidSulfateAddedPpm: acidPredicted.sulfateAddedPpm,
        acidChlorideAddedPpm: acidPredicted.chlorideAddedPpm,
        boilMode: mode,
      },
    };

    const overallDerivation: WaterCalcDerivation = {
      kind: "boil_overall",
      version: 1,
      formulaId: "water.boil_overall.v1",
      inputs: [
        { id: "volumeLiters", value: { kind: "number", value: derivedVolumeLiters, unit: "L" } },
        { id: "startingAlk", value: { kind: "number", value: startingAlkalinityPpmCaCO3, unit: "ppm_as_CaCO3" } },
        { id: "startingPh", value: { kind: "number", value: startingPh, unit: "pH" } },
        { id: "targetPh", value: { kind: "number", value: mode === "manual" && achievedPh !== null ? achievedPh : targetPh, unit: "pH" } },
      ],
      intermediates: [
        { id: "alkAfterSalts", value: { kind: "number", value: alkalinityAfterSaltsPpmCaCO3, unit: "ppm_as_CaCO3" } },
        { id: "acidSulfateAddedPpm", value: { kind: "number", value: acidPredicted.sulfateAddedPpm, unit: "ppm" } },
        { id: "acidChlorideAddedPpm", value: { kind: "number", value: acidPredicted.chlorideAddedPpm, unit: "ppm" } },
      ],
      notes: ["counter_ions_only_for_sulfuric_or_hydrochloric"],
      breakdowns: [
        {
          id: "saltBreakdown",
          rows: salts.breakdown.map((b) => ({
            saltKey: { kind: "string", value: b.saltKey },
            grams: { kind: "number", value: b.grams, unit: "g" },
            calciumPpm: { kind: "number", value: b.deltasPpm.calcium ?? 0, unit: "ppm" },
            magnesiumPpm: { kind: "number", value: b.deltasPpm.magnesium ?? 0, unit: "ppm" },
            sodiumPpm: { kind: "number", value: b.deltasPpm.sodium ?? 0, unit: "ppm" },
            sulfatePpm: { kind: "number", value: b.deltasPpm.sulfate ?? 0, unit: "ppm" },
            chloridePpm: { kind: "number", value: b.deltasPpm.chloride ?? 0, unit: "ppm" },
            bicarbonatePpm: { kind: "number", value: b.deltasPpm.bicarbonate ?? 0, unit: "ppm" },
          })),
        },
      ],
    };

    const patch: Record<string, unknown> = {
      boilSourceWaterProfileId: input.boilSourceWaterProfileId,
      boilDilutionWaterProfileId: input.boilDilutionWaterProfileId,
      boilTapWaterVolumeLiters: tap,
      boilDilutionWaterVolumeLiters: dil,

      boilStartingAlkalinityPpmCaCO3: startingAlkalinityPpmCaCO3,
      boilStartingPh: startingPh,
      boilTargetPh: targetPh,
      boilWaterVolumeLiters: derivedVolumeLiters,
      boilAcidType: acidType,
      boilStrengthKind: strengthKind,
      boilStrengthValue: strengthKind === "solid" ? null : strengthValue,
      boilAcidificationMode: mode,
      boilManualAcidAddedMl: strengthKind === "solid" ? null : input.boilManualAcidAddedMl,
      boilManualAcidAddedGrams: strengthKind === "solid" ? input.boilManualAcidAddedGrams : null,

      boilSaltAdditionsJson: additions,
      boilSaltsLastResultJson: { calculatedAt: nowIso, result: salts },

      boilOverallLastResultJson: overall,
      boilOverallLastCalculatedAt: nowIso,
    };

    if (mode === "manual" && "predicted" in acidResult) {
      patch['boilLastAcidRequiredMl'] = acidPredicted.acidRequiredMl ?? null;
      patch['boilLastAcidRequiredTsp'] = acidPredicted.acidRequiredTsp ?? null;
      patch['boilLastAcidRequiredGrams'] = acidPredicted.acidRequiredGrams ?? null;
      patch['boilLastAcidRequiredKg'] = acidPredicted.acidRequiredKg ?? null;
      patch['boilLastFinalAlkalinityPpmCaCO3'] = acidPredicted.finalAlkalinityPpmCaCO3;
      patch['boilLastSulfateAddedPpm'] = acidPredicted.sulfateAddedPpm;
      patch['boilLastChlorideAddedPpm'] = acidPredicted.chlorideAddedPpm;
      patch['boilLastCalculatedAt'] = nowIso;

      patch['boilManualLastAchievedPh'] = acidResult.achievedPh;
      patch['boilManualLastFinalAlkalinityPpmCaCO3'] = acidPredicted.finalAlkalinityPpmCaCO3;
      patch['boilManualLastSulfateAddedPpm'] = acidPredicted.sulfateAddedPpm;
      patch['boilManualLastChlorideAddedPpm'] = acidPredicted.chlorideAddedPpm;
      patch['boilManualLastCalculatedAt'] = nowIso;
    } else if (mode !== "manual") {
      const r = acidResult as SpargeAcidificationResult;
      patch['boilLastAcidRequiredMl'] = r.acidRequiredMl ?? null;
      patch['boilLastAcidRequiredTsp'] = r.acidRequiredTsp ?? null;
      patch['boilLastAcidRequiredGrams'] = r.acidRequiredGrams ?? null;
      patch['boilLastAcidRequiredKg'] = r.acidRequiredKg ?? null;
      patch['boilLastFinalAlkalinityPpmCaCO3'] = r.finalAlkalinityPpmCaCO3 ?? null;
      patch['boilLastSulfateAddedPpm'] = r.sulfateAddedPpm ?? null;
      patch['boilLastChlorideAddedPpm'] = r.chlorideAddedPpm ?? null;
      patch['boilLastCalculatedAt'] = nowIso;
    }

    await deps.settings.upsert(userId, workspaceId, recipeId, patch);

    return {
      settings: { recipeId },
      salts: { result: salts, derivation: saltsDerivation },
      acid:
        mode === "manual"
          ? { kind: "boil_acidification_manual", mode: "manual", result: acidResult, derivation: acidDerivation }
          : { kind: "boil_acidification", mode: "targetPh", result: acidResult, derivation: acidDerivation },
      overall: { result: overall, derivation: overallDerivation },
    };
}
