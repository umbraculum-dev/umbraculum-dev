import React from "react";
import { YStack } from "tamagui";

import { Card, ReadOnlyField, ReadOnlyFieldRow, Text } from "@umbraculum/ui";

export interface SpargeStepReadOnlyRowProps {
  stepNumber: number;
  title: string;
  name: string;
  typeLabel: string;
  tempDisplay: string;
  timeDisplay: string;
  amountDisplay: string;
  rampDisplay: string;
  /** Override card background (e.g. native: SURFACE_CARD for contrast with field values). */
  cardBackgroundColor?: string;
  /** Override card border color. */
  cardBorderColor?: string;
  labels: {
    name: string;
    type: string;
    temp: string;
    time: string;
    amount: string;
    ramp: string;
  };
}

export function SpargeStepReadOnlyRow(props: SpargeStepReadOnlyRowProps) {
  const { cardBackgroundColor, cardBorderColor, labels, ...rest } = props;
  return (
    <Card
      data-mash-step-card
      {...((cardBackgroundColor ?? cardBorderColor) ? {} : { theme: "surface2" as const })}
      backgroundColor={cardBackgroundColor ?? "$background"}
      borderWidth={1}
      borderColor={cardBorderColor ?? "$borderColor"}
      padding="$3"
      gap="$2"
    >
      <Text fontSize={12} fontWeight="700">
        {rest.stepNumber}. {rest.title}
      </Text>
      <YStack gap="$2">
        <ReadOnlyFieldRow>
          <ReadOnlyField label={labels.name} value={rest.name} minWidth={90} />
          <ReadOnlyField label={labels.type} value={rest.typeLabel} minWidth={110} />
          <ReadOnlyField label={labels.temp} value={rest.tempDisplay} minWidth={90} />
          <ReadOnlyField label={labels.time} value={rest.timeDisplay} minWidth={90} />
          <ReadOnlyField label={labels.amount} value={rest.amountDisplay} minWidth={120} />
          <ReadOnlyField label={labels.ramp} value={rest.rampDisplay} minWidth={90} />
        </ReadOnlyFieldRow>
      </YStack>
    </Card>
  );
}

