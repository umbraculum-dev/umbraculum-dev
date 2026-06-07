import * as _umbraculum_brewery_contracts from '@umbraculum/brewery-contracts';
import { BrewSessionsListResponse, RecipesListResponse, WaterCalcResultOnlyResponseSchema, WaterCalcWithDerivationResponseSchema, BoilComputeAndSaveResponseV1, MashComputeAndSaveResponseV1, SpargeComputeAndSaveResponseV1, WaterProfile, WaterProfilesResponse, RecipeWaterSettingsGetResponseSchema, RecipeWaterSettingsPutResponseSchema } from '@umbraculum/brewery-contracts';
export { BoilComputeAndSaveResponseV1, BrewSessionListItem, MashComputeAndSaveResponseV1, RecipeListItem, SpargeComputeAndSaveResponseV1, WaterProfile, WaterProfilesResponse } from '@umbraculum/brewery-contracts';
import { BreweryOpenApiPaths, ApiClient } from '@umbraculum/api-client';

type RecipesListPath = "/recipes";
type RecipesListGet = BreweryOpenApiPaths[RecipesListPath]["get"];
type RecipeDetailPath = "/recipes/{id}";
type RecipeDetailGet = BreweryOpenApiPaths[RecipeDetailPath]["get"];
type BrewSessionsListPath = "/recipes/{recipeId}/brew-sessions";
type BrewSessionsListGet = BreweryOpenApiPaths[BrewSessionsListPath]["get"];
type RecipeVersionsPath = "/recipes/{id}/versions";
type RecipeVersionsGet = BreweryOpenApiPaths[RecipeVersionsPath]["get"];
type RecipeDuplicatePath = "/recipes/{id}/duplicate";
type RecipeDuplicatePost = BreweryOpenApiPaths[RecipeDuplicatePath]["post"];

declare function listRecipes(client: ApiClient): Promise<RecipesListResponse>;
declare function getRecipe(client: ApiClient, recipeId: string): Promise<{
    ok: true;
    recipe: Record<string, unknown>;
}>;
declare function listBrewSessionsForRecipe(client: ApiClient, recipeId: string): Promise<BrewSessionsListResponse>;
declare function createBrewSession(client: ApiClient, recipeId: string): Promise<{
    brewSession: {
        id: string;
    };
}>;
declare function patchRecipe(client: ApiClient, recipeId: string, patch: Record<string, unknown>): Promise<{
    ok: true;
    recipe: Record<string, unknown>;
}>;
declare function createRecipe(client: ApiClient, body: unknown): Promise<{
    ok: true;
    recipe: Record<string, unknown>;
}>;
declare function deleteRecipe(client: ApiClient, recipeId: string): Promise<{
    ok: true;
}>;
declare function listRecipeVersions(client: ApiClient, recipeId: string): Promise<{
    ok: true;
    versions: Record<string, unknown>[];
}>;
declare function createRecipeVersion(client: ApiClient, recipeId: string): Promise<{
    ok: true;
    recipe: Record<string, unknown>;
}>;
declare function duplicateRecipe(client: ApiClient, recipeId: string): Promise<{
    ok: true;
    recipe: Record<string, unknown>;
}>;

type RecipeBeerJsonExportPath = "/recipes/{id}/export/beerjson";
type RecipeBeerJsonExportGet = BreweryOpenApiPaths[RecipeBeerJsonExportPath]["get"];
type RecipesBeerJsonExportPath = "/recipes/export/beerjson";
type RecipesBeerJsonExportGet = BreweryOpenApiPaths[RecipesBeerJsonExportPath]["get"];

/** Client path for a single-recipe BeerJSON download (use with browser navigation or `exportRecipeBeerJson`). */
declare function recipeBeerJsonExportPath(recipeId: string): string;
/** Client path for bulk BeerJSON download. */
declare function allRecipesBeerJsonExportPath(): string;
declare function exportRecipeBeerJson(client: ApiClient, recipeId: string): Promise<Buffer>;
declare function exportAllRecipesBeerJson(client: ApiClient): Promise<Buffer>;

