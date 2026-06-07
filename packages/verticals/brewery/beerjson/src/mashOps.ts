import {
  buildMashProcedure,
  VALID_MASH_STEP_TYPES,
  type BeerJsonDocument,
  type BeerJsonRecipe,
} from "./beerJsonHelpers";
import type { EditorMash } from "./editorTypes";

export function newMashRowId(): string {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

export function validateMashBeforeSave(mash: EditorMash): { ok: true } | { ok: false; errors: string } {
  if (!mash) return { ok: true };
  if (typeof mash.name !== "string" || !mash.name.trim()) {
    return { ok: false, errors: "Mash procedure name is required" };
  }
  if (typeof mash.grainTemperatureC !== "number" || !Number.isFinite(mash.grainTemperatureC)) {
    return { ok: false, errors: "Grain temperature must be a valid number" };
  }
  if (mash.grainTemperatureC < -20 || mash.grainTemperatureC > 100) {
    return { ok: false, errors: "Grain temperature must be between -20 and 100 °C" };
  }
  if (!Array.isArray(mash.steps)) {
    return { ok: false, errors: "Mash steps must be an array" };
  }
  if (mash.steps.length === 0) {
    return { ok: true };
  }
  const errs: string[] = [];
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
      errs.push(`Step ${idx + 1}: step temperature must be between 0 and 100 °C`);
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

export function replaceMashInBeerJsonDocument(
  doc: unknown,
  mash: EditorMash | null,
): BeerJsonDocument {
  const cloned = JSON.parse(JSON.stringify(doc)) as {
    beerjson?: { version?: number; recipes?: BeerJsonRecipe[] };
  };
  const r0 = cloned?.beerjson?.recipes?.[0];
  if (!r0 || typeof r0 !== "object") {
    return cloned as BeerJsonDocument;
  }
  const mashProc = buildMashProcedure(mash);
  if (mashProc) {
    r0['mash'] = mashProc;
  } else {
    delete r0['mash'];
  }
  return cloned as BeerJsonDocument;
}

export function mergeMashDeduceFromExt(mash: EditorMash | null, recipeExtJson: unknown): EditorMash | null {
  if (!mash || !mash.steps.length) return mash;
  const ext = recipeExtJson && typeof recipeExtJson === "object" && !Array.isArray(recipeExtJson) ? (recipeExtJson as Record<string, unknown>) : null;
  const map =
    ext?.['mashStepDeduceFromMashIn'] && typeof ext['mashStepDeduceFromMashIn'] === "object" && !Array.isArray(ext['mashStepDeduceFromMashIn'])
      ? (ext['mashStepDeduceFromMashIn'] as Record<string, boolean>)
      : null;

  if (!map) return mash;

  const steps = mash.steps.map((s, idx) => {
    const deduceByIndex = map[String(idx)] === true;
    const deduceById = map[s.id] === true;
    return {
      ...s,
      deduceFromMashIn: deduceByIndex || deduceById,
    };
  });
  return { ...mash, steps };
}
