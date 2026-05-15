import type { AiTool } from "@brewery/contracts";
import type { PrismaClient } from "@prisma/client";

import { RecipesService } from "../../../recipesService.js";

interface RecipeLookupInput {
  name?: string;
  idHint?: string;
}

interface RecipeLookupOutput {
  matched: Array<{
    id: string;
    name: string;
    styleKey: string | null;
    version: number;
    /** Original gravity (specific gravity, e.g. 1.052). */
    og: number | null;
    /** Final gravity (specific gravity). */
    fg: number | null;
    /** Alcohol by volume (decimal, e.g. 0.052 for 5.2%). */
    abv: number | null;
    /** SRM color (Standard Reference Method). */
    srm: number | null;
    /** IBU bitterness (International Bitterness Units). */
    ibu: number | null;
  }>;
  totalCount: number;
}

/**
 * Extract a numeric scalar from a BeerJSON percent/measurement node.
 * BeerJSON shapes vary by field — `og`/`fg` are gravity numbers, `abv` is
 * a percent object `{ value, unit }`, `color`/`ibu` may be measurement
 * objects. Returns `null` when the field is missing or not parseable.
 */
function readNumeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value && typeof value === "object" && "value" in value) {
    const v = (value as { value: unknown }).value;
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

export function createRecipeLookupTool(prisma: PrismaClient): AiTool<RecipeLookupInput, RecipeLookupOutput> {
  const recipes = new RecipesService(prisma);

  return {
    name: "brewery.recipeLookup",
    description:
      "Look up a recipe in the user's workspace by name fragment or recipe id. Returns up to 5 matches with style, OG, FG, ABV, SRM, IBU.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Case-insensitive substring of the recipe name" },
        idHint: { type: "string", description: "Exact recipe id (UUID), if known" },
      },
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      const all = await recipes.listRecipes(ctx.userId, ctx.workspaceId);
      const filtered = all.filter((r) => {
        if (input.idHint && r.id === input.idHint) return true;
        if (input.name && r.name.toLowerCase().includes(input.name.toLowerCase())) return true;
        return !input.idHint && !input.name;
      });
      const matched = filtered.slice(0, 5).map((r) => {
        const stats = (r.beerJsonRecipeJson ?? {}) as Record<string, unknown>;
        return {
          id: r.id,
          name: r.name,
          styleKey: r.styleKey,
          version: r.version,
          og: readNumeric(stats.original_gravity ?? stats.og),
          fg: readNumeric(stats.final_gravity ?? stats.fg),
          abv: readNumeric(stats.alcohol_by_volume ?? stats.abv),
          srm: readNumeric(stats.color_estimate ?? stats.srm),
          ibu: readNumeric(stats.ibu_estimate ?? stats.ibu),
        };
      });
      return { matched, totalCount: filtered.length };
    },
  };
}
