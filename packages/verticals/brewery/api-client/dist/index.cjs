"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  allRecipesBeerJsonExportPath: () => allRecipesBeerJsonExportPath,
  attachBrewSessionIntegration: () => attachBrewSessionIntegration,
  calcBoilOverall: () => calcBoilOverall,
  calcMashAcidification: () => calcMashAcidification,
  calcMashAcidificationManual: () => calcMashAcidificationManual,
  calcMashAcidificationTargetMashPh: () => calcMashAcidificationTargetMashPh,
  calcMashOverall: () => calcMashOverall,
  calcSaltAdditions: () => calcSaltAdditions,
  calcSpargeAcidification: () => calcSpargeAcidification,
  calcSpargeAcidificationManual: () => calcSpargeAcidificationManual,
  calcSpargeOverall: () => calcSpargeOverall,
  computeAndSaveBoil: () => computeAndSaveBoil,
  computeAndSaveMash: () => computeAndSaveMash,
  computeAndSaveSparge: () => computeAndSaveSparge,
  createBrewSession: () => createBrewSession,
  createEquipmentProfile: () => createEquipmentProfile,
  createInventoryItem: () => createInventoryItem,
  createRecipe: () => createRecipe,
  createRecipeVersion: () => createRecipeVersion,
  createWaterProfile: () => createWaterProfile,
  deleteBrewSession: () => deleteBrewSession,
  deleteEquipmentProfile: () => deleteEquipmentProfile,
  deleteInventoryItem: () => deleteInventoryItem,
  deleteRecipe: () => deleteRecipe,
  deleteWaterProfile: () => deleteWaterProfile,
  detachBrewSessionIntegration: () => detachBrewSessionIntegration,
  duplicateRecipe: () => duplicateRecipe,
  estimateMashPh: () => estimateMashPh,
  exportAllRecipesBeerJson: () => exportAllRecipesBeerJson,
  exportRecipeBeerJson: () => exportRecipeBeerJson,
  getBrewSession: () => getBrewSession,
  getBrewdaySettings: () => getBrewdaySettings,
  getRecipe: () => getRecipe,
  getRecipeWaterHubSummary: () => getRecipeWaterHubSummary,
  getRecipeWaterSettings: () => getRecipeWaterSettings,
  importRecipe: () => importRecipe,
  importRecipesBulk: () => importRecipesBulk,
  listBrewSessionIntegrationAttachments: () => listBrewSessionIntegrationAttachments,
  listBrewSessionIntegrationReadings: () => listBrewSessionIntegrationReadings,
  listBrewSessionsForRecipe: () => listBrewSessionsForRecipe,
  listEquipmentProfiles: () => listEquipmentProfiles,
  listIngredientSyncRuns: () => listIngredientSyncRuns,
  listInventory: () => listInventory,
  listRecipeVersions: () => listRecipeVersions,
  listRecipes: () => listRecipes,
  listStyles: () => listStyles,
  listWaterProfiles: () => listWaterProfiles,
  patchBrewSession: () => patchBrewSession,
  patchBrewSessionStep: () => patchBrewSessionStep,
  patchBrewSessionSteps: () => patchBrewSessionSteps,
  patchBrewdaySettings: () => patchBrewdaySettings,
  patchEquipmentProfile: () => patchEquipmentProfile,
  patchInventoryItem: () => patchInventoryItem,
  patchRecipe: () => patchRecipe,
  pauseBrewSession: () => pauseBrewSession,
  postBrewSessionStepLog: () => postBrewSessionStepLog,
  postBrewSessionStepTimerAction: () => postBrewSessionStepTimerAction,
  postBrewSessionSteps: () => postBrewSessionSteps,
  previewBulkRecipeImport: () => previewBulkRecipeImport,
  previewRecipeImport: () => previewRecipeImport,
  recipeBeerJsonExportPath: () => recipeBeerJsonExportPath,
  runIngredientSync: () => runIngredientSync,
  searchFermentables: () => searchFermentables,
  searchHops: () => searchHops,
  searchYeasts: () => searchYeasts,
  startBrewSession: () => startBrewSession,
  stopBrewSession: () => stopBrewSession,
  unverifyWaterProfile: () => unverifyWaterProfile,
  updateRecipeWaterSettings: () => updateRecipeWaterSettings,
  verifyWaterProfile: () => verifyWaterProfile
});
module.exports = __toCommonJS(index_exports);

