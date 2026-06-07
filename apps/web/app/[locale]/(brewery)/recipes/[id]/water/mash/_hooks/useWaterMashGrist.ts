"use client";

import { useCallback, useMemo, useState } from "react";

import { getRecipe } from "@umbraculum/api-client/brewery";

import { parseGristJson, type GristRow } from "../../../../../_lib/grist";
import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../../../../_shared-layout/_lib/typeGuards";
import { editorStateFromBeerJson } from "../../../../_lib/beerjsonRecipe";
import type { RecipeWaterSettings } from "../../_lib/waterSettings";

type MashRecipe = {
  beerJsonRecipeJson?: unknown;
  updatedAt: string;
};

export function useWaterMashGrist(params: {
  canCall: boolean;
  recipeId: string;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  recipe: MashRecipe | null;
}) {
  const { canCall, recipeId, saveSettings, recipe } = params;

  const [gristImportedRows, setGristImportedRows] = useState<GristRow[]>([]);
  const [gristImportedAt, setGristImportedAt] = useState<string | null>(null);
  const [gristSourceRecipeUpdatedAt, setGristSourceRecipeUpdatedAt] = useState<string | null>(null);
  const [gristImportStatus, setGristImportStatus] = useState<string | null>(null);
  const [gristImportError, setGristImportError] = useState<string | null>(null);
  const [importingGrist, setImportingGrist] = useState(false);

  const hydrateMashGrist = useCallback((s: RecipeWaterSettings) => {
    if (s.mashGristImportedJson !== undefined) setGristImportedRows(parseGristJson(s.mashGristImportedJson));
    if (s.mashGristImportedAt) setGristImportedAt(s.mashGristImportedAt);
    if (s.mashGristSourceRecipeUpdatedAt) setGristSourceRecipeUpdatedAt(s.mashGristSourceRecipeUpdatedAt);
  }, []);

  const onImportGristFromRecipe = async () => {
    if (!canCall || !recipeId) return;
    setGristImportError(null);
    setGristImportStatus(null);
    setImportingGrist(true);
    try {
      const data = await getRecipe(webBreweryApiClient(), recipeId);
      const extRec = asRecord(data.recipe.recipeExtJson);
      const mashPhModelRec = asRecord(extRec?.["mashPhModel"]);

      let rows: GristRow[] = [];
      if (!data.recipe.beerJsonRecipeJson) {
        throw new Error("Recipe is missing BeerJSON (beerJsonRecipeJson)");
      }
      const s = editorStateFromBeerJson(data.recipe.beerJsonRecipeJson);
      const mashOnlyRows = s.gristRows.filter(
        (r) => (r.timingUse ?? "add_to_mash") === "add_to_mash" && r.lateAddition !== true,
      );
      rows = mashOnlyRows.map((r) => {
        const m = r.id && mashPhModelRec ? asRecord(mashPhModelRec[r.id]) : null;
        return {
          ...r,
          mashDiPh: typeof m?.["mashDiPh"] === "number" ? m["mashDiPh"] : (r.mashDiPh ?? null),
          mashTaToPh57_mEqPerKg:
            typeof m?.["mashTaToPh57_mEqPerKg"] === "number"
              ? m["mashTaToPh57_mEqPerKg"]
              : (r.mashTaToPh57_mEqPerKg ?? null),
          mashRoastDehuskedOverride:
            m && "roastDehuskedOverride" in m
              ? ((m["roastDehuskedOverride"] as boolean | null | undefined) ?? null)
              : (r.mashRoastDehuskedOverride ?? null),
        };
      });
      const nowIso = new Date().toISOString();
      await saveSettings({
        mashGristImportedJson: rows,
        mashGristImportedAt: nowIso,
        mashGristSourceRecipeUpdatedAt: data.recipe.updatedAt,
      });
      setGristImportedRows(rows);
      setGristImportedAt(nowIso);
      setGristSourceRecipeUpdatedAt(data.recipe.updatedAt);
      setGristImportStatus("Imported grist snapshot.");
    } catch (err) {
      setGristImportError(String(err));
    } finally {
      setImportingGrist(false);
    }
  };

  const gristTotalKg = useMemo(
    () => gristImportedRows.reduce((sum, r) => sum + (Number.isFinite(r.amountKg) ? r.amountKg : 0), 0),
    [gristImportedRows],
  );

  const lateAdditionsTotalKg = useMemo(() => {
    try {
      const doc = recipe?.beerJsonRecipeJson;
      if (!doc) return 0;
      const s = editorStateFromBeerJson(doc);
      return s.gristRows.reduce((sum, r) => {
        if ((r.timingUse ?? "add_to_mash") !== "add_to_mash") return sum;
        if (r.lateAddition !== true) return sum;
        const amountKg = typeof r.amountKg === "number" && Number.isFinite(r.amountKg) ? r.amountKg : 0;
        return sum + amountKg;
      }, 0);
    } catch {
      return 0;
    }
  }, [recipe]);

  return {
    gristImportedRows,
    setGristImportedRows,
    gristImportedAt,
    setGristImportedAt,
    gristSourceRecipeUpdatedAt,
    setGristSourceRecipeUpdatedAt,
    gristImportStatus,
    setGristImportStatus,
    gristImportError,
    setGristImportError,
    importingGrist,
    setImportingGrist,
    hydrateMashGrist,
    onImportGristFromRecipe,
    gristTotalKg,
    lateAdditionsTotalKg,
  };
}
