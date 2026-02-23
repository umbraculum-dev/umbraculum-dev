import type { AdPlacement, AdPlatform, PrismaClient } from "@prisma/client";

type ResolvedAd = {
  id: string;
  imageUrl: string;
  linkUrl: string;
  altText: string;
};

export type ResolveAdSlotResult =
  | { disabled: true; ad: null }
  | { disabled: false; ad: ResolvedAd | null };

export class AdsService {
  constructor(private readonly prisma: PrismaClient) {}

  async resolveSlot(args: { placement: AdPlacement; platform: AdPlatform; activeWorkspaceId: string | null }): Promise<ResolveAdSlotResult> {
    if (args.activeWorkspaceId) {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: args.activeWorkspaceId },
        select: { adsDisabled: true },
      });

      if (workspace?.adsDisabled) return { disabled: true, ad: null };
    }

    const now = new Date();
    const ad = await this.prisma.ad.findFirst({
      where: {
        placement: args.placement,
        platform: args.platform,
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }, { id: "asc" }],
      select: { id: true, imageUrl: true, linkUrl: true, altText: true },
    });

    return { disabled: false, ad: ad ?? null };
  }
}

