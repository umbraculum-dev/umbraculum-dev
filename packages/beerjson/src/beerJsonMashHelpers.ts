import type { EditorMash, EditorMashStep, EditorMashStepType } from "./editorTypes.js";
import { isObject, parseValueWithUnit, VALID_MASH_STEP_TYPES } from "./beerJsonPrimitives.js";

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