type IngredientSyncRunsPath = "/admin/ingredients/sync-runs";
type IngredientSyncRunsGet = BreweryOpenApiPaths[IngredientSyncRunsPath]["get"];
type IngredientSyncPath = "/admin/ingredients/sync";
type IngredientSyncPost = BreweryOpenApiPaths[IngredientSyncPath]["post"];

declare function listIngredientSyncRuns(client: ApiClient): Promise<{
    ok: true;
    runs: Record<string, unknown>[];
}>;
declare function runIngredientSync(client: ApiClient): Promise<{
    ok: true;
    result: Record<string, unknown>;
}>;

type StylesListPath = "/styles";
type StylesListGet = BreweryOpenApiPaths[StylesListPath]["get"];

declare function listStyles(client: ApiClient): Promise<{
    ok: true;
    styles: {
        key: string;
        name: string;
        source: string;
        version: string;
        code: string | null;
        category: string | null;
        categoryId: string | null;
        sortOrder: number;
    }[];
}>;

type FermentablesPath = "/ingredients/fermentables";
type FermentablesGet = BreweryOpenApiPaths[FermentablesPath]["get"];
type HopsPath = "/ingredients/hops";
type HopsGet = BreweryOpenApiPaths[HopsPath]["get"];
type YeastsPath = "/ingredients/yeasts";
type YeastsGet = BreweryOpenApiPaths[YeastsPath]["get"];

type IngredientsSearchParams = {
    query?: string;
    offset?: number;
    limit?: number;
};
declare function searchFermentables(client: ApiClient, params?: IngredientsSearchParams): Promise<{
    ok: true;
    items: Record<string, unknown>[];
    total: number;
    offset: number;
    limit: number;
}>;
declare function searchHops(client: ApiClient, params?: IngredientsSearchParams): Promise<{
    ok: true;
    items: Record<string, unknown>[];
    total: number;
    offset: number;
    limit: number;
}>;
declare function searchYeasts(client: ApiClient, params?: IngredientsSearchParams): Promise<{
    ok: true;
    items: Record<string, unknown>[];
}>;

type RecipeImportPreviewPath = "/recipes/import/preview";
type RecipeImportPreviewPost = BreweryOpenApiPaths[RecipeImportPreviewPath]["post"];
type RecipeImportPath = "/recipes/import";
type RecipeImportPost = BreweryOpenApiPaths[RecipeImportPath]["post"];
type RecipeBulkImportPreviewPath = "/recipes/import/bulk/preview";
type RecipeBulkImportPreviewPost = BreweryOpenApiPaths[RecipeBulkImportPreviewPath]["post"];
type RecipeBulkImportPath = "/recipes/import/bulk";
type RecipeBulkImportPost = BreweryOpenApiPaths[RecipeBulkImportPath]["post"];

declare function previewRecipeImport(client: ApiClient, body: unknown): Promise<{
    ok: true;
    format: "beerjson" | "beerxml";
    preview: Record<string, unknown>;
    workspaceId: string;
}>;
declare function importRecipe(client: ApiClient, body: unknown): Promise<{
    ok: true;
    recipe: Record<string, unknown>;
    warnings?: {
        code: string;
        message: string;
    }[] | undefined;
}>;
declare function previewBulkRecipeImport(client: ApiClient, body: unknown): Promise<{
    ok: true;
    format: "beerjson" | "beerxml";
    previewItems: Record<string, unknown>[];
    workspaceId: string;
}>;
declare function importRecipesBulk(client: ApiClient, body: unknown): Promise<{
    ok: true;
    created: Record<string, unknown>[];
    failed: {
        index: number;
        name: string;
        error: string;
    }[];
}>;

type BrewSessionDetailPath = "/brew-sessions/{brewSessionId}";
type BrewSessionDetailGet = BreweryOpenApiPaths[BrewSessionDetailPath]["get"];

