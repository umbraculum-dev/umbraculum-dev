"use client";

import {
  CapacityConflictListResponseSchema,
  ScheduledOperationListResponseSchema,
  type CapacityConflict,
  type ScheduledOperation,
} from "@umbraculum/crp-contracts";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { H1, SizableText, XStack, YStack } from "tamagui";

import { Link } from "../../../../src/i18n/navigation";
import { ErrorBox } from "../../../_components/recipe-edit";
import { apiFetch } from "../../../_lib/apiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import {
  ConflictSummary,
  RefreshButton,
  ScheduledOperationSummary,
  SectionCard,
} from "../_components/CrpReadOnly";

export default function CrpSchedulePage() {
  const t = useTranslations("crp");
  const tSchedule = useTranslations("crp.schedule");
  const tFields = useTranslations("crp.fields");
  const tValues = useTranslations("crp.values");

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready";

  const [operations, setOperations] = useState<readonly ScheduledOperation[]>([]);
  const [conflicts, setConflicts] = useState<readonly CapacityConflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!canCall) return;
    setError(null);
    setLoading(true);
    try {
      const [operationsRes, conflictsRes] = await Promise.all([
        apiFetch("/api/crp/scheduled-operations"),
        apiFetch("/api/crp/conflicts"),
      ]);
      if (!operationsRes.ok) {
        throw new Error(
          typeof operationsRes.data === "string"
            ? operationsRes.data
            : JSON.stringify(operationsRes.data),
        );
      }
      if (!conflictsRes.ok) {
        throw new Error(
          typeof conflictsRes.data === "string"
            ? conflictsRes.data
            : JSON.stringify(conflictsRes.data),
        );
      }
      const parsedOperations = ScheduledOperationListResponseSchema.parse(operationsRes.data);
      const parsedConflicts = CapacityConflictListResponseSchema.parse(conflictsRes.data);
      setOperations(parsedOperations.items);
      setConflicts(parsedConflicts.items);
    } catch (err) {
      setError(String(err));
      setOperations([]);
      setConflicts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status]);

  const operationLabels = {
    operationCode: tFields("operationCode"),
    productionOrder: tFields("productionOrder"),
    workCenter: tFields("workCenter"),
    resource: tFields("resource"),
    startsAt: tFields("startsAt"),
    endsAt: tFields("endsAt"),
    duration: tFields("duration"),
    source: tFields("source"),
    sourceRefId: tFields("sourceRefId"),
    canonical: tValues("canonicalCrpRow"),
    automation: tValues("projectedFromAutomationVessel"),
    brewery: tValues("projectedFromBrewery"),
    projectedFromModule: (module: string) => tValues("projectedFromModule", { module }),
    none: tValues("none"),
  };

  const conflictLabels = {
    conflict: tFields("conflict"),
    severity: tFields("severity"),
    status: tFields("status"),
    resource: tFields("resource"),
    startsAt: tFields("startsAt"),
    endsAt: tFields("endsAt"),
    none: tValues("none"),
  };

  return (
    <YStack gap="$3">
      <H1>{tSchedule("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("subtitle")}
      </SizableText>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("alphaNote")}
      </SizableText>

      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        <RefreshButton onClick={() => void refresh()} disabled={!canCall || loading}>
          {loading ? t("refreshing") : t("refresh")}
        </RefreshButton>
        <Link href="/resources">{tSchedule("resourcesLink")}</Link>
        <Link href="/capacity">{tSchedule("capacityLink")}</Link>
        <Link href="/production-orders">{tFields("productionOrder")}</Link>
      </XStack>

      {error ? <ErrorBox>{error}</ErrorBox> : null}

      {loading && operations.length === 0 && conflicts.length === 0 ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}

      <SectionCard headingId="crp-schedule-heading" title={tSchedule("title")}>
        {operations.length === 0 ? (
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
            {t("noSchedule")}
          </SizableText>
        ) : (
          <ul className="brew-recipe-list">
            {operations.map((operation) => (
              <li key={operation.id} className="brew-recipe-list-row">
                <YStack gap="$2">
                  <ScheduledOperationSummary operation={operation} labels={operationLabels} />
                  <XStack gap="$3" flexWrap="wrap">
                    {operation.productionOrderId ? (
                      <Link href={`/production-orders/${encodeURIComponent(operation.productionOrderId)}`}>
                        {tFields("productionOrder")}
                      </Link>
                    ) : null}
                    {operation.resourceId ? (
                      <Link href={`/resources/${encodeURIComponent(operation.resourceId)}`}>
                        {tFields("resource")}
                      </Link>
                    ) : null}
                  </XStack>
                </YStack>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard headingId="crp-conflicts-heading" title={tSchedule("conflictsTitle")}>
        {conflicts.length === 0 ? (
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
            {t("noConflicts")}
          </SizableText>
        ) : (
          <ul className="brew-recipe-list">
            {conflicts.map((conflict) => (
              <li key={conflict.id} className="brew-recipe-list-row">
                <ConflictSummary conflict={conflict} labels={conflictLabels} />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </YStack>
  );
}
