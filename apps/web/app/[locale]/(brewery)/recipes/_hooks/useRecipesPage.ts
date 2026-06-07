"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { createRecipe, deleteRecipe, listRecipes, listStyles } from "@umbraculum/brewery-api-client";

import { webBreweryApiClient } from "../../_lib/breweryWaterClient";
import { useRequireAuth } from "../../../../_shared-layout/_lib/useRequireAuth";
import type { RecipeListItem, StyleListItem } from "../_lib/recipesPageTypes";

export function useRecipesPage() {
  const t = useTranslations("recipes");
  const tImport = useTranslations("recipes.import");

  const authState = useRequireAuth({ requireActiveWorkspace: true });

  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [exportRecipeId, setExportRecipeId] = useState("");

  const pageSize = 20;
  const [page, setPage] = useState(1);

  const [newName, setNewName] = useState("");
  const [newStyleKey, setNewStyleKey] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [openSections, setOpenSections] = useState<string[]>([]);

  const canCall = authState.status === "ready";

  const [styles, setStyles] = useState<StyleListItem[]>([]);
  const [stylesLoading, setStylesLoading] = useState(false);
  const [stylesError, setStylesError] = useState<string | null>(null);

  const loadStyles = async () => {
    if (!canCall) return;
    setStylesError(null);
    setStylesLoading(true);
    try {
      const data = await listStyles(webBreweryApiClient());
      setStyles(data.styles as StyleListItem[]);
    } catch (err) {
      setStyles([]);
      setStylesError(String(err));
    } finally {
      setStylesLoading(false);
    }
  };

  const refresh = async () => {
    if (!canCall) return;
    setError(null);
    setLoading(true);
    try {
      const data = await listRecipes(webBreweryApiClient());
      setRecipes(data.recipes as RecipeListItem[]);
      setDeleteConfirmId(null);
    } catch (err) {
      setError(String(err));
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStyles();
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status]);

  useEffect(() => {
    if (exportRecipeId) return;
    if (recipes.length === 0) return;
    setExportRecipeId(recipes[0]?.id ?? "");
  }, [exportRecipeId, recipes]);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(recipes.length / pageSize)), [pageSize, recipes.length]);

  useEffect(() => {
    if (page < 1) return setPage(1);
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCall) return;
    const name = newName.trim();
    const styleKey = newStyleKey.trim();
    if (!name || !styleKey) return;
    setCreating(true);
    setError(null);
    try {
      await createRecipe(webBreweryApiClient(), { name, styleKey });
      setNewName("");
      setNewStyleKey("");
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setCreating(false);
    }
  };

  const onAskDelete = (id: string) => {
    setError(null);
    setDeleteConfirmId((cur) => (cur === id ? null : id));
  };

  const onDelete = async (id: string) => {
    if (!canCall) return;
    setError(null);
    setDeletingId(id);
    try {
      await deleteRecipe(webBreweryApiClient(), id);
      await refresh();
      if (exportRecipeId === id) setExportRecipeId("");
    } catch (err) {
      setError(String(err));
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  const hasRecipes = useMemo(() => recipes.length > 0, [recipes.length]);
  const pageRecipes = useMemo(() => recipes.slice((page - 1) * pageSize, page * pageSize), [page, pageSize, recipes]);

  return {
    t,
    tImport,
    recipes,
    loading,
    error,
    exportRecipeId,
    setExportRecipeId,
    page,
    setPage,
    pageSize,
    pageCount,
    newName,
    setNewName,
    newStyleKey,
    setNewStyleKey,
    creating,
    deleteConfirmId,
    setDeleteConfirmId,
    deletingId,
    openSections,
    setOpenSections,
    canCall,
    styles,
    stylesLoading,
    stylesError,
    onCreate,
    onAskDelete,
    onDelete,
    refresh,
    hasRecipes,
    pageRecipes,
  };
}
