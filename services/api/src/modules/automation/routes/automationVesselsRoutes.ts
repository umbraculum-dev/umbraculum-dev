import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import {
  VesselListResponseSchema,
  VesselStateResponseSchema,
} from "@umbraculum/automation-contracts";

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
 * `@umbraculum/automation-contracts`.
 *
 * Phase C adds: `POST /automation/vessels` (create), `PATCH
 * /automation/vessels/:code` (update mode/target temp), and the adapter
 * supervisor's snapshot-to-vessel reconciliation loop.
 */
export function automationVesselsRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new VesselsService(app.prisma);

  zodApp.get(
    "/automation/vessels",
    {
      schema: {
        tags: ["automation"],
        response: {
          200: VesselListResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const vessels = await svc.listVessels(ctx.userId, ctx.activeWorkspaceId);
      return VesselListResponseSchema.parse({
        ok: true,
        vessels,
      });
    },
  );

  zodApp.get(
    "/automation/vessels/:code",
    {
      schema: {
        tags: ["automation"],
        params: VesselCodeParamsSchema,
        response: {
          200: VesselStateResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const vessel = await svc.getVesselByCode(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.code,
      );
      return VesselStateResponseSchema.parse({
        ok: true,
        vessel,
      });
    },
  );
}
