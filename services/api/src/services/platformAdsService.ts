import type { Prisma, PrismaClient } from "@prisma/client";
import type { z } from "zod";
import {
  PlatformAdCreateRequestSchema,
  PlatformAdPatchRequestSchema,
} from "@umbraculum/contracts";

import { BadRequestError } from "../errors.js";

type PlatformAdCreateRequest = z.infer<typeof PlatformAdCreateRequestSchema>;
type PlatformAdPatchRequest = z.infer<typeof PlatformAdPatchRequestSchema>;

export function parseDateOrNull(v: unknown): Date | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v !== "string") throw new BadRequestError("invalid_date", "Invalid date");
  const d = new Date(v);
  if (!Number.isFinite(d.getTime())) throw new BadRequestError("invalid_date", "Invalid date");
  return d;
}

export class PlatformAdsService {
  constructor(private readonly prisma: PrismaClient) {}

  listAds() {
    return this.prisma.ad.findMany({
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
  }

  createAd(body: PlatformAdCreateRequest) {
    const startsAt = body.startsAt !== undefined ? parseDateOrNull(body.startsAt) : null;
    const endsAt = body.endsAt !== undefined ? parseDateOrNull(body.endsAt) : null;
    return this.prisma.ad.create({
      data: {
        placement: body.placement,
        platform: body.platform ?? "web",
        imageUrl: body.imageUrl,
        linkUrl: body.linkUrl,
        altText: body.altText,
        isActive: body.isActive ?? true,
        startsAt,
        endsAt,
        priority: body.priority ?? 0,
        weight: body.weight ?? 1,
      },
      select: { id: true },
    });
  }

  updateAd(id: string, body: PlatformAdPatchRequest) {
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

    return this.prisma.ad.update({ where: { id }, data, select: { id: true } });
  }

  deleteAd(id: string) {
    return this.prisma.ad.delete({ where: { id }, select: { id: true } });
  }
}
