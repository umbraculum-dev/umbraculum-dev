import { platoToSg } from "@umbraculum/brewery-core";

import type { EditorGristRow, EditorHopRow, EditorMiscRow, EditorYeastRow } from "./editorTypes.js";

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
