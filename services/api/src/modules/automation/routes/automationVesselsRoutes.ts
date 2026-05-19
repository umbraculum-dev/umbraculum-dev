import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  VesselListResponseSchema,
  VesselStateResponseSchema,
} from "@brewery/automation-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { VesselsService } from "../services/vesselsService.js";

const VesselCodeParamsSchema = z.object({
  code: z.string().min(1, "code required"),
});

/**
 * Phase B-2 automation vessel routes.
 *
 * - `GET /automation/vessels` — list all vessels in the active workspace.
 * - `GET /automation/vessels/:code` — fetch one vessel by its workspace-unique
 *   `code`.
 *
 * Both routes require an authenticated session + an active workspace (via
 * `requireActiveWorkspace`) and are workspace-scoped via the service layer's
 * `assertMembership` call. Cross-workspace access yields `403` (membership)
 * or `404` (vessel-not-found-in-workspace) per the canonical pattern in the
 * PR3 handoff doc.
 *
 * Response shapes are pinned via `VesselListResponseSchema` /
 * `VesselStateResponseSchema` — clients consume the inferred
 * `VesselListResponse` / `VesselStateResponse` types from
 * `@brewery/automation-contracts`.
 *
 * Phase C adds: `POST /automation/vessels` (create), `PATCH
 * /automation/vessels/:code` (update mode/target temp), and the adapter
 * supervisor's snapshot-to-vessel reconciliation loop.
 */
export function automationVesselsRoutes(app: FastifyInstance): void {
  const svc = new VesselsService(app.prisma);

  app.get("/automation/vessels", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const vessels = await svc.listVessels(ctx.userId, ctx.activeWorkspaceId);
    return VesselListResponseSchema.parse({
      ok: true,
      vessels,
    });
  });

  app.get("/automation/vessels/:code", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = VesselCodeParamsSchema.parse(req.params);
    const vessel = await svc.getVesselByCode(
      ctx.userId,
      ctx.activeWorkspaceId,
      params.code,
    );
    return VesselStateResponseSchema.parse({
      ok: true,
      vessel,
    });
  });
}
