import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';
import { EditorMashStep } from '@umbraculum/brewery-beerjson';

type RecipeMeta = {
    name: string | null;
    version: number | null;
};
declare function parseRecipeMetaFromGetRecipeResponse(data: unknown): RecipeMeta | null;
interface RecipeMetaLineProps {
    recipeId: string;
    enabled?: boolean;
    loadRecipeMeta: (recipeId: string) => Promise<RecipeMeta | null>;
}
declare function RecipeMetaLine(props: RecipeMetaLineProps): react_jsx_runtime.JSX.Element;

interface RecipeImageProps {
    assetKey: string;
    alt: string;
    width: number;
    height: number;
}
type RenderRecipeImage = (props: RecipeImageProps) => ReactNode;
interface ManualCellCountHelpBoxProps {
    renderImage: RenderRecipeImage;
}
declare function ManualCellCountHelpBox(props: ManualCellCountHelpBoxProps): react_jsx_runtime.JSX.Element;

type SaltKey = "gypsum" | "calcium_chloride" | "epsom" | "table_salt" | "baking_soda";
type SaltAdditionRow = {
    saltKey: SaltKey;
    grams: number;
};
declare function SaltAdditionsEditor(props: {
    rows: SaltAdditionRow[];
    onChange: (next: SaltAdditionRow[]) => void;
    idPrefix?: string;
    disabled?: boolean;
}): react_jsx_runtime.JSX.Element;

type WaterVolumes = {
    mashLiters: number;
    spargeLiters: number;
};
interface MashStepsEditorProps {
    mashRows: EditorMashStep[];
    mashProcedure?: {
        name: string;
        grainTemperatureC: number;
    } | null;
    waterVolumes: WaterVolumes | null;
    mashWaterBudgetLiters?: number | null;
    firstStepAmountComputed?: number | null;
    hideSpargeFromTypeOptions?: boolean;
    readOnly?: boolean;
    recipeId?: string;
    /** Override card background (e.g. native: SURFACE_CARD for contrast with field values). */
    cardBackgroundColor?: string;
    /** Override card border color. */
    cardBorderColor?: string;
    onUpdateProcedure?: (patch: {
        name?: string;
        grainTemperatureC?: number;
    }) => void;
    onUpdateStep?: (id: string, patch: Partial<EditorMashStep>) => void;
    onMoveStep?: (id: string, direction: "up" | "down") => void;
    onAddStep?: () => void;
    onDeleteStep?: (id: string) => void;
    onAddFromTemplate?: (templateId: string) => void;
    onSave?: () => void;
    canSave?: boolean;
    saving?: boolean;
    saveStatus?: string | null;
    onDismissSaveStatus?: () => void;
    t: (key: string, values?: Record<string, string | number>) => string;
    tUnits: (key: string) => string;
    locale: string;
    formatFixed: (locale: string, value: number, decimals: number) => string;
}
declare function MashStepsEditor(props: MashStepsEditorProps): react_jsx_runtime.JSX.Element;

interface SpargeStepReadOnlyRowProps {
    stepNumber: number;
    title: string;
    name: string;
    typeLabel: string;
    tempDisplay: string;
    timeDisplay: string;
    amountDisplay: string;
    rampDisplay: string;
    /** Override card background (e.g. native: SURFACE_CARD for contrast with field values). */
    cardBackgroundColor?: string;
    /** Override card border color. */
    cardBorderColor?: string;
    labels: {
        name: string;
        type: string;
        temp: string;
        time: string;
        amount: string;
        ramp: string;
    };
}
declare function SpargeStepReadOnlyRow(props: SpargeStepReadOnlyRowProps): react_jsx_runtime.JSX.Element;

export { ManualCellCountHelpBox, type ManualCellCountHelpBoxProps, MashStepsEditor, type MashStepsEditorProps, type RecipeImageProps, type RecipeMeta, RecipeMetaLine, type RecipeMetaLineProps, type RenderRecipeImage, type SaltAdditionRow, SaltAdditionsEditor, type SaltKey, SpargeStepReadOnlyRow, type SpargeStepReadOnlyRowProps, type WaterVolumes, parseRecipeMetaFromGetRecipeResponse };
