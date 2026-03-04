import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { ReactNode, ComponentProps } from 'react';
import { Button as Button$1, YStack, Checkbox, Input as Input$1, Spinner as Spinner$1, SizableText } from 'tamagui';

/**
 * Centralized read-only field tokens.
 * Single source of truth for web and native. Matches web default theme
 * color-mix(in srgb, var(--info) 8%, var(--surface)) ≈ #232934.
 */
declare const FIELD_READONLY_BG = "#232934";
declare const FIELD_READONLY_BORDER = "#3a4558";

/**
 * Injects shared readonly field tokens into document root so web and native
 * use the same colors. Must run client-side.
 */
declare function ThemeVarsInjector(): null;

interface AdSlotCardProps {
    ariaLabel: string;
    mediaHeightPx: number;
    media: ReactNode;
    contactLine: ReactNode;
    upgradeLine: ReactNode;
}
declare function AdSlotCard(props: AdSlotCardProps): react_jsx_runtime.JSX.Element;

type ButtonProps = ComponentProps<typeof Button$1>;
declare function Button(props: ButtonProps): react_jsx_runtime.JSX.Element;

type CardProps = Omit<ComponentProps<typeof YStack>, "children"> & {
    children: ReactNode;
};
declare function Card(props: CardProps): react_jsx_runtime.JSX.Element;

interface BrewCheckboxProps extends Omit<ComponentProps<typeof Checkbox>, "children" | "native" | "unstyled"> {
}
declare function BrewCheckbox(props: BrewCheckboxProps): react_jsx_runtime.JSX.Element;

interface CollapsibleProps {
    title: string;
    summary?: ReactNode;
    children: ReactNode;
    expanded: boolean;
    onExpandedChange: (next: boolean) => void;
    accessibilityLabel?: string;
}
declare function Collapsible(props: CollapsibleProps): react_jsx_runtime.JSX.Element;

type InputProps = ComponentProps<typeof Input$1>;
declare function Input(props: InputProps): react_jsx_runtime.JSX.Element;

type ModeOption<T extends string> = {
    value: T;
    label: string;
};
declare function ModeFieldset<T extends string>(props: {
    legend: string;
    name: string;
    value: T;
    onChange: (next: T) => void;
    options: ModeOption<T>[];
}): react_jsx_runtime.JSX.Element;

interface ReadOnlyFieldLabelProps {
    children: ReactNode;
}
declare function ReadOnlyFieldLabel({ children }: ReadOnlyFieldLabelProps): react_jsx_runtime.JSX.Element;
interface ReadOnlyFieldValueProps {
    children: ReactNode;
}
declare function ReadOnlyFieldValue({ children }: ReadOnlyFieldValueProps): react_jsx_runtime.JSX.Element;
interface ReadOnlyFieldProps {
    label: ReactNode;
    value: ReactNode;
    minWidth?: number;
    flex?: number;
}
declare function ReadOnlyField({ label, value, minWidth, flex }: ReadOnlyFieldProps): react_jsx_runtime.JSX.Element;
interface ReadOnlyFieldRowProps {
    children: ReactNode;
}
declare function ReadOnlyFieldRow({ children }: ReadOnlyFieldRowProps): react_jsx_runtime.JSX.Element;

type ScreenProps = Omit<ComponentProps<typeof YStack>, "children"> & {
    children: ReactNode;
};
declare function Screen({ flex, style, ...props }: ScreenProps): react_jsx_runtime.JSX.Element;

interface SelectOption {
    value: string;
    label: string;
}
interface SelectFieldProps {
    value: string;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    id?: string;
    width?: "auto" | "full";
    "aria-label"?: string;
    "aria-labelledby"?: string;
    renderValue?: (value: string) => ReactNode;
    closeLabel?: string;
}
declare function SelectField({ value, onValueChange, options, placeholder, disabled, id, width, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, renderValue, closeLabel, }: SelectFieldProps): react_jsx_runtime.JSX.Element;

type SpinnerProps = React.ComponentProps<typeof Spinner$1>;
declare function Spinner(props: SpinnerProps): react_jsx_runtime.JSX.Element;

type TextProps = ComponentProps<typeof SizableText>;
declare function Text(props: TextProps): react_jsx_runtime.JSX.Element;
type HeadingProps = Omit<TextProps, "size"> & {
    size?: TextProps["size"];
};
declare function Heading({ size, fontWeight, ...props }: HeadingProps): react_jsx_runtime.JSX.Element;

export { AdSlotCard, type AdSlotCardProps, BrewCheckbox, type BrewCheckboxProps, Button, type ButtonProps, Card, type CardProps, Collapsible, type CollapsibleProps, FIELD_READONLY_BG, FIELD_READONLY_BORDER, Heading, type HeadingProps, Input, type InputProps, ModeFieldset, type ModeOption, ReadOnlyField, ReadOnlyFieldLabel, type ReadOnlyFieldLabelProps, type ReadOnlyFieldProps, ReadOnlyFieldRow, type ReadOnlyFieldRowProps, ReadOnlyFieldValue, type ReadOnlyFieldValueProps, Screen, type ScreenProps, SelectField, type SelectFieldProps, type SelectOption, Spinner, type SpinnerProps, Text, type TextProps, ThemeVarsInjector };
