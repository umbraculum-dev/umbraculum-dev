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

  mashSaltAdditionsJson?: unknown;
  mashSaltsLastResultJson?: unknown;

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

function validateMashSaltAdditionsJson(value: unknown) {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new BadRequestError("invalid_salt_additions", "Body.mashSaltAdditionsJson must be an array");
  }

  return value.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const saltKey = o.saltKey;
    const grams = o.grams;
    if (typeof saltKey !== "string" || !ALLOWED_MASH_SALT_KEYS.has(saltKey)) {
      throw new BadRequestError(
        "invalid_salt_key",
        `Body.mashSaltAdditionsJson[${idx}].saltKey is invalid`,
      );
    }
    if (typeof grams !== "number" || !Number.isFinite(grams) || grams < 0) {
      throw new BadRequestError(
        "invalid_salt_grams",
        `Body.mashSaltAdditionsJson[${idx}].grams must be a number >= 0`,
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

    const data: Record<string, unknown> = { accountId, recipeId };

    if (input.sourceWaterProfileId !== undefined) data.sourceWaterProfileId = input.sourceWaterProfileId;
    if (input.targetWaterProfileId !== undefined) data.targetWaterProfileId = input.targetWaterProfileId;
    if (input.dilutionWaterProfileId !== undefined)
      data.dilutionWaterProfileId = input.dilutionWaterProfileId;

    const mixingNumericFields = ["tapWaterVolumeLiters", "dilutionWaterVolumeLiters"] as const;
    for (const f of mixingNumericFields) {
      const v = (input as any)[f];
      if (v !== undefined) {
        if (v === null) data[f] = null;
        else data[f] = ensureFinite(v, f);
      }
    }

    const mashNumericFields = [
      "mashStartingAlkalinityPpmCaCO3",
      "mashStartingPh",
      "mashTargetPh",
      "mashWaterVolumeLiters",
    ] as const;
    for (const f of mashNumericFields) {
      const v = (input as any)[f];
      if (v !== undefined) data[f] = ensureFinite(v, f);
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

    if (input.mashSaltAdditionsJson !== undefined) {
      // accept null to clear
      data.mashSaltAdditionsJson = validateMashSaltAdditionsJson(input.mashSaltAdditionsJson) as any;
    }
    if (input.mashSaltsLastResultJson !== undefined) {
      data.mashSaltsLastResultJson = input.mashSaltsLastResultJson as any;
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

    return this.prisma.recipeWaterSettings.upsert({
      where: { recipeId },
      create: data as any,
      update: data as any,
    });
  }
}

