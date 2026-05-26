import { z } from 'zod';

/**
 * Auth /auth/me response contract.
 * Shared by web and native clients.
 *
 * v2.0 (RFC-0003 Decision A): migrated from hand-rolled parsers to Zod v4
 * schemas. The schema is the single source of truth; types are inferred
 * via `z.infer`.
 *
 * Behavior preservation: this migration intentionally preserves the
 * hand-rolled parser's soft-tolerance defaults (non-string preference
 * fields collapse to undefined; non-string `activeWorkspaceId` and `role`
 * collapse to null) via per-field preprocess transforms. This matches
 * the v1.x test contract exactly — no behavior changes ship with this
 * migration. A future PR may tighten these to strict-reject; see the
 * latent-bug-fix audit in PR 1's description.
 *
 * Backward-compat tunnel preserved: payloads using the legacy `accounts`
 * key (instead of `workspaces`) or `activeAccountId` (instead of
 * `activeWorkspaceId`) are still accepted via the top-level preprocess.
 * Both legacy keys are mapped to their canonical names at the schema
 * boundary. See Phase 4b regression-pin in `meResponse.test.ts`.
 *
 * Worked example for RFC-0003 Decision D — this file is the canonical
 * pattern that the 4 remaining `parseX.ts` files under
 * `packages/contracts/src/` (per the migration handoff doc) will follow
 * in subsequent migration PRs. Pattern shape:
 *   1. Sub-schemas declared first, smallest-leaf-first.
 *   2. Top-level schema uses preprocess for any dual-key tunneling.
 *   3. Per-field preprocess for soft-tolerance fallbacks (preserving v1.x).
 *   4. Type exports via z.infer (single source of truth).
 *   5. Existing parseX(unknown): X export preserved as thin wrapper.
 */

declare const AuthMeResponseUserSchema: z.ZodPipe<z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    preferredLocale: z.ZodDefault<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string, unknown>>>;
    preferredTheme: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
    preferredFontScale: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
    preferredDensity: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
    isPlatformAdmin: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<boolean | undefined, unknown>>>;
}, z.core.$strip>, z.ZodTransform<{
    id: string;
    email: string;
    preferredLocale: string;
    preferredTheme: string | null | undefined;
    preferredFontScale: string | null | undefined;
    preferredDensity: string | null | undefined;
    isPlatformAdmin: boolean | undefined;
}, {
    id: string;
    email: string;
    preferredLocale: string;
    preferredTheme?: string | null | undefined;
    preferredFontScale?: string | null | undefined;
    preferredDensity?: string | null | undefined;
    isPlatformAdmin?: boolean | undefined;
}>>;
declare const AuthMeResponseWorkspaceSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    role: z.ZodString;
    brandKey: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
}, z.core.$strip>;
declare const AuthMeResponseSchema: z.ZodPreprocess<z.ZodObject<{
    ok: z.ZodLiteral<true>;
    user: z.ZodPipe<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        preferredLocale: z.ZodDefault<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string, unknown>>>;
        preferredTheme: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
        preferredFontScale: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
        preferredDensity: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
        isPlatformAdmin: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<boolean | undefined, unknown>>>;
    }, z.core.$strip>, z.ZodTransform<{
        id: string;
        email: string;
        preferredLocale: string;
        preferredTheme: string | null | undefined;
        preferredFontScale: string | null | undefined;
        preferredDensity: string | null | undefined;
        isPlatformAdmin: boolean | undefined;
    }, {
        id: string;
        email: string;
        preferredLocale: string;
        preferredTheme?: string | null | undefined;
        preferredFontScale?: string | null | undefined;
        preferredDensity?: string | null | undefined;
        isPlatformAdmin?: boolean | undefined;
    }>>;
    workspaces: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        role: z.ZodString;
        brandKey: z.ZodOptional<z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null | undefined, unknown>>>;
    }, z.core.$strip>>;
    activeWorkspaceId: z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null, unknown>>;
    role: z.ZodPipe<z.ZodUnknown, z.ZodTransform<string | null, unknown>>;
}, z.core.$strip>>;
type AuthMeResponseUser = z.infer<typeof AuthMeResponseUserSchema>;
type AuthMeResponseWorkspace = z.infer<typeof AuthMeResponseWorkspaceSchema>;
type AuthMeResponse = z.infer<typeof AuthMeResponseSchema>;
/**
 * Parse and validate /auth/me response. Throws ZodError on invalid payload.
 * Thin wrapper around `AuthMeResponseSchema.parse` for call-site stability —
 * existing consumers in `apps/web` and `apps/native` continue to call
 * `parseAuthMeResponse(json)` unchanged.
 */