// src/recipes.ts
var import_brewery_contracts = require("@umbraculum/brewery-contracts");
var import_transport = require("@umbraculum/api-client/transport");
var import_transport2 = require("@umbraculum/api-client/transport");
async function listRecipes(client) {
  return (0, import_transport2.getParsed)(client, (0, import_transport.toClientPath)("/recipes"), import_brewery_contracts.parseRecipesListResponse);
}
async function getRecipe(client, recipeId) {
  return (0, import_transport2.getParsed)(
    client,
    (0, import_transport.toClientPath)(`/recipes/${encodeURIComponent(recipeId)}`),
    (data) => import_brewery_contracts.RecipeResponseSchema.parse(data)
  );
}
async function listBrewSessionsForRecipe(client, recipeId) {
  return (0, import_transport2.getParsed)(
    client,
    (0, import_transport.toClientPath)(`/recipes/${encodeURIComponent(recipeId)}/brew-sessions`),
    import_brewery_contracts.parseBrewSessionsListResponse
  );
}
async function createBrewSession(client, recipeId) {
  return (0, import_transport2.postParsed)(
    client,
    (0, import_transport.toClientPath)(`/recipes/${encodeURIComponent(recipeId)}/brew-sessions`),
    {},
    import_brewery_contracts.parseBrewSessionCreateResponse,
    200
  );
}
async function patchRecipe(client, recipeId, patch) {
  return (0, import_transport2.patchParsed)(
    client,
    (0, import_transport.toClientPath)(`/recipes/${encodeURIComponent(recipeId)}`),
    patch,
    (data) => import_brewery_contracts.RecipeResponseSchema.parse(data)
  );
}
async function createRecipe(client, body) {
  const parsedBody = import_brewery_contracts.RecipeCreateRequestSchema.parse(body);
  return (0, import_transport2.postParsed)(
    client,
    (0, import_transport.toClientPath)("/recipes"),
    parsedBody,
    (data) => import_brewery_contracts.RecipeResponseSchema.parse(data)
  );
}
async function deleteRecipe(client, recipeId) {
  return (0, import_transport2.deleteParsed)(
    client,
    (0, import_transport.toClientPath)(`/recipes/${encodeURIComponent(recipeId)}`),
    (data) => import_brewery_contracts.OkResponseSchema.parse(data)
  );
}
async function listRecipeVersions(client, recipeId) {
  return (0, import_transport2.getParsed)(
    client,
    (0, import_transport.toClientPath)(`/recipes/${encodeURIComponent(recipeId)}/versions`),
    (data) => import_brewery_contracts.RecipeVersionsResponseSchema.parse(data)
  );
}
async function createRecipeVersion(client, recipeId) {
  return (0, import_transport2.postParsed)(
    client,
    (0, import_transport.toClientPath)(`/recipes/${encodeURIComponent(recipeId)}/versions`),
    {},
    (data) => import_brewery_contracts.RecipeResponseSchema.parse(data)
  );
}
async function duplicateRecipe(client, recipeId) {
  return (0, import_transport2.postParsed)(
    client,
    (0, import_transport.toClientPath)(`/recipes/${encodeURIComponent(recipeId)}/duplicate`),
    {},
    (data) => import_brewery_contracts.RecipeResponseSchema.parse(data)
  );
}

// src/recipeExport.ts
var import_brewery_contracts2 = require("@umbraculum/brewery-contracts");
var import_transport3 = require("@umbraculum/api-client/transport");
var import_transport4 = require("@umbraculum/api-client/transport");
function recipeBeerJsonExportPath(recipeId) {
  return (0, import_transport3.toClientPath)(`/recipes/${encodeURIComponent(recipeId)}/export/beerjson`);
}
function allRecipesBeerJsonExportPath() {
  return (0, import_transport3.toClientPath)("/recipes/export/beerjson");
}
function parseBeerJsonExportBody(data) {
  if (data instanceof Buffer) return data;
  if (typeof data === "string") return Buffer.from(data, "latin1");
  return import_brewery_contracts2.BeerJsonExportResponseSchema.parse(data);
}
async function exportRecipeBeerJson(client, recipeId) {
  return (0, import_transport4.getBytesParsed)(client, recipeBeerJsonExportPath(recipeId), parseBeerJsonExportBody);
}
async function exportAllRecipesBeerJson(client) {
  return (0, import_transport4.getBytesParsed)(client, allRecipesBeerJsonExportPath(), parseBeerJsonExportBody);
}

