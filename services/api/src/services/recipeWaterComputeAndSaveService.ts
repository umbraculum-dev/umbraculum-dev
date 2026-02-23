import type { PrismaClient } from "@prisma/client";
import { BadRequestError } from "../errors.js";
import { WorkspacesService } from "./workspacesService.js";
import { RecipesService } from "./recipesService.js";
import { RecipeWaterSettingsService } from "./recipeWaterSettingsService.js";
import {
  applySaltAdditions,
  type IonProfilePpm,
  type SaltAddition,
  type SaltKey,
} from "../domain/waterCalc/saltAdditions.js";
import { spargeAcidification, type AcidStrength, type SpargeAcidType } from "../domain/waterCalc/spargeAcidification.js";
import { spargeAcidificationManual } from "../domain/waterCalc/spargeAcidificationManual.js";
import { mashAcidificationManual } from "../domain/waterCalc/mashAcidificationManual.js";
import { mashAcidificationTargetMashPh } from "../domain/waterCalc/mashAcidificationTargetMashPh.js";
import { alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult, combineAfterSaltsAndAcid } from "../domain/waterCalc/overall.js";
import { buildSaltAdditionsDerivation } from "../domain/waterCalc/derivation/saltAdditionsDerivation.js";
import { buildAcidificationDerivation } from "../domain/waterCalc/derivation/acidificationDerivation.js";
import { mashPhEstimate, type MashPhEstimateInput } from "../domain/waterCalc/mashPhEstimate.js";
import { defaultMashDiPh, defaultMashTaToPh57_mEqPerKg } from "../domain/waterCalc/mashPhDefaultsV1.js";
import type { WaterCalcDerivation } from "../domain/waterCalc/derivation/types.js";

type StrengthKind = "percent" | "normality" | "molarity" | "solid";
type Mode = "targetPh" | "manual";

type WaterProfileLite = {
  id: string;
  scope: "system" | "public" | "account";
  workspaceId: string | null;
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
};

function ensureFinite(n: unknown, field: string) {
  if (typeof n !== "number" || Number.isNaN(n) || !Number.isFinite(n)) {
    throw new BadRequestError("invalid_number", `Body.${field} must be a number`);
  }
  return n;
}

function parseStrength(args: { strengthKind: StrengthKind; strengthValue?: number | null }): AcidStrength {
  if (args.strengthKind === "solid") return { kind: "solid" };
  const v = args.strengthValue;
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new BadRequestError("invalid_strength_value", "Body.strengthValue must be a finite number");
  }
  return { kind: args.strengthKind as any, value: v } as AcidStrength;
}

function mixIonProfilesByVolume(a: IonProfilePpm, aVolumeLiters: number, b: IonProfilePpm, bVolumeLiters: number): IonProfilePpm | null {
  const av = Math.max(0, aVolumeLiters);
  const bv = Math.max(0, bVolumeLiters);
  const total = av + bv;
  if (!(total > 0)) return null;
  const mix = (x: number, y: number) => (x * av + y * bv) / total;
  return {
    calcium: mix(a.calcium, b.calcium),
    magnesium: mix(a.magnesium, b.magnesium),
    sodium: mix(a.sodium, b.sodium),
    sulfate: mix(a.sulfate, b.sulfate),
    chloride: mix(a.chloride, b.chloride),
    bicarbonate: mix(a.bicarbonate, b.bicarbonate),
  };
}

function colorLovibondToEbc(colorLovibond: number | null): number | null {
  if (colorLovibond === null) return null;
  if (!Number.isFinite(colorLovibond) || colorLovibond < 0) return null;
  // Pragmatic approximation for defaults lookup. (We only need a reasonable magnitude.)
  return colorLovibond * 1.97;
}

function mashPhModelKeyFromMaltClass(maltClass: string) {
  if (maltClass === "base") return "base_pale";
  if (maltClass === "crystal") return "crystal";
  if (maltClass === "roast") return "roasted";
  if (maltClass === "acid") return "acidulated";
  return "base_pale";
}

