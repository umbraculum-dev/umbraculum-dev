import {
  deleteParsed,
  getParsed,
  patchParsed,
  postParsed,
  putParsed,
  toClientPath
} from "../chunk-67WUASDX.js";

// src/brewery/recipes.ts
import {
  OkResponseSchema,
  parseBrewSessionCreateResponse,
  parseBrewSessionsListResponse,
  parseRecipesListResponse,
  RecipeCreateRequestSchema,
  RecipeResponseSchema,
  RecipeVersionsResponseSchema
} from "@umbraculum/contracts";
async function listRecipes(client) {
  return getParsed(client, toClientPath("/recipes"), parseRecipesListResponse);
}
async function getRecipe(client, recipeId) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}`),
    (data) => RecipeResponseSchema.parse(data)
  );
}
async function listBrewSessionsForRecipe(client, recipeId) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/brew-sessions`),
    parseBrewSessionsListResponse
  );
}
async function createBrewSession(client, recipeId) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/brew-sessions`),
    {},
    parseBrewSessionCreateResponse,
    200
  );
}
async function patchRecipe(client, recipeId, patch) {
  return patchParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}`),
    patch,
    (data) => RecipeResponseSchema.parse(data)
  );
}
async function createRecipe(client, body) {
  const parsedBody = RecipeCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/recipes"),
    parsedBody,
    (data) => RecipeResponseSchema.parse(data)
  );
}
async function deleteRecipe(client, recipeId) {
  return deleteParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}`),
    (data) => OkResponseSchema.parse(data)
  );
}
async function listRecipeVersions(client, recipeId) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/versions`),
    (data) => RecipeVersionsResponseSchema.parse(data)
  );
}
async function createRecipeVersion(client, recipeId) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/versions`),
    {},
    (data) => RecipeResponseSchema.parse(data)
  );
}
async function duplicateRecipe(client, recipeId) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/duplicate`),
    {},
    (data) => RecipeResponseSchema.parse(data)
  );
}

// src/brewery/styles.ts
import { StylesListResponseSchema } from "@umbraculum/contracts";
async function listStyles(client) {
  return getParsed(client, toClientPath("/styles"), (data) => StylesListResponseSchema.parse(data));
}

// src/brewery/ingredients.ts
import {
  FermentablesListResponseSchema,
  HopsListResponseSchema,
  IngredientsSearchQuerySchema,
  YeastsListResponseSchema
} from "@umbraculum/contracts";
function ingredientsQueryString(params) {
  if (!params) return "";
  const parsed = IngredientsSearchQuerySchema.parse(params);
  const sp = new URLSearchParams();
  if (parsed.query !== void 0 && parsed.query !== "") sp.set("query", parsed.query);
  if (parsed.offset !== void 0) sp.set("offset", String(parsed.offset));
  if (parsed.limit !== void 0) sp.set("limit", String(parsed.limit));
  const q = sp.toString();
  return q ? `?${q}` : "";
}
async function searchFermentables(client, params) {
  return getParsed(
    client,
    `${toClientPath("/ingredients/fermentables")}${ingredientsQueryString(params)}`,
    (data) => FermentablesListResponseSchema.parse(data)
  );
}
async function searchHops(client, params) {
  return getParsed(
    client,
    `${toClientPath("/ingredients/hops")}${ingredientsQueryString(params)}`,
    (data) => HopsListResponseSchema.parse(data)
  );
}
async function searchYeasts(client, params) {
  return getParsed(
    client,
    `${toClientPath("/ingredients/yeasts")}${ingredientsQueryString(params)}`,
    (data) => YeastsListResponseSchema.parse(data)
  );
}