declare function parseAuthMeResponse(payload: unknown): AuthMeResponse;

type WaterCalcDerivationKind = "salt_additions" | "acidification" | "mash_overall" | "sparge_overall" | "boil_overall" | "analysis.abv" | "analysis.ibu_tinseth" | "analysis.ibu_rager" | "analysis.mcu" | "analysis.srm_morey" | "analysis.srm_daniels" | "analysis.kettle_volume" | "analysis.pre_boil_volume" | "analysis.og" | "analysis.fg" | "analysis.attenuation" | "analysis.pbg";
type WaterCalcUnit = "L" | "g" | "mL" | "ppm" | "ppm_as_CaCO3" | "pH" | "percent" | "sg" | "ibu" | "srm" | "mcu" | "h" | "percent_per_hour" | "L_per_kg" | "mEq_per_L" | "mmol_per_L";
type WaterCalcDerivationValue = {
    kind: "number";
    value: number;
    unit?: WaterCalcUnit | undefined;
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
    }> | undefined;
    notes?: WaterCalcNoteCode[] | undefined;
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
    unit?: NumberFormatUnit | undefined;
    clamp?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
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
    formatHints?: Partial<Record<string, NumberFormatHintV1>> | undefined;
}

declare function parseRecipeWaterHubSummaryResponse(x: unknown): RecipeWaterHubSummaryResponse;

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
    ph?: number | null | undefined;
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
    debug?: Record<string, unknown> | undefined;
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
    debug?: Record<string, unknown> | undefined;
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
    formatHints?: Partial<Record<string, NumberFormatHintV1>> | undefined;
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
    formatHints?: Partial<Record<string, NumberFormatHintV1>> | undefined;
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
    formatHints?: Partial<Record<string, NumberFormatHintV1>> | undefined;
}

declare function parseMashComputeAndSaveResponse(x: unknown): MashComputeAndSaveResponseV1;
declare function parseSpargeComputeAndSaveResponse(x: unknown): SpargeComputeAndSaveResponseV1;
declare function parseBoilComputeAndSaveResponse(x: unknown): BoilComputeAndSaveResponseV1;

/**
 * Recipe water settings API response shape.
 * GET /api/recipes/:id/water-settings returns { ok: true, settings: RecipeWaterSettings | null }.
 * PUT /api/recipes/:id/water-settings returns { ok: true, settings: RecipeWaterSettings }.
 *
 * Includes sparge configuration fields for native and web consumers.
 */
interface RecipeWaterSettingsResponse {
    ok: true;
    settings: RecipeWaterSettings | null;
}
interface RecipeWaterSettings {
    id: string;
    spargeStepTimeMin?: number | null;
    spargeStepRampMin?: number | null;
    spargeMethodType?: string | null;
    spargeStepTemperatureC?: number | null;
    [key: string]: unknown;
}

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

/**
 * AI usage ledger entry — the audit/analytics record written by the
 * orchestrator after every chat turn. Matches the schema in
 * docs/PLATFORM-ARCHITECTURE.md §4.3 / §6.4.
 *
 * In v0 the ledger is informational-only: it drives the workspace usage
 * dashboard (Sprint #2) and the per-user / per-role rate-limit checks; it
 * does NOT drive any Stripe charge. The paid-AI subscription is flat-rate
 * regardless of usage volume — see internal/AI-MONETIZATION-STRATEGY.md.
 */
