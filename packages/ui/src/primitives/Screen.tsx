import type { ComponentProps, ReactNode } from "react";
import React from "react";
import { Platform, StatusBar } from "react-native";
import { YStack } from "tamagui";

export type ScreenProps = Omit<ComponentProps<typeof YStack>, "children"> & {
  children: ReactNode;
};

export function Screen({ flex, style, ...props }: ScreenProps) {
  const topInset = Platform.OS === "web" ? 0 : Math.floor((StatusBar.currentHeight ?? 0) / 2);

  return (
    <YStack
      flex={flex ?? 1}
      backgroundColor={props.backgroundColor ?? "$background"}
      style={[
        {
          paddingTop: 16 + topInset,
          paddingHorizontal: 16,
          paddingBottom: 16,
          gap: 16,
        },
        style,
      ]}
      {...props}
    />
  );
}