type BrewSessionTimerAction = "start" | "pause" | "stop";
declare function getBrewSession(client: ApiClient, brewSessionId: string): Promise<{
    ok: true;
    brewSession: {
        [x: string]: unknown;
        id: string;
        workspaceId: string;
        recipeId: string;
        code: string | null;
        status: string;
        createdAt: string;
        updatedAt: string;
        startedAt: string | null;
        pausedAt: string | null;
        stoppedAt: string | null;
        scheduledDate: string | null;
        recipe?: {
            id: string;
            name: string;
            version: number;
        } | undefined;
        steps?: {
            [x: string]: unknown;
            id: string;
            brewSessionId: string;
            name: string;
            status: string;
            sortOrder: number;
            sectionId: string;
            sectionName: string | null;
            createdAt: string;
            updatedAt: string;
            isDisabled: boolean;
            customTimerEnabled: boolean;
            note: string | null;
            minutesPlanned: number | null;
            offsetMinutesFromEnd: number | null;
            relativeToStepId: string | null;
            timerAccumulatedSeconds: number;
            timerLastStartedAt: string | null;
            timerPausedAt: string | null;
            timerStartedAt: string | null;
            timerState: string;
            timerStoppedAt: string | null;
        }[] | undefined;
        logs?: {
            [x: string]: unknown;
            id: string;
            brewSessionId: string;
            kind: string;
            message: string;
            createdAt: string;
            stepId: string | null;
            payloadJson?: Record<string, unknown> | null | undefined;
        }[] | undefined;
    };
}>;
declare function patchBrewSession(client: ApiClient, brewSessionId: string, patch: Record<string, unknown>): Promise<{
    ok: true;
    brewSession: {
        [x: string]: unknown;
        id: string;
        workspaceId: string;
        recipeId: string;
        code: string | null;
        status: string;
        createdAt: string;
        updatedAt: string;
        startedAt: string | null;
        pausedAt: string | null;
        stoppedAt: string | null;
        scheduledDate: string | null;
        recipe?: {
            id: string;
            name: string;
            version: number;
        } | undefined;
        steps?: {
            [x: string]: unknown;
            id: string;
            brewSessionId: string;
            name: string;
            status: string;
            sortOrder: number;
            sectionId: string;
            sectionName: string | null;
            createdAt: string;
            updatedAt: string;
            isDisabled: boolean;
            customTimerEnabled: boolean;
            note: string | null;
            minutesPlanned: number | null;
            offsetMinutesFromEnd: number | null;
            relativeToStepId: string | null;
            timerAccumulatedSeconds: number;
            timerLastStartedAt: string | null;
            timerPausedAt: string | null;
            timerStartedAt: string | null;
            timerState: string;
            timerStoppedAt: string | null;
        }[] | undefined;
        logs?: {
            [x: string]: unknown;
            id: string;
            brewSessionId: string;
            kind: string;
            message: string;
            createdAt: string;
            stepId: string | null;
            payloadJson?: Record<string, unknown> | null | undefined;
        }[] | undefined;
    };
}>;
declare function deleteBrewSession(client: ApiClient, brewSessionId: string): Promise<{
    ok: true;
}>;
declare function startBrewSession(client: ApiClient, brewSessionId: string): Promise<{
    ok: true;
    brewSession: {
        [x: string]: unknown;
        id: string;
        workspaceId: string;
        recipeId: string;
        code: string | null;
        status: string;
        createdAt: string;
        updatedAt: string;
        startedAt: string | null;
        pausedAt: string | null;
        stoppedAt: string | null;
        scheduledDate: string | null;
        recipe?: {
            id: string;
            name: string;
            version: number;
        } | undefined;
        steps?: {
            [x: string]: unknown;
            id: string;
            brewSessionId: string;
            name: string;
            status: string;
            sortOrder: number;
            sectionId: string;
            sectionName: string | null;
            createdAt: string;
            updatedAt: string;
            isDisabled: boolean;
            customTimerEnabled: boolean;
            note: string | null;
            minutesPlanned: number | null;
            offsetMinutesFromEnd: number | null;
            relativeToStepId: string | null;
            timerAccumulatedSeconds: number;
            timerLastStartedAt: string | null;
            timerPausedAt: string | null;
            timerStartedAt: string | null;
            timerState: string;
            timerStoppedAt: string | null;
        }[] | undefined;
        logs?: {
            [x: string]: unknown;
            id: string;
            brewSessionId: string;
            kind: string;
            message: string;
            createdAt: string;
            stepId: string | null;
            payloadJson?: Record<string, unknown> | null | undefined;
        }[] | undefined;
    };
}>;
declare function pauseBrewSession(client: ApiClient, brewSessionId: string): Promise<{
    ok: true;
    brewSession: {
        [x: string]: unknown;
        id: string;
        workspaceId: string;
        recipeId: string;
        code: string | null;
        status: string;
        createdAt: string;
        updatedAt: string;
        startedAt: string | null;
        pausedAt: string | null;
        stoppedAt: string | null;
        scheduledDate: string | null;
        recipe?: {
            id: string;
            name: string;
            version: number;
        } | undefined;
        steps?: {
            [x: string]: unknown;
            id: string;
            brewSessionId: string;
            name: string;
            status: string;
            sortOrder: number;
            sectionId: string;
            sectionName: string | null;
            createdAt: string;
            updatedAt: string;
            isDisabled: boolean;
            customTimerEnabled: boolean;
            note: string | null;
            minutesPlanned: number | null;
            offsetMinutesFromEnd: number | null;
            relativeToStepId: string | null;
            timerAccumulatedSeconds: number;
            timerLastStartedAt: string | null;
            timerPausedAt: string | null;
            timerStartedAt: string | null;
            timerState: string;
            timerStoppedAt: string | null;
        }[] | undefined;
        logs?: {
            [x: string]: unknown;
            id: string;
            brewSessionId: string;
            kind: string;
            message: string;
            createdAt: string;
            stepId: string | null;
            payloadJson?: Record<string, unknown> | null | undefined;
        }[] | undefined;
    };
}>;
declare function stopBrewSession(client: ApiClient, brewSessionId: string, body?: unknown): Promise<{
    ok: true;
    brewSession: {
        [x: string]: unknown;
        id: string;
        workspaceId: string;
        recipeId: string;
        code: string | null;
        status: string;
        createdAt: string;
        updatedAt: string;
        startedAt: string | null;
        pausedAt: string | null;
        stoppedAt: string | null;
        scheduledDate: string | null;
        recipe?: {
            id: string;
            name: string;
            version: number;
        } | undefined;
        steps?: {
            [x: string]: unknown;
            id: string;
            brewSessionId: string;
            name: string;
            status: string;
            sortOrder: number;
            sectionId: string;
            sectionName: string | null;
            createdAt: string;
            updatedAt: string;
            isDisabled: boolean;
            customTimerEnabled: boolean;
            note: string | null;
            minutesPlanned: number | null;
            offsetMinutesFromEnd: number | null;
            relativeToStepId: string | null;
            timerAccumulatedSeconds: number;
            timerLastStartedAt: string | null;
            timerPausedAt: string | null;
            timerStartedAt: string | null;
            timerState: string;
            timerStoppedAt: string | null;
        }[] | undefined;
        logs?: {
            [x: string]: unknown;
            id: string;
            brewSessionId: string;
            kind: string;
            message: string;
            createdAt: string;
            stepId: string | null;
            payloadJson?: Record<string, unknown> | null | undefined;
        }[] | undefined;
    };
}>;
declare function patchBrewSessionSteps(client: ApiClient, brewSessionId: string, body: unknown): Promise<{
    ok: true;
    steps: {
        [x: string]: unknown;
        id: string;
        brewSessionId: string;
        name: string;
        status: string;
        sortOrder: number;
        sectionId: string;
        sectionName: string | null;
        createdAt: string;
        updatedAt: string;
        isDisabled: boolean;
        customTimerEnabled: boolean;
        note: string | null;
        minutesPlanned: number | null;
        offsetMinutesFromEnd: number | null;
        relativeToStepId: string | null;
        timerAccumulatedSeconds: number;
        timerLastStartedAt: string | null;
        timerPausedAt: string | null;
        timerStartedAt: string | null;
        timerState: string;
        timerStoppedAt: string | null;
    }[];
}>;
declare function postBrewSessionSteps(client: ApiClient, brewSessionId: string, body: unknown): Promise<{
    ok: true;
    steps: {
        [x: string]: unknown;
        id: string;
        brewSessionId: string;
        name: string;
        status: string;
        sortOrder: number;
        sectionId: string;
        sectionName: string | null;
        createdAt: string;
        updatedAt: string;
        isDisabled: boolean;
        customTimerEnabled: boolean;
        note: string | null;
        minutesPlanned: number | null;
        offsetMinutesFromEnd: number | null;
        relativeToStepId: string | null;
        timerAccumulatedSeconds: number;
        timerLastStartedAt: string | null;
        timerPausedAt: string | null;
        timerStartedAt: string | null;
        timerState: string;
        timerStoppedAt: string | null;
    }[];
}>;
declare function postBrewSessionStepLog(client: ApiClient, brewSessionId: string, stepId: string, body: unknown): Promise<{
    ok: true;
    step: {
        [x: string]: unknown;
        id: string;
        brewSessionId: string;
        name: string;
        status: string;
        sortOrder: number;
        sectionId: string;
        sectionName: string | null;
        createdAt: string;
        updatedAt: string;
        isDisabled: boolean;
        customTimerEnabled: boolean;
        note: string | null;
        minutesPlanned: number | null;
        offsetMinutesFromEnd: number | null;
        relativeToStepId: string | null;
        timerAccumulatedSeconds: number;
        timerLastStartedAt: string | null;
        timerPausedAt: string | null;
        timerStartedAt: string | null;
        timerState: string;
        timerStoppedAt: string | null;
    };
}>;
declare function patchBrewSessionStep(client: ApiClient, brewSessionId: string, stepId: string, body: unknown): Promise<{
    ok: true;
    step: {
        [x: string]: unknown;
        id: string;
        brewSessionId: string;
        name: string;
        status: string;
        sortOrder: number;
        sectionId: string;
        sectionName: string | null;
        createdAt: string;
        updatedAt: string;
        isDisabled: boolean;
        customTimerEnabled: boolean;
        note: string | null;
        minutesPlanned: number | null;
        offsetMinutesFromEnd: number | null;
        relativeToStepId: string | null;
        timerAccumulatedSeconds: number;
        timerLastStartedAt: string | null;
        timerPausedAt: string | null;
        timerStartedAt: string | null;
        timerState: string;
        timerStoppedAt: string | null;
    };
}>;
declare function postBrewSessionStepTimerAction(client: ApiClient, brewSessionId: string, stepId: string, action: BrewSessionTimerAction): Promise<{
    ok: true;
    step: {
        [x: string]: unknown;
        id: string;
        brewSessionId: string;
        name: string;
        status: string;
        sortOrder: number;
        sectionId: string;
        sectionName: string | null;
        createdAt: string;
        updatedAt: string;
        isDisabled: boolean;
        customTimerEnabled: boolean;
        note: string | null;
        minutesPlanned: number | null;
        offsetMinutesFromEnd: number | null;
        relativeToStepId: string | null;
        timerAccumulatedSeconds: number;
        timerLastStartedAt: string | null;
        timerPausedAt: string | null;
        timerStartedAt: string | null;
        timerState: string;
        timerStoppedAt: string | null;
    };
}>;
declare function listBrewSessionIntegrationAttachments(client: ApiClient, brewSessionId: string): Promise<{
    ok: true;
    attachments: {
        id: string;
        attachedAt: string;
        device: Record<string, unknown>;
    }[];
}>;
declare function listBrewSessionIntegrationReadings(client: ApiClient, brewSessionId: string, params: {
    kind: "tilt" | "ispindel" | "rapt";
    limit?: number;
}): Promise<{
    ok: true;
    readings: Record<string, unknown>[];
}>;
declare function attachBrewSessionIntegration(client: ApiClient, brewSessionId: string, body: unknown): Promise<{
    ok: true;
    attachment: Record<string, unknown>;
}>;
declare function detachBrewSessionIntegration(client: ApiClient, brewSessionId: string, body: unknown): Promise<{
    ok: true;
    detachedCount: number;
}>;

