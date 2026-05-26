"use client";

import { CapacityLoadResponseSchema, type CapacityBucket } from "@umbraculum/crp-contracts";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { H1, SizableText, XStack, YStack } from "tamagui";

import { Link } from "../../../../src/i18n/navigation";
import { ErrorBox } from "../../../_components/recipe-edit";
import { apiFetch } from "../../../_lib/apiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { CapacityBucketSummary, RefreshButton, SectionCard } from "../_components/CrpReadOnly";

export default function CrpCapacityPage() {
  const t = useTranslations("crp");
  const tCapacity = useTranslations("crp.capacity");
  const tSchedule = useTranslations("crp.schedule");
  const tFields = useTranslations("crp.fields");
  const tValues = useTranslations("crp.values");

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready";

  const [buckets, setBuckets] = useState<readonly CapacityBucket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!canCall) return;
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch("/api/crp/capacity-load");
      if (!res.ok) {
        throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      }
      const parsed = CapacityLoadResponseSchema.parse(res.data);
      setBuckets(parsed.item.buckets);
    } catch (err) {
      setError(String(err));
      setBuckets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status]);

  const labels = {
    resource: tFields("resource"),
    bucketStartAt: tFields("bucketStartAt"),
    bucketEndAt: tFields("bucketEndAt"),
    availableMinutes: tFields("availableMinutes"),
    plannedMinutes: tFields("plannedMinutes"),
    overloadMinutes: tFields("overloadMinutes"),
    zeroAvailabilityAlpha: tValues("zeroAvailabilityAlpha"),
    none: tValues("none"),
  };

  return (
    <YStack gap="$3">
      <H1>{tCapacity("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("subtitle")}
      </SizableText>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {tCapacity("note")}
      </SizableText>

      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        <RefreshButton onClick={() => void refresh()} disabled={!canCall || loading}>
          {loading ? t("refreshing") : t("refresh")}
        </RefreshButton>
        <Link href="/schedule">{tSchedule("title")}</Link>
        <Link href="/resources">{tSchedule("resourcesLink")}</Link>
        <Link href="/production-orders">{tFields("productionOrder")}</Link>
      </XStack>

      {error ? <ErrorBox>{error}</ErrorBox> : null}

      {loading && buckets.length === 0 ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}

      {!loading && buckets.length === 0 && !error ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("noCapacity")}
        </SizableText>
      ) : null}

      {buckets.length > 0 ? (
        <SectionCard headingId="crp-capacity-heading" title={tCapacity("title")}>
          <ul className="brew-recipe-list">
            {buckets.map((bucket) => (
              <li key={`${bucket.resourceId}:${bucket.bucketStartAt}`} className="brew-recipe-list-row">
                <CapacityBucketSummary bucket={bucket} labels={labels} />
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}
    </YStack>
  );
}
