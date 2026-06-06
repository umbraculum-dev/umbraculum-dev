import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { ErrorResponseSchema } from "@umbraculum/contracts";
import { IdParamsSchema, OkResponseSchema, WaterProfileCreateRequestSchema, WaterProfilePatchRequestSchema, WaterProfileResponseSchema, WaterProfilesListResponseSchema } from "@umbraculum/brewery-contracts";

import { requireActiveWorkspace, requireUser } from "../../../plugins/requestContext.js";
import { WaterProfilesService } from "../../../services/waterProfilesService.js";

function ionValue(v: unknown): unknown {
  return v;
}

export function waterProfilesRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new WaterProfilesService(app.prisma);

  zodApp.get(
    "/water-profiles",
    {
      schema: {
        tags: ["brewery"],
        response: {
          200: WaterProfilesListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireUser(req);
      const list = await svc.listProfiles(ctx.userId, ctx.activeWorkspaceId);
      return WaterProfilesListResponseSchema.parse({ ok: true, ...list });
    },
  );

  zodApp.post(
    "/water-profiles",
    {
      schema: {
        tags: ["brewery"],
        body: WaterProfileCreateRequestSchema,
        response: {
          200: WaterProfileResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const body = req.body;

      const created = await svc.createProfile(ctx.userId, ctx.activeWorkspaceId, {
        scope: body.scope,
        type: body.type ?? "water",
        name: body.name ?? "",
        ph: ionValue(body.ph),
        calcium: ionValue(body.calcium),
        magnesium: ionValue(body.magnesium),
        sodium: ionValue(body.sodium),
        sulfate: ionValue(body.sulfate),
        chloride: ionValue(body.chloride),
        bicarbonate: ionValue(body.bicarbonate),
      });

      return WaterProfileResponseSchema.parse({ ok: true, profile: created });
    },
  );

  zodApp.patch(
    "/water-profiles/:id",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        body: WaterProfilePatchRequestSchema,
        response: {
          200: WaterProfileResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const body = req.body;

      const updated = await svc.updateProfile(ctx.userId, ctx.activeWorkspaceId, req.params.id, {
        scope: body.scope,
        type: body.type,
        name: body.name,
        ph: ionValue(body.ph),
        calcium: ionValue(body.calcium),
        magnesium: ionValue(body.magnesium),
        sodium: ionValue(body.sodium),
        sulfate: ionValue(body.sulfate),
        chloride: ionValue(body.chloride),
        bicarbonate: ionValue(body.bicarbonate),
        verificationStatus: body.verificationStatus,
      });

      return WaterProfileResponseSchema.parse({ ok: true, profile: updated });
    },
  );

  zodApp.post(
    "/water-profiles/:id/verify",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        response: {
          200: WaterProfileResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const updated = await svc.setVerificationStatus(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.id,
        "verified",
      );
      return WaterProfileResponseSchema.parse({ ok: true, profile: updated });
    },
  );

  zodApp.post(
    "/water-profiles/:id/unverify",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        response: {
          200: WaterProfileResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const updated = await svc.setVerificationStatus(
        ctx.userId,
        ctx.activeWorkspaceId,
        req.params.id,
        "unverified",
      );
      return WaterProfileResponseSchema.parse({ ok: true, profile: updated });
    },
  );

  zodApp.delete(
    "/water-profiles/:id",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        response: {
          200: OkResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      await svc.deleteProfile(ctx.userId, ctx.activeWorkspaceId, req.params.id);
      return { ok: true as const };
    },
  );
}
