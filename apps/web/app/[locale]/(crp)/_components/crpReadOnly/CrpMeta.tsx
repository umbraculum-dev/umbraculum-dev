"use client";

import { SizableText } from "tamagui";

export function CrpMeta({ label, value }: { label: string; value: string }) {
  return (
    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
      <SizableText fontWeight="bold">{label}:</SizableText> {value}
    </SizableText>
  );
}
