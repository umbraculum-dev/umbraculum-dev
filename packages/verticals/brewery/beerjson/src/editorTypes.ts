type GristPotential =
  | { kind: "ppg"; value: number }
  | { kind: "yieldPercent"; value: number }
  | { kind: "sg"; value: number }
  | { kind: "plato"; value: number }
  | null;

export type EditorGristRow = {
  id: string;
  ingredientId?: string | null | undefined;
  name: string;
  producer?: string | null | undefined;
  group?: string | null | undefined;
  mashDiPh?: number | null | undefined;
  mashTaToPh57_mEqPerKg?: number | null | undefined;
  mashRoastDehuskedOverride?: boolean | null | undefined;
  mashRoastDehuskedSource?: "unknown" | "inferred" | "override" | undefined;
  mashPhModelSource?: "unknown" | "default" | "override" | undefined;
  amountKg: number;
  colorLovibond: number | null;
  potential: GristPotential;
  maltClass: "base" | "crystal" | "roast" | "acid";
  timingUse?: "add_to_mash" | "add_to_boil" | undefined;
  lateAddition?: boolean | undefined;
};

export type EditorHopRow = {
  id: string;
  ingredientId: string | null;
  name: string;
  country?: string | null | undefined;
  form?:
    | "extract"
    | "leaf"
    | "leaf (wet)"
    | "pellet"
    | "powder"
    | "plug"
    | "debittered_leaf"
    | "hop_extract"
    | null
    | undefined;
  amountGrams: number;
  alphaAcidPercent: number | null;
  use: "boil" | "whirlpool" | "dryhop";
  timeMinutes: number | null;
};

export type YeastPitchRateKey =
  | "mfg_rec_0_35_ales"
  | "mfg_rec_0_5_ales"
  | "pro_0_75_ales"
  | "pro_1_0_ales"
  | "pro_1_25_ales"
  | "pro_1_5_lager"
  | "pro_1_75_lager"
  | "pro_2_0_lager";

export const PITCH_RATE_TO_MILLION_CELLS_PER_ML_P: Record<YeastPitchRateKey, number> = {
  mfg_rec_0_35_ales: 0.35,
  mfg_rec_0_5_ales: 0.5,
  pro_0_75_ales: 0.75,
  pro_1_0_ales: 1.0,
  pro_1_25_ales: 1.25,
  pro_1_5_lager: 1.5,
  pro_1_75_lager: 1.75,
  pro_2_0_lager: 2.0,
};

export const YEAST_PITCH_RATE_OPTIONS: { value: YeastPitchRateKey; labelKey: string }[] = [
  { value: "mfg_rec_0_35_ales", labelKey: "yeastPitchRateMfgRec035Ales" },
  { value: "mfg_rec_0_5_ales", labelKey: "yeastPitchRateMfgRec05Ales" },
  { value: "pro_0_75_ales", labelKey: "yeastPitchRatePro075Ales" },
  { value: "pro_1_0_ales", labelKey: "yeastPitchRatePro10Ales" },
  { value: "pro_1_25_ales", labelKey: "yeastPitchRatePro125Ales" },
  { value: "pro_1_5_lager", labelKey: "yeastPitchRatePro15Lager" },
  { value: "pro_1_75_lager", labelKey: "yeastPitchRatePro175Lager" },
  { value: "pro_2_0_lager", labelKey: "yeastPitchRatePro20Lager" },
];

export type EditorYeastRow = {
  id: string;
  ingredientId: string | null;
  name: string;
  lab?: string | null | undefined;
  productId?: string | null | undefined;
  attenuationMin?: number | null | undefined;
  attenuationMax?: number | null | undefined;
  amountL?: number | null | undefined;
  amountKg?: number | null | undefined;
  pitchRate?: YeastPitchRateKey | string | null | undefined;
  fermentationTempC?: number | null | undefined;
  oxygenation?: "yes" | "no" | null | undefined;
  diacetylRest?: "yes" | "no" | null | undefined;
  format?: "dry" | "liquid" | "slurry" | null | undefined;
  species?:
    | "saccharomyces_cerevisiae"
    | "saccharomyces_pastorianus"
    | "brettanomyces"
    | "diastaticus"
    | "other"
    | null
    | undefined;
  needsPropagation?: "yes" | "no" | null | undefined;
  cellsPerLOverride?: number | null | undefined;
  cellsPerKGOverride?: number | null | undefined;
  manualCellCount?: { dilutionFactor: 200 | 2000; aliveCells: number; totalCells: number } | null | undefined;
};

