"use client";

import type { ReactNode } from "react";
import { XStack } from "tamagui";

export interface AppTopBarProps {
  left: ReactNode;
  right: ReactNode;
  ariaLabel?: string;
}

export function AppTopBar({ left, right, ariaLabel }: AppTopBarProps) {
  return (
    <XStack
      ai="center"
      jc="space-between"
      gap="$2"
      py="$1.5"
      pb="$2.5"
      mb="$2.5"
      borderBottomWidth={1}
      borderColor="var(--border)"
      fontSize={11}
      style={{ lineHeight: 1.2 }}
      aria-label={ariaLabel}
    >
      <XStack ai="center" gap="$2" flexWrap="wrap">
        {left}
      </XStack>
      <XStack ai="center" gap="$2" flexWrap="wrap">
        {right}
      </XStack>
    </XStack>
  );
}
