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
  const id = isString(v.id) ? v.id : "";
  const email = isString(v.email) ? v.email : "";
  const preferredLocale = isString(v.preferredLocale) ? v.preferredLocale : "en";
  if (!id || !email) throw new Error("Invalid AuthMeResponse.user: id and email required");
  return {
    id,
    email,
    preferredLocale,
    preferredTheme: v.preferredTheme === null ? null : isString(v.preferredTheme) ? v.preferredTheme : void 0,
    preferredFontScale: v.preferredFontScale === null ? null : isString(v.preferredFontScale) ? v.preferredFontScale : void 0,
    preferredDensity: v.preferredDensity === null ? null : isString(v.preferredDensity) ? v.preferredDensity : void 0,
    isPlatformAdmin: typeof v.isPlatformAdmin === "boolean" ? v.isPlatformAdmin : void 0
  };
}
function parseWorkspace(v) {
  if (!isObject(v)) throw new Error("Invalid AuthMeResponse.workspaces item");
  const id = isString(v.id) ? v.id : "";
  const name = isString(v.name) ? v.name : "";
  const role = isString(v.role) ? v.role : "";
  if (!id || !name) throw new Error("Invalid AuthMeResponse.workspaces item: id and name required");
  return {
    id,
    name,
    role,
    brandKey: v.brandKey === null ? null : isString(v.brandKey) ? v.brandKey : void 0
  };
}
function parseAuthMeResponse(payload) {
  if (!isObject(payload)) throw new Error("Invalid AuthMeResponse: expected object");
  if (payload.ok !== true) throw new Error("Invalid AuthMeResponse: ok must be true");
  const user = parseUser(payload.user);
  const workspacesRaw = Array.isArray(payload.workspaces) ? payload.workspaces : Array.isArray(payload.accounts) ? payload.accounts : null;
  if (!workspacesRaw) throw new Error("Invalid AuthMeResponse: workspaces must be array");
  const workspaces = workspacesRaw.map((a, i) => {
    try {
      return parseWorkspace(a);
    } catch (e) {
      throw new Error("Invalid AuthMeResponse.workspaces[" + i + "]: " + (e instanceof Error ? e.message : String(e)));
    }
  });
  const activeWorkspaceId = payload.activeWorkspaceId === null ? null : isString(payload.activeWorkspaceId) ? payload.activeWorkspaceId : payload.activeAccountId === null ? null : isString(payload.activeAccountId) ? payload.activeAccountId : null;
  const role = payload.role === null ? null : isString(payload.role) ? payload.role : null;
  return { ok: true, user, workspaces, activeWorkspaceId, role };
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
  const id = isString2(v.id) ? v.id : "";
  const key = isString2(v.key) ? v.key : "";
  const scope = isString2(v.scope) && SCOPES.includes(v.scope) ? v.scope : "system";
  const type = isString2(v.type) && TYPES.includes(v.type) ? v.type : "water";
  const workspaceId = v.workspaceId === null ? null : isString2(v.workspaceId) ? v.workspaceId : v.accountId === null ? null : isString2(v.accountId) ? v.accountId : null;
  const name = isString2(v.name) ? v.name : "";
  const ph = v.ph === null || v.ph === void 0 ? void 0 : isNumber(v.ph) ? v.ph : void 0;
  const calcium = isNumber(v.calcium) ? v.calcium : 0;
  const magnesium = isNumber(v.magnesium) ? v.magnesium : 0;
  const sodium = isNumber(v.sodium) ? v.sodium : 0;
  const sulfate = isNumber(v.sulfate) ? v.sulfate : 0;
  const chloride = isNumber(v.chloride) ? v.chloride : 0;
  const bicarbonate = isNumber(v.bicarbonate) ? v.bicarbonate : 0;
  const verificationStatus = isString2(v.verificationStatus) && VERIFICATION_STATUSES.includes(v.verificationStatus) ? v.verificationStatus : "unverified";
  const source = isString2(v.source) ? v.source : "";
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
  if (payload.ok !== true) throw new Error("Invalid WaterProfilesResponse: ok must be true");
  const system = parseArray(payload.system, parseWaterProfile);
  const publicProfiles = parseArray(payload.public, parseWaterProfile);
  const workspaceRaw = Array.isArray(payload.workspace) ? payload.workspace : Array.isArray(payload.account) ? payload.account : null;
  if (!workspaceRaw) throw new Error("Invalid WaterProfilesResponse: workspace must be array");
  const workspace = parseArray(workspaceRaw, parseWaterProfile);
  return { ok: true, system, public: publicProfiles, workspace };
}

