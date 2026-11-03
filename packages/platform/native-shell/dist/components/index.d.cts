import React from 'react';
import { InputProps as InputProps$1 } from '@umbraculum/ui';

type AdPlacementV1 = "global_top" | "global_bottom" | "recipe_edit_after_fermentables" | "recipe_edit_after_hops" | "recipe_edit_after_yeast";
declare function AdSlot({ placement }: {
    placement: AdPlacementV1;
}): React.JSX.Element | null;

type IncludeFontPaddingProp = {
    includeFontPadding?: boolean;
};
type InputProps = InputProps$1 & IncludeFontPaddingProp;
declare function Input(props: InputProps): React.JSX.Element;

interface ReadOnlyFieldProps {
    value: string;
    placeholder?: string;
    textAlign?: "left" | "center" | "right";
}
/**
 * Read-only display field (grayed out, non-keyboard-accessible).
 * Matches web RecipeEditReadOnlyValue styling.
 */
declare function ReadOnlyField({ value, placeholder, textAlign }: ReadOnlyFieldProps): React.JSX.Element;

export { AdSlot, Input, ReadOnlyField };
