"use client";

import type { Resource } from "@umbraculum/crp-contracts";
import { SizableText, XStack, YStack } from "tamagui";

import { CrpMeta } from "./CrpMeta";
import { sourceLabel } from "./crpReadOnlyUtils";

export function ResourceSummary({
  resource,
  labels,
}: {
  resource: Resource;
  labels: {
    code: string;
    kind: string;
    status: string;
    source: string;
    sourceRefId: string;
    debugId: string;
    canonical: string;
    automation: string;
    brewery: string;
    projectedFromModule: (module: string) => string;
    none: string;
  };
}) {
  const provenance = sourceLabel(resource.sourceModule, {
    canonical: labels.canonical,
    automation: labels.automation,
    brewery: labels.brewery,
    projectedFromModule: labels.projectedFromModule,
  });

  return (
    <YStack gap="$1.5">
      <SizableText fontFamily="$body">
        <SizableText fontWeight="bold">{resource.code}</SizableText>
        <SizableText color="var(--text-muted)"> · {resource.name}</SizableText>
      </SizableText>
      <XStack gap="$3" flexWrap="wrap">
        <CrpMeta label={labels.kind} value={resource.kind} />
        <CrpMeta label={labels.status} value={resource.status} />
        <CrpMeta label={labels.source} value={provenance} />
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <CrpMeta label={labels.sourceRefId} value={resource.sourceRefId ?? labels.none} />
        <CrpMeta label={labels.debugId} value={resource.id} />
      </XStack>
    </YStack>
  );
}