/**
 * One recorded entry per AI chat turn (success or partial failure). Costs
 * are stored in micro-USD (1 USD = 1_000_000 micro-USD) to avoid floating
 * point precision loss on small per-call amounts.
 */
interface AiUsageLedgerEntry {
    id: string;
    workspaceId: string;
    userId: string;
    /** Logical session/conversation identifier; nullable for one-shot calls. */
    sessionId: string | null;
    /** Provider-specific model identifier (e.g. `claude-sonnet-4-5`). */
    model: string;
    tokensIn: number;
    tokensOut: number;
    /** Provider-reported cost in micro-USD (1e-6 USD). 0 if not derivable. */
    costMicroUsd: number;
    /** Wall-clock duration of the chat turn in milliseconds. */
    durationMs: number;
    /** Provider request id for cross-system tracing (Anthropic `request_id`). */
    providerRequestId: string | null;
    /** Ordered list of tool calls the model made during this turn. */
    toolCalls: AiToolCallRecord[];
    /** ISO-8601 timestamp. */
    createdAt: string;
}
/**
 * One tool invocation inside a single chat turn. `argsJson` and `resultJson`
 * are stored verbatim for debugging; orchestrators are encouraged to elide
 * large blobs (e.g. truncate `resultJson` to 8 KB) before persistence.
 */
interface AiToolCallRecord {
    name: string;
    /** Stringified JSON input the model produced (or truncated thereof). */
    argsJson: string;
    /** Stringified JSON result returned to the model (or truncated thereof). */
    resultJson: string;
    /** Wall-clock duration of this tool call in milliseconds. */
    durationMs: number;
    /** `true` if the handler threw; the message is captured in `resultJson`. */
    errored: boolean;
}

/**
 * Workspace AI settings — wire shape for `GET/PUT /workspaces/:id/ai/settings`.
 *
 * Security invariant: the encrypted provider key MUST never be returned
 * to clients. The DTO exposes only `hasKey: boolean` so the admin UI can
 * render "Key configured: yes/no". `PUT` accepts a write-only `apiKey`
 * field; the server encrypts and stores it without ever echoing it back.
 */
/**
 * AI provider identifier. v0 ships Anthropic only; the union is reserved
 * for future provider adapters (OpenAI / Google / local).
 */
type AiProvider = "anthropic";
/**
 * Per-role monthly token cap (sum of `tokensIn + tokensOut` over the trailing
 * 30 days). The map is keyed by `WorkspaceRole`. A missing role key or a
 * value of `0` means "no role-level cap".
 *
 * Example: `{ "brewery_admin": 0, "member": 500000, "viewer": 100000 }`.
 */
type AiRoleLimits = Record<string, number>;
interface WorkspaceAiSettings {
    workspaceId: string;
    provider: AiProvider;
    /** `true` when a workspace key is stored (encrypted at rest). */
    hasKey: boolean;
    /** Master AI feature toggle; the orchestrator gates on this. */
    enabled: boolean;
    /** Per-role monthly token caps. */
    roleLimits: AiRoleLimits;
    /** Per-user daily token cap (sum of `tokensIn + tokensOut` for today). */
    perUserDailyCap: number;
    /** Whether the workspace admin acknowledged the data-egress notice. */
    dataEgressAccepted: boolean;
    /** ISO-8601 timestamp of acceptance; `null` if never accepted. */
    dataEgressAcceptedAt: string | null;
    /** ISO-8601 timestamp. */
    createdAt: string;
    /** ISO-8601 timestamp. */
    updatedAt: string;
}
/**
 * `PUT /workspaces/:id/ai/settings` body. All fields are optional — the
 * server applies a partial update. `apiKey` is write-only and never echoed
 * back; pass an empty string to clear the stored key.
 */
