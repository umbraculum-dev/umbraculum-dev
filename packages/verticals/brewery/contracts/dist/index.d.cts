import { z } from 'zod';
import { NumberFormatHintV1 } from '@umbraculum/contracts';

/**
 * Wire-level contract version of `@umbraculum/brewery-contracts`.
 *
 * Bumped when the brewery vertical surface ships breaking contract changes.
 */
declare const CONTRACT_VERSION: "0.1.0-alpha.1";
interface SemVer {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly prerelease?: string;
}
declare function parseSemVer(input: string): SemVer | null;
type VersionMismatchSeverity = "match" | "patch" | "minor" | "major" | "unparseable";
declare function classifyContractVersionSkew(runtime: string, expected?: string): VersionMismatchSeverity;

/**
 * Shared brewery route schema primitives.
 */

declare const isoDateTime: z.ZodPreprocess<z.ZodString>;
declare const OkResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, z.core.$strip>;
declare const IdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
declare const InventoryCategoryQuerySchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const BeerStyleSchema: z.ZodObject<{
    key: z.ZodString;
    name: z.ZodString;
    source: z.ZodString;
    version: z.ZodString;
    code: z.ZodNullable<z.ZodString>;
    category: z.ZodNullable<z.ZodString>;
    categoryId: z.ZodNullable<z.ZodString>;
    sortOrder: z.ZodNumber;
}, z.core.$strip>;
declare const StylesListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    styles: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        name: z.ZodString;
        source: z.ZodString;
        version: z.ZodString;
        code: z.ZodNullable<z.ZodString>;
        category: z.ZodNullable<z.ZodString>;
        categoryId: z.ZodNullable<z.ZodString>;
        sortOrder: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const RecipeIdParamsSchema: z.ZodObject<{
    recipeId: z.ZodString;
}, z.core.$strip>;
declare const BrewSessionIdParamsSchema: z.ZodObject<{
    brewSessionId: z.ZodString;
}, z.core.$strip>;
declare const BrewSessionStepParamsSchema: z.ZodObject<{
    brewSessionId: z.ZodString;
    stepId: z.ZodString;
}, z.core.$strip>;
declare const IntegrationReadingsQuerySchema: z.ZodObject<{
    kind: z.ZodEnum<{
        tilt: "tilt";
        ispindel: "ispindel";
        rapt: "rapt";
    }>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;

declare const EquipmentProfilePayloadSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    name: z.ZodString;
    equipment: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    createdAt: z.ZodPreprocess<z.ZodString>;
    updatedAt: z.ZodPreprocess<z.ZodString>;
}, z.core.$strip>;
declare const EquipmentProfilesListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    profiles: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        name: z.ZodString;
        equipment: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        createdAt: z.ZodPreprocess<z.ZodString>;
        updatedAt: z.ZodPreprocess<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const EquipmentProfileResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    profile: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        name: z.ZodString;
        equipment: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        createdAt: z.ZodPreprocess<z.ZodString>;
        updatedAt: z.ZodPreprocess<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const EquipmentProfileCreateRequestSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const EquipmentProfilePatchRequestSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;

declare const InventoryItemPayloadSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    category: z.ZodString;
    ingredientId: z.ZodNullable<z.ZodString>;
    name: z.ZodString;
    quantity: z.ZodNumber;
    unit: z.ZodString;
    metadataJson: z.ZodNullable<z.ZodUnknown>;
    createdAt: z.ZodPreprocess<z.ZodString>;
    updatedAt: z.ZodPreprocess<z.ZodString>;
}, z.core.$strip>;
declare const InventoryListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        category: z.ZodString;
        ingredientId: z.ZodNullable<z.ZodString>;
        name: z.ZodString;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        metadataJson: z.ZodNullable<z.ZodUnknown>;
        createdAt: z.ZodPreprocess<z.ZodString>;
        updatedAt: z.ZodPreprocess<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const InventoryItemResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    item: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        category: z.ZodString;
        ingredientId: z.ZodNullable<z.ZodString>;
        name: z.ZodString;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        metadataJson: z.ZodNullable<z.ZodUnknown>;
        createdAt: z.ZodPreprocess<z.ZodString>;
        updatedAt: z.ZodPreprocess<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
