"use client";

import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Sheet, Text, useMedia, YStack } from "tamagui";

export interface NavSheetProps {
  children: ReactNode;
  triggerLabel: string;
  ariaLabel?: string;
  triggerVariant?: "hamburger" | "text";
  mode?: "auto" | "sheet" | "inline";
}

function HamburgerIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function NavSheet({
  children,
  triggerLabel,
  ariaLabel,
  triggerVariant = "hamburger",
  mode = "auto",
}: NavSheetProps) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const media = useMedia();
  const narrow = media.narrow;

  const useSheet = mode === "sheet" ? true : mode === "inline" ? false : narrow;

  if (!useSheet) {
    return <>{children}</>;
  }

  return (
    <>
      <Button
        unstyled
        ai="center"
        px="$2"
        py="$1"
        borderRadius="$2"
        borderWidth={1}
        borderColor="color-mix(in srgb, var(--focus-ring) 25%, var(--border))"
        backgroundColor="color-mix(in srgb, var(--focus-ring) 14%, var(--surface-2))"
        color="var(--text)"
        fontSize={11}
        hoverStyle={{
          textDecoration: "none",
          borderColor: "color-mix(in srgb, var(--focus-ring) 25%, var(--border))",
          backgroundColor: "color-mix(in srgb, var(--focus-ring) 14%, var(--surface-2))",
        }}
        aria-label={ariaLabel ?? triggerLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        onPress={() => setOpen(true)}
      >
        {triggerVariant === "text" ? (
          <Text color="var(--text)" fontSize={11}>
            {triggerLabel}
          </Text>
        ) : (
          <HamburgerIcon />
        )}
      </Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        modal
        snapPoints={[85, 10]}
        dismissOnOverlayPress
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame
          position="relative"
          background="var(--surface)"
          borderColor="var(--border)"
          borderWidth={1}
          borderTopLeftRadius="var(--radius)"
          borderTopRightRadius="var(--radius)"
          padding={16}
          maxHeight="85%"
        >
          <Button
            unstyled
            position="absolute"
            top={8}
            right={8}
            p="$1"
            backgroundColor="transparent"
            borderWidth={0}
            cursor="pointer"
            fontSize={18}
            onPress={() => setOpen(false)}
            aria-label={t("close")}
          >
            ×
          </Button>
          <YStack
            pt="$4"
            onClickCapture={(e: MouseEvent<HTMLElement>) => {
              if (!open) return;
              const target = e.target;
              if (!(target instanceof HTMLElement)) return;
              if (target.closest('[data-navsheet-keep-open="true"]')) return;

              const shouldClose = Boolean(target.closest('a[href], [data-navsheet-close="true"]'));
              if (shouldClose) setOpen(false);
            }}
          >
            {children}
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