// src/water/parseComputeAndSave.ts
function isFiniteNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function parseIonProfilePpm(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  const keys = ["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"];
  for (const k of keys) {
    if (!isFiniteNumber(o[k])) throw new Error(`Invalid ${label}.${String(k)}`);
  }
  return {
    calcium: o.calcium,
    magnesium: o.magnesium,
    sodium: o.sodium,
    sulfate: o.sulfate,
    chloride: o.chloride,
    bicarbonate: o.bicarbonate
  };
}
function parseDerivationValue(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  if (o.kind === "number") {
    if (!isFiniteNumber(o.value)) throw new Error(`Invalid ${label}.value`);
    const unit = typeof o.unit === "string" ? o.unit : void 0;
    return unit ? { kind: "number", value: o.value, unit } : { kind: "number", value: o.value };
  }
  if (o.kind === "string") {
    if (typeof o.value !== "string") throw new Error(`Invalid ${label}.value`);
    return { kind: "string", value: o.value };
  }
  if (o.kind === "boolean") {
    if (typeof o.value !== "boolean") throw new Error(`Invalid ${label}.value`);
    return { kind: "boolean", value: o.value };
  }
  if (o.kind === "null") return { kind: "null" };
  throw new Error(`Invalid ${label}.kind`);
}
function parseDerivationLine(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  const id = typeof o.id === "string" ? o.id : "";
  if (!id) throw new Error(`Invalid ${label}.id`);
  return { id, value: parseDerivationValue(o.value, `${label}.value`) };
}
function parseDerivation(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  const kind = typeof o.kind === "string" ? o.kind : "";
  if (!kind) throw new Error(`Invalid ${label}.kind`);
  if (o.version !== 1) throw new Error(`Invalid ${label}.version`);
  const formulaId = typeof o.formulaId === "string" ? o.formulaId : "";
  if (!formulaId) throw new Error(`Invalid ${label}.formulaId`);
  const inputs = Array.isArray(o.inputs) ? o.inputs.map((x, i) => parseDerivationLine(x, `${label}.inputs[${i}]`)) : [];
  const intermediates = Array.isArray(o.intermediates) ? o.intermediates.map((x, i) => parseDerivationLine(x, `${label}.intermediates[${i}]`)) : [];
  const breakdowns = Array.isArray(o.breakdowns) ? o.breakdowns.filter((b) => b && typeof b === "object" && typeof b.id === "string" && Array.isArray(b.rows)).map((b) => ({
    id: b.id,
    rows: b.rows.filter((r) => r && typeof r === "object")
  })) : void 0;
  const notes = Array.isArray(o.notes) ? o.notes.filter((n) => typeof n === "string") : void 0;
  return { kind, version: 1, formulaId, inputs, intermediates, breakdowns, notes };
}
function parseSettingsSavedRef(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  const recipeId = typeof o.recipeId === "string" ? o.recipeId : "";
  if (!recipeId) throw new Error(`Invalid ${label}.recipeId`);
  return { recipeId };
}
function parseSaltAdditionsResult(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  const baseProfile = parseIonProfilePpm(o.baseProfile, `${label}.baseProfile`);
  const resultingProfile = parseIonProfilePpm(o.resultingProfile, `${label}.resultingProfile`);
  const deltasPpm = parseIonProfilePpm(o.deltasPpm, `${label}.deltasPpm`);
  const breakdown = Array.isArray(o.breakdown) ? o.breakdown.filter((r) => r && typeof r === "object" && typeof r.saltKey === "string" && isFiniteNumber(r.grams)).map((r) => ({
    saltKey: r.saltKey,
    grams: r.grams,
    deltasPpm: r.deltasPpm && typeof r.deltasPpm === "object" ? r.deltasPpm : {}
  })) : [];
  return { baseProfile, resultingProfile, deltasPpm, breakdown };
}
function parseAcidificationResult(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  const finalAlkalinityPpmCaCO3 = isFiniteNumber(o.finalAlkalinityPpmCaCO3) ? o.finalAlkalinityPpmCaCO3 : NaN;
  const sulfateAddedPpm = isFiniteNumber(o.sulfateAddedPpm) ? o.sulfateAddedPpm : NaN;
  const chlorideAddedPpm = isFiniteNumber(o.chlorideAddedPpm) ? o.chlorideAddedPpm : NaN;
  if (!Number.isFinite(finalAlkalinityPpmCaCO3)) throw new Error(`Invalid ${label}.finalAlkalinityPpmCaCO3`);
  if (!Number.isFinite(sulfateAddedPpm)) throw new Error(`Invalid ${label}.sulfateAddedPpm`);
  if (!Number.isFinite(chlorideAddedPpm)) throw new Error(`Invalid ${label}.chlorideAddedPpm`);
  return {
    acidRequiredMl: o.acidRequiredMl === null ? null : isFiniteNumber(o.acidRequiredMl) ? o.acidRequiredMl : null,
    acidRequiredTsp: o.acidRequiredTsp === null ? null : isFiniteNumber(o.acidRequiredTsp) ? o.acidRequiredTsp : null,
    acidRequiredGrams: o.acidRequiredGrams === null ? null : isFiniteNumber(o.acidRequiredGrams) ? o.acidRequiredGrams : null,
    acidRequiredKg: o.acidRequiredKg === null ? null : isFiniteNumber(o.acidRequiredKg) ? o.acidRequiredKg : null,
    finalAlkalinityPpmCaCO3,
    sulfateAddedPpm,
    chlorideAddedPpm,
    debug: o.debug && typeof o.debug === "object" ? o.debug : void 0
  };
}
function parseAcidificationManualResult(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  const achievedPh = isFiniteNumber(o.achievedPh) ? o.achievedPh : NaN;
  if (!Number.isFinite(achievedPh)) throw new Error(`Invalid ${label}.achievedPh`);
  const clamped = o.clamped === "none" || o.clamped === "low" || o.clamped === "high" ? o.clamped : "none";
  const iterations = isFiniteNumber(o.iterations) ? o.iterations : 0;
  const targetAmount = isFiniteNumber(o.targetAmount) ? o.targetAmount : NaN;
  const predictedAmount = isFiniteNumber(o.predictedAmount) ? o.predictedAmount : NaN;
  return {
    achievedPh,
    predicted: parseAcidificationResult(o.predicted, `${label}.predicted`),
    clamped,
    iterations,
    targetAmount,
    predictedAmount
  };
}
function parseMashTargetMashPhResult(v, label) {
  const base = parseAcidificationResult(v, label);
  const o = v;
  const estimatedMashPhRoomTemp = isFiniteNumber(o.estimatedMashPhRoomTemp) ? o.estimatedMashPhRoomTemp : NaN;
  if (!Number.isFinite(estimatedMashPhRoomTemp)) throw new Error(`Invalid ${label}.estimatedMashPhRoomTemp`);
  return { ...base, estimatedMashPhRoomTemp };
}
function parseOverallResult(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  const calculatedAt = typeof o.calculatedAt === "string" ? o.calculatedAt : "";
  if (!calculatedAt) throw new Error(`Invalid ${label}.calculatedAt`);
  const ionsPpm = parseIonProfilePpm(o.ionsPpm, `${label}.ionsPpm`);
  const finalAlkalinityPpmCaCO3 = isFiniteNumber(o.finalAlkalinityPpmCaCO3) ? o.finalAlkalinityPpmCaCO3 : NaN;
  if (!Number.isFinite(finalAlkalinityPpmCaCO3)) throw new Error(`Invalid ${label}.finalAlkalinityPpmCaCO3`);
  const ph = o.ph;
  const kind = ph?.kind === "target" || ph?.kind === "estimated" ? ph.kind : null;
  const value = isFiniteNumber(ph?.value) ? ph.value : null;
  if (!kind || value === null) throw new Error(`Invalid ${label}.ph`);
  return {
    calculatedAt,
    ionsPpm,
    finalAlkalinityPpmCaCO3,
    ph: { kind, value },
    debug: o.debug && typeof o.debug === "object" ? o.debug : void 0
  };
}
function parseMashAcidBlock(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  const kind = o.kind;
  if (kind === "mash_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(o.result, `${label}.result`),
      derivation: parseDerivation(o.derivation, `${label}.derivation`)
    };
  }
  if (kind === "mash_acidification_target_mash_ph") {
    return {
      kind,
      mode: "targetPh",
      result: parseMashTargetMashPhResult(o.result, `${label}.result`),
      derivation: parseDerivation(o.derivation, `${label}.derivation`)
    };
  }
  if (kind === "mash_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(o.result, `${label}.result`),
      derivation: parseDerivation(o.derivation, `${label}.derivation`)
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}
function parseSpargeAcidBlock(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  const kind = o.kind;
  if (kind === "sparge_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(o.result, `${label}.result`),
      derivation: parseDerivation(o.derivation, `${label}.derivation`)
    };
  }
  if (kind === "sparge_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(o.result, `${label}.result`),
      derivation: parseDerivation(o.derivation, `${label}.derivation`)
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}
function parseBoilAcidBlock(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  const kind = o.kind;
  if (kind === "boil_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(o.result, `${label}.result`),
      derivation: parseDerivation(o.derivation, `${label}.derivation`)
    };
  }
  if (kind === "boil_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(o.result, `${label}.result`),
      derivation: parseDerivation(o.derivation, `${label}.derivation`)
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}
function parseNumberFormatHintV1(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  if (o.version !== 1) throw new Error(`Invalid ${label}.version`);
  const style = o.style === "fixed" || o.style === "significant" ? o.style : null;
  if (!style) throw new Error(`Invalid ${label}.style`);
  const decimals = isFiniteNumber(o.decimals) ? o.decimals : NaN;
  if (!Number.isFinite(decimals) || decimals < 0) throw new Error(`Invalid ${label}.decimals`);
  const unit = typeof o.unit === "string" ? o.unit : void 0;
  const clamp = o.clamp && typeof o.clamp === "object" ? {
    min: isFiniteNumber(o.clamp.min) ? o.clamp.min : void 0,
    max: isFiniteNumber(o.clamp.max) ? o.clamp.max : void 0
  } : void 0;
  return { version: 1, style, decimals, unit, clamp };
}
function parseFormatHints(root) {
  const hintsOut = {};
  const h = root?.formatHints;
  if (h && typeof h === "object") {
    for (const [k, v] of Object.entries(h)) {
      try {
        hintsOut[k] = parseNumberFormatHintV1(v, `formatHints.${k}`);
      } catch {
      }
    }
  }
  return hintsOut;
}
function parseMashComputeAndSaveResponse(x) {
  const root = x ?? {};
  if (!root || typeof root !== "object") throw new Error("Invalid MashComputeAndSaveResponseV1");
  if (root.ok !== true) throw new Error("Invalid MashComputeAndSaveResponseV1.ok");
  if (root.version !== 1) throw new Error("Invalid MashComputeAndSaveResponseV1.version");
  const salts = root.salts;
  const acid = root.acid;
  const overall = root.overall;
  const formatHints = parseFormatHints(root);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(root.settings, "MashComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts?.result, "MashComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts?.derivation, "MashComputeAndSaveResponseV1.salts.derivation")
    },
    acid: parseMashAcidBlock(acid, "MashComputeAndSaveResponseV1.acid"),
    overall: {
      result: parseOverallResult(overall?.result, "MashComputeAndSaveResponseV1.overall.result"),
      derivation: parseDerivation(overall?.derivation, "MashComputeAndSaveResponseV1.overall.derivation")
    },
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : void 0
  };
}
function parseSpargeComputeAndSaveResponse(x) {
  const root = x ?? {};
  if (!root || typeof root !== "object") throw new Error("Invalid SpargeComputeAndSaveResponseV1");
  if (root.ok !== true) throw new Error("Invalid SpargeComputeAndSaveResponseV1.ok");
  if (root.version !== 1) throw new Error("Invalid SpargeComputeAndSaveResponseV1.version");
  const salts = root.salts;
  const acid = root.acid;
  const formatHints = parseFormatHints(root);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(root.settings, "SpargeComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts?.result, "SpargeComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts?.derivation, "SpargeComputeAndSaveResponseV1.salts.derivation")
    },
    acid: parseSpargeAcidBlock(acid, "SpargeComputeAndSaveResponseV1.acid"),
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : void 0
  };
}
function parseBoilComputeAndSaveResponse(x) {
  const root = x ?? {};
  if (!root || typeof root !== "object") throw new Error("Invalid BoilComputeAndSaveResponseV1");
  if (root.ok !== true) throw new Error("Invalid BoilComputeAndSaveResponseV1.ok");
  if (root.version !== 1) throw new Error("Invalid BoilComputeAndSaveResponseV1.version");
  const salts = root.salts;
  const acid = root.acid;
  const overall = root.overall;
  const formatHints = parseFormatHints(root);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(root.settings, "BoilComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts?.result, "BoilComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts?.derivation, "BoilComputeAndSaveResponseV1.salts.derivation")
    },
    acid: parseBoilAcidBlock(acid, "BoilComputeAndSaveResponseV1.acid"),
    overall: {
      result: parseOverallResult(overall?.result, "BoilComputeAndSaveResponseV1.overall.result"),
      derivation: parseDerivation(overall?.derivation, "BoilComputeAndSaveResponseV1.overall.derivation")
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
function isFiniteNumber2(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function parseCanonicalModels(v) {
  const o = v && typeof v === "object" ? v : null;
  const ibu = o?.ibu === "tinseth" || o?.ibu === "rager" ? o.ibu : "tinseth";
  const srm = o?.srm === "morey" || o?.srm === "daniels" ? o.srm : "morey";
  return { ibu, srm };
}
function parseNumberFormatHintV12(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  if (o.version !== 1) throw new Error(`Invalid ${label}.version`);
  const style = o.style === "fixed" || o.style === "significant" ? o.style : null;
  if (!style) throw new Error(`Invalid ${label}.style`);
  const decimals = isFiniteNumber2(o.decimals) ? o.decimals : NaN;
  if (!Number.isFinite(decimals) || decimals < 0) throw new Error(`Invalid ${label}.decimals`);
  const unit = typeof o.unit === "string" ? o.unit : void 0;
  const clamp = o.clamp && typeof o.clamp === "object" ? {
    min: isFiniteNumber2(o.clamp.min) ? o.clamp.min : void 0,
    max: isFiniteNumber2(o.clamp.max) ? o.clamp.max : void 0
  } : void 0;
  return { version: 1, style, decimals, unit, clamp };
}
function parseDerivationLineValue(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  if (o.kind === "number") {
    if (!isFiniteNumber2(o.value)) throw new Error(`Invalid ${label}.value`);
    const unit = typeof o.unit === "string" ? o.unit : void 0;
    return unit ? { kind: "number", value: o.value, unit } : { kind: "number", value: o.value };
  }
  if (o.kind === "string") {
    if (typeof o.value !== "string") throw new Error(`Invalid ${label}.value`);
    return { kind: "string", value: o.value };
  }
  if (o.kind === "boolean") {
    if (typeof o.value !== "boolean") throw new Error(`Invalid ${label}.value`);
    return { kind: "boolean", value: o.value };
  }
  if (o.kind === "null") return { kind: "null" };
  throw new Error(`Invalid ${label}.kind`);
}
function parseDerivation2(v, label) {
  if (!v || typeof v !== "object") throw new Error(`Invalid ${label}`);
  const o = v;
  if (typeof o.kind !== "string" || !o.kind) throw new Error(`Invalid ${label}.kind`);
  if (o.version !== 1) throw new Error(`Invalid ${label}.version`);
  if (typeof o.formulaId !== "string" || !o.formulaId) throw new Error(`Invalid ${label}.formulaId`);
  const parseLine = (x, i, base) => {
    if (!x || typeof x !== "object") throw new Error(`Invalid ${base}[${i}]`);
    const l = x;
    if (typeof l.id !== "string" || !l.id) throw new Error(`Invalid ${base}[${i}].id`);
    return { id: l.id, value: parseDerivationLineValue(l.value, `${base}[${i}].value`) };
  };
  const inputs = Array.isArray(o.inputs) ? o.inputs.map((x, i) => parseLine(x, i, `${label}.inputs`)) : [];
  const intermediates = Array.isArray(o.intermediates) ? o.intermediates.map((x, i) => parseLine(x, i, `${label}.intermediates`)) : [];
  return {
    kind: o.kind,
    version: 1,
    formulaId: o.formulaId,
    inputs,
    intermediates,
    breakdowns: Array.isArray(o.breakdowns) ? o.breakdowns : void 0,
    notes: Array.isArray(o.notes) ? o.notes.filter((n) => typeof n === "string") : void 0
  };
}
function parseGravityAnalysisResponseV1(x) {
  if (!x || typeof x !== "object") throw new Error("Invalid GravityAnalysisResponseV1");
  const root = x;
  if (root.ok !== true) throw new Error("Invalid GravityAnalysisResponseV1.ok");
  if (root.version !== 1) throw new Error("Invalid GravityAnalysisResponseV1.version");
  const canonicalModels = parseCanonicalModels(root.canonicalModels);
  const r = root.result;
  if (!r || typeof r !== "object") throw new Error("Invalid GravityAnalysisResponseV1.result");
  const rr = r;
  const warningsRaw = Array.isArray(rr.warnings) ? rr.warnings : [];
  const warnings = warningsRaw.map((w) => w && typeof w === "object" ? typeof w.code === "string" ? w.code : "" : "").filter((c) => Boolean(c)).map((code) => ({ code }));
  const result = {
    boilTimeMinutes: rr.boilTimeMinutes === null ? null : isFiniteNumber2(rr.boilTimeMinutes) ? rr.boilTimeMinutes : null,
    kettleVolumeLiters: rr.kettleVolumeLiters === null ? null : isFiniteNumber2(rr.kettleVolumeLiters) ? rr.kettleVolumeLiters : null,
    preBoilVolumeLiters: rr.preBoilVolumeLiters === null ? null : isFiniteNumber2(rr.preBoilVolumeLiters) ? rr.preBoilVolumeLiters : null,
    ogEstimatedSg: rr.ogEstimatedSg === null ? null : isFiniteNumber2(rr.ogEstimatedSg) ? rr.ogEstimatedSg : null,
    pbgEstimatedSg: rr.pbgEstimatedSg === null ? null : isFiniteNumber2(rr.pbgEstimatedSg) ? rr.pbgEstimatedSg : null,
    ibuTinsethEstimated: rr.ibuTinsethEstimated === null ? null : isFiniteNumber2(rr.ibuTinsethEstimated) ? rr.ibuTinsethEstimated : null,
    ibuRagerEstimated: rr.ibuRagerEstimated === null ? null : isFiniteNumber2(rr.ibuRagerEstimated) ? rr.ibuRagerEstimated : null,
    buGuRatio: rr.buGuRatio === null ? null : isFiniteNumber2(rr.buGuRatio) ? rr.buGuRatio : null,
    colorSrmMoreyEstimated: rr.colorSrmMoreyEstimated === null ? null : isFiniteNumber2(rr.colorSrmMoreyEstimated) ? rr.colorSrmMoreyEstimated : null,
    colorSrmDanielsEstimated: rr.colorSrmDanielsEstimated === null ? null : isFiniteNumber2(rr.colorSrmDanielsEstimated) ? rr.colorSrmDanielsEstimated : null,
    fgEstimatedSg: rr.fgEstimatedSg === null ? null : isFiniteNumber2(rr.fgEstimatedSg) ? rr.fgEstimatedSg : null,
    abvEstimatedPercent: rr.abvEstimatedPercent === null ? null : isFiniteNumber2(rr.abvEstimatedPercent) ? rr.abvEstimatedPercent : null,
    attenuationEffectivePercent: rr.attenuationEffectivePercent === null ? null : isFiniteNumber2(rr.attenuationEffectivePercent) ? rr.attenuationEffectivePercent : null,
    warnings
  };
  const derivationsOut = {};
  const d = root.derivations;
  if (d && typeof d === "object") {
    for (const [k, v] of Object.entries(d)) {
      try {
        derivationsOut[k] = parseDerivation2(v, `GravityAnalysisResponseV1.derivations.${k}`);
      } catch {
      }
    }
  }
  const hintsOut = {};
  const h = root.formatHints;
  if (h && typeof h === "object") {
    for (const [k, v] of Object.entries(h)) {
      try {
        hintsOut[k] = parseNumberFormatHintV12(v, `GravityAnalysisResponseV1.formatHints.${k}`);
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
  parseSpargeComputeAndSaveResponse,
  parseWaterProfileItem,
  parseWaterProfilesResponse,
  waterFormatHints
});
