import type { MashComputeAndSaveInput, RecipeWaterComputeDeps } from "../recipeWaterComputeAndSaveService.js";
import { BadRequestError } from "../../errors.js";
import {
  applySaltAdditions,
  type IonProfilePpm,
} from "../../domain/waterCalc/saltAdditions.js";
import { spargeAcidification, type SpargeAcidificationResult } from "../../domain/waterCalc/spargeAcidification.js";
import { mashAcidificationManual, type MashAcidificationManualResult } from "../../domain/waterCalc/mashAcidificationManual.js";
import {
  mashAcidificationTargetMashPh,
  type MashAcidificationTargetMashPhResult,
} from "../../domain/waterCalc/mashAcidificationTargetMashPh.js";
import { alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult, combineAfterSaltsAndAcid } from "../../domain/waterCalc/overall.js";
import { buildSaltAdditionsDerivation } from "../../domain/waterCalc/derivation/saltAdditionsDerivation.js";
import { buildAcidificationDerivation } from "../../domain/waterCalc/derivation/acidificationDerivation.js";
import { mashPhEstimate, type MashPhEstimateInput } from "../../domain/waterCalc/mashPhEstimate.js";
import { defaultMashDiPh, defaultMashTaToPh57_mEqPerKg } from "../../domain/waterCalc/mashPhDefaultsV1.js";
import type { WaterCalcDerivation } from "../../domain/waterCalc/derivation/types.js";
import {
  ensureFinite,
  mixIonProfilesByVolume,
  parseAcidType,
  parseSaltAdditions,
  parseStrength,
  parseStrengthKind,
  strengthValueOrNull,
  colorLovibondToEbc,
  mashPhModelKeyFromMaltClass,
  type Mode,
} from "./recipeWaterComputeHelpers.js";

