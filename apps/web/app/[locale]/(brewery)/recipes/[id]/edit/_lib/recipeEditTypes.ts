import type {
  EditorGristRow,
  EditorHopRow,
  EditorMiscRow,
  EditorYeastRow,
} from "../../../_lib/beerjsonRecipe";
import type { NumberFormatHintV1, WaterCalcDerivation } from "@umbraculum/contracts";

export interface Recipe {
  id: string;
  accountId: string;
  name: string;
  style: string | null;
  version?: number;
  versionGroupId?: string;
  styleKey?: string | null;
  notes: string | null;
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
  /** Gravity analysis attached by `GET /recipes/:id` (see `GravityAnalysisResponseV1`). */
  analysis?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeVersionListItem {
  id: string;
  version: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface StyleListItem {
  key: string;
  name: string;
  code: string;
  sortOrder: number;
}

export interface EquipmentProfile {
  id: string;
  name: string;
  equipment: {
    kettle: Record<string, unknown>;
    mash: Record<string, unknown>;
    misc: Record<string, unknown>;
  };
}

/**
 * Search-result DTOs for the `/api/ingredients/*` endpoints.
 *
 * The API returns Prisma rows plus a few derived fields. We declare them locally
 * (instead of importing Prisma types into apps/web) so the contract is documented
 * at the consumer side and the editor is `any`-free.
 */
export interface FermentableSearchResult {
  id: string;
  name: string;
  producer?: string | null;
  group?: string | null;
  type?: string | null;
  notes?: string | null;
  country?: string | null;
  colorEbc?: number | null;
  colorLovibond?: number | null;
  yieldPercent?: number | null;
  ppg?: number | null;
  mashDiPh?: number | null;
  mashTaToPh57_mEqPerKg?: number | null;
}

export interface HopSearchResult {
  id: string;
  name: string;
  country?: string | null;
  type?: string | null;
  alphaMin?: number | null;
  alphaMax?: number | null;
  betaMin?: number | null;
  betaMax?: number | null;
}

export interface YeastSearchResult {
  id: string;
  name: string;
  lab?: string | null;
  productId?: string | null;
  attenuationMin?: number | null;
  attenuationMax?: number | null;
}

/** A `Record`-style alias for `formatHints` so we can index by an arbitrary string field name. */
export type FormatHintsRecord = Record<string, NumberFormatHintV1 | undefined>;
/** Same trick for `derivations` keyed by an arbitrary derivation id. */
export type DerivationsRecord = Record<string, WaterCalcDerivation | undefined>;

export type GristRow = EditorGristRow;
export type GristMaltClass = EditorGristRow["maltClass"];
export type GristPotential = EditorGristRow["potential"];
export type GristPotentialKind = NonNullable<GristPotential>["kind"];
export type HopRow = EditorHopRow;
export type _YeastRow = EditorYeastRow;
export type MiscRow = EditorMiscRow;

export type HopUse = "boil" | "whirlpool" | "dryhop";
export type MiscType = EditorMiscRow["type"];
export type MiscUse = EditorMiscRow["use"];
