"use client";

import type { ReactNode } from "react";
import { SizableText } from "tamagui";

const MONO_FONT =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export interface CodeInlineProps {
  children: ReactNode;
  color?: string;
}

export function CodeInline({ children, color }: CodeInlineProps) {
  return (
    <SizableText
      size="$2"
      fontFamily={MONO_FONT}
      color={color ?? "inherit"}
      as="code"
    >
      {children}
    </SizableText>
  );
}
