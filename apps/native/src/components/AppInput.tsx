import React from "react";
import { Platform } from "react-native";
import { Input as TamaguiInput } from "tamagui";
import type { InputProps } from "tamagui";

// `includeFontPadding` is a React Native TextInput prop that Tamagui's
// typings don't surface. Tamagui's Input forwards unknown props to the
// underlying RN TextInput at runtime, so we apply it via a narrow cast.
type IncludeFontPaddingProp = { includeFontPadding?: boolean };

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

  const passthrough = props as InputProps & IncludeFontPaddingProp;
  const includeFontPadding =
    passthrough.includeFontPadding ?? (isAndroid ? false : undefined);

  return (
    <TamaguiInput
      {...props}
      {...({ includeFontPadding } as IncludeFontPaddingProp)}
      style={androidSingleLineFixStyle ? [androidSingleLineFixStyle, props.style] : props.style}
    />
  );
}

