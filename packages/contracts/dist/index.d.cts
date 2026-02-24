/**
 * Auth /auth/me response contract.
 * Shared by web and native clients.
 */
interface AuthMeResponseUser {
    id: string;
    email: string;
    preferredLocale: string;
    preferredTheme?: string | null;
    preferredFontScale?: string | null;
    preferredDensity?: string | null;
    isPlatformAdmin?: boolean;
}
interface AuthMeResponseWorkspace {
    id: string;
    name: string;
    role: string;
    brandKey?: string | null;
}
interface AuthMeResponse {
    ok: true;
    user: AuthMeResponseUser;
    workspaces: AuthMeResponseWorkspace[];
    activeWorkspaceId: string | null;
    role: string | null;
}
/**
 * Parse and validate /auth/me response. Throws on invalid payload.
 */
declare function parseAuthMeResponse(payload: unknown): AuthMeResponse;

type WaterCalcDerivationKind = "salt_additions" | "acidification" | "mash_overall" | "sparge_overall" | "boil_overall" | "analysis.abv" | "analysis.ibu_tinseth" | "analysis.ibu_rager" | "analysis.mcu" | "analysis.srm_morey" | "analysis.srm_daniels" | "analysis.kettle_volume" | "analysis.pre_boil_volume" | "analysis.og" | "analysis.fg" | "analysis.attenuation" | "analysis.pbg";
type WaterCalcUnit = "L" | "g" | "mL" | "ppm" | "ppm_as_CaCO3" | "pH" | "percent" | "sg" | "ibu" | "srm" | "mcu" | "h" | "percent_per_hour" | "L_per_kg" | "mEq_per_L" | "mmol_per_L";
type WaterCalcDerivationValue = {
    kind: "number";
    value: number;
    unit?: WaterCalcUnit;
} | {
    kind: "string";
    value: string;
} | {
    kind: "boolean";
    value: boolean;
} | {
    kind: "null";
};
interface WaterCalcDerivationLine {
    id: string;
    value: WaterCalcDerivationValue;
}
type WaterCalcNoteCode = "counter_ions_only_for_sulfuric_or_hydrochloric";
interface WaterCalcDerivation {
    kind: WaterCalcDerivationKind;
    version: 1;
    formulaId: string;
    inputs: WaterCalcDerivationLine[];
    intermediates: WaterCalcDerivationLine[];
    breakdowns?: Array<{
        id: string;
        rows: Array<Record<string, WaterCalcDerivationValue>>;
    }>;
    notes?: WaterCalcNoteCode[];
}

interface IonProfilePpm {
    calcium: number;
    magnesium: number;
    sodium: number;
    sulfate: number;
    chloride: number;
    bicarbonate: number;
}

type NumberFormatUnit = "pH" | "ppm" | "ppm_as_CaCO3" | "L" | "mL" | "g" | "kg" | "gal" | "qt" | "pt" | "fl_oz" | "lb" | "oz" | "percent" | "sg" | "ibu" | "srm" | "min";
interface NumberFormatHintV1 {
    version: 1;
    style: "fixed" | "significant";
    decimals: number;
    unit?: NumberFormatUnit;
    clamp?: {
        min?: number;
        max?: number;
    };
}

type WaterHubFormatHintKeys = "L" | "pH" | "ppm_as_CaCO3" | "g" | "mL";
interface ExpectedRaRange {
    min: number;
    max: number;
    rationaleKey: "styleExpectedRaDark" | "styleExpectedRaPale" | "styleExpectedRaAmber";
}
interface RecipeWaterHubStreamSummary {
    key: "mash" | "sparge" | "boil";
    volumeLiters: number | null;
    ph: number | null;
    finalAlkalinityPpmCaCO3: number | null;
    ionsPpm: IonProfilePpm | null;
    saltsBreakdown: Array<{
        saltKey: string;
        grams: number;
    }> | null;
    acidType: string | null;
    acidMode: "manual" | "required" | null;
    acidStrengthKind: string | null;
    acidStrengthValue: number | null;
    acidAmountMl: number | null;
    acidAmountGrams: number | null;
}
interface RecipeWaterHubSummary {
    version: 1;
    status: {
        mashAcidificationMode: string | null;
        spargeAcidificationMode: string | null;
        boilAcidificationMode: string | null;
        mashLastCalculatedAt: string | null;
        spargeLastCalculatedAt: string | null;
        boilLastCalculatedAt: string | null;
        mashOverallSnapshot: null | {
            ph: {
                kind: "target" | "estimated";
                value: number;
            };
            finalAlkalinityPpmCaCO3: number;
        };
    };
    streams: RecipeWaterHubStreamSummary[];
    merged: {
        totalVolumeLiters: number;
        ph: number | null;
        finalAlkalinityPpmCaCO3: number | null;
        ionsPpm: IonProfilePpm | null;
    };
    finalRecap: {
        predictedMashPh: null | {
            kind: "target" | "estimated";
            value: number;
        };
        residualAlkalinityMashOverallPpmCaCO3: number | null;
        residualAlkalinityMergedPpmCaCO3: number | null;
        styleExpectedRa: ExpectedRaRange | null;
    };
}
interface RecipeWaterHubSummaryResponse {
    ok: true;
    summary: RecipeWaterHubSummary;
    formatHints?: Partial<Record<string, NumberFormatHintV1>>;
}

