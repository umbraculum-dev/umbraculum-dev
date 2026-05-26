"use client";

import type { ReactNode } from "react";

import { SizableText, View } from "tamagui";

export interface FieldBadgeProps {
  children: ReactNode;
}

export function FieldBadge({ children }: FieldBadgeProps) {
  return (
    <View
      as="span"
      display="inline-block"
      rounded={999}
      px="$2"
      py="$0.5"
      borderWidth={1}
      borderColor="var(--border)"
    >
      <SizableText size="$1" fontFamily="$body" color="var(--text)">
        {children}
      </SizableText>
    </View>
  );
}
