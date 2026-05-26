"use client";

import type {
  CapacityBucket,
  CapacityConflict,
  Resource,
  ScheduledOperation,
} from "@umbraculum/crp-contracts";
import type { ReactNode } from "react";
import { SizableText, XStack, YStack } from "tamagui";

export function formatDateTime(value: string | null, fallback: string): string {
  if (!value) return fallback;
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function sourceLabel(
  sourceModule: string | null,
  labels: {
    canonical: string;
    automation: string;
    brewery: string;
    projectedFromModule: (module: string) => string;
  },
): string {
  if (!sourceModule) return labels.canonical;
  if (sourceModule === "automation") return labels.automation;
  if (sourceModule === "brewery") return labels.brewery;
  return labels.projectedFromModule(sourceModule);
}

export function SectionCard({
  headingId,
  title,
  children,
}: {
  headingId: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={headingId}
      style={{
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "12px",
      }}
    >
      <YStack gap="$3">
        <SizableText id={headingId} size="$4" fontWeight="bold" fontFamily="$heading">
          {title}
        </SizableText>
        {children}
      </YStack>
    </section>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <XStack gap="$3" alignItems="flex-start" flexWrap="wrap">
      <SizableText size="$2" fontWeight="bold" fontFamily="$body" minWidth={180}>
        {label}
      </SizableText>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {value}
      </SizableText>
    </XStack>
  );
}

export function RefreshButton({
  children,
  disabled,
  onClick,
}: {
  children: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        color: "var(--text)",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: "8px 12px",
      }}
    >
      {children}
    </button>
  );
}

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
        <Meta label={labels.kind} value={resource.kind} />
        <Meta label={labels.status} value={resource.status} />
        <Meta label={labels.source} value={provenance} />
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <Meta label={labels.sourceRefId} value={resource.sourceRefId ?? labels.none} />
        <Meta label={labels.debugId} value={resource.id} />
      </XStack>
    </YStack>
  );
}

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
        <Meta label={labels.bucketStartAt} value={formatDateTime(bucket.bucketStartAt, labels.none)} />
        <Meta label={labels.bucketEndAt} value={formatDateTime(bucket.bucketEndAt, labels.none)} />
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <Meta
          label={labels.availableMinutes}
          value={
            bucket.availableMinutes === 0
              ? labels.zeroAvailabilityAlpha
              : String(bucket.availableMinutes)
          }
        />
        <Meta label={labels.plannedMinutes} value={String(bucket.plannedMinutes)} />
        <Meta label={labels.overloadMinutes} value={String(bucket.overloadMinutes)} />
      </XStack>
    </YStack>
  );
}

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
        <Meta label={labels.productionOrder} value={operation.productionOrderId ?? labels.none} />
        <Meta label={labels.resource} value={operation.resourceId ?? labels.none} />
        <Meta label={labels.workCenter} value={operation.workCenterId ?? labels.none} />
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <Meta label={labels.startsAt} value={formatDateTime(operation.startsAt, labels.none)} />
        <Meta label={labels.endsAt} value={formatDateTime(operation.endsAt, labels.none)} />
        <Meta label={labels.duration} value={`${operation.plannedDurationMinutes} min`} />
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <Meta label={labels.source} value={provenance} />
        <Meta label={labels.sourceRefId} value={operation.sourceRefId ?? labels.none} />
      </XStack>
    </YStack>
  );
}

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
        <Meta label={labels.severity} value={conflict.severity} />
        <Meta label={labels.status} value={conflict.status} />
        <Meta label={labels.resource} value={conflict.resourceId ?? labels.none} />
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <Meta label={labels.startsAt} value={formatDateTime(conflict.startsAt, labels.none)} />
        <Meta label={labels.endsAt} value={formatDateTime(conflict.endsAt, labels.none)} />
      </XStack>
    </YStack>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
      <SizableText fontWeight="bold">{label}:</SizableText> {value}
    </SizableText>
  );
}
