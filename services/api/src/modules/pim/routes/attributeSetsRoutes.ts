import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import {
  AttributeSetCreateRequestSchema,
  AttributeSetGetResponseSchema,
  AttributeSetListResponseSchema,
  AttributeSetUpdateRequestSchema,
  PimDeleteResponseSchema,
} from "@umbraculum/pim-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { AttributeSetsService } from "../services/attributeSetsService.js";

const SetIdParamsSchema = z.object({
  setId: z.string().min(1, "setId required"),
});

export function pimAttributeSetsRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new AttributeSetsService(app.prisma);

  zodApp.get(
    "/pim/attribute-sets",
    {
      schema: {
        tags: ["pim"],
        response: {
          200: AttributeSetListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const items = await svc.listAttributeSets(ctx.userId, ctx.activeWorkspaceId);
      return AttributeSetListResponseSchema.parse({ ok: true, items });
    },
  );

  zodApp.get(
    "/pim/attribute-sets/:setId",
    {
      schema: {
        tags: ["pim"],
        params: SetIdParamsSchema,
        response: {
          200: AttributeSetGetResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.getAttributeSetById(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.setId,
      );
      return AttributeSetGetResponseSchema.parse({ ok: true, item });
    },
  );

  zodApp.post(
    "/pim/attribute-sets",
    {
      schema: {
        tags: ["pim"],
        body: AttributeSetCreateRequestSchema,
        response: {
          201: AttributeSetGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.createAttributeSet(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.body,
      );
      return reply.status(201).send(AttributeSetGetResponseSchema.parse({ ok: true, item }));
    },
  );

  zodApp.patch(
    "/pim/attribute-sets/:setId",
    {
      schema: {
        tags: ["pim"],
        params: SetIdParamsSchema,
        body: AttributeSetUpdateRequestSchema,
        response: {
          200: AttributeSetGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.updateAttributeSet(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.setId,
        req.body,
      );
      return AttributeSetGetResponseSchema.parse({ ok: true, item });
    },
  );

  zodApp.delete(
    "/pim/attribute-sets/:setId",
    {
      schema: {
        tags: ["pim"],
        params: SetIdParamsSchema,
        response: {
          200: PimDeleteResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      await svc.deleteAttributeSet(ctx.userId, ctx.activeWorkspaceId, req.params.setId);
      return PimDeleteResponseSchema.parse({ ok: true });
    },
  );
}
