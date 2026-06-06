"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button, H1, SizableText, View, XStack, YStack } from "tamagui";
import { listVessels } from "@umbraculum/api-client/automation";
import { type VesselState } from "@umbraculum/automation-contracts";

import { AskAiLink } from "../../../_shell/_components/AskAiLink";
import { Link } from "../../../../src/i18n/navigation";
import { ErrorBox } from "../../(brewery)/_components/recipe-edit";
import { useRequireAuth } from "../../../_shell/_lib/useRequireAuth";
import { webPlatformApiClient } from "../../../_shell/_lib/webApiClient";

/**
 * Phase B-3 automation vessels — list page.
 *
 * Surface intent (per canonical-automation-module-surface.md §11 Non-goals):
 * displays live controller state for the vessels in this workspace.
 * Vessel scheduling, utilization, capacity planning, and booking views
 * belong to the future `crp` (capacity-resource-planning) canonical
 * module and are intentionally NOT surfaced here.
 *
 * URL: `/en/vessels` (β filesystem-axis route group; the `(automation)/`
 * group does not contribute a path segment per RFC-0002 Decision B, and
 * `vessels` is the canonical static sub-segment the automation module
 * owns per `docs/design/web-route-group-audit.md` §3.4 + RFC-0006).
 *
 * The response is re-validated through `VesselListResponseSchema` on the
 * client so a future server-side schema drift surfaces at the boundary
 * with a clean `ZodError`-derived message rather than rendering a
 * partial/typo'd UI. This matches the RFC-0003 Decision A pattern of
 * validating once at every boundary, including the JSON-over-HTTP one.
 */
export default function AutomationVesselsPage() {
  const t = useTranslations("automation");
  const tFields = useTranslations("automation.fields");
  const tValues = useTranslations("automation.values");

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready";

  const [vessels, setVessels] = useState<readonly VesselState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!canCall) return;
    setError(null);
    setLoading(true);
    try {
      const client = webPlatformApiClient();
      const data = await listVessels(client);
      setVessels(data.vessels);
    } catch (err) {
      setError(String(err));
      setVessels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status]);

  return (
    <YStack gap="$3">
      <H1 mb="$2">{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("subtitle")}
      </SizableText>

      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        <AskAiLink fromRoute="vessels" />
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

      {loading && vessels.length === 0 ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}

      {!loading && vessels.length === 0 && !error ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("noVessels")}
        </SizableText>
      ) : null}

      {vessels.length > 0 ? (
        <View role="region" aria-labelledby="vessels-heading">
          <SizableText
            id="vessels-heading"
            size="$4"
            fontWeight="bold"
            fontFamily="$heading"
            mb="$2"
          >
            {t("listTitle")}
          </SizableText>
          <ul className="brew-recipe-list">
            {vessels.map((v) => (
              <li key={v.id} className="brew-recipe-list-row">
                <YStack gap="$1.5">
                  <XStack justifyContent="space-between" alignItems="flex-start" columnGap="$3" rowGap="$0.5">
                    <SizableText flex={1} fontFamily="$body">
                      <SizableText fontWeight="bold">{v.code}</SizableText>
                      <SizableText color="var(--text-muted)"> · {v.displayName}</SizableText>
                      <SizableText color="var(--text-muted)"> ({v.vesselKind})</SizableText>
                    </SizableText>
                  </XStack>
                  <XStack gap="$3" flexWrap="wrap" alignItems="center">
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                      <SizableText fontWeight="bold">{tFields("mode")}:</SizableText>{" "}
                      {v.mode ?? tValues("none")}
                    </SizableText>
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                      <SizableText fontWeight="bold">{tFields("currentTempC")}:</SizableText>{" "}
                      {v.currentTempC != null ? v.currentTempC.toFixed(1) : tValues("none")}
                    </SizableText>
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                      <SizableText fontWeight="bold">{tFields("targetTempC")}:</SizableText>{" "}
                      {v.targetTempC != null ? v.targetTempC.toFixed(1) : tValues("none")}
                    </SizableText>
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                      <SizableText fontWeight="bold">{tFields("alarmActive")}:</SizableText>{" "}
                      {v.alarmActive ? tValues("alarmOn") : tValues("alarmOff")}
                    </SizableText>
                  </XStack>
                  <XStack gap="$3" flexWrap="wrap">
                    <Link href={`/vessels/${v.code}`}>{t("openDetail")}</Link>
                  </XStack>
                </YStack>
              </li>
            ))}
          </ul>
        </View>
      ) : null}
    </YStack>
  );
}
