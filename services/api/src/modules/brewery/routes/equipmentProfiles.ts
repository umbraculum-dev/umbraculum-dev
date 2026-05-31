import type { EquipmentProfile } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  EquipmentProfileCreateRequestSchema,
  EquipmentProfilePatchRequestSchema,
  EquipmentProfileResponseSchema,
  EquipmentProfilesListResponseSchema,
  ErrorResponseSchema,
  IdParamsSchema,
  OkResponseSchema,
} from "@umbraculum/contracts";

import { requireActiveWorkspace } from "../../../plugins/requestContext.js";
import { EquipmentProfilesService } from "../../../services/equipmentProfilesService.js";

function toEquipmentPayload(p: EquipmentProfile) {
  return {
    id: p.id,
    workspaceId: p.workspaceId,
    name: p.name,
    equipment: {
      kettle: {
        name: p.name,
        kettleVolumeLiters: p.kettleVolumeLiters,
        kettleLossesLiters: p.kettleLossesLiters,
        kettleBoilEvaporationRatePercentPerHour: p.kettleBoilEvaporationRatePercentPerHour,
        kettleCoolingShrinkagePercent: p.kettleCoolingShrinkagePercent,
        kettleHopsAbsorptionLiters: p.kettleHopsAbsorptionLiters,
      },
      mash: {
        name: p.name,
        mashVolumeLiters: p.mashVolumeLiters,
        mashEfficiencyPercent: p.mashEfficiencyPercent,
        mashLossesLiters: p.mashLossesLiters,
        mashThicknessLPerKg: p.mashThicknessLPerKg,
        mashGrainAbsorptionLPerKg: p.mashGrainAbsorptionLPerKg,
        mashWaterLeftoverLiters: p.mashWaterLeftoverLiters,
      },
      misc: {
        otherLossesLiters: p.otherLossesLiters,
      },
    },
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export function equipmentProfilesRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const svc = new EquipmentProfilesService(app.prisma);

  zodApp.get(
    "/equipment-profiles",
    {
      schema: {
        tags: ["brewery"],
        response: {
          200: EquipmentProfilesListResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const profiles = await svc.listProfiles(ctx.userId, ctx.activeWorkspaceId);
      return EquipmentProfilesListResponseSchema.parse({
        ok: true,
        profiles: profiles.map(toEquipmentPayload),
      });
    },
  );

  zodApp.post(
    "/equipment-profiles",
    {
      schema: {
        tags: ["brewery"],
        body: EquipmentProfileCreateRequestSchema,
        response: {
          200: EquipmentProfileResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const body = req.body;
      const created = await svc.createProfile(ctx.userId, ctx.activeWorkspaceId, {
        name: typeof body["name"] === "string" ? body["name"] : "",
        kettleVolumeLiters: body["kettleVolumeLiters"],
        kettleLossesLiters: body["kettleLossesLiters"],
        kettleBoilEvaporationRatePercentPerHour: body["kettleBoilEvaporationRatePercentPerHour"],
        kettleCoolingShrinkagePercent: body["kettleCoolingShrinkagePercent"],
        kettleHopsAbsorptionLiters: body["kettleHopsAbsorptionLiters"],
        mashVolumeLiters: body["mashVolumeLiters"],
        mashEfficiencyPercent: body["mashEfficiencyPercent"],
        mashLossesLiters: body["mashLossesLiters"],
        mashThicknessLPerKg: body["mashThicknessLPerKg"],
        mashGrainAbsorptionLPerKg: body["mashGrainAbsorptionLPerKg"],
        mashWaterLeftoverLiters: body["mashWaterLeftoverLiters"],
        otherLossesLiters: body["otherLossesLiters"],
      });
      return EquipmentProfileResponseSchema.parse({
        ok: true,
        profile: toEquipmentPayload(created),
      });
    },
  );

  zodApp.patch(
    "/equipment-profiles/:id",
    {
      schema: {
        tags: ["brewery"],
        params: IdParamsSchema,
        body: EquipmentProfilePatchRequestSchema,
        response: {
          200: EquipmentProfileResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const ctx = requireActiveWorkspace(req);
      const body = req.body;
      const updated = await svc.updateProfile(ctx.userId, ctx.activeWorkspaceId, req.params.id, {
        name: typeof body["name"] === "string" ? body["name"] : undefined,
        kettleVolumeLiters: body["kettleVolumeLiters"],
        kettleLossesLiters: body["kettleLossesLiters"],
        kettleBoilEvaporationRatePercentPerHour: body["kettleBoilEvaporationRatePercentPerHour"],
        kettleCoolingShrinkagePercent: body["kettleCoolingShrinkagePercent"],
        kettleHopsAbsorptionLiters: body["kettleHopsAbsorptionLiters"],
        mashVolumeLiters: body["mashVolumeLiters"],
        mashEfficiencyPercent: body["mashEfficiencyPercent"],
        mashLossesLiters: body["mashLossesLiters"],
        mashThicknessLPerKg: body["mashThicknessLPerKg"],
        mashGrainAbsorptionLPerKg: body["mashGrainAbsorptionLPerKg"],
        mashWaterLeftoverLiters: body["mashWaterLeftoverLiters"],
        otherLossesLiters: body["otherLossesLiters"],
      });
      return EquipmentProfileResponseSchema.parse({
        ok: true,
        profile: toEquipmentPayload(updated),
      });
    },
  );

  zodApp.delete(
    "/equipment-profiles/:id",
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
