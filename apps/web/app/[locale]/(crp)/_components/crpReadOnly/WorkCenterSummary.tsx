"use client";

import type { WorkCenter } from "@umbraculum/crp-contracts";
import { SizableText, XStack, YStack } from "tamagui";

import { CrpMeta } from "./CrpMeta";
import { sourceLabel } from "./crpReadOnlyUtils";

export function WorkCenterSummary({
  workCenter,
  labels,
}: {
  workCenter: WorkCenter;
  labels: {
    code: string;
    status: string;
    source: string;
    sourceRefId: string;
    resource: string;
    debugId: string;
    canonical: string;
    automation: string;
    brewery: string;
    projectedFromModule: (module: string) => string;
    none: string;
  };
}) {
  const provenance = sourceLabel(workCenter.sourceModule, {
    canonical: labels.canonical,
    automation: labels.automation,
    brewery: labels.brewery,
    projectedFromModule: labels.projectedFromModule,
  });

  return (
    <YStack gap="$1.5">
      <SizableText fontFamily="$body">
        <SizableText fontWeight="bold">{workCenter.code}</SizableText>
        <SizableText color="var(--text-muted)"> · {workCenter.name}</SizableText>
      </SizableText>
      <XStack gap="$3" flexWrap="wrap">
        <CrpMeta label={labels.status} value={workCenter.status} />
        <CrpMeta label={labels.resource} value={workCenter.resourceId ?? labels.none} />
        <CrpMeta label={labels.source} value={provenance} />
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <CrpMeta label={labels.sourceRefId} value={workCenter.sourceRefId ?? labels.none} />
        <CrpMeta label={labels.debugId} value={workCenter.id} />
      </XStack>
    </YStack>
  );
}
