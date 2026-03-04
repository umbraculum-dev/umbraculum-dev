"use client";

import type { ReactNode } from "react";

import { SizableText, View } from "tamagui";

export interface RecipeEditReadOnlyValueProps {
  children: ReactNode;
}

export function RecipeEditReadOnlyValue({ children }: RecipeEditReadOnlyValueProps) {
  return (
    <View
      data-readonly-field-value
      p="$2"
      bg="var(--field-readonly-bg)"
      rounded="$2"
      borderWidth={1}
      borderColor="var(--field-readonly-border)"
      userSelect="none"
      tabIndex={-1}
    >
      <SizableText size="$2" fontFamily="$body" color="var(--text)">
        {children}
      </SizableText>
    </View>
  );
}
