import type { FastifyInstance } from "fastify";
import { requireActiveWorkspace } from "../plugins/requestContext.js";
import { RecipeWaterSettingsService } from "../services/recipeWaterSettingsService.js";

export function recipeWaterSettingsRoutes(app: FastifyInstance) {
  const svc = new RecipeWaterSettingsService(app.prisma);

  app.get("/recipes/:id/water-settings", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const recipeId = typeof params.id === "string" ? params.id : "";

    const settings = await svc.get(ctx.userId, ctx.activeWorkspaceId, recipeId);
    return { ok: true, settings };
  });

  app.put("/recipes/:id/water-settings", async (req) => {
    const ctx = requireActiveWorkspace(req);
    const params = (req.params ?? {}) as { id?: unknown };
    const recipeId = typeof params.id === "string" ? params.id : "";
    const body = (req.body ?? {}) as Record<string, unknown>;

    const upserted = await svc.upsert(ctx.userId, ctx.activeWorkspaceId, recipeId, {
      sourceWaterProfileId:
        typeof body['sourceWaterProfileId'] === "string"
          ? body['sourceWaterProfileId']
          : body['sourceWaterProfileId'] === null
            ? null
            : undefined,
      targetWaterProfileId:
        typeof body['targetWaterProfileId'] === "string" ? body['targetWaterProfileId'] : body['targetWaterProfileId'] === null ? null : undefined,
      dilutionWaterProfileId:
        typeof body['dilutionWaterProfileId'] === "string"
          ? body['dilutionWaterProfileId']
          : body['dilutionWaterProfileId'] === null
            ? null
            : undefined,

      tapWaterVolumeLiters:
        typeof body['tapWaterVolumeLiters'] === "number"
          ? body['tapWaterVolumeLiters']
          : body['tapWaterVolumeLiters'] === null
            ? null
            : undefined,
      dilutionWaterVolumeLiters:
        typeof body['dilutionWaterVolumeLiters'] === "number"
          ? body['dilutionWaterVolumeLiters']
          : body['dilutionWaterVolumeLiters'] === null
            ? null
            : undefined,

      mashStartingAlkalinityPpmCaCO3:
        typeof body['mashStartingAlkalinityPpmCaCO3'] === "number"
          ? body['mashStartingAlkalinityPpmCaCO3']
          : undefined,
      mashStartingPh: typeof body['mashStartingPh'] === "number" ? body['mashStartingPh'] : undefined,
      mashTargetPh: typeof body['mashTargetPh'] === "number" ? body['mashTargetPh'] : undefined,
      // Mash water volume is derived from tap+dilution volumes in the service layer to avoid duplication.
      // Keep backward compatibility for callers that don't send mixing volumes by still accepting this field.
      mashWaterVolumeLiters: typeof body['mashWaterVolumeLiters'] === "number" ? body['mashWaterVolumeLiters'] : undefined,
      mashAcidType: typeof body['mashAcidType'] === "string" ? body['mashAcidType'] : undefined,
      mashStrengthKind: typeof body['mashStrengthKind'] === "string" ? body['mashStrengthKind'] : undefined,
      mashStrengthValue:
        typeof body['mashStrengthValue'] === "number"
          ? body['mashStrengthValue']
          : body['mashStrengthValue'] === null
            ? null
            : undefined,

      mashLastAcidRequiredMl:
        typeof body['mashLastAcidRequiredMl'] === "number"
          ? body['mashLastAcidRequiredMl']
          : body['mashLastAcidRequiredMl'] === null
            ? null
            : undefined,
      mashLastAcidRequiredTsp:
        typeof body['mashLastAcidRequiredTsp'] === "number"
          ? body['mashLastAcidRequiredTsp']
          : body['mashLastAcidRequiredTsp'] === null
            ? null
            : undefined,
      mashLastAcidRequiredGrams:
        typeof body['mashLastAcidRequiredGrams'] === "number"
          ? body['mashLastAcidRequiredGrams']
          : body['mashLastAcidRequiredGrams'] === null
            ? null
            : undefined,
      mashLastAcidRequiredKg:
        typeof body['mashLastAcidRequiredKg'] === "number"
          ? body['mashLastAcidRequiredKg']
          : body['mashLastAcidRequiredKg'] === null
            ? null
            : undefined,
      mashLastFinalAlkalinityPpmCaCO3:
        typeof body['mashLastFinalAlkalinityPpmCaCO3'] === "number"
          ? body['mashLastFinalAlkalinityPpmCaCO3']
          : body['mashLastFinalAlkalinityPpmCaCO3'] === null
            ? null
            : undefined,
      mashLastSulfateAddedPpm:
        typeof body['mashLastSulfateAddedPpm'] === "number"
          ? body['mashLastSulfateAddedPpm']
          : body['mashLastSulfateAddedPpm'] === null
            ? null
            : undefined,
      mashLastChlorideAddedPpm:
        typeof body['mashLastChlorideAddedPpm'] === "number"
          ? body['mashLastChlorideAddedPpm']
          : body['mashLastChlorideAddedPpm'] === null
            ? null
            : undefined,
      mashLastCalculatedAt:
        typeof body['mashLastCalculatedAt'] === "string" ? new Date(body['mashLastCalculatedAt']) : undefined,

      mashAcidificationMode:
        typeof body['mashAcidificationMode'] === "string" ? body['mashAcidificationMode'] : undefined,
      mashManualAcidAddedMl:
        typeof body['mashManualAcidAddedMl'] === "number"
          ? body['mashManualAcidAddedMl']
          : body['mashManualAcidAddedMl'] === null
            ? null
            : undefined,
      mashManualAcidAddedGrams:
        typeof body['mashManualAcidAddedGrams'] === "number"
          ? body['mashManualAcidAddedGrams']
          : body['mashManualAcidAddedGrams'] === null
            ? null
            : undefined,
      mashManualLastAchievedPh:
        typeof body['mashManualLastAchievedPh'] === "number"
          ? body['mashManualLastAchievedPh']
          : body['mashManualLastAchievedPh'] === null
            ? null
            : undefined,
      mashManualLastFinalAlkalinityPpmCaCO3:
        typeof body['mashManualLastFinalAlkalinityPpmCaCO3'] === "number"
          ? body['mashManualLastFinalAlkalinityPpmCaCO3']
          : body['mashManualLastFinalAlkalinityPpmCaCO3'] === null
            ? null
            : undefined,
      mashManualLastSulfateAddedPpm:
        typeof body['mashManualLastSulfateAddedPpm'] === "number"
          ? body['mashManualLastSulfateAddedPpm']
          : body['mashManualLastSulfateAddedPpm'] === null
            ? null
            : undefined,
      mashManualLastChlorideAddedPpm:
        typeof body['mashManualLastChlorideAddedPpm'] === "number"
          ? body['mashManualLastChlorideAddedPpm']
          : body['mashManualLastChlorideAddedPpm'] === null
            ? null
            : undefined,
      mashManualLastCalculatedAt:
        typeof body['mashManualLastCalculatedAt'] === "string"
          ? new Date(body['mashManualLastCalculatedAt'])
          : undefined,

      mashSaltAdditionsJson:
        body['mashSaltAdditionsJson'] === null || body['mashSaltAdditionsJson'] !== undefined
          ? body['mashSaltAdditionsJson']
          : undefined,
      mashSaltsLastResultJson:
        body['mashSaltsLastResultJson'] === null || body['mashSaltsLastResultJson'] !== undefined
          ? body['mashSaltsLastResultJson']
          : undefined,

      mashOverallLastResultJson:
        body['mashOverallLastResultJson'] === null || body['mashOverallLastResultJson'] !== undefined
          ? body['mashOverallLastResultJson']
          : undefined,
      mashOverallLastCalculatedAt:
        typeof body['mashOverallLastCalculatedAt'] === "string"
          ? new Date(body['mashOverallLastCalculatedAt'])
          : body['mashOverallLastCalculatedAt'] === null
            ? null
            : undefined,

      mashGristImportedJson:
        body['mashGristImportedJson'] === null || body['mashGristImportedJson'] !== undefined
          ? body['mashGristImportedJson']
          : undefined,
      mashGristImportedAt:
        typeof body['mashGristImportedAt'] === "string"
          ? new Date(body['mashGristImportedAt'])
          : body['mashGristImportedAt'] === null
            ? null
            : undefined,
      mashGristSourceRecipeUpdatedAt:
        typeof body['mashGristSourceRecipeUpdatedAt'] === "string"
          ? new Date(body['mashGristSourceRecipeUpdatedAt'])
          : body['mashGristSourceRecipeUpdatedAt'] === null
            ? null
            : undefined,

      spargeWaterProfileId:
        typeof body['spargeWaterProfileId'] === "string"
          ? body['spargeWaterProfileId']
          : body['spargeWaterProfileId'] === null
            ? null
            : undefined,
      spargeStartingAlkalinityPpmCaCO3:
        typeof body['spargeStartingAlkalinityPpmCaCO3'] === "number"
          ? body['spargeStartingAlkalinityPpmCaCO3']
          : undefined,
      spargeStartingPh: typeof body['spargeStartingPh'] === "number" ? body['spargeStartingPh'] : undefined,
      spargeTargetPh: typeof body['spargeTargetPh'] === "number" ? body['spargeTargetPh'] : undefined,
      spargeVolumeLiters: typeof body['spargeVolumeLiters'] === "number" ? body['spargeVolumeLiters'] : undefined,
      spargeAcidType: typeof body['spargeAcidType'] === "string" ? body['spargeAcidType'] : undefined,
      spargeStrengthKind: typeof body['spargeStrengthKind'] === "string" ? body['spargeStrengthKind'] : undefined,
      spargeStrengthValue:
        typeof body['spargeStrengthValue'] === "number"
          ? body['spargeStrengthValue']
          : body['spargeStrengthValue'] === null
            ? null
            : undefined,

      spargeAcidificationMode:
        typeof body['spargeAcidificationMode'] === "string" ? body['spargeAcidificationMode'] : undefined,
      spargeManualAcidAddedMl:
        typeof body['spargeManualAcidAddedMl'] === "number"
          ? body['spargeManualAcidAddedMl']
          : body['spargeManualAcidAddedMl'] === null
            ? null
            : undefined,
      spargeManualAcidAddedGrams:
        typeof body['spargeManualAcidAddedGrams'] === "number"
          ? body['spargeManualAcidAddedGrams']
          : body['spargeManualAcidAddedGrams'] === null
            ? null
            : undefined,
      spargeManualLastAchievedPh:
        typeof body['spargeManualLastAchievedPh'] === "number"
          ? body['spargeManualLastAchievedPh']
          : body['spargeManualLastAchievedPh'] === null
            ? null
            : undefined,
      spargeManualLastFinalAlkalinityPpmCaCO3:
        typeof body['spargeManualLastFinalAlkalinityPpmCaCO3'] === "number"
          ? body['spargeManualLastFinalAlkalinityPpmCaCO3']
          : body['spargeManualLastFinalAlkalinityPpmCaCO3'] === null
            ? null
            : undefined,
      spargeManualLastSulfateAddedPpm:
        typeof body['spargeManualLastSulfateAddedPpm'] === "number"
          ? body['spargeManualLastSulfateAddedPpm']
          : body['spargeManualLastSulfateAddedPpm'] === null
            ? null
            : undefined,
      spargeManualLastChlorideAddedPpm:
        typeof body['spargeManualLastChlorideAddedPpm'] === "number"
          ? body['spargeManualLastChlorideAddedPpm']
          : body['spargeManualLastChlorideAddedPpm'] === null
            ? null
            : undefined,
      spargeManualLastCalculatedAt:
        typeof body['spargeManualLastCalculatedAt'] === "string"
          ? new Date(body['spargeManualLastCalculatedAt'])
          : body['spargeManualLastCalculatedAt'] === null
            ? null
            : undefined,

      spargeSaltAdditionsJson:
        body['spargeSaltAdditionsJson'] !== undefined ? body['spargeSaltAdditionsJson'] : undefined,
      spargeSaltsLastResultJson:
        body['spargeSaltsLastResultJson'] !== undefined ? body['spargeSaltsLastResultJson'] : undefined,
      spargeStepTemperatureC:
        typeof body['spargeStepTemperatureC'] === "number"
          ? body['spargeStepTemperatureC']
          : body['spargeStepTemperatureC'] === null
            ? null
            : undefined,
      spargeStepTimeMin:
        typeof body['spargeStepTimeMin'] === "number"
          ? body['spargeStepTimeMin']
          : body['spargeStepTimeMin'] === null
            ? null
            : undefined,
      spargeStepRampMin:
        typeof body['spargeStepRampMin'] === "number"
          ? body['spargeStepRampMin']
          : body['spargeStepRampMin'] === null
            ? null
            : undefined,
      spargeMethodType:
        typeof body['spargeMethodType'] === "string"
          ? body['spargeMethodType']
          : body['spargeMethodType'] === null
            ? null
            : undefined,

      spargeLastAcidRequiredMl:
        typeof body['spargeLastAcidRequiredMl'] === "number"
          ? body['spargeLastAcidRequiredMl']
          : body['spargeLastAcidRequiredMl'] === null
            ? null
            : undefined,
      spargeLastAcidRequiredTsp:
        typeof body['spargeLastAcidRequiredTsp'] === "number"
          ? body['spargeLastAcidRequiredTsp']
          : body['spargeLastAcidRequiredTsp'] === null
            ? null
            : undefined,
      spargeLastAcidRequiredGrams:
        typeof body['spargeLastAcidRequiredGrams'] === "number"
          ? body['spargeLastAcidRequiredGrams']
          : body['spargeLastAcidRequiredGrams'] === null
            ? null
            : undefined,
      spargeLastAcidRequiredKg:
        typeof body['spargeLastAcidRequiredKg'] === "number"
          ? body['spargeLastAcidRequiredKg']
          : body['spargeLastAcidRequiredKg'] === null
            ? null
            : undefined,
      spargeLastFinalAlkalinityPpmCaCO3:
        typeof body['spargeLastFinalAlkalinityPpmCaCO3'] === "number"
          ? body['spargeLastFinalAlkalinityPpmCaCO3']
          : body['spargeLastFinalAlkalinityPpmCaCO3'] === null
            ? null
            : undefined,
      spargeLastSulfateAddedPpm:
        typeof body['spargeLastSulfateAddedPpm'] === "number"
          ? body['spargeLastSulfateAddedPpm']
          : body['spargeLastSulfateAddedPpm'] === null
            ? null
            : undefined,
      spargeLastChlorideAddedPpm:
        typeof body['spargeLastChlorideAddedPpm'] === "number"
          ? body['spargeLastChlorideAddedPpm']
          : body['spargeLastChlorideAddedPpm'] === null
            ? null
            : undefined,
      spargeLastCalculatedAt:
        typeof body['spargeLastCalculatedAt'] === "string" ? new Date(body['spargeLastCalculatedAt']) : undefined,

      boilSourceWaterProfileId:
        typeof body['boilSourceWaterProfileId'] === "string"
          ? body['boilSourceWaterProfileId']
          : body['boilSourceWaterProfileId'] === null
            ? null
            : undefined,
      boilTargetWaterProfileId:
        typeof body['boilTargetWaterProfileId'] === "string"
          ? body['boilTargetWaterProfileId']
          : body['boilTargetWaterProfileId'] === null
            ? null
            : undefined,
      boilDilutionWaterProfileId:
        typeof body['boilDilutionWaterProfileId'] === "string"
          ? body['boilDilutionWaterProfileId']
          : body['boilDilutionWaterProfileId'] === null
            ? null
            : undefined,

      boilTapWaterVolumeLiters:
        typeof body['boilTapWaterVolumeLiters'] === "number"
          ? body['boilTapWaterVolumeLiters']
          : body['boilTapWaterVolumeLiters'] === null
            ? null
            : undefined,
      boilDilutionWaterVolumeLiters:
        typeof body['boilDilutionWaterVolumeLiters'] === "number"
          ? body['boilDilutionWaterVolumeLiters']
          : body['boilDilutionWaterVolumeLiters'] === null
            ? null
            : undefined,

      boilStartingAlkalinityPpmCaCO3:
        typeof body['boilStartingAlkalinityPpmCaCO3'] === "number" ? body['boilStartingAlkalinityPpmCaCO3'] : undefined,
      boilStartingPh: typeof body['boilStartingPh'] === "number" ? body['boilStartingPh'] : undefined,
      boilTargetPh: typeof body['boilTargetPh'] === "number" ? body['boilTargetPh'] : undefined,
      boilWaterVolumeLiters: typeof body['boilWaterVolumeLiters'] === "number" ? body['boilWaterVolumeLiters'] : undefined,
      boilAcidType: typeof body['boilAcidType'] === "string" ? body['boilAcidType'] : undefined,
      boilStrengthKind: typeof body['boilStrengthKind'] === "string" ? body['boilStrengthKind'] : undefined,
      boilStrengthValue:
        typeof body['boilStrengthValue'] === "number"
          ? body['boilStrengthValue']
          : body['boilStrengthValue'] === null
            ? null
            : undefined,

      boilAcidificationMode: typeof body['boilAcidificationMode'] === "string" ? body['boilAcidificationMode'] : undefined,
      boilManualAcidAddedMl:
        typeof body['boilManualAcidAddedMl'] === "number"
          ? body['boilManualAcidAddedMl']
          : body['boilManualAcidAddedMl'] === null
            ? null
            : undefined,
      boilManualAcidAddedGrams:
        typeof body['boilManualAcidAddedGrams'] === "number"
          ? body['boilManualAcidAddedGrams']
          : body['boilManualAcidAddedGrams'] === null
            ? null
            : undefined,
      boilManualLastAchievedPh:
        typeof body['boilManualLastAchievedPh'] === "number"
          ? body['boilManualLastAchievedPh']
          : body['boilManualLastAchievedPh'] === null
            ? null
            : undefined,
      boilManualLastFinalAlkalinityPpmCaCO3:
        typeof body['boilManualLastFinalAlkalinityPpmCaCO3'] === "number"
          ? body['boilManualLastFinalAlkalinityPpmCaCO3']
          : body['boilManualLastFinalAlkalinityPpmCaCO3'] === null
            ? null
            : undefined,
      boilManualLastSulfateAddedPpm:
        typeof body['boilManualLastSulfateAddedPpm'] === "number"
          ? body['boilManualLastSulfateAddedPpm']
          : body['boilManualLastSulfateAddedPpm'] === null
            ? null
            : undefined,
      boilManualLastChlorideAddedPpm:
        typeof body['boilManualLastChlorideAddedPpm'] === "number"
          ? body['boilManualLastChlorideAddedPpm']
          : body['boilManualLastChlorideAddedPpm'] === null
            ? null
            : undefined,
      boilManualLastCalculatedAt:
        typeof body['boilManualLastCalculatedAt'] === "string"
          ? new Date(body['boilManualLastCalculatedAt'])
          : body['boilManualLastCalculatedAt'] === null
            ? null
            : undefined,

      boilSaltAdditionsJson: body['boilSaltAdditionsJson'] !== undefined ? body['boilSaltAdditionsJson'] : undefined,
      boilSaltsLastResultJson: body['boilSaltsLastResultJson'] !== undefined ? body['boilSaltsLastResultJson'] : undefined,

      boilLastAcidRequiredMl:
        typeof body['boilLastAcidRequiredMl'] === "number"
          ? body['boilLastAcidRequiredMl']
          : body['boilLastAcidRequiredMl'] === null
            ? null
            : undefined,
      boilLastAcidRequiredTsp:
        typeof body['boilLastAcidRequiredTsp'] === "number"
          ? body['boilLastAcidRequiredTsp']
          : body['boilLastAcidRequiredTsp'] === null
            ? null
            : undefined,
      boilLastAcidRequiredGrams:
        typeof body['boilLastAcidRequiredGrams'] === "number"
          ? body['boilLastAcidRequiredGrams']
          : body['boilLastAcidRequiredGrams'] === null
            ? null
            : undefined,
      boilLastAcidRequiredKg:
        typeof body['boilLastAcidRequiredKg'] === "number"
          ? body['boilLastAcidRequiredKg']
          : body['boilLastAcidRequiredKg'] === null
            ? null
            : undefined,
      boilLastFinalAlkalinityPpmCaCO3:
        typeof body['boilLastFinalAlkalinityPpmCaCO3'] === "number"
          ? body['boilLastFinalAlkalinityPpmCaCO3']
          : body['boilLastFinalAlkalinityPpmCaCO3'] === null
            ? null
            : undefined,
      boilLastSulfateAddedPpm:
        typeof body['boilLastSulfateAddedPpm'] === "number"
          ? body['boilLastSulfateAddedPpm']
          : body['boilLastSulfateAddedPpm'] === null
            ? null
            : undefined,
      boilLastChlorideAddedPpm:
        typeof body['boilLastChlorideAddedPpm'] === "number"
          ? body['boilLastChlorideAddedPpm']
          : body['boilLastChlorideAddedPpm'] === null
            ? null
            : undefined,
      boilLastCalculatedAt:
        typeof body['boilLastCalculatedAt'] === "string" ? new Date(body['boilLastCalculatedAt']) : undefined,

      boilOverallLastResultJson: body['boilOverallLastResultJson'] !== undefined ? body['boilOverallLastResultJson'] : undefined,
      boilOverallLastCalculatedAt:
        typeof body['boilOverallLastCalculatedAt'] === "string" ? new Date(body['boilOverallLastCalculatedAt']) : undefined,
    });

    return { ok: true, settings: upserted };
  });
}

