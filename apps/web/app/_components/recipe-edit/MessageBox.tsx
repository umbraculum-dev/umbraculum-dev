"use client";

import { useEffect, type ReactNode } from "react";

import { SizableText, View } from "tamagui";

export type MessageBoxVariant = "error" | "warning" | "success" | "notice";

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
  notice: {
    bg: "color-mix(in srgb, var(--info) 10%, var(--surface))",
    borderColor: "color-mix(in srgb, var(--info) 32%, var(--border))",
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
  /** Auto-dismiss after this many ms. Only for variant="success." Persistent messages stay visible. */
  dismissAfter?: number;
  /** Called when dismissAfter timer fires. Required when dismissAfter is set. */
  onDismiss?: () => void;
}

export function MessageBox({
  variant,
  children,
  role = variant === "error" ? "alert" : "status",
  "aria-live": ariaLive,
  id,
  mt,
  mb,
  dismissAfter,
  onDismiss,
}: MessageBoxProps) {
  useEffect(() => {
    if (
      variant !== "success" ||
      dismissAfter == null ||
      onDismiss == null ||
      dismissAfter <= 0
    ) {
      return;
    }
    const t = setTimeout(onDismiss, dismissAfter);
    return () => clearTimeout(t);
  }, [variant, dismissAfter, onDismiss, children]);

  const styles = VARIANT_STYLES[variant];
  return (
    <View
      id={id}
      mt={mt}
      mb={mb}
      alignSelf="stretch"
      w="100%"
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
