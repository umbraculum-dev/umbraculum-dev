"use client";

import type { ScheduledOperation } from "@umbraculum/crp-contracts";
import { SizableText, XStack, YStack } from "tamagui";

import { CrpMeta } from "./CrpMeta";
import { formatDateTime, sourceLabel } from "./crpReadOnlyUtils";

export function ScheduledOperationSummary({
  operation,
  labels,
}: {
  operation: ScheduledOperation;
  labels: {
    operationCode: string;
    productionOrder: string;
    workCenter: string;
    resource: string;
    startsAt: string;
    endsAt: string;
    duration: string;
    source: string;
    sourceRefId: string;
    canonical: string;
    automation: string;
    brewery: string;
    projectedFromModule: (module: string) => string;
    none: string;
  };
}) {
  const provenance = sourceLabel(operation.sourceModule, {
    canonical: labels.canonical,
    automation: labels.automation,
    brewery: labels.brewery,
    projectedFromModule: labels.projectedFromModule,
  });

  return (
    <YStack gap="$1">
      <SizableText fontFamily="$body">
        <SizableText fontWeight="bold">{operation.operationCode}</SizableText>
        <SizableText color="var(--text-muted)"> · {operation.name}</SizableText>
      </SizableText>
      <XStack gap="$3" flexWrap="wrap">
        <CrpMeta label={labels.productionOrder} value={operation.productionOrderId ?? labels.none} />
        <CrpMeta label={labels.resource} value={operation.resourceId ?? labels.none} />
        <CrpMeta label={labels.workCenter} value={operation.workCenterId ?? labels.none} />
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <CrpMeta label={labels.startsAt} value={formatDateTime(operation.startsAt, labels.none)} />
        <CrpMeta label={labels.endsAt} value={formatDateTime(operation.endsAt, labels.none)} />
        <CrpMeta label={labels.duration} value={`${operation.plannedDurationMinutes} min`} />
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <CrpMeta label={labels.source} value={provenance} />
        <CrpMeta label={labels.sourceRefId} value={operation.sourceRefId ?? labels.none} />
      </XStack>
    </YStack>
  );
}