declare const InventoryCreateRequestSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const InventoryPatchRequestSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const BrewdaySettingsPayloadSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const BrewdaySettingsResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    settings: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
declare const BrewdaySettingsPatchRequestSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;

declare const RecipePayloadSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const RecipeListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    recipes: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
declare const RecipeResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    recipe: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
declare const RecipeCreateRequestSchema: z.ZodObject<{
    name: z.ZodString;
    styleKey: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    beerJsonRecipeJson: z.ZodOptional<z.ZodUnknown>;
    recipeExtJson: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
declare const RecipePatchRequestSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    styleKey: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    beerJsonRecipeJson: z.ZodOptional<z.ZodUnknown>;
    recipeExtJson: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
declare const RecipeVersionsResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    versions: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
/** BeerJSON export routes stream raw bytes; OpenAPI documents a placeholder object. */
declare const BeerJsonExportResponseSchema: z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>;
declare const RecipeImportFormatSchema: z.ZodEnum<{
    beerjson: "beerjson";
    beerxml: "beerxml";
}>;
declare const RecipeImportWarningSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
}, z.core.$strip>;
declare const RecipeImportRequestSchema: z.ZodObject<{
    format: z.ZodEnum<{
        beerjson: "beerjson";
        beerxml: "beerxml";
    }>;
    content: z.ZodString;
    styleKey: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const RecipeBulkImportRequestSchema: z.ZodObject<{
    format: z.ZodEnum<{
        beerjson: "beerjson";
        beerxml: "beerxml";
    }>;
    content: z.ZodString;
}, z.core.$strip>;
declare const RecipeImportPreviewPayloadSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const RecipeImportPreviewResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    format: z.ZodEnum<{
        beerjson: "beerjson";
        beerxml: "beerxml";
    }>;
    preview: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    workspaceId: z.ZodString;
}, z.core.$strip>;
declare const RecipeImportResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    recipe: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    warnings: z.ZodOptional<z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
declare const RecipeBulkImportPreviewItemSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const RecipeBulkImportPreviewResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    format: z.ZodEnum<{
        beerjson: "beerjson";
        beerxml: "beerxml";
    }>;
    previewItems: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    workspaceId: z.ZodString;
}, z.core.$strip>;
declare const RecipeBulkImportCreatedItemSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const RecipeBulkImportFailedItemSchema: z.ZodObject<{
    index: z.ZodNumber;
    name: z.ZodString;
    error: z.ZodString;
}, z.core.$strip>;
declare const RecipeBulkImportResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    created: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    failed: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        name: z.ZodString;
        error: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;

declare const IngredientsSearchQuerySchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    offset: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
declare const FermentableItemSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const FermentablesListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    total: z.ZodNumber;
    offset: z.ZodNumber;
    limit: z.ZodNumber;
}, z.core.$strip>;
declare const HopItemSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const HopsListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    total: z.ZodNumber;
    offset: z.ZodNumber;
    limit: z.ZodNumber;
}, z.core.$strip>;
declare const YeastItemSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const YeastsListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    items: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
declare const IngredientSyncRunSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const IngredientSyncRunsResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    runs: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
declare const IngredientSyncResultSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const IngredientSyncResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    result: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;

/**
 * Brewery list API responses consumed by web and native clients.
 */

declare const RecipeListItemSchema: z.ZodObject<{
    id: z.ZodString;
    accountId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    styleKey: z.ZodOptional<z.ZodString>;
    style: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    version: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
type RecipeListItem = z.infer<typeof RecipeListItemSchema>;
declare const RecipesListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    recipes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        accountId: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        styleKey: z.ZodOptional<z.ZodString>;
        style: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        version: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type RecipesListResponse = z.infer<typeof RecipesListResponseSchema>;
declare function parseRecipesListResponse(payload: unknown): RecipesListResponse;
declare const BrewSessionListItemSchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    status: z.ZodString;
    createdAt: z.ZodPreprocess<z.ZodString>;
    startedAt: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodString>>>;
    stoppedAt: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodString>>>;
}, z.core.$strip>;
type BrewSessionListItem = z.infer<typeof BrewSessionListItemSchema>;
declare const BrewSessionsListResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    brewSessions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        status: z.ZodString;
        createdAt: z.ZodPreprocess<z.ZodString>;
        startedAt: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodString>>>;
        stoppedAt: z.ZodOptional<z.ZodPreprocess<z.ZodNullable<z.ZodString>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type BrewSessionsListResponse = z.infer<typeof BrewSessionsListResponseSchema>;
