"use client";

import { ResourceListResponseSchema, type Resource } from "@umbraculum/crp-contracts";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { H1, SizableText, XStack, YStack } from "tamagui";

import { Link } from "../../../../src/i18n/navigation";
import { ErrorBox } from "../../../_components/recipe-edit";
import { apiFetch } from "../../../_lib/apiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { RefreshButton, ResourceSummary, SectionCard } from "../_components/CrpReadOnly";

export default function CrpResourcesPage() {
  const t = useTranslations("crp");
  const tResources = useTranslations("crp.resources");
  const tFields = useTranslations("crp.fields");
  const tValues = useTranslations("crp.values");

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready";

  const [resources, setResources] = useState<readonly Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!canCall) return;
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch("/api/crp/resources");
      if (!res.ok) {
        throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      }
      const parsed = ResourceListResponseSchema.parse(res.data);
      setResources(parsed.items);
    } catch (err) {
      setError(String(err));
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status]);

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

  return (
    <YStack gap="$3">
      <H1>{t("title")}</H1>
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
        <Link href="/capacity">{tResources("capacityLink")}</Link>
        <Link href="/schedule">{tResources("scheduleLink")}</Link>
      </XStack>

      {error ? <ErrorBox>{error}</ErrorBox> : null}

      {loading && resources.length === 0 ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}

      {!loading && resources.length === 0 && !error ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("noResources")}
        </SizableText>
      ) : null}

      {resources.length > 0 ? (
        <SectionCard headingId="crp-resources-heading" title={tResources("listTitle")}>
          <ul className="brew-recipe-list">
            {resources.map((resource) => (
              <li key={resource.id} className="brew-recipe-list-row">
                <YStack gap="$2">
                  <ResourceSummary resource={resource} labels={labels} />
                  <XStack gap="$3" flexWrap="wrap">
                    <Link href={`/resources/${encodeURIComponent(resource.id)}`}>
                      {tResources("openDetail")}
                    </Link>
                  </XStack>
                </YStack>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}
    </YStack>
  );
}
