import type { ComponentProps } from "react";
import React from "react";
import { Platform } from "react-native";
import { Input as TamaguiInput } from "tamagui";

import { splitLegacyStyleAliases, type WithLegacyStyleAliases } from "./legacyStyleAliases";

export type InputProps = WithLegacyStyleAliases<ComponentProps<typeof TamaguiInput>>;

export function Input(props: InputProps) {
  const { accessibilityLabel, accessibilityRole, fontFamily, ...raw } = props as InputProps & {
    accessibilityLabel?: string;
    accessibilityRole?: string;
  };

  const { rest, backgroundColor, style } = splitLegacyStyleAliases(
    raw as Record<string, unknown>,
  );

  const shared = {
    fontFamily: fontFamily ?? "body",
    ...(backgroundColor !== undefined
      ? { backgroundColor: backgroundColor as ComponentProps<typeof TamaguiInput>["backgroundColor"] }
      : {}),
    ...(style !== undefined ? { style: style as ComponentProps<typeof TamaguiInput>["style"] } : {}),
    ...(rest as ComponentProps<typeof TamaguiInput>),
  };

  if (Platform.OS === "web") {
    return <TamaguiInput aria-label={accessibilityLabel} {...shared} />;
  }

  return (
    <TamaguiInput
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      {...shared}
    />
  );
}
