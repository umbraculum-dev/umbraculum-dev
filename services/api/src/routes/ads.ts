import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  AdSlotParamsSchema,
  AdSlotQuerySchema,
  AdSlotResponseSchema,
  ErrorResponseSchema,
} from "@umbraculum/contracts";

import { getOptionalContext } from "../plugins/requestContext.js";
import { AdsService } from "../services/adsService.js";

export function adsRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const ads = new AdsService(app.prisma);

  zodApp.get(
    "/ads/slot/:placement",
    {
      schema: {
        tags: ["ads"],
        params: AdSlotParamsSchema,
        querystring: AdSlotQuerySchema,
        response: {
          200: AdSlotResponseSchema,
          400: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const { placement } = req.params;
      const platform = req.query.platform ?? "web";

      const ctx = getOptionalContext(req);
      const activeWorkspaceId = ctx?.activeWorkspaceId ?? null;

      const slot = await ads.resolveSlot({ placement, platform, activeWorkspaceId });
      return AdSlotResponseSchema.parse({ ok: true, placement, platform, ...slot });
    },
  );
}
