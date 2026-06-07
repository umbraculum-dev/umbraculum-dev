import * as react_jsx_runtime from 'react/jsx-runtime';
import { InputProps } from 'tamagui';

type AdPlacementV1 = "global_top" | "global_bottom" | "recipe_edit_after_fermentables" | "recipe_edit_after_hops" | "recipe_edit_after_yeast";
declare function AdSlot({ placement }: {
    placement: AdPlacementV1;
}): react_jsx_runtime.JSX.Element | null;

declare function Input(props: InputProps): react_jsx_runtime.JSX.Element;

interface ReadOnlyFieldProps {
    value: string;
    placeholder?: string;
    textAlign?: "left" | "center" | "right";
}
/**
 * Read-only display field (grayed out, non-keyboard-accessible).
 * Matches web RecipeEditReadOnlyValue styling.
 */
declare function ReadOnlyField({ value, placeholder, textAlign }: ReadOnlyFieldProps): react_jsx_runtime.JSX.Element;

export { AdSlot, Input, ReadOnlyField };
