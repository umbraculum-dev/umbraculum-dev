import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import {
  MediaAssetRefCreateRequestSchema,
  MediaAssetRefGetResponseSchema,
  MediaAssetRefListResponseSchema,
  MediaAssetRefUpdateRequestSchema,
  PimDeleteResponseSchema,
} from "@umbraculum/pim-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { MediaAssetRefsService } from "../services/mediaAssetRefsService.js";

const ProductIdParamsSchema = z.object({
  productId: z.string().min(1, "productId required"),
});

const MediaAssetRefIdParamsSchema = z.object({
  mediaAssetRefId: z.string().min(1, "mediaAssetRefId required"),
});

export function pimMediaAssetRefsRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new MediaAssetRefsService(app.prisma);

  zodApp.get(
    "/pim/products/:productId/media-asset-refs",
    {
      schema: {
        tags: ["pim"],
        params: ProductIdParamsSchema,
        response: {
          200: MediaAssetRefListResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const items = await svc.listMediaAssetRefsForProduct(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.productId,
      );
      return MediaAssetRefListResponseSchema.parse({ ok: true, items });
    },
  );

  zodApp.get(
    "/pim/media-asset-refs/:mediaAssetRefId",
    {
      schema: {
        tags: ["pim"],
        params: MediaAssetRefIdParamsSchema,
        response: {
          200: MediaAssetRefGetResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.getMediaAssetRefById(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.mediaAssetRefId,
      );
      return MediaAssetRefGetResponseSchema.parse({ ok: true, item });
    },
  );

  zodApp.post(
    "/pim/products/:productId/media-asset-refs",
    {
      schema: {
        tags: ["pim"],
        params: ProductIdParamsSchema,
        body: MediaAssetRefCreateRequestSchema,
        response: {
          201: MediaAssetRefGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.createMediaAssetRefForProduct(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.productId,
        req.body,
      );
      return reply.status(201).send(MediaAssetRefGetResponseSchema.parse({ ok: true, item }));
    },
  );

  zodApp.patch(
    "/pim/media-asset-refs/:mediaAssetRefId",
    {
      schema: {
        tags: ["pim"],
        params: MediaAssetRefIdParamsSchema,
        body: MediaAssetRefUpdateRequestSchema,
        response: {
          200: MediaAssetRefGetResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.updateMediaAssetRef(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.mediaAssetRefId,
        req.body,
      );
      return MediaAssetRefGetResponseSchema.parse({ ok: true, item });
    },
  );

  zodApp.delete(
    "/pim/media-asset-refs/:mediaAssetRefId",
    {
      schema: {
        tags: ["pim"],
        params: MediaAssetRefIdParamsSchema,
        response: {
          200: PimDeleteResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      await svc.deleteMediaAssetRef(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.mediaAssetRefId,
      );
      return PimDeleteResponseSchema.parse({ ok: true });
    },
  );
}
