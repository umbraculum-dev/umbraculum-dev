import { platoToSg } from "@umbraculum/brewery-core";

import type {
  EditorGristRow,
  EditorHopRow,
  EditorMash,
  EditorMashStep,
  EditorMashStepType,
  EditorMiscRow,
  EditorYeastRow,
} from "./editorTypes";

const VALID_MASH_STEP_TYPES: EditorMashStepType[] = [
  "infusion",
  "temperature",
  "decoction",
  "souring mash",
  "souring wort",
  "drain mash tun",
  "sparge",
];

export type BeerJsonRecipe = Record<string, unknown>;

export type BeerJsonDocument = {
  beerjson: {
    version: number;
    recipes: BeerJsonRecipe[];
  };
};

export function isObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

export function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function parseValueWithUnit(v: unknown): { unit: string | null; value: number | null } {
  if (!isObject(v)) return { unit: null, value: null };
  const unit = typeof v['unit'] === "string" ? v['unit'] : null;
  const value = isFiniteNumber(v['value']) ? v['value'] : null;
  return { unit, value };
}

export function safeNum(v: unknown, fallback: number) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function ppgToSg(ppg: number) {
  return 1 + ppg / 1000;
}

function maltClassToGrainGroup(maltClass: EditorGristRow["maltClass"]) {
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

function hopUseToTiming(use: EditorHopRow["use"], timeMinutes: number | null): Record<string, unknown> {
  const timing: Record<string, unknown> = { use: use === "dryhop" ? "add_to_fermentation" : "add_to_boil" };
  if (typeof timeMinutes === "number" && Number.isFinite(timeMinutes)) {
    timing['duration'] = { unit: "min", value: Math.max(0, Math.round(timeMinutes)) };
  }
  return timing;
}

function miscUseToTiming(use: EditorMiscRow["use"], timeMinutes: number | null): Record<string, unknown> {
  const useMap: Record<EditorMiscRow["use"], string> = {
    mash: "add_to_mash",
    boil: "add_to_boil",
    primary: "add_to_fermentation",
    secondary: "add_to_fermentation",
    bottling: "add_to_package",
  };
  const timing: Record<string, unknown> = { use: useMap[use] ?? "add_to_boil" };
  if (typeof timeMinutes === "number" && Number.isFinite(timeMinutes)) {
    timing['duration'] = { unit: "min", value: Math.max(0, Math.round(timeMinutes)) };
  }
  return timing;
}

function miscTypeToBeerJsonType(t: EditorMiscRow["type"]) {
  return t === "water_agent" ? "water agent" : t;
}

export function buildFermentableAddition(row: EditorGristRow) {
  let sgValue: number | null = null;
  if (row.potential?.kind === "sg") {
    sgValue = row.potential.value;
  } else if (row.potential?.kind === "ppg") {
    sgValue = ppgToSg(row.potential.value);
  } else if (row.potential?.kind === "plato") {
    sgValue = platoToSg(row.potential.value);
  }
  const yieldObj =
    row.potential?.kind === "yieldPercent"
      ? { fine_grind: { unit: "%", value: row.potential.value } }
      : sgValue != null && sgValue > 1
        ? { potential: { unit: "sg", value: sgValue } }
        : { fine_grind: { unit: "%", value: 0 } };

  const colorLovibond =
    typeof row.colorLovibond === "number" && Number.isFinite(row.colorLovibond) && row.colorLovibond >= 0
      ? row.colorLovibond
      : null;

  const timingUse = row.timingUse ?? "add_to_mash";
  return {
    id: row.id,
    name: row.name,
    type: "grain",
    producer: row.producer ?? undefined,
    grain_group: maltClassToGrainGroup(row.maltClass),
    yield: yieldObj,
    ...(colorLovibond === null ? {} : { color: { unit: "Lovi", value: colorLovibond } }),
    amount: { unit: "kg", value: row.amountKg },
    timing: { use: timingUse },
    ...(row.lateAddition === true ? { brewery_app_late_addition: true } : {}),
  };
}

export function buildHopAddition(row: EditorHopRow) {
  const formRaw = row.form ?? null;
  const formForBeerJson =
    formRaw === "extract" || formRaw === "leaf" || formRaw === "leaf (wet)" || formRaw === "pellet" || formRaw === "powder" || formRaw === "plug"
      ? formRaw
      : formRaw === "debittered_leaf"
        ? "leaf"
        : formRaw === "hop_extract"
          ? "extract"
        : null;
  return {
    id: row.id,
    name: row.name,
    origin: row.country ?? undefined,
    ...(formForBeerJson ? { form: formForBeerJson } : {}),
    alpha_acid: { unit: "%", value: row.alphaAcidPercent ?? 0 },
    amount: { unit: "g", value: row.amountGrams },
    timing: hopUseToTiming(row.use, row.timeMinutes),
    brewery_app_use: row.use,
  };
}

export function buildCultureAddition(row: EditorYeastRow) {
  const attMin = typeof row.attenuationMin === "number" && Number.isFinite(row.attenuationMin) ? row.attenuationMin : null;
  const attMax = typeof row.attenuationMax === "number" && Number.isFinite(row.attenuationMax) ? row.attenuationMax : null;
  const attenuation =
    attMin != null && attMax != null ? (attMin + attMax) / 2 : attMin != null ? attMin : attMax != null ? attMax : null;
  const amountL =
    typeof row.amountL === "number" && Number.isFinite(row.amountL) && row.amountL >= 0 ? row.amountL : null;
  const amountKg =
    typeof row.amountKg === "number" && Number.isFinite(row.amountKg) && row.amountKg >= 0 ? row.amountKg : null;
  const format = row.format === "dry" || row.format === "liquid" || row.format === "slurry" ? row.format : null;
  let amount: { unit: string; value: number };
  if (format === "dry" && amountKg != null) {
    amount = { unit: "kg", value: amountKg };
  } else if (amountL != null) {
    amount = { unit: "l", value: amountL };
  } else {
    amount = { unit: "pkg", value: 1 };
  }
  const out: Record<string, unknown> = {
    id: row.id,
    name: row.name,
    type: "ale",
    form: "dry",
    producer: row.lab ?? undefined,
    product_id: row.productId ?? undefined,
    amount,
  };
  if (attenuation != null) out['attenuation'] = { unit: "%", value: attenuation };
  return out;
}

export function buildMiscAddition(row: EditorMiscRow): Record<string, unknown> {
  const out: Record<string, unknown> = {
    id: row.id,
    name: row.name,
    type: miscTypeToBeerJsonType(row.type),
    timing: miscUseToTiming(row.use, row.timeMinutes),
    amount: row.amountIsWeight ? { unit: "kg", value: row.amount } : { unit: "l", value: row.amount },
  };
  if (row.useFor) out['use_for'] = row.useFor;
  if (row.notes) out['notes'] = row.notes;
  return out;
}

function buildMashStep(step: EditorMashStep): Record<string, unknown> {
  const out: Record<string, unknown> = {
    name: step.name,
    type: step.type,
    step_temperature: { unit: "C" as const, value: step.stepTemperatureC },
    step_time: { unit: "min" as const, value: Math.max(0, step.stepTimeMin) },
  };
  if (step.amountL != null && Number.isFinite(step.amountL) && step.amountL >= 0) {
    out['amount'] = { unit: "l" as const, value: step.amountL };
  }
  if (step.rampTimeMin != null && Number.isFinite(step.rampTimeMin) && step.rampTimeMin >= 0) {
    out['ramp_time'] = { unit: "min" as const, value: step.rampTimeMin };
  }
  if (step.endTemperatureC != null && Number.isFinite(step.endTemperatureC)) {
    out['end_temperature'] = { unit: "C" as const, value: step.endTemperatureC };
  }
  if (step.infuseTemperatureC != null && Number.isFinite(step.infuseTemperatureC)) {
    out['infuse_temperature'] = { unit: "C" as const, value: step.infuseTemperatureC };
  }
  if (typeof step.description === "string" && step.description.trim()) {
    out['description'] = step.description.trim();
  }
  return out;
}

export function buildMashProcedure(mash: EditorMash): Record<string, unknown> | null {
  if (!mash || !mash.steps.length) return null;
  return {
    name: mash.name,
    grain_temperature: { unit: "C" as const, value: mash.grainTemperatureC },
    mash_steps: mash.steps.map(buildMashStep),
    ...(typeof mash.notes === "string" && mash.notes.trim() ? { notes: mash.notes.trim() } : {}),
  };
}

export function parseMashFromBeerJson(r0: unknown): EditorMash {
  if (!isObject(r0)) return null;
  if (!isObject(r0['mash'])) return null;
  const mash = r0['mash'];

  const name = typeof mash['name'] === "string" ? mash['name'].trim() : "";

  const gt = parseValueWithUnit(mash['grain_temperature']);
  const grainTemp =
    gt.unit === "C" && gt.value != null
      ? gt.value
      : gt.unit === "F" && gt.value != null
        ? ((gt.value - 32) * 5) / 9
        : null;
  if (!name || grainTemp == null) return null;

  const stepsRaw = Array.isArray(mash['mash_steps']) ? mash['mash_steps'] : [];
  const steps: EditorMashStep[] = stepsRaw
    .map((sUnknown: unknown, idx: number): EditorMashStep | null => {
      if (!isObject(sUnknown)) return null;
      const s = sUnknown;

      const stepName = typeof s['name'] === "string" ? s['name'].trim() : "";
      const typeRaw = typeof s['type'] === "string" ? s['type'] : "";
      const type: EditorMashStepType = VALID_MASH_STEP_TYPES.includes(typeRaw as EditorMashStepType)
        ? (typeRaw as EditorMashStepType)
        : "infusion";

      const stTemp = parseValueWithUnit(s['step_temperature']);
      const stepTemp =
        stTemp.unit === "C" && stTemp.value != null
          ? stTemp.value
          : stTemp.unit === "F" && stTemp.value != null
            ? ((stTemp.value - 32) * 5) / 9
            : null;

      const stTime = parseValueWithUnit(s['step_time']);
      const stepTime = stTime.unit === "min" && stTime.value != null ? stTime.value : null;

      if (!stepName || stepTemp == null || stepTime == null) return null;

      const amt = parseValueWithUnit(s['amount']);
      const amountL =
        amt.unit === "l" && amt.value != null
          ? amt.value
          : amt.unit === "ml" && amt.value != null
            ? amt.value / 1000
            : null;

      const ramp = parseValueWithUnit(s['ramp_time']);
      const rampTimeMin = ramp.unit === "min" && ramp.value != null && ramp.value >= 0 ? ramp.value : null;

      const endT = parseValueWithUnit(s['end_temperature']);
      const endTemp =
        endT.unit === "C" && endT.value != null
          ? endT.value
          : endT.unit === "F" && endT.value != null
            ? ((endT.value - 32) * 5) / 9
            : null;

      const inf = parseValueWithUnit(s['infuse_temperature']);
      const infuseTemp =
        inf.unit === "C" && inf.value != null
          ? inf.value
          : inf.unit === "F" && inf.value != null
            ? ((inf.value - 32) * 5) / 9
            : null;

      const description = typeof s['description'] === "string" ? s['description'].trim() || null : null;

      return {
        id: typeof s['id'] === "string" ? s['id'] : `mash-step-${idx}`,
        name: stepName,
        type,
        stepTemperatureC: stepTemp,
        stepTimeMin: Math.max(0, stepTime),
        amountL: amountL ?? undefined,
        rampTimeMin: rampTimeMin ?? undefined,
        endTemperatureC: endTemp ?? undefined,
        infuseTemperatureC: infuseTemp ?? undefined,
        description: description ?? undefined,
      };
    })
    .filter((s): s is EditorMashStep => s !== null);

  if (steps.length === 0) return null;

  return {
    name,
    grainTemperatureC: grainTemp,
    steps,
    notes: typeof mash['notes'] === "string" ? mash['notes'].trim() || undefined : undefined,
  };
}

export { VALID_MASH_STEP_TYPES };
