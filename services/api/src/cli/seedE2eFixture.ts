/**
 * Idempotent E2E fixture seeder.
 *
 * Creates a known set of users, a workspace, a BeerJSON recipe, a water profile
 * and a brew session draft so that smoke/Playwright/agentic-browser tests can
 * share identities and content. Re-running is safe (all upserts).
 *
 * Run inside the `api` container:
 *   docker compose exec api npm run seed:e2e
 *
 * Clean (remove the fixture rows):
 *   docker compose exec api npm run seed:e2e -- --clean
 *
 * The fixture identities are documented as the single source of truth in
 * docs/TESTING.md "E2E fixture identities".
 */
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const E2E_USER_ADMIN_ID = "e2e00000-0000-0000-0000-000000000aaa";
const E2E_USER_MEMBER_ID = "e2e00000-0000-0000-0000-000000000bbb";
const E2E_USER_VIEWER_ID = "e2e00000-0000-0000-0000-000000000ccc";
const E2E_USER_MULTI_ADMIN_ID = "e2e00000-0000-0000-0000-000000000ddd";
const E2E_WORKSPACE_ID = "e2e00000-0000-0000-0000-0000000000aa";
const E2E_WORKSPACE_2_ID = "e2e00000-0000-0000-0000-0000000000bb";
const E2E_RECIPE_ID = "e2e00000-0000-0000-0000-000000000abc";
const E2E_RECIPE_VERSION_GROUP_ID = E2E_RECIPE_ID;
const E2E_WATER_PROFILE_ID = "e2e00000-0000-0000-0000-000000000fff";
const E2E_BREW_SESSION_ID = "e2e00000-0000-0000-0000-000000000bbe";

const ADMIN_EMAIL = "e2e-admin@brewery.local";
const MEMBER_EMAIL = "e2e-member@brewery.local";
const VIEWER_EMAIL = "e2e-viewer@brewery.local";
const MULTI_ADMIN_EMAIL = "e2e-multi-admin@brewery.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "e2e-admin-pw!";
const MEMBER_PASSWORD = process.env.E2E_MEMBER_PASSWORD ?? "e2e-member-pw!";
const VIEWER_PASSWORD = process.env.E2E_VIEWER_PASSWORD ?? "e2e-viewer-pw!";
const MULTI_ADMIN_PASSWORD = process.env.E2E_MULTI_ADMIN_PASSWORD ?? "e2e-multi-admin-pw!";

interface Persona {
  id: string;
  email: string;
  password: string;
  role: "brewery_admin" | "member" | "viewer";
}

const PERSONAS: Persona[] = [
  { id: E2E_USER_ADMIN_ID, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "brewery_admin" },
  { id: E2E_USER_MEMBER_ID, email: MEMBER_EMAIL, password: MEMBER_PASSWORD, role: "member" },
  { id: E2E_USER_VIEWER_ID, email: VIEWER_EMAIL, password: VIEWER_PASSWORD, role: "viewer" },
  {
    id: E2E_USER_MULTI_ADMIN_ID,
    email: MULTI_ADMIN_EMAIL,
    password: MULTI_ADMIN_PASSWORD,
    role: "brewery_admin",
  },
];

function buildE2EPaleAleBeerJson(name: string) {
  return {
    beerjson: {
      version: 1,
      recipes: [
        {
          name,
          type: "all grain",
          author: "brewery-app-e2e",
          efficiency: { brewhouse: { unit: "%", value: 75 } },
          batch_size: { unit: "l", value: 20 },
          ingredients: {
            fermentable_additions: [
              {
                id: "e2e-grain-1",
                name: "Pale Ale Malt",
                type: "grain",
                yield: { potential: { unit: "sg", value: 1.037 } },
                color: { unit: "Lovi", value: 3.0 },
                amount: { unit: "kg", value: 4.5 },
              },
              {
                id: "e2e-grain-2",
                name: "Crystal 60L",
                type: "grain",
                yield: { potential: { unit: "sg", value: 1.034 } },
                color: { unit: "Lovi", value: 60 },
                amount: { unit: "kg", value: 0.3 },
              },
            ],
            hop_additions: [
              {
                name: "Cascade",
                alpha_acid: { unit: "%", value: 5.5 },
                amount: { unit: "g", value: 30 },
                timing: { use: "add_to_boil", duration: { unit: "min", value: 60 } },
              },
              {
                name: "Centennial",
                alpha_acid: { unit: "%", value: 9.0 },
                amount: { unit: "g", value: 20 },
                timing: { use: "add_to_boil", duration: { unit: "min", value: 15 } },
              },
            ],
            culture_additions: [
              {
                name: "Safale US-05",
                type: "ale",
                form: "dry",
                amount: { unit: "g", value: 11 },
                attenuation: { unit: "%", value: 78 },
              },
            ],
            miscellaneous_additions: [],
          },
        },
      ],
    },
  };
}

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

async function seed() {
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
      },
      update: {
        workspaceId: E2E_WORKSPACE_ID,
        recipeId: E2E_RECIPE_ID,
        code: "E2E-PA-001",
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

async function clean() {
  const prisma = new PrismaClient();
  try {
    await prisma.brewSession.deleteMany({ where: { id: E2E_BREW_SESSION_ID } });
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

const cmd = process.argv.includes("--clean") ? clean : seed;
cmd().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(JSON.stringify({ ok: false, error: message }, null, 2));
  process.exit(1);
});
