"use client";

import type { ReactNode } from "react";

import { View, XStack } from "tamagui";

export interface PageWideActionBarProps {
  children: ReactNode;
}

/**
 * Full-width sticky action bar for page-wide actions (e.g. Save, Refresh).
 * Renders at bottom of viewport when sticky.
 */
export function PageWideActionBar({ children }: PageWideActionBarProps) {
  return (
    <View
      position="sticky"
      bottom={0}
      left={0}
      right={0}
      zIndex={10}
      bg="var(--background)"
      borderTopWidth={1}
      borderColor="var(--border)"
      p="$3"
    >
      <XStack gap="$2" items="center" flexWrap="wrap">
        {children}
      </XStack>
    </View>
  );
}
