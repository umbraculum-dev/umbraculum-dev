export { sgToPlato } from '@brewery/core';

type BeerJsonRecipe = Record<string, unknown>;
type BeerJsonDocument = {
    beerjson: {
        version: number;
        recipes: BeerJsonRecipe[];
    };
};
type GristPotential = {
    kind: "ppg";
    value: number;
} | {
    kind: "yieldPercent";
    value: number;
} | {
    kind: "sg";
    value: number;
} | {
    kind: "plato";
    value: number;
} | null;
type EditorGristRow = {
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
type EditorHopRow = {
    id: string;
    ingredientId: string | null;
    name: string;
    country?: string | null | undefined;
    form?: "extract" | "leaf" | "leaf (wet)" | "pellet" | "powder" | "plug" | "debittered_leaf" | "hop_extract" | null | undefined;
    amountGrams: number;
    alphaAcidPercent: number | null;
    use: "boil" | "whirlpool" | "dryhop";
    timeMinutes: number | null;
};
type YeastPitchRateKey = "mfg_rec_0_35_ales" | "mfg_rec_0_5_ales" | "pro_0_75_ales" | "pro_1_0_ales" | "pro_1_25_ales" | "pro_1_5_lager" | "pro_1_75_lager" | "pro_2_0_lager";
declare const PITCH_RATE_TO_MILLION_CELLS_PER_ML_P: Record<YeastPitchRateKey, number>;
declare const YEAST_PITCH_RATE_OPTIONS: {
    value: YeastPitchRateKey;
    labelKey: string;
}[];
type EditorYeastRow = {
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
    species?: "saccharomyces_cerevisiae" | "saccharomyces_pastorianus" | "brettanomyces" | "diastaticus" | "other" | null | undefined;
    needsPropagation?: "yes" | "no" | null | undefined;
    cellsPerLOverride?: number | null | undefined;
    cellsPerKGOverride?: number | null | undefined;
    manualCellCount?: {
        dilutionFactor: 200 | 2000;
        aliveCells: number;
        totalCells: number;
    } | null | undefined;
};
type YeastSpeciesKey = EditorYeastRow["species"] extends infer S ? S extends string ? S : never : never;
declare function computeEstimatedCellsB(batchSizeLiters: number | null | undefined, ogEstimatedSg: number | null | undefined, pitchRateKey: YeastPitchRateKey | string | null | undefined): number | null;
declare const CELLS_PER_L_LIQUID = 2150;
declare const CELLS_PER_L_SLURRY = 1200;
declare const CELLS_PER_KG_DRY = 1500;
type YeastFormat = "dry" | "liquid" | "slurry";
declare function computeCellsPerLFromManualCount(manual: {
    dilutionFactor: 200 | 2000;
    aliveCells: number;
    totalCells: number;
}): number | null;
declare function computeAmountFromCellsB(cellsB: number, format: YeastFormat, cellsPerLOverride?: number | null, cellsPerKGOverride?: number | null): {
    amountL: number | null;
    amountKg: number | null;
};
type EditorMiscRow = {
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
type EditorMashStepType = "infusion" | "temperature" | "decoction" | "souring mash" | "souring wort" | "drain mash tun" | "sparge";
declare const MASH_STEP_TYPE_OPTIONS: {
    value: EditorMashStepType;
    label: string;
}[];
declare const MASH_TEMPLATES: {
    id: string;
    labelKey: string;
    steps: Omit<EditorMashStep, "id">[];
}[];
declare function newMashRowId(): string;
type EditorMashStep = {
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
type EditorMash = {
    name: string;
    grainTemperatureC: number;
    steps: EditorMashStep[];
    notes?: string | null | undefined;
} | null;
declare function validateMashBeforeSave(mash: EditorMash): {
    ok: true;
} | {
    ok: false;
    errors: string;
};
declare function replaceMashInBeerJsonDocument(doc: unknown, mash: EditorMash | null): BeerJsonDocument;
declare function buildBeerJsonRecipeDocument(args: {
    name: string;
    notes: string | null;
    gristRows: EditorGristRow[];
    hopsRows: EditorHopRow[];
    yeastRows: EditorYeastRow[];
    miscRows: EditorMiscRow[];
    mash?: EditorMash | null | undefined;
    batchSizeLiters?: number | null | undefined;
    brewhouseEfficiencyPercent?: number | null | undefined;
}): BeerJsonDocument;
declare function buildRecipeExtJsonFromEditorState(args: {
    gristRows: EditorGristRow[];
    hopsRows: EditorHopRow[];
    yeastRows: EditorYeastRow[];
    miscRows: EditorMiscRow[];
    extBase?: unknown;
}): unknown;
declare function mergeMashDeduceFromExt(mash: EditorMash | null, recipeExtJson: unknown): EditorMash | null;
declare function editorStateFromBeerJson(doc: unknown): {
    gristRows: EditorGristRow[];
    hopsRows: EditorHopRow[];
    yeastRows: EditorYeastRow[];
    miscRows: EditorMiscRow[];
    mash: EditorMash;
};
/**
 * Merges yeastAttenuationRange from recipeExtJson into yeast rows.
 * When the lab provides min/max, we persist them in recipeExtJson; this restores them on load.
 */
declare function mergeYeastAttenuationRangeFromExt(yeastRows: EditorYeastRow[], recipeExtJson: unknown): EditorYeastRow[];

export { CELLS_PER_KG_DRY, CELLS_PER_L_LIQUID, CELLS_PER_L_SLURRY, type EditorGristRow, type EditorHopRow, type EditorMash, type EditorMashStep, type EditorMashStepType, type EditorMiscRow, type EditorYeastRow, MASH_STEP_TYPE_OPTIONS, MASH_TEMPLATES, PITCH_RATE_TO_MILLION_CELLS_PER_ML_P, YEAST_PITCH_RATE_OPTIONS, type YeastFormat, type YeastPitchRateKey, type YeastSpeciesKey, buildBeerJsonRecipeDocument, buildRecipeExtJsonFromEditorState, computeAmountFromCellsB, computeCellsPerLFromManualCount, computeEstimatedCellsB, editorStateFromBeerJson, mergeMashDeduceFromExt, mergeYeastAttenuationRangeFromExt, newMashRowId, replaceMashInBeerJsonDocument, validateMashBeforeSave };
