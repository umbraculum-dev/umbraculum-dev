import type { PrismaClient } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../errors.js";
import { AccountsService } from "./accountsService.js";

export type CreateRecipeInput = {
  name: string;
  style?: string | null;
  notes?: string | null;
};

export type UpdateRecipeInput = {
  name?: string | null;
  style?: string | null;
  notes?: string | null;
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

    return this.prisma.recipe.create({
      data: {
        accountId,
        name,
        style,
        notes,
      },
    });
  }

  async updateRecipe(userId: string, accountId: string, recipeId: string, input: UpdateRecipeInput) {
    await this.accounts.assertMembership(userId, accountId);

    // Ensure account scoping is enforced even if IDs collide across accounts.
    await this.getRecipe(userId, accountId, recipeId);

    const data: { name?: string; style?: string | null; notes?: string | null } = {};

    if (input.name !== undefined) {
      const name = (input.name ?? "").trim();
      if (!name) throw new BadRequestError("invalid_name", "Body.name must be a non-empty string");
      data.name = name;
    }

    if (input.style !== undefined) data.style = input.style?.trim() || null;
    if (input.notes !== undefined) data.notes = input.notes?.trim() || null;

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

