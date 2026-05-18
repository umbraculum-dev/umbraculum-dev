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
  analysisFormatHints: () => analysisFormatHints,
  parseAuthMeResponse: () => parseAuthMeResponse,
  parseBoilComputeAndSaveResponse: () => parseBoilComputeAndSaveResponse,
  parseGravityAnalysisResponseV1: () => parseGravityAnalysisResponseV1,
  parseMashComputeAndSaveResponse: () => parseMashComputeAndSaveResponse,
  parseRecipeWaterHubSummaryResponse: () => parseRecipeWaterHubSummaryResponse,
  parseSpargeComputeAndSaveResponse: () => parseSpargeComputeAndSaveResponse,
  parseWaterProfileItem: () => parseWaterProfileItem,
  parseWaterProfilesResponse: () => parseWaterProfilesResponse,
  waterFormatHints: () => waterFormatHints
});
module.exports = __toCommonJS(index_exports);

// src/auth/meResponse.ts
function isString(v) {
  return typeof v === "string";
}
function isObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}
function parseUser(v) {
  if (!isObject(v)) throw new Error("Invalid AuthMeResponse.user");
  const id = isString(v["id"]) ? v["id"] : "";
  const email = isString(v["email"]) ? v["email"] : "";
  const preferredLocale = isString(v["preferredLocale"]) ? v["preferredLocale"] : "en";
  if (!id || !email) throw new Error("Invalid AuthMeResponse.user: id and email required");
  return {
    id,
    email,
    preferredLocale,
    preferredTheme: v["preferredTheme"] === null ? null : isString(v["preferredTheme"]) ? v["preferredTheme"] : void 0,
    preferredFontScale: v["preferredFontScale"] === null ? null : isString(v["preferredFontScale"]) ? v["preferredFontScale"] : void 0,
    preferredDensity: v["preferredDensity"] === null ? null : isString(v["preferredDensity"]) ? v["preferredDensity"] : void 0,
    isPlatformAdmin: typeof v["isPlatformAdmin"] === "boolean" ? v["isPlatformAdmin"] : void 0
  };
}
function parseWorkspace(v) {
  if (!isObject(v)) throw new Error("Invalid AuthMeResponse.workspaces item");
  const id = isString(v["id"]) ? v["id"] : "";
  const name = isString(v["name"]) ? v["name"] : "";
  const role = isString(v["role"]) ? v["role"] : "";
  if (!id || !name) throw new Error("Invalid AuthMeResponse.workspaces item: id and name required");
  return {
    id,
    name,
    role,
    brandKey: v["brandKey"] === null ? null : isString(v["brandKey"]) ? v["brandKey"] : void 0
  };
}
function parseAuthMeResponse(payload) {
  if (!isObject(payload)) throw new Error("Invalid AuthMeResponse: expected object");
  if (payload["ok"] !== true) throw new Error("Invalid AuthMeResponse: ok must be true");
  const user = parseUser(payload["user"]);
  const workspacesRaw = Array.isArray(payload["workspaces"]) ? payload["workspaces"] : Array.isArray(payload["accounts"]) ? payload["accounts"] : null;
  if (!workspacesRaw) throw new Error("Invalid AuthMeResponse: workspaces must be array");
  const workspaces = workspacesRaw.map((a, i) => {
    try {
      return parseWorkspace(a);
    } catch (e) {
      throw new Error("Invalid AuthMeResponse.workspaces[" + i + "]: " + (e instanceof Error ? e.message : String(e)));
    }
  });
  const activeWorkspaceId = payload["activeWorkspaceId"] === null ? null : isString(payload["activeWorkspaceId"]) ? payload["activeWorkspaceId"] : payload["activeAccountId"] === null ? null : isString(payload["activeAccountId"]) ? payload["activeAccountId"] : null;
  const role = payload["role"] === null ? null : isString(payload["role"]) ? payload["role"] : null;
  return { ok: true, user, workspaces, activeWorkspaceId, role };
}

