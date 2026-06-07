"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Button, H1, SizableText, View, XStack, YStack } from "tamagui";

import { listRecipeVersions } from "@umbraculum/api-client/brewery";

import { Link } from "../../../../../../src/i18n/navigation";
import { ErrorBox } from "../../../_components/recipe-edit";
import { webBreweryApiClient } from "../../../_lib/breweryWaterClient";
import { useRequireAuth } from "../../../../../_shared-layout/_lib/useRequireAuth";

type VersionListItem = {
  id: string;
  version: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export default function RecipeVersionsPage() {
  const t = useTranslations("recipes.versions");
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready" && !!authState.me?.activeWorkspaceId;

  const [versions, setVersions] = useState<VersionListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...versions].sort((a, b) => (b.version ?? 0) - (a.version ?? 0)),
    [versions],
  );

  const refresh = async () => {
    if (!canCall) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listRecipeVersions(webBreweryApiClient(), recipeId);
      setVersions(data.versions as VersionListItem[]);
    } catch (err) {
      setVersions([]);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCall, recipeId]);

  return (
    <YStack gap="$3">
      <H1 mb="$2">{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>

      <XStack gap="$3" flexWrap="wrap" ai="center">
        <SizableText size="$2" fontFamily="$body" mb={0}>
          <Link href="/recipes">{t("backToRecipes")}</Link>
        </SizableText>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}>
          ·
        </SizableText>
        <SizableText size="$2" fontFamily="$body" mb={0}>
          <Link href={`/recipes/${recipeId}/edit`}>{t("backToEditor")}</Link>
        </SizableText>
      </XStack>

      <View className="brew-panel" aria-labelledby="recipe-versions-heading" mt="$2">
        <XStack gap="$3" items="center" justifyContent="space-between" flexWrap="wrap">
          <SizableText id="recipe-versions-heading" fontFamily="$body" fontWeight="bold">
            {t("listTitle")}
          </SizableText>
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

        {error ? <ErrorBox mt="$3">{error}</ErrorBox> : null}

        {!loading && sorted.length === 0 ? (
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3">
            {t("empty")}
          </SizableText>
        ) : null}

        {sorted.length ? (
          <ul className="brew-recipe-list" aria-label={t("listAriaLabel")}>
            {sorted.map((v) => (
              <li key={v.id} className="brew-recipe-list-row">
                <YStack gap="$1.5">
                  <SizableText fontFamily="$body">
                    <SizableText fontWeight="bold">
                      {t("versionLabel")} {String(v.version).padStart(2, "0")}
                    </SizableText>
                    <SizableText color="var(--text-muted)"> · {v.name}</SizableText>
                  </SizableText>
                  <XStack gap="$3" flexWrap="wrap">
                    <Link href={`/recipes/${v.id}/edit`}>{t("openEditor")}</Link>
                    <Link href={`/recipes/${v.id}/water`}>{t("openWater")}</Link>
                  </XStack>
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                    {t("updatedAt")}: {v.updatedAt}
                  </SizableText>
                </YStack>
              </li>
            ))}
          </ul>
        ) : null}
      </View>
    </YStack>
  );
}

