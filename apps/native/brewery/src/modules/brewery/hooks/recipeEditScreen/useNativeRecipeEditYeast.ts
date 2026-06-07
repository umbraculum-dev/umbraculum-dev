import { useCallback, useState } from "react";

import { searchYeasts as apiSearchYeasts } from "@umbraculum/brewery-api-client";
import type { EditorYeastRow } from "@umbraculum/brewery-beerjson";

import { formatFixed, newRowId } from "../../lib/recipeEditHelpers";
import type { YeastSearchItem } from "../../lib/recipeEditTypes";

type ApiClient = Parameters<typeof apiSearchYeasts>[0];

export function useNativeRecipeEditYeast(params: { api: ApiClient | null; locale: string }) {
  const { api, locale } = params;

  const [yeastRows, setYeastRows] = useState<EditorYeastRow[]>([]);
  const [yeastAttenuationOverrides, setYeastAttenuationOverrides] = useState<Record<string, string>>({});

  const [yeastQuery, _setYeastQuery] = useState("");
  const [_yeastResults, setYeastResults] = useState<YeastSearchItem[]>([]);
  const [_yeastSearching, setYeastSearching] = useState(false);
  const [_yeastAmountTextById, setYeastAmountTextById] = useState<Record<string, string>>({});

  const hydrateYeastAmountText = useCallback(
    (rows: EditorYeastRow[]) => {
      setYeastAmountTextById(() => {
        const next: Record<string, string> = {};
        for (const y of rows) {
          if (y.format === "dry") {
            const v = y.amountKg;
            if (typeof v === "number" && Number.isFinite(v)) next[y.id] = formatFixed(locale, v, 3);
          } else {
            const v = y.amountL;
            if (typeof v === "number" && Number.isFinite(v)) next[y.id] = formatFixed(locale, v, 2);
          }
        }
        return next;
      });
    },
    [locale],
  );

  const _searchYeasts = useCallback(async () => {
    if (!api) return;
    setYeastSearching(true);
    try {
      const parsed = await apiSearchYeasts(api, yeastQuery.trim() ? { query: yeastQuery.trim() } : undefined);
      const items = parsed.items;
      setYeastResults(Array.isArray(items) ? (items as YeastSearchItem[]) : []);
    } catch {
      setYeastResults([]);
    } finally {
      setYeastSearching(false);
    }
  }, [api, yeastQuery]);

  const _addYeastRow = useCallback(() => {
    setYeastRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: null,
        name: "",
        amountL: null,
        amountKg: null,
        format: "liquid",
      },
    ]);
  }, []);

  const _addYeastFromDb = useCallback((item: YeastSearchItem) => {
    const attenuationMin =
      typeof item.attenuationMin === "number" && Number.isFinite(item.attenuationMin) ? item.attenuationMin : null;
    const attenuationMax =
      typeof item.attenuationMax === "number" && Number.isFinite(item.attenuationMax) ? item.attenuationMax : null;
    setYeastRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: item.id,
        name: item.name,
        lab: item.lab ?? null,
        attenuationMin: attenuationMin ?? attenuationMax,
        attenuationMax: attenuationMax ?? attenuationMin,
        amountL: null,
        amountKg: null,
        format: "liquid",
      },
    ]);
  }, []);

  const _updateYeastRow = useCallback((id: string, patch: Partial<EditorYeastRow>) => {
    setYeastRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const _removeYeastRow = useCallback((id: string) => {
    setYeastRows((prev) => prev.filter((r) => r.id !== id));
    setYeastAttenuationOverrides((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  return {
    yeastRows,
    setYeastRows,
    yeastAttenuationOverrides,
    setYeastAttenuationOverrides,
    hydrateYeastAmountText,
    _searchYeasts,
    _addYeastRow,
    _addYeastFromDb,
    _updateYeastRow,
    _removeYeastRow,
  };
}