export async function computeAndSaveMash(
  deps: RecipeWaterComputeDeps,
  userId: string,
  workspaceId: string,
  recipeId: string,
  input: MashComputeAndSaveInput,
) {
    await deps.workspaces.assertMembership(userId, workspaceId);
    await deps.recipes.getRecipe(userId, workspaceId, recipeId);

    if (!input.sourceWaterProfileId) {
      throw new BadRequestError("invalid_profile_id", "Body.sourceWaterProfileId is required");
    }

    await deps.assertProfileAccessible(workspaceId, input.sourceWaterProfileId);
    if (input.dilutionWaterProfileId) await deps.assertProfileAccessible(workspaceId, input.dilutionWaterProfileId);

    const tap = ensureFinite(input.tapWaterVolumeLiters, "tapWaterVolumeLiters");
    const dil = ensureFinite(input.dilutionWaterVolumeLiters, "dilutionWaterVolumeLiters");
    const derivedVolumeLiters = Math.max(0, tap) + Math.max(0, dil);
    if (!(derivedVolumeLiters > 0)) {
      throw new BadRequestError("invalid_volume_liters", "Mash water volume must be > 0 (tap+dilution volumes).");
    }

    const source = await deps.loadProfileLite(input.sourceWaterProfileId);
    const dilution = input.dilutionWaterProfileId ? await deps.loadProfileLite(input.dilutionWaterProfileId) : null;
    if (!(tap > 0)) throw new BadRequestError("invalid_volume_liters", "Body.tapWaterVolumeLiters must be > 0");
    if (dil > 0 && !dilution) throw new BadRequestError("invalid_profile_id", "Body.dilutionWaterProfileId is required when dilution volume > 0");

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

    const additions = parseSaltAdditions(input.mashSaltAdditionsJson, "mashSaltAdditionsJson");
    const salts = applySaltAdditions(mixedBase, derivedVolumeLiters, additions);
    const saltsDerivation = buildSaltAdditionsDerivation({ volumeLiters: derivedVolumeLiters, baseProfile: mixedBase, result: salts });

    const acidType = parseAcidType(input.mashAcidType, "mashAcidType");
    const strengthKind = parseStrengthKind(input.mashStrengthKind, "mashStrengthKind");
    const strengthValue = input.mashStrengthValue;
    const strength = parseStrength({ strengthKind, strengthValue });

    const mashMode: Mode = input.mashAcidificationMode === "manual" ? "manual" : "targetPh";

    const startingAlkalinityPpmCaCO3 = ensureFinite(input.mashStartingAlkalinityPpmCaCO3, "mashStartingAlkalinityPpmCaCO3");
    const startingPh = ensureFinite(input.mashStartingPh, "mashStartingPh");
    const targetPh = ensureFinite(input.mashTargetPh, "mashTargetPh");
    const grist = Array.isArray(input.grist) ? input.grist : [];
    const hasGrist = grist.length > 0;

    const nowIso = new Date().toISOString();

    type MashAcidResult =
      | MashAcidificationManualResult
      | MashAcidificationTargetMashPhResult
      | SpargeAcidificationResult;
    let acidResult: MashAcidResult | null = null;
    let acidDerivation: WaterCalcDerivation | null = null;
    let overallPh: { kind: "target" | "estimated"; value: number } = { kind: "target", value: targetPh };

    if (mashMode === "manual") {
      const acidAddedMl = input.mashManualAcidAddedMl === null ? undefined : input.mashManualAcidAddedMl ?? undefined;
      const acidAddedGrams = input.mashManualAcidAddedGrams === null ? undefined : input.mashManualAcidAddedGrams ?? undefined;
      const manual = mashAcidificationManual({
        startingAlkalinityPpmCaCO3,
        startingPh,
        volumeLiters: derivedVolumeLiters,
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
      if (hasGrist) {
        const mashPhEstimateGrist = grist.map((row, idx) => {
          const amountKg = ensureFinite(row.amountKg, `grist[${idx}].amountKg`);
          const modelKey = mashPhModelKeyFromMaltClass(row.maltClass);
          const colorEbc = colorLovibondToEbc(
            row.colorLovibond === null ? null : typeof row.colorLovibond === "number" ? row.colorLovibond : null,
          );
          const mashDiPh = defaultMashDiPh(modelKey) ?? null;
          const mashTaToPh57_mEqPerKg = defaultMashTaToPh57_mEqPerKg(modelKey, colorEbc) ?? null;
          return { amountKg, mashDiPh, mashTaToPh57_mEqPerKg };
        });

        const acidAdded_mEqPerL = manual.predicted.debug?.acidRequired_mEqPerL;
        const estimate = mashPhEstimate({
          volumeLiters: derivedVolumeLiters,
          alkalinityPpmCaCO3: startingAlkalinityPpmCaCO3,
          calciumPpm: salts.resultingProfile.calcium,
          magnesiumPpm: salts.resultingProfile.magnesium,
          grist: mashPhEstimateGrist,
          acidAdded_mEqPerL: typeof acidAdded_mEqPerL === "number" ? acidAdded_mEqPerL : 0,
        } satisfies MashPhEstimateInput);

        overallPh = { kind: "estimated", value: estimate.estimatedMashPhRoomTemp };
      } else {
        overallPh = { kind: "estimated", value: manual.achievedPh };
      }
    } else {
      if (hasGrist) {
        const r = mashAcidificationTargetMashPh({
          startingAlkalinityPpmCaCO3,
          startingPh,
          volumeLiters: derivedVolumeLiters,
          targetMashPh: targetPh,
          calciumPpm: salts.resultingProfile.calcium,
          magnesiumPpm: salts.resultingProfile.magnesium,
          acidType,
          strength,
          grist: grist.map((row, idx) => {
            const amountKg = ensureFinite(row.amountKg, `grist[${idx}].amountKg`);
            const colorLovibond = row.colorLovibond === null ? null : typeof row.colorLovibond === "number" ? row.colorLovibond : null;
            const maltClass = row.maltClass;
            return { amountKg, colorLovibond, maltClass };
          }),
          waterToGristRatioQtPerLbOverride: undefined,
        });
        acidResult = r;
        overallPh = { kind: "estimated", value: r.estimatedMashPhRoomTemp };
      } else {
        const r = spargeAcidification({
          startingAlkalinityPpmCaCO3,
          startingPh,
          targetPh,
          volumeLiters: derivedVolumeLiters,
          acidType,
          strength,
        });
        acidResult = r;
        overallPh = { kind: "target", value: targetPh };
      }

      acidDerivation = buildAcidificationDerivation({
        mode: "target",
        startingAlkalinityPpmCaCO3,
        startingPh,
        targetPh: overallPh.value,
        volumeLiters: derivedVolumeLiters,
        acidType,
        strengthKind,
        strengthValue: strengthValueOrNull(strength),
        // Target+grist returns MashAcidificationTargetMashPhResult, target+no-grist returns
        // SpargeAcidificationResult. Both expose the fields the derivation builder reads
        // (acidRequiredMl/Grams, finalAlkalinityPpmCaCO3, sulfate/chloride). The two
        // `debug` shapes differ but the builder only inspects fields shared between them.
        result: acidResult as SpargeAcidificationResult,
      });
    }

    if (!acidResult) throw new Error("acidResult was not set");
    const acidPredicted: SpargeAcidificationResult | MashAcidificationTargetMashPhResult =
      "predicted" in acidResult ? acidResult.predicted : acidResult;
    const ionsPpm = combineAfterSaltsAndAcid({ afterSalts: salts.resultingProfile, acidResult: acidPredicted });
    const alkalinityAfterSaltsPpmCaCO3 = alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult(salts);

    const overall = {
      calculatedAt: nowIso,
      ionsPpm,
      finalAlkalinityPpmCaCO3: acidPredicted.finalAlkalinityPpmCaCO3,
      ph: overallPh,
      debug: {
        startingAlkalinityPpmCaCO3,
        startingAlkalinityAfterSaltsPpmCaCO3: alkalinityAfterSaltsPpmCaCO3,
        saltsDeltaBicarbonatePpm: salts.deltasPpm.bicarbonate,
        acidSulfateAddedPpm: acidPredicted.sulfateAddedPpm,
        acidChlorideAddedPpm: acidPredicted.chlorideAddedPpm,
        mashMode,
      },
    };

    const overallDerivation: WaterCalcDerivation = {
      kind: "mash_overall",
      version: 1,
      formulaId: "water.mash_overall.v1",
      inputs: [
        { id: "volumeLiters", value: { kind: "number", value: derivedVolumeLiters, unit: "L" } },
        { id: "startingAlk", value: { kind: "number", value: startingAlkalinityPpmCaCO3, unit: "ppm_as_CaCO3" } },
        { id: "startingPh", value: { kind: "number", value: startingPh, unit: "pH" } },
        { id: "targetPh", value: { kind: "number", value: overallPh.value, unit: "pH" } },
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
      sourceWaterProfileId: input.sourceWaterProfileId,
      dilutionWaterProfileId: input.dilutionWaterProfileId,
      tapWaterVolumeLiters: tap,
      dilutionWaterVolumeLiters: dil,

      mashStartingAlkalinityPpmCaCO3: startingAlkalinityPpmCaCO3,
      mashStartingPh: startingPh,
      mashTargetPh: targetPh,
      mashWaterVolumeLiters: derivedVolumeLiters,
      mashAcidType: acidType,
      mashStrengthKind: strengthKind,
      mashStrengthValue: strengthKind === "solid" ? null : strengthValue,
      mashAcidificationMode: mashMode,
      mashManualAcidAddedMl: strengthKind === "solid" ? null : input.mashManualAcidAddedMl,
      mashManualAcidAddedGrams: strengthKind === "solid" ? input.mashManualAcidAddedGrams : null,

      mashSaltAdditionsJson: additions,
      mashSaltsLastResultJson: { calculatedAt: nowIso, result: salts },

      mashOverallLastResultJson: overall,
      mashOverallLastCalculatedAt: nowIso,
    };

    if (mashMode === "manual" && "predicted" in acidResult) {
      patch['mashManualLastAchievedPh'] = acidResult.achievedPh;
      patch['mashManualLastFinalAlkalinityPpmCaCO3'] = acidResult.predicted.finalAlkalinityPpmCaCO3;
      patch['mashManualLastSulfateAddedPpm'] = acidResult.predicted.sulfateAddedPpm;
      patch['mashManualLastChlorideAddedPpm'] = acidResult.predicted.chlorideAddedPpm;
      patch['mashManualLastCalculatedAt'] = nowIso;

      patch['mashLastFinalAlkalinityPpmCaCO3'] = acidResult.predicted.finalAlkalinityPpmCaCO3;
      patch['mashLastSulfateAddedPpm'] = acidResult.predicted.sulfateAddedPpm;
      patch['mashLastChlorideAddedPpm'] = acidResult.predicted.chlorideAddedPpm;
      patch['mashLastCalculatedAt'] = nowIso;
    } else if (mashMode !== "manual") {
      const r = acidResult as MashAcidificationTargetMashPhResult | SpargeAcidificationResult;
      patch['mashLastAcidRequiredMl'] = r.acidRequiredMl ?? null;
      patch['mashLastAcidRequiredTsp'] = r.acidRequiredTsp ?? null;
      patch['mashLastAcidRequiredGrams'] = r.acidRequiredGrams ?? null;
      patch['mashLastAcidRequiredKg'] = r.acidRequiredKg ?? null;
      patch['mashLastFinalAlkalinityPpmCaCO3'] = r.finalAlkalinityPpmCaCO3 ?? null;
      patch['mashLastSulfateAddedPpm'] = r.sulfateAddedPpm ?? null;
      patch['mashLastChlorideAddedPpm'] = r.chlorideAddedPpm ?? null;
      patch['mashLastCalculatedAt'] = nowIso;
    }

    await deps.settings.upsert(userId, workspaceId, recipeId, patch);

    return {
      settings: { recipeId },
      salts: { result: salts, derivation: saltsDerivation },
      acid:
        mashMode === "manual"
          ? { kind: "mash_acidification_manual", mode: "manual", result: acidResult, derivation: acidDerivation }
          : hasGrist
            ? { kind: "mash_acidification_target_mash_ph", mode: "targetPh", result: acidResult, derivation: acidDerivation }
            : { kind: "mash_acidification", mode: "targetPh", result: acidResult, derivation: acidDerivation },
      overall: { result: overall, derivation: overallDerivation },
    };
  }