/**
 * Water profile DTOs. Shared by web and native clients.
 */
interface WaterProfile {
    id: string;
    key: string;
    scope: "system" | "account" | "public";
    type: "water" | "dilution";
    workspaceId: string | null;
    name: string;
    /** Optional: may be missing/unknown for some sources. Range 0–14. */
    ph?: number | null;
    /** ppm */
    calcium: number;
    /** ppm */
    magnesium: number;
    /** ppm */
    sodium: number;
    /** ppm */
    sulfate: number;
    /** ppm */
    chloride: number;
    /** ppm (as HCO3) */
    bicarbonate: number;
    verificationStatus: "verified" | "unverified";
    source: string;
}
interface WaterProfilesResponse {
    ok: true;
    system: WaterProfile[];
    public: WaterProfile[];
    workspace: WaterProfile[];
}
/**
 * Parse and validate WaterProfile. Throws on invalid payload.
 */
declare function parseWaterProfileItem(payload: unknown): WaterProfile;
/**
 * Parse and validate /water-profiles response. Throws on invalid payload.
 */
declare function parseWaterProfilesResponse(payload: unknown): WaterProfilesResponse;

interface RecipeWaterSettingsSavedRef {
    recipeId: string;
}
type WaterSaltAdditionsResult = {
    baseProfile: IonProfilePpm;
    resultingProfile: IonProfilePpm;
    deltasPpm: IonProfilePpm;
    breakdown: Array<{
        saltKey: string;
        grams: number;
        deltasPpm: Partial<IonProfilePpm>;
    }>;
};
type WaterAcidificationResult = {
    acidRequiredMl: number | null;
    acidRequiredTsp: number | null;
    acidRequiredGrams: number | null;
    acidRequiredKg: number | null;
    finalAlkalinityPpmCaCO3: number;
    sulfateAddedPpm: number;
    chlorideAddedPpm: number;
    debug?: Record<string, unknown>;
};
type WaterAcidificationManualResult = {
    achievedPh: number;
    predicted: WaterAcidificationResult;
    clamped: "none" | "low" | "high";
    iterations: number;
    targetAmount: number;
    predictedAmount: number;
};
type MashAcidificationTargetMashPhResult = WaterAcidificationResult & {
    estimatedMashPhRoomTemp: number;
};
type WaterOverallResult = {
    calculatedAt: string;
    ionsPpm: IonProfilePpm;
    finalAlkalinityPpmCaCO3: number;
    ph: {
        kind: "target" | "estimated";
        value: number;
    };
    debug?: Record<string, unknown>;
};
type MashAcidComputeBlock = {
    kind: "mash_acidification_manual";
    mode: "manual";
    result: WaterAcidificationManualResult;
    derivation: WaterCalcDerivation;
} | {
    kind: "mash_acidification_target_mash_ph";
    mode: "targetPh";
    result: MashAcidificationTargetMashPhResult;
    derivation: WaterCalcDerivation;
} | {
    kind: "mash_acidification";
    mode: "targetPh";
    result: WaterAcidificationResult;
    derivation: WaterCalcDerivation;
};
type SpargeAcidComputeBlock = {
    kind: "sparge_acidification_manual";
    mode: "manual";
    result: WaterAcidificationManualResult;
    derivation: WaterCalcDerivation;
} | {
    kind: "sparge_acidification";
    mode: "targetPh";
    result: WaterAcidificationResult;
    derivation: WaterCalcDerivation;
};
type BoilAcidComputeBlock = {
    kind: "boil_acidification_manual";
    mode: "manual";
    result: WaterAcidificationManualResult;
    derivation: WaterCalcDerivation;
} | {
    kind: "boil_acidification";
    mode: "targetPh";
    result: WaterAcidificationResult;
    derivation: WaterCalcDerivation;
};
interface MashComputeAndSaveRequest {
    sourceWaterProfileId: string;
    dilutionWaterProfileId: string | null;
    tapWaterVolumeLiters: number;
    dilutionWaterVolumeLiters: number;
    mashStartingAlkalinityPpmCaCO3: number;
    mashStartingPh: number;
    mashTargetPh: number;
    mashAcidType: string;
    mashStrengthKind: "percent" | "normality" | "molarity" | "solid";
    mashStrengthValue: number | null;
    mashAcidificationMode: "targetPh" | "manual";
    mashManualAcidAddedMl: number | null;
    mashManualAcidAddedGrams: number | null;
    mashSaltAdditionsJson: unknown;
    grist?: Array<{
        amountKg: number;
        colorLovibond: number | null;
        maltClass: "base" | "crystal" | "roast" | "acid";
    }>;
}
interface SpargeComputeAndSaveRequest {
    spargeWaterProfileId: string;
    spargeSaltAdditionsJson: unknown;
    spargeStartingAlkalinityPpmCaCO3: number;
    spargeStartingPh: number;
    spargeTargetPh: number;
    spargeVolumeLiters: number;
    spargeAcidType: string;
    spargeStrengthKind: "percent" | "normality" | "molarity" | "solid";
    spargeStrengthValue: number | null;
    spargeAcidificationMode: "targetPh" | "manual";
    spargeManualAcidAddedMl: number | null;
    spargeManualAcidAddedGrams: number | null;
}
interface BoilComputeAndSaveRequest {
    boilSourceWaterProfileId: string;
    boilDilutionWaterProfileId: string | null;
    boilTapWaterVolumeLiters: number;
    boilDilutionWaterVolumeLiters: number;
    boilStartingAlkalinityPpmCaCO3: number;
    boilStartingPh: number;
    boilTargetPh: number;
    boilAcidType: string;
    boilStrengthKind: "percent" | "normality" | "molarity" | "solid";
    boilStrengthValue: number | null;
    boilAcidificationMode: "targetPh" | "manual";
    boilManualAcidAddedMl: number | null;
    boilManualAcidAddedGrams: number | null;
    boilSaltAdditionsJson: unknown;
}
interface MashComputeAndSaveResponseV1 {
    ok: true;
    version: 1;
    settings: RecipeWaterSettingsSavedRef;
    salts: {
        result: WaterSaltAdditionsResult;
        derivation: WaterCalcDerivation;
    };
    acid: MashAcidComputeBlock;
    overall: {
        result: WaterOverallResult;
        derivation: WaterCalcDerivation;
    };
    formatHints?: Partial<Record<string, NumberFormatHintV1>>;
}
interface SpargeComputeAndSaveResponseV1 {
    ok: true;
    version: 1;
    settings: RecipeWaterSettingsSavedRef;
    salts: {
        result: WaterSaltAdditionsResult;
        derivation: WaterCalcDerivation;
    };
    acid: SpargeAcidComputeBlock;
    formatHints?: Partial<Record<string, NumberFormatHintV1>>;
}
interface BoilComputeAndSaveResponseV1 {
    ok: true;
    version: 1;
    settings: RecipeWaterSettingsSavedRef;
    salts: {
        result: WaterSaltAdditionsResult;
        derivation: WaterCalcDerivation;
    };
    acid: BoilAcidComputeBlock;
    overall: {
        result: WaterOverallResult;
        derivation: WaterCalcDerivation;
    };
    formatHints?: Partial<Record<string, NumberFormatHintV1>>;
}

