"use client";

import type { ReactNode } from "react";

import { SizableText, View } from "tamagui";

export interface RecipeEditReadOnlyValueProps {
  children: ReactNode;
}

export function RecipeEditReadOnlyValue({ children }: RecipeEditReadOnlyValueProps) {
  return (
    <View
      p="$2"
      bg="var(--surface-2)"
      rounded="$2"
      borderWidth={1}
      borderColor="var(--border)"
    >
      <SizableText size="$2" fontFamily="$body" color="var(--text)">
        {children}
      </SizableText>
    </View>
  );
}
