"use client";

import type { ReactNode } from "react";

import { SizableText, View } from "tamagui";

export type MessageBoxVariant = "error" | "warning" | "success";

const VARIANT_STYLES: Record<
  MessageBoxVariant,
  { bg: string; borderColor: string }
> = {
  error: {
    bg: "color-mix(in srgb, var(--danger) 12%, var(--surface))",
    borderColor: "color-mix(in srgb, var(--danger) 35%, var(--border))",
  },
  warning: {
    bg: "color-mix(in srgb, var(--warning) 18%, var(--surface))",
    borderColor: "color-mix(in srgb, var(--warning) 40%, var(--border))",
  },
  success: {
    bg: "color-mix(in srgb, var(--success) 18%, var(--surface))",
    borderColor: "color-mix(in srgb, var(--success) 40%, var(--border))",
  },
};

export interface MessageBoxProps {
  variant: MessageBoxVariant;
  children: ReactNode;
  role?: "alert" | "status";
  "aria-live"?: "polite";
  id?: string;
  mt?: string | number;
  mb?: string | number;
}

export function MessageBox({
  variant,
  children,
  role = variant === "error" ? "alert" : "status",
  "aria-live": ariaLive,
  id,
  mt,
  mb,
}: MessageBoxProps) {
  const styles = VARIANT_STYLES[variant];
  return (
    <View
      id={id}
      mt={mt}
      mb={mb}
      bg={styles.bg}
      borderWidth={1}
      borderColor={styles.borderColor}
      rounded="$2"
      p="$3"
      maxW="100%"
      role={role}
      aria-live={ariaLive}
    >
      <SizableText
        size="$2"
        fontFamily="$body"
        color="var(--text)"
        whiteSpace="pre-wrap"
        style={{ wordBreak: "break-word" }}
      >
        {children}
      </SizableText>
    </View>
  );
}
