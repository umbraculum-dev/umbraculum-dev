import type { ComponentProps } from "react";
import React from "react";
import { Platform } from "react-native";
import { Input as TamaguiInput } from "tamagui";

export type InputProps = ComponentProps<typeof TamaguiInput>;

export function Input(props: InputProps) {
  const { accessibilityLabel, accessibilityRole, ...rest } = props as unknown as {
    accessibilityLabel?: string;
    accessibilityRole?: string;
  } & InputProps;

  if (Platform.OS === "web") {
    return (
      <TamaguiInput
        fontFamily={props.fontFamily ?? "$body"}
        aria-label={accessibilityLabel}
        {...(rest as InputProps)}
      />
    );
  }

  return (
    <TamaguiInput
      fontFamily={props.fontFamily ?? "$body"}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      {...(rest as InputProps)}
    />
  );
}

