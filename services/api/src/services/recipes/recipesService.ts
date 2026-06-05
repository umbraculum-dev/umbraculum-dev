import type { PrismaClient } from "@prisma/client";

import { WorkspacesService } from "../workspacesService.js";
import {
  getRecipe,
  getRecipeForWorkspace,
  listRecipeVersions,
  listRecipes,
  listRecipesForWorkspace,
} from "./recipesReadOps.js";
import type { CreateRecipeInput, UpdateRecipeInput } from "./recipesTypes.js";
import {
  createRecipe,
  createRecipeForWorkspace,
  deleteRecipe,
  updateRecipe,
} from "./recipesWriteOps.js";
import { createRecipeVersionFromCurrent, duplicateRecipe } from "./recipesVersionOps.js";

export type { CreateRecipeInput, UpdateRecipeInput } from "./recipesTypes.js";

export class RecipesService {
  private readonly workspaces: WorkspacesService;

  constructor(private readonly prisma: PrismaClient) {
    this.workspaces = new WorkspacesService(prisma);
  }

  async listRecipes(userId: string, workspaceId: string) {
    return listRecipes(this.prisma, this.workspaces, userId, workspaceId);
  }

  async getRecipe(userId: string, workspaceId: string, recipeId: string) {
    return getRecipe(this.prisma, this.workspaces, userId, workspaceId, recipeId);
  }

  async listRecipeVersions(userId: string, workspaceId: string, recipeId: string) {
    return listRecipeVersions(this.prisma, this.workspaces, userId, workspaceId, recipeId);
  }

  async createRecipeVersionFromCurrent(userId: string, workspaceId: string, recipeId: string) {
    return createRecipeVersionFromCurrent(this.prisma, this.workspaces, userId, workspaceId, recipeId);
  }

  async duplicateRecipe(userId: string, workspaceId: string, recipeId: string) {
    return duplicateRecipe(this.prisma, this.workspaces, userId, workspaceId, recipeId);
  }

  async createRecipe(userId: string, workspaceId: string, input: CreateRecipeInput) {
    return createRecipe(this.prisma, this.workspaces, userId, workspaceId, input);
  }

  async createRecipeForWorkspace(workspaceId: string, input: CreateRecipeInput) {
    return createRecipeForWorkspace(this.prisma, workspaceId, input);
  }

  async getRecipeForWorkspace(recipeId: string, workspaceId: string) {
    return getRecipeForWorkspace(this.prisma, recipeId, workspaceId);
  }

  async listRecipesForWorkspace(workspaceId: string) {
    return listRecipesForWorkspace(this.prisma, workspaceId);
  }

  async updateRecipe(userId: string, workspaceId: string, recipeId: string, input: UpdateRecipeInput) {
    return updateRecipe(this.prisma, this.workspaces, userId, workspaceId, recipeId, input);
  }

  async deleteRecipe(userId: string, workspaceId: string, recipeId: string) {
    return deleteRecipe(this.prisma, this.workspaces, userId, workspaceId, recipeId);
  }
}
