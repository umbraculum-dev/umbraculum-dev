"use client";

import type { ReactNode } from "react";

import { Label, SizableText } from "tamagui";

export interface RecipeEditFieldLabelProps {
  htmlFor?: string;
  children: ReactNode;
}

export function RecipeEditFieldLabel({ htmlFor, children }: RecipeEditFieldLabelProps) {
  if (htmlFor) {
    return (
      <Label
        htmlFor={htmlFor}
        size="sm"
        color="var(--text-muted)"
        fontFamily="body"
        display="block"
      >
        {children}
      </Label>
    );
  }
  return (
    <SizableText
      size="sm"
      color="var(--text-muted)"
      fontFamily="body"
      display="block"
    >
      {children}
    </SizableText>
  );
}
