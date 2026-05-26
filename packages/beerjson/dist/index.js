// src/index.ts
import { platoToSg, sgToPlato } from "@umbraculum/brewery-core";
function isObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}
function isFiniteNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}
function parseValueWithUnit(v) {
  if (!isObject(v)) return { unit: null, value: null };
  const unit = typeof v["unit"] === "string" ? v["unit"] : null;
  const value = isFiniteNumber(v["value"]) ? v["value"] : null;
  return { unit, value };
}
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
  const plato = sgToPlato(ogEstimatedSg);
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
    timing["duration"] = { unit: "min", value: Math.max(0, Math.round(timeMinutes)) };
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
    timing["duration"] = { unit: "min", value: Math.max(0, Math.round(timeMinutes)) };
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
    sgValue = platoToSg(row.potential.value);
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
    timing: { use: timingUse },
    ...row.lateAddition === true ? { brewery_app_late_addition: true } : {}
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
  if (attenuation != null) out["attenuation"] = { unit: "%", value: attenuation };
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
  if (row.useFor) out["use_for"] = row.useFor;
  if (row.notes) out["notes"] = row.notes;
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
    out["amount"] = { unit: "l", value: step.amountL };
  }
  if (step.rampTimeMin != null && Number.isFinite(step.rampTimeMin) && step.rampTimeMin >= 0) {
    out["ramp_time"] = { unit: "min", value: step.rampTimeMin };
  }
  if (step.endTemperatureC != null && Number.isFinite(step.endTemperatureC)) {
    out["end_temperature"] = { unit: "C", value: step.endTemperatureC };
  }
  if (step.infuseTemperatureC != null && Number.isFinite(step.infuseTemperatureC)) {
    out["infuse_temperature"] = { unit: "C", value: step.infuseTemperatureC };
  }
  if (typeof step.description === "string" && step.description.trim()) {
    out["description"] = step.description.trim();
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
    r0["mash"] = mashProc;
  } else {
    delete r0["mash"];
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
  if (args.notes) recipe["notes"] = args.notes;
  const mashProc = buildMashProcedure(args.mash ?? null);
  if (mashProc) recipe["mash"] = mashProc;
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
  if (!isObject(r0)) return null;
  if (!isObject(r0["mash"])) return null;
  const mash = r0["mash"];
  const name = typeof mash["name"] === "string" ? mash["name"].trim() : "";
  const gt = parseValueWithUnit(mash["grain_temperature"]);
  const grainTemp = gt.unit === "C" && gt.value != null ? gt.value : gt.unit === "F" && gt.value != null ? (gt.value - 32) * 5 / 9 : null;
  if (!name || grainTemp == null) return null;
  const stepsRaw = Array.isArray(mash["mash_steps"]) ? mash["mash_steps"] : [];
  const steps = stepsRaw.map((sUnknown, idx) => {
    if (!isObject(sUnknown)) return null;
    const s = sUnknown;
    const stepName = typeof s["name"] === "string" ? s["name"].trim() : "";
    const typeRaw = typeof s["type"] === "string" ? s["type"] : "";
    const type = VALID_MASH_STEP_TYPES.includes(typeRaw) ? typeRaw : "infusion";
    const stTemp = parseValueWithUnit(s["step_temperature"]);
    const stepTemp = stTemp.unit === "C" && stTemp.value != null ? stTemp.value : stTemp.unit === "F" && stTemp.value != null ? (stTemp.value - 32) * 5 / 9 : null;
    const stTime = parseValueWithUnit(s["step_time"]);
    const stepTime = stTime.unit === "min" && stTime.value != null ? stTime.value : null;
    if (!stepName || stepTemp == null || stepTime == null) return null;
    const amt = parseValueWithUnit(s["amount"]);
    const amountL = amt.unit === "l" && amt.value != null ? amt.value : amt.unit === "ml" && amt.value != null ? amt.value / 1e3 : null;
    const ramp = parseValueWithUnit(s["ramp_time"]);
    const rampTimeMin = ramp.unit === "min" && ramp.value != null && ramp.value >= 0 ? ramp.value : null;
    const endT = parseValueWithUnit(s["end_temperature"]);
    const endTemp = endT.unit === "C" && endT.value != null ? endT.value : endT.unit === "F" && endT.value != null ? (endT.value - 32) * 5 / 9 : null;
    const inf = parseValueWithUnit(s["infuse_temperature"]);
    const infuseTemp = inf.unit === "C" && inf.value != null ? inf.value : inf.unit === "F" && inf.value != null ? (inf.value - 32) * 5 / 9 : null;
    const description = typeof s["description"] === "string" ? s["description"].trim() || null : null;
    return {
      id: typeof s["id"] === "string" ? s["id"] : `mash-step-${idx}`,
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
  }).filter((s) => s !== null);
  if (steps.length === 0) return null;
  return {
    name,
    grainTemperatureC: grainTemp,
    steps,
    notes: typeof mash["notes"] === "string" ? mash["notes"].trim() || void 0 : void 0
  };
}
function mergeMashDeduceFromExt(mash, recipeExtJson) {
  if (!mash || !mash.steps.length) return mash;
  const ext = recipeExtJson && typeof recipeExtJson === "object" && !Array.isArray(recipeExtJson) ? recipeExtJson : null;
  const map = ext?.["mashStepDeduceFromMashIn"] && typeof ext["mashStepDeduceFromMashIn"] === "object" && !Array.isArray(ext["mashStepDeduceFromMashIn"]) ? ext["mashStepDeduceFromMashIn"] : null;
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
  const d = isObject(doc) ? doc : {};
  const beerjson = isObject(d["beerjson"]) ? d["beerjson"] : {};
  const recipesArr = Array.isArray(beerjson["recipes"]) ? beerjson["recipes"] : [];
  const r0 = isObject(recipesArr[0]) ? recipesArr[0] : {};
  const ing = isObject(r0["ingredients"]) ? r0["ingredients"] : {};
  const fermentables = Array.isArray(ing["fermentable_additions"]) ? ing["fermentable_additions"] : [];
  const hops = Array.isArray(ing["hop_additions"]) ? ing["hop_additions"] : [];
  const cultures = Array.isArray(ing["culture_additions"]) ? ing["culture_additions"] : [];
  const misc = Array.isArray(ing["miscellaneous_additions"]) ? ing["miscellaneous_additions"] : [];
  const gristRows = fermentables.map((fUnknown) => {
    if (!isObject(fUnknown)) return null;
    const f = fUnknown;
    const id = typeof f["id"] === "string" ? f["id"] : `${Date.now()}-${Math.random()}`;
    const name = typeof f["name"] === "string" ? f["name"] : "";
    if (!name) return null;
    const amt = parseValueWithUnit(f["amount"]);
    const amountKg = amt.unit === "kg" ? safeNum(amt.value, 0) : amt.unit === "g" ? safeNum(amt.value, 0) / 1e3 : 0;
    const color = parseValueWithUnit(f["color"]);
    const colorLovibond = color.unit === "Lovi" && color.value != null && color.value >= 0 ? color.value : null;
    const yieldObj = isObject(f["yield"]) ? f["yield"] : null;
    const yieldPotential = parseValueWithUnit(yieldObj?.["potential"]);
    const yieldFineGrind = parseValueWithUnit(yieldObj?.["fine_grind"]);
    const potential = yieldPotential.unit === "sg" && yieldPotential.value != null ? { kind: "sg", value: yieldPotential.value } : yieldFineGrind.unit === "%" && yieldFineGrind.value != null ? { kind: "yieldPercent", value: yieldFineGrind.value } : null;
    const grainGroup = typeof f["grain_group"] === "string" ? f["grain_group"] : "";
    const maltClass = grainGroup === "roasted" ? "roast" : grainGroup === "caramel" ? "crystal" : "base";
    const timing = isObject(f["timing"]) ? f["timing"] : null;
    const timingUseRaw = typeof timing?.["use"] === "string" ? timing["use"] : "";
    const timingUse = timingUseRaw === "add_to_boil" || timingUseRaw === "add_to_fermentation" || timingUseRaw === "add_to_package" ? "add_to_boil" : "add_to_mash";
    const lateAddition = f["brewery_app_late_addition"] === true;
    return {
      id,
      ingredientId: null,
      name,
      producer: typeof f["producer"] === "string" ? f["producer"] : null,
      group: grainGroup || null,
      mashDiPh: null,
      mashTaToPh57_mEqPerKg: null,
      mashRoastDehuskedOverride: null,
      amountKg,
      colorLovibond,
      potential,
      maltClass,
      timingUse,
      lateAddition
    };
  }).filter((r) => r !== null);
  const VALID_HOP_FORMS = ["extract", "leaf", "leaf (wet)", "pellet", "powder", "plug"];
  const hopsRows = hops.map((hUnknown) => {
    if (!isObject(hUnknown)) return null;
    const h = hUnknown;
    const id = typeof h["id"] === "string" ? h["id"] : `${Date.now()}-${Math.random()}`;
    const name = typeof h["name"] === "string" ? h["name"] : "";
    if (!name) return null;
    const formRaw = typeof h["form"] === "string" ? h["form"] : "";
    const form = VALID_HOP_FORMS.includes(formRaw) ? formRaw : null;
    const amt = parseValueWithUnit(h["amount"]);
    const amountGrams = amt.unit === "g" ? safeNum(amt.value, 0) : amt.unit === "kg" ? safeNum(amt.value, 0) * 1e3 : 0;
    const alpha = parseValueWithUnit(h["alpha_acid"]);
    const alphaAcidPercent = alpha.unit === "%" ? safeNum(alpha.value, 0) : null;
    const timing = isObject(h["timing"]) ? h["timing"] : null;
    const timingUse = typeof timing?.["use"] === "string" ? timing["use"] : "";
    const savedUseRaw = typeof h["brewery_app_use"] === "string" ? h["brewery_app_use"] : "";
    const savedUse = savedUseRaw === "boil" || savedUseRaw === "whirlpool" || savedUseRaw === "dryhop" ? savedUseRaw : null;
    const use = timingUse === "add_to_fermentation" ? "dryhop" : savedUse != null ? savedUse : "boil";
    const duration = parseValueWithUnit(timing?.["duration"]);
    const timeMinutes = duration.unit === "min" ? safeNum(duration.value, 0) : null;
    return {
      id,
      ingredientId: null,
      name,
      country: typeof h["origin"] === "string" ? h["origin"] : null,
      form,
      amountGrams,
      alphaAcidPercent,
      use,
      timeMinutes
    };
  }).filter((r) => r !== null);
  const yeastRows = cultures.map((cUnknown) => {
    if (!isObject(cUnknown)) return null;
    const c = cUnknown;
    const id = typeof c["id"] === "string" ? c["id"] : `${Date.now()}-${Math.random()}`;
    const name = typeof c["name"] === "string" ? c["name"] : "";
    if (!name) return null;
    const attenuation = parseValueWithUnit(c["attenuation"]);
    const att = attenuation.unit === "%" ? safeNum(attenuation.value, 0) : null;
    const amt = parseValueWithUnit(c["amount"]);
    const amtUnit = amt.unit ?? "";
    const amtVal = amt.value;
    const amountL = amtUnit === "l" && amtVal != null && amtVal >= 0 ? amtVal : null;
    const amountKg = amtUnit === "kg" && amtVal != null && amtVal >= 0 ? amtVal : amtUnit === "g" && amtVal != null && amtVal >= 0 ? amtVal / 1e3 : null;
    return {
      id,
      ingredientId: null,
      name,
      lab: typeof c["producer"] === "string" ? c["producer"] : null,
      productId: typeof c["product_id"] === "string" ? c["product_id"] : null,
      attenuationMin: att,
      attenuationMax: att,
      amountL: amountL != null ? amountL : null,
      amountKg: amountKg != null ? amountKg : null
    };
  }).filter((r) => r !== null);
  const VALID_MISC_TYPES = ["spice", "fining", "water_agent", "herb", "flavor", "other"];
  const miscRows = misc.map((mUnknown) => {
    if (!isObject(mUnknown)) return null;
    const m = mUnknown;
    const id = typeof m["id"] === "string" ? m["id"] : `${Date.now()}-${Math.random()}`;
    const name = typeof m["name"] === "string" ? m["name"] : "";
    if (!name) return null;
    const amt = parseValueWithUnit(m["amount"]);
    const amountIsWeight = amt.unit === "kg" || amt.unit === "g";
    const amount = amt.unit === "kg" ? safeNum(amt.value, 0) : amt.unit === "g" ? safeNum(amt.value, 0) / 1e3 : amt.unit === "l" ? safeNum(amt.value, 0) : 0;
    const timing = isObject(m["timing"]) ? m["timing"] : null;
    const timingUse = typeof timing?.["use"] === "string" ? timing["use"] : "";
    const use = timingUse === "add_to_mash" ? "mash" : timingUse === "add_to_fermentation" ? "secondary" : timingUse === "add_to_package" ? "bottling" : "boil";
    const duration = parseValueWithUnit(timing?.["duration"]);
    const timeMinutes = duration.unit === "min" ? safeNum(duration.value, 0) : null;
    const typeRaw = typeof m["type"] === "string" ? m["type"] : "other";
    const type = typeRaw === "water agent" ? "water_agent" : VALID_MISC_TYPES.includes(typeRaw) ? typeRaw : "other";
    return {
      id,
      ingredientId: null,
      name,
      type,
      use,
      timeMinutes,
      amount,
      amountIsWeight,
      useFor: typeof m["use_for"] === "string" ? m["use_for"] : null,
      notes: typeof m["notes"] === "string" ? m["notes"] : null
    };
  }).filter((r) => r !== null);
  const mash = parseMashFromBeerJson(r0);
  return { gristRows, hopsRows, yeastRows, miscRows, mash };
}
function mergeYeastAttenuationRangeFromExt(yeastRows, recipeExtJson) {
  const ext = recipeExtJson && typeof recipeExtJson === "object" && !Array.isArray(recipeExtJson) ? recipeExtJson : null;
  const range = ext?.["yeastAttenuationRange"];
  if (!range || typeof range !== "object" || Array.isArray(range)) return yeastRows;
  const rangeObj = range;
  return yeastRows.map((row) => {
    const entry = rangeObj[row.id];
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return row;
    const e = entry;
    const min = typeof e["min"] === "number" && Number.isFinite(e["min"]) && e["min"] >= 0 && e["min"] <= 100 ? e["min"] : null;
    const max = typeof e["max"] === "number" && Number.isFinite(e["max"]) && e["max"] >= 0 && e["max"] <= 100 ? e["max"] : null;
    if (min == null && max == null) return row;
    return {
      ...row,
      attenuationMin: min ?? row.attenuationMin,
      attenuationMax: max ?? row.attenuationMax
    };
  });
}
export {
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
};