// src/brewery/recipeImport.ts
import {
  RecipeBulkImportPreviewResponseSchema,
  RecipeBulkImportRequestSchema,
  RecipeBulkImportResponseSchema,
  RecipeImportPreviewResponseSchema,
  RecipeImportRequestSchema,
  RecipeImportResponseSchema
} from "@umbraculum/contracts";
async function previewRecipeImport(client, body) {
  const parsedBody = RecipeImportRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/recipes/import/preview"),
    parsedBody,
    (data) => RecipeImportPreviewResponseSchema.parse(data)
  );
}
async function importRecipe(client, body) {
  const parsedBody = RecipeImportRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/recipes/import"),
    parsedBody,
    (data) => RecipeImportResponseSchema.parse(data)
  );
}
async function previewBulkRecipeImport(client, body) {
  const parsedBody = RecipeBulkImportRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/recipes/import/bulk/preview"),
    parsedBody,
    (data) => RecipeBulkImportPreviewResponseSchema.parse(data)
  );
}
async function importRecipesBulk(client, body) {
  const parsedBody = RecipeBulkImportRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/recipes/import/bulk"),
    parsedBody,
    (data) => RecipeBulkImportResponseSchema.parse(data)
  );
}

// src/brewery/brewSessions.ts
import {
  BrewSessionDetailResponseSchema,
  BrewSessionStepLogRequestSchema,
  BrewSessionStepResponseSchema,
  BrewSessionStepsPatchRequestSchema,
  BrewSessionStepsResponseSchema,
  BrewSessionStopRequestSchema,
  IntegrationAttachRequestSchema,
  IntegrationAttachResponseSchema,
  IntegrationAttachmentsResponseSchema,
  IntegrationDetachRequestSchema,
  IntegrationDetachResponseSchema,
  IntegrationReadingsQuerySchema,
  IntegrationReadingsResponseSchema,
  OkResponseSchema as OkResponseSchema2
} from "@umbraculum/contracts";
function brewSessionPath(brewSessionId) {
  return toClientPath(`/brew-sessions/${encodeURIComponent(brewSessionId)}`);
}
async function getBrewSession(client, brewSessionId) {
  return getParsed(
    client,
    brewSessionPath(brewSessionId),
    (data) => BrewSessionDetailResponseSchema.parse(data)
  );
}
async function patchBrewSession(client, brewSessionId, patch) {
  return patchParsed(
    client,
    brewSessionPath(brewSessionId),
    patch,
    (data) => BrewSessionDetailResponseSchema.parse(data)
  );
}
async function deleteBrewSession(client, brewSessionId) {
  return deleteParsed(client, brewSessionPath(brewSessionId), (data) => OkResponseSchema2.parse(data));
}
async function startBrewSession(client, brewSessionId) {
  return postParsed(
    client,
    `${brewSessionPath(brewSessionId)}/start`,
    {},
    (data) => BrewSessionDetailResponseSchema.parse(data)
  );
}
async function pauseBrewSession(client, brewSessionId) {
  return postParsed(
    client,
    `${brewSessionPath(brewSessionId)}/pause`,
    {},
    (data) => BrewSessionDetailResponseSchema.parse(data)
  );
}
async function stopBrewSession(client, brewSessionId, body = { reason: "manual" }) {
  const parsedBody = BrewSessionStopRequestSchema.parse(body);
  return postParsed(
    client,
    `${brewSessionPath(brewSessionId)}/stop`,
    parsedBody,
    (data) => BrewSessionDetailResponseSchema.parse(data)
  );
}
async function patchBrewSessionSteps(client, brewSessionId, body) {
  const parsedBody = BrewSessionStepsPatchRequestSchema.parse(body);
  return patchParsed(
    client,
    `${brewSessionPath(brewSessionId)}/steps`,
    parsedBody,
    (data) => BrewSessionStepsResponseSchema.parse(data)
  );
}
async function postBrewSessionSteps(client, brewSessionId, body) {
  return postParsed(
    client,
    `${brewSessionPath(brewSessionId)}/steps`,
    body,
    (data) => BrewSessionStepsResponseSchema.parse(data)
  );
}
async function postBrewSessionStepLog(client, brewSessionId, stepId, body) {
  const parsedBody = BrewSessionStepLogRequestSchema.parse(body);
  return postParsed(
    client,
    `${brewSessionPath(brewSessionId)}/steps/${encodeURIComponent(stepId)}/log`,
    parsedBody,
    (data) => BrewSessionStepResponseSchema.parse(data)
  );
}
async function patchBrewSessionStep(client, brewSessionId, stepId, body) {
  return patchParsed(
    client,
    `${brewSessionPath(brewSessionId)}/steps/${encodeURIComponent(stepId)}`,
    body,
    (data) => BrewSessionStepResponseSchema.parse(data)
  );
}
async function postBrewSessionStepTimerAction(client, brewSessionId, stepId, action) {
  return postParsed(
    client,
    `${brewSessionPath(brewSessionId)}/steps/${encodeURIComponent(stepId)}/timer/${action}`,
    {},
    (data) => BrewSessionStepResponseSchema.parse(data)
  );
}
async function listBrewSessionIntegrationAttachments(client, brewSessionId) {
  return getParsed(
    client,
    `${brewSessionPath(brewSessionId)}/integrations/attachments`,
    (data) => IntegrationAttachmentsResponseSchema.parse(data)
  );
}
async function listBrewSessionIntegrationReadings(client, brewSessionId, params) {
  const parsed = IntegrationReadingsQuerySchema.parse(params);
  const sp = new URLSearchParams();
  sp.set("kind", parsed.kind);
  if (parsed.limit !== void 0) sp.set("limit", String(parsed.limit));
  return getParsed(
    client,
    `${brewSessionPath(brewSessionId)}/integrations/readings?${sp.toString()}`,
    (data) => IntegrationReadingsResponseSchema.parse(data)
  );
}
async function attachBrewSessionIntegration(client, brewSessionId, body) {
  const parsedBody = IntegrationAttachRequestSchema.parse(body);
  return postParsed(
    client,
    `${brewSessionPath(brewSessionId)}/integrations/attach`,
    parsedBody,
    (data) => IntegrationAttachResponseSchema.parse(data)
  );
}
async function detachBrewSessionIntegration(client, brewSessionId, body) {
  const parsedBody = IntegrationDetachRequestSchema.parse(body);
  return postParsed(
    client,
    `${brewSessionPath(brewSessionId)}/integrations/detach`,
    parsedBody,
    (data) => IntegrationDetachResponseSchema.parse(data)
  );
}