// src/water/parseHubSummary.ts
function isFiniteNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function parseIonProfilePpm(v) {
  if (!v || typeof v !== "object") return null;
  const o = v;
  const keys = ["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"];
  for (const k of keys) if (!isFiniteNumber(o[k])) return null;
  return {
    calcium: o["calcium"],
    magnesium: o["magnesium"],
    sodium: o["sodium"],
    sulfate: o["sulfate"],
    chloride: o["chloride"],
    bicarbonate: o["bicarbonate"]
  };
}
function parseExpectedRaRange(v) {
  if (!v || typeof v !== "object") return null;
  const o = v;
  const rationaleKey = o["rationaleKey"] === "styleExpectedRaDark" || o["rationaleKey"] === "styleExpectedRaPale" || o["rationaleKey"] === "styleExpectedRaAmber" ? o["rationaleKey"] : null;
  if (!rationaleKey) return null;
  if (!isFiniteNumber(o["min"]) || !isFiniteNumber(o["max"])) return null;
  return { min: o["min"], max: o["max"], rationaleKey };
}
function parseStream(v) {
  if (!v || typeof v !== "object") return null;
  const o = v;
  const key = o["key"] === "mash" || o["key"] === "sparge" || o["key"] === "boil" ? o["key"] : null;
  if (!key) return null;
  const volumeLiters = o["volumeLiters"] === null ? null : isFiniteNumber(o["volumeLiters"]) ? o["volumeLiters"] : null;
  const ph = o["ph"] === null ? null : isFiniteNumber(o["ph"]) ? o["ph"] : null;
  const finalAlkalinityPpmCaCO3 = o["finalAlkalinityPpmCaCO3"] === null ? null : isFiniteNumber(o["finalAlkalinityPpmCaCO3"]) ? o["finalAlkalinityPpmCaCO3"] : null;
  const ionsPpm = parseIonProfilePpm(o["ionsPpm"]);
  const saltsBreakdown = (() => {
    if (o["saltsBreakdown"] === null) return null;
    if (!Array.isArray(o["saltsBreakdown"])) return null;
    const rows = [];
    for (const row of o["saltsBreakdown"]) {
      if (!row || typeof row !== "object") continue;
      const r = row;
      const saltKey = typeof r["saltKey"] === "string" ? r["saltKey"] : null;
      const grams = isFiniteNumber(r["grams"]) ? r["grams"] : null;
      if (!saltKey || grams === null) continue;
      rows.push({ saltKey, grams });
    }
    return rows.length ? rows : null;
  })();
  const acidType = typeof o["acidType"] === "string" ? o["acidType"] : o["acidType"] === null ? null : null;
  const acidMode = o["acidMode"] === "manual" || o["acidMode"] === "required" ? o["acidMode"] : null;
  const acidStrengthKind = typeof o["acidStrengthKind"] === "string" ? o["acidStrengthKind"] : o["acidStrengthKind"] === null ? null : null;
  const acidStrengthValue = o["acidStrengthValue"] === null ? null : isFiniteNumber(o["acidStrengthValue"]) ? o["acidStrengthValue"] : null;
  const acidAmountMl = o["acidAmountMl"] === null ? null : isFiniteNumber(o["acidAmountMl"]) ? o["acidAmountMl"] : null;
  const acidAmountGrams = o["acidAmountGrams"] === null ? null : isFiniteNumber(o["acidAmountGrams"]) ? o["acidAmountGrams"] : null;
  return {
    key,
    volumeLiters,
    ph,
    finalAlkalinityPpmCaCO3,
    ionsPpm,
    saltsBreakdown,
    acidType,
    acidMode,
    acidStrengthKind,
    acidStrengthValue,
    acidAmountMl,
    acidAmountGrams
  };
}
function parseRecipeWaterHubSummaryResponse(x) {
  const root = x ?? {};
  if (!root || typeof root !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse");
  if (root["ok"] !== true) throw new Error("Invalid RecipeWaterHubSummaryResponse.ok");
  const s = root["summary"];
  if (!s || typeof s !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary");
  const version = s["version"] === 1 ? 1 : null;
  if (version === null) throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.version");
  const status = s["status"] ?? null;
  if (!status || typeof status !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.status");
  const statusObj = status;
  const mashOverallSnapshot = (() => {
    const v = statusObj["mashOverallSnapshot"];
    if (v === null) return null;
    if (!v || typeof v !== "object") return null;
    const o = v;
    const ph = o["ph"];
    const kind = ph?.["kind"] === "target" || ph?.["kind"] === "estimated" ? ph["kind"] : null;
    const value = isFiniteNumber(ph?.["value"]) ? ph["value"] : null;
    const finalAlk = isFiniteNumber(o["finalAlkalinityPpmCaCO3"]) ? o["finalAlkalinityPpmCaCO3"] : null;
    if (!kind || value === null || finalAlk === null) return null;
    return { ph: { kind, value }, finalAlkalinityPpmCaCO3: finalAlk };
  })();
  const sObj = s;
  const streams = Array.isArray(sObj["streams"]) ? sObj["streams"].map(parseStream).filter(Boolean) : [];
  const merged = sObj["merged"] ?? null;
  if (!merged || typeof merged !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.merged");
  const mergedIons = parseIonProfilePpm(merged["ionsPpm"]);
  const mergedPh = merged["ph"] === null ? null : isFiniteNumber(merged["ph"]) ? merged["ph"] : null;
  const mergedFinalAlk = merged["finalAlkalinityPpmCaCO3"] === null ? null : isFiniteNumber(merged["finalAlkalinityPpmCaCO3"]) ? merged["finalAlkalinityPpmCaCO3"] : null;
  const totalVolumeLiters = isFiniteNumber(merged["totalVolumeLiters"]) ? merged["totalVolumeLiters"] : 0;
  const finalRecap = sObj["finalRecap"] ?? null;
  if (!finalRecap || typeof finalRecap !== "object") throw new Error("Invalid RecipeWaterHubSummaryResponse.summary.finalRecap");
  const predictedMashPh = (() => {
    const v = finalRecap["predictedMashPh"];
    if (v === null) return null;
    if (!v || typeof v !== "object") return null;
    const o = v;
    const kind = o["kind"] === "target" || o["kind"] === "estimated" ? o["kind"] : null;
    const value = isFiniteNumber(o["value"]) ? o["value"] : null;
    if (!kind || value === null) return null;
    return { kind, value };
  })();
  const formatHints = root["formatHints"] && typeof root["formatHints"] === "object" && !Array.isArray(root["formatHints"]) ? root["formatHints"] : void 0;
  return {
    ok: true,
    summary: {
      version,
      status: {
        mashAcidificationMode: typeof statusObj["mashAcidificationMode"] === "string" ? statusObj["mashAcidificationMode"] : null,
        spargeAcidificationMode: typeof statusObj["spargeAcidificationMode"] === "string" ? statusObj["spargeAcidificationMode"] : null,
        boilAcidificationMode: typeof statusObj["boilAcidificationMode"] === "string" ? statusObj["boilAcidificationMode"] : null,
        mashLastCalculatedAt: typeof statusObj["mashLastCalculatedAt"] === "string" ? statusObj["mashLastCalculatedAt"] : null,
        spargeLastCalculatedAt: typeof statusObj["spargeLastCalculatedAt"] === "string" ? statusObj["spargeLastCalculatedAt"] : null,
        boilLastCalculatedAt: typeof statusObj["boilLastCalculatedAt"] === "string" ? statusObj["boilLastCalculatedAt"] : null,
        mashOverallSnapshot
      },
      streams,
      merged: {
        totalVolumeLiters,
        ph: mergedPh,
        finalAlkalinityPpmCaCO3: mergedFinalAlk,
        ionsPpm: mergedIons
      },
      finalRecap: {
        predictedMashPh,
        residualAlkalinityMashOverallPpmCaCO3: isFiniteNumber(finalRecap["residualAlkalinityMashOverallPpmCaCO3"]) ? finalRecap["residualAlkalinityMashOverallPpmCaCO3"] : finalRecap["residualAlkalinityMashOverallPpmCaCO3"] === null ? null : null,
        residualAlkalinityMergedPpmCaCO3: isFiniteNumber(finalRecap["residualAlkalinityMergedPpmCaCO3"]) ? finalRecap["residualAlkalinityMergedPpmCaCO3"] : finalRecap["residualAlkalinityMergedPpmCaCO3"] === null ? null : null,
        styleExpectedRa: parseExpectedRaRange(finalRecap["styleExpectedRa"])
      }
    },
    formatHints
  };
}

// src/water/waterProfile.ts
function isString2(v) {
  return typeof v === "string";
}
function isNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function isObject2(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}
var SCOPES = ["system", "account", "public"];
var TYPES = ["water", "dilution"];
var VERIFICATION_STATUSES = ["verified", "unverified"];
function parseWaterProfile(v) {
  if (!isObject2(v)) throw new Error("Invalid WaterProfile: expected object");
  const id = isString2(v["id"]) ? v["id"] : "";
  const key = isString2(v["key"]) ? v["key"] : "";
  const scope = isString2(v["scope"]) && SCOPES.includes(v["scope"]) ? v["scope"] : "system";
  const type = isString2(v["type"]) && TYPES.includes(v["type"]) ? v["type"] : "water";
  const workspaceId = v["workspaceId"] === null ? null : isString2(v["workspaceId"]) ? v["workspaceId"] : v["accountId"] === null ? null : isString2(v["accountId"]) ? v["accountId"] : null;
  const name = isString2(v["name"]) ? v["name"] : "";
  const ph = v["ph"] === null || v["ph"] === void 0 ? void 0 : isNumber(v["ph"]) ? v["ph"] : void 0;
  const calcium = isNumber(v["calcium"]) ? v["calcium"] : 0;
  const magnesium = isNumber(v["magnesium"]) ? v["magnesium"] : 0;
  const sodium = isNumber(v["sodium"]) ? v["sodium"] : 0;
  const sulfate = isNumber(v["sulfate"]) ? v["sulfate"] : 0;
  const chloride = isNumber(v["chloride"]) ? v["chloride"] : 0;
  const bicarbonate = isNumber(v["bicarbonate"]) ? v["bicarbonate"] : 0;
  const verificationStatus = isString2(v["verificationStatus"]) && VERIFICATION_STATUSES.includes(v["verificationStatus"]) ? v["verificationStatus"] : "unverified";
  const source = isString2(v["source"]) ? v["source"] : "";
  if (!id || !key || !name) throw new Error("Invalid WaterProfile: id, key, name required");
  return {
    id,
    key,
    scope,
    type,
    workspaceId,
    name,
    ph,
    calcium,
    magnesium,
    sodium,
    sulfate,
    chloride,
    bicarbonate,
    verificationStatus,
    source
  };
}
function parseWaterProfileItem(payload) {
  return parseWaterProfile(payload);
}
function parseArray(v, parse) {
  if (!Array.isArray(v)) throw new Error("Expected array");
  return v.map((x, i) => {
    try {
      return parse(x);
    } catch (e) {
      throw new Error("Invalid array item[" + i + "]: " + (e instanceof Error ? e.message : String(e)));
    }
  });
}
function parseWaterProfilesResponse(payload) {
  if (!isObject2(payload)) throw new Error("Invalid WaterProfilesResponse: expected object");
  if (payload["ok"] !== true) throw new Error("Invalid WaterProfilesResponse: ok must be true");
  const system = parseArray(payload["system"], parseWaterProfile);
  const publicProfiles = parseArray(payload["public"], parseWaterProfile);
  const workspaceRaw = Array.isArray(payload["workspace"]) ? payload["workspace"] : Array.isArray(payload["account"]) ? payload["account"] : null;
  if (!workspaceRaw) throw new Error("Invalid WaterProfilesResponse: workspace must be array");
  const workspace = parseArray(workspaceRaw, parseWaterProfile);
  return { ok: true, system, public: publicProfiles, workspace };
}

// src/water/parseComputeAndSave.ts
function isFiniteNumber2(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function isObject3(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}
function parseIonProfilePpm2(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const keys = ["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"];
  for (const k of keys) {
    if (!isFiniteNumber2(v[k])) throw new Error(`Invalid ${label}.${String(k)}`);
  }
  return {
    calcium: v["calcium"],
    magnesium: v["magnesium"],
    sodium: v["sodium"],
    sulfate: v["sulfate"],
    chloride: v["chloride"],
    bicarbonate: v["bicarbonate"]
  };
}
function parseDerivationValue(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  if (v["kind"] === "number") {
    if (!isFiniteNumber2(v["value"])) throw new Error(`Invalid ${label}.value`);
    const unit = typeof v["unit"] === "string" ? v["unit"] : void 0;
    return unit ? { kind: "number", value: v["value"], unit } : { kind: "number", value: v["value"] };
  }
  if (v["kind"] === "string") {
    if (typeof v["value"] !== "string") throw new Error(`Invalid ${label}.value`);
    return { kind: "string", value: v["value"] };
  }
  if (v["kind"] === "boolean") {
    if (typeof v["value"] !== "boolean") throw new Error(`Invalid ${label}.value`);
    return { kind: "boolean", value: v["value"] };
  }
  if (v["kind"] === "null") return { kind: "null" };
  throw new Error(`Invalid ${label}.kind`);
}
function parseDerivationLine(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const id = typeof v["id"] === "string" ? v["id"] : "";
  if (!id) throw new Error(`Invalid ${label}.id`);
  return { id, value: parseDerivationValue(v["value"], `${label}.value`) };
}
function parseDerivation(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const kind = typeof v["kind"] === "string" ? v["kind"] : "";
  if (!kind) throw new Error(`Invalid ${label}.kind`);
  if (v["version"] !== 1) throw new Error(`Invalid ${label}.version`);
  const formulaId = typeof v["formulaId"] === "string" ? v["formulaId"] : "";
  if (!formulaId) throw new Error(`Invalid ${label}.formulaId`);
  const inputs = Array.isArray(v["inputs"]) ? v["inputs"].map((x, i) => parseDerivationLine(x, `${label}.inputs[${i}]`)) : [];
  const intermediates = Array.isArray(v["intermediates"]) ? v["intermediates"].map((x, i) => parseDerivationLine(x, `${label}.intermediates[${i}]`)) : [];
  const breakdowns = Array.isArray(v["breakdowns"]) ? v["breakdowns"].filter(
    (b) => isObject3(b) && typeof b["id"] === "string" && Array.isArray(b["rows"])
  ).map((b) => ({
    id: b["id"],
    rows: b["rows"].filter(
      (r) => isObject3(r)
    )
  })) : void 0;
  const notes = Array.isArray(v["notes"]) ? v["notes"].filter((n) => typeof n === "string") : void 0;
  return {
    kind,
    version: 1,
    formulaId,
    inputs,
    intermediates,
    breakdowns,
    notes
  };
}
function parseSettingsSavedRef(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const recipeId = typeof v["recipeId"] === "string" ? v["recipeId"] : "";
  if (!recipeId) throw new Error(`Invalid ${label}.recipeId`);
  return { recipeId };
}
function parseSaltAdditionsResult(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const baseProfile = parseIonProfilePpm2(v["baseProfile"], `${label}.baseProfile`);
  const resultingProfile = parseIonProfilePpm2(v["resultingProfile"], `${label}.resultingProfile`);
  const deltasPpm = parseIonProfilePpm2(v["deltasPpm"], `${label}.deltasPpm`);
  const breakdown = Array.isArray(v["breakdown"]) ? v["breakdown"].filter(
    (r) => isObject3(r) && typeof r["saltKey"] === "string" && isFiniteNumber2(r["grams"])
  ).map((r) => ({
    saltKey: r["saltKey"],
    grams: r["grams"],
    deltasPpm: isObject3(r["deltasPpm"]) ? r["deltasPpm"] : {}
  })) : [];
  return { baseProfile, resultingProfile, deltasPpm, breakdown };
}
function parseAcidificationResult(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const finalAlkalinityPpmCaCO3 = isFiniteNumber2(v["finalAlkalinityPpmCaCO3"]) ? v["finalAlkalinityPpmCaCO3"] : NaN;
  const sulfateAddedPpm = isFiniteNumber2(v["sulfateAddedPpm"]) ? v["sulfateAddedPpm"] : NaN;
  const chlorideAddedPpm = isFiniteNumber2(v["chlorideAddedPpm"]) ? v["chlorideAddedPpm"] : NaN;
  if (!Number.isFinite(finalAlkalinityPpmCaCO3)) throw new Error(`Invalid ${label}.finalAlkalinityPpmCaCO3`);
  if (!Number.isFinite(sulfateAddedPpm)) throw new Error(`Invalid ${label}.sulfateAddedPpm`);
  if (!Number.isFinite(chlorideAddedPpm)) throw new Error(`Invalid ${label}.chlorideAddedPpm`);
  return {
    acidRequiredMl: v["acidRequiredMl"] === null ? null : isFiniteNumber2(v["acidRequiredMl"]) ? v["acidRequiredMl"] : null,
    acidRequiredTsp: v["acidRequiredTsp"] === null ? null : isFiniteNumber2(v["acidRequiredTsp"]) ? v["acidRequiredTsp"] : null,
    acidRequiredGrams: v["acidRequiredGrams"] === null ? null : isFiniteNumber2(v["acidRequiredGrams"]) ? v["acidRequiredGrams"] : null,
    acidRequiredKg: v["acidRequiredKg"] === null ? null : isFiniteNumber2(v["acidRequiredKg"]) ? v["acidRequiredKg"] : null,
    finalAlkalinityPpmCaCO3,
    sulfateAddedPpm,
    chlorideAddedPpm,
    debug: isObject3(v["debug"]) ? v["debug"] : void 0
  };
}
function parseAcidificationManualResult(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const achievedPh = isFiniteNumber2(v["achievedPh"]) ? v["achievedPh"] : NaN;
  if (!Number.isFinite(achievedPh)) throw new Error(`Invalid ${label}.achievedPh`);
  const clamped = v["clamped"] === "none" || v["clamped"] === "low" || v["clamped"] === "high" ? v["clamped"] : "none";
  const iterations = isFiniteNumber2(v["iterations"]) ? v["iterations"] : 0;
  const targetAmount = isFiniteNumber2(v["targetAmount"]) ? v["targetAmount"] : NaN;
  const predictedAmount = isFiniteNumber2(v["predictedAmount"]) ? v["predictedAmount"] : NaN;
  return {
    achievedPh,
    predicted: parseAcidificationResult(v["predicted"], `${label}.predicted`),
    clamped,
    iterations,
    targetAmount,
    predictedAmount
  };
}
function parseMashTargetMashPhResult(v, label) {
  const base = parseAcidificationResult(v, label);
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const estimatedMashPhRoomTemp = isFiniteNumber2(v["estimatedMashPhRoomTemp"]) ? v["estimatedMashPhRoomTemp"] : NaN;
  if (!Number.isFinite(estimatedMashPhRoomTemp)) throw new Error(`Invalid ${label}.estimatedMashPhRoomTemp`);
  return { ...base, estimatedMashPhRoomTemp };
}
function parseOverallResult(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const calculatedAt = typeof v["calculatedAt"] === "string" ? v["calculatedAt"] : "";
  if (!calculatedAt) throw new Error(`Invalid ${label}.calculatedAt`);
  const ionsPpm = parseIonProfilePpm2(v["ionsPpm"], `${label}.ionsPpm`);
  const finalAlkalinityPpmCaCO3 = isFiniteNumber2(v["finalAlkalinityPpmCaCO3"]) ? v["finalAlkalinityPpmCaCO3"] : NaN;
  if (!Number.isFinite(finalAlkalinityPpmCaCO3)) throw new Error(`Invalid ${label}.finalAlkalinityPpmCaCO3`);
  const ph = isObject3(v["ph"]) ? v["ph"] : null;
  const kind = ph?.["kind"] === "target" || ph?.["kind"] === "estimated" ? ph["kind"] : null;
  const value = isFiniteNumber2(ph?.["value"]) ? ph["value"] : null;
  if (!kind || value === null) throw new Error(`Invalid ${label}.ph`);
  return {
    calculatedAt,
    ionsPpm,
    finalAlkalinityPpmCaCO3,
    ph: { kind, value },
    debug: isObject3(v["debug"]) ? v["debug"] : void 0
  };
}
function parseMashAcidBlock(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const kind = v["kind"];
  if (kind === "mash_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(v["result"], `${label}.result`),
      derivation: parseDerivation(v["derivation"], `${label}.derivation`)
    };
  }
  if (kind === "mash_acidification_target_mash_ph") {
    return {
      kind,
      mode: "targetPh",
      result: parseMashTargetMashPhResult(v["result"], `${label}.result`),
      derivation: parseDerivation(v["derivation"], `${label}.derivation`)
    };
  }
  if (kind === "mash_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(v["result"], `${label}.result`),
      derivation: parseDerivation(v["derivation"], `${label}.derivation`)
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}
function parseSpargeAcidBlock(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const kind = v["kind"];
  if (kind === "sparge_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(v["result"], `${label}.result`),
      derivation: parseDerivation(v["derivation"], `${label}.derivation`)
    };
  }
  if (kind === "sparge_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(v["result"], `${label}.result`),
      derivation: parseDerivation(v["derivation"], `${label}.derivation`)
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}
function parseBoilAcidBlock(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  const kind = v["kind"];
  if (kind === "boil_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(v["result"], `${label}.result`),
      derivation: parseDerivation(v["derivation"], `${label}.derivation`)
    };
  }
  if (kind === "boil_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(v["result"], `${label}.result`),
      derivation: parseDerivation(v["derivation"], `${label}.derivation`)
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}
function parseNumberFormatHintV1(v, label) {
  if (!isObject3(v)) throw new Error(`Invalid ${label}`);
  if (v["version"] !== 1) throw new Error(`Invalid ${label}.version`);
  const style = v["style"] === "fixed" || v["style"] === "significant" ? v["style"] : null;
  if (!style) throw new Error(`Invalid ${label}.style`);
  const decimals = isFiniteNumber2(v["decimals"]) ? v["decimals"] : NaN;
  if (!Number.isFinite(decimals) || decimals < 0) throw new Error(`Invalid ${label}.decimals`);
  const unitRaw = typeof v["unit"] === "string" ? v["unit"] : void 0;
  const clamp = isObject3(v["clamp"]) ? {
    min: isFiniteNumber2(v["clamp"]["min"]) ? v["clamp"]["min"] : void 0,
    max: isFiniteNumber2(v["clamp"]["max"]) ? v["clamp"]["max"] : void 0
  } : void 0;
  return { version: 1, style, decimals, unit: unitRaw, clamp };
}
function parseFormatHints(root) {
  const hintsOut = {};
  const h = root["formatHints"];
  if (isObject3(h)) {
    for (const [k, val] of Object.entries(h)) {
      try {
        hintsOut[k] = parseNumberFormatHintV1(val, `formatHints.${k}`);
      } catch {
      }
    }
  }
  return hintsOut;
}
function parseMashComputeAndSaveResponse(x) {
  if (!isObject3(x)) throw new Error("Invalid MashComputeAndSaveResponseV1");
  if (x["ok"] !== true) throw new Error("Invalid MashComputeAndSaveResponseV1.ok");
  if (x["version"] !== 1) throw new Error("Invalid MashComputeAndSaveResponseV1.version");
  const salts = isObject3(x["salts"]) ? x["salts"] : {};
  const acid = x["acid"];
  const overall = isObject3(x["overall"]) ? x["overall"] : {};
  const formatHints = parseFormatHints(x);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(x["settings"], "MashComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts["result"], "MashComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts["derivation"], "MashComputeAndSaveResponseV1.salts.derivation")
    },
    acid: parseMashAcidBlock(acid, "MashComputeAndSaveResponseV1.acid"),
    overall: {
      result: parseOverallResult(overall["result"], "MashComputeAndSaveResponseV1.overall.result"),
      derivation: parseDerivation(overall["derivation"], "MashComputeAndSaveResponseV1.overall.derivation")
    },
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : void 0
  };
}
function parseSpargeComputeAndSaveResponse(x) {
  if (!isObject3(x)) throw new Error("Invalid SpargeComputeAndSaveResponseV1");
  if (x["ok"] !== true) throw new Error("Invalid SpargeComputeAndSaveResponseV1.ok");
  if (x["version"] !== 1) throw new Error("Invalid SpargeComputeAndSaveResponseV1.version");
  const salts = isObject3(x["salts"]) ? x["salts"] : {};
  const acid = x["acid"];
  const formatHints = parseFormatHints(x);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(x["settings"], "SpargeComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts["result"], "SpargeComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts["derivation"], "SpargeComputeAndSaveResponseV1.salts.derivation")
    },
    acid: parseSpargeAcidBlock(acid, "SpargeComputeAndSaveResponseV1.acid"),
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : void 0
  };
}
function parseBoilComputeAndSaveResponse(x) {
  if (!isObject3(x)) throw new Error("Invalid BoilComputeAndSaveResponseV1");
  if (x["ok"] !== true) throw new Error("Invalid BoilComputeAndSaveResponseV1.ok");
  if (x["version"] !== 1) throw new Error("Invalid BoilComputeAndSaveResponseV1.version");
  const salts = isObject3(x["salts"]) ? x["salts"] : {};
  const acid = x["acid"];
  const overall = isObject3(x["overall"]) ? x["overall"] : {};
  const formatHints = parseFormatHints(x);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(x["settings"], "BoilComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts["result"], "BoilComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts["derivation"], "BoilComputeAndSaveResponseV1.salts.derivation")
    },
    acid: parseBoilAcidBlock(acid, "BoilComputeAndSaveResponseV1.acid"),
    overall: {
      result: parseOverallResult(overall["result"], "BoilComputeAndSaveResponseV1.overall.result"),
      derivation: parseDerivation(overall["derivation"], "BoilComputeAndSaveResponseV1.overall.derivation")
    },
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : void 0
  };
}

