import type { FastifyInstance } from "fastify";
import { requireActiveAccount } from "../plugins/requestContext.js";
import { EquipmentProfilesService } from "../services/equipmentProfilesService.js";

function toEquipmentPayload(p: any) {
  return {
    id: p.id,
    accountId: p.accountId,
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
    const ctx = requireActiveAccount(req);
    const profiles = await svc.listProfiles(ctx.userId, ctx.activeAccountId);
    return { ok: true, profiles: profiles.map(toEquipmentPayload) };
  });

  app.post("/equipment-profiles", async (req) => {
    const ctx = requireActiveAccount(req);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const created = await svc.createProfile(ctx.userId, ctx.activeAccountId, {
      name: typeof body.name === "string" ? body.name : "",
      kettleVolumeLiters: body.kettleVolumeLiters as any,
      kettleLossesLiters: body.kettleLossesLiters as any,
      kettleBoilEvaporationRatePercentPerHour: body.kettleBoilEvaporationRatePercentPerHour as any,
      kettleCoolingShrinkagePercent: body.kettleCoolingShrinkagePercent as any,
      kettleHopsAbsorptionLiters: body.kettleHopsAbsorptionLiters as any,
      mashVolumeLiters: body.mashVolumeLiters as any,
      mashEfficiencyPercent: body.mashEfficiencyPercent as any,
      mashLossesLiters: body.mashLossesLiters as any,
      mashThicknessLPerKg: body.mashThicknessLPerKg as any,
      mashGrainAbsorptionLPerKg: body.mashGrainAbsorptionLPerKg as any,
      mashWaterLeftoverLiters: body.mashWaterLeftoverLiters as any,
      otherLossesLiters: body.otherLossesLiters as any,
    });
    return { ok: true, profile: toEquipmentPayload(created) };
  });

  app.patch("/equipment-profiles/:id", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";
    const body = (req.body ?? {}) as Record<string, unknown>;

    const updated = await svc.updateProfile(ctx.userId, ctx.activeAccountId, id, {
      name: typeof body.name === "string" ? body.name : undefined,
      kettleVolumeLiters: body.kettleVolumeLiters as any,
      kettleLossesLiters: body.kettleLossesLiters as any,
      kettleBoilEvaporationRatePercentPerHour: body.kettleBoilEvaporationRatePercentPerHour as any,
      kettleCoolingShrinkagePercent: body.kettleCoolingShrinkagePercent as any,
      kettleHopsAbsorptionLiters: body.kettleHopsAbsorptionLiters as any,
      mashVolumeLiters: body.mashVolumeLiters as any,
      mashEfficiencyPercent: body.mashEfficiencyPercent as any,
      mashLossesLiters: body.mashLossesLiters as any,
      mashThicknessLPerKg: body.mashThicknessLPerKg as any,
      mashGrainAbsorptionLPerKg: body.mashGrainAbsorptionLPerKg as any,
      mashWaterLeftoverLiters: body.mashWaterLeftoverLiters as any,
      otherLossesLiters: body.otherLossesLiters as any,
    });
    return { ok: true, profile: toEquipmentPayload(updated) };
  });

  app.delete("/equipment-profiles/:id", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const id = typeof params.id === "string" ? params.id : "";
    await svc.deleteProfile(ctx.userId, ctx.activeAccountId, id);
    return { ok: true };
  });
}

