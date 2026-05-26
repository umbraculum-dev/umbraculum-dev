"use client";

import type { ReactNode } from "react";

import { Accordion, View } from "tamagui";

import { BrewAccordionHeader } from "./BrewAccordionHeader";

export function BrewAccordionSection(props: {
  value: string;
  headingId: string;
  title: ReactNode;
  open: boolean;
  spaced?: boolean;
  rightSlot?: ReactNode;
  children: ReactNode;
}) {
  const { value, headingId, title, open, spaced, rightSlot, children } = props;

  return (
    <Accordion.Item value={value}>
      <View className={spaced ? "brew-panel brew-section" : "brew-panel"} aria-labelledby={headingId}>
        <BrewAccordionHeader headingId={headingId} title={title} open={open} rightSlot={rightSlot} />
        <Accordion.Content>{children}</Accordion.Content>
      </View>
    </Accordion.Item>
  );
}

