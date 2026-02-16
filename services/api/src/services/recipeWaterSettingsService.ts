import type { PrismaClient } from "@prisma/client";
import { BadRequestError, ForbiddenError } from "../errors.js";
import { AccountsService } from "./accountsService.js";
import { RecipesService } from "./recipesService.js";

export type UpsertRecipeWaterSettingsInput = {
  sourceWaterProfileId?: string | null;
  targetWaterProfileId?: string | null;
  dilutionWaterProfileId?: string | null;

  tapWaterVolumeLiters?: number | null;
  dilutionWaterVolumeLiters?: number | null;

  mashStartingAlkalinityPpmCaCO3?: number;
  mashStartingPh?: number;
  mashTargetPh?: number;
  mashWaterVolumeLiters?: number;
  mashAcidType?: string;
  mashStrengthKind?: string;
  mashStrengthValue?: number | null;

  mashLastAcidRequiredMl?: number | null;
  mashLastAcidRequiredTsp?: number | null;
  mashLastAcidRequiredGrams?: number | null;
  mashLastAcidRequiredKg?: number | null;
  mashLastFinalAlkalinityPpmCaCO3?: number | null;
  mashLastSulfateAddedPpm?: number | null;
  mashLastChlorideAddedPpm?: number | null;
  mashLastCalculatedAt?: Date | null;

  mashAcidificationMode?: string;
  mashManualAcidAddedMl?: number | null;
  mashManualAcidAddedGrams?: number | null;
  mashManualLastAchievedPh?: number | null;
  mashManualLastFinalAlkalinityPpmCaCO3?: number | null;
  mashManualLastSulfateAddedPpm?: number | null;
  mashManualLastChlorideAddedPpm?: number | null;
  mashManualLastCalculatedAt?: Date | null;

  mashSaltAdditionsJson?: unknown;
  mashSaltsLastResultJson?: unknown;

  mashOverallLastResultJson?: unknown;
  mashOverallLastCalculatedAt?: Date | null;

  mashGristImportedJson?: unknown;
  mashGristImportedAt?: Date | null;
  mashGristSourceRecipeUpdatedAt?: Date | null;

  spargeWaterProfileId?: string | null;
  spargeStartingAlkalinityPpmCaCO3?: number;
  spargeStartingPh?: number;
  spargeTargetPh?: number;
  spargeVolumeLiters?: number;
  spargeAcidType?: string;
  spargeStrengthKind?: string;
  spargeStrengthValue?: number | null;

  spargeLastAcidRequiredMl?: number | null;
  spargeLastAcidRequiredTsp?: number | null;
  spargeLastAcidRequiredGrams?: number | null;
  spargeLastAcidRequiredKg?: number | null;
  spargeLastFinalAlkalinityPpmCaCO3?: number | null;
  spargeLastSulfateAddedPpm?: number | null;
  spargeLastChlorideAddedPpm?: number | null;
  spargeLastCalculatedAt?: Date | null;

  spargeAcidificationMode?: string;
  spargeManualAcidAddedMl?: number | null;
  spargeManualAcidAddedGrams?: number | null;
  spargeManualLastAchievedPh?: number | null;
  spargeManualLastFinalAlkalinityPpmCaCO3?: number | null;
  spargeManualLastSulfateAddedPpm?: number | null;
  spargeManualLastChlorideAddedPpm?: number | null;
  spargeManualLastCalculatedAt?: Date | null;

  spargeSaltAdditionsJson?: unknown;
  spargeSaltsLastResultJson?: unknown;

  // Boil/kettle add-on water (v0)
  boilSourceWaterProfileId?: string | null;
  boilTargetWaterProfileId?: string | null;
  boilDilutionWaterProfileId?: string | null;

  boilTapWaterVolumeLiters?: number | null;
  boilDilutionWaterVolumeLiters?: number | null;

  boilStartingAlkalinityPpmCaCO3?: number;
  boilStartingPh?: number;
  boilTargetPh?: number;
  boilWaterVolumeLiters?: number;
  boilAcidType?: string;
  boilStrengthKind?: string;
  boilStrengthValue?: number | null;

  boilLastAcidRequiredMl?: number | null;
  boilLastAcidRequiredTsp?: number | null;
  boilLastAcidRequiredGrams?: number | null;
  boilLastAcidRequiredKg?: number | null;
  boilLastFinalAlkalinityPpmCaCO3?: number | null;
  boilLastSulfateAddedPpm?: number | null;
  boilLastChlorideAddedPpm?: number | null;
  boilLastCalculatedAt?: Date | null;

  boilAcidificationMode?: string;
  boilManualAcidAddedMl?: number | null;
  boilManualAcidAddedGrams?: number | null;
  boilManualLastAchievedPh?: number | null;
  boilManualLastFinalAlkalinityPpmCaCO3?: number | null;
  boilManualLastSulfateAddedPpm?: number | null;
  boilManualLastChlorideAddedPpm?: number | null;
  boilManualLastCalculatedAt?: Date | null;

  boilSaltAdditionsJson?: unknown;
  boilSaltsLastResultJson?: unknown;

  boilOverallLastResultJson?: unknown;
  boilOverallLastCalculatedAt?: Date | null;
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
    const saltKey = o.saltKey;
    const grams = o.grams;
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
  private readonly accounts: AccountsService;
  private readonly recipes: RecipesService;

  constructor(private readonly prisma: PrismaClient) {
    this.accounts = new AccountsService(prisma);
    this.recipes = new RecipesService(prisma);
  }

  async get(userId: string, accountId: string, recipeId: string) {
    await this.accounts.assertMembership(userId, accountId);
    await this.recipes.getRecipe(userId, accountId, recipeId);

    return this.prisma.recipeWaterSettings.findUnique({
      where: { recipeId },
    });
  }

  private async assertProfileAccessible(accountId: string, profileId: string) {
    const profile = await this.prisma.waterProfile.findUnique({ where: { id: profileId } });
    if (!profile) throw new BadRequestError("invalid_profile_id", "Unknown water profile id");

    const scope = profile.scope as "system" | "public" | "account";
    if (scope === "system" || scope === "public") return;
    if (scope === "account" && profile.accountId === accountId) return;

    throw new ForbiddenError("profile_not_accessible", "Water profile is not accessible to this account");
  }

  async upsert(userId: string, accountId: string, recipeId: string, input: UpsertRecipeWaterSettingsInput) {
    await this.accounts.assertMembership(userId, accountId);
    await this.recipes.getRecipe(userId, accountId, recipeId);

    if (input.sourceWaterProfileId) await this.assertProfileAccessible(accountId, input.sourceWaterProfileId);
    if (input.targetWaterProfileId) await this.assertProfileAccessible(accountId, input.targetWaterProfileId);
    if (input.dilutionWaterProfileId) await this.assertProfileAccessible(accountId, input.dilutionWaterProfileId);
    if (input.spargeWaterProfileId) await this.assertProfileAccessible(accountId, input.spargeWaterProfileId);
    if (input.boilSourceWaterProfileId) await this.assertProfileAccessible(accountId, input.boilSourceWaterProfileId);
    if (input.boilTargetWaterProfileId) await this.assertProfileAccessible(accountId, input.boilTargetWaterProfileId);
    if (input.boilDilutionWaterProfileId)
      await this.assertProfileAccessible(accountId, input.boilDilutionWaterProfileId);

    const existing = await this.prisma.recipeWaterSettings.findUnique({ where: { recipeId } });
    const data: Record<string, unknown> = { accountId, recipeId };

    if (input.sourceWaterProfileId !== undefined) data.sourceWaterProfileId = input.sourceWaterProfileId;
    if (input.targetWaterProfileId !== undefined) data.targetWaterProfileId = input.targetWaterProfileId;
    if (input.dilutionWaterProfileId !== undefined)
      data.dilutionWaterProfileId = input.dilutionWaterProfileId;
    if (input.spargeWaterProfileId !== undefined) data.spargeWaterProfileId = input.spargeWaterProfileId;
    if (input.boilSourceWaterProfileId !== undefined) data.boilSourceWaterProfileId = input.boilSourceWaterProfileId;
    if (input.boilTargetWaterProfileId !== undefined) data.boilTargetWaterProfileId = input.boilTargetWaterProfileId;
    if (input.boilDilutionWaterProfileId !== undefined)
      data.boilDilutionWaterProfileId = input.boilDilutionWaterProfileId;

    const mixingNumericFields = ["tapWaterVolumeLiters", "dilutionWaterVolumeLiters"] as const;
    for (const f of mixingNumericFields) {
      const v = (input as any)[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }

    // Single source of truth (mash page): mash water volume is derived from mixing volumes.
    // If either mixing field is present in the request, derive mashWaterVolumeLiters from:
    //   tapWaterVolumeLiters + dilutionWaterVolumeLiters
    // using request values where provided, otherwise falling back to existing record values.
    const hasMixingUpdate =
      input.tapWaterVolumeLiters !== undefined || input.dilutionWaterVolumeLiters !== undefined;
    if (hasMixingUpdate) {
      const tap =
        typeof input.tapWaterVolumeLiters === "number"
          ? input.tapWaterVolumeLiters
          : typeof existing?.tapWaterVolumeLiters === "number"
            ? existing.tapWaterVolumeLiters
            : 0;
      const dil =
        typeof input.dilutionWaterVolumeLiters === "number"
          ? input.dilutionWaterVolumeLiters
          : typeof existing?.dilutionWaterVolumeLiters === "number"
            ? existing.dilutionWaterVolumeLiters
            : 0;

      data.mashWaterVolumeLiters = ensureFinite(Math.max(0, tap) + Math.max(0, dil), "mashWaterVolumeLiters");
    }

    const mashNumericFields = [
      "mashStartingAlkalinityPpmCaCO3",
      "mashStartingPh",
      "mashTargetPh",
    ] as const;
    for (const f of mashNumericFields) {
      const v = (input as any)[f];
      if (v !== undefined) data[f] = ensureFinite(v, f);
    }

    // If mixing volumes are being updated, prevent client-provided mashWaterVolumeLiters from reintroducing duplication.
    if (!hasMixingUpdate && input.mashWaterVolumeLiters !== undefined) {
      data.mashWaterVolumeLiters = ensureFinite(input.mashWaterVolumeLiters, "mashWaterVolumeLiters");
    }

    // Boil add-on water mixing volumes + derived boilWaterVolumeLiters (single source of truth like mash).
    const boilMixingNumericFields = ["boilTapWaterVolumeLiters", "boilDilutionWaterVolumeLiters"] as const;
    for (const f of boilMixingNumericFields) {
      const v = (input as any)[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }

    const hasBoilMixingUpdate =
      input.boilTapWaterVolumeLiters !== undefined || input.boilDilutionWaterVolumeLiters !== undefined;
    if (hasBoilMixingUpdate) {
      const tap =
        typeof input.boilTapWaterVolumeLiters === "number"
          ? input.boilTapWaterVolumeLiters
          : typeof (existing as any)?.boilTapWaterVolumeLiters === "number"
            ? (existing as any).boilTapWaterVolumeLiters
            : 0;
      const dil =
        typeof input.boilDilutionWaterVolumeLiters === "number"
          ? input.boilDilutionWaterVolumeLiters
          : typeof (existing as any)?.boilDilutionWaterVolumeLiters === "number"
            ? (existing as any).boilDilutionWaterVolumeLiters
            : 0;

      data.boilWaterVolumeLiters = ensureFinite(
        Math.max(0, tap) + Math.max(0, dil),
        "boilWaterVolumeLiters",
      );
    }

    const mashStringFields = ["mashAcidType", "mashStrengthKind"] as const;
    for (const f of mashStringFields) {
      const v = (input as any)[f];
      if (v !== undefined) {
        if (typeof v !== "string") throw new BadRequestError("invalid_string", `Body.${f} must be a string`);
        data[f] = v;
      }
    }

    if (input.mashStrengthValue !== undefined) {
      if (input.mashStrengthValue === null) data.mashStrengthValue = null;
      else data.mashStrengthValue = ensureFinite(input.mashStrengthValue, "mashStrengthValue");
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
      const v = (input as any)[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }
    if (input.mashLastCalculatedAt !== undefined) {
      data.mashLastCalculatedAt = input.mashLastCalculatedAt;
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
      data.mashAcidificationMode = v;
    }

    const mashManualInputFields = ["mashManualAcidAddedMl", "mashManualAcidAddedGrams"] as const;
    for (const f of mashManualInputFields) {
      const v = (input as any)[f];
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
      const v = (input as any)[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }
    if (input.mashManualLastCalculatedAt !== undefined) {
      data.mashManualLastCalculatedAt = input.mashManualLastCalculatedAt;
    }

    if (input.mashSaltAdditionsJson !== undefined) {
      // accept null to clear
      data.mashSaltAdditionsJson = validateSaltAdditionsJson(input.mashSaltAdditionsJson, "mashSaltAdditionsJson") as any;
    }
    if (input.mashSaltsLastResultJson !== undefined) {
      data.mashSaltsLastResultJson = input.mashSaltsLastResultJson as any;
    }

    if (input.mashOverallLastResultJson !== undefined) {
      // accept null to clear; otherwise pass through (Json column)
      data.mashOverallLastResultJson = input.mashOverallLastResultJson as any;
    }
    if (input.mashOverallLastCalculatedAt !== undefined) {
      data.mashOverallLastCalculatedAt = input.mashOverallLastCalculatedAt;
    }

    if (input.mashGristImportedJson !== undefined) {
      data.mashGristImportedJson = input.mashGristImportedJson as any;
    }
    if (input.mashGristImportedAt !== undefined) {
      data.mashGristImportedAt = input.mashGristImportedAt;
    }
    if (input.mashGristSourceRecipeUpdatedAt !== undefined) {
      data.mashGristSourceRecipeUpdatedAt = input.mashGristSourceRecipeUpdatedAt;
    }

    const numericFields = [
      "spargeStartingAlkalinityPpmCaCO3",
      "spargeStartingPh",
      "spargeTargetPh",
      "spargeVolumeLiters",
    ] as const;
    for (const f of numericFields) {
      const v = (input as any)[f];
      if (v !== undefined) data[f] = ensureFinite(v, f);
    }

    const stringFields = ["spargeAcidType", "spargeStrengthKind"] as const;
    for (const f of stringFields) {
      const v = (input as any)[f];
      if (v !== undefined) {
        if (typeof v !== "string") throw new BadRequestError("invalid_string", `Body.${f} must be a string`);
        data[f] = v;
      }
    }

    if (input.spargeStrengthValue !== undefined) {
      if (input.spargeStrengthValue === null) data.spargeStrengthValue = null;
      else data.spargeStrengthValue = ensureFinite(input.spargeStrengthValue, "spargeStrengthValue");
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
      data.spargeAcidificationMode = v;
    }

    const spargeManualInputFields = ["spargeManualAcidAddedMl", "spargeManualAcidAddedGrams"] as const;
    for (const f of spargeManualInputFields) {
      const v = (input as any)[f];
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
      const v = (input as any)[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }
    if (input.spargeManualLastCalculatedAt !== undefined) {
      data.spargeManualLastCalculatedAt = input.spargeManualLastCalculatedAt;
    }

    if (input.spargeSaltAdditionsJson !== undefined) {
      // accept null to clear
      data.spargeSaltAdditionsJson = validateSaltAdditionsJson(input.spargeSaltAdditionsJson, "spargeSaltAdditionsJson") as any;
    }
    if (input.spargeSaltsLastResultJson !== undefined) {
      data.spargeSaltsLastResultJson = input.spargeSaltsLastResultJson as any;
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
      const v = (input as any)[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }
    if (input.spargeLastCalculatedAt !== undefined) {
      data.spargeLastCalculatedAt = input.spargeLastCalculatedAt;
    }

    // Boil add-on water inputs/snapshots (mirrors sparge patterns; mixing mirrors mash).
    const boilNumericFields = ["boilStartingAlkalinityPpmCaCO3", "boilStartingPh", "boilTargetPh"] as const;
    for (const f of boilNumericFields) {
      const v = (input as any)[f];
      if (v !== undefined) data[f] = ensureFinite(v, f);
    }

    // Allow client-provided boilWaterVolumeLiters only if mixing volumes are not being updated.
    if (!hasBoilMixingUpdate && input.boilWaterVolumeLiters !== undefined) {
      data.boilWaterVolumeLiters = ensureFinite(input.boilWaterVolumeLiters, "boilWaterVolumeLiters");
    }

    const boilStringFields = ["boilAcidType", "boilStrengthKind"] as const;
    for (const f of boilStringFields) {
      const v = (input as any)[f];
      if (v !== undefined) {
        if (typeof v !== "string") throw new BadRequestError("invalid_string", `Body.${f} must be a string`);
        data[f] = v;
      }
    }
    if (input.boilStrengthValue !== undefined) {
      if (input.boilStrengthValue === null) data.boilStrengthValue = null;
      else data.boilStrengthValue = ensureFinite(input.boilStrengthValue, "boilStrengthValue");
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
      data.boilAcidificationMode = v;
    }

    const boilManualInputFields = ["boilManualAcidAddedMl", "boilManualAcidAddedGrams"] as const;
    for (const f of boilManualInputFields) {
      const v = (input as any)[f];
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
      const v = (input as any)[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }
    if (input.boilManualLastCalculatedAt !== undefined) data.boilManualLastCalculatedAt = input.boilManualLastCalculatedAt;

    if (input.boilSaltAdditionsJson !== undefined) {
      data.boilSaltAdditionsJson = validateSaltAdditionsJson(input.boilSaltAdditionsJson, "boilSaltAdditionsJson") as any;
    }
    if (input.boilSaltsLastResultJson !== undefined) {
      data.boilSaltsLastResultJson = input.boilSaltsLastResultJson as any;
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
      const v = (input as any)[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }
    if (input.boilLastCalculatedAt !== undefined) data.boilLastCalculatedAt = input.boilLastCalculatedAt;

    if (input.boilOverallLastResultJson !== undefined) data.boilOverallLastResultJson = input.boilOverallLastResultJson as any;
    if (input.boilOverallLastCalculatedAt !== undefined) data.boilOverallLastCalculatedAt = input.boilOverallLastCalculatedAt;

    return this.prisma.recipeWaterSettings.upsert({
      where: { recipeId },
      create: data as any,
      update: data as any,
    });
  }
}