type InventoryListPath = "/inventory";
type InventoryListGet = BreweryOpenApiPaths[InventoryListPath]["get"];

declare function listInventory(client: ApiClient): Promise<{
    ok: true;
    items: {
        id: string;
        workspaceId: string;
        category: string;
        ingredientId: string | null;
        name: string;
        quantity: number;
        unit: string;
        metadataJson: unknown;
        createdAt: string;
        updatedAt: string;
    }[];
}>;
declare function createInventoryItem(client: ApiClient, body: unknown): Promise<{
    ok: true;
    item: {
        id: string;
        workspaceId: string;
        category: string;
        ingredientId: string | null;
        name: string;
        quantity: number;
        unit: string;
        metadataJson: unknown;
        createdAt: string;
        updatedAt: string;
    };
}>;
declare function patchInventoryItem(client: ApiClient, itemId: string, body: unknown): Promise<{
    ok: true;
    item: {
        id: string;
        workspaceId: string;
        category: string;
        ingredientId: string | null;
        name: string;
        quantity: number;
        unit: string;
        metadataJson: unknown;
        createdAt: string;
        updatedAt: string;
    };
}>;
declare function deleteInventoryItem(client: ApiClient, itemId: string): Promise<{
    ok: true;
}>;

type EquipmentProfilesListPath = "/equipment-profiles";
type EquipmentProfilesListGet = BreweryOpenApiPaths[EquipmentProfilesListPath]["get"];

