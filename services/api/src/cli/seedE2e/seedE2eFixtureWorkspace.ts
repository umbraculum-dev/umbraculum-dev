import { PrismaClient } from "@prisma/client";

import {
  E2E_BREW_SESSION_BOIL_STEP_ID,
  E2E_BREW_SESSION_ID,
  E2E_BREW_SESSION_MASH_STEP_ID,
  E2E_EQUIPMENT_PROFILE_ID,
  E2E_RECIPE_ID,
  E2E_VESSEL_ID,
  E2E_WATER_PROFILE_ID,
  E2E_WORKSPACE_2_ID,
  E2E_WORKSPACE_ID,
  PERSONAS,
} from "./seedE2eFixtureTypes.js";
import {
  ensureCustomBeerStyle,
  ensureE2eBrewSession,
  ensureE2eBrewSessionSteps,
  ensureE2eEquipmentProfile,
  ensureE2eMemberships,
  ensureE2eRecipe,
  ensureE2eVessel,
  ensureE2eWaterProfile,
  ensureE2eWorkspaces,
  ensurePersona,
} from "./seedE2eFixtureBuilders.js";

export async function seedE2eFixture() {
  const prisma = new PrismaClient();
  try {
    for (const p of PERSONAS) await ensurePersona(prisma, p);

    await ensureE2eWorkspaces(prisma);
    await ensureE2eMemberships(prisma);
    await ensureCustomBeerStyle(prisma);
    await ensureE2eWaterProfile(prisma);
    await ensureE2eEquipmentProfile(prisma);
    await ensureE2eVessel(prisma);
    await ensureE2eRecipe(prisma);
    await ensureE2eBrewSession(prisma);
    await ensureE2eBrewSessionSteps(prisma);

    console.log(
      JSON.stringify(
        {
          ok: true,
          fixture: {
            workspaceId: E2E_WORKSPACE_ID,
            secondaryWorkspaceId: E2E_WORKSPACE_2_ID,
            users: PERSONAS.map((p) => ({ id: p.id, email: p.email, role: p.role })),
            recipeId: E2E_RECIPE_ID,
            waterProfileId: E2E_WATER_PROFILE_ID,
            brewSessionId: E2E_BREW_SESSION_ID,
            equipmentProfileId: E2E_EQUIPMENT_PROFILE_ID,
            vesselId: E2E_VESSEL_ID,
            mashStepId: E2E_BREW_SESSION_MASH_STEP_ID,
            boilStepId: E2E_BREW_SESSION_BOIL_STEP_ID,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}
