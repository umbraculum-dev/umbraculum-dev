import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import {
  CategoryCreateRequestSchema,
  CategoryGetResponseSchema,
  CategoryListResponseSchema,
  CategoryUpdateRequestSchema,
  PimDeleteResponseSchema,
} from "@umbraculum/pim-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { CategoriesService } from "../services/categoriesService.js";

const CategoryIdParamsSchema = z.object({
  categoryId: z.string().min(1, "categoryId required"),
});

export function pimCategoriesRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
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

  zodApp.post(
    "/pim/categories",
    {
      schema: {
        body: CategoryCreateRequestSchema,
        response: {
          201: CategoryGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.createCategory(ctx.userId, ctx.activeWorkspaceId, req.body);
      return reply.status(201).send(CategoryGetResponseSchema.parse({ ok: true, item }));
    },
  );

  zodApp.patch(
    "/pim/categories/:categoryId",
    {
      schema: {
        params: CategoryIdParamsSchema,
        body: CategoryUpdateRequestSchema,
        response: {
          200: CategoryGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.updateCategory(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.categoryId,
        req.body,
      );
      return CategoryGetResponseSchema.parse({ ok: true, item });
    },
  );

  zodApp.delete(
    "/pim/categories/:categoryId",
    {
      schema: {
        params: CategoryIdParamsSchema,
        response: {
          200: PimDeleteResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      await svc.deleteCategory(ctx.userId, ctx.activeWorkspaceId, req.params.categoryId);
      return PimDeleteResponseSchema.parse({ ok: true });
    },
  );
}
