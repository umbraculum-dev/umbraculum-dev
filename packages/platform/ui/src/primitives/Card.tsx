import type { ComponentProps, ReactNode } from "react";
import React from "react";
import { YStack } from "tamagui";

import { splitLegacyStyleAliases, type WithLegacyStyleAliases } from "./legacyStyleAliases";

export type CardProps = Omit<WithLegacyStyleAliases<ComponentProps<typeof YStack>>, "children"> & {
  children: ReactNode;
};

export function Card(props: CardProps) {
  const { children, borderWidth, borderColor, borderRadius, padding, ...raw } = props;

  const { rest, backgroundColor, style } = splitLegacyStyleAliases(
    raw as Record<string, unknown>,
  );

  return (
    <YStack
      borderWidth={borderWidth ?? 1}
      borderColor={borderColor ?? "borderColor"}
      borderRadius={borderRadius ?? "4"}
      backgroundColor={
        (backgroundColor as ComponentProps<typeof YStack>["backgroundColor"] | undefined) ??
        "background"
      }
      padding={padding ?? "3"}
      {...(style !== undefined ? { style: style as ComponentProps<typeof YStack>["style"] } : {})}
      {...(rest as ComponentProps<typeof YStack>)}
    >
      {children}
    </YStack>
  );
}