// src/ingredientAdmin.ts
var import_brewery_contracts3 = require("@umbraculum/brewery-contracts");
var import_transport5 = require("@umbraculum/api-client/transport");
var import_transport6 = require("@umbraculum/api-client/transport");
async function listIngredientSyncRuns(client) {
  return (0, import_transport6.getParsed)(
    client,
    (0, import_transport5.toClientPath)("/admin/ingredients/sync-runs"),
    (data) => import_brewery_contracts3.IngredientSyncRunsResponseSchema.parse(data)
  );
}
async function runIngredientSync(client) {
  return (0, import_transport6.postParsed)(
    client,
    (0, import_transport5.toClientPath)("/admin/ingredients/sync"),
    {},
    (data) => import_brewery_contracts3.IngredientSyncResponseSchema.parse(data)
  );
}

// src/styles.ts
var import_brewery_contracts4 = require("@umbraculum/brewery-contracts");
var import_transport7 = require("@umbraculum/api-client/transport");
var import_transport8 = require("@umbraculum/api-client/transport");
async function listStyles(client) {
  return (0, import_transport8.getParsed)(client, (0, import_transport7.toClientPath)("/styles"), (data) => import_brewery_contracts4.StylesListResponseSchema.parse(data));
}

// src/ingredients.ts
var import_brewery_contracts5 = require("@umbraculum/brewery-contracts");
var import_transport9 = require("@umbraculum/api-client/transport");
var import_transport10 = require("@umbraculum/api-client/transport");
function ingredientsQueryString(params) {
  if (!params) return "";
  const parsed = import_brewery_contracts5.IngredientsSearchQuerySchema.parse(params);
  const sp = new URLSearchParams();
  if (parsed.query !== void 0 && parsed.query !== "") sp.set("query", parsed.query);
  if (parsed.offset !== void 0) sp.set("offset", String(parsed.offset));
  if (parsed.limit !== void 0) sp.set("limit", String(parsed.limit));
  const q = sp.toString();
  return q ? `?${q}` : "";
}
async function searchFermentables(client, params) {
  return (0, import_transport10.getParsed)(
    client,
    `${(0, import_transport9.toClientPath)("/ingredients/fermentables")}${ingredientsQueryString(params)}`,
    (data) => import_brewery_contracts5.FermentablesListResponseSchema.parse(data)
  );
}
async function searchHops(client, params) {
  return (0, import_transport10.getParsed)(
    client,
    `${(0, import_transport9.toClientPath)("/ingredients/hops")}${ingredientsQueryString(params)}`,
    (data) => import_brewery_contracts5.HopsListResponseSchema.parse(data)
  );
}
async function searchYeasts(client, params) {
  return (0, import_transport10.getParsed)(
    client,
    `${(0, import_transport9.toClientPath)("/ingredients/yeasts")}${ingredientsQueryString(params)}`,
    (data) => import_brewery_contracts5.YeastsListResponseSchema.parse(data)
  );
}

