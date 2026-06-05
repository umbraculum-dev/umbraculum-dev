export type InventoryCategory =
  | "fermentable"
  | "hop"
  | "speciality"
  | "acid_salt"
  | "detergent_sanitizer"
  | "kegging";

export type InventoryUnit = "kg" | "g" | "ml" | "count";

export type InventoryItem = {
  id: string;
  workspaceId: string;
  category: InventoryCategory;
  ingredientId: string | null;
  name: string;
  quantity: number;
  unit: InventoryUnit;
  metadataJson: unknown | null;
  createdAt: string;
  updatedAt: string;
};

export type FermentableSearchItem = {
  id: string;
  name: string;
  producer?: string | null;
  colorLovibond?: number | null;
  yieldPercent?: number | null;
  ppg?: number | null;
};

export type HopSearchItem = {
  id: string;
  name: string;
  type?: string | null;
  alphaMin?: number | null;
  alphaMax?: number | null;
};

export const ACID_SALT_OPTIONS: Array<{ value: string; label: string; unit: InventoryUnit }> = [
  { value: "lactic_acid", label: "Lactic acid", unit: "ml" },
  { value: "phosphoric_acid", label: "Phosphoric acid", unit: "ml" },
  { value: "citric_acid", label: "Citric acid", unit: "ml" },
  { value: "gypsum", label: "Gypsum (CaSO4·2H2O)", unit: "g" },
  { value: "calcium_chloride", label: "Calcium chloride (CaCl2·2H2O)", unit: "g" },
  { value: "epsom", label: "Epsom salt (MgSO4·7H2O)", unit: "g" },
  { value: "table_salt", label: "Table salt (NaCl)", unit: "g" },
  { value: "baking_soda", label: "Baking soda (NaHCO3)", unit: "g" },
];

export const DEFAULT_UNIT: Record<InventoryCategory, InventoryUnit> = {
  fermentable: "kg",
  hop: "kg",
  speciality: "kg",
  acid_salt: "g",
  detergent_sanitizer: "ml",
  kegging: "count",
};

export const PUBLIC_DB_PAGE_SIZE = 20;