// src/format/formatHints.ts
function hintFixed(args) {
  return { version: 1, style: "fixed", decimals: args.decimals, unit: args.unit, clamp: args.clamp };
}
var waterFormatHints = {
  L: hintFixed({ decimals: 2, unit: "L" }),
  pH: hintFixed({ decimals: 2, unit: "pH" }),
  ppm_as_CaCO3: hintFixed({ decimals: 0, unit: "ppm_as_CaCO3" }),
  ppm: hintFixed({ decimals: 0, unit: "ppm" }),
  g: hintFixed({ decimals: 0, unit: "g" }),
  mL: hintFixed({ decimals: 0, unit: "mL" }),
  kg: hintFixed({ decimals: 2, unit: "kg" })
};
var analysisFormatHints = {
  boilTimeMinutes: hintFixed({ decimals: 0, unit: "min" }),
  kettleVolumeLiters: hintFixed({ decimals: 2, unit: "L" }),
  preBoilVolumeLiters: hintFixed({ decimals: 2, unit: "L" }),
  ogEstimatedSg: hintFixed({ decimals: 3, unit: "sg" }),
  pbgEstimatedSg: hintFixed({ decimals: 3, unit: "sg" }),
  fgEstimatedSg: hintFixed({ decimals: 3, unit: "sg" }),
  abvEstimatedPercent: hintFixed({ decimals: 2, unit: "percent" }),
  attenuationEffectivePercent: hintFixed({ decimals: 1, unit: "percent", clamp: { min: 0, max: 100 } }),
  ibuTinsethEstimated: hintFixed({ decimals: 1, unit: "ibu", clamp: { min: 0 } }),
  ibuRagerEstimated: hintFixed({ decimals: 1, unit: "ibu", clamp: { min: 0 } }),
  buGuRatio: hintFixed({ decimals: 2, clamp: { min: 0 } }),
  colorSrmMoreyEstimated: hintFixed({ decimals: 1, unit: "srm", clamp: { min: 0 } }),
  colorSrmDanielsEstimated: hintFixed({ decimals: 1, unit: "srm", clamp: { min: 0 } })
};

