import { useCallback, useMemo, useState } from "react";

import { getRecipe } from "@umbraculum/api-client/brewery";
import { editorStateFromBeerJson } from "@umbraculum/brewery-beerjson";

import { nativePlatformApiClient } from "../../../../auth/nativeApiClient";

type MashRecipe = {
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
};

export function useNativeWaterMashGrist(params: {
  canCall: boolean;
  recipeId: string;
  baseUrl: string;
  token: string | null;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  recipe: MashRecipe | null;
}) {
  const { canCall, recipeId, baseUrl, token, saveSettings, recipe } = params;

  const [gristImportedRows, setGristImportedRows] = useState<Record<string, unknown>[]>([]);
  const [gristImportError, setGristImportError] = useState<string | null>(null);
  const [gristImportStatus, setGristImportStatus] = useState<string | null>(null);
  const [importingGrist, setImportingGrist] = useState(false);

  const hydrateMashGrist = useCallback((s: Record<string, unknown>) => {
    if (Array.isArray(s["mashGristImportedJson"])) {
      setGristImportedRows(s["mashGristImportedJson"] as Record<string, unknown>[]);
    }
  }, []);

  const onImportGristFromRecipe = async () => {
    if (!canCall || !recipeId) return;
    setGristImportError(null);
    setGristImportStatus(null);
    setImportingGrist(true);
    try {
      const api = nativePlatformApiClient(token!, baseUrl);
      const data = await getRecipe(api, recipeId);
      const r = data.recipe as { beerJsonRecipeJson?: unknown; recipeExtJson?: unknown; updatedAt?: string };
      if (!r?.beerJsonRecipeJson) throw new Error("Recipe is missing BeerJSON");
      const s = editorStateFromBeerJson(r.beerJsonRecipeJson);
      const mashOnlyRows = (s.gristRows as Record<string, unknown>[]).filter(
        (row) =>
          ((row["timingUse"] as string) ?? "add_to_mash") === "add_to_mash" &&
          (row as { lateAddition?: unknown }).lateAddition !== true,
      );
      const nowIso = new Date().toISOString();
      await saveSettings({
        mashGristImportedJson: mashOnlyRows,
        mashGristImportedAt: nowIso,
        mashGristSourceRecipeUpdatedAt: r.updatedAt ?? nowIso,
      });
      setGristImportedRows(mashOnlyRows);
      setGristImportStatus("Imported grist snapshot.");
    } catch (err) {
      setGristImportError(String(err));
    } finally {
      setImportingGrist(false);
    }
  };

  const lateAdditionsTotalKg = useMemo(() => {
    try {
      const doc = recipe?.beerJsonRecipeJson;
      if (!doc) return 0;
      const s = editorStateFromBeerJson(doc);
      type GristShape = { timingUse?: unknown; lateAddition?: unknown; amountKg?: unknown };
      return (s.gristRows as GristShape[]).reduce((sum, r) => {
        if ((r?.timingUse ?? "add_to_mash") !== "add_to_mash") return sum;
        if (r?.lateAddition !== true) return sum;
        const amountKg = typeof r?.amountKg === "number" && Number.isFinite(r.amountKg) ? r.amountKg : 0;
        return sum + amountKg;
      }, 0);
    } catch {
      return 0;
    }
  }, [recipe]);

  return {
    gristImportedRows,
    setGristImportedRows,
    gristImportError,
    setGristImportError,
    gristImportStatus,
    setGristImportStatus,
    importingGrist,
    setImportingGrist,
    hydrateMashGrist,
    onImportGristFromRecipe,
    lateAdditionsTotalKg,
  };
}

export type NativeMashGristBridgeRef = {
  current: {
    gristImportedRows: Record<string, unknown>[];
  };
};
