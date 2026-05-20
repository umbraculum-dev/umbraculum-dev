"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, H1, SizableText, YStack } from "tamagui";
import {
  AttributeSetGetResponseSchema,
  type AttributeSet,
} from "@umbraculum/pim-contracts";

import { Link } from "../../../../../src/i18n/navigation";
import { ErrorBox } from "../../../../_components/recipe-edit";
import { apiFetch } from "../../../../_lib/apiClient";
import { useRequireAuth } from "../../../../_lib/useRequireAuth";

export default function PimAttributeSetDetailPage() {
  const tSets = useTranslations("pim.attributeSets");
  const tFields = useTranslations("pim.fields");
  const tProducts = useTranslations("pim.products");

  const params = useParams<{ setId: string }>();
  const setId = params?.setId ?? "";

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready";

  const [attributeSet, setAttributeSet] = useState<AttributeSet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const refresh = async () => {
    if (!canCall || !setId) return;
    setError(null);
    setNotFound(false);
    setLoading(true);
    try {
      const res = await apiFetch(`/api/pim/attribute-sets/${encodeURIComponent(setId)}`);
      if (res.status === 404) {
        setAttributeSet(null);
        setNotFound(true);
        return;
      }
      if (!res.ok) {
        throw new Error(
          typeof res.data === "string" ? res.data : JSON.stringify(res.data),
        );
      }
      const parsed = AttributeSetGetResponseSchema.parse(res.data);
      setAttributeSet(parsed.item);
    } catch (err) {
      setError(String(err));
      setAttributeSet(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status, setId]);

  if (notFound) {
    return (
      <YStack gap="$3">
        <Link href="/pim/attribute-sets">{tSets("back")}</Link>
        <SizableText color="var(--text-muted)">{tProducts("notFound")}</SizableText>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      <Link href="/pim/attribute-sets">{tSets("back")}</Link>
      {attributeSet ? (
        <>
          <H1 mb="$2">{attributeSet.label}</H1>
          <SizableText color="var(--text-muted)">
            {tFields("code")}: {attributeSet.code}
          </SizableText>
          <SizableText fontWeight="bold" mt="$2">
            Attribute IDs
          </SizableText>
          <ul className="brew-recipe-list">
            {attributeSet.attributeIds.map((id) => (
              <li key={id} className="brew-recipe-list-row">
                <SizableText fontFamily="$body">{id}</SizableText>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {error ? <ErrorBox>{error}</ErrorBox> : null}
      <Button
        size="$3"
        bg="var(--surface-2)"
        borderWidth={1}
        borderColor="var(--border)"
        color="var(--text)"
        onPress={() => void refresh()}
        disabled={!canCall || loading}
      >
        {loading ? tProducts("refreshing") : tProducts("refresh")}
      </Button>
    </YStack>
  );
}