declare function parseBrewSessionsListResponse(payload: unknown): BrewSessionsListResponse;
declare const BrewSessionRecipeRefSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    version: z.ZodNumber;
}, z.core.$strip>;
declare const BrewSessionLogSchema: z.ZodObject<{
    id: z.ZodString;
    brewSessionId: z.ZodString;
    kind: z.ZodString;
    message: z.ZodString;
    createdAt: z.ZodPreprocess<z.ZodString>;
    stepId: z.ZodNullable<z.ZodString>;
    payloadJson: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$loose>;
/** Step/timer fields use passthrough for forward-compatible Prisma columns. */
declare const BrewSessionStepSchema: z.ZodObject<{
    id: z.ZodString;
    brewSessionId: z.ZodString;
    name: z.ZodString;
    status: z.ZodString;
    sortOrder: z.ZodNumber;
    sectionId: z.ZodString;
    sectionName: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodPreprocess<z.ZodString>;
    updatedAt: z.ZodPreprocess<z.ZodString>;
    isDisabled: z.ZodBoolean;
    customTimerEnabled: z.ZodBoolean;
    note: z.ZodNullable<z.ZodString>;
    minutesPlanned: z.ZodNullable<z.ZodNumber>;
    offsetMinutesFromEnd: z.ZodNullable<z.ZodNumber>;
    relativeToStepId: z.ZodNullable<z.ZodString>;
    timerAccumulatedSeconds: z.ZodNumber;
    timerLastStartedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    timerPausedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    timerStartedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    timerState: z.ZodString;
    timerStoppedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
}, z.core.$loose>;
declare const BrewSessionPayloadSchema: z.ZodObject<{
    id: z.ZodString;
    workspaceId: z.ZodString;
    recipeId: z.ZodString;
    code: z.ZodNullable<z.ZodString>;
    status: z.ZodString;
    createdAt: z.ZodPreprocess<z.ZodString>;
    updatedAt: z.ZodPreprocess<z.ZodString>;
    startedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    pausedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    stoppedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    scheduledDate: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    recipe: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        version: z.ZodNumber;
    }, z.core.$strip>>;
    steps: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        brewSessionId: z.ZodString;
        name: z.ZodString;
        status: z.ZodString;
        sortOrder: z.ZodNumber;
        sectionId: z.ZodString;
        sectionName: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodPreprocess<z.ZodString>;
        updatedAt: z.ZodPreprocess<z.ZodString>;
        isDisabled: z.ZodBoolean;
        customTimerEnabled: z.ZodBoolean;
        note: z.ZodNullable<z.ZodString>;
        minutesPlanned: z.ZodNullable<z.ZodNumber>;
        offsetMinutesFromEnd: z.ZodNullable<z.ZodNumber>;
        relativeToStepId: z.ZodNullable<z.ZodString>;
        timerAccumulatedSeconds: z.ZodNumber;
        timerLastStartedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        timerPausedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        timerStartedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        timerState: z.ZodString;
        timerStoppedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    }, z.core.$loose>>>;
    logs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        brewSessionId: z.ZodString;
        kind: z.ZodString;
        message: z.ZodString;
        createdAt: z.ZodPreprocess<z.ZodString>;
        stepId: z.ZodNullable<z.ZodString>;
        payloadJson: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$loose>>>;
}, z.core.$loose>;
declare const BrewSessionDetailResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    brewSession: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        recipeId: z.ZodString;
        code: z.ZodNullable<z.ZodString>;
        status: z.ZodString;
        createdAt: z.ZodPreprocess<z.ZodString>;
        updatedAt: z.ZodPreprocess<z.ZodString>;
        startedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        pausedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        stoppedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        scheduledDate: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        recipe: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strip>>;
        steps: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            brewSessionId: z.ZodString;
            name: z.ZodString;
            status: z.ZodString;
            sortOrder: z.ZodNumber;
            sectionId: z.ZodString;
            sectionName: z.ZodNullable<z.ZodString>;
            createdAt: z.ZodPreprocess<z.ZodString>;
            updatedAt: z.ZodPreprocess<z.ZodString>;
            isDisabled: z.ZodBoolean;
            customTimerEnabled: z.ZodBoolean;
            note: z.ZodNullable<z.ZodString>;
            minutesPlanned: z.ZodNullable<z.ZodNumber>;
            offsetMinutesFromEnd: z.ZodNullable<z.ZodNumber>;
            relativeToStepId: z.ZodNullable<z.ZodString>;
            timerAccumulatedSeconds: z.ZodNumber;
            timerLastStartedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
            timerPausedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
            timerStartedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
            timerState: z.ZodString;
            timerStoppedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        }, z.core.$loose>>>;
        logs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            brewSessionId: z.ZodString;
            kind: z.ZodString;
            message: z.ZodString;
            createdAt: z.ZodPreprocess<z.ZodString>;
            stepId: z.ZodNullable<z.ZodString>;
            payloadJson: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
}, z.core.$strip>;
declare const BrewSessionCreateResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    brewSession: z.ZodObject<{
        id: z.ZodString;
        workspaceId: z.ZodString;
        recipeId: z.ZodString;
        code: z.ZodNullable<z.ZodString>;
        status: z.ZodString;
        createdAt: z.ZodPreprocess<z.ZodString>;
        updatedAt: z.ZodPreprocess<z.ZodString>;
        startedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        pausedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        stoppedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        scheduledDate: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        recipe: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            version: z.ZodNumber;
        }, z.core.$strip>>;
        steps: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            brewSessionId: z.ZodString;
            name: z.ZodString;
            status: z.ZodString;
            sortOrder: z.ZodNumber;
            sectionId: z.ZodString;
            sectionName: z.ZodNullable<z.ZodString>;
            createdAt: z.ZodPreprocess<z.ZodString>;
            updatedAt: z.ZodPreprocess<z.ZodString>;
            isDisabled: z.ZodBoolean;
            customTimerEnabled: z.ZodBoolean;
            note: z.ZodNullable<z.ZodString>;
            minutesPlanned: z.ZodNullable<z.ZodNumber>;
            offsetMinutesFromEnd: z.ZodNullable<z.ZodNumber>;
            relativeToStepId: z.ZodNullable<z.ZodString>;
            timerAccumulatedSeconds: z.ZodNumber;
            timerLastStartedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
            timerPausedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
            timerStartedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
            timerState: z.ZodString;
            timerStoppedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        }, z.core.$loose>>>;
        logs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            brewSessionId: z.ZodString;
            kind: z.ZodString;
            message: z.ZodString;
            createdAt: z.ZodPreprocess<z.ZodString>;
            stepId: z.ZodNullable<z.ZodString>;
            payloadJson: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    steps: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        brewSessionId: z.ZodString;
        name: z.ZodString;
        status: z.ZodString;
        sortOrder: z.ZodNumber;
        sectionId: z.ZodString;
        sectionName: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodPreprocess<z.ZodString>;
        updatedAt: z.ZodPreprocess<z.ZodString>;
        isDisabled: z.ZodBoolean;
        customTimerEnabled: z.ZodBoolean;
        note: z.ZodNullable<z.ZodString>;
        minutesPlanned: z.ZodNullable<z.ZodNumber>;
        offsetMinutesFromEnd: z.ZodNullable<z.ZodNumber>;
        relativeToStepId: z.ZodNullable<z.ZodString>;
        timerAccumulatedSeconds: z.ZodNumber;
        timerLastStartedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        timerPausedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        timerStartedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        timerState: z.ZodString;
        timerStoppedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    }, z.core.$loose>>;
}, z.core.$strip>;
declare const BrewSessionStepResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    step: z.ZodObject<{
        id: z.ZodString;
        brewSessionId: z.ZodString;
        name: z.ZodString;
        status: z.ZodString;
        sortOrder: z.ZodNumber;
        sectionId: z.ZodString;
        sectionName: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodPreprocess<z.ZodString>;
        updatedAt: z.ZodPreprocess<z.ZodString>;
        isDisabled: z.ZodBoolean;
        customTimerEnabled: z.ZodBoolean;
        note: z.ZodNullable<z.ZodString>;
        minutesPlanned: z.ZodNullable<z.ZodNumber>;
        offsetMinutesFromEnd: z.ZodNullable<z.ZodNumber>;
        relativeToStepId: z.ZodNullable<z.ZodString>;
        timerAccumulatedSeconds: z.ZodNumber;
        timerLastStartedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        timerPausedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        timerStartedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        timerState: z.ZodString;
        timerStoppedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    }, z.core.$loose>;
}, z.core.$strip>;
declare const BrewSessionStepsResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    steps: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        brewSessionId: z.ZodString;
        name: z.ZodString;
        status: z.ZodString;
        sortOrder: z.ZodNumber;
        sectionId: z.ZodString;
        sectionName: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodPreprocess<z.ZodString>;
        updatedAt: z.ZodPreprocess<z.ZodString>;
        isDisabled: z.ZodBoolean;
        customTimerEnabled: z.ZodBoolean;
        note: z.ZodNullable<z.ZodString>;
        minutesPlanned: z.ZodNullable<z.ZodNumber>;
        offsetMinutesFromEnd: z.ZodNullable<z.ZodNumber>;
        relativeToStepId: z.ZodNullable<z.ZodString>;
        timerAccumulatedSeconds: z.ZodNumber;
        timerLastStartedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        timerPausedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        timerStartedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
        timerState: z.ZodString;
        timerStoppedAt: z.ZodNullable<z.ZodPreprocess<z.ZodString>>;
    }, z.core.$loose>>;
}, z.core.$strip>;
declare const BrewSessionPatchRequestSchema: z.ZodObject<{
    scheduledDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
declare const BrewSessionStepsPatchRequestSchema: z.ZodObject<{
    steps: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
declare const BrewSessionStepTimerPatchRequestSchema: z.ZodObject<{
    customTimerEnabled: z.ZodBoolean;
}, z.core.$strip>;
declare const BrewSessionStopRequestSchema: z.ZodPreprocess<z.ZodObject<{
    reason: z.ZodOptional<z.ZodEnum<{
        auto: "auto";
        manual: "manual";
    }>>;
}, z.core.$strip>>;
declare const BrewSessionStepLogRequestSchema: z.ZodObject<{
    status: z.ZodEnum<{
        pending: "pending";
        in_progress: "in_progress";
        done: "done";
        skipped: "skipped";
        not_applicable: "not_applicable";
    }>;
    note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    name: z.ZodOptional<z.ZodString>;
    isDisabled: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
declare const IntegrationAttachmentDeviceSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const IntegrationAttachmentSchema: z.ZodObject<{
    id: z.ZodString;
    attachedAt: z.ZodPreprocess<z.ZodString>;
    device: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
declare const IntegrationAttachmentsResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    attachments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        attachedAt: z.ZodPreprocess<z.ZodString>;
        device: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const IntegrationAttachRequestSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        tilt: "tilt";
        ispindel: "ispindel";
        rapt: "rapt";
    }>;
    deviceId: z.ZodString;
}, z.core.$strip>;
declare const IntegrationAttachResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    attachment: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
declare const IntegrationDetachRequestSchema: z.ZodObject<{
    deviceId: z.ZodString;
}, z.core.$strip>;
declare const IntegrationDetachResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    detachedCount: z.ZodNumber;
}, z.core.$strip>;
declare const IntegrationReadingSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const IntegrationReadingsResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    readings: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
declare function parseBrewSessionCreateResponse(payload: unknown): {
    brewSession: {
        id: string;
    };
};

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

declare const RecipeWaterHubSummaryResponseSchema: z.ZodCustom<RecipeWaterHubSummaryResponse, RecipeWaterHubSummaryResponse>;
declare const WaterProfilesListResponseSchema: z.ZodCustom<WaterProfilesResponse, WaterProfilesResponse>;
declare const WaterProfileItemSchema: z.ZodCustom<WaterProfile, WaterProfile>;
declare const WaterProfileResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    profile: z.ZodCustom<WaterProfile, WaterProfile>;
}, z.core.$strip>;
declare const WaterProfileCreateRequestSchema: z.ZodObject<{
    scope: z.ZodOptional<z.ZodEnum<{
        system: "system";
        account: "account";
        public: "public";
    }>>;
    type: z.ZodOptional<z.ZodEnum<{
        water: "water";
        dilution: "dilution";
    }>>;
    name: z.ZodOptional<z.ZodString>;
    ph: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodNull]>>;
    calcium: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodNull]>>;
    magnesium: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodNull]>>;
    sodium: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodNull]>>;
    sulfate: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodNull]>>;
    chloride: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodNull]>>;
    bicarbonate: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodNull]>>;
}, z.core.$strip>;
declare const WaterProfilePatchRequestSchema: z.ZodObject<{
    scope: z.ZodOptional<z.ZodEnum<{
        system: "system";
        account: "account";
        public: "public";
    }>>;
    type: z.ZodOptional<z.ZodEnum<{
        water: "water";
        dilution: "dilution";
    }>>;
    name: z.ZodOptional<z.ZodString>;
    ph: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodNull]>>;
    calcium: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodNull]>>;
    magnesium: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodNull]>>;
    sodium: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodNull]>>;
    sulfate: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodNull]>>;
    chloride: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodNull]>>;
    bicarbonate: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodNull]>>;
    verificationStatus: z.ZodOptional<z.ZodEnum<{
        verified: "verified";
        unverified: "unverified";
    }>>;
}, z.core.$strip>;
declare const RecipeWaterSettingsPayloadSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const RecipeWaterSettingsGetResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    settings: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
declare const RecipeWaterSettingsPutRequestSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const RecipeWaterSettingsPutResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    settings: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
declare const MashComputeAndSaveRequestSchema: z.ZodPreprocess<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
declare const MashComputeAndSaveResponseSchema: z.ZodCustom<MashComputeAndSaveResponseV1, MashComputeAndSaveResponseV1>;
declare const SpargeComputeAndSaveRequestSchema: z.ZodPreprocess<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
declare const SpargeComputeAndSaveResponseSchema: z.ZodCustom<SpargeComputeAndSaveResponseV1, SpargeComputeAndSaveResponseV1>;
declare const BoilComputeAndSaveRequestSchema: z.ZodPreprocess<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
declare const BoilComputeAndSaveResponseSchema: z.ZodCustom<BoilComputeAndSaveResponseV1, BoilComputeAndSaveResponseV1>;
declare const WaterCalcRequestSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
declare const WaterCalcWithDerivationResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    result: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    derivation: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
declare const WaterCalcResultOnlyResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    result: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;

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