declare function parseMashComputeAndSaveResponse(x: unknown): MashComputeAndSaveResponseV1;
declare function parseSpargeComputeAndSaveResponse(x: unknown): SpargeComputeAndSaveResponseV1;
declare function parseBoilComputeAndSaveResponse(x: unknown): BoilComputeAndSaveResponseV1;

declare const waterFormatHints: Record<string, NumberFormatHintV1>;
declare const analysisFormatHints: Record<string, NumberFormatHintV1>;

type GravityAnalysisWarningCode = "missing_beerjson" | "missing_water_settings" | "missing_water_volumes" | "invalid_runoff_volume" | "invalid_evaporation" | "invalid_kettle_volume" | "exceeds_kettle_capacity" | "missing_efficiency" | "missing_fermentables" | "missing_color_volume" | "missing_fermentable_colors" | "used_batch_size_volume" | "missing_ibu_gravity" | "missing_ibu_inputs" | "missing_attenuation";
interface GravityAnalysisWarningV1 {
    code: GravityAnalysisWarningCode;
}
type GravityAnalysisIbuModelV1 = "tinseth" | "rager";
type GravityAnalysisSrmModelV1 = "morey" | "daniels";
interface GravityAnalysisCanonicalModelsV1 {
    ibu: GravityAnalysisIbuModelV1;
    srm: GravityAnalysisSrmModelV1;
}
interface GravityAnalysisResultV1 {
    boilTimeMinutes: number | null;
    kettleVolumeLiters: number | null;
    preBoilVolumeLiters: number | null;
    ogEstimatedSg: number | null;
    pbgEstimatedSg: number | null;
    ibuTinsethEstimated: number | null;
    ibuRagerEstimated: number | null;
    buGuRatio: number | null;
    colorSrmMoreyEstimated: number | null;
    colorSrmDanielsEstimated: number | null;
    fgEstimatedSg: number | null;
    abvEstimatedPercent: number | null;
    attenuationEffectivePercent: number | null;
    warnings: GravityAnalysisWarningV1[];
}
type GravityAnalysisDerivationKind = "analysis.abv" | "analysis.ibu_tinseth" | "analysis.ibu_rager" | "analysis.mcu" | "analysis.srm_morey" | "analysis.srm_daniels" | "analysis.kettle_volume" | "analysis.pre_boil_volume" | "analysis.og" | "analysis.fg" | "analysis.attenuation" | "analysis.pbg";
interface GravityAnalysisResponseV1 {
    ok: true;
    version: 1;
    canonicalModels: GravityAnalysisCanonicalModelsV1;
    result: GravityAnalysisResultV1;
    derivations: Partial<Record<GravityAnalysisDerivationKind, WaterCalcDerivation>>;
    formatHints: Partial<Record<keyof GravityAnalysisResultV1, NumberFormatHintV1>>;
}

