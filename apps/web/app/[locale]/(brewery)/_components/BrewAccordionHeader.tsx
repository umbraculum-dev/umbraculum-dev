"use client";

import type { ReactNode } from "react";

import { Accordion, H2, SizableText, View, XStack } from "tamagui";

export function BrewAccordionHeader(props: {
  headingId: string;
  title: ReactNode;
  open: boolean;
  rightSlot?: ReactNode;
}) {
  const { headingId, title, open, rightSlot } = props;

  return (
    <Accordion.Header>
      <Accordion.Trigger unstyled width="100%">
        <XStack justifyContent="space-between" alignItems="center" width="100%" gap="$2">
          <H2 id={headingId} mt={0}>
            {title}
          </H2>
          <XStack alignItems="center" gap="$2">
            {rightSlot ? <View>{rightSlot}</View> : null}
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {open ? "▾" : "▸"}
            </SizableText>
          </XStack>
        </XStack>
      </Accordion.Trigger>
    </Accordion.Header>
  );
}

