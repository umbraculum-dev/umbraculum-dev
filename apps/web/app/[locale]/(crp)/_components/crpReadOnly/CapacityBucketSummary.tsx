"use client";

import type { CapacityBucket } from "@umbraculum/crp-contracts";
import { SizableText, XStack, YStack } from "tamagui";

import { CrpMeta } from "./CrpMeta";
import { formatDateTime } from "./crpReadOnlyUtils";

export function CapacityBucketSummary({
  bucket,
  labels,
}: {
  bucket: CapacityBucket;
  labels: {
    resource: string;
    bucketStartAt: string;
    bucketEndAt: string;
    availableMinutes: string;
    plannedMinutes: string;
    overloadMinutes: string;
    zeroAvailabilityAlpha: string;
    none: string;
  };
}) {
  return (
    <YStack gap="$1">
      <SizableText fontFamily="$body">
        <SizableText fontWeight="bold">{labels.resource}:</SizableText>{" "}
        {bucket.resourceCode}
      </SizableText>
      <XStack gap="$3" flexWrap="wrap">
        <CrpMeta label={labels.bucketStartAt} value={formatDateTime(bucket.bucketStartAt, labels.none)} />
        <CrpMeta label={labels.bucketEndAt} value={formatDateTime(bucket.bucketEndAt, labels.none)} />
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <CrpMeta
          label={labels.availableMinutes}
          value={
            bucket.availableMinutes === 0
              ? labels.zeroAvailabilityAlpha
              : String(bucket.availableMinutes)
          }
        />
        <CrpMeta label={labels.plannedMinutes} value={String(bucket.plannedMinutes)} />
        <CrpMeta label={labels.overloadMinutes} value={String(bucket.overloadMinutes)} />
      </XStack>
    </YStack>
  );
}
