import { useCallback, useState } from "react";

import { searchYeasts as apiSearchYeasts } from "@umbraculum/api-client/brewery";

import type { YeastSearchResult } from "./yeastScreenHelpers";

type ApiClient = Parameters<typeof apiSearchYeasts>[0];

export function useNativeYeastScreenSearch(params: { api: ApiClient | null }) {
  const { api } = params;

  const [yeastQuery, setYeastQuery] = useState("");
  const [yeastResults, setYeastResults] = useState<YeastSearchResult[]>([]);
  const [yeastSearching, setYeastSearching] = useState(false);

  const searchYeasts = useCallback(async () => {
    if (!api) return;
    setYeastSearching(true);
    try {
      const parsed = await apiSearchYeasts(
        api,
        yeastQuery.trim() ? { query: yeastQuery.trim() } : undefined,
      );
      const items = parsed.items;
      setYeastResults(Array.isArray(items) ? (items as YeastSearchResult[]) : []);
    } catch {
      setYeastResults([]);
    } finally {
      setYeastSearching(false);
    }
  }, [api, yeastQuery]);

  const clearSearch = useCallback(() => {
    setYeastQuery("");
    setYeastResults([]);
  }, []);

  return {
    yeastQuery,
    setYeastQuery,
    yeastResults,
    setYeastResults,
    yeastSearching,
    searchYeasts,
    clearSearch,
  };
}
