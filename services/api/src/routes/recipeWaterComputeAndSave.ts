import type { FastifyInstance } from "fastify";
import { requireActiveAccount } from "../plugins/requestContext.js";
import { BadRequestError } from "../errors.js";
import {
  RecipeWaterComputeAndSaveService,
  type BoilComputeAndSaveInput,
  type MashComputeAndSaveInput,
  type SpargeComputeAndSaveInput,
} from "../services/recipeWaterComputeAndSaveService.js";

function parseRecipeId(req: any): string {
  const params = (req.params ?? {}) as { id?: unknown };
  const recipeId = typeof params.id === "string" ? params.id : "";
  if (!recipeId) throw new BadRequestError("invalid_recipe_id", "Param :id is required");
  return recipeId;
}

export async function recipeWaterComputeAndSaveRoutes(app: FastifyInstance) {
  const svc = new RecipeWaterComputeAndSaveService(app.prisma);

  app.post("/recipes/:id/water-settings/mash/compute-and-save", async (req) => {
    const ctx = requireActiveAccount(req);
    const recipeId = parseRecipeId(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const input: MashComputeAndSaveInput = {
      sourceWaterProfileId: typeof body.sourceWaterProfileId === "string" ? body.sourceWaterProfileId : "",
      dilutionWaterProfileId:
        typeof body.dilutionWaterProfileId === "string"
          ? body.dilutionWaterProfileId
          : body.dilutionWaterProfileId === null
            ? null
            : null,
      tapWaterVolumeLiters: typeof body.tapWaterVolumeLiters === "number" ? body.tapWaterVolumeLiters : NaN,
      dilutionWaterVolumeLiters: typeof body.dilutionWaterVolumeLiters === "number" ? body.dilutionWaterVolumeLiters : NaN,

      mashStartingAlkalinityPpmCaCO3:
        typeof body.mashStartingAlkalinityPpmCaCO3 === "number" ? body.mashStartingAlkalinityPpmCaCO3 : NaN,
      mashStartingPh: typeof body.mashStartingPh === "number" ? body.mashStartingPh : NaN,
      mashTargetPh: typeof body.mashTargetPh === "number" ? body.mashTargetPh : NaN,
      mashAcidType: typeof body.mashAcidType === "string" ? (body.mashAcidType as any) : ("" as any),
      mashStrengthKind: (typeof body.mashStrengthKind === "string" ? body.mashStrengthKind : "percent") as any,
      mashStrengthValue:
        body.mashStrengthValue === null ? null : typeof body.mashStrengthValue === "number" ? body.mashStrengthValue : null,
      mashAcidificationMode: (body.mashAcidificationMode === "manual" ? "manual" : "targetPh") as any,
      mashManualAcidAddedMl:
        body.mashManualAcidAddedMl === null ? null : typeof body.mashManualAcidAddedMl === "number" ? body.mashManualAcidAddedMl : null,
      mashManualAcidAddedGrams:
        body.mashManualAcidAddedGrams === null
          ? null
          : typeof body.mashManualAcidAddedGrams === "number"
            ? body.mashManualAcidAddedGrams
            : null,

      mashSaltAdditionsJson: body.mashSaltAdditionsJson,
      grist: Array.isArray(body.grist) ? (body.grist as any) : undefined,
    };

    const computed = await svc.computeAndSaveMash(ctx.userId, ctx.activeAccountId, recipeId, input);
    return { ok: true, version: 1, ...computed };
  });

  app.post("/recipes/:id/water-settings/sparge/compute-and-save", async (req) => {
    const ctx = requireActiveAccount(req);
    const recipeId = parseRecipeId(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const input: SpargeComputeAndSaveInput = {
      spargeWaterProfileId: typeof body.spargeWaterProfileId === "string" ? body.spargeWaterProfileId : "",
      spargeSaltAdditionsJson: body.spargeSaltAdditionsJson,

      spargeStartingAlkalinityPpmCaCO3:
        typeof body.spargeStartingAlkalinityPpmCaCO3 === "number" ? body.spargeStartingAlkalinityPpmCaCO3 : NaN,
      spargeStartingPh: typeof body.spargeStartingPh === "number" ? body.spargeStartingPh : NaN,
      spargeTargetPh: typeof body.spargeTargetPh === "number" ? body.spargeTargetPh : NaN,
      spargeVolumeLiters: typeof body.spargeVolumeLiters === "number" ? body.spargeVolumeLiters : NaN,
      spargeAcidType: typeof body.spargeAcidType === "string" ? (body.spargeAcidType as any) : ("" as any),
      spargeStrengthKind: (typeof body.spargeStrengthKind === "string" ? body.spargeStrengthKind : "percent") as any,
      spargeStrengthValue:
        body.spargeStrengthValue === null ? null : typeof body.spargeStrengthValue === "number" ? body.spargeStrengthValue : null,
      spargeAcidificationMode: (body.spargeAcidificationMode === "manual" ? "manual" : "targetPh") as any,
      spargeManualAcidAddedMl:
        body.spargeManualAcidAddedMl === null ? null : typeof body.spargeManualAcidAddedMl === "number" ? body.spargeManualAcidAddedMl : null,
      spargeManualAcidAddedGrams:
        body.spargeManualAcidAddedGrams === null
          ? null
          : typeof body.spargeManualAcidAddedGrams === "number"
            ? body.spargeManualAcidAddedGrams
            : null,
    };

    const computed = await svc.computeAndSaveSparge(ctx.userId, ctx.activeAccountId, recipeId, input);
    return { ok: true, version: 1, ...computed };
  });

  app.post("/recipes/:id/water-settings/boil/compute-and-save", async (req) => {
    const ctx = requireActiveAccount(req);
    const recipeId = parseRecipeId(req);
    const body = (req.body ?? {}) as Record<string, unknown>;

    const input: BoilComputeAndSaveInput = {
      boilSourceWaterProfileId: typeof body.boilSourceWaterProfileId === "string" ? body.boilSourceWaterProfileId : "",
      boilDilutionWaterProfileId:
        typeof body.boilDilutionWaterProfileId === "string"
          ? body.boilDilutionWaterProfileId
          : body.boilDilutionWaterProfileId === null
            ? null
            : null,
      boilTapWaterVolumeLiters: typeof body.boilTapWaterVolumeLiters === "number" ? body.boilTapWaterVolumeLiters : NaN,
      boilDilutionWaterVolumeLiters:
        typeof body.boilDilutionWaterVolumeLiters === "number" ? body.boilDilutionWaterVolumeLiters : NaN,

      boilStartingAlkalinityPpmCaCO3:
        typeof body.boilStartingAlkalinityPpmCaCO3 === "number" ? body.boilStartingAlkalinityPpmCaCO3 : NaN,
      boilStartingPh: typeof body.boilStartingPh === "number" ? body.boilStartingPh : NaN,
      boilTargetPh: typeof body.boilTargetPh === "number" ? body.boilTargetPh : NaN,
      boilAcidType: typeof body.boilAcidType === "string" ? (body.boilAcidType as any) : ("" as any),
      boilStrengthKind: (typeof body.boilStrengthKind === "string" ? body.boilStrengthKind : "percent") as any,
      boilStrengthValue:
        body.boilStrengthValue === null ? null : typeof body.boilStrengthValue === "number" ? body.boilStrengthValue : null,
      boilAcidificationMode: (body.boilAcidificationMode === "manual" ? "manual" : "targetPh") as any,
      boilManualAcidAddedMl:
        body.boilManualAcidAddedMl === null ? null : typeof body.boilManualAcidAddedMl === "number" ? body.boilManualAcidAddedMl : null,
      boilManualAcidAddedGrams:
        body.boilManualAcidAddedGrams === null
          ? null
          : typeof body.boilManualAcidAddedGrams === "number"
            ? body.boilManualAcidAddedGrams
            : null,

      boilSaltAdditionsJson: body.boilSaltAdditionsJson,
    };

    const computed = await svc.computeAndSaveBoil(ctx.userId, ctx.activeAccountId, recipeId, input);
    return { ok: true, version: 1, ...computed };
  });
}