// src/recipeImport.ts
var import_brewery_contracts6 = require("@umbraculum/brewery-contracts");
var import_transport11 = require("@umbraculum/api-client/transport");
var import_transport12 = require("@umbraculum/api-client/transport");
async function previewRecipeImport(client, body) {
  const parsedBody = import_brewery_contracts6.RecipeImportRequestSchema.parse(body);
  return (0, import_transport12.postParsed)(
    client,
    (0, import_transport11.toClientPath)("/recipes/import/preview"),
    parsedBody,
    (data) => import_brewery_contracts6.RecipeImportPreviewResponseSchema.parse(data)
  );
}
async function importRecipe(client, body) {
  const parsedBody = import_brewery_contracts6.RecipeImportRequestSchema.parse(body);
  return (0, import_transport12.postParsed)(
    client,
    (0, import_transport11.toClientPath)("/recipes/import"),
    parsedBody,
    (data) => import_brewery_contracts6.RecipeImportResponseSchema.parse(data)
  );
}
async function previewBulkRecipeImport(client, body) {
  const parsedBody = import_brewery_contracts6.RecipeBulkImportRequestSchema.parse(body);
  return (0, import_transport12.postParsed)(
    client,
    (0, import_transport11.toClientPath)("/recipes/import/bulk/preview"),
    parsedBody,
    (data) => import_brewery_contracts6.RecipeBulkImportPreviewResponseSchema.parse(data)
  );
}
async function importRecipesBulk(client, body) {
  const parsedBody = import_brewery_contracts6.RecipeBulkImportRequestSchema.parse(body);
  return (0, import_transport12.postParsed)(
    client,
    (0, import_transport11.toClientPath)("/recipes/import/bulk"),
    parsedBody,
    (data) => import_brewery_contracts6.RecipeBulkImportResponseSchema.parse(data)
  );
}

// src/brewSessions.ts
var import_brewery_contracts7 = require("@umbraculum/brewery-contracts");
var import_transport13 = require("@umbraculum/api-client/transport");
var import_transport14 = require("@umbraculum/api-client/transport");
function brewSessionPath(brewSessionId) {
  return (0, import_transport13.toClientPath)(`/brew-sessions/${encodeURIComponent(brewSessionId)}`);
}
async function getBrewSession(client, brewSessionId) {
  return (0, import_transport14.getParsed)(
    client,
    brewSessionPath(brewSessionId),
    (data) => import_brewery_contracts7.BrewSessionDetailResponseSchema.parse(data)
  );
}
async function patchBrewSession(client, brewSessionId, patch) {
  return (0, import_transport14.patchParsed)(
    client,
    brewSessionPath(brewSessionId),
    patch,
    (data) => import_brewery_contracts7.BrewSessionDetailResponseSchema.parse(data)
  );
}
async function deleteBrewSession(client, brewSessionId) {
  return (0, import_transport14.deleteParsed)(client, brewSessionPath(brewSessionId), (data) => import_brewery_contracts7.OkResponseSchema.parse(data));
}
async function startBrewSession(client, brewSessionId) {
  return (0, import_transport14.postParsed)(
    client,
    `${brewSessionPath(brewSessionId)}/start`,
    {},
    (data) => import_brewery_contracts7.BrewSessionDetailResponseSchema.parse(data)
  );
}
async function pauseBrewSession(client, brewSessionId) {
  return (0, import_transport14.postParsed)(
    client,
    `${brewSessionPath(brewSessionId)}/pause`,
    {},
    (data) => import_brewery_contracts7.BrewSessionDetailResponseSchema.parse(data)
  );
}
async function stopBrewSession(client, brewSessionId, body = { reason: "manual" }) {
  const parsedBody = import_brewery_contracts7.BrewSessionStopRequestSchema.parse(body);
  return (0, import_transport14.postParsed)(
    client,
    `${brewSessionPath(brewSessionId)}/stop`,
    parsedBody,
    (data) => import_brewery_contracts7.BrewSessionDetailResponseSchema.parse(data)
  );
}
async function patchBrewSessionSteps(client, brewSessionId, body) {
  const parsedBody = import_brewery_contracts7.BrewSessionStepsPatchRequestSchema.parse(body);
  return (0, import_transport14.patchParsed)(
    client,
    `${brewSessionPath(brewSessionId)}/steps`,
    parsedBody,
    (data) => import_brewery_contracts7.BrewSessionStepsResponseSchema.parse(data)
  );
}
async function postBrewSessionSteps(client, brewSessionId, body) {
  return (0, import_transport14.postParsed)(
    client,
    `${brewSessionPath(brewSessionId)}/steps`,
    body,
    (data) => import_brewery_contracts7.BrewSessionStepsResponseSchema.parse(data)
  );
}
async function postBrewSessionStepLog(client, brewSessionId, stepId, body) {
  const parsedBody = import_brewery_contracts7.BrewSessionStepLogRequestSchema.parse(body);
  return (0, import_transport14.postParsed)(
    client,
    `${brewSessionPath(brewSessionId)}/steps/${encodeURIComponent(stepId)}/log`,
    parsedBody,
    (data) => import_brewery_contracts7.BrewSessionStepResponseSchema.parse(data)
  );
}
async function patchBrewSessionStep(client, brewSessionId, stepId, body) {
  return (0, import_transport14.patchParsed)(
    client,
    `${brewSessionPath(brewSessionId)}/steps/${encodeURIComponent(stepId)}`,
    body,
    (data) => import_brewery_contracts7.BrewSessionStepResponseSchema.parse(data)
  );
}
async function postBrewSessionStepTimerAction(client, brewSessionId, stepId, action) {
  return (0, import_transport14.postParsed)(
    client,
    `${brewSessionPath(brewSessionId)}/steps/${encodeURIComponent(stepId)}/timer/${action}`,
    {},
    (data) => import_brewery_contracts7.BrewSessionStepResponseSchema.parse(data)
  );
}
async function listBrewSessionIntegrationAttachments(client, brewSessionId) {
  return (0, import_transport14.getParsed)(
    client,
    `${brewSessionPath(brewSessionId)}/integrations/attachments`,
    (data) => import_brewery_contracts7.IntegrationAttachmentsResponseSchema.parse(data)
  );
}
async function listBrewSessionIntegrationReadings(client, brewSessionId, params) {
  const parsed = import_brewery_contracts7.IntegrationReadingsQuerySchema.parse(params);
  const sp = new URLSearchParams();
  sp.set("kind", parsed.kind);
  if (parsed.limit !== void 0) sp.set("limit", String(parsed.limit));
  return (0, import_transport14.getParsed)(
    client,
    `${brewSessionPath(brewSessionId)}/integrations/readings?${sp.toString()}`,
    (data) => import_brewery_contracts7.IntegrationReadingsResponseSchema.parse(data)
  );
}
async function attachBrewSessionIntegration(client, brewSessionId, body) {
  const parsedBody = import_brewery_contracts7.IntegrationAttachRequestSchema.parse(body);
  return (0, import_transport14.postParsed)(
    client,
    `${brewSessionPath(brewSessionId)}/integrations/attach`,
    parsedBody,
    (data) => import_brewery_contracts7.IntegrationAttachResponseSchema.parse(data)
  );
}
async function detachBrewSessionIntegration(client, brewSessionId, body) {
  const parsedBody = import_brewery_contracts7.IntegrationDetachRequestSchema.parse(body);
  return (0, import_transport14.postParsed)(
    client,
    `${brewSessionPath(brewSessionId)}/integrations/detach`,
    parsedBody,
    (data) => import_brewery_contracts7.IntegrationDetachResponseSchema.parse(data)
  );
}

