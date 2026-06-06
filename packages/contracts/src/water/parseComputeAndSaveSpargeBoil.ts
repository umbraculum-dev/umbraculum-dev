import type { BoilComputeAndSaveResponseV1, SpargeComputeAndSaveResponseV1 } from "./computeAndSave.js";

import {
  parseBoilAcidBlock,
  parseDerivation,
  parseFormatHints,
  parseOverallResult,
  parseSaltAdditionsResult,
  parseSettingsSavedRef,
  parseSpargeAcidBlock,
} from "./parseComputeAndSaveShared.js";

function isObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

export function parseSpargeComputeAndSaveResponse(x: unknown): SpargeComputeAndSaveResponseV1 {
  if (!isObject(x)) throw new Error("Invalid SpargeComputeAndSaveResponseV1");
  if (x['ok'] !== true) throw new Error("Invalid SpargeComputeAndSaveResponseV1.ok");
  if (x['version'] !== 1) throw new Error("Invalid SpargeComputeAndSaveResponseV1.version");

  const salts = isObject(x['salts']) ? x['salts'] : {};
  const acid = x['acid'];

  const formatHints = parseFormatHints(x);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(x['settings'], "SpargeComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts['result'], "SpargeComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts['derivation'], "SpargeComputeAndSaveResponseV1.salts.derivation"),
    },
    acid: parseSpargeAcidBlock(acid, "SpargeComputeAndSaveResponseV1.acid"),
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : undefined,
  };
}

export function parseBoilComputeAndSaveResponse(x: unknown): BoilComputeAndSaveResponseV1 {
  if (!isObject(x)) throw new Error("Invalid BoilComputeAndSaveResponseV1");
  if (x['ok'] !== true) throw new Error("Invalid BoilComputeAndSaveResponseV1.ok");
  if (x['version'] !== 1) throw new Error("Invalid BoilComputeAndSaveResponseV1.version");

  const salts = isObject(x['salts']) ? x['salts'] : {};
  const acid = x['acid'];
  const overall = isObject(x['overall']) ? x['overall'] : {};

  const formatHints = parseFormatHints(x);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(x['settings'], "BoilComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts['result'], "BoilComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts['derivation'], "BoilComputeAndSaveResponseV1.salts.derivation"),
    },
    acid: parseBoilAcidBlock(acid, "BoilComputeAndSaveResponseV1.acid"),
    overall: {
      result: parseOverallResult(overall['result'], "BoilComputeAndSaveResponseV1.overall.result"),
      derivation: parseDerivation(overall['derivation'], "BoilComputeAndSaveResponseV1.overall.derivation"),
    },
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : undefined,
  };
}
