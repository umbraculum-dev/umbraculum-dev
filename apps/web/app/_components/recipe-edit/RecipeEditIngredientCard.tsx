"use client";

import type { ReactNode } from "react";

import { View } from "tamagui";

export interface RecipeEditIngredientCardProps {
  children: ReactNode;
}

export function RecipeEditIngredientCard({ children }: RecipeEditIngredientCardProps) {
  return (
    <View
      bg="color-mix(in srgb, var(--surface-2) 55%, var(--surface))"
      borderWidth={1}
      borderColor="var(--border)"
      rounded="$2"
      p="$3"
    >
      {children}
    </View>
  );
}
