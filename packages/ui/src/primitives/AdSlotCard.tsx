import type { ReactNode } from "react";
import React from "react";
import { Platform } from "react-native";
import { YStack } from "tamagui";

import { Card } from "./Card";

export interface AdSlotCardProps {
  ariaLabel: string;
  mediaHeightPx: number;
  media: ReactNode;
  contactLine: ReactNode;
  upgradeLine: ReactNode;
}

export function AdSlotCard(props: AdSlotCardProps) {
  const isWeb = Platform.OS === "web";
  return (
    <YStack marginVertical={12} gap="$1.5">
      <Card
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Tamagui Card supports `as="aside"` at runtime but does not expose it in its prop types. See docs/TAMAGUI.md (Tamagui type-system caveats).
        {...(isWeb ? ({ as: "aside", "aria-label": props.ariaLabel } as any) : { accessibilityLabel: props.ariaLabel })}
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$2"
        padding={10}
      >
        <YStack gap="$1.5">
          <Card
            height={props.mediaHeightPx}
            width="100%"
            maxWidth="100%"
            overflow="hidden"
            borderRadius="$2"
            backgroundColor="$background"
            padding={0}
          >
            {props.media}
          </Card>

          {props.contactLine}
          {props.upgradeLine}
        </YStack>
      </Card>
    </YStack>
  );
}