interface UpdateWorkspaceAiSettingsRequest {
    provider?: AiProvider;
    apiKey?: string;
    enabled?: boolean;
    roleLimits?: AiRoleLimits;
    perUserDailyCap?: number;
    dataEgressAccepted?: boolean;
}
interface WorkspaceAiSettingsResponse {
    ok: true;
    settings: WorkspaceAiSettings;
}
/**
 * Aggregated usage view used by the workspace admin dashboard (Sprint #2)
 * and surfaced from `GET /workspaces/:id/ai/usage`.
 */
interface WorkspaceAiUsageResponse {
    ok: true;
    monthly: {
        tokensIn: number;
        tokensOut: number;
        costMicroUsd: number;
        callCount: number;
    };
    byUser: Array<{
        userId: string;
        tokensInToday: number;
        tokensOutToday: number;
        tokensInMonth: number;
        tokensOutMonth: number;
        costMicroUsdMonth: number;
        callCountMonth: number;
    }>;
}

declare const RenderKindSchema: z.ZodEnum<{
    pdf: "pdf";
    xlsx: "xlsx";
    csv: "csv";
    docx: "docx";
    odt: "odt";
    html: "html";
    json: "json";
    xml: "xml";
    barcode: "barcode";
    qr: "qr";
}>;
declare const RenderStatusSchema: z.ZodEnum<{
    queued: "queued";
    running: "running";
    succeeded: "succeeded";
    failed: "failed";
}>;
declare const RenderVisibilitySchema: z.ZodEnum<{
    public: "public";
    workspace: "workspace";
}>;
declare const RenderDeliverySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    mode: z.ZodLiteral<"stream-response">;
}, z.core.$strict>, z.ZodObject<{
    mode: z.ZodLiteral<"persist-to-media">;
    visibility: z.ZodEnum<{
        public: "public";
        workspace: "workspace";
    }>;
}, z.core.$strict>, z.ZodObject<{
    mode: z.ZodLiteral<"email">;
    to: z.ZodArray<z.ZodString>;
    subject: z.ZodString;
}, z.core.$strict>], "mode">;
declare const RenderErrorSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
}, z.core.$strict>;
declare const RenderJobSubmitRequestSchema: z.ZodObject<{
    templateRef: z.ZodString;
    kind: z.ZodOptional<z.ZodEnum<{
        pdf: "pdf";
        xlsx: "xlsx";
        csv: "csv";
        docx: "docx";
        odt: "odt";
        html: "html";
        json: "json";
        xml: "xml";
        barcode: "barcode";
        qr: "qr";
    }>>;
    data: z.ZodUnknown;
    delivery: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        mode: z.ZodLiteral<"stream-response">;
    }, z.core.$strict>, z.ZodObject<{
        mode: z.ZodLiteral<"persist-to-media">;
        visibility: z.ZodEnum<{
            public: "public";
            workspace: "workspace";
        }>;
    }, z.core.$strict>, z.ZodObject<{
        mode: z.ZodLiteral<"email">;
        to: z.ZodArray<z.ZodString>;
        subject: z.ZodString;
    }, z.core.$strict>], "mode">>;
}, z.core.$strict>;
declare const RenderJobStatusSchema: z.ZodObject<{
    id: z.ZodString;
    templateRef: z.ZodString;
    kind: z.ZodEnum<{
        pdf: "pdf";
        xlsx: "xlsx";
        csv: "csv";
        docx: "docx";
        odt: "odt";
        html: "html";
        json: "json";
        xml: "xml";
        barcode: "barcode";
        qr: "qr";
    }>;
    status: z.ZodEnum<{
        queued: "queued";
        running: "running";
        succeeded: "succeeded";
        failed: "failed";
    }>;
    deliveryMode: z.ZodString;
    requestedAt: z.ZodString;
    startedAt: z.ZodNullable<z.ZodString>;
    completedAt: z.ZodNullable<z.ZodString>;
    artifactId: z.ZodNullable<z.ZodString>;
    mediaAssetId: z.ZodNullable<z.ZodString>;
    error: z.ZodNullable<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
declare const RenderJobSubmitResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    mode: z.ZodLiteral<"async">;
    job: z.ZodObject<{
        id: z.ZodString;
        templateRef: z.ZodString;
        kind: z.ZodEnum<{
            pdf: "pdf";
            xlsx: "xlsx";
            csv: "csv";
            docx: "docx";
            odt: "odt";
            html: "html";
            json: "json";
            xml: "xml";
            barcode: "barcode";
            qr: "qr";
        }>;
        status: z.ZodEnum<{
            queued: "queued";
            running: "running";
            succeeded: "succeeded";
            failed: "failed";
        }>;
        deliveryMode: z.ZodString;
        requestedAt: z.ZodString;
        startedAt: z.ZodNullable<z.ZodString>;
        completedAt: z.ZodNullable<z.ZodString>;
        artifactId: z.ZodNullable<z.ZodString>;
        mediaAssetId: z.ZodNullable<z.ZodString>;
        error: z.ZodNullable<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
declare const RenderJobStatusResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    job: z.ZodObject<{
        id: z.ZodString;
        templateRef: z.ZodString;
        kind: z.ZodEnum<{
            pdf: "pdf";
            xlsx: "xlsx";
            csv: "csv";
            docx: "docx";
            odt: "odt";
            html: "html";
            json: "json";
            xml: "xml";
            barcode: "barcode";
            qr: "qr";
        }>;
        status: z.ZodEnum<{
            queued: "queued";
            running: "running";
            succeeded: "succeeded";
            failed: "failed";
        }>;
        deliveryMode: z.ZodString;
        requestedAt: z.ZodString;
        startedAt: z.ZodNullable<z.ZodString>;
        completedAt: z.ZodNullable<z.ZodString>;
        artifactId: z.ZodNullable<z.ZodString>;
        mediaAssetId: z.ZodNullable<z.ZodString>;
        error: z.ZodNullable<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
declare const RenderJobCancelResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    job: z.ZodObject<{
        id: z.ZodString;
        templateRef: z.ZodString;
        kind: z.ZodEnum<{
            pdf: "pdf";
            xlsx: "xlsx";
            csv: "csv";
            docx: "docx";
            odt: "odt";
            html: "html";
            json: "json";
            xml: "xml";
            barcode: "barcode";
            qr: "qr";
        }>;
        status: z.ZodEnum<{
            queued: "queued";
            running: "running";
            succeeded: "succeeded";
            failed: "failed";
        }>;
        deliveryMode: z.ZodString;
        requestedAt: z.ZodString;
        startedAt: z.ZodNullable<z.ZodString>;
        completedAt: z.ZodNullable<z.ZodString>;
        artifactId: z.ZodNullable<z.ZodString>;
        mediaAssetId: z.ZodNullable<z.ZodString>;
        error: z.ZodNullable<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
declare const RenderJobResultResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    job: z.ZodObject<{
        id: z.ZodString;
        templateRef: z.ZodString;
        kind: z.ZodEnum<{
            pdf: "pdf";
            xlsx: "xlsx";
            csv: "csv";
            docx: "docx";
            odt: "odt";
            html: "html";
            json: "json";
            xml: "xml";
            barcode: "barcode";
            qr: "qr";
        }>;
        status: z.ZodEnum<{
            queued: "queued";
            running: "running";
            succeeded: "succeeded";
            failed: "failed";
        }>;
        deliveryMode: z.ZodString;
        requestedAt: z.ZodString;
        startedAt: z.ZodNullable<z.ZodString>;
        completedAt: z.ZodNullable<z.ZodString>;
        artifactId: z.ZodNullable<z.ZodString>;
        mediaAssetId: z.ZodNullable<z.ZodString>;
        error: z.ZodNullable<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    signedUrl: z.ZodString;
    expiresAt: z.ZodString;
}, z.core.$strict>;
declare const ErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strict>;
}, z.core.$strict>;
type RenderKind = z.infer<typeof RenderKindSchema>;
type RenderStatus = z.infer<typeof RenderStatusSchema>;
type RenderVisibility = z.infer<typeof RenderVisibilitySchema>;
type RenderDelivery = z.infer<typeof RenderDeliverySchema>;
type RenderError = z.infer<typeof RenderErrorSchema>;
type RenderJobSubmitRequest = z.infer<typeof RenderJobSubmitRequestSchema>;
type RenderJobStatus = z.infer<typeof RenderJobStatusSchema>;
type RenderJobSubmitResponse = z.infer<typeof RenderJobSubmitResponseSchema>;
type RenderJobStatusResponse = z.infer<typeof RenderJobStatusResponseSchema>;
type RenderJobCancelResponse = z.infer<typeof RenderJobCancelResponseSchema>;
type RenderJobResultResponse = z.infer<typeof RenderJobResultResponseSchema>;
type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
declare function parseRenderJobSubmitRequest(payload: unknown): RenderJobSubmitRequest;
declare function parseRenderJobStatusResponse(payload: unknown): RenderJobStatusResponse;

export { type AiProvider, type AiRoleLimits, type AiToolCallRecord, type AiUsageLedgerEntry, type AuthMeResponse, AuthMeResponseSchema, type AuthMeResponseUser, AuthMeResponseUserSchema, type AuthMeResponseWorkspace, AuthMeResponseWorkspaceSchema, type BoilAcidComputeBlock, type BoilComputeAndSaveRequest, type BoilComputeAndSaveResponseV1, type ErrorResponse, ErrorResponseSchema, type ExpectedRaRange, type GravityAnalysisCanonicalModelsV1, type GravityAnalysisDerivationKind, type GravityAnalysisIbuModelV1, type GravityAnalysisResponseV1, type GravityAnalysisResultV1, type GravityAnalysisSrmModelV1, type GravityAnalysisWarningCode, type GravityAnalysisWarningV1, type IonProfilePpm, type MashAcidComputeBlock, type MashAcidificationTargetMashPhResult, type MashComputeAndSaveRequest, type MashComputeAndSaveResponseV1, type NumberFormatHintV1, type NumberFormatUnit, type RecipeWaterHubStreamSummary, type RecipeWaterHubSummary, type RecipeWaterHubSummaryResponse, type RecipeWaterSettings, type RecipeWaterSettingsResponse, type RecipeWaterSettingsSavedRef, type RenderDelivery, RenderDeliverySchema, type RenderError, RenderErrorSchema, type RenderJobCancelResponse, RenderJobCancelResponseSchema, type RenderJobResultResponse, RenderJobResultResponseSchema, type RenderJobStatus, type RenderJobStatusResponse, RenderJobStatusResponseSchema, RenderJobStatusSchema, type RenderJobSubmitRequest, RenderJobSubmitRequestSchema, type RenderJobSubmitResponse, RenderJobSubmitResponseSchema, type RenderKind, RenderKindSchema, type RenderStatus, RenderStatusSchema, type RenderVisibility, RenderVisibilitySchema, type SpargeAcidComputeBlock, type SpargeComputeAndSaveRequest, type SpargeComputeAndSaveResponseV1, type UpdateWorkspaceAiSettingsRequest, type WaterAcidificationManualResult, type WaterAcidificationResult, type WaterCalcDerivation, type WaterCalcDerivationKind, type WaterCalcDerivationLine, type WaterCalcDerivationValue, type WaterCalcNoteCode, type WaterCalcUnit, type WaterHubFormatHintKeys, type WaterOverallResult, type WaterProfile, type WaterProfilesResponse, type WaterSaltAdditionsResult, type WorkspaceAiSettings, type WorkspaceAiSettingsResponse, type WorkspaceAiUsageResponse, analysisFormatHints, parseAuthMeResponse, parseBoilComputeAndSaveResponse, parseGravityAnalysisResponseV1, parseMashComputeAndSaveResponse, parseRecipeWaterHubSummaryResponse, parseRenderJobStatusResponse, parseRenderJobSubmitRequest, parseSpargeComputeAndSaveResponse, parseWaterProfileItem, parseWaterProfilesResponse, waterFormatHints };
