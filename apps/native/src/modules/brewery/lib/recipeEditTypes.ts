export type PickerOption = { value: string; label: string };

export type Recipe = {
  id: string;
  name: string;
  style: string | null;
  styleKey?: string | null;
  notes: string | null;
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
};

export type StyleListItem = { key: string; name: string; code: string; sortOrder: number };

export type EquipmentProfile = {
  id: string;
  name: string;
  equipment: { kettle: Record<string, unknown>; mash: Record<string, unknown>; misc: Record<string, unknown> };
};

export type FermentableSearchItem = {
  id: string;
  name: string;
  producer?: string | null;
  group?: string | null;
  colorLovibond?: number | null;
  yieldPercent?: number | null;
  ppg?: number | null;
};

export type HopSearchItem = {
  id: string;
  name: string;
  country?: string | null;
  alphaMin?: number | null;
  alphaMax?: number | null;
};

export type YeastSearchItem = {
  id: string;
  name: string;
  lab?: string | null;
  attenuationMin?: number | null;
  attenuationMax?: number | null;
};