// src/inventory.ts
var import_brewery_contracts8 = require("@umbraculum/brewery-contracts");
var import_transport15 = require("@umbraculum/api-client/transport");
var import_transport16 = require("@umbraculum/api-client/transport");
async function listInventory(client) {
  return (0, import_transport16.getParsed)(
    client,
    (0, import_transport15.toClientPath)("/inventory"),
    (data) => import_brewery_contracts8.InventoryListResponseSchema.parse(data)
  );
}
async function createInventoryItem(client, body) {
  const parsedBody = import_brewery_contracts8.InventoryCreateRequestSchema.parse(body);
  return (0, import_transport16.postParsed)(
    client,
    (0, import_transport15.toClientPath)("/inventory"),
    parsedBody,
    (data) => import_brewery_contracts8.InventoryItemResponseSchema.parse(data)
  );
}
async function patchInventoryItem(client, itemId, body) {
  const parsedBody = import_brewery_contracts8.InventoryPatchRequestSchema.parse(body);
  return (0, import_transport16.patchParsed)(
    client,
    (0, import_transport15.toClientPath)(`/inventory/${encodeURIComponent(itemId)}`),
    parsedBody,
    (data) => import_brewery_contracts8.InventoryItemResponseSchema.parse(data)
  );
}
async function deleteInventoryItem(client, itemId) {
  return (0, import_transport16.deleteParsed)(
    client,
    (0, import_transport15.toClientPath)(`/inventory/${encodeURIComponent(itemId)}`),
    (data) => import_brewery_contracts8.OkResponseSchema.parse(data)
  );
}