// src/brewery/inventory.ts
import {
  InventoryCreateRequestSchema,
  InventoryItemResponseSchema,
  InventoryListResponseSchema,
  InventoryPatchRequestSchema,
  OkResponseSchema as OkResponseSchema3
} from "@umbraculum/contracts";
async function listInventory(client) {
  return getParsed(
    client,
    toClientPath("/inventory"),
    (data) => InventoryListResponseSchema.parse(data)
  );
}
async function createInventoryItem(client, body) {
  const parsedBody = InventoryCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/inventory"),
    parsedBody,
    (data) => InventoryItemResponseSchema.parse(data)
  );
}
async function patchInventoryItem(client, itemId, body) {
  const parsedBody = InventoryPatchRequestSchema.parse(body);
  return patchParsed(
    client,
    toClientPath(`/inventory/${encodeURIComponent(itemId)}`),
    parsedBody,
    (data) => InventoryItemResponseSchema.parse(data)
  );
}
async function deleteInventoryItem(client, itemId) {
  return deleteParsed(
    client,
    toClientPath(`/inventory/${encodeURIComponent(itemId)}`),
    (data) => OkResponseSchema3.parse(data)
  );
}

// src/brewery/equipmentProfiles.ts
import {
  EquipmentProfileCreateRequestSchema,
  EquipmentProfilePatchRequestSchema,
  EquipmentProfileResponseSchema,
  EquipmentProfilesListResponseSchema,
  OkResponseSchema as OkResponseSchema4
} from "@umbraculum/contracts";
async function listEquipmentProfiles(client) {
  return getParsed(
    client,
    toClientPath("/equipment-profiles"),
    (data) => EquipmentProfilesListResponseSchema.parse(data)
  );
}
async function createEquipmentProfile(client, body) {
  const parsedBody = EquipmentProfileCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/equipment-profiles"),
    parsedBody,
    (data) => EquipmentProfileResponseSchema.parse(data)
  );
}
async function patchEquipmentProfile(client, profileId, body) {
  const parsedBody = EquipmentProfilePatchRequestSchema.parse(body);
  return patchParsed(
    client,
    toClientPath(`/equipment-profiles/${encodeURIComponent(profileId)}`),
    parsedBody,
    (data) => EquipmentProfileResponseSchema.parse(data)
  );
}
async function deleteEquipmentProfile(client, profileId) {
  return deleteParsed(
    client,
    toClientPath(`/equipment-profiles/${encodeURIComponent(profileId)}`),
    (data) => OkResponseSchema4.parse(data)
  );
}

