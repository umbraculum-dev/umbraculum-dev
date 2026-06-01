import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { Prisma } from "@prisma/client";
import {
  ErrorResponseSchema,
  PlatformAdCreateRequestSchema,
  PlatformAdCreateResponseSchema,
  PlatformAdIdParamsSchema,
  PlatformAdOkResponseSchema,
  PlatformAdPatchRequestSchema,
  PlatformAdsListResponseSchema,
} from "@umbraculum/contracts";

import { BadRequestError } from "../errors.js";
import { requireSession } from "../plugins/sessionAuth.js";
import { requirePlatformAdmin } from "../plugins/requirePlatformAdmin.js";

function parseDateOrNull(v: unknown): Date | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v !== "string") throw new BadRequestError("invalid_date", "Invalid date");
  const d = new Date(v);
  if (!Number.isFinite(d.getTime())) throw new BadRequestError("invalid_date", "Invalid date");
  return d;
}

export function platformAdsRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();

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

      const list = await app.prisma.ad.findMany({
        orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
        select: {
          id: true,
          placement: true,
          platform: true,
          imageUrl: true,
          linkUrl: true,
          altText: true,
          isActive: true,
          startsAt: true,
          endsAt: true,
          priority: true,
          weight: true,
          createdAt: true,
          updatedAt: true,
        },
        take: 200,
      });

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

      const body = req.body;
      const placement = body.placement;
      const platform = body.platform ?? "web";
      const startsAt = body.startsAt !== undefined ? parseDateOrNull(body.startsAt) : null;
      const endsAt = body.endsAt !== undefined ? parseDateOrNull(body.endsAt) : null;
      const isActive = body.isActive ?? true;
      const priority = body.priority ?? 0;
      const weight = body.weight ?? 1;

      const created = await app.prisma.ad.create({
        data: {
          placement,
          platform,
          imageUrl: body.imageUrl,
          linkUrl: body.linkUrl,
          altText: body.altText,
          isActive,
          startsAt,
          endsAt,
          priority,
          weight,
        },
        select: { id: true },
      });

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

      const { id } = req.params;
      const body = req.body;

      const data: Prisma.AdUncheckedUpdateInput = {};
      if (body.placement !== undefined) data.placement = body.placement;
      if (body.platform !== undefined) data.platform = body.platform ?? "web";
      if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;
      if (body.linkUrl !== undefined) data.linkUrl = body.linkUrl;
      if (body.altText !== undefined) data.altText = body.altText;
      if (body.isActive !== undefined) data.isActive = body.isActive;
      if (body.startsAt !== undefined) data.startsAt = parseDateOrNull(body.startsAt);
      if (body.endsAt !== undefined) data.endsAt = parseDateOrNull(body.endsAt);
      if (body.priority !== undefined) data.priority = body.priority;
      if (body.weight !== undefined) data.weight = body.weight;

      await app.prisma.ad.update({ where: { id }, data, select: { id: true } });
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

      const { id } = req.params;
      await app.prisma.ad.delete({ where: { id }, select: { id: true } });
      return PlatformAdOkResponseSchema.parse({ ok: true });
    },
  );
}