declare function parseGravityAnalysisResponseV1(x: unknown): GravityAnalysisResponseV1;

export { type AuthMeResponse, type AuthMeResponseUser, type AuthMeResponseWorkspace, type BoilAcidComputeBlock, type BoilComputeAndSaveRequest, type BoilComputeAndSaveResponseV1, type ExpectedRaRange, type GravityAnalysisCanonicalModelsV1, type GravityAnalysisDerivationKind, type GravityAnalysisIbuModelV1, type GravityAnalysisResponseV1, type GravityAnalysisResultV1, type GravityAnalysisSrmModelV1, type GravityAnalysisWarningCode, type GravityAnalysisWarningV1, type IonProfilePpm, type MashAcidComputeBlock, type MashAcidificationTargetMashPhResult, type MashComputeAndSaveRequest, type MashComputeAndSaveResponseV1, type NumberFormatHintV1, type NumberFormatUnit, type RecipeWaterHubStreamSummary, type RecipeWaterHubSummary, type RecipeWaterHubSummaryResponse, type RecipeWaterSettingsSavedRef, type SpargeAcidComputeBlock, type SpargeComputeAndSaveRequest, type SpargeComputeAndSaveResponseV1, type WaterAcidificationManualResult, type WaterAcidificationResult, type WaterCalcDerivation, type WaterCalcDerivationKind, type WaterCalcDerivationLine, type WaterCalcDerivationValue, type WaterCalcNoteCode, type WaterCalcUnit, type WaterHubFormatHintKeys, type WaterOverallResult, type WaterProfile, type WaterProfilesResponse, type WaterSaltAdditionsResult, analysisFormatHints, parseAuthMeResponse, parseBoilComputeAndSaveResponse, parseGravityAnalysisResponseV1, parseMashComputeAndSaveResponse, parseSpargeComputeAndSaveResponse, parseWaterProfileItem, parseWaterProfilesResponse, waterFormatHints };