// src/brewery/brewdaySettings.ts
import {
  BrewdaySettingsPatchRequestSchema,
  BrewdaySettingsResponseSchema
} from "@umbraculum/contracts";
async function getBrewdaySettings(client) {
  return getParsed(
    client,
    toClientPath("/brewday-settings"),
    (data) => BrewdaySettingsResponseSchema.parse(data)
  );
}
async function patchBrewdaySettings(client, body) {
  const parsedBody = BrewdaySettingsPatchRequestSchema.parse(body);
  return patchParsed(
    client,
    toClientPath("/brewday-settings"),
    parsedBody,
    (data) => BrewdaySettingsResponseSchema.parse(data)
  );
}

// src/brewery/water.ts
import { parseRecipeWaterHubSummaryResponse } from "@umbraculum/contracts";
async function getRecipeWaterHubSummary(client, recipeId) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-hub-summary`),
    parseRecipeWaterHubSummaryResponse
  );
}

// src/brewery/waterCalc.ts
import {
  WaterCalcResultOnlyResponseSchema,
  WaterCalcWithDerivationResponseSchema
} from "@umbraculum/contracts";
function postWithDerivation(client, path, payload) {
  return postParsed(
    client,
    toClientPath(path),
    payload,
    (data) => WaterCalcWithDerivationResponseSchema.parse(data)
  );
}
function postResultOnly(client, path, payload) {
  return postParsed(
    client,
    toClientPath(path),
    payload,
    (data) => WaterCalcResultOnlyResponseSchema.parse(data)
  );
}
async function calcSaltAdditions(client, payload) {
  return postWithDerivation(client, "/water-calc/salt-additions", payload);
}
async function estimateMashPh(client, payload) {
  return postResultOnly(client, "/water-calc/mash-ph-estimate", payload);
}
async function calcMashOverall(client, payload) {
  return postWithDerivation(client, "/water-calc/mash-overall", payload);
}
async function calcSpargeOverall(client, payload) {
  return postWithDerivation(client, "/water-calc/sparge-overall", payload);
}
async function calcBoilOverall(client, payload) {
  return postWithDerivation(client, "/water-calc/boil-overall", payload);
}
async function calcSpargeAcidification(client, payload) {
  return postWithDerivation(client, "/water-calc/sparge-acidification", payload);
}
async function calcSpargeAcidificationManual(client, payload) {
  return postWithDerivation(client, "/water-calc/sparge-acidification-manual", payload);
}
async function calcMashAcidification(client, payload) {
  return postWithDerivation(client, "/water-calc/mash-acidification", payload);
}
async function calcMashAcidificationManual(client, payload) {
  return postWithDerivation(client, "/water-calc/mash-acidification-manual", payload);
}
async function calcMashAcidificationTargetMashPh(client, payload) {
  return postResultOnly(client, "/water-calc/mash-acidification-target-mash-ph", payload);
}

// src/brewery/waterCompute.ts
import {
  parseBoilComputeAndSaveResponse,
  parseMashComputeAndSaveResponse,
  parseSpargeComputeAndSaveResponse
} from "@umbraculum/contracts";
async function computeAndSaveMash(client, recipeId, payload) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings/mash/compute-and-save`),
    payload,
    parseMashComputeAndSaveResponse
  );
}
async function computeAndSaveSparge(client, recipeId, payload) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings/sparge/compute-and-save`),
    payload,
    parseSpargeComputeAndSaveResponse
  );
}
async function computeAndSaveBoil(client, recipeId, payload) {
  return postParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings/boil/compute-and-save`),
    payload,
    parseBoilComputeAndSaveResponse
  );
}

