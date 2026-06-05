import { Prisma, type PrismaClient } from "@prisma/client";
import { BadRequestError, ForbiddenError } from "../errors.js";
import { WorkspacesService } from "./workspacesService.js";
import { RecipesService } from "./recipesService.js";

export type UpsertRecipeWaterSettingsInput = {
  sourceWaterProfileId?: string | null | undefined;
  targetWaterProfileId?: string | null | undefined;
  dilutionWaterProfileId?: string | null | undefined;

  tapWaterVolumeLiters?: number | null | undefined;
  dilutionWaterVolumeLiters?: number | null | undefined;

  mashStartingAlkalinityPpmCaCO3?: number | undefined;
  mashStartingPh?: number | undefined;
  mashTargetPh?: number | undefined;
  mashWaterVolumeLiters?: number | undefined;
  mashAcidType?: string | undefined;
  mashStrengthKind?: string | undefined;
  mashStrengthValue?: number | null | undefined;

  mashLastAcidRequiredMl?: number | null | undefined;
  mashLastAcidRequiredTsp?: number | null | undefined;
  mashLastAcidRequiredGrams?: number | null | undefined;
  mashLastAcidRequiredKg?: number | null | undefined;
  mashLastFinalAlkalinityPpmCaCO3?: number | null | undefined;
  mashLastSulfateAddedPpm?: number | null | undefined;
  mashLastChlorideAddedPpm?: number | null | undefined;
  mashLastCalculatedAt?: Date | null | undefined;

  mashAcidificationMode?: string | undefined;
  mashManualAcidAddedMl?: number | null | undefined;
  mashManualAcidAddedGrams?: number | null | undefined;
  mashManualLastAchievedPh?: number | null | undefined;
  mashManualLastFinalAlkalinityPpmCaCO3?: number | null | undefined;
  mashManualLastSulfateAddedPpm?: number | null | undefined;
  mashManualLastChlorideAddedPpm?: number | null | undefined;
  mashManualLastCalculatedAt?: Date | null | undefined;

  mashSaltAdditionsJson?: unknown | undefined;
  mashSaltsLastResultJson?: unknown | undefined;

  mashOverallLastResultJson?: unknown | undefined;
  mashOverallLastCalculatedAt?: Date | null | undefined;

  mashGristImportedJson?: unknown | undefined;
  mashGristImportedAt?: Date | null | undefined;
  mashGristSourceRecipeUpdatedAt?: Date | null | undefined;

  spargeWaterProfileId?: string | null | undefined;
  spargeStartingAlkalinityPpmCaCO3?: number | undefined;
  spargeStartingPh?: number | undefined;
  spargeTargetPh?: number | undefined;
  spargeVolumeLiters?: number | undefined;
  spargeAcidType?: string | undefined;
  spargeStrengthKind?: string | undefined;
  spargeStrengthValue?: number | null | undefined;

  spargeLastAcidRequiredMl?: number | null | undefined;
  spargeLastAcidRequiredTsp?: number | null | undefined;
  spargeLastAcidRequiredGrams?: number | null | undefined;
  spargeLastAcidRequiredKg?: number | null | undefined;
  spargeLastFinalAlkalinityPpmCaCO3?: number | null | undefined;
  spargeLastSulfateAddedPpm?: number | null | undefined;
  spargeLastChlorideAddedPpm?: number | null | undefined;
  spargeLastCalculatedAt?: Date | null | undefined;

  spargeAcidificationMode?: string | undefined;
  spargeManualAcidAddedMl?: number | null | undefined;
  spargeManualAcidAddedGrams?: number | null | undefined;
  spargeManualLastAchievedPh?: number | null | undefined;
  spargeManualLastFinalAlkalinityPpmCaCO3?: number | null | undefined;
  spargeManualLastSulfateAddedPpm?: number | null | undefined;
  spargeManualLastChlorideAddedPpm?: number | null | undefined;
  spargeManualLastCalculatedAt?: Date | null | undefined;

  spargeSaltAdditionsJson?: unknown | undefined;
  spargeSaltsLastResultJson?: unknown | undefined;

  spargeStepTemperatureC?: number | null | undefined;

  spargeStepTimeMin?: number | null | undefined;
  spargeStepRampMin?: number | null | undefined;
  spargeMethodType?: string | null | undefined;

  // Boil/kettle add-on water (v0)
  boilSourceWaterProfileId?: string | null | undefined;
  boilTargetWaterProfileId?: string | null | undefined;
  boilDilutionWaterProfileId?: string | null | undefined;

  boilTapWaterVolumeLiters?: number | null | undefined;
  boilDilutionWaterVolumeLiters?: number | null | undefined;

  boilStartingAlkalinityPpmCaCO3?: number | undefined;
  boilStartingPh?: number | undefined;
  boilTargetPh?: number | undefined;
  boilWaterVolumeLiters?: number | undefined;
  boilAcidType?: string | undefined;
  boilStrengthKind?: string | undefined;
  boilStrengthValue?: number | null | undefined;

  boilLastAcidRequiredMl?: number | null | undefined;
  boilLastAcidRequiredTsp?: number | null | undefined;
  boilLastAcidRequiredGrams?: number | null | undefined;
  boilLastAcidRequiredKg?: number | null | undefined;
  boilLastFinalAlkalinityPpmCaCO3?: number | null | undefined;
  boilLastSulfateAddedPpm?: number | null | undefined;
  boilLastChlorideAddedPpm?: number | null | undefined;
  boilLastCalculatedAt?: Date | null | undefined;

  boilAcidificationMode?: string | undefined;
  boilManualAcidAddedMl?: number | null | undefined;
  boilManualAcidAddedGrams?: number | null | undefined;
  boilManualLastAchievedPh?: number | null | undefined;
  boilManualLastFinalAlkalinityPpmCaCO3?: number | null | undefined;
  boilManualLastSulfateAddedPpm?: number | null | undefined;
  boilManualLastChlorideAddedPpm?: number | null | undefined;
  boilManualLastCalculatedAt?: Date | null | undefined;

  boilSaltAdditionsJson?: unknown | undefined;
  boilSaltsLastResultJson?: unknown | undefined;

  boilOverallLastResultJson?: unknown | undefined;
  boilOverallLastCalculatedAt?: Date | null | undefined;
};

