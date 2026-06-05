import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

import {
  E2E_BREW_SESSION_BOIL_STEP_ID,
  E2E_BREW_SESSION_ID,
  E2E_BREW_SESSION_MASH_STEP_ID,
  E2E_EQUIPMENT_PROFILE_ID,
  E2E_RECIPE_ID,
  E2E_RECIPE_VERSION_GROUP_ID,
  E2E_USER_MULTI_ADMIN_ID,
  E2E_VESSEL_ID,
  E2E_WATER_PROFILE_ID,
  E2E_WORKSPACE_2_ID,
  E2E_WORKSPACE_ID,
  PERSONAS,
  type Persona,
} from "./seedE2eFixtureTypes.js";
import { buildE2EPaleAleBeerJson } from "./seedE2eFixtureRecipes.js";

async function ensurePersona(prisma: PrismaClient, persona: Persona) {
  const passwordHash = await argon2.hash(persona.password, { type: argon2.argon2id });
  await prisma.user.upsert({
    where: { id: persona.id },
    create: {
      id: persona.id,
      email: persona.email,
      passwordHash,
      preferredLocale: "en",
    },
    update: {
      email: persona.email,
      passwordHash,
    },
  });
}

async function ensureMembership(
  prisma: PrismaClient,
  workspaceId: string,
  userId: string,
  role: Persona["role"],
) {
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId, userId } },
    create: { workspaceId, userId, role },
    update: { role },
  });
}

/** FK target for E2E recipes (`styleKey: "custom"`). Normally from `prisma db seed`; required on fresh demo DBs. */
async function ensureCustomBeerStyle(prisma: PrismaClient) {
  await prisma.beerStyle.upsert({
    where: { key: "custom" },
    create: {
      key: "custom",
      source: "system",
      version: "v1",
      code: "custom",
      name: "Custom",
      category: null,
      categoryId: null,
      sortOrder: 1_000_000,
      isActive: true,
    },
    update: {
      name: "Custom",
      sortOrder: 1_000_000,
      isActive: true,
    },
  });
}

