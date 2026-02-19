import type { FastifyInstance } from "fastify";
import type { AdPlacement, AdPlatform } from "@prisma/client";

import { BadRequestError, ForbiddenError } from "../errors.js";
import { requireSession } from "../plugins/sessionAuth.js";
import { requirePlatformAdmin } from "../plugins/requirePlatformAdmin.js";

function assertPlacement(v: unknown): AdPlacement {
  if (
    v === "global_top" ||
    v === "global_bottom" ||
    v === "recipe_edit_after_fermentables" ||
    v === "recipe_edit_after_hops" ||
    v === "recipe_edit_after_yeast"
  ) {
    return v;
  }

  throw new BadRequestError("invalid_placement", "Invalid ad placement");
}

function assertPlatform(v: unknown): AdPlatform {
  if (v === "web") return v;
  return "web";
}

function parseDateOrNull(v: unknown): Date | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v !== "string") throw new BadRequestError("invalid_date", "Invalid date");
  const d = new Date(v);
  if (!Number.isFinite(d.getTime())) throw new BadRequestError("invalid_date", "Invalid date");
  return d;
}

export async function platformAdsRoutes(app: FastifyInstance) {
  app.get("/platform/ads", async (req) => {
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

    return { ok: true, ads: list };
  });

  app.post("/platform/ads", async (req) => {
    const s = requireSession(req);
    await requirePlatformAdmin(app, s.userId);

    const body = (req.body ?? {}) as Record<string, unknown>;
    const placement = assertPlacement(body.placement);
    const platform = assertPlatform(body.platform);
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
    const linkUrl = typeof body.linkUrl === "string" ? body.linkUrl.trim() : "";
    const altText = typeof body.altText === "string" ? body.altText.trim() : "";

    if (!imageUrl) throw new BadRequestError("invalid_image_url", "Body.imageUrl is required");
    if (!linkUrl) throw new BadRequestError("invalid_link_url", "Body.linkUrl is required");
    if (!altText) throw new BadRequestError("invalid_alt_text", "Body.altText is required");

    const startsAt = parseDateOrNull(body.startsAt);
    const endsAt = parseDateOrNull(body.endsAt);
    const isActive = typeof body.isActive === "boolean" ? body.isActive : true;
    const priority = typeof body.priority === "number" && Number.isFinite(body.priority) ? Math.trunc(body.priority) : 0;
    const weight = typeof body.weight === "number" && Number.isFinite(body.weight) ? Math.trunc(body.weight) : 1;

    const created = await app.prisma.ad.create({
      data: { placement, platform, imageUrl, linkUrl, altText, isActive, startsAt, endsAt, priority, weight },
      select: { id: true },
    });

    return { ok: true, id: created.id };
  });

  app.patch("/platform/ads/:id", async (req) => {
    const s = requireSession(req);
    await requirePlatformAdmin(app, s.userId);

    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";
    if (!id) throw new BadRequestError("invalid_id", "Params.id is required");

    const body = (req.body ?? {}) as Record<string, unknown>;

    const data: any = {};
    if (body.placement !== undefined) data.placement = assertPlacement(body.placement);
    if (body.platform !== undefined) data.platform = assertPlatform(body.platform);
    if (body.imageUrl !== undefined) data.imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
    if (body.linkUrl !== undefined) data.linkUrl = typeof body.linkUrl === "string" ? body.linkUrl.trim() : "";
    if (body.altText !== undefined) data.altText = typeof body.altText === "string" ? body.altText.trim() : "";
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.startsAt !== undefined) data.startsAt = parseDateOrNull(body.startsAt);
    if (body.endsAt !== undefined) data.endsAt = parseDateOrNull(body.endsAt);
    if (body.priority !== undefined && typeof body.priority === "number" && Number.isFinite(body.priority)) data.priority = Math.trunc(body.priority);
    if (body.weight !== undefined && typeof body.weight === "number" && Number.isFinite(body.weight)) data.weight = Math.trunc(body.weight);

    await app.prisma.ad.update({ where: { id }, data, select: { id: true } });
    return { ok: true };
  });

  app.delete("/platform/ads/:id", async (req) => {
    const s = requireSession(req);
    await requirePlatformAdmin(app, s.userId);

    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";
    if (!id) throw new BadRequestError("invalid_id", "Params.id is required");

    await app.prisma.ad.delete({ where: { id }, select: { id: true } });
    return { ok: true };
  });
}

