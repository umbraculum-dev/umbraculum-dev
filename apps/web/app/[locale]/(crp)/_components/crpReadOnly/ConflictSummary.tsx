"use client";

import type { CapacityConflict } from "@umbraculum/crp-contracts";
import { SizableText, XStack, YStack } from "tamagui";

import { CrpMeta } from "./CrpMeta";
import { formatDateTime } from "./crpReadOnlyUtils";

export function ConflictSummary({
  conflict,
  labels,
}: {
  conflict: CapacityConflict;
  labels: {
    conflict: string;
    severity: string;
    status: string;
    resource: string;
    startsAt: string;
    endsAt: string;
    none: string;
  };
}) {
  return (
    <YStack gap="$1">
      <SizableText fontFamily="$body">
        <SizableText fontWeight="bold">{labels.conflict}:</SizableText>{" "}
        {conflict.message}
      </SizableText>
      <XStack gap="$3" flexWrap="wrap">
        <CrpMeta label={labels.severity} value={conflict.severity} />
        <CrpMeta label={labels.status} value={conflict.status} />
        <CrpMeta label={labels.resource} value={conflict.resourceId ?? labels.none} />
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <CrpMeta label={labels.startsAt} value={formatDateTime(conflict.startsAt, labels.none)} />
        <CrpMeta label={labels.endsAt} value={formatDateTime(conflict.endsAt, labels.none)} />
      </XStack>
    </YStack>
  );
}