export async function seedE2eFixture() {
  const prisma = new PrismaClient();
  try {
    for (const p of PERSONAS) await ensurePersona(prisma, p);

    await prisma.workspace.upsert({
      where: { id: E2E_WORKSPACE_ID },
      create: {
        id: E2E_WORKSPACE_ID,
        name: "E2E Brewery",
        adsDisabled: true,
      },
      update: {
        name: "E2E Brewery",
        adsDisabled: true,
      },
    });

    // Second workspace for the SelectWorkspace flow regression-pin
    // (Phase 5g / Phase 3b L5 fixture). Owned by `e2e-multi-admin` who
    // is also a member of E2E_WORKSPACE_ID, so logging in lands on
    // /en/select-workspace instead of auto-selecting a single workspace.
    await prisma.workspace.upsert({
      where: { id: E2E_WORKSPACE_2_ID },
      create: {
        id: E2E_WORKSPACE_2_ID,
        name: "E2E Side Brewery",
        adsDisabled: true,
      },
      update: {
        name: "E2E Side Brewery",
        adsDisabled: true,
      },
    });

    // Single-workspace personas (admin, member, viewer) keep their
    // existing behavior (membership only in the primary workspace).
    // The multi-admin persona is a member of BOTH workspaces.
    for (const p of PERSONAS) {
      if (p.id === E2E_USER_MULTI_ADMIN_ID) continue;
      await ensureMembership(prisma, E2E_WORKSPACE_ID, p.id, p.role);
    }
    await ensureMembership(prisma, E2E_WORKSPACE_ID, E2E_USER_MULTI_ADMIN_ID, "brewery_admin");
    await ensureMembership(prisma, E2E_WORKSPACE_2_ID, E2E_USER_MULTI_ADMIN_ID, "brewery_admin");

    await ensureCustomBeerStyle(prisma);

    await prisma.waterProfile.upsert({
      where: { id: E2E_WATER_PROFILE_ID },
      create: {
        id: E2E_WATER_PROFILE_ID,
        key: "e2e:account:e2e-tap",
        scope: "account",
        type: "water",
        workspaceId: E2E_WORKSPACE_ID,
        name: "E2E Tap Water",
        calcium: 70,
        magnesium: 6,
        sodium: 15,
        sulfate: 40,
        chloride: 38,
        bicarbonate: 166,
        verificationStatus: "verified",
        source: "e2e-fixture",
      },
      update: {
        key: "e2e:account:e2e-tap",
        scope: "account",
        type: "water",
        workspaceId: E2E_WORKSPACE_ID,
        name: "E2E Tap Water",
        calcium: 70,
        magnesium: 6,
        sodium: 15,
        sulfate: 40,
        chloride: 38,
        bicarbonate: 166,
        verificationStatus: "verified",
        source: "e2e-fixture",
      },
    });

    await prisma.equipmentProfile.upsert({
      where: { id: E2E_EQUIPMENT_PROFILE_ID },
      create: {
        id: E2E_EQUIPMENT_PROFILE_ID,
        workspaceId: E2E_WORKSPACE_ID,
        name: "E2E Alpha Brewhouse",
        kettleVolumeLiters: 35,
        mashVolumeLiters: 30,
        mashEfficiencyPercent: 75,
      },
      update: {
        workspaceId: E2E_WORKSPACE_ID,
        name: "E2E Alpha Brewhouse",
        kettleVolumeLiters: 35,
        mashVolumeLiters: 30,
        mashEfficiencyPercent: 75,
      },
    });

    await prisma.vessel.upsert({
      where: { id: E2E_VESSEL_ID },
      create: {
        id: E2E_VESSEL_ID,
        workspaceId: E2E_WORKSPACE_ID,
        code: "E2E-KETTLE-01",
        displayName: "E2E Alpha Kettle",
        vesselKind: "kettle",
        equipmentProfileId: E2E_EQUIPMENT_PROFILE_ID,
      },
      update: {
        workspaceId: E2E_WORKSPACE_ID,
        code: "E2E-KETTLE-01",
        displayName: "E2E Alpha Kettle",
        vesselKind: "kettle",
        equipmentProfileId: E2E_EQUIPMENT_PROFILE_ID,
      },
    });

    const recipeName = "E2E Pale Ale";
    await prisma.recipe.upsert({
      where: { id: E2E_RECIPE_ID },
      create: {
        id: E2E_RECIPE_ID,
        workspaceId: E2E_WORKSPACE_ID,
        versionGroupId: E2E_RECIPE_VERSION_GROUP_ID,
        version: 0,
        name: recipeName,
        style: "Custom",
        styleKey: "custom",
        notes: "Seeded recipe used by Playwright + browser-MCP E2E flows.",
        beerJsonRecipeJson: buildE2EPaleAleBeerJson(recipeName),
        recipeExtJson: {
          equipmentSource: {
            equipmentProfileId: E2E_EQUIPMENT_PROFILE_ID,
            copiedAt: "2026-08-01T00:00:00.000Z",
          },
        },
      },
      update: {
        workspaceId: E2E_WORKSPACE_ID,
        versionGroupId: E2E_RECIPE_VERSION_GROUP_ID,
        version: 0,
        name: recipeName,
        style: "Custom",
        styleKey: "custom",
        notes: "Seeded recipe used by Playwright + browser-MCP E2E flows.",
        beerJsonRecipeJson: buildE2EPaleAleBeerJson(recipeName),
        recipeExtJson: {
          equipmentSource: {
            equipmentProfileId: E2E_EQUIPMENT_PROFILE_ID,
            copiedAt: "2026-08-01T00:00:00.000Z",
          },
        },
      },
    });

    await prisma.brewSession.upsert({
      where: { id: E2E_BREW_SESSION_ID },
      create: {
        id: E2E_BREW_SESSION_ID,
        workspaceId: E2E_WORKSPACE_ID,
        recipeId: E2E_RECIPE_ID,
        code: "E2E-PA-001",
        status: "draft",
        scheduledDate: new Date("2026-08-03T00:00:00.000Z"),
      },
      update: {
        workspaceId: E2E_WORKSPACE_ID,
        recipeId: E2E_RECIPE_ID,
        code: "E2E-PA-001",
        status: "draft",
        scheduledDate: new Date("2026-08-03T00:00:00.000Z"),
      },
    });

    await prisma.brewSessionStep.upsert({
      where: { id: E2E_BREW_SESSION_MASH_STEP_ID },
      create: {
        id: E2E_BREW_SESSION_MASH_STEP_ID,
        brewSessionId: E2E_BREW_SESSION_ID,
        sectionId: "mash",
        sectionName: "Mash",
        name: "E2E Alpha Mash",
        sortOrder: 1,
        minutesPlanned: 60,
        customTimerEnabled: true,
      },
      update: {
        brewSessionId: E2E_BREW_SESSION_ID,
        sectionId: "mash",
        sectionName: "Mash",
        name: "E2E Alpha Mash",
        isDisabled: false,
        sortOrder: 1,
        minutesPlanned: 60,
        relativeToStepId: null,
        offsetMinutesFromEnd: null,
        customTimerEnabled: true,
      },
    });

    await prisma.brewSessionStep.upsert({
      where: { id: E2E_BREW_SESSION_BOIL_STEP_ID },
      create: {
        id: E2E_BREW_SESSION_BOIL_STEP_ID,
        brewSessionId: E2E_BREW_SESSION_ID,
        sectionId: "boil",
        sectionName: "Boil",
        name: "E2E Alpha Boil Missing Duration",
        sortOrder: 2,
        minutesPlanned: null,
        customTimerEnabled: true,
      },
      update: {
        brewSessionId: E2E_BREW_SESSION_ID,
        sectionId: "boil",
        sectionName: "Boil",
        name: "E2E Alpha Boil Missing Duration",
        isDisabled: false,
        sortOrder: 2,
        minutesPlanned: null,
        relativeToStepId: null,
        offsetMinutesFromEnd: null,
        customTimerEnabled: true,
      },
    });

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

