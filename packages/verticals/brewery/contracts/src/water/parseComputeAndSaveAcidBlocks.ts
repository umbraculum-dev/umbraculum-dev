import type {
  BoilAcidComputeBlock,
  MashAcidComputeBlock,
  SpargeAcidComputeBlock,
} from "./computeAndSave";
import type { NumberFormatHintV1, NumberFormatUnit } from "@umbraculum/contracts";

import { parseDerivation } from "./parseComputeAndSaveDerivation.js";
import {
  parseAcidificationManualResult,
  parseAcidificationResult,
  parseMashTargetMashPhResult,
} from "./parseComputeAndSaveResultParsers.js";

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

export function parseMashAcidBlock(v: unknown, label: string): MashAcidComputeBlock {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const kind = v['kind'];
  if (kind === "mash_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(v['result'], `${label}.result`),
      derivation: parseDerivation(v['derivation'], `${label}.derivation`),
    };
  }
  if (kind === "mash_acidification_target_mash_ph") {
    return {
      kind,
      mode: "targetPh",
      result: parseMashTargetMashPhResult(v['result'], `${label}.result`),
      derivation: parseDerivation(v['derivation'], `${label}.derivation`),
    };
  }
  if (kind === "mash_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(v['result'], `${label}.result`),
      derivation: parseDerivation(v['derivation'], `${label}.derivation`),
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}

export function parseSpargeAcidBlock(v: unknown, label: string): SpargeAcidComputeBlock {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const kind = v['kind'];
  if (kind === "sparge_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(v['result'], `${label}.result`),
      derivation: parseDerivation(v['derivation'], `${label}.derivation`),
    };
  }
  if (kind === "sparge_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(v['result'], `${label}.result`),
      derivation: parseDerivation(v['derivation'], `${label}.derivation`),
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}

export function parseBoilAcidBlock(v: unknown, label: string): BoilAcidComputeBlock {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  const kind = v['kind'];
  if (kind === "boil_acidification_manual") {
    return {
      kind,
      mode: "manual",
      result: parseAcidificationManualResult(v['result'], `${label}.result`),
      derivation: parseDerivation(v['derivation'], `${label}.derivation`),
    };
  }
  if (kind === "boil_acidification") {
    return {
      kind,
      mode: "targetPh",
      result: parseAcidificationResult(v['result'], `${label}.result`),
      derivation: parseDerivation(v['derivation'], `${label}.derivation`),
    };
  }
  throw new Error(`Invalid ${label}.kind`);
}

export function parseNumberFormatHintV1(v: unknown, label: string): NumberFormatHintV1 {
  if (!isObject(v)) throw new Error(`Invalid ${label}`);
  if (v['version'] !== 1) throw new Error(`Invalid ${label}.version`);
  const style = v['style'] === "fixed" || v['style'] === "significant" ? v['style'] : null;
  if (!style) throw new Error(`Invalid ${label}.style`);
  const decimals = isFiniteNumber(v['decimals']) ? v['decimals'] : NaN;
  if (!Number.isFinite(decimals) || decimals < 0) throw new Error(`Invalid ${label}.decimals`);
  const unitRaw = typeof v['unit'] === "string" ? v['unit'] : undefined;
  const clamp = isObject(v['clamp'])
    ? {
        min: isFiniteNumber(v['clamp']['min']) ? v['clamp']['min'] : undefined,
        max: isFiniteNumber(v['clamp']['max']) ? v['clamp']['max'] : undefined,
      }
    : undefined;
  return { version: 1, style, decimals, unit: unitRaw as NumberFormatUnit | undefined, clamp };
}

export function parseFormatHints(root: Record<string, unknown>): Record<string, NumberFormatHintV1> {
  const hintsOut: Record<string, NumberFormatHintV1> = {};
  const h = root['formatHints'];
  if (isObject(h)) {
    for (const [k, val] of Object.entries(h)) {
      try {
        hintsOut[k] = parseNumberFormatHintV1(val, `formatHints.${k}`);
      } catch {
        // ignore invalid hint entries
      }
    }
  }
  return hintsOut;
}
