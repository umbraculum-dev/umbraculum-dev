import React from "react";
import { Platform } from "react-native";
import { Input as TamaguiInput } from "tamagui";
import type { InputProps } from "tamagui";

export function Input(props: InputProps) {
  const isAndroid = Platform.OS === "android";

  // Android TextInput can render text slightly too high (cropped at top) depending on font metrics.
  // We correct this by centering vertically and nudging padding a bit for single-line fields.
  const androidSingleLineFixStyle =
    isAndroid && !props.multiline
      ? ({
          textAlignVertical: "center",
          paddingTop: 2,
          paddingBottom: 0,
        } as const)
      : null;

  const includeFontPadding =
    props.includeFontPadding ?? (isAndroid ? false : undefined);

  return (
    <TamaguiInput
      {...props}
      includeFontPadding={includeFontPadding}
      style={androidSingleLineFixStyle ? [androidSingleLineFixStyle, props.style] : props.style}
    />
  );
}

