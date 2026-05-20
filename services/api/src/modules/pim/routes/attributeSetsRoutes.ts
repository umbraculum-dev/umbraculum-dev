import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  AttributeSetGetResponseSchema,
  AttributeSetListResponseSchema,
} from "@umbraculum/pim-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { AttributeSetsService } from "../services/attributeSetsService.js";

const SetIdParamsSchema = z.object({
  setId: z.string().min(1, "setId required"),
});

export function pimAttributeSetsRoutes(app: FastifyInstance): void {
  const svc = new AttributeSetsService(app.prisma);

  app.get("/pim/attribute-sets", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const items = await svc.listAttributeSets(ctx.userId, ctx.activeWorkspaceId);
    return AttributeSetListResponseSchema.parse({ ok: true, items });
  });

  app.get("/pim/attribute-sets/:setId", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = SetIdParamsSchema.parse(req.params);
    const item = await svc.getAttributeSetById(
      ctx.userId,
      ctx.activeWorkspaceId,
      params.setId,
    );
    return AttributeSetGetResponseSchema.parse({ ok: true, item });
  });
}
