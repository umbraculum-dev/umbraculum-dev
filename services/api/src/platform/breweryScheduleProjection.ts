import type { Prisma } from "@prisma/client";

/**
 * Narrow read models for MRP/CRP α brewery schedule projections.
 * Server-internal — not a public HTTP or npm contract.
 */

export type ProjectedRecipe = Prisma.RecipeGetPayload<Record<string, never>>;

export type ProjectedBrewSession = Prisma.BrewSessionGetPayload<{
  include: { recipe: true; steps: true };
}>;

export type ProjectedVessel = Prisma.VesselGetPayload<Record<string, never>>;

export type ProjectedEquipmentProfile = Prisma.EquipmentProfileGetPayload<Record<string, never>>;

export type ProjectedBrewdaySettings = Prisma.BrewdaySettingsGetPayload<Record<string, never>>;

/**
 * Anti-corruption port: MRP/CRP projection services depend on this interface;
 * {@link PrismaBreweryScheduleProjection} is the sole Prisma adapter for cross-schema reads.
 */
export interface BreweryScheduleProjection {
  listRecipes(workspaceId: string): Promise<readonly ProjectedRecipe[]>;
  getRecipe(workspaceId: string, recipeId: string): Promise<ProjectedRecipe | null>;
  listBrewSessionsWithSteps(workspaceId: string): Promise<readonly ProjectedBrewSession[]>;
  getBrewSessionWithSteps(
    workspaceId: string,
    sessionId: string,
  ): Promise<ProjectedBrewSession | null>;
  getBrewdaySettings(workspaceId: string): Promise<ProjectedBrewdaySettings | null>;
  listVessels(workspaceId: string): Promise<readonly ProjectedVessel[]>;
  getVessel(workspaceId: string, vesselId: string): Promise<ProjectedVessel | null>;
  listEquipmentProfiles(workspaceId: string): Promise<readonly ProjectedEquipmentProfile[]>;
}
