import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import {
  AttributeCreateRequestSchema,
  AttributeGetResponseSchema,
  AttributeListResponseSchema,
  AttributeUpdateRequestSchema,
  PimDeleteResponseSchema,
} from "@umbraculum/pim-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { AttributesService } from "../services/attributesService.js";

const AttributeIdParamsSchema = z.object({
  attributeId: z.string().min(1, "attributeId required"),
});

export function pimAttributesRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new AttributesService(app.prisma);

  zodApp.get(
    "/pim/attributes",
    {
      schema: {
        response: {
          200: AttributeListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const items = await svc.listAttributes(ctx.userId, ctx.activeWorkspaceId);
      return AttributeListResponseSchema.parse({ ok: true, items });
    },
  );

  zodApp.get(
    "/pim/attributes/:attributeId",
    {
      schema: {
        params: AttributeIdParamsSchema,
        response: {
          200: AttributeGetResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.getAttributeById(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.attributeId,
      );
      return AttributeGetResponseSchema.parse({ ok: true, item });
    },
  );

  zodApp.post(
    "/pim/attributes",
    {
      schema: {
        body: AttributeCreateRequestSchema,
        response: {
          201: AttributeGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.createAttribute(ctx.userId, ctx.activeWorkspaceId, req.body);
      return reply.status(201).send(AttributeGetResponseSchema.parse({ ok: true, item }));
    },
  );

  zodApp.patch(
    "/pim/attributes/:attributeId",
    {
      schema: {
        params: AttributeIdParamsSchema,
        body: AttributeUpdateRequestSchema,
        response: {
          200: AttributeGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.updateAttribute(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.attributeId,
        req.body,
      );
      return AttributeGetResponseSchema.parse({ ok: true, item });
    },
  );

  zodApp.delete(
    "/pim/attributes/:attributeId",
    {
      schema: {
        params: AttributeIdParamsSchema,
        response: {
          200: PimDeleteResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      await svc.deleteAttribute(ctx.userId, ctx.activeWorkspaceId, req.params.attributeId);
      return PimDeleteResponseSchema.parse({ ok: true });
    },
  );
}
