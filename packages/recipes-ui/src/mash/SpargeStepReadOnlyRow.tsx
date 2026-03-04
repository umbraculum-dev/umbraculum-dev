import React from "react";
import { YStack } from "tamagui";

import { Card, ReadOnlyField, ReadOnlyFieldRow, Text } from "@brewery/ui";

export interface SpargeStepReadOnlyRowProps {
  stepNumber: number;
  title: string;
  name: string;
  typeLabel: string;
  tempDisplay: string;
  timeDisplay: string;
  amountDisplay: string;
  rampDisplay: string;
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
  return (
    <Card data-mash-step-card theme="surface2" backgroundColor="$background" borderWidth={1} borderColor="$borderColor" padding="$3" gap="$2">
      <Text fontSize={12} fontWeight="700">
        {props.stepNumber}. {props.title}
      </Text>
      <YStack gap="$2">
        <ReadOnlyFieldRow>
          <ReadOnlyField label={props.labels.name} value={props.name} minWidth={90} />
          <ReadOnlyField label={props.labels.type} value={props.typeLabel} minWidth={110} />
          <ReadOnlyField label={props.labels.temp} value={props.tempDisplay} minWidth={90} />
          <ReadOnlyField label={props.labels.time} value={props.timeDisplay} minWidth={90} />
          <ReadOnlyField label={props.labels.amount} value={props.amountDisplay} minWidth={120} />
          <ReadOnlyField label={props.labels.ramp} value={props.rampDisplay} minWidth={90} />
        </ReadOnlyFieldRow>
      </YStack>
    </Card>
  );
}