function parseSaltAdditions(value: unknown, field: string): SaltAddition[] {
  if (!Array.isArray(value)) {
    throw new BadRequestError("invalid_salt_additions", `Body.${field} must be an array`);
  }
  return value.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const saltKey = o.saltKey as SaltKey;
    if (typeof saltKey !== "string") {
      throw new BadRequestError("invalid_salt_key", `Body.${field}[${idx}].saltKey must be a string`);
    }
    const grams = typeof o.grams === "number" ? o.grams : NaN;
    if (!Number.isFinite(grams) || grams < 0) {
      throw new BadRequestError("invalid_salt_grams", `Body.${field}[${idx}].grams must be a number >= 0`);
    }
    return { saltKey, grams };
  });
}

export type MashComputeAndSaveInput = {
  sourceWaterProfileId: string;
  dilutionWaterProfileId: string | null;
  tapWaterVolumeLiters: number;
  dilutionWaterVolumeLiters: number;

  mashStartingAlkalinityPpmCaCO3: number;
  mashStartingPh: number;
  mashTargetPh: number;
  mashAcidType: SpargeAcidType;
  mashStrengthKind: StrengthKind;
  mashStrengthValue: number | null;
  mashAcidificationMode: Mode;
  mashManualAcidAddedMl: number | null;
  mashManualAcidAddedGrams: number | null;

  mashSaltAdditionsJson: unknown;

  grist?: Array<{ amountKg: number; colorLovibond: number | null; maltClass: "base" | "crystal" | "roast" | "acid" }>;
};

export type SpargeComputeAndSaveInput = {
  spargeWaterProfileId: string;
  spargeSaltAdditionsJson: unknown;

  spargeStartingAlkalinityPpmCaCO3: number;
  spargeStartingPh: number;
  spargeTargetPh: number;
  spargeVolumeLiters: number;
  spargeAcidType: SpargeAcidType;
  spargeStrengthKind: StrengthKind;
  spargeStrengthValue: number | null;
  spargeAcidificationMode: Mode;
  spargeManualAcidAddedMl: number | null;
  spargeManualAcidAddedGrams: number | null;
};

export type BoilComputeAndSaveInput = {
  boilSourceWaterProfileId: string;
  boilDilutionWaterProfileId: string | null;
  boilTapWaterVolumeLiters: number;
  boilDilutionWaterVolumeLiters: number;

  boilStartingAlkalinityPpmCaCO3: number;
  boilStartingPh: number;
  boilTargetPh: number;
  boilAcidType: SpargeAcidType;
  boilStrengthKind: StrengthKind;
  boilStrengthValue: number | null;
  boilAcidificationMode: Mode;
  boilManualAcidAddedMl: number | null;
  boilManualAcidAddedGrams: number | null;

  boilSaltAdditionsJson: unknown;
};