declare function listEquipmentProfiles(client: ApiClient): Promise<{
    ok: true;
    profiles: {
        id: string;
        workspaceId: string;
        name: string;
        equipment: Record<string, unknown>;
        createdAt: string;
        updatedAt: string;
    }[];
}>;
declare function createEquipmentProfile(client: ApiClient, body: unknown): Promise<{
    ok: true;
    profile: {
        id: string;
        workspaceId: string;
        name: string;
        equipment: Record<string, unknown>;
        createdAt: string;
        updatedAt: string;
    };
}>;
declare function patchEquipmentProfile(client: ApiClient, profileId: string, body: unknown): Promise<{
    ok: true;
    profile: {
        id: string;
        workspaceId: string;
        name: string;
        equipment: Record<string, unknown>;
        createdAt: string;
        updatedAt: string;
    };
}>;
declare function deleteEquipmentProfile(client: ApiClient, profileId: string): Promise<{
    ok: true;
}>;

type BrewdaySettingsPath = "/brewday-settings";
type BrewdaySettingsGet = BreweryOpenApiPaths[BrewdaySettingsPath]["get"];

declare function getBrewdaySettings(client: ApiClient): Promise<{
    ok: true;
    settings: Record<string, unknown> | null;
}>;
declare function patchBrewdaySettings(client: ApiClient, body: unknown): Promise<{
    ok: true;
    settings: Record<string, unknown> | null;
}>;

