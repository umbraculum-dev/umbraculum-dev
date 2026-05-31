import type { FastifyInstance } from "fastify";
import type { InventoryItem } from "@prisma/client";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ErrorResponseSchema,
  IdParamsSchema,
  InventoryCategoryQuerySchema,
  InventoryCreateRequestSchema,
  InventoryItemResponseSchema,
  InventoryListResponseSchema,
  InventoryPatchRequestSchema,
  OkResponseSchema,
} from "@umbraculum/contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { InventoryService } from "../../../services/inventoryService.js";

function toItemPayload(item: InventoryItem) {
  return {
    id: item.id,
    workspaceId: item.workspaceId,
    category: item.category,
    ingredientId: item.ingredientId,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    metadataJson: item.metadataJson ?? null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function inventoryRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new InventoryService(app.prisma);

  zodApp.get(
    "/inventory",
    {
      schema: {
        tags: ["brewery"],
        querystring: InventoryCategoryQuerySchema,
        response: {
          200: InventoryListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const category =
        typeof req.query.category === "string" && req.query.category.trim()
          ? req.query.category.trim()
          : undefined;
      const items = await svc.listItems(ctx.userId, ctx.activeWorkspaceId, category);
      return InventoryListResponseSchema.parse({ ok: true, items: items.map(toItemPayload) });
    },
  );

  zodApp.post(
    "/inventory",
    {
      schema: {
        tags: ["brewery"],
        body: InventoryCreateRequestSchema,
        response: {
          200: InventoryItemResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const body = req.body;
      const q = body["quantity"];
      const quantity =
        typeof q === "number" && Number.isFinite(q)
          ? q
          : typeof q === "string"
            ? parseFloat(q)
            : 0;
      const created = await svc.createItem(ctx.userId, ctx.activeWorkspaceId, {
        category: body["category"],
        ingredientId: body["ingredientId"],
        name: typeof body["name"] === "string" ? body["name"] : "",
        quantity: Number.isFinite(quantity) ? quantity : 0,
        unit: body["unit"] ?? "kg",
        metadata: body["metadata"],
      });
      return InventoryItemResponseSchema.parse({ ok: true, item: toItemPayload(created) });
    },
  );

  zodApp.patch(
    "/inventory/:id",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        body: InventoryPatchRequestSchema,
        response: {
          200: InventoryItemResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const body = req.body;
      const updated = await svc.updateItem(ctx.userId, ctx.activeWorkspaceId, req.params.id, {
        name: typeof body["name"] === "string" ? body["name"] : undefined,
        quantity: body["quantity"],
        unit: body["unit"],
        metadata: body["metadata"],
      });
      return InventoryItemResponseSchema.parse({ ok: true, item: toItemPayload(updated) });
    },
  );

  zodApp.delete(
    "/inventory/:id",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        response: {
          200: OkResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      await svc.deleteItem(ctx.userId, ctx.activeWorkspaceId, req.params.id);
      return { ok: true as const };
    },
  );
}
