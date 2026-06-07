// src/recipes.ts
import { OkResponseSchema, parseBrewSessionCreateResponse, parseBrewSessionsListResponse, parseRecipesListResponse, RecipeCreateRequestSchema, RecipeResponseSchema, RecipeVersionsResponseSchema } from "@umbraculum/brewery-contracts";
import { toClientPath } from "@umbraculum/api-client/transport";
import { deleteParsed, getParsed, patchParsed, postParsed } from "@umbraculum/api-client/transport";
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

// src/recipeExport.ts
import { BeerJsonExportResponseSchema } from "@umbraculum/brewery-contracts";
import { toClientPath as toClientPath2 } from "@umbraculum/api-client/transport";
import { getBytesParsed } from "@umbraculum/api-client/transport";
function recipeBeerJsonExportPath(recipeId) {
  return toClientPath2(`/recipes/${encodeURIComponent(recipeId)}/export/beerjson`);
}
function allRecipesBeerJsonExportPath() {
  return toClientPath2("/recipes/export/beerjson");
}
function parseBeerJsonExportBody(data) {
  if (data instanceof Buffer) return data;
  if (typeof data === "string") return Buffer.from(data, "latin1");
  return BeerJsonExportResponseSchema.parse(data);
}
async function exportRecipeBeerJson(client, recipeId) {
  return getBytesParsed(client, recipeBeerJsonExportPath(recipeId), parseBeerJsonExportBody);
}
async function exportAllRecipesBeerJson(client) {
  return getBytesParsed(client, allRecipesBeerJsonExportPath(), parseBeerJsonExportBody);
}

// src/ingredientAdmin.ts
import { IngredientSyncResponseSchema, IngredientSyncRunsResponseSchema } from "@umbraculum/brewery-contracts";
import { toClientPath as toClientPath3 } from "@umbraculum/api-client/transport";
import { getParsed as getParsed2, postParsed as postParsed2 } from "@umbraculum/api-client/transport";
async function listIngredientSyncRuns(client) {
  return getParsed2(
    client,
    toClientPath3("/admin/ingredients/sync-runs"),
    (data) => IngredientSyncRunsResponseSchema.parse(data)
  );
}
async function runIngredientSync(client) {
  return postParsed2(
    client,
    toClientPath3("/admin/ingredients/sync"),
    {},
    (data) => IngredientSyncResponseSchema.parse(data)
  );
}

// src/styles.ts
import { StylesListResponseSchema } from "@umbraculum/brewery-contracts";
import { toClientPath as toClientPath4 } from "@umbraculum/api-client/transport";
import { getParsed as getParsed3 } from "@umbraculum/api-client/transport";
async function listStyles(client) {
  return getParsed3(client, toClientPath4("/styles"), (data) => StylesListResponseSchema.parse(data));
}

// src/ingredients.ts
import { FermentablesListResponseSchema, HopsListResponseSchema, IngredientsSearchQuerySchema, YeastsListResponseSchema } from "@umbraculum/brewery-contracts";
import { toClientPath as toClientPath5 } from "@umbraculum/api-client/transport";
import { getParsed as getParsed4 } from "@umbraculum/api-client/transport";
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
  return getParsed4(
    client,
    `${toClientPath5("/ingredients/fermentables")}${ingredientsQueryString(params)}`,
    (data) => FermentablesListResponseSchema.parse(data)
  );
}
async function searchHops(client, params) {
  return getParsed4(
    client,
    `${toClientPath5("/ingredients/hops")}${ingredientsQueryString(params)}`,
    (data) => HopsListResponseSchema.parse(data)
  );
}
async function searchYeasts(client, params) {
  return getParsed4(
    client,
    `${toClientPath5("/ingredients/yeasts")}${ingredientsQueryString(params)}`,
    (data) => YeastsListResponseSchema.parse(data)
  );
}