type WaterHubSummaryPath = "/recipes/{id}/water-hub-summary";
type WaterHubSummaryGet = BreweryOpenApiPaths[WaterHubSummaryPath]["get"];

/** Recipe water hub summary for native/web water hub screens. */
declare function getRecipeWaterHubSummary(client: ApiClient, recipeId: string): Promise<_umbraculum_brewery_contracts.RecipeWaterHubSummaryResponse>;

type SaltAdditionsPath = "/water-calc/salt-additions";
type SaltAdditionsPost = BreweryOpenApiPaths[SaltAdditionsPath]["post"];
type MashPhEstimatePath = "/water-calc/mash-ph-estimate";
type MashPhEstimatePost = BreweryOpenApiPaths[MashPhEstimatePath]["post"];
type MashOverallPath = "/water-calc/mash-overall";
type MashOverallPost = BreweryOpenApiPaths[MashOverallPath]["post"];
type SpargeOverallPath = "/water-calc/sparge-overall";
type SpargeOverallPost = BreweryOpenApiPaths[SpargeOverallPath]["post"];
type BoilOverallPath = "/water-calc/boil-overall";
type BoilOverallPost = BreweryOpenApiPaths[BoilOverallPath]["post"];
type SpargeAcidificationPath = "/water-calc/sparge-acidification";
type SpargeAcidificationPost = BreweryOpenApiPaths[SpargeAcidificationPath]["post"];
type SpargeAcidificationManualPath = "/water-calc/sparge-acidification-manual";
type SpargeAcidificationManualPost = BreweryOpenApiPaths[SpargeAcidificationManualPath]["post"];
type MashAcidificationPath = "/water-calc/mash-acidification";
type MashAcidificationPost = BreweryOpenApiPaths[MashAcidificationPath]["post"];
type MashAcidificationManualPath = "/water-calc/mash-acidification-manual";
type MashAcidificationManualPost = BreweryOpenApiPaths[MashAcidificationManualPath]["post"];
type MashAcidificationTargetMashPhPath = "/water-calc/mash-acidification-target-mash-ph";
type MashAcidificationTargetMashPhPost = BreweryOpenApiPaths[MashAcidificationTargetMashPhPath]["post"];
type WaterCalcWithDerivationResponse = ReturnType<typeof WaterCalcWithDerivationResponseSchema.parse>;
type WaterCalcResultOnlyResponse = ReturnType<typeof WaterCalcResultOnlyResponseSchema.parse>;

