import { XMLParser } from "fast-xml-parser";

import { isObject } from "../../lib/typeGuards.js";

import type { BeerXmlRecipe, XmlNode } from "./beerxmlTypes.js";

export function newId() {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

export function asArray<T>(v: unknown): T[] {
  if (v == null) return [];
  return Array.isArray(v) ? (v as T[]) : ([v] as T[]);
}

export function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function parseBeerXml(xml: string): XmlNode {
  if (xml.includes("<!DOCTYPE") || xml.includes("<!ENTITY")) {
    throw new Error("BeerXML: DOCTYPE/ENTITY is not allowed");
  }

  const parser = new XMLParser({
    ignoreAttributes: true,
    attributeNamePrefix: "",
    allowBooleanAttributes: true,
    trimValues: true,
    parseTagValue: true,
  });

  const parsed: unknown = parser.parse(xml);
  return isObject(parsed) ? parsed : {};
}

export function extractBeerXmlRecipes(doc: XmlNode): BeerXmlRecipe[] {
  const recipesNode = isObject(doc["RECIPES"]) ? doc["RECIPES"] : null;
  const raw = recipesNode?.["RECIPE"] ?? doc["RECIPE"] ?? null;
  return asArray<unknown>(raw).filter((r): r is BeerXmlRecipe => isObject(r));
}
