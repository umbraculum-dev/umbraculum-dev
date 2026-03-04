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
  CELLS_PER_KG_DRY: () => CELLS_PER_KG_DRY,
  CELLS_PER_L_LIQUID: () => CELLS_PER_L_LIQUID,
  CELLS_PER_L_SLURRY: () => CELLS_PER_L_SLURRY,
  MASH_STEP_TYPE_OPTIONS: () => MASH_STEP_TYPE_OPTIONS,
  MASH_TEMPLATES: () => MASH_TEMPLATES,
  PITCH_RATE_TO_MILLION_CELLS_PER_ML_P: () => PITCH_RATE_TO_MILLION_CELLS_PER_ML_P,
  YEAST_PITCH_RATE_OPTIONS: () => YEAST_PITCH_RATE_OPTIONS,
  buildBeerJsonRecipeDocument: () => buildBeerJsonRecipeDocument,
  buildRecipeExtJsonFromEditorState: () => buildRecipeExtJsonFromEditorState,
  computeAmountFromCellsB: () => computeAmountFromCellsB,
  computeCellsPerLFromManualCount: () => computeCellsPerLFromManualCount,
  computeEstimatedCellsB: () => computeEstimatedCellsB,
  editorStateFromBeerJson: () => editorStateFromBeerJson,
  mergeMashDeduceFromExt: () => mergeMashDeduceFromExt,
  mergeYeastAttenuationRangeFromExt: () => mergeYeastAttenuationRangeFromExt,
  newMashRowId: () => newMashRowId,
  replaceMashInBeerJsonDocument: () => replaceMashInBeerJsonDocument,
  sgToPlato: () => import_core.sgToPlato,
  validateMashBeforeSave: () => validateMashBeforeSave
});
module.exports = __toCommonJS(index_exports);
var import_core = require("@brewery/core");
var PITCH_RATE_TO_MILLION_CELLS_PER_ML_P = {
  mfg_rec_0_35_ales: 0.35,
  mfg_rec_0_5_ales: 0.5,
  pro_0_75_ales: 0.75,
  pro_1_0_ales: 1,
  pro_1_25_ales: 1.25,
  pro_1_5_lager: 1.5,
  pro_1_75_lager: 1.75,
  pro_2_0_lager: 2
};
var YEAST_PITCH_RATE_OPTIONS = [
  { value: "mfg_rec_0_35_ales", labelKey: "yeastPitchRateMfgRec035Ales" },
  { value: "mfg_rec_0_5_ales", labelKey: "yeastPitchRateMfgRec05Ales" },
  { value: "pro_0_75_ales", labelKey: "yeastPitchRatePro075Ales" },
  { value: "pro_1_0_ales", labelKey: "yeastPitchRatePro10Ales" },
  { value: "pro_1_25_ales", labelKey: "yeastPitchRatePro125Ales" },
  { value: "pro_1_5_lager", labelKey: "yeastPitchRatePro15Lager" },
  { value: "pro_1_75_lager", labelKey: "yeastPitchRatePro175Lager" },
  { value: "pro_2_0_lager", labelKey: "yeastPitchRatePro20Lager" }
];
function computeEstimatedCellsB(batchSizeLiters, ogEstimatedSg, pitchRateKey) {
  if (typeof batchSizeLiters !== "number" || !Number.isFinite(batchSizeLiters) || batchSizeLiters <= 0)
    return null;
  if (typeof ogEstimatedSg !== "number" || !Number.isFinite(ogEstimatedSg) || ogEstimatedSg <= 1)
    return null;
  const plato = (0, import_core.sgToPlato)(ogEstimatedSg);
  if (plato == null || plato <= 0) return null;
  const rate = pitchRateKey && pitchRateKey in PITCH_RATE_TO_MILLION_CELLS_PER_ML_P ? PITCH_RATE_TO_MILLION_CELLS_PER_ML_P[pitchRateKey] : null;
  if (rate == null) return null;
  const cellsB = batchSizeLiters * plato * rate;
  return Number.isFinite(cellsB) && cellsB > 0 ? cellsB : null;
}
var CELLS_PER_L_LIQUID = 2150;
var CELLS_PER_L_SLURRY = 1200;
var CELLS_PER_KG_DRY = 1500;
function computeCellsPerLFromManualCount(manual) {
  const { dilutionFactor, aliveCells, totalCells } = manual;
  if (!Number.isFinite(aliveCells) || aliveCells <= 0 || !Number.isFinite(totalCells) || totalCells <= 0 || aliveCells > totalCells)
    return null;
  if (dilutionFactor !== 200 && dilutionFactor !== 2e3) return null;
  const cellsPerL = aliveCells * dilutionFactor * 0.05;
  return Number.isFinite(cellsPerL) && cellsPerL > 0 ? cellsPerL : null;
}
function computeAmountFromCellsB(cellsB, format, cellsPerLOverride, cellsPerKGOverride) {
  if (!Number.isFinite(cellsB) || cellsB <= 0) return { amountL: null, amountKg: null };
  if (format === "dry") {
    const cellsPerKg = cellsPerKGOverride != null && Number.isFinite(cellsPerKGOverride) && cellsPerKGOverride > 0 ? cellsPerKGOverride : CELLS_PER_KG_DRY;
    const amountKg = cellsB / cellsPerKg;
    return { amountL: null, amountKg: Number.isFinite(amountKg) && amountKg > 0 ? amountKg : null };
  }
  const cellsPerL = cellsPerLOverride != null && Number.isFinite(cellsPerLOverride) && cellsPerLOverride > 0 ? cellsPerLOverride : format === "liquid" ? CELLS_PER_L_LIQUID : CELLS_PER_L_SLURRY;
  const amountL = cellsB / cellsPerL;
  return { amountL: Number.isFinite(amountL) && amountL > 0 ? amountL : null, amountKg: null };
}
var MASH_STEP_TYPE_OPTIONS = [
  { value: "infusion", label: "Infusion" },
  { value: "temperature", label: "Temperature" },
  { value: "decoction", label: "Decoction" },
  { value: "souring mash", label: "Souring mash" },
  { value: "souring wort", label: "Souring wort" },
  { value: "drain mash tun", label: "Drain mash tun" },
  { value: "sparge", label: "Sparge" }
];
var MASH_TEMPLATES = [
  {
    id: "single_infusion",
    labelKey: "mashingTemplateSingleInfusion",
    steps: [{ name: "Mash In", type: "infusion", stepTemperatureC: 67, stepTimeMin: 60 }]
  },
  {
    id: "step_mash",
    labelKey: "mashingTemplateStepMash",
    steps: [
      { name: "Protein rest", type: "infusion", stepTemperatureC: 52, stepTimeMin: 15 },
      { name: "Saccharification", type: "temperature", stepTemperatureC: 65, stepTimeMin: 30 },
      { name: "Mash out", type: "temperature", stepTemperatureC: 72, stepTimeMin: 20 }
    ]
  },
  {
    id: "temperature",
    labelKey: "mashingTemplateTemperature",
    steps: [{ name: "Single rest", type: "temperature", stepTemperatureC: 68, stepTimeMin: 60 }]
  },
  {
    id: "decoction",
    labelKey: "mashingTemplateDecoction",
    steps: [
      { name: "Dough in", type: "infusion", stepTemperatureC: 45, stepTimeMin: 15 },
      { name: "Protein rest", type: "decoction", stepTemperatureC: 52, stepTimeMin: 20 },
      { name: "Saccharification", type: "decoction", stepTemperatureC: 65, stepTimeMin: 30 },
      { name: "Mash out", type: "decoction", stepTemperatureC: 76, stepTimeMin: 10 }
    ]
  },
  {
    id: "sparge",
    labelKey: "mashingTemplateSparge",
    steps: [{ name: "Sparge", type: "sparge", stepTemperatureC: 76, stepTimeMin: 0 }]
  }
];
function newMashRowId() {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}
function safeNum(v, fallback) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
function ppgToSg(ppg) {
  return 1 + ppg / 1e3;
}
function maltClassToGrainGroup(maltClass) {
  switch (maltClass) {
    case "base":
      return "base";
    case "crystal":
      return "caramel";
    case "roast":
      return "roasted";
    case "acid":
      return "specialty";
    default:
      return "base";
  }
}
function hopUseToTiming(use, timeMinutes) {
  const timing = { use: use === "dryhop" ? "add_to_fermentation" : "add_to_boil" };
  if (typeof timeMinutes === "number" && Number.isFinite(timeMinutes)) {
    timing.duration = { unit: "min", value: Math.max(0, Math.round(timeMinutes)) };
  }
  return timing;
}
function miscUseToTiming(use, timeMinutes) {
  const useMap = {
    mash: "add_to_mash",
    boil: "add_to_boil",
    primary: "add_to_fermentation",
    secondary: "add_to_fermentation",
    bottling: "add_to_package"
  };
  const timing = { use: useMap[use] ?? "add_to_boil" };
  if (typeof timeMinutes === "number" && Number.isFinite(timeMinutes)) {
    timing.duration = { unit: "min", value: Math.max(0, Math.round(timeMinutes)) };
  }
  return timing;
}
function miscTypeToBeerJsonType(t) {
  return t === "water_agent" ? "water agent" : t;
}
function buildFermentableAddition(row) {
  let sgValue = null;
  if (row.potential?.kind === "sg") {
    sgValue = row.potential.value;
  } else if (row.potential?.kind === "ppg") {
    sgValue = ppgToSg(row.potential.value);
  } else if (row.potential?.kind === "plato") {
    sgValue = (0, import_core.platoToSg)(row.potential.value);
  }
  const yieldObj = row.potential?.kind === "yieldPercent" ? { fine_grind: { unit: "%", value: row.potential.value } } : sgValue != null && sgValue > 1 ? { potential: { unit: "sg", value: sgValue } } : { fine_grind: { unit: "%", value: 0 } };
  const colorLovibond = typeof row.colorLovibond === "number" && Number.isFinite(row.colorLovibond) && row.colorLovibond >= 0 ? row.colorLovibond : null;
  const timingUse = row.timingUse ?? "add_to_mash";
  return {
    id: row.id,
    name: row.name,
    type: "grain",
    producer: row.producer ?? void 0,
    grain_group: maltClassToGrainGroup(row.maltClass),
    yield: yieldObj,
    ...colorLovibond === null ? {} : { color: { unit: "Lovi", value: colorLovibond } },
    amount: { unit: "kg", value: row.amountKg },
    timing: { use: timingUse }
  };
}
function buildHopAddition(row) {
  const formRaw = row.form ?? null;
  const formForBeerJson = formRaw === "extract" || formRaw === "leaf" || formRaw === "leaf (wet)" || formRaw === "pellet" || formRaw === "powder" || formRaw === "plug" ? formRaw : formRaw === "debittered_leaf" ? "leaf" : formRaw === "hop_extract" ? "extract" : null;
  return {
    id: row.id,
    name: row.name,
    origin: row.country ?? void 0,
    ...formForBeerJson ? { form: formForBeerJson } : {},
    alpha_acid: { unit: "%", value: row.alphaAcidPercent ?? 0 },
    amount: { unit: "g", value: row.amountGrams },
    timing: hopUseToTiming(row.use, row.timeMinutes),
    brewery_app_use: row.use
  };
}
function buildCultureAddition(row) {
  const attMin = typeof row.attenuationMin === "number" && Number.isFinite(row.attenuationMin) ? row.attenuationMin : null;
  const attMax = typeof row.attenuationMax === "number" && Number.isFinite(row.attenuationMax) ? row.attenuationMax : null;
  const attenuation = attMin != null && attMax != null ? (attMin + attMax) / 2 : attMin != null ? attMin : attMax != null ? attMax : null;
  const amountL = typeof row.amountL === "number" && Number.isFinite(row.amountL) && row.amountL >= 0 ? row.amountL : null;
  const amountKg = typeof row.amountKg === "number" && Number.isFinite(row.amountKg) && row.amountKg >= 0 ? row.amountKg : null;
  const format = row.format === "dry" || row.format === "liquid" || row.format === "slurry" ? row.format : null;
  let amount;
  if (format === "dry" && amountKg != null) {
    amount = { unit: "kg", value: amountKg };
  } else if (amountL != null) {
    amount = { unit: "l", value: amountL };
  } else {
    amount = { unit: "pkg", value: 1 };
  }
  const out = {
    id: row.id,
    name: row.name,
    type: "ale",
    form: "dry",
    producer: row.lab ?? void 0,
    product_id: row.productId ?? void 0,
    amount
  };
  if (attenuation != null) out.attenuation = { unit: "%", value: attenuation };
  return out;
}
function buildMiscAddition(row) {
  const out = {
    id: row.id,
    name: row.name,
    type: miscTypeToBeerJsonType(row.type),
    timing: miscUseToTiming(row.use, row.timeMinutes),
    amount: row.amountIsWeight ? { unit: "kg", value: row.amount } : { unit: "l", value: row.amount }
  };
  if (row.useFor) out.use_for = row.useFor;
  if (row.notes) out.notes = row.notes;
  return out;
}
var VALID_MASH_STEP_TYPES = [
  "infusion",
  "temperature",
  "decoction",
  "souring mash",
  "souring wort",
  "drain mash tun",
  "sparge"
];
function buildMashStep(step) {
  const out = {
    name: step.name,
    type: step.type,
    step_temperature: { unit: "C", value: step.stepTemperatureC },
    step_time: { unit: "min", value: Math.max(0, step.stepTimeMin) }
  };
  if (step.amountL != null && Number.isFinite(step.amountL) && step.amountL >= 0) {
    out.amount = { unit: "l", value: step.amountL };
  }
  if (step.rampTimeMin != null && Number.isFinite(step.rampTimeMin) && step.rampTimeMin >= 0) {
    out.ramp_time = { unit: "min", value: step.rampTimeMin };
  }
  if (step.endTemperatureC != null && Number.isFinite(step.endTemperatureC)) {
    out.end_temperature = { unit: "C", value: step.endTemperatureC };
  }
  if (step.infuseTemperatureC != null && Number.isFinite(step.infuseTemperatureC)) {
    out.infuse_temperature = { unit: "C", value: step.infuseTemperatureC };
  }
  if (typeof step.description === "string" && step.description.trim()) {
    out.description = step.description.trim();
  }
  return out;
}
function buildMashProcedure(mash) {
  if (!mash || !mash.steps.length) return null;
  return {
    name: mash.name,
    grain_temperature: { unit: "C", value: mash.grainTemperatureC },
    mash_steps: mash.steps.map(buildMashStep),
    ...typeof mash.notes === "string" && mash.notes.trim() ? { notes: mash.notes.trim() } : {}
  };
}
function validateMashBeforeSave(mash) {
  if (!mash) return { ok: true };
  if (typeof mash.name !== "string" || !mash.name.trim()) {
    return { ok: false, errors: "Mash procedure name is required" };
  }
  if (typeof mash.grainTemperatureC !== "number" || !Number.isFinite(mash.grainTemperatureC)) {
    return { ok: false, errors: "Grain temperature must be a valid number" };
  }
  if (mash.grainTemperatureC < -20 || mash.grainTemperatureC > 100) {
    return { ok: false, errors: "Grain temperature must be between -20 and 100 \xB0C" };
  }
  if (!Array.isArray(mash.steps)) {
    return { ok: false, errors: "Mash steps must be an array" };
  }
  if (mash.steps.length === 0) {
    return { ok: true };
  }
  const errs = [];
  mash.steps.forEach((s, idx) => {
    if (typeof s.name !== "string" || !s.name.trim()) {
      errs.push(`Step ${idx + 1}: name is required`);
    }
    if (!VALID_MASH_STEP_TYPES.includes(s.type)) {
      errs.push(`Step ${idx + 1}: invalid type "${s.type}"`);
    }
    if (typeof s.stepTemperatureC !== "number" || !Number.isFinite(s.stepTemperatureC)) {
      errs.push(`Step ${idx + 1}: step temperature must be a valid number`);
    } else if (s.stepTemperatureC < 0 || s.stepTemperatureC > 100) {
      errs.push(`Step ${idx + 1}: step temperature must be between 0 and 100 \xB0C`);
    }
    if (typeof s.stepTimeMin !== "number" || !Number.isFinite(s.stepTimeMin)) {
      errs.push(`Step ${idx + 1}: step time must be a valid number`);
    } else if (s.stepTimeMin < 0) {
      errs.push(`Step ${idx + 1}: step time must be >= 0`);
    }
  });
  if (errs.length) return { ok: false, errors: errs.join("; ") };
  return { ok: true };
}
function replaceMashInBeerJsonDocument(doc, mash) {
  const cloned = JSON.parse(JSON.stringify(doc));
  const r0 = cloned?.beerjson?.recipes?.[0];
  if (!r0 || typeof r0 !== "object") {
    return cloned;
  }
  const mashProc = buildMashProcedure(mash);
  if (mashProc) {
    r0.mash = mashProc;
  } else {
    delete r0.mash;
  }
  return cloned;
}
function buildBeerJsonRecipeDocument(args) {
  const batchSizeLiters = typeof args.batchSizeLiters === "number" && Number.isFinite(args.batchSizeLiters) ? args.batchSizeLiters : 20;
  const efficiency = typeof args.brewhouseEfficiencyPercent === "number" && Number.isFinite(args.brewhouseEfficiencyPercent) ? args.brewhouseEfficiencyPercent : 75;
  const recipe = {
    name: args.name,
    type: "all grain",
    author: "brewery-app",
    efficiency: { brewhouse: { unit: "%", value: efficiency } },
    batch_size: { unit: "l", value: batchSizeLiters },
    ingredients: {
      fermentable_additions: args.gristRows.map(buildFermentableAddition),
      hop_additions: args.hopsRows.filter((h) => h.name).map(buildHopAddition),
      culture_additions: args.yeastRows.filter((y) => y.name).map(buildCultureAddition),
      miscellaneous_additions: args.miscRows.filter((m) => m.name).map(buildMiscAddition)
    }
  };
  if (args.notes) recipe.notes = args.notes;
  const mashProc = buildMashProcedure(args.mash ?? null);
  if (mashProc) recipe.mash = mashProc;
  return { beerjson: { version: 1, recipes: [recipe] } };
}
function buildRecipeExtJsonFromEditorState(args) {
  const extBase = args.extBase && typeof args.extBase === "object" && !Array.isArray(args.extBase) ? args.extBase : null;
  const ingredientLinks = {
    grist: Object.fromEntries(
      args.gristRows.map((r) => [r.id, typeof r.ingredientId === "string" ? r.ingredientId : null]).filter(([, v]) => typeof v === "string" && v.trim())
    ),
    hops: Object.fromEntries(
      args.hopsRows.map((r) => [r.id, typeof r.ingredientId === "string" ? r.ingredientId : null]).filter(([, v]) => typeof v === "string" && v.trim())
    ),
    yeast: Object.fromEntries(
      args.yeastRows.map((r) => [r.id, typeof r.ingredientId === "string" ? r.ingredientId : null]).filter(([, v]) => typeof v === "string" && v.trim())
    ),
    misc: Object.fromEntries(
      args.miscRows.map((r) => [r.id, typeof r.ingredientId === "string" ? r.ingredientId : null]).filter(([, v]) => typeof v === "string" && v.trim())
    )
  };
  const mashPhModel = Object.fromEntries(
    args.gristRows.map((r) => {
      const mashDiPh = typeof r.mashDiPh === "number" && Number.isFinite(r.mashDiPh) ? r.mashDiPh : void 0;
      const mashTaToPh57_mEqPerKg = typeof r.mashTaToPh57_mEqPerKg === "number" && Number.isFinite(r.mashTaToPh57_mEqPerKg) ? r.mashTaToPh57_mEqPerKg : void 0;
      const roastDehuskedOverride = r.mashRoastDehuskedOverride === void 0 ? void 0 : r.mashRoastDehuskedOverride;
      if (mashDiPh === void 0 && mashTaToPh57_mEqPerKg === void 0 && roastDehuskedOverride === void 0) {
        return null;
      }
      return [
        r.id,
        {
          ...mashDiPh === void 0 ? {} : { mashDiPh },
          ...mashTaToPh57_mEqPerKg === void 0 ? {} : { mashTaToPh57_mEqPerKg },
          ...roastDehuskedOverride === void 0 ? {} : { roastDehuskedOverride }
        }
      ];
    }).filter(Boolean)
  );
  const hopFormOverrides = Object.fromEntries(
    args.hopsRows.map(
      (r) => r.form === "debittered_leaf" || r.form === "hop_extract" ? [r.id, r.form] : null
    ).filter(Boolean)
  );
  const yeastAttenuationRange = Object.fromEntries(
    args.yeastRows.map((r) => {
      const min = typeof r.attenuationMin === "number" && Number.isFinite(r.attenuationMin) && r.attenuationMin >= 0 && r.attenuationMin <= 100 ? r.attenuationMin : null;
      const max = typeof r.attenuationMax === "number" && Number.isFinite(r.attenuationMax) && r.attenuationMax >= 0 && r.attenuationMax <= 100 ? r.attenuationMax : null;
      if (min == null || max == null) return null;
      return [r.id, { min, max }];
    }).filter(Boolean)
  );
  return {
    ...extBase ? extBase : {},
    version: 1,
    ingredientLinks,
    ...Object.keys(hopFormOverrides).length ? { hopFormOverrides } : {},
    mashPhModel,
    ...Object.keys(yeastAttenuationRange).length ? { yeastAttenuationRange } : {}
  };
}
function parseMashFromBeerJson(r0) {
  const mash = r0?.mash;
  if (!mash || typeof mash !== "object") return null;
  const name = typeof mash.name === "string" ? mash.name.trim() : "";
  const grainTemp = mash.grain_temperature?.unit === "C" && typeof mash.grain_temperature?.value === "number" && Number.isFinite(mash.grain_temperature.value) ? mash.grain_temperature.value : mash.grain_temperature?.unit === "F" ? (mash.grain_temperature.value - 32) * 5 / 9 : null;
  if (!name || grainTemp == null) return null;
  const stepsRaw = Array.isArray(mash.mash_steps) ? mash.mash_steps : [];
  const steps = stepsRaw.map((s, idx) => {
    const stepName = typeof s?.name === "string" ? s.name.trim() : "";
    const typeRaw = typeof s?.type === "string" ? s.type : "";
    const type = VALID_MASH_STEP_TYPES.includes(typeRaw) ? typeRaw : "infusion";
    const stepTemp = s?.step_temperature?.unit === "C" && typeof s?.step_temperature?.value === "number" && Number.isFinite(s.step_temperature.value) ? s.step_temperature.value : s?.step_temperature?.unit === "F" && typeof s?.step_temperature?.value === "number" ? (s.step_temperature.value - 32) * 5 / 9 : null;
    const stepTime = s?.step_time?.unit === "min" && typeof s?.step_time?.value === "number" && Number.isFinite(s.step_time.value) ? s.step_time.value : null;
    if (!stepName || stepTemp == null || stepTime == null) return null;
    const amountL = s?.amount?.unit === "l" && typeof s?.amount?.value === "number" && Number.isFinite(s.amount.value) ? s.amount.value : s?.amount?.unit === "ml" ? s.amount.value / 1e3 : null;
    const rampTimeMin = s?.ramp_time?.unit === "min" && typeof s?.ramp_time?.value === "number" && Number.isFinite(s.ramp_time.value) && s.ramp_time.value >= 0 ? s.ramp_time.value : null;
    const endTemp = s?.end_temperature?.unit === "C" && typeof s?.end_temperature?.value === "number" && Number.isFinite(s.end_temperature.value) ? s.end_temperature.value : s?.end_temperature?.unit === "F" && typeof s?.end_temperature?.value === "number" ? (s.end_temperature.value - 32) * 5 / 9 : null;
    const infuseTemp = s?.infuse_temperature?.unit === "C" && typeof s?.infuse_temperature?.value === "number" && Number.isFinite(s.infuse_temperature.value) ? s.infuse_temperature.value : s?.infuse_temperature?.unit === "F" && typeof s?.infuse_temperature?.value === "number" ? (s.infuse_temperature.value - 32) * 5 / 9 : null;
    const description = typeof s?.description === "string" ? s.description.trim() || null : null;
    return {
      id: typeof s?.id === "string" ? s.id : `mash-step-${idx}`,
      name: stepName,
      type,
      stepTemperatureC: stepTemp,
      stepTimeMin: Math.max(0, stepTime),
      amountL: amountL ?? void 0,
      rampTimeMin: rampTimeMin ?? void 0,
      endTemperatureC: endTemp ?? void 0,
      infuseTemperatureC: infuseTemp ?? void 0,
      description: description ?? void 0
    };
  }).filter(Boolean);
  if (steps.length === 0) return null;
  return {
    name,
    grainTemperatureC: grainTemp,
    steps,
    notes: typeof mash.notes === "string" ? mash.notes.trim() || void 0 : void 0
  };
}
function mergeMashDeduceFromExt(mash, recipeExtJson) {
  if (!mash || !mash.steps.length) return mash;
  const ext = recipeExtJson && typeof recipeExtJson === "object" && !Array.isArray(recipeExtJson) ? recipeExtJson : null;
  const map = ext?.mashStepDeduceFromMashIn && typeof ext.mashStepDeduceFromMashIn === "object" && !Array.isArray(ext.mashStepDeduceFromMashIn) ? ext.mashStepDeduceFromMashIn : null;
  if (!map) return mash;
  const steps = mash.steps.map((s, idx) => {
    const deduceByIndex = map[String(idx)] === true;
    const deduceById = map[s.id] === true;
    return {
      ...s,
      deduceFromMashIn: deduceByIndex || deduceById
    };
  });
  return { ...mash, steps };
}
function editorStateFromBeerJson(doc) {
  const d = doc ?? {};
  const r0 = d?.beerjson?.recipes?.[0];
  const ing = r0?.ingredients ?? {};
  const fermentables = Array.isArray(ing?.fermentable_additions) ? ing.fermentable_additions : [];
  const hops = Array.isArray(ing?.hop_additions) ? ing.hop_additions : [];
  const cultures = Array.isArray(ing?.culture_additions) ? ing.culture_additions : [];
  const misc = Array.isArray(ing?.miscellaneous_additions) ? ing.miscellaneous_additions : [];
  const gristRows = fermentables.map((f) => {
    const id = typeof f?.id === "string" ? f.id : `${Date.now()}-${Math.random()}`;
    const name = typeof f?.name === "string" ? f.name : "";
    if (!name) return null;
    const amountKg = f?.amount?.unit === "kg" ? safeNum(f?.amount?.value, 0) : f?.amount?.unit === "g" ? safeNum(f?.amount?.value, 0) / 1e3 : 0;
    const colorLovibond = f?.color?.unit === "Lovi" && typeof f?.color?.value === "number" && Number.isFinite(f.color.value) && f.color.value >= 0 ? safeNum(f.color.value, 0) : null;
    const potential = f?.yield?.potential?.unit === "sg" && typeof f?.yield?.potential?.value === "number" ? { kind: "sg", value: f.yield.potential.value } : f?.yield?.fine_grind?.unit === "%" && typeof f?.yield?.fine_grind?.value === "number" ? { kind: "yieldPercent", value: f.yield.fine_grind.value } : null;
    const grainGroup = typeof f?.grain_group === "string" ? f.grain_group : "";
    const maltClass = grainGroup === "roasted" ? "roast" : grainGroup === "caramel" ? "crystal" : "base";
    const timingUseRaw = typeof f?.timing?.use === "string" ? f.timing.use : "";
    const timingUse = timingUseRaw === "add_to_boil" || timingUseRaw === "add_to_fermentation" || timingUseRaw === "add_to_package" ? "add_to_boil" : "add_to_mash";
    return {
      id,
      ingredientId: null,
      name,
      producer: typeof f?.producer === "string" ? f.producer : null,
      group: grainGroup || null,
      mashDiPh: null,
      mashTaToPh57_mEqPerKg: null,
      mashRoastDehuskedOverride: null,
      amountKg,
      colorLovibond,
      potential,
      maltClass,
      timingUse
    };
  }).filter(Boolean);
  const hopsRows = hops.map((h) => {
    const id = typeof h?.id === "string" ? h.id : `${Date.now()}-${Math.random()}`;
    const name = typeof h?.name === "string" ? h.name : "";
    if (!name) return null;
    const formRaw = typeof h?.form === "string" ? h.form : "";
    const form = formRaw === "extract" || formRaw === "leaf" || formRaw === "leaf (wet)" || formRaw === "pellet" || formRaw === "powder" || formRaw === "plug" ? formRaw : null;
    const amountGrams = h?.amount?.unit === "g" ? safeNum(h?.amount?.value, 0) : h?.amount?.unit === "kg" ? safeNum(h?.amount?.value, 0) * 1e3 : 0;
    const alphaAcidPercent = h?.alpha_acid?.unit === "%" ? safeNum(h?.alpha_acid?.value, 0) : null;
    const timingUse = typeof h?.timing?.use === "string" ? h.timing.use : "";
    const savedUseRaw = typeof h?.brewery_app_use === "string" ? h.brewery_app_use : "";
    const savedUse = savedUseRaw === "boil" || savedUseRaw === "whirlpool" || savedUseRaw === "dryhop" ? savedUseRaw : null;
    const use = timingUse === "add_to_fermentation" ? "dryhop" : savedUse != null ? savedUse : "boil";
    const timeMinutes = h?.timing?.duration?.unit === "min" ? safeNum(h?.timing?.duration?.value, 0) : null;
    return {
      id,
      ingredientId: null,
      name,
      country: typeof h?.origin === "string" ? h.origin : null,
      form,
      amountGrams,
      alphaAcidPercent,
      use,
      timeMinutes
    };
  }).filter(Boolean);
  const yeastRows = cultures.map((c) => {
    const id = typeof c?.id === "string" ? c.id : `${Date.now()}-${Math.random()}`;
    const name = typeof c?.name === "string" ? c.name : "";
    if (!name) return null;
    const att = c?.attenuation?.unit === "%" ? safeNum(c?.attenuation?.value, 0) : null;
    const amtUnit = typeof c?.amount?.unit === "string" ? c.amount.unit : "";
    const amtVal = typeof c?.amount?.value === "number" && Number.isFinite(c.amount.value) ? c.amount.value : null;
    const amountL = amtUnit === "l" && amtVal != null && amtVal >= 0 ? amtVal : null;
    const amountKg = amtUnit === "kg" && amtVal != null && amtVal >= 0 ? amtVal : amtUnit === "g" && amtVal != null && amtVal >= 0 ? amtVal / 1e3 : null;
    return {
      id,
      ingredientId: null,
      name,
      lab: typeof c?.producer === "string" ? c.producer : null,
      productId: typeof c?.product_id === "string" ? c.product_id : null,
      attenuationMin: att,
      attenuationMax: att,
      amountL: amountL != null ? amountL : null,
      amountKg: amountKg != null ? amountKg : null
    };
  }).filter(Boolean);
  const miscRows = misc.map((m) => {
    const id = typeof m?.id === "string" ? m.id : `${Date.now()}-${Math.random()}`;
    const name = typeof m?.name === "string" ? m.name : "";
    if (!name) return null;
    const amountIsWeight = m?.amount?.unit === "kg" || m?.amount?.unit === "g";
    const amount = m?.amount?.unit === "kg" ? safeNum(m?.amount?.value, 0) : m?.amount?.unit === "g" ? safeNum(m?.amount?.value, 0) / 1e3 : m?.amount?.unit === "l" ? safeNum(m?.amount?.value, 0) : 0;
    const timingUse = typeof m?.timing?.use === "string" ? m.timing.use : "";
    const use = timingUse === "add_to_mash" ? "mash" : timingUse === "add_to_fermentation" ? "secondary" : timingUse === "add_to_package" ? "bottling" : "boil";
    const timeMinutes = m?.timing?.duration?.unit === "min" ? safeNum(m?.timing?.duration?.value, 0) : null;
    const typeRaw = typeof m?.type === "string" ? m.type : "other";
    const type = typeRaw === "water agent" ? "water_agent" : typeRaw;
    return {
      id,
      ingredientId: null,
      name,
      type,
      use,
      timeMinutes,
      amount,
      amountIsWeight,
      useFor: typeof m?.use_for === "string" ? m.use_for : null,
      notes: typeof m?.notes === "string" ? m.notes : null
    };
  }).filter(Boolean);
  const mash = parseMashFromBeerJson(r0);
  return { gristRows, hopsRows, yeastRows, miscRows, mash };
}
function mergeYeastAttenuationRangeFromExt(yeastRows, recipeExtJson) {
  const ext = recipeExtJson && typeof recipeExtJson === "object" && !Array.isArray(recipeExtJson) ? recipeExtJson : null;
  const range = ext?.yeastAttenuationRange;
  if (!range || typeof range !== "object" || Array.isArray(range)) return yeastRows;
  const rangeObj = range;
  return yeastRows.map((row) => {
    const entry = rangeObj[row.id];
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return row;
    const e = entry;
    const min = typeof e.min === "number" && Number.isFinite(e.min) && e.min >= 0 && e.min <= 100 ? e.min : null;
    const max = typeof e.max === "number" && Number.isFinite(e.max) && e.max >= 0 && e.max <= 100 ? e.max : null;
    if (min == null && max == null) return row;
    return {
      ...row,
      attenuationMin: min ?? row.attenuationMin,
      attenuationMax: max ?? row.attenuationMax
    };
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CELLS_PER_KG_DRY,
  CELLS_PER_L_LIQUID,
  CELLS_PER_L_SLURRY,
  MASH_STEP_TYPE_OPTIONS,
  MASH_TEMPLATES,
  PITCH_RATE_TO_MILLION_CELLS_PER_ML_P,
  YEAST_PITCH_RATE_OPTIONS,
  buildBeerJsonRecipeDocument,
  buildRecipeExtJsonFromEditorState,
  computeAmountFromCellsB,
  computeCellsPerLFromManualCount,
  computeEstimatedCellsB,
  editorStateFromBeerJson,
  mergeMashDeduceFromExt,
  mergeYeastAttenuationRangeFromExt,
  newMashRowId,
  replaceMashInBeerJsonDocument,
  sgToPlato,
  validateMashBeforeSave
});
