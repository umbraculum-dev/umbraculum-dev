import type { PrismaClient } from "@prisma/client";

import type {
  BreweryScheduleProjection,
  ProjectedBrewSession,
  ProjectedBrewdaySettings,
  ProjectedEquipmentProfile,
  ProjectedRecipe,
  ProjectedVessel,
} from "./breweryScheduleProjection.js";

/**
 * Sole cross-schema Prisma reader for MRP/CRP brewery schedule projections (SOLID B3).
 * Joins brewery + automation tables; MRP/CRP modules must not query those schemas directly.
 */
export class PrismaBreweryScheduleProjection implements BreweryScheduleProjection {
  constructor(private readonly prisma: PrismaClient) {}

  listRecipes(workspaceId: string): Promise<readonly ProjectedRecipe[]> {
    return this.prisma.recipe.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { version: "asc" }],
    });
  }

  getRecipe(workspaceId: string, recipeId: string): Promise<ProjectedRecipe | null> {
    return this.prisma.recipe.findFirst({
      where: { id: recipeId, workspaceId },
    });
  }

  listBrewSessionsWithSteps(workspaceId: string): Promise<readonly ProjectedBrewSession[]> {
    return this.prisma.brewSession.findMany({
      where: { workspaceId },
      include: { recipe: true, steps: true },
      orderBy: [{ code: "asc" }],
    });
  }

  getBrewSessionWithSteps(
    workspaceId: string,
    sessionId: string,
  ): Promise<ProjectedBrewSession | null> {
    return this.prisma.brewSession.findFirst({
      where: { id: sessionId, workspaceId },
      include: { recipe: true, steps: true },
    });
  }

  getBrewdaySettings(workspaceId: string): Promise<ProjectedBrewdaySettings | null> {
    return this.prisma.brewdaySettings.findUnique({ where: { workspaceId } });
  }

  listVessels(workspaceId: string): Promise<readonly ProjectedVessel[]> {
    return this.prisma.vessel.findMany({
      where: { workspaceId },
      orderBy: [{ code: "asc" }],
    });
  }

  getVessel(workspaceId: string, vesselId: string): Promise<ProjectedVessel | null> {
    return this.prisma.vessel.findFirst({
      where: { id: vesselId, workspaceId },
    });
  }

  listEquipmentProfiles(workspaceId: string): Promise<readonly ProjectedEquipmentProfile[]> {
    return this.prisma.equipmentProfile.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }],
    });
  }
}

export function createPrismaBreweryScheduleProjection(
  prisma: PrismaClient,
): BreweryScheduleProjection {
  return new PrismaBreweryScheduleProjection(prisma);
}
