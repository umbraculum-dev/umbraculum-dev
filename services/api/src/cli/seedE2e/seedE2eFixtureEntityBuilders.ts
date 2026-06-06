import type { PrismaClient } from "@prisma/client";

import {
  E2E_BREW_SESSION_BOIL_STEP_ID,
  E2E_BREW_SESSION_ID,
  E2E_BREW_SESSION_MASH_STEP_ID,
  E2E_EQUIPMENT_PROFILE_ID,
  E2E_RECIPE_ID,
  E2E_RECIPE_VERSION_GROUP_ID,
  E2E_VESSEL_ID,
  E2E_WATER_PROFILE_ID,
  E2E_WORKSPACE_ID,
} from "./seedE2eFixtureTypes.js";
import { buildE2EPaleAleBeerJson } from "./seedE2eFixtureRecipes.js";

export async function ensureE2eWaterProfile(prisma: PrismaClient) {
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
}

export async function ensureE2eEquipmentProfile(prisma: PrismaClient) {
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
}

export async function ensureE2eVessel(prisma: PrismaClient) {
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
}

export async function ensureE2eRecipe(prisma: PrismaClient) {
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
}

export async function ensureE2eBrewSession(prisma: PrismaClient) {
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
}

export async function ensureE2eBrewSessionSteps(prisma: PrismaClient) {
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
}
