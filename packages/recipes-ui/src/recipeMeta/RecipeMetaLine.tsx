import React, { useEffect, useState } from "react";

import { useT } from "@brewery/i18n-react";
import { Text } from "@brewery/ui";

export type RecipeMeta = {
  name: string | null;
  version: number | null;
};

type RecipeGetResponseLike = {
  recipe?: {
    name?: unknown;
    version?: unknown;
  };
};

export function parseRecipeMetaFromGetRecipeResponse(data: unknown): RecipeMeta | null {
  if (!data || typeof data !== "object") return null;
  const d = data as RecipeGetResponseLike;
  const r = d.recipe;
  if (!r || typeof r !== "object") return null;

  const name = typeof r.name === "string" ? r.name.trim() : "";
  const version =
    typeof r.version === "number" && Number.isInteger(r.version) && r.version >= 0 ? r.version : null;

  return { name: name ? name : null, version };
}

export interface RecipeMetaLineProps {
  recipeId: string;
  enabled?: boolean;
  loadRecipeMeta: (recipeId: string) => Promise<RecipeMeta | null>;
}

export function RecipeMetaLine(props: RecipeMetaLineProps) {
  const { recipeId, loadRecipeMeta, enabled: enabledProp } = props;
  const { t } = useT("waterHub");
  const enabled = enabledProp !== false;

  const [meta, setMeta] = useState<RecipeMeta>({ name: null, version: null });

  useEffect(() => {
    let cancelled = false;
    setMeta({ name: null, version: null });

    if (!enabled) return () => {};
    if (!recipeId) return () => {};

    void loadRecipeMeta(recipeId)
      .then((res) => {
        if (cancelled) return;
        if (!res) return;
        setMeta(res);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [enabled, recipeId, loadRecipeMeta]);

  return (
    <Text fontSize={12} opacity={0.8}>
      {t("recipeId")}: {recipeId}
      {meta.name ? ` - ${t("recipeName")}: ${meta.name}` : null}
      {meta.version !== null ? ` - ${t("recipeVersion")}: ${String(meta.version).padStart(2, "0")}` : null}
    </Text>
  );
}

