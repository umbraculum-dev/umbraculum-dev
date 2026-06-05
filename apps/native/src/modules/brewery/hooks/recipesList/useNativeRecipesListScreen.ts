import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

import { listRecipes, listStyles, createRecipe, deleteRecipe } from "@umbraculum/api-client/brewery";
import { type RecipeListItem } from "@umbraculum/contracts";
import { useT } from "@umbraculum/i18n-react";
import { useFocusEffect, useNavigation, type NavigationProp } from "@react-navigation/native";

import { useAuth } from "../../../../auth/AuthProvider";
import { getApiBaseUrl } from "../../../../auth/apiBaseUrl";
import { nativePlatformApiClient } from "../../../../auth/nativeApiClient";
import type { RootStackParamList } from "../../../../navigation/types";
import { buildMinimalBeerJson, type StyleListItem } from "../../lib/recipesListTypes";

export function useNativeRecipesListScreen() {
  const auth = useAuth();
  const { t } = useT("recipes");
  const { t: tCommon } = useT("common");
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newStyleKey, setNewStyleKey] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [styles, setStyles] = useState<StyleListItem[]>([]);
  const [stylesLoading, setStylesLoading] = useState(false);
  const [stylesError, setStylesError] = useState<string | null>(null);
  const [stylePickerOpen, setStylePickerOpen] = useState(false);

  const canCall = auth.state.status === "logged_in" && Boolean(baseUrl) && Boolean(token);

  const api = useMemo(() => {
    if (!baseUrl || !token) return null;
    return nativePlatformApiClient(token);
  }, [baseUrl, token]);

  const loadStyles = useCallback(async () => {
    if (!api) return;
    setStylesError(null);
    setStylesLoading(true);
    try {
      const parsed = await listStyles(api);
      const items = parsed.styles;
      setStyles(Array.isArray(items) ? (items as StyleListItem[]) : []);
    } catch (err) {
      setStyles([]);
      setStylesError(String(err));
    } finally {
      setStylesLoading(false);
    }
  }, [api]);

  const refresh = useCallback(async () => {
    if (!api) return;
    setError(null);
    setLoading(true);
    try {
      const parsed = await listRecipes(api);
      setRecipes(
        parsed.recipes.map((r) => ({
          ...r,
          accountId: r.accountId ?? "",
          style: r.style ?? r.styleKey ?? null,
        })),
      );
      setDeleteConfirmId(null);
    } catch (err) {
      setError(String(err));
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useFocusEffect(
    useCallback(() => {
      if (canCall) {
        void loadStyles();
        void refresh();
      }
    }, [canCall, loadStyles, refresh]),
  );

  const onCreate = useCallback(async () => {
    if (!api) return;
    const name = newName.trim();
    const styleKey = newStyleKey.trim();
    if (!name || !styleKey) return;
    setCreating(true);
    setError(null);
    try {
      await createRecipe(api, {
        name,
        styleKey,
        beerJsonRecipeJson: buildMinimalBeerJson(name),
      });
      setNewName("");
      setNewStyleKey("");
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setCreating(false);
    }
  }, [api, newName, newStyleKey, refresh]);

  const onAskDelete = useCallback((id: string) => {
    setError(null);
    setDeleteConfirmId((cur) => (cur === id ? null : id));
  }, []);

  const onDelete = useCallback(
    async (id: string) => {
      if (!api) return;
      setError(null);
      setDeletingId(id);
      try {
        await deleteRecipe(api, id);
        await refresh();
      } catch (err) {
        setError(String(err));
      } finally {
        setDeletingId(null);
        setDeleteConfirmId(null);
      }
    },
    [api, refresh],
  );

  const onDeleteConfirm = useCallback(
    (id: string) => {
      Alert.alert(t("delete.confirmTitle"), t("delete.confirmBody"), [
        { text: t("delete.cancel"), style: "cancel", onPress: () => setDeleteConfirmId(null) },
        { text: t("delete.confirmCta"), style: "destructive", onPress: () => void onDelete(id) },
      ]);
    },
    [t, onDelete],
  );

  const openEditor = useCallback(
    (recipeId: string) => {
      navigation.navigate("RecipeEdit", { recipeId });
    },
    [navigation],
  );

  const selectedStyleLabel =
    newStyleKey && styles.find((s) => s.key === newStyleKey)
      ? newStyleKey === "custom"
        ? (styles.find((s) => s.key === "custom")?.name ?? "Custom")
        : `${styles.find((s) => s.key === newStyleKey)?.code ?? ""} — ${styles.find((s) => s.key === newStyleKey)?.name ?? newStyleKey}`
      : t("stylePlaceholder");

  return {
    t,
    tCommon,
    baseUrl,
    canCall,
    recipes,
    loading,
    error,
    newName,
    setNewName,
    newStyleKey,
    setNewStyleKey,
    creating,
    deleteConfirmId,
    setDeleteConfirmId,
    deletingId,
    styles,
    stylesLoading,
    stylesError,
    stylePickerOpen,
    setStylePickerOpen,
    onCreate,
    onAskDelete,
    onDeleteConfirm,
    refresh,
    openEditor,
    selectedStyleLabel,
  };
}