declare function calcSaltAdditions(client: ApiClient, payload: Record<string, unknown>): Promise<WaterCalcWithDerivationResponse>;
declare function estimateMashPh(client: ApiClient, payload: Record<string, unknown>): Promise<WaterCalcResultOnlyResponse>;
declare function calcMashOverall(client: ApiClient, payload: Record<string, unknown>): Promise<WaterCalcWithDerivationResponse>;
declare function calcSpargeOverall(client: ApiClient, payload: Record<string, unknown>): Promise<WaterCalcWithDerivationResponse>;
declare function calcBoilOverall(client: ApiClient, payload: Record<string, unknown>): Promise<WaterCalcWithDerivationResponse>;
declare function calcSpargeAcidification(client: ApiClient, payload: Record<string, unknown>): Promise<WaterCalcWithDerivationResponse>;
declare function calcSpargeAcidificationManual(client: ApiClient, payload: Record<string, unknown>): Promise<WaterCalcWithDerivationResponse>;
declare function calcMashAcidification(client: ApiClient, payload: Record<string, unknown>): Promise<WaterCalcWithDerivationResponse>;
declare function calcMashAcidificationManual(client: ApiClient, payload: Record<string, unknown>): Promise<WaterCalcWithDerivationResponse>;
declare function calcMashAcidificationTargetMashPh(client: ApiClient, payload: Record<string, unknown>): Promise<WaterCalcResultOnlyResponse>;

type MashComputeAndSavePath = "/recipes/{id}/water-settings/mash/compute-and-save";
type MashComputeAndSavePost = BreweryOpenApiPaths[MashComputeAndSavePath]["post"];
type SpargeComputeAndSavePath = "/recipes/{id}/water-settings/sparge/compute-and-save";
type SpargeComputeAndSavePost = BreweryOpenApiPaths[SpargeComputeAndSavePath]["post"];
type BoilComputeAndSavePath = "/recipes/{id}/water-settings/boil/compute-and-save";
type BoilComputeAndSavePost = BreweryOpenApiPaths[BoilComputeAndSavePath]["post"];

declare function computeAndSaveMash(client: ApiClient, recipeId: string, payload: Record<string, unknown>): Promise<MashComputeAndSaveResponseV1>;
declare function computeAndSaveSparge(client: ApiClient, recipeId: string, payload: Record<string, unknown>): Promise<SpargeComputeAndSaveResponseV1>;
declare function computeAndSaveBoil(client: ApiClient, recipeId: string, payload: Record<string, unknown>): Promise<BoilComputeAndSaveResponseV1>;

type WaterProfilesListPath = "/water-profiles";
type WaterProfilesListGet = BreweryOpenApiPaths[WaterProfilesListPath]["get"];
type WaterProfilesCreatePath = "/water-profiles";
type WaterProfilesCreatePost = BreweryOpenApiPaths[WaterProfilesCreatePath]["post"];
type WaterProfileVerifyPath = "/water-profiles/{id}/verify";
type WaterProfileVerifyPost = BreweryOpenApiPaths[WaterProfileVerifyPath]["post"];
type WaterProfileUnverifyPath = "/water-profiles/{id}/unverify";
type WaterProfileUnverifyPost = BreweryOpenApiPaths[WaterProfileUnverifyPath]["post"];
type WaterProfileDeletePath = "/water-profiles/{id}";
type WaterProfileDeleteDelete = BreweryOpenApiPaths[WaterProfileDeletePath]["delete"];

