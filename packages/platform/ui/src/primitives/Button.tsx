import type { ComponentProps } from "react";
import React from "react";
import { Platform } from "react-native";
import { Button as TamaguiButton } from "tamagui";

import { splitLegacyStyleAliases, type WithLegacyStyleAliases } from "./legacyStyleAliases";

export type ButtonProps = WithLegacyStyleAliases<ComponentProps<typeof TamaguiButton>>;

export function Button(props: ButtonProps) {
  const { accessibilityLabel, accessibilityRole, fontFamily, ...raw } = props as ButtonProps & {
    accessibilityLabel?: string;
    accessibilityRole?: string;
  };

  const { rest, backgroundColor, style } = splitLegacyStyleAliases(
    raw as Record<string, unknown>,
  );

  const shared = {
    fontFamily: fontFamily ?? "body",
    ...(backgroundColor !== undefined
      ? { backgroundColor: backgroundColor as ComponentProps<typeof TamaguiButton>["backgroundColor"] }
      : {}),
    ...(style !== undefined ? { style: style as ComponentProps<typeof TamaguiButton>["style"] } : {}),
    ...(rest as ComponentProps<typeof TamaguiButton>),
  };

  if (Platform.OS === "web") {
    return <TamaguiButton aria-label={accessibilityLabel} {...shared} />;
  }

  return (
    <TamaguiButton
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      {...shared}
    />
  );
}