// src/equipmentProfiles.ts
var import_brewery_contracts9 = require("@umbraculum/brewery-contracts");
var import_transport17 = require("@umbraculum/api-client/transport");
var import_transport18 = require("@umbraculum/api-client/transport");
async function listEquipmentProfiles(client) {
  return (0, import_transport18.getParsed)(
    client,
    (0, import_transport17.toClientPath)("/equipment-profiles"),
    (data) => import_brewery_contracts9.EquipmentProfilesListResponseSchema.parse(data)
  );
}
async function createEquipmentProfile(client, body) {
  const parsedBody = import_brewery_contracts9.EquipmentProfileCreateRequestSchema.parse(body);
  return (0, import_transport18.postParsed)(
    client,
    (0, import_transport17.toClientPath)("/equipment-profiles"),
    parsedBody,
    (data) => import_brewery_contracts9.EquipmentProfileResponseSchema.parse(data)
  );
}
async function patchEquipmentProfile(client, profileId, body) {
  const parsedBody = import_brewery_contracts9.EquipmentProfilePatchRequestSchema.parse(body);
  return (0, import_transport18.patchParsed)(
    client,
    (0, import_transport17.toClientPath)(`/equipment-profiles/${encodeURIComponent(profileId)}`),
    parsedBody,
    (data) => import_brewery_contracts9.EquipmentProfileResponseSchema.parse(data)
  );
}
async function deleteEquipmentProfile(client, profileId) {
  return (0, import_transport18.deleteParsed)(
    client,
    (0, import_transport17.toClientPath)(`/equipment-profiles/${encodeURIComponent(profileId)}`),
    (data) => import_brewery_contracts9.OkResponseSchema.parse(data)
  );
}

// src/brewdaySettings.ts
var import_brewery_contracts10 = require("@umbraculum/brewery-contracts");
var import_transport19 = require("@umbraculum/api-client/transport");
var import_transport20 = require("@umbraculum/api-client/transport");
async function getBrewdaySettings(client) {
  return (0, import_transport20.getParsed)(
    client,
    (0, import_transport19.toClientPath)("/brewday-settings"),
    (data) => import_brewery_contracts10.BrewdaySettingsResponseSchema.parse(data)
  );
}
async function patchBrewdaySettings(client, body) {
  const parsedBody = import_brewery_contracts10.BrewdaySettingsPatchRequestSchema.parse(body);
  return (0, import_transport20.patchParsed)(
    client,
    (0, import_transport19.toClientPath)("/brewday-settings"),
    parsedBody,
    (data) => import_brewery_contracts10.BrewdaySettingsResponseSchema.parse(data)
  );
}

// src/water.ts
var import_brewery_contracts11 = require("@umbraculum/brewery-contracts");
var import_transport21 = require("@umbraculum/api-client/transport");
var import_transport22 = require("@umbraculum/api-client/transport");
async function getRecipeWaterHubSummary(client, recipeId) {
  return (0, import_transport22.getParsed)(
    client,
    (0, import_transport21.toClientPath)(`/recipes/${encodeURIComponent(recipeId)}/water-hub-summary`),
    import_brewery_contracts11.parseRecipeWaterHubSummaryResponse
  );
}

