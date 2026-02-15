import { Prisma, type PrismaClient } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../errors.js";
import { AccountsService } from "./accountsService.js";

export type CreateRecipeInput = {
  name: string;
  style?: string | null;
  notes?: string | null;
  gristJson?: unknown;
  hopsJson?: unknown;
  yeastJson?: unknown;
};

export type UpdateRecipeInput = {
  name?: string | null;
  style?: string | null;
  notes?: string | null;
  gristJson?: unknown;
  hopsJson?: unknown;
  yeastJson?: unknown;
};

export class RecipesService {
  private readonly accounts: AccountsService;

  constructor(private readonly prisma: PrismaClient) {
    this.accounts = new AccountsService(prisma);
  }

  async listRecipes(userId: string, accountId: string) {
    await this.accounts.assertMembership(userId, accountId);

    return this.prisma.recipe.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getRecipe(userId: string, accountId: string, recipeId: string) {
    await this.accounts.assertMembership(userId, accountId);

    const recipe = await this.prisma.recipe.findFirst({
      where: { id: recipeId, accountId },
    });
    if (!recipe) throw new NotFoundError("recipe_not_found", "Recipe not found");
    return recipe;
  }

  async createRecipe(userId: string, accountId: string, input: CreateRecipeInput) {
    await this.accounts.assertMembership(userId, accountId);

    const name = input.name.trim();
    if (!name) throw new BadRequestError("invalid_name", "Body.name is required");

    const style = input.style?.trim() || null;
    const notes = input.notes?.trim() || null;
    const gristJson = validateGristJson(input.gristJson);
    const hopsJson = validateHopsJson(input.hopsJson);
    const yeastJson = validateYeastJson(input.yeastJson);

    return this.prisma.recipe.create({
      data: {
        accountId,
        name,
        style,
        notes,
        gristJson: gristJson === undefined ? undefined : (gristJson as any),
        hopsJson: hopsJson === undefined ? undefined : (hopsJson as any),
        yeastJson: yeastJson === undefined ? undefined : (yeastJson as any),
      },
    });
  }

  async updateRecipe(userId: string, accountId: string, recipeId: string, input: UpdateRecipeInput) {
    await this.accounts.assertMembership(userId, accountId);

    // Ensure account scoping is enforced even if IDs collide across accounts.
    await this.getRecipe(userId, accountId, recipeId);

    const data: Prisma.RecipeUpdateInput = {};

    if (input.name !== undefined) {
      const name = (input.name ?? "").trim();
      if (!name) throw new BadRequestError("invalid_name", "Body.name must be a non-empty string");
      data.name = name;
    }

    if (input.style !== undefined) data.style = input.style?.trim() || null;
    if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
    if (input.gristJson !== undefined) {
      const gristJson = validateGristJson(input.gristJson);
      if (gristJson === undefined) {
        // no-op
      } else if (gristJson === null) {
        data.gristJson = Prisma.JsonNull;
      } else {
        data.gristJson = gristJson as unknown as Prisma.InputJsonValue;
      }
    }

    if (input.hopsJson !== undefined) {
      const hopsJson = validateHopsJson(input.hopsJson);
      if (hopsJson === undefined) {
        // no-op
      } else if (hopsJson === null) {
        data.hopsJson = Prisma.JsonNull;
      } else {
        data.hopsJson = hopsJson as unknown as Prisma.InputJsonValue;
      }
    }

    if (input.yeastJson !== undefined) {
      const yeastJson = validateYeastJson(input.yeastJson);
      if (yeastJson === undefined) {
        // no-op
      } else if (yeastJson === null) {
        data.yeastJson = Prisma.JsonNull;
      } else {
        data.yeastJson = yeastJson as unknown as Prisma.InputJsonValue;
      }
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestError("no_updates", "No updatable fields provided");
    }

    return this.prisma.recipe.update({
      where: { id: recipeId },
      data,
    });
  }

  async deleteRecipe(userId: string, accountId: string, recipeId: string) {
    await this.accounts.assertMembership(userId, accountId);

    // Enforce account scoping.
    await this.getRecipe(userId, accountId, recipeId);

    await this.prisma.recipe.delete({ where: { id: recipeId } });
    return { ok: true as const };
  }
}

type GristPotential =
  | { kind: "ppg"; value: number }
  | { kind: "yieldPercent"; value: number }
  | { kind: "sg"; value: number };

type GristMaltClass = "base" | "crystal" | "roast" | "acid";

type GristRow = {
  id: string;
  ingredientId?: string | null;
  name: string;
  producer?: string | null;
  amountKg: number;
  colorLovibond: number | null;
  potential: GristPotential | null;
  maltClass: GristMaltClass;
};

function ensureFinite(n: unknown, field: string) {
  if (typeof n !== "number" || Number.isNaN(n) || !Number.isFinite(n)) {
    throw new BadRequestError("invalid_number", `Body.${field} must be a number`);
  }
  return n;
}

function validateGristJson(value: unknown): GristRow[] | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (!Array.isArray(value)) {
    throw new BadRequestError("invalid_grist_json", "Body.gristJson must be an array");
  }

