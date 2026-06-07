import type { RecipeWaterComputeDeps, SpargeComputeAndSaveInput } from "../recipeWaterComputeAndSaveService.js";
import { BadRequestError } from "../../../../errors.js";
import { applySaltAdditions, type IonProfilePpm } from "../waterCalc/saltAdditions.js";
import { spargeAcidification, type SpargeAcidificationResult } from "../waterCalc/spargeAcidification.js";
import { spargeAcidificationManual, type SpargeAcidificationManualResult } from "../waterCalc/spargeAcidificationManual.js";
import { buildSaltAdditionsDerivation } from "../waterCalc/derivation/saltAdditionsDerivation.js";
import { buildAcidificationDerivation } from "../waterCalc/derivation/acidificationDerivation.js";
import type { WaterCalcDerivation } from "../waterCalc/derivation/types.js";
import {
  ensureFinite,
  parseAcidType,
  parseSaltAdditions,
  parseStrength,
  parseStrengthKind,
  strengthValueOrNull,
  type Mode,
} from "./recipeWaterComputeHelpers.js";

export async function computeAndSaveSparge(
  deps: RecipeWaterComputeDeps,
  userId: string,
  workspaceId: string,
  recipeId: string,
  input: SpargeComputeAndSaveInput,
) {
    await deps.workspaces.assertMembership(userId, workspaceId);
    await deps.recipes.getRecipe(userId, workspaceId, recipeId);

    if (!input.spargeWaterProfileId) {
      throw new BadRequestError("invalid_profile_id", "Body.spargeWaterProfileId is required");
    }
    await deps.assertProfileAccessible(workspaceId, input.spargeWaterProfileId);

    const baseProfileRec = await deps.loadProfileLite(input.spargeWaterProfileId);
    const baseProfile: IonProfilePpm = {
      calcium: baseProfileRec.calcium,
      magnesium: baseProfileRec.magnesium,
      sodium: baseProfileRec.sodium,
      sulfate: baseProfileRec.sulfate,
      chloride: baseProfileRec.chloride,
      bicarbonate: baseProfileRec.bicarbonate,
    };

    const volumeLiters = ensureFinite(input.spargeVolumeLiters, "spargeVolumeLiters");
    if (!(volumeLiters > 0)) throw new BadRequestError("invalid_volume_liters", "Body.spargeVolumeLiters must be > 0");

    const additions = parseSaltAdditions(input.spargeSaltAdditionsJson, "spargeSaltAdditionsJson");
    const salts = applySaltAdditions(baseProfile, volumeLiters, additions);
    const saltsDerivation = buildSaltAdditionsDerivation({ volumeLiters, baseProfile, result: salts });

    const acidType = parseAcidType(input.spargeAcidType, "spargeAcidType");
    const strengthKind = parseStrengthKind(input.spargeStrengthKind, "spargeStrengthKind");
    const strengthValue = input.spargeStrengthValue;
    const strength = parseStrength({ strengthKind, strengthValue });

    const startingAlkalinityPpmCaCO3 = ensureFinite(input.spargeStartingAlkalinityPpmCaCO3, "spargeStartingAlkalinityPpmCaCO3");
    const startingPh = ensureFinite(input.spargeStartingPh, "spargeStartingPh");
    const targetPh = ensureFinite(input.spargeTargetPh, "spargeTargetPh");

    const nowIso = new Date().toISOString();
    const mode: Mode = input.spargeAcidificationMode === "manual" ? "manual" : "targetPh";

    type SpargeAcidResult = SpargeAcidificationManualResult | SpargeAcidificationResult;
    let acidResult: SpargeAcidResult | null = null;
    let acidDerivation: WaterCalcDerivation | null = null;

    const calciumPpm = salts.resultingProfile.calcium;
    const magnesiumPpm = salts.resultingProfile.magnesium;

    if (mode === "manual") {
      const acidAddedMl = input.spargeManualAcidAddedMl === null ? undefined : input.spargeManualAcidAddedMl ?? undefined;
      const acidAddedGrams = input.spargeManualAcidAddedGrams === null ? undefined : input.spargeManualAcidAddedGrams ?? undefined;
      const manual = spargeAcidificationManual({
        startingAlkalinityPpmCaCO3,
        startingPh,
        volumeLiters,
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
        volumeLiters,
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
        volumeLiters,
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
        volumeLiters,
        acidType,
        strengthKind,
        strengthValue: strengthValueOrNull(strength),
        result: r,
      });
    }

    if (!acidResult) throw new Error("acidResult was not set");
    const acidPredicted: SpargeAcidificationResult =
      "predicted" in acidResult ? acidResult.predicted : acidResult;

    const patch: Record<string, unknown> = {
      spargeWaterProfileId: input.spargeWaterProfileId,
      spargeSaltAdditionsJson: additions,
      spargeSaltsLastResultJson: { calculatedAt: nowIso, result: salts },

      spargeStartingAlkalinityPpmCaCO3: startingAlkalinityPpmCaCO3,
      spargeStartingPh: startingPh,
      spargeTargetPh: targetPh,
      spargeVolumeLiters: volumeLiters,
      spargeAcidType: acidType,
      spargeStrengthKind: strengthKind,
      spargeStrengthValue: strengthKind === "solid" ? null : strengthValue,
      spargeAcidificationMode: mode,
      spargeManualAcidAddedMl: strengthKind === "solid" ? null : input.spargeManualAcidAddedMl,
      spargeManualAcidAddedGrams: strengthKind === "solid" ? input.spargeManualAcidAddedGrams : null,
    };

    if (mode === "manual" && "predicted" in acidResult) {
      patch['spargeLastAcidRequiredMl'] = acidPredicted.acidRequiredMl ?? null;
      patch['spargeLastAcidRequiredTsp'] = acidPredicted.acidRequiredTsp ?? null;
      patch['spargeLastAcidRequiredGrams'] = acidPredicted.acidRequiredGrams ?? null;
      patch['spargeLastAcidRequiredKg'] = acidPredicted.acidRequiredKg ?? null;
      patch['spargeLastFinalAlkalinityPpmCaCO3'] = acidPredicted.finalAlkalinityPpmCaCO3;
      patch['spargeLastSulfateAddedPpm'] = acidPredicted.sulfateAddedPpm;
      patch['spargeLastChlorideAddedPpm'] = acidPredicted.chlorideAddedPpm;
      patch['spargeLastCalculatedAt'] = nowIso;

      patch['spargeManualLastAchievedPh'] = acidResult.achievedPh;
      patch['spargeManualLastFinalAlkalinityPpmCaCO3'] = acidPredicted.finalAlkalinityPpmCaCO3;
      patch['spargeManualLastSulfateAddedPpm'] = acidPredicted.sulfateAddedPpm;
      patch['spargeManualLastChlorideAddedPpm'] = acidPredicted.chlorideAddedPpm;
      patch['spargeManualLastCalculatedAt'] = nowIso;
    } else if (mode !== "manual") {
      const r = acidResult as SpargeAcidificationResult;
      patch['spargeLastAcidRequiredMl'] = r.acidRequiredMl ?? null;
      patch['spargeLastAcidRequiredTsp'] = r.acidRequiredTsp ?? null;
      patch['spargeLastAcidRequiredGrams'] = r.acidRequiredGrams ?? null;
      patch['spargeLastAcidRequiredKg'] = r.acidRequiredKg ?? null;
      patch['spargeLastFinalAlkalinityPpmCaCO3'] = r.finalAlkalinityPpmCaCO3 ?? null;
      patch['spargeLastSulfateAddedPpm'] = r.sulfateAddedPpm ?? null;
      patch['spargeLastChlorideAddedPpm'] = r.chlorideAddedPpm ?? null;
      patch['spargeLastCalculatedAt'] = nowIso;
    }

    await deps.settings.upsert(userId, workspaceId, recipeId, patch);

    return {
      settings: { recipeId },
      salts: { result: salts, derivation: saltsDerivation },
      acid:
        mode === "manual"
          ? { kind: "sparge_acidification_manual", mode: "manual", result: acidResult, derivation: acidDerivation }
          : { kind: "sparge_acidification", mode: "targetPh", result: acidResult, derivation: acidDerivation },
    };
  }

