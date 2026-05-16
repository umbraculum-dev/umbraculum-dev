import type { EquipmentProfile } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { requireActiveWorkspace } from "../plugins/requestContext.js";
import { EquipmentProfilesService } from "../services/equipmentProfilesService.js";

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

export async function equipmentProfilesRoutes(app: FastifyInstance) {
  const svc = new EquipmentProfilesService(app.prisma);

  app.get("/equipment-profiles", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const profiles = await svc.listProfiles(ctx.userId, ctx.activeWorkspaceId);
    return { ok: true, profiles: profiles.map(toEquipmentPayload) };
  });

  app.post("/equipment-profiles", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const created = await svc.createProfile(ctx.userId, ctx.activeWorkspaceId, {
      name: typeof body.name === "string" ? body.name : "",
      kettleVolumeLiters: body.kettleVolumeLiters,
      kettleLossesLiters: body.kettleLossesLiters,
      kettleBoilEvaporationRatePercentPerHour: body.kettleBoilEvaporationRatePercentPerHour,
      kettleCoolingShrinkagePercent: body.kettleCoolingShrinkagePercent,
      kettleHopsAbsorptionLiters: body.kettleHopsAbsorptionLiters,
      mashVolumeLiters: body.mashVolumeLiters,
      mashEfficiencyPercent: body.mashEfficiencyPercent,
      mashLossesLiters: body.mashLossesLiters,
      mashThicknessLPerKg: body.mashThicknessLPerKg,
      mashGrainAbsorptionLPerKg: body.mashGrainAbsorptionLPerKg,
      mashWaterLeftoverLiters: body.mashWaterLeftoverLiters,
      otherLossesLiters: body.otherLossesLiters,
    });
    return { ok: true, profile: toEquipmentPayload(created) };
  });

  app.patch("/equipment-profiles/:id", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";
    const body = (req.body ?? {}) as Record<string, unknown>;

    const updated = await svc.updateProfile(ctx.userId, ctx.activeWorkspaceId, id, {
      name: typeof body.name === "string" ? body.name : undefined,
      kettleVolumeLiters: body.kettleVolumeLiters,
      kettleLossesLiters: body.kettleLossesLiters,
      kettleBoilEvaporationRatePercentPerHour: body.kettleBoilEvaporationRatePercentPerHour,
      kettleCoolingShrinkagePercent: body.kettleCoolingShrinkagePercent,
      kettleHopsAbsorptionLiters: body.kettleHopsAbsorptionLiters,
      mashVolumeLiters: body.mashVolumeLiters,
      mashEfficiencyPercent: body.mashEfficiencyPercent,
      mashLossesLiters: body.mashLossesLiters,
      mashThicknessLPerKg: body.mashThicknessLPerKg,
      mashGrainAbsorptionLPerKg: body.mashGrainAbsorptionLPerKg,
      mashWaterLeftoverLiters: body.mashWaterLeftoverLiters,
      otherLossesLiters: body.otherLossesLiters,
    });
    return { ok: true, profile: toEquipmentPayload(updated) };
  });

  app.delete("/equipment-profiles/:id", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";
    await svc.deleteProfile(ctx.userId, ctx.activeWorkspaceId, id);
    return { ok: true };
  });
}

