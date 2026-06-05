import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  ErrorResponseSchema,
  PlatformAdCreateRequestSchema,
  PlatformAdCreateResponseSchema,
  PlatformAdIdParamsSchema,
  PlatformAdOkResponseSchema,
  PlatformAdPatchRequestSchema,
  PlatformAdsListResponseSchema,
} from "@umbraculum/contracts";

import { requireSession } from "../plugins/sessionAuth.js";
import { requirePlatformAdmin } from "../plugins/requirePlatformAdmin.js";
import { PlatformAdsService } from "../services/platformAdsService.js";

export function platformAdsRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const ads = new PlatformAdsService(app.prisma);

  zodApp.get(
    "/platform/ads",
    {
      schema: {
        tags: ["platform-admin"],
        response: {
          200: PlatformAdsListResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const s = requireSession(req);
      await requirePlatformAdmin(app, s.userId);
      const list = await ads.listAds();
      return PlatformAdsListResponseSchema.parse({ ok: true, ads: list });
    },
  );

  zodApp.post(
    "/platform/ads",
    {
      schema: {
        tags: ["platform-admin"],
        body: PlatformAdCreateRequestSchema,
        response: {
          200: PlatformAdCreateResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const s = requireSession(req);
      await requirePlatformAdmin(app, s.userId);
      const created = await ads.createAd(req.body);
      return PlatformAdCreateResponseSchema.parse({ ok: true, id: created.id });
    },
  );

  zodApp.patch(
    "/platform/ads/:id",
    {
      schema: {
        tags: ["platform-admin"],
        params: PlatformAdIdParamsSchema,
        body: PlatformAdPatchRequestSchema,
        response: {
          200: PlatformAdOkResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const s = requireSession(req);
      await requirePlatformAdmin(app, s.userId);
      await ads.updateAd(req.params.id, req.body);
      return PlatformAdOkResponseSchema.parse({ ok: true });
    },
  );

  zodApp.delete(
    "/platform/ads/:id",
    {
      schema: {
        tags: ["platform-admin"],
        params: PlatformAdIdParamsSchema,
        response: {
          200: PlatformAdOkResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const s = requireSession(req);
      await requirePlatformAdmin(app, s.userId);
      await ads.deleteAd(req.params.id);
      return PlatformAdOkResponseSchema.parse({ ok: true });
    },
  );
}