// src/brewery/waterProfiles.ts
import {
  OkResponseSchema as OkResponseSchema5,
  parseWaterProfilesResponse,
  WaterProfileCreateRequestSchema,
  WaterProfileResponseSchema
} from "@umbraculum/contracts";
async function listWaterProfiles(client) {
  return getParsed(client, toClientPath("/water-profiles"), parseWaterProfilesResponse);
}
async function createWaterProfile(client, body) {
  const parsedBody = WaterProfileCreateRequestSchema.parse(body);
  return postParsed(
    client,
    toClientPath("/water-profiles"),
    parsedBody,
    (data) => WaterProfileResponseSchema.parse(data)
  );
}
async function verifyWaterProfile(client, profileId) {
  return postParsed(
    client,
    toClientPath(`/water-profiles/${encodeURIComponent(profileId)}/verify`),
    {},
    (data) => OkResponseSchema5.parse(data)
  );
}
async function unverifyWaterProfile(client, profileId) {
  return postParsed(
    client,
    toClientPath(`/water-profiles/${encodeURIComponent(profileId)}/unverify`),
    {},
    (data) => OkResponseSchema5.parse(data)
  );
}
async function deleteWaterProfile(client, profileId) {
  return deleteParsed(
    client,
    toClientPath(`/water-profiles/${encodeURIComponent(profileId)}`),
    (data) => OkResponseSchema5.parse(data)
  );
}

// src/brewery/waterSettings.ts
import {
  RecipeWaterSettingsGetResponseSchema,
  RecipeWaterSettingsPutResponseSchema
} from "@umbraculum/contracts";
async function getRecipeWaterSettings(client, recipeId) {
  return getParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings`),
    (data) => RecipeWaterSettingsGetResponseSchema.parse(data)
  );
}
async function updateRecipeWaterSettings(client, recipeId, patch) {
  return putParsed(
    client,
    toClientPath(`/recipes/${encodeURIComponent(recipeId)}/water-settings`),
    patch,
    (data) => RecipeWaterSettingsPutResponseSchema.parse(data)
  );
}
export {
  attachBrewSessionIntegration,
  calcBoilOverall,
  calcMashAcidification,
  calcMashAcidificationManual,
  calcMashAcidificationTargetMashPh,
  calcMashOverall,
  calcSaltAdditions,
  calcSpargeAcidification,
  calcSpargeAcidificationManual,
  calcSpargeOverall,
  computeAndSaveBoil,
  computeAndSaveMash,
  computeAndSaveSparge,
  createBrewSession,
  createEquipmentProfile,
  createInventoryItem,
  createRecipe,
  createRecipeVersion,
  createWaterProfile,
  deleteBrewSession,
  deleteEquipmentProfile,
  deleteInventoryItem,
  deleteRecipe,
  deleteWaterProfile,
  detachBrewSessionIntegration,
  duplicateRecipe,
  estimateMashPh,
  getBrewSession,
  getBrewdaySettings,
  getRecipe,
  getRecipeWaterHubSummary,
  getRecipeWaterSettings,
  importRecipe,
  importRecipesBulk,
  listBrewSessionIntegrationAttachments,
  listBrewSessionIntegrationReadings,
  listBrewSessionsForRecipe,
  listEquipmentProfiles,
  listInventory,
  listRecipeVersions,
  listRecipes,
  listStyles,
  listWaterProfiles,
  patchBrewSession,
  patchBrewSessionStep,
  patchBrewSessionSteps,
  patchBrewdaySettings,
  patchEquipmentProfile,
  patchInventoryItem,
  patchRecipe,
  pauseBrewSession,
  postBrewSessionStepLog,
  postBrewSessionStepTimerAction,
  postBrewSessionSteps,
  previewBulkRecipeImport,
  previewRecipeImport,
  searchFermentables,
  searchHops,
  searchYeasts,
  startBrewSession,
  stopBrewSession,
  unverifyWaterProfile,
  updateRecipeWaterSettings,
  verifyWaterProfile
};
