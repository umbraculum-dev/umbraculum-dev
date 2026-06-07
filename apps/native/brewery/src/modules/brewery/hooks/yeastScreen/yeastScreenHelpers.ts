export function formatFixed(locale: string, value: number, fractionDigits: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function newRowId(): string {
  try {
    const g = globalThis as { crypto?: { randomUUID?: () => string } };
    return g.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

export type PickerOption = { value: string; label: string };

export const YEAST_FORMAT_OPTIONS: PickerOption[] = [
  { value: "dry", label: "Dry" },
  { value: "liquid", label: "Liquid" },
  { value: "slurry", label: "Slurry" },
];

export const YES_NO_OPTIONS: PickerOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const SPECIES_OPTIONS: PickerOption[] = [
  { value: "saccharomyces_cerevisiae", label: "Saccharomyces cerevisiae" },
  { value: "saccharomyces_pastorianus", label: "Saccharomyces pastorianus" },
  { value: "brettanomyces", label: "Brettanomyces" },
  { value: "diastaticus", label: "Diastaticus" },
  { value: "other", label: "Other" },
];

export type Recipe = {
  id: string;
  name?: string;
  styleKey?: string | null;
  notes?: string | null;
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
  analysis?: { result?: { ogEstimatedSg?: number; kettleVolumeLiters?: number } } | null;
};

export type YeastSearchResult = {
  id: string;
  name: string;
  lab?: string | null;
  productId?: string | null;
  attenuationMin?: number;
  attenuationMax?: number;
};
