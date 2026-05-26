import type { ComponentProps } from "react";
import React from "react";
import { Platform } from "react-native";
import { Button as TamaguiButton } from "tamagui";

export type ButtonProps = ComponentProps<typeof TamaguiButton>;

export function Button(props: ButtonProps) {
  const { accessibilityLabel, accessibilityRole, ...rest } = props as unknown as {
    accessibilityLabel?: string;
    accessibilityRole?: string;
  } & ButtonProps;

  if (Platform.OS === "web") {
    return (
      <TamaguiButton
        fontFamily={props.fontFamily ?? "$body"}
        aria-label={accessibilityLabel}
        {...(rest as ButtonProps)}
      />
    );
  }

  return (
    <TamaguiButton
      fontFamily={props.fontFamily ?? "$body"}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      {...(rest as ButtonProps)}
    />
  );
}

