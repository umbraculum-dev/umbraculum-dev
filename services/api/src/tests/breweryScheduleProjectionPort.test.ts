import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import { MrpBreweryProjectionService } from "../modules/mrp/services/breweryProjectionService.js";
import { breweryRecipeBomId } from "../platform/breweryProjectionIds.js";
import type {
  BreweryScheduleProjection,
  ProjectedRecipe,
} from "../platform/breweryScheduleProjection.js";

function mockRecipe(overrides: Partial<ProjectedRecipe> = {}): ProjectedRecipe {
  const id = overrides.id ?? randomUUID();
  return {
    id,
    workspaceId: overrides.workspaceId ?? randomUUID(),
    name: overrides.name ?? "Test Recipe",
    style: null,
    styleKey: "custom",
    versionGroupId: randomUUID(),
    version: 1,
    notes: null,
    beerJsonRecipeJson: {
      beerjson: {
        recipes: [{
          batch_size: { value: 20, unit: "l" },
          ingredients: {
            fermentable_additions: [{
              id: "ferm-1",
              name: "Pilsner malt",
              amount: { value: 4, unit: "kg" },
            }],
          },
        }],
      },
    },
    recipeExtJson: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function mockPort(recipes: readonly ProjectedRecipe[]): BreweryScheduleProjection {
  return {
    listRecipes: vi.fn(() => Promise.resolve(recipes)),
    getRecipe: vi.fn((workspaceId, recipeId) =>
      Promise.resolve(
        recipes.find((r) => r.id === recipeId && r.workspaceId === workspaceId) ?? null,
      ),
    ),
    listBrewSessionsWithSteps: vi.fn(() => Promise.resolve([])),
    getBrewSessionWithSteps: vi.fn(() => Promise.resolve(null)),
    getBrewdaySettings: vi.fn(() => Promise.resolve(null)),
    listVessels: vi.fn(() => Promise.resolve([])),
    getVessel: vi.fn(() => Promise.resolve(null)),
    listEquipmentProfiles: vi.fn(() => Promise.resolve([])),
  };
}

describe("MrpBreweryProjectionService — BreweryScheduleProjection port", () => {
  it("maps recipes from port to projected BOMs without Prisma", async () => {
    const workspaceId = randomUUID();
    const recipe = mockRecipe({ workspaceId, name: "Port Pale Ale" });
    const service = new MrpBreweryProjectionService(mockPort([recipe]));

    const boms = await service.listProjectedBoms(workspaceId);

    expect(boms).toHaveLength(1);
    expect(boms[0]?.id).toBe(breweryRecipeBomId(recipe.id));
    expect(boms[0]?.name).toBe("Port Pale Ale");
    expect(boms[0]?.lines).toHaveLength(1);
    expect(boms[0]?.lines[0]?.description).toBe("Pilsner malt");
  });

  it("returns null for unknown BOM id without touching Prisma", async () => {
    const workspaceId = randomUUID();
    const service = new MrpBreweryProjectionService(mockPort([]));

    const bom = await service.getProjectedBomById(workspaceId, "not-a-brewery-recipe-id");

    expect(bom).toBeNull();
  });
});
