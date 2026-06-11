import type { PrismaClient } from "@prisma/client";
import { isVerticalInstalled } from "@umbraculum/module-sdk";

import type {
  BreweryScheduleProjection,
  ProjectedBrewSession,
  ProjectedBrewdaySettings,
  ProjectedEquipmentProfile,
  ProjectedRecipe,
  ProjectedVessel,
} from "./breweryScheduleProjection.js";

/** Empty projection when brewery vertical is not installed (core installation profile). */
class NullBreweryScheduleProjection implements BreweryScheduleProjection {
  listRecipes(_workspaceId: string): Promise<readonly ProjectedRecipe[]> {
    return Promise.resolve([]);
  }

  getRecipe(_workspaceId: string, _recipeId: string): Promise<ProjectedRecipe | null> {
    return Promise.resolve(null);
  }

  listBrewSessionsWithSteps(_workspaceId: string): Promise<readonly ProjectedBrewSession[]> {
    return Promise.resolve([]);
  }

  getBrewSessionWithSteps(
    _workspaceId: string,
    _sessionId: string,
  ): Promise<ProjectedBrewSession | null> {
    return Promise.resolve(null);
  }

  getBrewdaySettings(_workspaceId: string): Promise<ProjectedBrewdaySettings | null> {
    return Promise.resolve(null);
  }

  listVessels(_workspaceId: string): Promise<readonly ProjectedVessel[]> {
    return Promise.resolve([]);
  }

  getVessel(_workspaceId: string, _vesselId: string): Promise<ProjectedVessel | null> {
    return Promise.resolve(null);
  }

  listEquipmentProfiles(_workspaceId: string): Promise<readonly ProjectedEquipmentProfile[]> {
    return Promise.resolve([]);
  }
}

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
  if (!isVerticalInstalled("brewery")) {
    return new NullBreweryScheduleProjection();
  }
  return new PrismaBreweryScheduleProjection(prisma);
}
