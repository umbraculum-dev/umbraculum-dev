"use client";

import type { ReactNode } from "react";

import { Accordion, H2, SizableText, View, XStack } from "tamagui";

export interface RecipeEditSectionProps {
  id: string;
  headingId: string;
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaced?: boolean;
  className?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
}

export function RecipeEditSection({
  id,
  headingId,
  label,
  open,
  onOpenChange,
  spaced,
  className,
  rightSlot,
  children,
}: RecipeEditSectionProps) {
  const classes = ["brew-panel", spaced ? "brew-section" : null, className ?? null]
    .filter(Boolean)
    .join(" ");

  return (
    <View
      as="section"
      id={id}
      className={classes}
    >
      <Accordion
        type="single"
        collapsible
        value={open ? id : ""}
        onValueChange={(v) => onOpenChange(v === id)}
      >
        <Accordion.Item value={id}>
          <Accordion.Header>
            <Accordion.Trigger unstyled width="100%">
              <XStack items="center" justifyContent="space-between" gap="$2" width="100%">
                <H2 id={headingId} m={0} size="$5" fontFamily="$heading" color="var(--text)">
                  {label}
                </H2>
                <XStack items="center" gap="$2">
                  {rightSlot ? <View>{rightSlot}</View> : null}
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    {open ? "▾" : "▸"}
                  </SizableText>
                </XStack>
              </XStack>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            <View mt="$3">{children}</View>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </View>
  );
}
