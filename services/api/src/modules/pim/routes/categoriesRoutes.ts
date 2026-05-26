import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  CategoryGetResponseSchema,
  CategoryListResponseSchema,
} from "@umbraculum/pim-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { CategoriesService } from "../services/categoriesService.js";

const CategoryIdParamsSchema = z.object({
  categoryId: z.string().min(1, "categoryId required"),
});

export function pimCategoriesRoutes(app: FastifyInstance): void {
  const svc = new CategoriesService(app.prisma);

  app.get("/pim/categories", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const { items, tree } = await svc.listCategories(ctx.userId, ctx.activeWorkspaceId);
    return CategoryListResponseSchema.parse({ ok: true, items, tree });
  });

  app.get("/pim/categories/:categoryId", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = CategoryIdParamsSchema.parse(req.params);
    const item = await svc.getCategoryById(
      ctx.userId,
      ctx.activeWorkspaceId,
      params.categoryId,
    );
    return CategoryGetResponseSchema.parse({ ok: true, item });
  });
}
