import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

import { bearerTokenAuth, createApiClient } from "@brewery/api-client";
import { useT } from "@brewery/i18n-react";
import { Text } from "@brewery/ui";

import { useAuth } from "../auth/AuthProvider";
import { getApiBaseUrl } from "../auth/apiBaseUrl";

type Props = {
  recipeId: string;
  enabled?: boolean;
};

function extractRecipeName(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as { recipe?: { name?: unknown } };
  const r = d.recipe;
  if (!r || typeof r !== "object") return null;
  const name = (r as { name?: unknown }).name;
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  return trimmed ? trimmed : null;
}

function extractRecipeVersion(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const d = data as { recipe?: { version?: unknown } };
  const r = d.recipe;
  if (!r || typeof r !== "object") return null;
  const version = (r as { version?: unknown }).version;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 0) return null;
  return version;
}

export function RecipeMetaLine(props: Props) {
  const { t } = useT("waterHub");
  const auth = useAuth();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const [recipeName, setRecipeName] = useState<string | null>(null);
  const [recipeVersion, setRecipeVersion] = useState<number | null>(null);

  const fetchRecipe = useCallback(async () => {
    if (!props.enabled || !props.recipeId || !baseUrl || !token) return;
    const api = createApiClient(baseUrl, bearerTokenAuth(() => token));
    const res = await api.get(`/api/recipes/${props.recipeId}`);
    if (!res.ok) return;
    setRecipeName(extractRecipeName(res.data));
    setRecipeVersion(extractRecipeVersion(res.data));
  }, [props.enabled, props.recipeId, baseUrl, token]);

  useEffect(() => {
    let cancelled = false;
    setRecipeName(null);
    setRecipeVersion(null);
    if (!props.enabled || !props.recipeId) return () => {};
    void fetchRecipe().then(() => {});
    return () => {
      cancelled = true;
    };
  }, [props.enabled, props.recipeId, fetchRecipe]);

  return (
    <View>
      <Text fontSize={12} opacity={0.8}>
        {t("recipeId")}: {props.recipeId}
        {recipeName ? ` - ${t("recipeName")}: ${recipeName}` : null}
        {recipeVersion !== null ? ` - ${t("recipeVersion")}: ${String(recipeVersion).padStart(2, "0")}` : null}
      </Text>
    </View>
  );
}