function ensureFinite(n: unknown, field: string) {
  if (typeof n !== "number" || Number.isNaN(n) || !Number.isFinite(n)) {
    throw new BadRequestError("invalid_number", `Body.${field} must be a number`);
  }
  return n;
}

const ALLOWED_MASH_SALT_KEYS = new Set([
  "gypsum",
  "calcium_chloride",
  "epsom",
  "table_salt",
  "baking_soda",
]);

function validateSaltAdditionsJson(value: unknown, field: string) {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new BadRequestError("invalid_salt_additions", `Body.${field} must be an array`);
  }

  return value.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const saltKey = o['saltKey'];
    const grams = o['grams'];
    if (typeof saltKey !== "string" || !ALLOWED_MASH_SALT_KEYS.has(saltKey)) {
      throw new BadRequestError(
        "invalid_salt_key",
        `Body.${field}[${idx}].saltKey is invalid`,
      );
    }
    if (typeof grams !== "number" || !Number.isFinite(grams) || grams < 0) {
      throw new BadRequestError(
        "invalid_salt_grams",
        `Body.${field}[${idx}].grams must be a number >= 0`,
      );
    }
    return { saltKey, grams };
  });
}

export class RecipeWaterSettingsService {
  private readonly workspaces: WorkspacesService;
  private readonly recipes: RecipesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
    this.recipes = new RecipesService(prisma);
  }

  toUpsertInputFromPutBody(body: Record<string, unknown>): UpsertRecipeWaterSettingsInput {
    return {
      sourceWaterProfileId:
        typeof body["sourceWaterProfileId"] === "string"
          ? body["sourceWaterProfileId"]
          : body["sourceWaterProfileId"] === null
            ? null
            : undefined,
      targetWaterProfileId:
        typeof body["targetWaterProfileId"] === "string"
          ? body["targetWaterProfileId"]
          : body["targetWaterProfileId"] === null
            ? null
            : undefined,
      dilutionWaterProfileId:
        typeof body["dilutionWaterProfileId"] === "string"
          ? body["dilutionWaterProfileId"]
          : body["dilutionWaterProfileId"] === null
            ? null
            : undefined,

      tapWaterVolumeLiters:
        typeof body["tapWaterVolumeLiters"] === "number"
          ? body["tapWaterVolumeLiters"]
          : body["tapWaterVolumeLiters"] === null
            ? null
            : undefined,
      dilutionWaterVolumeLiters:
        typeof body["dilutionWaterVolumeLiters"] === "number"
          ? body["dilutionWaterVolumeLiters"]
          : body["dilutionWaterVolumeLiters"] === null
            ? null
            : undefined,

      mashStartingAlkalinityPpmCaCO3:
        typeof body["mashStartingAlkalinityPpmCaCO3"] === "number"
          ? body["mashStartingAlkalinityPpmCaCO3"]
          : undefined,
      mashStartingPh: typeof body["mashStartingPh"] === "number" ? body["mashStartingPh"] : undefined,
      mashTargetPh: typeof body["mashTargetPh"] === "number" ? body["mashTargetPh"] : undefined,
      mashWaterVolumeLiters:
        typeof body["mashWaterVolumeLiters"] === "number" ? body["mashWaterVolumeLiters"] : undefined,
      mashAcidType: typeof body["mashAcidType"] === "string" ? body["mashAcidType"] : undefined,
      mashStrengthKind: typeof body["mashStrengthKind"] === "string" ? body["mashStrengthKind"] : undefined,
      mashStrengthValue:
        typeof body["mashStrengthValue"] === "number"
          ? body["mashStrengthValue"]
          : body["mashStrengthValue"] === null
            ? null
            : undefined,

      mashLastAcidRequiredMl:
        typeof body["mashLastAcidRequiredMl"] === "number"
          ? body["mashLastAcidRequiredMl"]
          : body["mashLastAcidRequiredMl"] === null
            ? null
            : undefined,
      mashLastAcidRequiredTsp:
        typeof body["mashLastAcidRequiredTsp"] === "number"
          ? body["mashLastAcidRequiredTsp"]
          : body["mashLastAcidRequiredTsp"] === null
            ? null
            : undefined,
      mashLastAcidRequiredGrams:
        typeof body["mashLastAcidRequiredGrams"] === "number"
          ? body["mashLastAcidRequiredGrams"]
          : body["mashLastAcidRequiredGrams"] === null
            ? null
            : undefined,
      mashLastAcidRequiredKg:
        typeof body["mashLastAcidRequiredKg"] === "number"
          ? body["mashLastAcidRequiredKg"]
          : body["mashLastAcidRequiredKg"] === null
            ? null
            : undefined,
      mashLastFinalAlkalinityPpmCaCO3:
        typeof body["mashLastFinalAlkalinityPpmCaCO3"] === "number"
          ? body["mashLastFinalAlkalinityPpmCaCO3"]
          : body["mashLastFinalAlkalinityPpmCaCO3"] === null
            ? null
            : undefined,
      mashLastSulfateAddedPpm:
        typeof body["mashLastSulfateAddedPpm"] === "number"
          ? body["mashLastSulfateAddedPpm"]
          : body["mashLastSulfateAddedPpm"] === null
            ? null
            : undefined,
      mashLastChlorideAddedPpm:
        typeof body["mashLastChlorideAddedPpm"] === "number"
          ? body["mashLastChlorideAddedPpm"]
          : body["mashLastChlorideAddedPpm"] === null
            ? null
            : undefined,
      mashLastCalculatedAt:
        typeof body["mashLastCalculatedAt"] === "string" ? new Date(body["mashLastCalculatedAt"]) : undefined,

      mashAcidificationMode:
        typeof body["mashAcidificationMode"] === "string" ? body["mashAcidificationMode"] : undefined,
      mashManualAcidAddedMl:
        typeof body["mashManualAcidAddedMl"] === "number"
          ? body["mashManualAcidAddedMl"]
          : body["mashManualAcidAddedMl"] === null
            ? null
            : undefined,
      mashManualAcidAddedGrams:
        typeof body["mashManualAcidAddedGrams"] === "number"
          ? body["mashManualAcidAddedGrams"]
          : body["mashManualAcidAddedGrams"] === null
            ? null
            : undefined,
      mashManualLastAchievedPh:
        typeof body["mashManualLastAchievedPh"] === "number"
          ? body["mashManualLastAchievedPh"]
          : body["mashManualLastAchievedPh"] === null
            ? null
            : undefined,
      mashManualLastFinalAlkalinityPpmCaCO3:
        typeof body["mashManualLastFinalAlkalinityPpmCaCO3"] === "number"
          ? body["mashManualLastFinalAlkalinityPpmCaCO3"]
          : body["mashManualLastFinalAlkalinityPpmCaCO3"] === null
            ? null
            : undefined,
      mashManualLastSulfateAddedPpm:
        typeof body["mashManualLastSulfateAddedPpm"] === "number"
          ? body["mashManualLastSulfateAddedPpm"]
          : body["mashManualLastSulfateAddedPpm"] === null
            ? null
            : undefined,
      mashManualLastChlorideAddedPpm:
        typeof body["mashManualLastChlorideAddedPpm"] === "number"
          ? body["mashManualLastChlorideAddedPpm"]
          : body["mashManualLastChlorideAddedPpm"] === null
            ? null
            : undefined,
      mashManualLastCalculatedAt:
        typeof body["mashManualLastCalculatedAt"] === "string" ? new Date(body["mashManualLastCalculatedAt"]) : undefined,

      mashSaltAdditionsJson:
        body["mashSaltAdditionsJson"] === null || body["mashSaltAdditionsJson"] !== undefined
          ? body["mashSaltAdditionsJson"]
          : undefined,
      mashSaltsLastResultJson:
        body["mashSaltsLastResultJson"] === null || body["mashSaltsLastResultJson"] !== undefined
          ? body["mashSaltsLastResultJson"]
          : undefined,

      mashOverallLastResultJson:
        body["mashOverallLastResultJson"] === null || body["mashOverallLastResultJson"] !== undefined
          ? body["mashOverallLastResultJson"]
          : undefined,
      mashOverallLastCalculatedAt:
        typeof body["mashOverallLastCalculatedAt"] === "string"
          ? new Date(body["mashOverallLastCalculatedAt"])
          : body["mashOverallLastCalculatedAt"] === null
            ? null
            : undefined,

      mashGristImportedJson:
        body["mashGristImportedJson"] === null || body["mashGristImportedJson"] !== undefined
          ? body["mashGristImportedJson"]
          : undefined,
      mashGristImportedAt:
        typeof body["mashGristImportedAt"] === "string"
          ? new Date(body["mashGristImportedAt"])
          : body["mashGristImportedAt"] === null
            ? null
            : undefined,
      mashGristSourceRecipeUpdatedAt:
        typeof body["mashGristSourceRecipeUpdatedAt"] === "string"
          ? new Date(body["mashGristSourceRecipeUpdatedAt"])
          : body["mashGristSourceRecipeUpdatedAt"] === null
            ? null
            : undefined,

      spargeWaterProfileId:
        typeof body["spargeWaterProfileId"] === "string"
          ? body["spargeWaterProfileId"]
          : body["spargeWaterProfileId"] === null
            ? null
            : undefined,
      spargeStartingAlkalinityPpmCaCO3:
        typeof body["spargeStartingAlkalinityPpmCaCO3"] === "number"
          ? body["spargeStartingAlkalinityPpmCaCO3"]
          : undefined,
      spargeStartingPh: typeof body["spargeStartingPh"] === "number" ? body["spargeStartingPh"] : undefined,
      spargeTargetPh: typeof body["spargeTargetPh"] === "number" ? body["spargeTargetPh"] : undefined,
      spargeVolumeLiters: typeof body["spargeVolumeLiters"] === "number" ? body["spargeVolumeLiters"] : undefined,
      spargeAcidType: typeof body["spargeAcidType"] === "string" ? body["spargeAcidType"] : undefined,
      spargeStrengthKind: typeof body["spargeStrengthKind"] === "string" ? body["spargeStrengthKind"] : undefined,
      spargeStrengthValue:
        typeof body["spargeStrengthValue"] === "number"
          ? body["spargeStrengthValue"]
          : body["spargeStrengthValue"] === null
            ? null
            : undefined,

      spargeAcidificationMode:
        typeof body["spargeAcidificationMode"] === "string" ? body["spargeAcidificationMode"] : undefined,
      spargeManualAcidAddedMl:
        typeof body["spargeManualAcidAddedMl"] === "number"
          ? body["spargeManualAcidAddedMl"]
          : body["spargeManualAcidAddedMl"] === null
            ? null
            : undefined,
      spargeManualAcidAddedGrams:
        typeof body["spargeManualAcidAddedGrams"] === "number"
          ? body["spargeManualAcidAddedGrams"]
          : body["spargeManualAcidAddedGrams"] === null
            ? null
            : undefined,
      spargeManualLastAchievedPh:
        typeof body["spargeManualLastAchievedPh"] === "number"
          ? body["spargeManualLastAchievedPh"]
          : body["spargeManualLastAchievedPh"] === null
            ? null
            : undefined,
      spargeManualLastFinalAlkalinityPpmCaCO3:
        typeof body["spargeManualLastFinalAlkalinityPpmCaCO3"] === "number"
          ? body["spargeManualLastFinalAlkalinityPpmCaCO3"]
          : body["spargeManualLastFinalAlkalinityPpmCaCO3"] === null
            ? null
            : undefined,
      spargeManualLastSulfateAddedPpm:
        typeof body["spargeManualLastSulfateAddedPpm"] === "number"
          ? body["spargeManualLastSulfateAddedPpm"]
          : body["spargeManualLastSulfateAddedPpm"] === null
            ? null
            : undefined,
      spargeManualLastChlorideAddedPpm:
        typeof body["spargeManualLastChlorideAddedPpm"] === "number"
          ? body["spargeManualLastChlorideAddedPpm"]
          : body["spargeManualLastChlorideAddedPpm"] === null
            ? null
            : undefined,
      spargeManualLastCalculatedAt:
        typeof body["spargeManualLastCalculatedAt"] === "string"
          ? new Date(body["spargeManualLastCalculatedAt"])
          : body["spargeManualLastCalculatedAt"] === null
            ? null
            : undefined,

      spargeSaltAdditionsJson: body["spargeSaltAdditionsJson"] !== undefined ? body["spargeSaltAdditionsJson"] : undefined,
      spargeSaltsLastResultJson: body["spargeSaltsLastResultJson"] !== undefined ? body["spargeSaltsLastResultJson"] : undefined,
      spargeStepTemperatureC:
        typeof body["spargeStepTemperatureC"] === "number"
          ? body["spargeStepTemperatureC"]
          : body["spargeStepTemperatureC"] === null
            ? null
            : undefined,
      spargeStepTimeMin:
        typeof body["spargeStepTimeMin"] === "number"
          ? body["spargeStepTimeMin"]
          : body["spargeStepTimeMin"] === null
            ? null
            : undefined,
      spargeStepRampMin:
        typeof body["spargeStepRampMin"] === "number"
          ? body["spargeStepRampMin"]
          : body["spargeStepRampMin"] === null
            ? null
            : undefined,
      spargeMethodType:
        typeof body["spargeMethodType"] === "string"
          ? body["spargeMethodType"]
          : body["spargeMethodType"] === null
            ? null
            : undefined,

      spargeLastAcidRequiredMl:
        typeof body["spargeLastAcidRequiredMl"] === "number"
          ? body["spargeLastAcidRequiredMl"]
          : body["spargeLastAcidRequiredMl"] === null
            ? null
            : undefined,
      spargeLastAcidRequiredTsp:
        typeof body["spargeLastAcidRequiredTsp"] === "number"
          ? body["spargeLastAcidRequiredTsp"]
          : body["spargeLastAcidRequiredTsp"] === null
            ? null
            : undefined,
      spargeLastAcidRequiredGrams:
        typeof body["spargeLastAcidRequiredGrams"] === "number"
          ? body["spargeLastAcidRequiredGrams"]
          : body["spargeLastAcidRequiredGrams"] === null
            ? null
            : undefined,
      spargeLastAcidRequiredKg:
        typeof body["spargeLastAcidRequiredKg"] === "number"
          ? body["spargeLastAcidRequiredKg"]
          : body["spargeLastAcidRequiredKg"] === null
            ? null
            : undefined,
      spargeLastFinalAlkalinityPpmCaCO3:
        typeof body["spargeLastFinalAlkalinityPpmCaCO3"] === "number"
          ? body["spargeLastFinalAlkalinityPpmCaCO3"]
          : body["spargeLastFinalAlkalinityPpmCaCO3"] === null
            ? null
            : undefined,
      spargeLastSulfateAddedPpm:
        typeof body["spargeLastSulfateAddedPpm"] === "number"
          ? body["spargeLastSulfateAddedPpm"]
          : body["spargeLastSulfateAddedPpm"] === null
            ? null
            : undefined,
      spargeLastChlorideAddedPpm:
        typeof body["spargeLastChlorideAddedPpm"] === "number"
          ? body["spargeLastChlorideAddedPpm"]
          : body["spargeLastChlorideAddedPpm"] === null
            ? null
            : undefined,
      spargeLastCalculatedAt:
        typeof body["spargeLastCalculatedAt"] === "string" ? new Date(body["spargeLastCalculatedAt"]) : undefined,

      boilSourceWaterProfileId:
        typeof body["boilSourceWaterProfileId"] === "string"
          ? body["boilSourceWaterProfileId"]
          : body["boilSourceWaterProfileId"] === null
            ? null
            : undefined,
      boilTargetWaterProfileId:
        typeof body["boilTargetWaterProfileId"] === "string"
          ? body["boilTargetWaterProfileId"]
          : body["boilTargetWaterProfileId"] === null
            ? null
            : undefined,
      boilDilutionWaterProfileId:
        typeof body["boilDilutionWaterProfileId"] === "string"
          ? body["boilDilutionWaterProfileId"]
          : body["boilDilutionWaterProfileId"] === null
            ? null
            : undefined,

      boilTapWaterVolumeLiters:
        typeof body["boilTapWaterVolumeLiters"] === "number"
          ? body["boilTapWaterVolumeLiters"]
          : body["boilTapWaterVolumeLiters"] === null
            ? null
            : undefined,
      boilDilutionWaterVolumeLiters:
        typeof body["boilDilutionWaterVolumeLiters"] === "number"
          ? body["boilDilutionWaterVolumeLiters"]
          : body["boilDilutionWaterVolumeLiters"] === null
            ? null
            : undefined,

      boilStartingAlkalinityPpmCaCO3:
        typeof body["boilStartingAlkalinityPpmCaCO3"] === "number"
          ? body["boilStartingAlkalinityPpmCaCO3"]
          : undefined,
      boilStartingPh: typeof body["boilStartingPh"] === "number" ? body["boilStartingPh"] : undefined,
      boilTargetPh: typeof body["boilTargetPh"] === "number" ? body["boilTargetPh"] : undefined,
      boilWaterVolumeLiters:
        typeof body["boilWaterVolumeLiters"] === "number" ? body["boilWaterVolumeLiters"] : undefined,
      boilAcidType: typeof body["boilAcidType"] === "string" ? body["boilAcidType"] : undefined,
      boilStrengthKind: typeof body["boilStrengthKind"] === "string" ? body["boilStrengthKind"] : undefined,
      boilStrengthValue:
        typeof body["boilStrengthValue"] === "number"
          ? body["boilStrengthValue"]
          : body["boilStrengthValue"] === null
            ? null
            : undefined,

      boilAcidificationMode:
        typeof body["boilAcidificationMode"] === "string" ? body["boilAcidificationMode"] : undefined,
      boilManualAcidAddedMl:
        typeof body["boilManualAcidAddedMl"] === "number"
          ? body["boilManualAcidAddedMl"]
          : body["boilManualAcidAddedMl"] === null
            ? null
            : undefined,
      boilManualAcidAddedGrams:
        typeof body["boilManualAcidAddedGrams"] === "number"
          ? body["boilManualAcidAddedGrams"]
          : body["boilManualAcidAddedGrams"] === null
            ? null
            : undefined,
      boilManualLastAchievedPh:
        typeof body["boilManualLastAchievedPh"] === "number"
          ? body["boilManualLastAchievedPh"]
          : body["boilManualLastAchievedPh"] === null
            ? null
            : undefined,
      boilManualLastFinalAlkalinityPpmCaCO3:
        typeof body["boilManualLastFinalAlkalinityPpmCaCO3"] === "number"
          ? body["boilManualLastFinalAlkalinityPpmCaCO3"]
          : body["boilManualLastFinalAlkalinityPpmCaCO3"] === null
            ? null
            : undefined,
      boilManualLastSulfateAddedPpm:
        typeof body["boilManualLastSulfateAddedPpm"] === "number"
          ? body["boilManualLastSulfateAddedPpm"]
          : body["boilManualLastSulfateAddedPpm"] === null
            ? null
            : undefined,
      boilManualLastChlorideAddedPpm:
        typeof body["boilManualLastChlorideAddedPpm"] === "number"
          ? body["boilManualLastChlorideAddedPpm"]
          : body["boilManualLastChlorideAddedPpm"] === null
            ? null
            : undefined,
      boilManualLastCalculatedAt:
        typeof body["boilManualLastCalculatedAt"] === "string"
          ? new Date(body["boilManualLastCalculatedAt"])
          : body["boilManualLastCalculatedAt"] === null
            ? null
            : undefined,

      boilSaltAdditionsJson: body["boilSaltAdditionsJson"] !== undefined ? body["boilSaltAdditionsJson"] : undefined,
      boilSaltsLastResultJson: body["boilSaltsLastResultJson"] !== undefined ? body["boilSaltsLastResultJson"] : undefined,

      boilLastAcidRequiredMl:
        typeof body["boilLastAcidRequiredMl"] === "number"
          ? body["boilLastAcidRequiredMl"]
          : body["boilLastAcidRequiredMl"] === null
            ? null
            : undefined,
      boilLastAcidRequiredTsp:
        typeof body["boilLastAcidRequiredTsp"] === "number"
          ? body["boilLastAcidRequiredTsp"]
          : body["boilLastAcidRequiredTsp"] === null
            ? null
            : undefined,
      boilLastAcidRequiredGrams:
        typeof body["boilLastAcidRequiredGrams"] === "number"
          ? body["boilLastAcidRequiredGrams"]
          : body["boilLastAcidRequiredGrams"] === null
            ? null
            : undefined,
      boilLastAcidRequiredKg:
        typeof body["boilLastAcidRequiredKg"] === "number"
          ? body["boilLastAcidRequiredKg"]
          : body["boilLastAcidRequiredKg"] === null
            ? null
            : undefined,
      boilLastFinalAlkalinityPpmCaCO3:
        typeof body["boilLastFinalAlkalinityPpmCaCO3"] === "number"
          ? body["boilLastFinalAlkalinityPpmCaCO3"]
          : body["boilLastFinalAlkalinityPpmCaCO3"] === null
            ? null
            : undefined,
      boilLastSulfateAddedPpm:
        typeof body["boilLastSulfateAddedPpm"] === "number"
          ? body["boilLastSulfateAddedPpm"]
          : body["boilLastSulfateAddedPpm"] === null
            ? null
            : undefined,
      boilLastChlorideAddedPpm:
        typeof body["boilLastChlorideAddedPpm"] === "number"
          ? body["boilLastChlorideAddedPpm"]
          : body["boilLastChlorideAddedPpm"] === null
            ? null
            : undefined,
      boilLastCalculatedAt:
        typeof body["boilLastCalculatedAt"] === "string" ? new Date(body["boilLastCalculatedAt"]) : undefined,

      boilOverallLastResultJson: body["boilOverallLastResultJson"] !== undefined ? body["boilOverallLastResultJson"] : undefined,
      boilOverallLastCalculatedAt:
        typeof body["boilOverallLastCalculatedAt"] === "string" ? new Date(body["boilOverallLastCalculatedAt"]) : undefined,
    };
  }

  async get(userId: string, workspaceId: string, recipeId: string) {
    await this.workspaces.assertMembership(userId, workspaceId);
    await this.recipes.getRecipe(userId, workspaceId, recipeId);

    return this.prisma.recipeWaterSettings.findUnique({
      where: { recipeId },
    });
  }

  private async assertProfileAccessible(workspaceId: string, profileId: string) {
    const profile = await this.prisma.waterProfile.findUnique({ where: { id: profileId } });
    if (!profile) throw new BadRequestError("invalid_profile_id", "Unknown water profile id");

    const scope = profile.scope;
    if (scope === "system" || scope === "public") return;
    if (scope === "account" && profile.workspaceId === workspaceId) return;

    throw new ForbiddenError("profile_not_accessible", "Water profile is not accessible to this workspace");
  }

  async upsert(userId: string, workspaceId: string, recipeId: string, input: UpsertRecipeWaterSettingsInput) {
    await this.workspaces.assertMembership(userId, workspaceId);
    await this.recipes.getRecipe(userId, workspaceId, recipeId);

    if (input.sourceWaterProfileId) await this.assertProfileAccessible(workspaceId, input.sourceWaterProfileId);
    if (input.targetWaterProfileId) await this.assertProfileAccessible(workspaceId, input.targetWaterProfileId);
    if (input.dilutionWaterProfileId) await this.assertProfileAccessible(workspaceId, input.dilutionWaterProfileId);
    if (input.spargeWaterProfileId) await this.assertProfileAccessible(workspaceId, input.spargeWaterProfileId);
    if (input.boilSourceWaterProfileId) await this.assertProfileAccessible(workspaceId, input.boilSourceWaterProfileId);
    if (input.boilTargetWaterProfileId) await this.assertProfileAccessible(workspaceId, input.boilTargetWaterProfileId);
    if (input.boilDilutionWaterProfileId)
      await this.assertProfileAccessible(workspaceId, input.boilDilutionWaterProfileId);

    const existing = await this.prisma.recipeWaterSettings.findUnique({ where: { recipeId } });
    const data: Record<string, unknown> = { workspaceId, recipeId };

    // The dynamic-key field-loop pattern below iterates over `as const` arrays of field
    // names defined on UpsertRecipeWaterSettingsInput; this alias avoids `(input as any)[f]`
    // at every site while keeping `input` typed for direct named access.
    const inputRec: Record<string, unknown> = input;

    if (input.sourceWaterProfileId !== undefined) data['sourceWaterProfileId'] = input.sourceWaterProfileId;
    if (input.targetWaterProfileId !== undefined) data['targetWaterProfileId'] = input.targetWaterProfileId;
    if (input.dilutionWaterProfileId !== undefined)
      data['dilutionWaterProfileId'] = input.dilutionWaterProfileId;
    if (input.spargeWaterProfileId !== undefined) data['spargeWaterProfileId'] = input.spargeWaterProfileId;
    if (input.boilSourceWaterProfileId !== undefined) data['boilSourceWaterProfileId'] = input.boilSourceWaterProfileId;
    if (input.boilTargetWaterProfileId !== undefined) data['boilTargetWaterProfileId'] = input.boilTargetWaterProfileId;
    if (input.boilDilutionWaterProfileId !== undefined)
      data['boilDilutionWaterProfileId'] = input.boilDilutionWaterProfileId;

    const mixingNumericFields = ["tapWaterVolumeLiters", "dilutionWaterVolumeLiters"] as const;
    for (const f of mixingNumericFields) {
      const v = inputRec[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }

    // Single source of truth (mash page): mash water volume is derived from mixing volumes.
    // If mixing volumes exist (either in the request or already persisted), keep mashWaterVolumeLiters consistent with:
    //   tapWaterVolumeLiters + dilutionWaterVolumeLiters
    //
    // Legacy/back-compat: if mixing volumes are both zero/absent, we still allow `mashWaterVolumeLiters` to be set.
    const hasMixingUpdate =
      input.tapWaterVolumeLiters !== undefined || input.dilutionWaterVolumeLiters !== undefined;

    const tap =
      input.tapWaterVolumeLiters === null
        ? 0
        : typeof input.tapWaterVolumeLiters === "number"
          ? input.tapWaterVolumeLiters
          : typeof existing?.tapWaterVolumeLiters === "number"
            ? existing.tapWaterVolumeLiters
            : 0;
    const dil =
      input.dilutionWaterVolumeLiters === null
        ? 0
        : typeof input.dilutionWaterVolumeLiters === "number"
          ? input.dilutionWaterVolumeLiters
          : typeof existing?.dilutionWaterVolumeLiters === "number"
            ? existing.dilutionWaterVolumeLiters
            : 0;
    const derivedMashVolume = Math.max(0, tap) + Math.max(0, dil);
    if (derivedMashVolume > 0 || hasMixingUpdate) {
      // If caller explicitly updates mixing volumes to 0, derivedMashVolume will be 0; keep DB consistent anyway.
      data['mashWaterVolumeLiters'] = ensureFinite(derivedMashVolume, "mashWaterVolumeLiters");
    }

    const mashNumericFields = [
      "mashStartingAlkalinityPpmCaCO3",
      "mashStartingPh",
      "mashTargetPh",
    ] as const;
    for (const f of mashNumericFields) {
      const v = inputRec[f];
      if (v !== undefined) data[f] = ensureFinite(v, f);
    }

    // Legacy-only: allow setting mashWaterVolumeLiters when mixing is not in use.
    if (derivedMashVolume <= 0 && !hasMixingUpdate && input.mashWaterVolumeLiters !== undefined) {
      data['mashWaterVolumeLiters'] = ensureFinite(input.mashWaterVolumeLiters, "mashWaterVolumeLiters");
    }

    // Boil add-on water mixing volumes + derived boilWaterVolumeLiters (single source of truth like mash).
    const boilMixingNumericFields = ["boilTapWaterVolumeLiters", "boilDilutionWaterVolumeLiters"] as const;
    for (const f of boilMixingNumericFields) {
      const v = inputRec[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }

    const hasBoilMixingUpdate =
      input.boilTapWaterVolumeLiters !== undefined || input.boilDilutionWaterVolumeLiters !== undefined;
    const boilTap =
      input.boilTapWaterVolumeLiters === null
        ? 0
        : typeof input.boilTapWaterVolumeLiters === "number"
          ? input.boilTapWaterVolumeLiters
          : typeof existing?.boilTapWaterVolumeLiters === "number"
            ? existing.boilTapWaterVolumeLiters
            : 0;
    const boilDil =
      input.boilDilutionWaterVolumeLiters === null
        ? 0
        : typeof input.boilDilutionWaterVolumeLiters === "number"
          ? input.boilDilutionWaterVolumeLiters
          : typeof existing?.boilDilutionWaterVolumeLiters === "number"
            ? existing.boilDilutionWaterVolumeLiters
            : 0;
    const derivedBoilVolume = Math.max(0, boilTap) + Math.max(0, boilDil);
    if (derivedBoilVolume > 0 || hasBoilMixingUpdate) {
      data['boilWaterVolumeLiters'] = ensureFinite(derivedBoilVolume, "boilWaterVolumeLiters");
    }

    const mashStringFields = ["mashAcidType", "mashStrengthKind"] as const;
    for (const f of mashStringFields) {
      const v = inputRec[f];
      if (v !== undefined) {
        if (typeof v !== "string") throw new BadRequestError("invalid_string", `Body.${f} must be a string`);
        data[f] = v;
      }
    }

    if (input.mashStrengthValue !== undefined) {
      if (input.mashStrengthValue === null) data['mashStrengthValue'] = null;
      else data['mashStrengthValue'] = ensureFinite(input.mashStrengthValue, "mashStrengthValue");
    }

    const mashSnapshotFields = [
      "mashLastAcidRequiredMl",
      "mashLastAcidRequiredTsp",
      "mashLastAcidRequiredGrams",
      "mashLastAcidRequiredKg",
      "mashLastFinalAlkalinityPpmCaCO3",
      "mashLastSulfateAddedPpm",
      "mashLastChlorideAddedPpm",
    ] as const;
    for (const f of mashSnapshotFields) {
      const v = inputRec[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }
    if (input.mashLastCalculatedAt !== undefined) {
      data['mashLastCalculatedAt'] = input.mashLastCalculatedAt;
    }

    if (input.mashAcidificationMode !== undefined) {
      const v = input.mashAcidificationMode;
      if (typeof v !== "string") {
        throw new BadRequestError("invalid_string", "Body.mashAcidificationMode must be a string");
      }
      if (v !== "targetPh" && v !== "manual") {
        throw new BadRequestError(
          "invalid_mash_acidification_mode",
          'Body.mashAcidificationMode must be "targetPh" or "manual"',
        );
      }
      data['mashAcidificationMode'] = v;
    }

    const mashManualInputFields = ["mashManualAcidAddedMl", "mashManualAcidAddedGrams"] as const;
    for (const f of mashManualInputFields) {
      const v = inputRec[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }

    const mashManualSnapshotFields = [
      "mashManualLastAchievedPh",
      "mashManualLastFinalAlkalinityPpmCaCO3",
      "mashManualLastSulfateAddedPpm",
      "mashManualLastChlorideAddedPpm",
    ] as const;
    for (const f of mashManualSnapshotFields) {
      const v = inputRec[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }
    if (input.mashManualLastCalculatedAt !== undefined) {
      data['mashManualLastCalculatedAt'] = input.mashManualLastCalculatedAt;
    }

    if (input.mashSaltAdditionsJson !== undefined) {
      // accept null to clear
      data['mashSaltAdditionsJson'] = validateSaltAdditionsJson(
        input.mashSaltAdditionsJson,
        "mashSaltAdditionsJson",
      );
    }
    if (input.mashSaltsLastResultJson !== undefined) {
      data['mashSaltsLastResultJson'] = input.mashSaltsLastResultJson;
    }

    if (input.mashOverallLastResultJson !== undefined) {
      // accept null to clear; otherwise pass through (Json column)
      data['mashOverallLastResultJson'] = input.mashOverallLastResultJson;
    }
    if (input.mashOverallLastCalculatedAt !== undefined) {
      data['mashOverallLastCalculatedAt'] = input.mashOverallLastCalculatedAt;
    }

    if (input.mashGristImportedJson !== undefined) {
      data['mashGristImportedJson'] = input.mashGristImportedJson;
    }
    if (input.mashGristImportedAt !== undefined) {
      data['mashGristImportedAt'] = input.mashGristImportedAt;
    }
    if (input.mashGristSourceRecipeUpdatedAt !== undefined) {
      data['mashGristSourceRecipeUpdatedAt'] = input.mashGristSourceRecipeUpdatedAt;
    }

    const numericFields = [
      "spargeStartingAlkalinityPpmCaCO3",
      "spargeStartingPh",
      "spargeTargetPh",
      "spargeVolumeLiters",
    ] as const;
    for (const f of numericFields) {
      const v = inputRec[f];
      if (v !== undefined) data[f] = ensureFinite(v, f);
    }

    const stringFields = ["spargeAcidType", "spargeStrengthKind"] as const;
    for (const f of stringFields) {
      const v = inputRec[f];
      if (v !== undefined) {
        if (typeof v !== "string") throw new BadRequestError("invalid_string", `Body.${f} must be a string`);
        data[f] = v;
      }
    }

    if (input.spargeStrengthValue !== undefined) {
      if (input.spargeStrengthValue === null) data['spargeStrengthValue'] = null;
      else data['spargeStrengthValue'] = ensureFinite(input.spargeStrengthValue, "spargeStrengthValue");
    }

    if (input.spargeAcidificationMode !== undefined) {
      const v = input.spargeAcidificationMode;
      if (typeof v !== "string") {
        throw new BadRequestError("invalid_string", "Body.spargeAcidificationMode must be a string");
      }
      if (v !== "targetPh" && v !== "manual") {
        throw new BadRequestError(
          "invalid_sparge_acidification_mode",
          'Body.spargeAcidificationMode must be "targetPh" or "manual"',
        );
      }
      data['spargeAcidificationMode'] = v;
    }

    const spargeManualInputFields = ["spargeManualAcidAddedMl", "spargeManualAcidAddedGrams"] as const;
    for (const f of spargeManualInputFields) {
      const v = inputRec[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }

    const spargeManualSnapshotFields = [
      "spargeManualLastAchievedPh",
      "spargeManualLastFinalAlkalinityPpmCaCO3",
      "spargeManualLastSulfateAddedPpm",
      "spargeManualLastChlorideAddedPpm",
    ] as const;
    for (const f of spargeManualSnapshotFields) {
      const v = inputRec[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }
    if (input.spargeManualLastCalculatedAt !== undefined) {
      data['spargeManualLastCalculatedAt'] = input.spargeManualLastCalculatedAt;
    }

    if (input.spargeSaltAdditionsJson !== undefined) {
      // accept null to clear
      data['spargeSaltAdditionsJson'] = validateSaltAdditionsJson(
        input.spargeSaltAdditionsJson,
        "spargeSaltAdditionsJson",
      );
    }
    if (input.spargeSaltsLastResultJson !== undefined) {
      data['spargeSaltsLastResultJson'] = input.spargeSaltsLastResultJson;
    }
    if (input.spargeStepTemperatureC !== undefined) {
      if (input.spargeStepTemperatureC === null) data['spargeStepTemperatureC'] = null;
      else {
        const v = input.spargeStepTemperatureC;
        if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 100) {
          throw new BadRequestError("invalid_sparge_step_temperature", "Body.spargeStepTemperatureC must be 0–100");
        }
        data['spargeStepTemperatureC'] = v;
      }
    }

    const SPARGE_METHOD_ALLOWLIST = new Set(["fly_sparge", "batch_sparge"]);
    if (input.spargeStepTimeMin !== undefined) {
      if (input.spargeStepTimeMin === null) data['spargeStepTimeMin'] = null;
      else {
        const v = input.spargeStepTimeMin;
        if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 600) {
          throw new BadRequestError("invalid_sparge_step_time", "Body.spargeStepTimeMin must be 0–600");
        }
        data['spargeStepTimeMin'] = v;
      }
    }
    if (input.spargeStepRampMin !== undefined) {
      if (input.spargeStepRampMin === null) data['spargeStepRampMin'] = null;
      else {
        const v = input.spargeStepRampMin;
        if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 120) {
          throw new BadRequestError("invalid_sparge_step_ramp", "Body.spargeStepRampMin must be 0–120");
        }
        data['spargeStepRampMin'] = v;
      }
    }
    if (input.spargeMethodType !== undefined) {
      if (input.spargeMethodType === null) data['spargeMethodType'] = null;
      else {
        const v = input.spargeMethodType;
        if (typeof v !== "string" || !SPARGE_METHOD_ALLOWLIST.has(v)) {
          throw new BadRequestError(
            "invalid_sparge_method_type",
            'Body.spargeMethodType must be "fly_sparge" or "batch_sparge"',
          );
        }
        data['spargeMethodType'] = v;
      }
    }

    const snapshotFields = [
      "spargeLastAcidRequiredMl",
      "spargeLastAcidRequiredTsp",
      "spargeLastAcidRequiredGrams",
      "spargeLastAcidRequiredKg",
      "spargeLastFinalAlkalinityPpmCaCO3",
      "spargeLastSulfateAddedPpm",
      "spargeLastChlorideAddedPpm",
    ] as const;
    for (const f of snapshotFields) {
      const v = inputRec[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }
    if (input.spargeLastCalculatedAt !== undefined) {
      data['spargeLastCalculatedAt'] = input.spargeLastCalculatedAt;
    }

    // Boil add-on water inputs/snapshots (mirrors sparge patterns; mixing mirrors mash).
    const boilNumericFields = ["boilStartingAlkalinityPpmCaCO3", "boilStartingPh", "boilTargetPh"] as const;
    for (const f of boilNumericFields) {
      const v = inputRec[f];
      if (v !== undefined) data[f] = ensureFinite(v, f);
    }

    // Allow client-provided boilWaterVolumeLiters only if mixing volumes are not being updated.
    if (!hasBoilMixingUpdate && input.boilWaterVolumeLiters !== undefined) {
      data['boilWaterVolumeLiters'] = ensureFinite(input.boilWaterVolumeLiters, "boilWaterVolumeLiters");
    }

    const boilStringFields = ["boilAcidType", "boilStrengthKind"] as const;
    for (const f of boilStringFields) {
      const v = inputRec[f];
      if (v !== undefined) {
        if (typeof v !== "string") throw new BadRequestError("invalid_string", `Body.${f} must be a string`);
        data[f] = v;
      }
    }
    if (input.boilStrengthValue !== undefined) {
      if (input.boilStrengthValue === null) data['boilStrengthValue'] = null;
      else data['boilStrengthValue'] = ensureFinite(input.boilStrengthValue, "boilStrengthValue");
    }

    if (input.boilAcidificationMode !== undefined) {
      const v = input.boilAcidificationMode;
      if (typeof v !== "string") {
        throw new BadRequestError("invalid_string", "Body.boilAcidificationMode must be a string");
      }
      if (v !== "targetPh" && v !== "manual") {
        throw new BadRequestError(
          "invalid_boil_acidification_mode",
          'Body.boilAcidificationMode must be "targetPh" or "manual"',
        );
      }
      data['boilAcidificationMode'] = v;
    }

    const boilManualInputFields = ["boilManualAcidAddedMl", "boilManualAcidAddedGrams"] as const;
    for (const f of boilManualInputFields) {
      const v = inputRec[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }

    const boilManualSnapshotFields = [
      "boilManualLastAchievedPh",
      "boilManualLastFinalAlkalinityPpmCaCO3",
      "boilManualLastSulfateAddedPpm",
      "boilManualLastChlorideAddedPpm",
    ] as const;
    for (const f of boilManualSnapshotFields) {
      const v = inputRec[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }
    if (input.boilManualLastCalculatedAt !== undefined) data['boilManualLastCalculatedAt'] = input.boilManualLastCalculatedAt;

    if (input.boilSaltAdditionsJson !== undefined) {
      data['boilSaltAdditionsJson'] = validateSaltAdditionsJson(
        input.boilSaltAdditionsJson,
        "boilSaltAdditionsJson",
      );
    }
    if (input.boilSaltsLastResultJson !== undefined) {
      data['boilSaltsLastResultJson'] = input.boilSaltsLastResultJson;
    }

    const boilSnapshotFields = [
      "boilLastAcidRequiredMl",
      "boilLastAcidRequiredTsp",
      "boilLastAcidRequiredGrams",
      "boilLastAcidRequiredKg",
      "boilLastFinalAlkalinityPpmCaCO3",
      "boilLastSulfateAddedPpm",
      "boilLastChlorideAddedPpm",
    ] as const;
    for (const f of boilSnapshotFields) {
      const v = inputRec[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }
    if (input.boilLastCalculatedAt !== undefined) data['boilLastCalculatedAt'] = input.boilLastCalculatedAt;

    if (input.boilOverallLastResultJson !== undefined) {
      data['boilOverallLastResultJson'] = input.boilOverallLastResultJson;
    }
    if (input.boilOverallLastCalculatedAt !== undefined) data['boilOverallLastCalculatedAt'] = input.boilOverallLastCalculatedAt;

    return this.prisma.recipeWaterSettings.upsert({
      where: { recipeId },
      create: data as Prisma.RecipeWaterSettingsUncheckedCreateInput,
      update: data,
    });
  }
}