// src/analysis/parseGravityAnalysis.ts
function isFiniteNumber3(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function isObject4(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}
function parseCanonicalModels(v) {
  const o = isObject4(v) ? v : null;
  const ibu = o?.["ibu"] === "tinseth" || o?.["ibu"] === "rager" ? o["ibu"] : "tinseth";
  const srm = o?.["srm"] === "morey" || o?.["srm"] === "daniels" ? o["srm"] : "morey";
  return { ibu, srm };
}
function parseNumberFormatHintV12(v, label) {
  if (!isObject4(v)) throw new Error(`Invalid ${label}`);
  if (v["version"] !== 1) throw new Error(`Invalid ${label}.version`);
  const style = v["style"] === "fixed" || v["style"] === "significant" ? v["style"] : null;
  if (!style) throw new Error(`Invalid ${label}.style`);
  const decimals = isFiniteNumber3(v["decimals"]) ? v["decimals"] : NaN;
  if (!Number.isFinite(decimals) || decimals < 0) throw new Error(`Invalid ${label}.decimals`);
  const unit = typeof v["unit"] === "string" ? v["unit"] : void 0;
  const clamp = isObject4(v["clamp"]) ? {
    min: isFiniteNumber3(v["clamp"]["min"]) ? v["clamp"]["min"] : void 0,
    max: isFiniteNumber3(v["clamp"]["max"]) ? v["clamp"]["max"] : void 0
  } : void 0;
  return { version: 1, style, decimals, unit, clamp };
}
function parseDerivationLineValue(v, label) {
  if (!isObject4(v)) throw new Error(`Invalid ${label}`);
  if (v["kind"] === "number") {
    if (!isFiniteNumber3(v["value"])) throw new Error(`Invalid ${label}.value`);
    const unit = typeof v["unit"] === "string" ? v["unit"] : void 0;
    return unit ? { kind: "number", value: v["value"], unit } : { kind: "number", value: v["value"] };
  }
  if (v["kind"] === "string") {
    if (typeof v["value"] !== "string") throw new Error(`Invalid ${label}.value`);
    return { kind: "string", value: v["value"] };
  }
  if (v["kind"] === "boolean") {
    if (typeof v["value"] !== "boolean") throw new Error(`Invalid ${label}.value`);
    return { kind: "boolean", value: v["value"] };
  }
  if (v["kind"] === "null") return { kind: "null" };
  throw new Error(`Invalid ${label}.kind`);
}
function parseDerivation2(v, label) {
  if (!isObject4(v)) throw new Error(`Invalid ${label}`);
  if (typeof v["kind"] !== "string" || !v["kind"]) throw new Error(`Invalid ${label}.kind`);
  if (v["version"] !== 1) throw new Error(`Invalid ${label}.version`);
  if (typeof v["formulaId"] !== "string" || !v["formulaId"]) throw new Error(`Invalid ${label}.formulaId`);
  const parseLine = (x, i, base) => {
    if (!isObject4(x)) throw new Error(`Invalid ${base}[${i}]`);
    if (typeof x["id"] !== "string" || !x["id"]) throw new Error(`Invalid ${base}[${i}].id`);
    return { id: x["id"], value: parseDerivationLineValue(x["value"], `${base}[${i}].value`) };
  };
  const inputs = Array.isArray(v["inputs"]) ? v["inputs"].map((x, i) => parseLine(x, i, `${label}.inputs`)) : [];
  const intermediates = Array.isArray(v["intermediates"]) ? v["intermediates"].map((x, i) => parseLine(x, i, `${label}.intermediates`)) : [];
  return {
    kind: v["kind"],
    version: 1,
    formulaId: v["formulaId"],
    inputs,
    intermediates,
    breakdowns: Array.isArray(v["breakdowns"]) ? v["breakdowns"] : void 0,
    notes: Array.isArray(v["notes"]) ? v["notes"].filter((n) => typeof n === "string") : void 0
  };
}
function parseGravityAnalysisResponseV1(x) {
  if (!isObject4(x)) throw new Error("Invalid GravityAnalysisResponseV1");
  if (x["ok"] !== true) throw new Error("Invalid GravityAnalysisResponseV1.ok");
  if (x["version"] !== 1) throw new Error("Invalid GravityAnalysisResponseV1.version");
  const canonicalModels = parseCanonicalModels(x["canonicalModels"]);
  if (!isObject4(x["result"])) throw new Error("Invalid GravityAnalysisResponseV1.result");
  const r = x["result"];
  const warningsRaw = Array.isArray(r["warnings"]) ? r["warnings"] : [];
  const warnings = warningsRaw.map((w) => isObject4(w) && typeof w["code"] === "string" ? w["code"] : "").filter((c) => Boolean(c)).map((code) => ({ code }));
  const result = {
    boilTimeMinutes: r["boilTimeMinutes"] === null ? null : isFiniteNumber3(r["boilTimeMinutes"]) ? r["boilTimeMinutes"] : null,
    kettleVolumeLiters: r["kettleVolumeLiters"] === null ? null : isFiniteNumber3(r["kettleVolumeLiters"]) ? r["kettleVolumeLiters"] : null,
    preBoilVolumeLiters: r["preBoilVolumeLiters"] === null ? null : isFiniteNumber3(r["preBoilVolumeLiters"]) ? r["preBoilVolumeLiters"] : null,
    ogEstimatedSg: r["ogEstimatedSg"] === null ? null : isFiniteNumber3(r["ogEstimatedSg"]) ? r["ogEstimatedSg"] : null,
    pbgEstimatedSg: r["pbgEstimatedSg"] === null ? null : isFiniteNumber3(r["pbgEstimatedSg"]) ? r["pbgEstimatedSg"] : null,
    ibuTinsethEstimated: r["ibuTinsethEstimated"] === null ? null : isFiniteNumber3(r["ibuTinsethEstimated"]) ? r["ibuTinsethEstimated"] : null,
    ibuRagerEstimated: r["ibuRagerEstimated"] === null ? null : isFiniteNumber3(r["ibuRagerEstimated"]) ? r["ibuRagerEstimated"] : null,
    buGuRatio: r["buGuRatio"] === null ? null : isFiniteNumber3(r["buGuRatio"]) ? r["buGuRatio"] : null,
    colorSrmMoreyEstimated: r["colorSrmMoreyEstimated"] === null ? null : isFiniteNumber3(r["colorSrmMoreyEstimated"]) ? r["colorSrmMoreyEstimated"] : null,
    colorSrmDanielsEstimated: r["colorSrmDanielsEstimated"] === null ? null : isFiniteNumber3(r["colorSrmDanielsEstimated"]) ? r["colorSrmDanielsEstimated"] : null,
    fgEstimatedSg: r["fgEstimatedSg"] === null ? null : isFiniteNumber3(r["fgEstimatedSg"]) ? r["fgEstimatedSg"] : null,
    abvEstimatedPercent: r["abvEstimatedPercent"] === null ? null : isFiniteNumber3(r["abvEstimatedPercent"]) ? r["abvEstimatedPercent"] : null,
    attenuationEffectivePercent: r["attenuationEffectivePercent"] === null ? null : isFiniteNumber3(r["attenuationEffectivePercent"]) ? r["attenuationEffectivePercent"] : null,
    warnings
  };
  const derivationsOut = {};
  if (isObject4(x["derivations"])) {
    for (const [k, val] of Object.entries(x["derivations"])) {
      try {
        derivationsOut[k] = parseDerivation2(val, `GravityAnalysisResponseV1.derivations.${k}`);
      } catch {
      }
    }
  }
  const hintsOut = {};
  if (isObject4(x["formatHints"])) {
    for (const [k, val] of Object.entries(x["formatHints"])) {
      try {
        hintsOut[k] = parseNumberFormatHintV12(val, `GravityAnalysisResponseV1.formatHints.${k}`);
      } catch {
      }
    }
  }
  return {
    ok: true,
    version: 1,
    canonicalModels,
    result,
    derivations: derivationsOut,
    formatHints: hintsOut
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  analysisFormatHints,
  parseAuthMeResponse,
  parseBoilComputeAndSaveResponse,
  parseGravityAnalysisResponseV1,
  parseMashComputeAndSaveResponse,
  parseRecipeWaterHubSummaryResponse,
  parseSpargeComputeAndSaveResponse,
  parseWaterProfileItem,
  parseWaterProfilesResponse,
  waterFormatHints
});
