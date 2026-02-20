"use client";

import type { ReactNode } from "react";

import { SizableText, View } from "tamagui";

export interface ErrorBoxProps {
  children: ReactNode;
  role?: "alert";
  "aria-live"?: "polite";
  mt?: string | number;
}

export function ErrorBox({
  children,
  role = "alert",
  "aria-live": ariaLive,
  mt,
}: ErrorBoxProps) {
  return (
    <View
      mt={mt}
      bg="color-mix(in srgb, var(--danger) 12%, var(--surface))"
      borderWidth={1}
      borderColor="color-mix(in srgb, var(--danger) 35%, var(--border))"
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
        wordBreak="break-word"
      >
        {children}
      </SizableText>
    </View>
  );
}
