"use client";

import type { ReactNode } from "react";

import { Accordion, SizableText, View } from "tamagui";

import { BrewAccordionHeader } from "../BrewAccordionHeader";

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
          <BrewAccordionHeader
            headingId={headingId}
            title={
              <SizableText m={0} size="$5" fontFamily="$heading" color="var(--text)">
                {label}
              </SizableText>
            }
            open={open}
            rightSlot={rightSlot}
          />
          <Accordion.Content>
            <View mt="$3">{children}</View>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </View>
  );
}
