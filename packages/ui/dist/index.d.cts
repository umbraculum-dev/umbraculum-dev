import * as react_jsx_runtime from 'react/jsx-runtime';
import React, { ComponentProps, ReactNode } from 'react';
import { Button as Button$1, YStack, Spinner as Spinner$1, SizableText } from 'tamagui';

type ButtonProps = ComponentProps<typeof Button$1>;
declare function Button(props: ButtonProps): react_jsx_runtime.JSX.Element;

type CardProps = Omit<ComponentProps<typeof YStack>, "children"> & {
    children: ReactNode;
};
declare function Card(props: CardProps): react_jsx_runtime.JSX.Element;

type ScreenProps = Omit<ComponentProps<typeof YStack>, "children"> & {
    children: ReactNode;
};
declare function Screen({ flex, style, ...props }: ScreenProps): react_jsx_runtime.JSX.Element;

type SpinnerProps = React.ComponentProps<typeof Spinner$1>;
declare function Spinner(props: SpinnerProps): react_jsx_runtime.JSX.Element;

type TextProps = ComponentProps<typeof SizableText>;
declare function Text(props: TextProps): react_jsx_runtime.JSX.Element;
type HeadingProps = Omit<TextProps, "size"> & {
    size?: TextProps["size"];
};
declare function Heading({ size, fontWeight, ...props }: HeadingProps): react_jsx_runtime.JSX.Element;

export { Button, type ButtonProps, Card, type CardProps, Heading, type HeadingProps, Screen, type ScreenProps, Spinner, type SpinnerProps, Text, type TextProps };
