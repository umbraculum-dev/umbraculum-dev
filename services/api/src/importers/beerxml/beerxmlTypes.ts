export type ImportWarning = { code: string; message: string };
export type StyleCandidate = { name?: string | null; code?: string | null };

/**
 * BeerJSON output is intentionally typed as `Record<string, unknown>` here:
 * the BeerJSON spec is large and we only assemble a minimal subset, while
 * downstream consumers (DB Json columns, contracts validators) tolerate any
 * additional fields. A full BeerJSON type is out of scope for this importer
 * and would conflict with the "additionalProperties is not false" comment
 * below on grain rows.
 */
export type BeerJsonRecipeOut = Record<string, unknown>;
export type BeerJsonDocument = {
  beerjson: {
    version: number;
    recipes: BeerJsonRecipeOut[];
  };
};

/**
 * Shapes returned by `fast-xml-parser` for BeerXML — a forgiving "anything
 * goes" tree with all leaves typed as `unknown`. Each consumer narrows the
 * fields it touches via type guards (`isObject`, `typeof`, etc.) — the same
 * pattern used elsewhere in the codebase for untrusted JSON.
 */
export type XmlNode = Record<string, unknown>;
export type BeerXmlRecipe = XmlNode;

export type BeerXmlGristRow = {
  id: string;
  name: string;
  amountKg: number;
  colorLovibond: number | null;
  potential: { kind: "ppg" | "yieldPercent" | "sg"; value: number } | null;
  maltClass: "base" | "crystal" | "roast" | "acid";
  addAfterBoil?: boolean;
};

export type BeerXmlHopRow = {
  id: string;
  name: string;
  country?: string | null;
  amountGrams: number;
  alphaAcidPercent: number | null;
  use: "boil" | "whirlpool" | "dryhop";
  timeMinutes: number | null;
};

export type BeerXmlYeastRow = {
  id: string;
  name: string;
  lab?: string | null;
  productId?: string | null;
  attenuationMin?: number | null;
  attenuationMax?: number | null;
};

export type BeerXmlMiscRow = {
  id: string;
  name: string;
  type: "spice" | "fining" | "water_agent" | "herb" | "flavor" | "other";
  use: "boil" | "mash" | "primary" | "secondary" | "bottling";
  timeMinutes: number | null;
  amount: number;
  amountIsWeight: boolean;
  useFor?: string | null;
  notes?: string | null;
};

export type LegacyImportResult = {
  recipeName: string;
  notes: string | null;
  batchSizeLiters: number;
  gristJson: BeerXmlGristRow[];
  hopsJson: BeerXmlHopRow[];
  yeastJson: BeerXmlYeastRow[];
  miscJson: BeerXmlMiscRow[];
  warnings: ImportWarning[];
};
