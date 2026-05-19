import type { AiTool } from "@umbraculum/contracts";
import type { PrismaClient, InventoryCategory } from "@prisma/client";

import { InventoryService } from "../../../inventoryService.js";

interface IngredientOnHandInput {
  /**
   * Inventory category to search. Note: workspace yeast inventory is not
   * a separate category in v0 — it typically lives under `speciality`.
   */
  type: InventoryCategory;
  /** Case-insensitive substring of the item name (or full name). */
  skuOrName?: string;
}

interface IngredientOnHandOutput {
  matched: Array<{
    id: string;
    name: string;
    category: InventoryCategory;
    quantity: number;
    unit: string;
  }>;
  totalCount: number;
}

const VALID_CATEGORIES: ReadonlySet<InventoryCategory> = new Set<InventoryCategory>([
  "fermentable",
  "hop",
  "speciality",
  "acid_salt",
  "detergent_sanitizer",
  "kegging",
]);

export function createIngredientOnHandTool(
  prisma: PrismaClient,
): AiTool<IngredientOnHandInput, IngredientOnHandOutput> {
  const inventory = new InventoryService(prisma);

  return {
    name: "brewery.ingredientOnHand",
    description:
      "List on-hand inventory items in the user's workspace, filtered by category (fermentable, hop, speciality, acid_salt, detergent_sanitizer, kegging) and optionally by name fragment.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: Array.from(VALID_CATEGORIES),
          description: "Inventory category to filter by",
        },
        skuOrName: { type: "string", description: "Optional substring of the item name" },
      },
      required: ["type"],
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      if (!VALID_CATEGORIES.has(input.type)) {
        throw new Error(`brewery.ingredientOnHand: invalid category "${input.type}"`);
      }
      const all = await inventory.listItems(ctx.userId, ctx.workspaceId, input.type);
      const needle = (input.skuOrName ?? "").toLowerCase();
      const filtered = needle.length > 0 ? all.filter((it) => it.name.toLowerCase().includes(needle)) : all;
      const matched = filtered.slice(0, 10).map((it) => ({
        id: it.id,
        name: it.name,
        category: it.category,
        quantity: it.quantity,
        unit: it.unit,
      }));
      return { matched, totalCount: filtered.length };
    },
  };
}
