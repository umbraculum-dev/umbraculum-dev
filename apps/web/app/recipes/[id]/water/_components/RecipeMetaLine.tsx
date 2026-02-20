"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { SizableText, View } from "tamagui";

import { CodeInline } from "../../../../_components/CodeInline";
import { apiFetch } from "../../../../_lib/apiClient";

type Props = {
  recipeId: string;
  enabled?: boolean;
};

type RecipeGetResponse = {
  ok: true;
  recipe: {
    name?: unknown;
  };
};

function extractRecipeName(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Partial<RecipeGetResponse>;
  const r = d.recipe;
  if (!r || typeof r !== "object") return null;
  const name = (r as any).name;
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  return trimmed ? trimmed : null;
}

export function RecipeMetaLine(props: Props) {
  const t = useTranslations("waterHub");
  const recipeId = props.recipeId;
  const enabled = props.enabled !== false;

  const [recipeName, setRecipeName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRecipeName(null);

    if (!enabled) return () => {};
    if (!recipeId) return () => {};

    (async () => {
      const res = await apiFetch(`/api/recipes/${recipeId}`);
      if (!res.ok) return;
      const name = extractRecipeName(res.data);
      if (!cancelled) setRecipeName(name);
    })().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [enabled, recipeId]);

  return (
    <View display="block" mt={0}>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("recipeId")}: <CodeInline>{recipeId}</CodeInline>
        {recipeName ? (
          <>
            {" "}
            -{" "}
            {t("recipeName")}:{" "}
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" fontWeight="bold" as="span">
              {recipeName}
            </SizableText>
          </>
        ) : null}
      </SizableText>
    </View>
  );
}

