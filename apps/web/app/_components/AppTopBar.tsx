"use client";

import type { ReactNode } from "react";
import { useMedia, XStack, YStack } from "tamagui";

export interface AppTopBarProps {
  left: ReactNode;
  right: ReactNode;
  bottom?: ReactNode;
  ariaLabel?: string;
}

export function AppTopBar({ left, right, bottom, ariaLabel }: AppTopBarProps) {
  const media = useMedia();
  const narrow = media.narrow;

  return (
    <YStack
      aria-label={ariaLabel}
      py="$2"
      pb="$2.5"
      mb="$2.5"
      borderBottomWidth={1}
      borderColor="var(--border)"
      minWidth={0}
    >
      <XStack
        ai="center"
        jc="space-between"
        gap={narrow ? "$2" : "$3"}
        flexWrap="wrap"
        minWidth={0}
      >
        <XStack
          ai="center"
          gap="$3"
          flexWrap={narrow ? "wrap" : "nowrap"}
          minWidth={0}
          flex={1}
        >
          {left}
        </XStack>
        <XStack
          ai="center"
          jc="flex-end"
          gap="$3"
          flexWrap={narrow ? "wrap" : "nowrap"}
          minWidth={0}
        >
          {right}
        </XStack>
      </XStack>

      {bottom ? (
        <YStack mt="$2" minWidth={0}>
          {bottom}
        </YStack>
      ) : null}
    </YStack>
  );
}
