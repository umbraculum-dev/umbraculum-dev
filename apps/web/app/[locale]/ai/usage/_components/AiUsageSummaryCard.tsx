"use client";

import { SizableText, YStack } from "tamagui";

export function AiUsageSummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <YStack
      backgroundColor="$background"
      padding="$3"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$borderColor"
      minWidth={140}
    >
      <SizableText size="$2" theme="alt2">
        {label}
      </SizableText>
      <SizableText size="$7" fontWeight="700">
        {value}
      </SizableText>
    </YStack>
  );
}
