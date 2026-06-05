import { PrismaClient } from "@prisma/client";

import {
  E2E_BREW_SESSION_BOIL_STEP_ID,
  E2E_BREW_SESSION_ID,
  E2E_BREW_SESSION_MASH_STEP_ID,
  E2E_EQUIPMENT_PROFILE_ID,
  E2E_RECIPE_ID,
  E2E_USER_ADMIN_ID,
  E2E_USER_MEMBER_ID,
  E2E_USER_MULTI_ADMIN_ID,
  E2E_USER_VIEWER_ID,
  E2E_VESSEL_ID,
  E2E_WATER_PROFILE_ID,
  E2E_WORKSPACE_2_ID,
  E2E_WORKSPACE_ID,
} from "./seedE2eFixtureTypes.js";

export async function cleanE2eFixture() {
  const prisma = new PrismaClient();
  try {
    await prisma.brewSessionStep.deleteMany({
      where: {
        id: {
          in: [E2E_BREW_SESSION_MASH_STEP_ID, E2E_BREW_SESSION_BOIL_STEP_ID],
        },
      },
    });
    await prisma.brewSession.deleteMany({ where: { id: E2E_BREW_SESSION_ID } });
    await prisma.vessel.deleteMany({ where: { id: E2E_VESSEL_ID } });
    await prisma.equipmentProfile.deleteMany({ where: { id: E2E_EQUIPMENT_PROFILE_ID } });
    await prisma.recipeWaterSettings.deleteMany({ where: { recipeId: E2E_RECIPE_ID } });
    await prisma.recipe.deleteMany({ where: { id: E2E_RECIPE_ID } });
    await prisma.waterProfile.deleteMany({ where: { id: E2E_WATER_PROFILE_ID } });
    await prisma.workspaceMember.deleteMany({
      where: { workspaceId: { in: [E2E_WORKSPACE_ID, E2E_WORKSPACE_2_ID] } },
    });
    await prisma.workspace.deleteMany({
      where: { id: { in: [E2E_WORKSPACE_ID, E2E_WORKSPACE_2_ID] } },
    });
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [
            E2E_USER_ADMIN_ID,
            E2E_USER_MEMBER_ID,
            E2E_USER_VIEWER_ID,
            E2E_USER_MULTI_ADMIN_ID,
          ],
        },
      },
    });
    console.log(JSON.stringify({ ok: true, cleaned: true }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}
