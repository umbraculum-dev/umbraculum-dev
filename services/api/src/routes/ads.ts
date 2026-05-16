import type { FastifyInstance, FastifyRequest } from "fastify";
import type { AdPlacement, AdPlatform } from "@prisma/client";

import { BadRequestError } from "../errors.js";
import { getOptionalContext } from "../plugins/requestContext.js";
import { AdsService } from "../services/adsService.js";

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

export async function adsRoutes(app: FastifyInstance) {
  const ads = new AdsService(app.prisma);

  app.get("/ads/slot/:placement", async (req: FastifyRequest) => {
    const params = (req.params ?? {}) as { placement?: unknown };
    const placement = assertPlacement(params.placement);
    const query = (req.query ?? {}) as Record<string, unknown>;
    const platform = assertPlatform(query.platform);

    const ctx = getOptionalContext(req);
    const activeWorkspaceId = ctx?.activeWorkspaceId ?? null;

    const slot = await ads.resolveSlot({ placement, platform, activeWorkspaceId });
    return { ok: true, placement, platform, ...slot };
  });
}

