import { Input as UiInput, type InputProps as UiInputProps } from "@umbraculum/ui";
import React from "react";
import { Platform } from "react-native";

// `includeFontPadding` is a React Native TextInput prop that Tamagui's
// typings don't surface. Tamagui's Input forwards unknown props to the
// underlying RN TextInput at runtime, so we apply it via a narrow cast.
type IncludeFontPaddingProp = { includeFontPadding?: boolean };

export type InputProps = UiInputProps & IncludeFontPaddingProp;

export function Input(props: InputProps) {
  const isAndroid = Platform.OS === "android";

  const androidSingleLineFixStyle =
    isAndroid && !props.multiline
      ? ({
          textAlignVertical: "center",
          paddingTop: 2,
          paddingBottom: 0,
        } as const)
      : null;

  const { includeFontPadding: includeFontPaddingProp, style, ...rest } = props;
  const includeFontPadding = includeFontPaddingProp ?? (isAndroid ? false : undefined);

  return (
    <UiInput
      {...rest}
      {...({ includeFontPadding } as IncludeFontPaddingProp)}
      style={androidSingleLineFixStyle ? [androidSingleLineFixStyle, style] : style}
    />
  );
}
