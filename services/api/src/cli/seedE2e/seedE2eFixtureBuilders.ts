import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

import {
  E2E_USER_MULTI_ADMIN_ID,
  E2E_WORKSPACE_2_ID,
  E2E_WORKSPACE_ID,
  PERSONAS,
  type Persona,
} from "./seedE2eFixtureTypes.js";

export {
  ensureE2eBrewSession,
  ensureE2eBrewSessionSteps,
  ensureE2eEquipmentProfile,
  ensureE2eRecipe,
  ensureE2eVessel,
  ensureE2eWaterProfile,
} from "./seedE2eFixtureEntityBuilders.js";

export async function ensurePersona(prisma: PrismaClient, persona: Persona) {
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

export async function ensureMembership(
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
export async function ensureCustomBeerStyle(prisma: PrismaClient) {
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

export async function ensureE2eWorkspaces(prisma: PrismaClient) {
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
}

export async function ensureE2eMemberships(prisma: PrismaClient) {
  for (const p of PERSONAS) {
    if (p.id === E2E_USER_MULTI_ADMIN_ID) continue;
    await ensureMembership(prisma, E2E_WORKSPACE_ID, p.id, p.role);
  }
  await ensureMembership(prisma, E2E_WORKSPACE_ID, E2E_USER_MULTI_ADMIN_ID, "brewery_admin");
  await ensureMembership(prisma, E2E_WORKSPACE_2_ID, E2E_USER_MULTI_ADMIN_ID, "brewery_admin");
}

export { E2E_USER_MULTI_ADMIN_ID, PERSONAS };