  return value.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    const ingredientIdRaw = o.ingredientId;
    const ingredientId =
      ingredientIdRaw === null || ingredientIdRaw === undefined
        ? null
        : typeof ingredientIdRaw === "string"
          ? ingredientIdRaw.trim() || null
          : (() => {
              throw new BadRequestError(
                "invalid_grist_row_ingredient_id",
                `Body.gristJson[${idx}].ingredientId must be a string or null`,
              );
            })();
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const producerRaw = o.producer;
    const producer =
      producerRaw === null || producerRaw === undefined
        ? null
        : typeof producerRaw === "string"
          ? producerRaw.trim() || null
          : (() => {
              throw new BadRequestError(
                "invalid_grist_row_producer",
                `Body.gristJson[${idx}].producer must be a string or null`,
              );
            })();
    const amountKg = ensureFinite(o.amountKg, `gristJson[${idx}].amountKg`);
    const colorLovibondRaw = o.colorLovibond;
    const colorLovibond =
      colorLovibondRaw === null
        ? null
        : colorLovibondRaw === undefined
          ? null
          : ensureFinite(colorLovibondRaw, `gristJson[${idx}].colorLovibond`);

    if (!id) {
      throw new BadRequestError("invalid_grist_row_id", `Body.gristJson[${idx}].id is required`);
    }
    if (!name) {
      throw new BadRequestError("invalid_grist_row_name", `Body.gristJson[${idx}].name is required`);
    }
    if (!(amountKg > 0)) {
      throw new BadRequestError(
        "invalid_grist_row_amount",
        `Body.gristJson[${idx}].amountKg must be > 0`,
      );
    }
    if (colorLovibond !== null && !(colorLovibond >= 0)) {
      throw new BadRequestError(
        "invalid_grist_row_color",
        `Body.gristJson[${idx}].colorLovibond must be >= 0`,
      );
    }

    const maltClassRaw = o.maltClass;
    const maltClass: GristMaltClass =
      maltClassRaw === undefined || maltClassRaw === null
        ? "base"
        : maltClassRaw === "base" || maltClassRaw === "crystal" || maltClassRaw === "roast" || maltClassRaw === "acid"
          ? maltClassRaw
          : (() => {
              throw new BadRequestError(
                "invalid_grist_row_malt_class",
                `Body.gristJson[${idx}].maltClass must be one of: base, crystal, roast, acid`,
              );
            })();

    const potentialRaw = o.potential;
    let potential: GristPotential | null = null;
    if (potentialRaw === null || potentialRaw === undefined) {
      potential = null;
    } else if (typeof potentialRaw === "object") {
      const p = potentialRaw as Record<string, unknown>;
      const kind = p.kind;
      const pv = ensureFinite(p.value, `gristJson[${idx}].potential.value`);
      if (kind !== "ppg" && kind !== "yieldPercent" && kind !== "sg") {
        throw new BadRequestError(
          "invalid_grist_row_potential_kind",
          `Body.gristJson[${idx}].potential.kind is invalid`,
        );
      }
      if (!(pv > 0)) {
        throw new BadRequestError(
          "invalid_grist_row_potential_value",
          `Body.gristJson[${idx}].potential.value must be > 0`,
        );
      }
      potential = { kind, value: pv } as GristPotential;
    } else {
      throw new BadRequestError(
        "invalid_grist_row_potential",
        `Body.gristJson[${idx}].potential must be an object or null`,
      );
    }

    const out: any = {
      id,
      name,
      amountKg,
      colorLovibond,
      potential,
      maltClass,
    };
    if (ingredientId) out.ingredientId = ingredientId;
    if (producer) out.producer = producer;
    return out as GristRow;
  });
}

type HopUse = "boil" | "whirlpool" | "dryhop";

type HopRow = {
  id: string;
  ingredientId?: string | null;
  name: string;
  country?: string | null;
  amountGrams: number;
  alphaAcidPercent: number | null;
  use: HopUse;
  timeMinutes: number | null;
};

