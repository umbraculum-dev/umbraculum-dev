import type { PrismaClient } from "@prisma/client";
import { BadRequestError } from "../../../errors.js";
import { WorkspacesService } from "../../../services/workspacesService.js";
import { RecipesService } from "../../../services/recipesService.js";
import { RecipeWaterSettingsService } from "./recipeWaterSettingsService.js";
import { type WaterProfileLite } from "./recipeWaterCompute/recipeWaterComputeHelpers.js";
import * as mashOps from "./recipeWaterCompute/recipeWaterComputeMashOps.js";
import * as spargeOps from "./recipeWaterCompute/recipeWaterComputeSpargeOps.js";
import * as boilOps from "./recipeWaterCompute/recipeWaterComputeBoilOps.js";

export type MashComputeAndSaveInput = {
  sourceWaterProfileId: string;
  dilutionWaterProfileId: string | null;
  tapWaterVolumeLiters: number;
  dilutionWaterVolumeLiters: number;

  mashStartingAlkalinityPpmCaCO3: number;
  mashStartingPh: number;
  mashTargetPh: number;
  mashAcidType: string;
  mashStrengthKind: string;
  mashStrengthValue: number | null;
  mashAcidificationMode: string;
  mashManualAcidAddedMl: number | null;
  mashManualAcidAddedGrams: number | null;

  mashSaltAdditionsJson: unknown;

  grist?: Array<{ amountKg: number; colorLovibond: number | null; maltClass: "base" | "crystal" | "roast" | "acid"; mashDiPh?: number | null | undefined; mashTaToPh57_mEqPerKg?: number | null | undefined }> | undefined | null;
};

export type SpargeComputeAndSaveInput = {
  spargeWaterProfileId: string;
  spargeSaltAdditionsJson: unknown;

  spargeStartingAlkalinityPpmCaCO3: number;
  spargeStartingPh: number;
  spargeTargetPh: number;
  spargeVolumeLiters: number;
  spargeAcidType: string;
  spargeStrengthKind: string;
  spargeStrengthValue: number | null;
  spargeAcidificationMode: string;
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
  boilAcidType: string;
  boilStrengthKind: string;
  boilStrengthValue: number | null;
  boilAcidificationMode: string;
  boilManualAcidAddedMl: number | null;
  boilManualAcidAddedGrams: number | null;

  boilSaltAdditionsJson: unknown;
};

export type RecipeWaterComputeDeps = {
  prisma: PrismaClient;
  workspaces: WorkspacesService;
  recipes: RecipesService;
  settings: RecipeWaterSettingsService;
  loadProfileLite: (profileId: string) => Promise<WaterProfileLite>;
  assertProfileAccessible: (workspaceId: string, profileId: string) => Promise<void>;
};

export class RecipeWaterComputeAndSaveService {
  private readonly workspaces: WorkspacesService;
  private readonly recipes: RecipesService;
  private readonly settings: RecipeWaterSettingsService;
  private readonly deps: RecipeWaterComputeDeps;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
    this.recipes = new RecipesService(prisma);
    this.settings = new RecipeWaterSettingsService(prisma);
    this.deps = {
      prisma: this.prisma,
      workspaces: this.workspaces,
      recipes: this.recipes,
      settings: this.settings,
      loadProfileLite: (profileId) => this.loadProfileLite(profileId),
      assertProfileAccessible: (workspaceId, profileId) => this.assertProfileAccessible(workspaceId, profileId),
    };
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
    return {
      id: profile.id,
      scope: profile.scope,
      workspaceId: profile.workspaceId,
      calcium: profile.calcium,
      magnesium: profile.magnesium,
      sodium: profile.sodium,
      sulfate: profile.sulfate,
      chloride: profile.chloride,
      bicarbonate: profile.bicarbonate,
    };
  }

  private async assertProfileAccessible(workspaceId: string, profileId: string) {
    const profile = await this.prisma.waterProfile.findUnique({ where: { id: profileId }, select: { id: true, scope: true, workspaceId: true } });
    if (!profile) throw new BadRequestError("invalid_profile_id", "Unknown water profile id");
    const scope = profile.scope;
    if (scope === "system" || scope === "public") return;
    if (scope === "account" && profile.workspaceId === workspaceId) return;
    throw new BadRequestError("profile_not_accessible", "Water profile is not accessible to this workspace");
  }

  async computeAndSaveMash(userId: string, workspaceId: string, recipeId: string, input: MashComputeAndSaveInput) {
    return mashOps.computeAndSaveMash(this.deps, userId, workspaceId, recipeId, input);
  }

  async computeAndSaveSparge(userId: string, workspaceId: string, recipeId: string, input: SpargeComputeAndSaveInput) {
    return spargeOps.computeAndSaveSparge(this.deps, userId, workspaceId, recipeId, input);
  }

  async computeAndSaveBoil(userId: string, workspaceId: string, recipeId: string, input: BoilComputeAndSaveInput) {
    return boilOps.computeAndSaveBoil(this.deps, userId, workspaceId, recipeId, input);
  }
}