export { BeerJsonExportResponseSchema, BeerStyleSchema, type BoilAcidComputeBlock, type BoilComputeAndSaveRequest, BoilComputeAndSaveRequestSchema, BoilComputeAndSaveResponseSchema, type BoilComputeAndSaveResponseV1, BrewSessionCreateResponseSchema, BrewSessionDetailResponseSchema, BrewSessionIdParamsSchema, type BrewSessionListItem, BrewSessionLogSchema, BrewSessionPatchRequestSchema, BrewSessionPayloadSchema, BrewSessionRecipeRefSchema, BrewSessionStepLogRequestSchema, BrewSessionStepParamsSchema, BrewSessionStepResponseSchema, BrewSessionStepSchema, BrewSessionStepTimerPatchRequestSchema, BrewSessionStepsPatchRequestSchema, BrewSessionStepsResponseSchema, BrewSessionStopRequestSchema, type BrewSessionsListResponse, BrewSessionsListResponseSchema, BrewdaySettingsPatchRequestSchema, BrewdaySettingsPayloadSchema, BrewdaySettingsResponseSchema, CONTRACT_VERSION, EquipmentProfileCreateRequestSchema, EquipmentProfilePatchRequestSchema, EquipmentProfilePayloadSchema, EquipmentProfileResponseSchema, EquipmentProfilesListResponseSchema, type ExpectedRaRange, FermentableItemSchema, FermentablesListResponseSchema, type GravityAnalysisCanonicalModelsV1, type GravityAnalysisDerivationKind, type GravityAnalysisIbuModelV1, type GravityAnalysisResponseV1, type GravityAnalysisResultV1, type GravityAnalysisSrmModelV1, type GravityAnalysisWarningCode, type GravityAnalysisWarningV1, HopItemSchema, HopsListResponseSchema, IdParamsSchema, IngredientSyncResponseSchema, IngredientSyncResultSchema, IngredientSyncRunSchema, IngredientSyncRunsResponseSchema, IngredientsSearchQuerySchema, IntegrationAttachRequestSchema, IntegrationAttachResponseSchema, IntegrationAttachmentDeviceSchema, IntegrationAttachmentSchema, IntegrationAttachmentsResponseSchema, IntegrationDetachRequestSchema, IntegrationDetachResponseSchema, IntegrationReadingSchema, IntegrationReadingsQuerySchema, IntegrationReadingsResponseSchema, InventoryCategoryQuerySchema, InventoryCreateRequestSchema, InventoryItemPayloadSchema, InventoryItemResponseSchema, InventoryListResponseSchema, InventoryPatchRequestSchema, type IonProfilePpm, type MashAcidComputeBlock, type MashAcidificationTargetMashPhResult, type MashComputeAndSaveRequest, MashComputeAndSaveRequestSchema, MashComputeAndSaveResponseSchema, type MashComputeAndSaveResponseV1, OkResponseSchema, RecipeBulkImportCreatedItemSchema, RecipeBulkImportFailedItemSchema, RecipeBulkImportPreviewItemSchema, RecipeBulkImportPreviewResponseSchema, RecipeBulkImportRequestSchema, RecipeBulkImportResponseSchema, RecipeCreateRequestSchema, RecipeIdParamsSchema, RecipeImportFormatSchema, RecipeImportPreviewPayloadSchema, RecipeImportPreviewResponseSchema, RecipeImportRequestSchema, RecipeImportResponseSchema, RecipeImportWarningSchema, type RecipeListItem, RecipeListResponseSchema, RecipePatchRequestSchema, RecipePayloadSchema, RecipeResponseSchema, RecipeVersionsResponseSchema, type RecipeWaterHubStreamSummary, type RecipeWaterHubSummary, type RecipeWaterHubSummaryResponse, RecipeWaterHubSummaryResponseSchema, type RecipeWaterSettings, RecipeWaterSettingsGetResponseSchema, RecipeWaterSettingsPayloadSchema, RecipeWaterSettingsPutRequestSchema, RecipeWaterSettingsPutResponseSchema, type RecipeWaterSettingsResponse, type RecipeWaterSettingsSavedRef, type RecipesListResponse, RecipesListResponseSchema, type SemVer, type SpargeAcidComputeBlock, type SpargeComputeAndSaveRequest, SpargeComputeAndSaveRequestSchema, SpargeComputeAndSaveResponseSchema, type SpargeComputeAndSaveResponseV1, StylesListResponseSchema, type VersionMismatchSeverity, type WaterAcidificationManualResult, type WaterAcidificationResult, type WaterCalcDerivation, type WaterCalcDerivationKind, type WaterCalcDerivationLine, type WaterCalcDerivationValue, type WaterCalcNoteCode, WaterCalcRequestSchema, WaterCalcResultOnlyResponseSchema, type WaterCalcUnit, WaterCalcWithDerivationResponseSchema, type WaterHubFormatHintKeys, type WaterOverallResult, type WaterProfile, WaterProfileCreateRequestSchema, WaterProfileItemSchema, WaterProfilePatchRequestSchema, WaterProfileResponseSchema, WaterProfilesListResponseSchema, type WaterProfilesResponse, type WaterSaltAdditionsResult, YeastItemSchema, YeastsListResponseSchema, classifyContractVersionSkew, isoDateTime, parseBoilComputeAndSaveResponse, parseBrewSessionCreateResponse, parseBrewSessionsListResponse, parseGravityAnalysisResponseV1, parseMashComputeAndSaveResponse, parseRecipeWaterHubSummaryResponse, parseRecipesListResponse, parseSemVer, parseSpargeComputeAndSaveResponse, parseWaterProfileItem, parseWaterProfilesResponse };
