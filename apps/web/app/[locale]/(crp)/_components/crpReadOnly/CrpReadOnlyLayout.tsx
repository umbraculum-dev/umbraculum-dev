"use client";

import type { ReactNode } from "react";
import { SizableText, XStack, YStack } from "tamagui";

export function SectionCard({
  headingId,
  title,
  children,
}: {
  headingId: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={headingId}
      style={{
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "12px",
      }}
    >
      <YStack gap="$3">
        <SizableText id={headingId} size="$4" fontWeight="bold" fontFamily="$heading">
          {title}
        </SizableText>
        {children}
      </YStack>
    </section>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <XStack gap="$3" alignItems="flex-start" flexWrap="wrap">
      <SizableText size="$2" fontWeight="bold" fontFamily="$body" minWidth={180}>
        {label}
      </SizableText>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {value}
      </SizableText>
    </XStack>
  );
}

export function RefreshButton({
  children,
  disabled,
  onClick,
}: {
  children: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        color: "var(--text)",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: "8px 12px",
      }}
    >
      {children}
    </button>
  );
}