function validateHopsJson(value: unknown): HopRow[] | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (!Array.isArray(value)) throw new BadRequestError("invalid_hops_json", "Body.hopsJson must be an array");

  return value.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    if (!id) throw new BadRequestError("invalid_hop_row_id", `Body.hopsJson[${idx}].id is required`);

    const ingredientIdRaw = o.ingredientId;
    const ingredientId =
      ingredientIdRaw === null || ingredientIdRaw === undefined
        ? null
        : typeof ingredientIdRaw === "string"
          ? ingredientIdRaw.trim() || null
          : (() => {
              throw new BadRequestError(
                "invalid_hop_row_ingredient_id",
                `Body.hopsJson[${idx}].ingredientId must be a string or null`,
              );
            })();

    const name = typeof o.name === "string" ? o.name.trim() : "";
    if (!name) throw new BadRequestError("invalid_hop_row_name", `Body.hopsJson[${idx}].name is required`);

    const countryRaw = o.country;
    const country =
      countryRaw === null || countryRaw === undefined
        ? null
        : typeof countryRaw === "string"
          ? countryRaw.trim() || null
          : (() => {
              throw new BadRequestError(
                "invalid_hop_row_country",
                `Body.hopsJson[${idx}].country must be a string or null`,
              );
            })();

    const amountGrams = ensureFinite(o.amountGrams, `hopsJson[${idx}].amountGrams`);
    if (!(amountGrams >= 0)) {
      throw new BadRequestError("invalid_hop_row_amount", `Body.hopsJson[${idx}].amountGrams must be >= 0`);
    }

    const alphaRaw = o.alphaAcidPercent;
    const alphaAcidPercent =
      alphaRaw === null || alphaRaw === undefined
        ? null
        : typeof alphaRaw === "number"
          ? alphaRaw
          : NaN;
    if (typeof alphaAcidPercent === "number" && (!Number.isFinite(alphaAcidPercent) || alphaAcidPercent < 0)) {
      throw new BadRequestError(
        "invalid_hop_row_alpha",
        `Body.hopsJson[${idx}].alphaAcidPercent must be null or a number >= 0`,
      );
    }

    const useRaw = o.use;
    const use: HopUse =
      useRaw === "boil" || useRaw === "whirlpool" || useRaw === "dryhop"
        ? useRaw
        : (() => {
            throw new BadRequestError(
              "invalid_hop_row_use",
              `Body.hopsJson[${idx}].use must be one of: boil, whirlpool, dryhop`,
            );
          })();

    const timeRaw = o.timeMinutes;
    const timeMinutes =
      timeRaw === null || timeRaw === undefined ? null : typeof timeRaw === "number" ? timeRaw : NaN;
    if (typeof timeMinutes === "number" && (!Number.isFinite(timeMinutes) || timeMinutes < 0)) {
      throw new BadRequestError(
        "invalid_hop_row_time",
        `Body.hopsJson[${idx}].timeMinutes must be null or a number >= 0`,
      );
    }

    const out: any = {
      id,
      ingredientId,
      name,
      amountGrams,
      alphaAcidPercent,
      use,
      timeMinutes,
    };
    if (country) out.country = country;
    return out as HopRow;
  });
}

type YeastRow = {
  id: string;
  ingredientId?: string | null;
  name: string;
  lab?: string | null;
};

function validateYeastJson(value: unknown): YeastRow[] | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (!Array.isArray(value)) throw new BadRequestError("invalid_yeast_json", "Body.yeastJson must be an array");

  return value.map((row, idx) => {
    const o = (row ?? {}) as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    if (!id) throw new BadRequestError("invalid_yeast_row_id", `Body.yeastJson[${idx}].id is required`);

    const ingredientIdRaw = o.ingredientId;
    const ingredientId =
      ingredientIdRaw === null || ingredientIdRaw === undefined
        ? null
        : typeof ingredientIdRaw === "string"
          ? ingredientIdRaw.trim() || null
          : (() => {
              throw new BadRequestError(
                "invalid_yeast_row_ingredient_id",
                `Body.yeastJson[${idx}].ingredientId must be a string or null`,
              );
            })();

    const name = typeof o.name === "string" ? o.name.trim() : "";
    if (!name) throw new BadRequestError("invalid_yeast_row_name", `Body.yeastJson[${idx}].name is required`);

    const labRaw = o.lab;
    const lab =
      labRaw === null || labRaw === undefined
        ? null
        : typeof labRaw === "string"
          ? labRaw.trim() || null
          : (() => {
              throw new BadRequestError(
                "invalid_yeast_row_lab",
                `Body.yeastJson[${idx}].lab must be a string or null`,
              );
            })();

    const out: any = { id, ingredientId, name };
    if (lab) out.lab = lab;
    return out as YeastRow;
  });
}