// src/recipeImport.ts
import { RecipeBulkImportPreviewResponseSchema, RecipeBulkImportRequestSchema, RecipeBulkImportResponseSchema, RecipeImportPreviewResponseSchema, RecipeImportRequestSchema, RecipeImportResponseSchema } from "@umbraculum/brewery-contracts";
import { toClientPath as toClientPath6 } from "@umbraculum/api-client/transport";
import { postParsed as postParsed3 } from "@umbraculum/api-client/transport";
async function previewRecipeImport(client, body) {
  const parsedBody = RecipeImportRequestSchema.parse(body);
  return postParsed3(
    client,
    toClientPath6("/recipes/import/preview"),
    parsedBody,
    (data) => RecipeImportPreviewResponseSchema.parse(data)
  );
}
async function importRecipe(client, body) {
  const parsedBody = RecipeImportRequestSchema.parse(body);
  return postParsed3(
    client,
    toClientPath6("/recipes/import"),
    parsedBody,
    (data) => RecipeImportResponseSchema.parse(data)
  );
}
async function previewBulkRecipeImport(client, body) {
  const parsedBody = RecipeBulkImportRequestSchema.parse(body);
  return postParsed3(
    client,
    toClientPath6("/recipes/import/bulk/preview"),
    parsedBody,
    (data) => RecipeBulkImportPreviewResponseSchema.parse(data)
  );
}
async function importRecipesBulk(client, body) {
  const parsedBody = RecipeBulkImportRequestSchema.parse(body);
  return postParsed3(
    client,
    toClientPath6("/recipes/import/bulk"),
    parsedBody,
    (data) => RecipeBulkImportResponseSchema.parse(data)
  );
}

