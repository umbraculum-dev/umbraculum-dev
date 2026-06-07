"use client";

import { ApiClientError } from "@umbraculum/api-client";
import { getResource } from "@umbraculum/api-client/crp";
import { type Resource } from "@umbraculum/crp-contracts";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { H1, SizableText, XStack, YStack } from "tamagui";

import { Link } from "../../../../../src/i18n/navigation";
import { ErrorBox } from "../../../(brewery)/_components/recipe-edit";
import { useRequireAuth } from "../../../../_shared-layout/_lib/useRequireAuth";
import { webPlatformApiClient } from "../../../../_shared-layout/_lib/webApiClient";
import {
  DetailRow,
  formatDateTime,
  RefreshButton,
  ResourceSummary,
  SectionCard,
  sourceLabel,
} from "../../_components/CrpReadOnly";

export default function CrpResourceDetailPage() {
  const t = useTranslations("crp");
  const tResources = useTranslations("crp.resources");
  const tFields = useTranslations("crp.fields");
  const tValues = useTranslations("crp.values");

  const params = useParams<{ resourceId: string }>();
  const resourceId = params?.resourceId ?? "";

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready";

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const refresh = async () => {
    if (!canCall || !resourceId) return;
    setError(null);
    setNotFound(false);
    setLoading(true);
    try {
      const client = webPlatformApiClient();
      const data = await getResource(client, resourceId);
      setResource(data.item);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setResource(null);
        setNotFound(true);
        return;
      }
      setResource(null);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status, resourceId]);

  const labels = {
    code: tFields("code"),
    kind: tFields("kind"),
    status: tFields("status"),
    source: tFields("source"),
    sourceRefId: tFields("sourceRefId"),
    debugId: tFields("debugId"),
    canonical: tValues("canonicalCrpRow"),
    automation: tValues("projectedFromAutomationVessel"),
    brewery: tValues("projectedFromBrewery"),
    projectedFromModule: (module: string) => tValues("projectedFromModule", { module }),
    none: tValues("none"),
  };

  const provenance =
    resource == null
      ? tValues("none")
      : sourceLabel(resource.sourceModule, {
          canonical: tValues("canonicalCrpRow"),
          automation: tValues("projectedFromAutomationVessel"),
          brewery: tValues("projectedFromBrewery"),
          projectedFromModule: (module) => tValues("projectedFromModule", { module }),
        });

  return (
    <YStack gap="$3">
      <H1>{resource ? resource.name : tResources("listTitle")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("alphaNote")}
      </SizableText>

      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        <Link href="/resources">{tResources("back")}</Link>
        <RefreshButton onClick={() => void refresh()} disabled={!canCall || loading}>
          {loading ? t("refreshing") : t("refresh")}
        </RefreshButton>
        <Link href="/capacity">{tResources("capacityLink")}</Link>
        <Link href="/schedule">{tResources("scheduleLink")}</Link>
      </XStack>

      {error ? <ErrorBox>{error}</ErrorBox> : null}

      {loading && !resource ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}

      {notFound ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("noResources")}
        </SizableText>
      ) : null}

      {resource ? (
        <SectionCard headingId="crp-resource-detail-heading" title={tResources("listTitle")}>
          <ResourceSummary resource={resource} labels={labels} />
          <YStack gap="$1.5">
            <DetailRow label={tFields("source")} value={provenance} />
            <DetailRow label={tFields("createdAt")} value={formatDateTime(resource.createdAt, tValues("none"))} />
            <DetailRow label={tFields("updatedAt")} value={formatDateTime(resource.updatedAt, tValues("none"))} />
          </YStack>
          {resource.sourceModule === "automation" ? (
            <XStack gap="$3" flexWrap="wrap">
              <Link href={`/vessels/${encodeURIComponent(resource.code)}`}>
                {tResources("automationSourceLink")}
              </Link>
            </XStack>
          ) : null}
        </SectionCard>
      ) : null}
    </YStack>
  );
}
