import type { EditorMashStepType } from "./editorTypes.js";

export const VALID_MASH_STEP_TYPES: EditorMashStepType[] = [
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
