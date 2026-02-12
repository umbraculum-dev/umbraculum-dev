import type { FastifyInstance } from "fastify";
import { requireActiveAccount } from "../plugins/requestContext.js";
import { RecipeWaterSettingsService } from "../services/recipeWaterSettingsService.js";

export async function recipeWaterSettingsRoutes(app: FastifyInstance) {
  const svc = new RecipeWaterSettingsService(app.prisma);

  app.get("/recipes/:id/water-settings", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const recipeId = typeof params.id === "string" ? params.id : "";

    const settings = await svc.get(ctx.userId, ctx.activeAccountId, recipeId);
    return { ok: true, settings };
  });

  app.put("/recipes/:id/water-settings", async (req) => {
    const ctx = requireActiveAccount(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const recipeId = typeof params.id === "string" ? params.id : "";
    const body = (req.body ?? {}) as Record<string, unknown>;

    const upserted = await svc.upsert(ctx.userId, ctx.activeAccountId, recipeId, {
      sourceWaterProfileId:
        typeof body.sourceWaterProfileId === "string"
          ? body.sourceWaterProfileId
          : body.sourceWaterProfileId === null
            ? null
            : undefined,
      targetWaterProfileId:
        typeof body.targetWaterProfileId === "string" ? body.targetWaterProfileId : body.targetWaterProfileId === null ? null : undefined,
      dilutionWaterProfileId:
        typeof body.dilutionWaterProfileId === "string"
          ? body.dilutionWaterProfileId
          : body.dilutionWaterProfileId === null
            ? null
            : undefined,

      tapWaterVolumeLiters:
        typeof body.tapWaterVolumeLiters === "number"
          ? body.tapWaterVolumeLiters
          : body.tapWaterVolumeLiters === null
            ? null
            : undefined,
      dilutionWaterVolumeLiters:
        typeof body.dilutionWaterVolumeLiters === "number"
          ? body.dilutionWaterVolumeLiters
          : body.dilutionWaterVolumeLiters === null
            ? null
            : undefined,

      spargeStartingAlkalinityPpmCaCO3:
        typeof body.spargeStartingAlkalinityPpmCaCO3 === "number"
          ? body.spargeStartingAlkalinityPpmCaCO3
          : undefined,
      spargeStartingPh: typeof body.spargeStartingPh === "number" ? body.spargeStartingPh : undefined,
      spargeTargetPh: typeof body.spargeTargetPh === "number" ? body.spargeTargetPh : undefined,
      spargeVolumeLiters: typeof body.spargeVolumeLiters === "number" ? body.spargeVolumeLiters : undefined,
      spargeAcidType: typeof body.spargeAcidType === "string" ? body.spargeAcidType : undefined,
      spargeStrengthKind: typeof body.spargeStrengthKind === "string" ? body.spargeStrengthKind : undefined,
      spargeStrengthValue:
        typeof body.spargeStrengthValue === "number"
          ? body.spargeStrengthValue
          : body.spargeStrengthValue === null
            ? null
            : undefined,

      spargeLastAcidRequiredMl:
        typeof body.spargeLastAcidRequiredMl === "number"
          ? body.spargeLastAcidRequiredMl
          : body.spargeLastAcidRequiredMl === null
            ? null
            : undefined,
      spargeLastAcidRequiredTsp:
        typeof body.spargeLastAcidRequiredTsp === "number"
          ? body.spargeLastAcidRequiredTsp
          : body.spargeLastAcidRequiredTsp === null
            ? null
            : undefined,
      spargeLastAcidRequiredGrams:
        typeof body.spargeLastAcidRequiredGrams === "number"
          ? body.spargeLastAcidRequiredGrams
          : body.spargeLastAcidRequiredGrams === null
            ? null
            : undefined,
      spargeLastAcidRequiredKg:
        typeof body.spargeLastAcidRequiredKg === "number"
          ? body.spargeLastAcidRequiredKg
          : body.spargeLastAcidRequiredKg === null
            ? null
            : undefined,
      spargeLastFinalAlkalinityPpmCaCO3:
        typeof body.spargeLastFinalAlkalinityPpmCaCO3 === "number"
          ? body.spargeLastFinalAlkalinityPpmCaCO3
          : body.spargeLastFinalAlkalinityPpmCaCO3 === null
            ? null
            : undefined,
      spargeLastSulfateAddedPpm:
        typeof body.spargeLastSulfateAddedPpm === "number"
          ? body.spargeLastSulfateAddedPpm
          : body.spargeLastSulfateAddedPpm === null
            ? null
            : undefined,
      spargeLastChlorideAddedPpm:
        typeof body.spargeLastChlorideAddedPpm === "number"
          ? body.spargeLastChlorideAddedPpm
          : body.spargeLastChlorideAddedPpm === null
            ? null
            : undefined,
      spargeLastCalculatedAt:
        typeof body.spargeLastCalculatedAt === "string" ? new Date(body.spargeLastCalculatedAt) : undefined,
    });

    return { ok: true, settings: upserted };
  });
}