export type YeastSpeciesKey = EditorYeastRow["species"] extends infer S
  ? S extends string
    ? S
    : never
  : never;

export const CELLS_PER_L_LIQUID = 2150;
export const CELLS_PER_L_SLURRY = 1200;
export const CELLS_PER_KG_DRY = 1500;

export type YeastFormat = "dry" | "liquid" | "slurry";

export type EditorMiscRow = {
  id: string;
  ingredientId?: string | null | undefined;
  name: string;
  type: "spice" | "fining" | "water_agent" | "herb" | "flavor" | "other";
  use: "boil" | "mash" | "primary" | "secondary" | "bottling";
  timeMinutes: number | null;
  amount: number;
  amountIsWeight: boolean;
  useFor?: string | null | undefined;
  notes?: string | null | undefined;
};

export type EditorMashStepType =
  | "infusion"
  | "temperature"
  | "decoction"
  | "souring mash"
  | "souring wort"
  | "drain mash tun"
  | "sparge";

export const MASH_STEP_TYPE_OPTIONS: { value: EditorMashStepType; label: string }[] = [
  { value: "infusion", label: "Infusion" },
  { value: "temperature", label: "Temperature" },
  { value: "decoction", label: "Decoction" },
  { value: "souring mash", label: "Souring mash" },
  { value: "souring wort", label: "Souring wort" },
  { value: "drain mash tun", label: "Drain mash tun" },
  { value: "sparge", label: "Sparge" },
];

export const MASH_TEMPLATES: { id: string; labelKey: string; steps: Omit<EditorMashStep, "id">[] }[] = [
  {
    id: "single_infusion",
    labelKey: "mashingTemplateSingleInfusion",
    steps: [{ name: "Mash In", type: "infusion", stepTemperatureC: 67, stepTimeMin: 60 }],
  },
  {
    id: "step_mash",
    labelKey: "mashingTemplateStepMash",
    steps: [
      { name: "Protein rest", type: "infusion", stepTemperatureC: 52, stepTimeMin: 15 },
      { name: "Saccharification", type: "temperature", stepTemperatureC: 65, stepTimeMin: 30 },
      { name: "Mash out", type: "temperature", stepTemperatureC: 72, stepTimeMin: 20 },
    ],
  },
  {
    id: "temperature",
    labelKey: "mashingTemplateTemperature",
    steps: [{ name: "Single rest", type: "temperature", stepTemperatureC: 68, stepTimeMin: 60 }],
  },
  {
    id: "decoction",
    labelKey: "mashingTemplateDecoction",
    steps: [
      { name: "Dough in", type: "infusion", stepTemperatureC: 45, stepTimeMin: 15 },
      { name: "Protein rest", type: "decoction", stepTemperatureC: 52, stepTimeMin: 20 },
      { name: "Saccharification", type: "decoction", stepTemperatureC: 65, stepTimeMin: 30 },
      { name: "Mash out", type: "decoction", stepTemperatureC: 76, stepTimeMin: 10 },
    ],
  },
  {
    id: "sparge",
    labelKey: "mashingTemplateSparge",
    steps: [{ name: "Sparge", type: "sparge", stepTemperatureC: 76, stepTimeMin: 0 }],
  },
];

export type EditorMashStep = {
  id: string;
  name: string;
  type: EditorMashStepType;
  stepTemperatureC: number;
  stepTimeMin: number;
  amountL?: number | null | undefined;
  deduceFromMashIn?: boolean | undefined;
  rampTimeMin?: number | null | undefined;
  endTemperatureC?: number | null | undefined;
  infuseTemperatureC?: number | null | undefined;
  description?: string | null | undefined;
};

export type EditorMash = {
  name: string;
  grainTemperatureC: number;
  steps: EditorMashStep[];
  notes?: string | null | undefined;
} | null;
