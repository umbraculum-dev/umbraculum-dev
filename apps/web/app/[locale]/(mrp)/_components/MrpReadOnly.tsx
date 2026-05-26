"use client";

import type { MaterialRequirement, Operation, ProductionOrder } from "@umbraculum/mrp-contracts";
import type { ReactNode } from "react";
import { SizableText, XStack, YStack } from "tamagui";

export function formatQuantity(value: number, unit: string): string {
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2)} ${unit}`;
}

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
    brewery: string;
    projectedFromModule: (module: string) => string;
  },
): string {
  if (!sourceModule) return labels.canonical;
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

export function ProductionOrderSummary({
  order,
  labels,
}: {
  order: ProductionOrder;
  labels: {
    orderNumber: string;
    status: string;
    quantity: string;
    plannedStartAt: string;
    dueAt: string;
    source: string;
    sourceRefId: string;
    lineCount: string;
    debugId: string;
    unknownDate: string;
    none: string;
    canonical: string;
    brewery: string;
    projectedFromModule: (module: string) => string;
  };
}) {
  const provenance = sourceLabel(order.sourceModule, {
    canonical: labels.canonical,
    brewery: labels.brewery,
    projectedFromModule: labels.projectedFromModule,
  });

  return (
    <YStack gap="$1.5">
      <SizableText fontFamily="$body">
        <SizableText fontWeight="bold">{labels.orderNumber}:</SizableText>{" "}
        {order.orderNumber}
      </SizableText>
      <XStack gap="$3" flexWrap="wrap">
        <Meta label={labels.status} value={order.status} />
        <Meta label={labels.quantity} value={formatQuantity(order.quantity, order.unit)} />
        <Meta label={labels.lineCount} value={String(order.lines.length)} />
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <Meta
          label={labels.plannedStartAt}
          value={formatDateTime(order.plannedStartAt, labels.unknownDate)}
        />
        <Meta label={labels.dueAt} value={formatDateTime(order.dueAt, labels.unknownDate)} />
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <Meta label={labels.source} value={provenance} />
        <Meta label={labels.sourceRefId} value={order.sourceRefId ?? labels.none} />
        <Meta label={labels.debugId} value={order.id} />
      </XStack>
    </YStack>
  );
}

export function OperationSummary({
  operation,
  labels,
}: {
  operation: Operation;
  labels: {
    operationCode: string;
    operationName: string;
    duration: string;
    earliestStartAt: string;
    dueAt: string;
    unknownDate: string;
    none: string;
  };
}) {
  return (
    <YStack gap="$1">
      <SizableText fontFamily="$body">
        <SizableText fontWeight="bold">{operation.sequence}. </SizableText>
        {operation.name}
      </SizableText>
      <XStack gap="$3" flexWrap="wrap">
        <Meta label={labels.operationCode} value={operation.code} />
        <Meta
          label={labels.duration}
          value={
            operation.plannedDurationMinutes
              ? `${operation.plannedDurationMinutes} min`
              : labels.none
          }
        />
        <Meta
          label={labels.earliestStartAt}
          value={formatDateTime(operation.earliestStartAt, labels.unknownDate)}
        />
        <Meta label={labels.dueAt} value={formatDateTime(operation.dueAt, labels.unknownDate)} />
      </XStack>
    </YStack>
  );
}

export function MaterialRequirementSummary({
  requirement,
  labels,
}: {
  requirement: MaterialRequirement;
  labels: {
    material: string;
    requiredQuantity: string;
    availability: string;
    availabilityNote: string;
    sourceRefId: string;
    none: string;
  };
}) {
  return (
    <YStack gap="$1">
      <SizableText fontFamily="$body">
        <SizableText fontWeight="bold">{requirement.description}</SizableText>
      </SizableText>
      <XStack gap="$3" flexWrap="wrap">
        <Meta
          label={labels.requiredQuantity}
          value={formatQuantity(requirement.requiredQuantity, requirement.unit)}
        />
        <Meta label={labels.availability} value={requirement.availabilityStatus} />
        <Meta label={labels.material} value={requirement.materialRefId ?? labels.none} />
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <Meta label={labels.availabilityNote} value={requirement.availabilityNote ?? labels.none} />
        <Meta label={labels.sourceRefId} value={requirement.bomLineId ?? labels.none} />
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
