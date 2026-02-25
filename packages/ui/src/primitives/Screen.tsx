import type { ComponentProps, ReactNode } from "react";
import React from "react";
import { YStack } from "tamagui";

export type ScreenProps = Omit<ComponentProps<typeof YStack>, "children"> & {
  children: ReactNode;
};

export function Screen({ flex, style, ...props }: ScreenProps) {
  return (
    <YStack
      flex={flex ?? 1}
      backgroundColor={props.backgroundColor ?? "$background"}
      style={[{ padding: 16, gap: 16 }, style]}
      {...props}
    />
  );
}

