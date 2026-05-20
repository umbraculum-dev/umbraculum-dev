"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button, H1, SizableText, View, XStack, YStack } from "tamagui";
import {
  AttributeSetListResponseSchema,
  type AttributeSet,
} from "@umbraculum/pim-contracts";

import { Link } from "../../../../src/i18n/navigation";
import { ErrorBox } from "../../../_components/recipe-edit";
import { apiFetch } from "../../../_lib/apiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";

export default function PimAttributeSetsPage() {
  const t = useTranslations("pim");
  const tSets = useTranslations("pim.attributeSets");
  const tFields = useTranslations("pim.fields");

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready";

  const [sets, setSets] = useState<readonly AttributeSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!canCall) return;
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch("/api/pim/attribute-sets");
      if (!res.ok) {
        throw new Error(
          typeof res.data === "string" ? res.data : JSON.stringify(res.data),
        );
      }
      const parsed = AttributeSetListResponseSchema.parse(res.data);
      setSets(parsed.items);
    } catch (err) {
      setError(String(err));
      setSets([]);
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
      <Link href="/pim">{t("products.back")}</Link>
      <H1 mb="$2">{tSets("title")}</H1>
      <XStack gap="$3">
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          onPress={() => void refresh()}
          disabled={!canCall || loading}
        >
          {loading ? t("products.refreshing") : t("products.refresh")}
        </Button>
      </XStack>
      {error ? <ErrorBox>{error}</ErrorBox> : null}
      {!loading && sets.length === 0 && !error ? (
        <SizableText size="$2" color="var(--text-muted)">
          {tSets("noSets")}
        </SizableText>
      ) : null}
      {sets.length > 0 ? (
        <View>
          <ul className="brew-recipe-list">
            {sets.map((s) => (
              <li key={s.id} className="brew-recipe-list-row">
                <YStack gap="$1">
                  <SizableText fontFamily="$body">
                    <SizableText fontWeight="bold">{s.code}</SizableText>
                    <SizableText color="var(--text-muted)"> · {s.label}</SizableText>
                  </SizableText>
                  <SizableText size="$2" color="var(--text-muted)">
                    {tFields("code")}: {s.code} · {s.attributeIds.length} attributes
                  </SizableText>
                  <Link href={`/pim/attribute-sets/${s.id}`}>{tSets("openDetail")}</Link>
                </YStack>
              </li>
            ))}
          </ul>
        </View>
      ) : null}
    </YStack>
  );
}
