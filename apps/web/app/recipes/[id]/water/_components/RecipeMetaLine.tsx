"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

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
    <p className="muted" style={{ marginTop: 0 }}>
      {t("recipeId")}: <code>{recipeId}</code>
      {recipeName ? (
        <>
          {" "}
          -{" "}
          {t("recipeName")}: <strong>{recipeName}</strong>
        </>
      ) : null}
    </p>
  );
}

