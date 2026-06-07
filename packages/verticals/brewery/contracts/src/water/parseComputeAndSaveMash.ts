import type { MashComputeAndSaveResponseV1 } from "./computeAndSave.js";

import {
  parseDerivation,
  parseFormatHints,
  parseMashAcidBlock,
  parseOverallResult,
  parseSaltAdditionsResult,
  parseSettingsSavedRef,
} from "./parseComputeAndSaveShared.js";

function isObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

export function parseMashComputeAndSaveResponse(x: unknown): MashComputeAndSaveResponseV1 {
  if (!isObject(x)) throw new Error("Invalid MashComputeAndSaveResponseV1");
  if (x['ok'] !== true) throw new Error("Invalid MashComputeAndSaveResponseV1.ok");
  if (x['version'] !== 1) throw new Error("Invalid MashComputeAndSaveResponseV1.version");

  const salts = isObject(x['salts']) ? x['salts'] : {};
  const acid = x['acid'];
  const overall = isObject(x['overall']) ? x['overall'] : {};

  const formatHints = parseFormatHints(x);
  return {
    ok: true,
    version: 1,
    settings: parseSettingsSavedRef(x['settings'], "MashComputeAndSaveResponseV1.settings"),
    salts: {
      result: parseSaltAdditionsResult(salts['result'], "MashComputeAndSaveResponseV1.salts.result"),
      derivation: parseDerivation(salts['derivation'], "MashComputeAndSaveResponseV1.salts.derivation"),
    },
    acid: parseMashAcidBlock(acid, "MashComputeAndSaveResponseV1.acid"),
    overall: {
      result: parseOverallResult(overall['result'], "MashComputeAndSaveResponseV1.overall.result"),
      derivation: parseDerivation(overall['derivation'], "MashComputeAndSaveResponseV1.overall.derivation"),
    },
    formatHints: Object.keys(formatHints).length > 0 ? formatHints : undefined,
  };
}
