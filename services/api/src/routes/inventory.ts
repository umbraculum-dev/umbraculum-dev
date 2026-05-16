import type { FastifyInstance } from "fastify";
import type { InventoryItem } from "@prisma/client";
import { requireActiveWorkspace } from "../plugins/requestContext.js";
import { InventoryService } from "../services/inventoryService.js";

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

export async function inventoryRoutes(app: FastifyInstance) {
  const svc = new InventoryService(app.prisma);

  app.get("/inventory", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const query = (req.query ?? {}) as { category?: unknown };
    const category = typeof query.category === "string" && query.category.trim() ? query.category.trim() : undefined;
    const items = await svc.listItems(ctx.userId, ctx.activeWorkspaceId, category);
    return { ok: true, items: items.map(toItemPayload) };
  });

  app.post("/inventory", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const q = body.quantity;
    const quantity =
      typeof q === "number" && Number.isFinite(q)
        ? q
        : typeof q === "string"
          ? parseFloat(q)
          : 0;
    const created = await svc.createItem(ctx.userId, ctx.activeWorkspaceId, {
      category: body.category,
      ingredientId: body.ingredientId,
      name: typeof body.name === "string" ? body.name : "",
      quantity: Number.isFinite(quantity) ? quantity : 0,
      unit: body.unit ?? "kg",
      metadata: body.metadata,
    });
    return { ok: true, item: toItemPayload(created) };
  });

  app.patch("/inventory/:id", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";
    const body = (req.body ?? {}) as Record<string, unknown>;
    const updated = await svc.updateItem(ctx.userId, ctx.activeWorkspaceId, id, {
      name: typeof body.name === "string" ? body.name : undefined,
      quantity: body.quantity,
      unit: body.unit,
      metadata: body.metadata,
    });
    return { ok: true, item: toItemPayload(updated) };
  });

  app.delete("/inventory/:id", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";
    await svc.deleteItem(ctx.userId, ctx.activeWorkspaceId, id);
    return { ok: true };
  });
}
