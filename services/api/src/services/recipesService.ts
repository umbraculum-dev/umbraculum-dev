import type { PrismaClient } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../errors.js";
import { AccountsService } from "./accountsService.js";

export type CreateRecipeInput = {
  name: string;
  style?: string | null;
  notes?: string | null;
  gristJson?: unknown;
};

export type UpdateRecipeInput = {
  name?: string | null;
  style?: string | null;
  notes?: string | null;
  gristJson?: unknown;
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

    return this.prisma.recipe.create({
      data: {
        accountId,
        name,
        style,
        notes,
        gristJson: gristJson === undefined ? undefined : (gristJson as any),
      },
    });
  }

  async updateRecipe(userId: string, accountId: string, recipeId: string, input: UpdateRecipeInput) {
    await this.accounts.assertMembership(userId, accountId);

    // Ensure account scoping is enforced even if IDs collide across accounts.
    await this.getRecipe(userId, accountId, recipeId);

    const data: { name?: string; style?: string | null; notes?: string | null; gristJson?: unknown } = {};

    if (input.name !== undefined) {
      const name = (input.name ?? "").trim();
      if (!name) throw new BadRequestError("invalid_name", "Body.name must be a non-empty string");
      data.name = name;
    }

    if (input.style !== undefined) data.style = input.style?.trim() || null;
    if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
    if (input.gristJson !== undefined) {
      const gristJson = validateGristJson(input.gristJson);
      data.gristJson = gristJson === undefined ? undefined : (gristJson as any);
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

type GristRow = {
  id: string;
  name: string;
  amountKg: number;
  colorLovibond: number | null;
  potential: GristPotential | null;
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
    const name = typeof o.name === "string" ? o.name.trim() : "";
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

    return {
      id,
      name,
      amountKg,
      colorLovibond,
      potential,
    };
  });
}