// src/brewSessions.ts
import { BrewSessionDetailResponseSchema, BrewSessionStepLogRequestSchema, BrewSessionStepResponseSchema, BrewSessionStepsPatchRequestSchema, BrewSessionStepsResponseSchema, BrewSessionStopRequestSchema, IntegrationAttachRequestSchema, IntegrationAttachResponseSchema, IntegrationAttachmentsResponseSchema, IntegrationDetachRequestSchema, IntegrationDetachResponseSchema, IntegrationReadingsQuerySchema, IntegrationReadingsResponseSchema, OkResponseSchema as OkResponseSchema2 } from "@umbraculum/brewery-contracts";
import { toClientPath as toClientPath7 } from "@umbraculum/api-client/transport";
import { deleteParsed as deleteParsed2, getParsed as getParsed5, patchParsed as patchParsed2, postParsed as postParsed4 } from "@umbraculum/api-client/transport";
function brewSessionPath(brewSessionId) {
  return toClientPath7(`/brew-sessions/${encodeURIComponent(brewSessionId)}`);
}
async function getBrewSession(client, brewSessionId) {
  return getParsed5(
    client,
    brewSessionPath(brewSessionId),
    (data) => BrewSessionDetailResponseSchema.parse(data)
  );
}
async function patchBrewSession(client, brewSessionId, patch) {
  return patchParsed2(
    client,
    brewSessionPath(brewSessionId),
    patch,
    (data) => BrewSessionDetailResponseSchema.parse(data)
  );
}
async function deleteBrewSession(client, brewSessionId) {
  return deleteParsed2(client, brewSessionPath(brewSessionId), (data) => OkResponseSchema2.parse(data));
}
async function startBrewSession(client, brewSessionId) {
  return postParsed4(
    client,
    `${brewSessionPath(brewSessionId)}/start`,
    {},
    (data) => BrewSessionDetailResponseSchema.parse(data)
  );
}
async function pauseBrewSession(client, brewSessionId) {
  return postParsed4(
    client,
    `${brewSessionPath(brewSessionId)}/pause`,
    {},
    (data) => BrewSessionDetailResponseSchema.parse(data)
  );
}
async function stopBrewSession(client, brewSessionId, body = { reason: "manual" }) {
  const parsedBody = BrewSessionStopRequestSchema.parse(body);
  return postParsed4(
    client,
    `${brewSessionPath(brewSessionId)}/stop`,
    parsedBody,
    (data) => BrewSessionDetailResponseSchema.parse(data)
  );
}
async function patchBrewSessionSteps(client, brewSessionId, body) {
  const parsedBody = BrewSessionStepsPatchRequestSchema.parse(body);
  return patchParsed2(
    client,
    `${brewSessionPath(brewSessionId)}/steps`,
    parsedBody,
    (data) => BrewSessionStepsResponseSchema.parse(data)
  );
}
async function postBrewSessionSteps(client, brewSessionId, body) {
  return postParsed4(
    client,
    `${brewSessionPath(brewSessionId)}/steps`,
    body,
    (data) => BrewSessionStepsResponseSchema.parse(data)
  );
}
async function postBrewSessionStepLog(client, brewSessionId, stepId, body) {
  const parsedBody = BrewSessionStepLogRequestSchema.parse(body);
  return postParsed4(
    client,
    `${brewSessionPath(brewSessionId)}/steps/${encodeURIComponent(stepId)}/log`,
    parsedBody,
    (data) => BrewSessionStepResponseSchema.parse(data)
  );
}
async function patchBrewSessionStep(client, brewSessionId, stepId, body) {
  return patchParsed2(
    client,
    `${brewSessionPath(brewSessionId)}/steps/${encodeURIComponent(stepId)}`,
    body,
    (data) => BrewSessionStepResponseSchema.parse(data)
  );
}
async function postBrewSessionStepTimerAction(client, brewSessionId, stepId, action) {
  return postParsed4(
    client,
    `${brewSessionPath(brewSessionId)}/steps/${encodeURIComponent(stepId)}/timer/${action}`,
    {},
    (data) => BrewSessionStepResponseSchema.parse(data)
  );
}
async function listBrewSessionIntegrationAttachments(client, brewSessionId) {
  return getParsed5(
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
  return getParsed5(
    client,
    `${brewSessionPath(brewSessionId)}/integrations/readings?${sp.toString()}`,
    (data) => IntegrationReadingsResponseSchema.parse(data)
  );
}
async function attachBrewSessionIntegration(client, brewSessionId, body) {
  const parsedBody = IntegrationAttachRequestSchema.parse(body);
  return postParsed4(
    client,
    `${brewSessionPath(brewSessionId)}/integrations/attach`,
    parsedBody,
    (data) => IntegrationAttachResponseSchema.parse(data)
  );
}
async function detachBrewSessionIntegration(client, brewSessionId, body) {
  const parsedBody = IntegrationDetachRequestSchema.parse(body);
  return postParsed4(
    client,
    `${brewSessionPath(brewSessionId)}/integrations/detach`,
    parsedBody,
    (data) => IntegrationDetachResponseSchema.parse(data)
  );
}

// src/inventory.ts
import { InventoryCreateRequestSchema, InventoryItemResponseSchema, InventoryListResponseSchema, InventoryPatchRequestSchema, OkResponseSchema as OkResponseSchema3 } from "@umbraculum/brewery-contracts";
import { toClientPath as toClientPath8 } from "@umbraculum/api-client/transport";
import { deleteParsed as deleteParsed3, getParsed as getParsed6, patchParsed as patchParsed3, postParsed as postParsed5 } from "@umbraculum/api-client/transport";
async function listInventory(client) {
  return getParsed6(
    client,
    toClientPath8("/inventory"),
    (data) => InventoryListResponseSchema.parse(data)
  );
}
async function createInventoryItem(client, body) {
  const parsedBody = InventoryCreateRequestSchema.parse(body);
  return postParsed5(
    client,
    toClientPath8("/inventory"),
    parsedBody,
    (data) => InventoryItemResponseSchema.parse(data)
  );
}
async function patchInventoryItem(client, itemId, body) {
  const parsedBody = InventoryPatchRequestSchema.parse(body);
  return patchParsed3(
    client,
    toClientPath8(`/inventory/${encodeURIComponent(itemId)}`),
    parsedBody,
    (data) => InventoryItemResponseSchema.parse(data)
  );
}
async function deleteInventoryItem(client, itemId) {
  return deleteParsed3(
    client,
    toClientPath8(`/inventory/${encodeURIComponent(itemId)}`),
    (data) => OkResponseSchema3.parse(data)
  );
}

// src/equipmentProfiles.ts
import { EquipmentProfileCreateRequestSchema, EquipmentProfilePatchRequestSchema, EquipmentProfileResponseSchema, EquipmentProfilesListResponseSchema, OkResponseSchema as OkResponseSchema4 } from "@umbraculum/brewery-contracts";
import { toClientPath as toClientPath9 } from "@umbraculum/api-client/transport";
import { deleteParsed as deleteParsed4, getParsed as getParsed7, patchParsed as patchParsed4, postParsed as postParsed6 } from "@umbraculum/api-client/transport";
async function listEquipmentProfiles(client) {
  return getParsed7(
    client,
    toClientPath9("/equipment-profiles"),
    (data) => EquipmentProfilesListResponseSchema.parse(data)
  );
}
async function createEquipmentProfile(client, body) {
  const parsedBody = EquipmentProfileCreateRequestSchema.parse(body);
  return postParsed6(
    client,
    toClientPath9("/equipment-profiles"),
    parsedBody,
    (data) => EquipmentProfileResponseSchema.parse(data)
  );
}
async function patchEquipmentProfile(client, profileId, body) {
  const parsedBody = EquipmentProfilePatchRequestSchema.parse(body);
  return patchParsed4(
    client,
    toClientPath9(`/equipment-profiles/${encodeURIComponent(profileId)}`),
    parsedBody,
    (data) => EquipmentProfileResponseSchema.parse(data)
  );
}
async function deleteEquipmentProfile(client, profileId) {
  return deleteParsed4(
    client,
    toClientPath9(`/equipment-profiles/${encodeURIComponent(profileId)}`),
    (data) => OkResponseSchema4.parse(data)
  );
}

// src/brewdaySettings.ts
import { BrewdaySettingsPatchRequestSchema, BrewdaySettingsResponseSchema } from "@umbraculum/brewery-contracts";
import { toClientPath as toClientPath10 } from "@umbraculum/api-client/transport";
import { getParsed as getParsed8, patchParsed as patchParsed5 } from "@umbraculum/api-client/transport";
async function getBrewdaySettings(client) {
  return getParsed8(
    client,
    toClientPath10("/brewday-settings"),
    (data) => BrewdaySettingsResponseSchema.parse(data)
  );
}
async function patchBrewdaySettings(client, body) {
  const parsedBody = BrewdaySettingsPatchRequestSchema.parse(body);
  return patchParsed5(
    client,
    toClientPath10("/brewday-settings"),
    parsedBody,
    (data) => BrewdaySettingsResponseSchema.parse(data)
  );
}

// src/water.ts
import { parseRecipeWaterHubSummaryResponse } from "@umbraculum/brewery-contracts";
import { toClientPath as toClientPath11 } from "@umbraculum/api-client/transport";
import { getParsed as getParsed9 } from "@umbraculum/api-client/transport";
async function getRecipeWaterHubSummary(client, recipeId) {
  return getParsed9(
    client,
    toClientPath11(`/recipes/${encodeURIComponent(recipeId)}/water-hub-summary`),
    parseRecipeWaterHubSummaryResponse
  );
}

// src/waterCalc.ts
import { WaterCalcResultOnlyResponseSchema, WaterCalcWithDerivationResponseSchema } from "@umbraculum/brewery-contracts";
import { toClientPath as toClientPath12 } from "@umbraculum/api-client/transport";
import { postParsed as postParsed7 } from "@umbraculum/api-client/transport";
function postWithDerivation(client, path, payload) {
  return postParsed7(
    client,
    toClientPath12(path),
    payload,
    (data) => WaterCalcWithDerivationResponseSchema.parse(data)
  );
}
function postResultOnly(client, path, payload) {
  return postParsed7(
    client,
    toClientPath12(path),
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

// src/waterCompute.ts
import { parseBoilComputeAndSaveResponse, parseMashComputeAndSaveResponse, parseSpargeComputeAndSaveResponse } from "@umbraculum/brewery-contracts";
import { toClientPath as toClientPath13 } from "@umbraculum/api-client/transport";
import { postParsed as postParsed8 } from "@umbraculum/api-client/transport";
async function computeAndSaveMash(client, recipeId, payload) {
  return postParsed8(
    client,
    toClientPath13(`/recipes/${encodeURIComponent(recipeId)}/water-settings/mash/compute-and-save`),
    payload,
    parseMashComputeAndSaveResponse
  );
}
async function computeAndSaveSparge(client, recipeId, payload) {
  return postParsed8(
    client,
    toClientPath13(`/recipes/${encodeURIComponent(recipeId)}/water-settings/sparge/compute-and-save`),
    payload,
    parseSpargeComputeAndSaveResponse
  );
}
async function computeAndSaveBoil(client, recipeId, payload) {
  return postParsed8(
    client,
    toClientPath13(`/recipes/${encodeURIComponent(recipeId)}/water-settings/boil/compute-and-save`),
    payload,
    parseBoilComputeAndSaveResponse
  );
}

// src/waterProfiles.ts
import { OkResponseSchema as OkResponseSchema5, parseWaterProfilesResponse, WaterProfileCreateRequestSchema, WaterProfileResponseSchema } from "@umbraculum/brewery-contracts";
import { toClientPath as toClientPath14 } from "@umbraculum/api-client/transport";
import { deleteParsed as deleteParsed5, getParsed as getParsed10, postParsed as postParsed9 } from "@umbraculum/api-client/transport";
async function listWaterProfiles(client) {
  return getParsed10(client, toClientPath14("/water-profiles"), parseWaterProfilesResponse);
}
async function createWaterProfile(client, body) {
  const parsedBody = WaterProfileCreateRequestSchema.parse(body);
  return postParsed9(
    client,
    toClientPath14("/water-profiles"),
    parsedBody,
    (data) => WaterProfileResponseSchema.parse(data)
  );
}
async function verifyWaterProfile(client, profileId) {
  return postParsed9(
    client,
    toClientPath14(`/water-profiles/${encodeURIComponent(profileId)}/verify`),
    {},
    (data) => OkResponseSchema5.parse(data)
  );
}
async function unverifyWaterProfile(client, profileId) {
  return postParsed9(
    client,
    toClientPath14(`/water-profiles/${encodeURIComponent(profileId)}/unverify`),
    {},
    (data) => OkResponseSchema5.parse(data)
  );
}
async function deleteWaterProfile(client, profileId) {
  return deleteParsed5(
    client,
    toClientPath14(`/water-profiles/${encodeURIComponent(profileId)}`),
    (data) => OkResponseSchema5.parse(data)
  );
}

// src/waterSettings.ts
import { RecipeWaterSettingsGetResponseSchema, RecipeWaterSettingsPutResponseSchema } from "@umbraculum/brewery-contracts";
import { toClientPath as toClientPath15 } from "@umbraculum/api-client/transport";
import { getParsed as getParsed11, putParsed } from "@umbraculum/api-client/transport";
async function getRecipeWaterSettings(client, recipeId) {
  return getParsed11(
    client,
    toClientPath15(`/recipes/${encodeURIComponent(recipeId)}/water-settings`),
    (data) => RecipeWaterSettingsGetResponseSchema.parse(data)
  );
}
async function updateRecipeWaterSettings(client, recipeId, patch) {
  return putParsed(
    client,
    toClientPath15(`/recipes/${encodeURIComponent(recipeId)}/water-settings`),
    patch,
    (data) => RecipeWaterSettingsPutResponseSchema.parse(data)
  );
}
export {
  allRecipesBeerJsonExportPath,
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
  exportAllRecipesBeerJson,
  exportRecipeBeerJson,
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
  listIngredientSyncRuns,
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
  recipeBeerJsonExportPath,
  runIngredientSync,
  searchFermentables,
  searchHops,
  searchYeasts,
  startBrewSession,
  stopBrewSession,
  unverifyWaterProfile,
  updateRecipeWaterSettings,
  verifyWaterProfile
};
