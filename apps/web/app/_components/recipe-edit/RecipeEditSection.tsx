"use client";

import type { ReactNode } from "react";

import { Accordion, H2, View } from "tamagui";

export interface RecipeEditSectionProps {
  id: string;
  headingId: string;
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function RecipeEditSection({
  id,
  headingId,
  label,
  open,
  onOpenChange,
  children,
}: RecipeEditSectionProps) {
  return (
    <View
      as="section"
      id={id}
      bg="var(--surface)"
      borderWidth={1}
      borderColor="var(--border)"
      rounded="$3"
      p="$3"
    >
      <Accordion
        type="single"
        collapsible
        value={open ? id : ""}
        onValueChange={(v) => onOpenChange(v === id)}
      >
        <Accordion.Item value={id}>
          <Accordion.Header>
            <Accordion.Trigger unstyled cursor="pointer">
              <H2 id={headingId} m={0} size="$5" fontFamily="$heading" color="var(--text)">
                {label}
              </H2>
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
