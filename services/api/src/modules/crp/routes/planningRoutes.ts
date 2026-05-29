import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import {
  CapacityConflictListResponseSchema,
  CapacityLoadQuerySchema,
  CapacityLoadResponseSchema,
  ScheduledOperationListResponseSchema,
  WorkCenterListResponseSchema,
} from "@umbraculum/crp-contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { CrpPlanningService } from "../services/planningService.js";

export function crpPlanningRoutes(app: FastifyInstance): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new CrpPlanningService(app.prisma);

  zodApp.get(
    "/crp/work-centers",
    {
      schema: {
        tags: ["crp"],
        response: {
          200: WorkCenterListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const items = await svc.listWorkCenters(ctx.userId, ctx.activeWorkspaceId);
      return WorkCenterListResponseSchema.parse({ ok: true, items });
    },
  );

  zodApp.get(
    "/crp/capacity-load",
    {
      schema: {
        tags: ["crp"],
        querystring: CapacityLoadQuerySchema,
        response: {
          200: CapacityLoadResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const item = await svc.getCapacityLoad(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.query.resourceId,
      );
      return CapacityLoadResponseSchema.parse({ ok: true, item });
    },
  );

  zodApp.get(
    "/crp/scheduled-operations",
    {
      schema: {
        tags: ["crp"],
        response: {
          200: ScheduledOperationListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const items = await svc.listScheduledOperations(ctx.userId, ctx.activeWorkspaceId);
      return ScheduledOperationListResponseSchema.parse({ ok: true, items });
    },
  );

  zodApp.get(
    "/crp/conflicts",
    {
      schema: {
        tags: ["crp"],
        response: {
          200: CapacityConflictListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const items = await svc.listConflicts(ctx.userId, ctx.activeWorkspaceId);
      return CapacityConflictListResponseSchema.parse({ ok: true, items });
    },
  );
}