// src/waterCalc.ts
var import_brewery_contracts12 = require("@umbraculum/brewery-contracts");
var import_transport23 = require("@umbraculum/api-client/transport");
var import_transport24 = require("@umbraculum/api-client/transport");
function postWithDerivation(client, path, payload) {
  return (0, import_transport24.postParsed)(
    client,
    (0, import_transport23.toClientPath)(path),
    payload,
    (data) => import_brewery_contracts12.WaterCalcWithDerivationResponseSchema.parse(data)
  );
}
function postResultOnly(client, path, payload) {
  return (0, import_transport24.postParsed)(
    client,
    (0, import_transport23.toClientPath)(path),
    payload,
    (data) => import_brewery_contracts12.WaterCalcResultOnlyResponseSchema.parse(data)
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
var import_brewery_contracts13 = require("@umbraculum/brewery-contracts");
var import_transport25 = require("@umbraculum/api-client/transport");
var import_transport26 = require("@umbraculum/api-client/transport");
async function computeAndSaveMash(client, recipeId, payload) {
  return (0, import_transport26.postParsed)(
    client,
    (0, import_transport25.toClientPath)(`/recipes/${encodeURIComponent(recipeId)}/water-settings/mash/compute-and-save`),
    payload,
    import_brewery_contracts13.parseMashComputeAndSaveResponse
  );
}
async function computeAndSaveSparge(client, recipeId, payload) {
  return (0, import_transport26.postParsed)(
    client,
    (0, import_transport25.toClientPath)(`/recipes/${encodeURIComponent(recipeId)}/water-settings/sparge/compute-and-save`),
    payload,
    import_brewery_contracts13.parseSpargeComputeAndSaveResponse
  );
}
async function computeAndSaveBoil(client, recipeId, payload) {
  return (0, import_transport26.postParsed)(
    client,
    (0, import_transport25.toClientPath)(`/recipes/${encodeURIComponent(recipeId)}/water-settings/boil/compute-and-save`),
    payload,
    import_brewery_contracts13.parseBoilComputeAndSaveResponse
  );
}

// src/waterProfiles.ts
var import_brewery_contracts14 = require("@umbraculum/brewery-contracts");
var import_transport27 = require("@umbraculum/api-client/transport");
var import_transport28 = require("@umbraculum/api-client/transport");
async function listWaterProfiles(client) {
  return (0, import_transport28.getParsed)(client, (0, import_transport27.toClientPath)("/water-profiles"), import_brewery_contracts14.parseWaterProfilesResponse);
}
async function createWaterProfile(client, body) {
  const parsedBody = import_brewery_contracts14.WaterProfileCreateRequestSchema.parse(body);
  return (0, import_transport28.postParsed)(
    client,
    (0, import_transport27.toClientPath)("/water-profiles"),
    parsedBody,
    (data) => import_brewery_contracts14.WaterProfileResponseSchema.parse(data)
  );
}
async function verifyWaterProfile(client, profileId) {
  return (0, import_transport28.postParsed)(
    client,
    (0, import_transport27.toClientPath)(`/water-profiles/${encodeURIComponent(profileId)}/verify`),
    {},
    (data) => import_brewery_contracts14.OkResponseSchema.parse(data)
  );
}
async function unverifyWaterProfile(client, profileId) {
  return (0, import_transport28.postParsed)(
    client,
    (0, import_transport27.toClientPath)(`/water-profiles/${encodeURIComponent(profileId)}/unverify`),
    {},
    (data) => import_brewery_contracts14.OkResponseSchema.parse(data)
  );
}
async function deleteWaterProfile(client, profileId) {
  return (0, import_transport28.deleteParsed)(
    client,
    (0, import_transport27.toClientPath)(`/water-profiles/${encodeURIComponent(profileId)}`),
    (data) => import_brewery_contracts14.OkResponseSchema.parse(data)
  );
}

// src/waterSettings.ts
var import_brewery_contracts15 = require("@umbraculum/brewery-contracts");
var import_transport29 = require("@umbraculum/api-client/transport");
var import_transport30 = require("@umbraculum/api-client/transport");
async function getRecipeWaterSettings(client, recipeId) {
  return (0, import_transport30.getParsed)(
    client,
    (0, import_transport29.toClientPath)(`/recipes/${encodeURIComponent(recipeId)}/water-settings`),
    (data) => import_brewery_contracts15.RecipeWaterSettingsGetResponseSchema.parse(data)
  );
}
async function updateRecipeWaterSettings(client, recipeId, patch) {
  return (0, import_transport30.putParsed)(
    client,
    (0, import_transport29.toClientPath)(`/recipes/${encodeURIComponent(recipeId)}/water-settings`),
    patch,
    (data) => import_brewery_contracts15.RecipeWaterSettingsPutResponseSchema.parse(data)
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