declare function listWaterProfiles(client: ApiClient): Promise<WaterProfilesResponse>;
declare function createWaterProfile(client: ApiClient, body: unknown): Promise<{
    ok: true;
    profile: WaterProfile;
}>;
declare function verifyWaterProfile(client: ApiClient, profileId: string): Promise<{
    ok: true;
}>;
declare function unverifyWaterProfile(client: ApiClient, profileId: string): Promise<{
    ok: true;
}>;
declare function deleteWaterProfile(client: ApiClient, profileId: string): Promise<{
    ok: true;
}>;

type RecipeWaterSettingsPath = "/recipes/{id}/water-settings";
type RecipeWaterSettingsGet = BreweryOpenApiPaths[RecipeWaterSettingsPath]["get"];
type RecipeWaterSettingsPut = BreweryOpenApiPaths[RecipeWaterSettingsPath]["put"];

declare function getRecipeWaterSettings(client: ApiClient, recipeId: string): Promise<ReturnType<typeof RecipeWaterSettingsGetResponseSchema.parse>>;
declare function updateRecipeWaterSettings(client: ApiClient, recipeId: string, patch: Record<string, unknown>): Promise<ReturnType<typeof RecipeWaterSettingsPutResponseSchema.parse>>;

export { type BoilComputeAndSavePost, type BoilOverallPost, type BrewSessionDetailGet, type BrewSessionsListGet, type BrewdaySettingsGet, type EquipmentProfilesListGet, type FermentablesGet, type HopsGet, type IngredientSyncPost, type IngredientSyncRunsGet, type IngredientsSearchParams, type InventoryListGet, type MashAcidificationManualPost, type MashAcidificationPost, type MashAcidificationTargetMashPhPost, type MashComputeAndSavePost, type MashOverallPost, type MashPhEstimatePost, type RecipeBeerJsonExportGet, type RecipeBulkImportPost, type RecipeBulkImportPreviewPost, type RecipeDetailGet, type RecipeDuplicatePost, type RecipeImportPost, type RecipeImportPreviewPost, type RecipeVersionsGet, type RecipeWaterSettingsGet, type RecipeWaterSettingsPut, type RecipesBeerJsonExportGet, type RecipesListGet, type SaltAdditionsPost, type SpargeAcidificationManualPost, type SpargeAcidificationPost, type SpargeComputeAndSavePost, type SpargeOverallPost, type StylesListGet, type WaterCalcResultOnlyResponse, type WaterCalcWithDerivationResponse, type WaterHubSummaryGet, type WaterProfileDeleteDelete, type WaterProfileUnverifyPost, type WaterProfileVerifyPost, type WaterProfilesCreatePost, type WaterProfilesListGet, type YeastsGet, allRecipesBeerJsonExportPath, attachBrewSessionIntegration, calcBoilOverall, calcMashAcidification, calcMashAcidificationManual, calcMashAcidificationTargetMashPh, calcMashOverall, calcSaltAdditions, calcSpargeAcidification, calcSpargeAcidificationManual, calcSpargeOverall, computeAndSaveBoil, computeAndSaveMash, computeAndSaveSparge, createBrewSession, createEquipmentProfile, createInventoryItem, createRecipe, createRecipeVersion, createWaterProfile, deleteBrewSession, deleteEquipmentProfile, deleteInventoryItem, deleteRecipe, deleteWaterProfile, detachBrewSessionIntegration, duplicateRecipe, estimateMashPh, exportAllRecipesBeerJson, exportRecipeBeerJson, getBrewSession, getBrewdaySettings, getRecipe, getRecipeWaterHubSummary, getRecipeWaterSettings, importRecipe, importRecipesBulk, listBrewSessionIntegrationAttachments, listBrewSessionIntegrationReadings, listBrewSessionsForRecipe, listEquipmentProfiles, listIngredientSyncRuns, listInventory, listRecipeVersions, listRecipes, listStyles, listWaterProfiles, patchBrewSession, patchBrewSessionStep, patchBrewSessionSteps, patchBrewdaySettings, patchEquipmentProfile, patchInventoryItem, patchRecipe, pauseBrewSession, postBrewSessionStepLog, postBrewSessionStepTimerAction, postBrewSessionSteps, previewBulkRecipeImport, previewRecipeImport, recipeBeerJsonExportPath, runIngredientSync, searchFermentables, searchHops, searchYeasts, startBrewSession, stopBrewSession, unverifyWaterProfile, updateRecipeWaterSettings, verifyWaterProfile };