export class RecipeWaterComputeAndSaveService {
  private readonly workspaces: WorkspacesService;
  private readonly recipes: RecipesService;
  private readonly settings: RecipeWaterSettingsService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
    this.recipes = new RecipesService(prisma);
    this.settings = new RecipeWaterSettingsService(prisma);
  }

  private async loadProfileLite(profileId: string): Promise<WaterProfileLite> {
    const profile = await this.prisma.waterProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        scope: true,
        workspaceId: true,
        calcium: true,
        magnesium: true,
        sodium: true,
        sulfate: true,
        chloride: true,
        bicarbonate: true,
      },
    });
    if (!profile) throw new BadRequestError("invalid_profile_id", "Unknown water profile id");
    return profile as any as WaterProfileLite;
  }

  private async assertProfileAccessible(workspaceId: string, profileId: string) {
    const profile = await this.prisma.waterProfile.findUnique({ where: { id: profileId }, select: { id: true, scope: true, workspaceId: true } });
    if (!profile) throw new BadRequestError("invalid_profile_id", "Unknown water profile id");
    const scope = profile.scope as "system" | "public" | "account";
    if (scope === "system" || scope === "public") return;
    if (scope === "account" && profile.workspaceId === workspaceId) return;
    throw new BadRequestError("profile_not_accessible", "Water profile is not accessible to this workspace");
  }

  async computeAndSaveMash(userId: string, workspaceId: string, recipeId: string, input: MashComputeAndSaveInput) {
    await this.workspaces.assertMembership(userId, workspaceId);
    await this.recipes.getRecipe(userId, workspaceId, recipeId);

    if (!input.sourceWaterProfileId) {
      throw new BadRequestError("invalid_profile_id", "Body.sourceWaterProfileId is required");
    }

    await this.assertProfileAccessible(workspaceId, input.sourceWaterProfileId);
    if (input.dilutionWaterProfileId) await this.assertProfileAccessible(workspaceId, input.dilutionWaterProfileId);

    const tap = ensureFinite(input.tapWaterVolumeLiters, "tapWaterVolumeLiters");
    const dil = ensureFinite(input.dilutionWaterVolumeLiters, "dilutionWaterVolumeLiters");
    const derivedVolumeLiters = Math.max(0, tap) + Math.max(0, dil);
    if (!(derivedVolumeLiters > 0)) {
      throw new BadRequestError("invalid_volume_liters", "Mash water volume must be > 0 (tap+dilution volumes).");
    }

    const source = await this.loadProfileLite(input.sourceWaterProfileId);
    const dilution = input.dilutionWaterProfileId ? await this.loadProfileLite(input.dilutionWaterProfileId) : null;
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

    const acidType = input.mashAcidType;
    if (typeof acidType !== "string") throw new BadRequestError("invalid_acid_type", "Body.mashAcidType is required");

    const strengthKind = input.mashStrengthKind;
    const strengthValue = input.mashStrengthValue;
    const strength = parseStrength({ strengthKind, strengthValue });

    const mashMode = input.mashAcidificationMode === "manual" ? "manual" : "targetPh";

    const startingAlkalinityPpmCaCO3 = ensureFinite(input.mashStartingAlkalinityPpmCaCO3, "mashStartingAlkalinityPpmCaCO3");
    const startingPh = ensureFinite(input.mashStartingPh, "mashStartingPh");
    const targetPh = ensureFinite(input.mashTargetPh, "mashTargetPh");
    const grist = Array.isArray(input.grist) ? input.grist : [];
    const hasGrist = grist.length > 0;

    const nowIso = new Date().toISOString();

    let acidResult: any;
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
        strengthValue: strengthKind === "solid" ? null : (strength as any).value ?? null,
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

        const acidAdded_mEqPerL = (manual.predicted as any)?.debug?.acidRequired_mEqPerL as number | undefined;
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
        strengthValue: strengthKind === "solid" ? null : (strength as any).value ?? null,
        result: hasGrist ? (acidResult as any).predicted ?? acidResult : acidResult,
      });
    }

    const acidPredicted = mashMode === "manual" ? (acidResult as any).predicted : acidResult;
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

    if (mashMode === "manual") {
      const manual = acidResult as any;
      patch.mashManualLastAchievedPh = manual.achievedPh;
      patch.mashManualLastFinalAlkalinityPpmCaCO3 = manual.predicted.finalAlkalinityPpmCaCO3;
      patch.mashManualLastSulfateAddedPpm = manual.predicted.sulfateAddedPpm;
      patch.mashManualLastChlorideAddedPpm = manual.predicted.chlorideAddedPpm;
      patch.mashManualLastCalculatedAt = nowIso;

      patch.mashLastFinalAlkalinityPpmCaCO3 = manual.predicted.finalAlkalinityPpmCaCO3;
      patch.mashLastSulfateAddedPpm = manual.predicted.sulfateAddedPpm;
      patch.mashLastChlorideAddedPpm = manual.predicted.chlorideAddedPpm;
      patch.mashLastCalculatedAt = nowIso;
    } else {
      const r = acidResult as any;
      patch.mashLastAcidRequiredMl = r.acidRequiredMl ?? null;
      patch.mashLastAcidRequiredTsp = r.acidRequiredTsp ?? null;
      patch.mashLastAcidRequiredGrams = r.acidRequiredGrams ?? null;
      patch.mashLastAcidRequiredKg = r.acidRequiredKg ?? null;
      patch.mashLastFinalAlkalinityPpmCaCO3 = r.finalAlkalinityPpmCaCO3 ?? null;
      patch.mashLastSulfateAddedPpm = r.sulfateAddedPpm ?? null;
      patch.mashLastChlorideAddedPpm = r.chlorideAddedPpm ?? null;
      patch.mashLastCalculatedAt = nowIso;
    }

    await this.settings.upsert(userId, workspaceId, recipeId, patch as any);

    return {
      settings: { recipeId },
      salts: { result: salts, derivation: saltsDerivation },
      acid:
        mashMode === "manual"
          ? { kind: "mash_acidification_manual", mode: "manual", result: acidResult, derivation: acidDerivation as WaterCalcDerivation }
          : hasGrist
            ? { kind: "mash_acidification_target_mash_ph", mode: "targetPh", result: acidResult, derivation: acidDerivation as WaterCalcDerivation }
            : { kind: "mash_acidification", mode: "targetPh", result: acidResult, derivation: acidDerivation as WaterCalcDerivation },
      overall: { result: overall, derivation: overallDerivation },
    };
  }

  async computeAndSaveSparge(userId: string, workspaceId: string, recipeId: string, input: SpargeComputeAndSaveInput) {
    await this.workspaces.assertMembership(userId, workspaceId);
    await this.recipes.getRecipe(userId, workspaceId, recipeId);

    if (!input.spargeWaterProfileId) {
      throw new BadRequestError("invalid_profile_id", "Body.spargeWaterProfileId is required");
    }
    await this.assertProfileAccessible(workspaceId, input.spargeWaterProfileId);

    const baseProfileRec = await this.loadProfileLite(input.spargeWaterProfileId);
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

    const acidType = input.spargeAcidType;
    if (typeof acidType !== "string") throw new BadRequestError("invalid_acid_type", "Body.spargeAcidType is required");
    const strengthKind = input.spargeStrengthKind;
    const strengthValue = input.spargeStrengthValue;
    const strength = parseStrength({ strengthKind, strengthValue });

    const startingAlkalinityPpmCaCO3 = ensureFinite(input.spargeStartingAlkalinityPpmCaCO3, "spargeStartingAlkalinityPpmCaCO3");
    const startingPh = ensureFinite(input.spargeStartingPh, "spargeStartingPh");
    const targetPh = ensureFinite(input.spargeTargetPh, "spargeTargetPh");

    const nowIso = new Date().toISOString();
    const mode = input.spargeAcidificationMode === "manual" ? "manual" : "targetPh";

    let acidResult: any;
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
        strengthValue: strengthKind === "solid" ? null : (strength as any).value ?? null,
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
        strengthValue: strengthKind === "solid" ? null : (strength as any).value ?? null,
        result: r,
      });
    }

    const acidPredicted = mode === "manual" ? (acidResult as any).predicted : acidResult;

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

    if (mode === "manual") {
      patch.spargeLastAcidRequiredMl = (acidPredicted as any).acidRequiredMl ?? null;
      patch.spargeLastAcidRequiredTsp = (acidPredicted as any).acidRequiredTsp ?? null;
      patch.spargeLastAcidRequiredGrams = (acidPredicted as any).acidRequiredGrams ?? null;
      patch.spargeLastAcidRequiredKg = (acidPredicted as any).acidRequiredKg ?? null;
      patch.spargeLastFinalAlkalinityPpmCaCO3 = acidPredicted.finalAlkalinityPpmCaCO3;
      patch.spargeLastSulfateAddedPpm = acidPredicted.sulfateAddedPpm;
      patch.spargeLastChlorideAddedPpm = acidPredicted.chlorideAddedPpm;
      patch.spargeLastCalculatedAt = nowIso;

      patch.spargeManualLastAchievedPh = (acidResult as any).achievedPh;
      patch.spargeManualLastFinalAlkalinityPpmCaCO3 = acidPredicted.finalAlkalinityPpmCaCO3;
      patch.spargeManualLastSulfateAddedPpm = acidPredicted.sulfateAddedPpm;
      patch.spargeManualLastChlorideAddedPpm = acidPredicted.chlorideAddedPpm;
      patch.spargeManualLastCalculatedAt = nowIso;
    } else {
      patch.spargeLastAcidRequiredMl = (acidResult as any).acidRequiredMl ?? null;
      patch.spargeLastAcidRequiredTsp = (acidResult as any).acidRequiredTsp ?? null;
      patch.spargeLastAcidRequiredGrams = (acidResult as any).acidRequiredGrams ?? null;
      patch.spargeLastAcidRequiredKg = (acidResult as any).acidRequiredKg ?? null;
      patch.spargeLastFinalAlkalinityPpmCaCO3 = (acidResult as any).finalAlkalinityPpmCaCO3 ?? null;
      patch.spargeLastSulfateAddedPpm = (acidResult as any).sulfateAddedPpm ?? null;
      patch.spargeLastChlorideAddedPpm = (acidResult as any).chlorideAddedPpm ?? null;
      patch.spargeLastCalculatedAt = nowIso;
    }

    await this.settings.upsert(userId, workspaceId, recipeId, patch as any);

    return {
      settings: { recipeId },
      salts: { result: salts, derivation: saltsDerivation },
      acid:
        mode === "manual"
          ? { kind: "sparge_acidification_manual", mode: "manual", result: acidResult, derivation: acidDerivation as WaterCalcDerivation }
          : { kind: "sparge_acidification", mode: "targetPh", result: acidResult, derivation: acidDerivation as WaterCalcDerivation },
    };
  }

  async computeAndSaveBoil(userId: string, workspaceId: string, recipeId: string, input: BoilComputeAndSaveInput) {
    await this.workspaces.assertMembership(userId, workspaceId);
    await this.recipes.getRecipe(userId, workspaceId, recipeId);

    if (!input.boilSourceWaterProfileId) {
      throw new BadRequestError("invalid_profile_id", "Body.boilSourceWaterProfileId is required");
    }

    await this.assertProfileAccessible(workspaceId, input.boilSourceWaterProfileId);
    if (input.boilDilutionWaterProfileId) await this.assertProfileAccessible(workspaceId, input.boilDilutionWaterProfileId);

    const tap = ensureFinite(input.boilTapWaterVolumeLiters, "boilTapWaterVolumeLiters");
    const dil = ensureFinite(input.boilDilutionWaterVolumeLiters, "boilDilutionWaterVolumeLiters");
    const derivedVolumeLiters = Math.max(0, tap) + Math.max(0, dil);
    if (!(derivedVolumeLiters > 0)) {
      throw new BadRequestError("invalid_volume_liters", "Boil water volume must be > 0 (tap+dilution volumes).");
    }

    const source = await this.loadProfileLite(input.boilSourceWaterProfileId);
    const dilution = input.boilDilutionWaterProfileId ? await this.loadProfileLite(input.boilDilutionWaterProfileId) : null;
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

    const acidType = input.boilAcidType;
    if (typeof acidType !== "string") throw new BadRequestError("invalid_acid_type", "Body.boilAcidType is required");
    const strengthKind = input.boilStrengthKind;
    const strengthValue = input.boilStrengthValue;
    const strength = parseStrength({ strengthKind, strengthValue });

    const startingAlkalinityPpmCaCO3 = ensureFinite(input.boilStartingAlkalinityPpmCaCO3, "boilStartingAlkalinityPpmCaCO3");
    const startingPh = ensureFinite(input.boilStartingPh, "boilStartingPh");
    const targetPh = ensureFinite(input.boilTargetPh, "boilTargetPh");

    const nowIso = new Date().toISOString();
    const mode = input.boilAcidificationMode === "manual" ? "manual" : "targetPh";

    let acidResult: any;
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
        strengthValue: strengthKind === "solid" ? null : (strength as any).value ?? null,
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
        strengthValue: strengthKind === "solid" ? null : (strength as any).value ?? null,
        result: r,
      });
    }

    const acidPredicted = mode === "manual" ? (acidResult as any).predicted : acidResult;
    const ionsPpm = combineAfterSaltsAndAcid({ afterSalts: salts.resultingProfile, acidResult: acidPredicted });
    const alkalinityAfterSaltsPpmCaCO3 = alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult(salts);

    const overall = {
      calculatedAt: nowIso,
      ionsPpm,
      finalAlkalinityPpmCaCO3: acidPredicted.finalAlkalinityPpmCaCO3,
      ph: { kind: mode === "manual" ? "estimated" : "target", value: mode === "manual" ? (acidResult as any).achievedPh : targetPh },
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
        { id: "targetPh", value: { kind: "number", value: mode === "manual" ? (acidResult as any).achievedPh : targetPh, unit: "pH" } },
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

    if (mode === "manual") {
      patch.boilLastAcidRequiredMl = (acidPredicted as any).acidRequiredMl ?? null;
      patch.boilLastAcidRequiredTsp = (acidPredicted as any).acidRequiredTsp ?? null;
      patch.boilLastAcidRequiredGrams = (acidPredicted as any).acidRequiredGrams ?? null;
      patch.boilLastAcidRequiredKg = (acidPredicted as any).acidRequiredKg ?? null;
      patch.boilLastFinalAlkalinityPpmCaCO3 = acidPredicted.finalAlkalinityPpmCaCO3;
      patch.boilLastSulfateAddedPpm = acidPredicted.sulfateAddedPpm;
      patch.boilLastChlorideAddedPpm = acidPredicted.chlorideAddedPpm;
      patch.boilLastCalculatedAt = nowIso;

      patch.boilManualLastAchievedPh = (acidResult as any).achievedPh;
      patch.boilManualLastFinalAlkalinityPpmCaCO3 = acidPredicted.finalAlkalinityPpmCaCO3;
      patch.boilManualLastSulfateAddedPpm = acidPredicted.sulfateAddedPpm;
      patch.boilManualLastChlorideAddedPpm = acidPredicted.chlorideAddedPpm;
      patch.boilManualLastCalculatedAt = nowIso;
    } else {
      patch.boilLastAcidRequiredMl = (acidResult as any).acidRequiredMl ?? null;
      patch.boilLastAcidRequiredTsp = (acidResult as any).acidRequiredTsp ?? null;
      patch.boilLastAcidRequiredGrams = (acidResult as any).acidRequiredGrams ?? null;
      patch.boilLastAcidRequiredKg = (acidResult as any).acidRequiredKg ?? null;
      patch.boilLastFinalAlkalinityPpmCaCO3 = (acidResult as any).finalAlkalinityPpmCaCO3 ?? null;
      patch.boilLastSulfateAddedPpm = (acidResult as any).sulfateAddedPpm ?? null;
      patch.boilLastChlorideAddedPpm = (acidResult as any).chlorideAddedPpm ?? null;
      patch.boilLastCalculatedAt = nowIso;
    }

    await this.settings.upsert(userId, workspaceId, recipeId, patch as any);

    return {
      settings: { recipeId },
      salts: { result: salts, derivation: saltsDerivation },
      acid:
        mode === "manual"
          ? { kind: "boil_acidification_manual", mode: "manual", result: acidResult, derivation: acidDerivation as WaterCalcDerivation }
          : { kind: "boil_acidification", mode: "targetPh", result: acidResult, derivation: acidDerivation as WaterCalcDerivation },
      overall: { result: overall, derivation: overallDerivation },
    };
  }
}

