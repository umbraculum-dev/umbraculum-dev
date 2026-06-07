"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, H1, SizableText, View, XStack, YStack } from "tamagui";
import { ApiClientError } from "@umbraculum/api-client";
import { getVessel } from "@umbraculum/api-client/automation";
import { type VesselState } from "@umbraculum/automation-contracts";

import { Link } from "../../../../../src/i18n/navigation";
import { ErrorBox } from "../../../../_shared-layout/_components/ErrorBox";
import { useRequireAuth } from "../../../../_shared-layout/_lib/useRequireAuth";
import { webPlatformApiClient } from "../../../../_shared-layout/_lib/webApiClient";

/**
 * Phase B-3 automation vessel — detail page.
 *
 * Surface intent (per canonical-automation-module-surface.md §11
 * Non-goals): renders the live controller-reported state of one vessel.
 * No scheduling, capacity, utilization, booking, or "next planned use"
 * data is shown here — those views belong to the future `crp` canonical
 * module and would consume the same `vesselId` through a different
 * surface.
 *
 * URL: `/en/vessels/<code>` (β filesystem-axis: the `(automation)/`
 * group contributes no path segment per RFC-0002 Decision B; `vessels`
 * is the canonical static sub-segment the automation module owns; this
 * file's `[vesselCode]` is the dynamic detail child of that segment per
 * `docs/design/web-route-group-audit.md` §3.4 + RFC-0006). The previous
 * shape `(automation)/[vesselCode]/page.tsx` shadowed every non-static
 * URL under `/en/*` (e.g. `/en/FAKE-CODE` rendered this page) — the
 * Discipline 2 violation surfaced by the audit and corrected here.
 *
 * 404 from the API (vessel-not-found in the active workspace) is
 * rendered as the canonical "not found in this workspace" empty state
 * rather than an error — this is the same UX as the L2 cross-workspace
 * isolation behavior: a vessel the active workspace cannot see is
 * indistinguishable from one that does not exist, by design.
 */
export default function AutomationVesselDetailPage() {
  const t = useTranslations("automation");
  const tFields = useTranslations("automation.fields");
  const tValues = useTranslations("automation.values");

  const params = useParams<{ vesselCode: string }>();
  const code = params?.vesselCode ?? "";

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready";

  const [vessel, setVessel] = useState<VesselState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const refresh = async () => {
    if (!canCall || !code) return;
    setError(null);
    setNotFound(false);
    setLoading(true);
    try {
      const client = webPlatformApiClient();
      const data = await getVessel(client, code);
      setVessel(data.vessel);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setVessel(null);
        setNotFound(true);
        return;
      }
      setVessel(null);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status, code]);

  const renderTemp = (v: number | null) =>
    v != null ? v.toFixed(1) : tValues("none");

  const renderLastSeen = (iso: string | null) => {
    if (!iso) return tValues("never");
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <YStack gap="$3">
      <H1 mb="$2">{vessel ? `${vessel.code} · ${vessel.displayName}` : t("title")}</H1>

      <XStack gap="$3" alignItems="center">
        <Link href="/vessels">{t("back")}</Link>
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          onPress={() => void refresh()}
          disabled={!canCall || loading}
        >
          {loading ? t("refreshing") : t("refresh")}
        </Button>
      </XStack>

      {error ? <ErrorBox>{error}</ErrorBox> : null}

      {loading && !vessel ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}

      {notFound ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("notFound")}
        </SizableText>
      ) : null}

      {vessel ? (
        <View role="region" aria-labelledby="vessel-detail-heading">
          <SizableText
            id="vessel-detail-heading"
            size="$4"
            fontWeight="bold"
            fontFamily="$heading"
            mb="$2"
          >
            {t("listTitle")} · {vessel.code}
          </SizableText>
          <YStack gap="$2">
            <DetailRow label={tFields("code")} value={vessel.code} />
            <DetailRow label={tFields("displayName")} value={vessel.displayName} />
            <DetailRow label={tFields("vesselKind")} value={vessel.vesselKind} />
            <DetailRow
              label={tFields("mode")}
              value={vessel.mode ?? tValues("none")}
            />
            <DetailRow
              label={tFields("currentTempC")}
              value={renderTemp(vessel.currentTempC)}
            />
            <DetailRow
              label={tFields("targetTempC")}
              value={renderTemp(vessel.targetTempC)}
            />
            <DetailRow
              label={tFields("alarmActive")}
              value={vessel.alarmActive ? tValues("alarmOn") : tValues("alarmOff")}
            />
            <DetailRow
              label={tFields("lastSeenAt")}
              value={renderLastSeen(vessel.lastSeenAt)}
            />
            <DetailRow
              label={tFields("equipmentProfileId")}
              value={vessel.equipmentProfileId ?? tValues("none")}
            />
            <DetailRow
              label={tFields("adapterConnectionId")}
              value={vessel.adapterConnectionId ?? tValues("none")}
            />
          </YStack>
        </View>
      ) : null}
    </YStack>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <XStack gap="$3" alignItems="flex-start" flexWrap="wrap">
      <SizableText size="$2" fontWeight="bold" fontFamily="$body" minWidth={200}>
        {label}
      </SizableText>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {value}
      </SizableText>
    </XStack>
  );
}
