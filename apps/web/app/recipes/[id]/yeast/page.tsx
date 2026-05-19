"use client";

import { Link } from "../../../../src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { H1, H2, SizableText, View } from "tamagui";
import { SurfaceMathToggleRow } from "../../../_components/SurfaceMathToggleRow";

import { apiFetch } from "../../../_lib/apiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { asRecord } from "../../../_lib/typeGuards";
import {
  buildBeerJsonRecipeDocument,
  buildRecipeExtJsonFromEditorState,
  editorStateFromBeerJson,
  mergeYeastAttenuationRangeFromExt,
  type EditorGristRow,
  type EditorHopRow,
  type EditorMash,
  type EditorMiscRow,
  type EditorYeastRow,
} from "../../_lib/beerjsonRecipe";
import { formatFixed } from "../../../../src/i18n/format";
import { getMediaPublicPath } from "@umbraculum/media";
import { ManualCellCountHelpBox } from "@umbraculum/brewery-recipes-ui";
import { YeastEditor } from "../../_components/YeastEditor";
import { ErrorBox } from "../../../_components/recipe-edit";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";

type Recipe = {
  id: string;
  name?: string;
  styleKey?: string | null;
  notes?: string | null;
  beerJsonRecipeJson?: unknown;
  recipeExtJson?: unknown;
  analysis?: { result?: { ogEstimatedSg?: number; kettleVolumeLiters?: number } } | null;
};

function newRowId(): string {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

export default function YeastPage() {
  const locale = useLocale();
  const t = useTranslations("recipes.edit");
  const tAnalysis = useTranslations("recipes.analysis");
  const tUnits = useTranslations("units");
  const params = useParams<{ id: string }>();
  const recipeId = params?.id ?? "";

  const authState = useRequireAuth({ requireActiveWorkspace: true });

  const loadRecipeMeta = useCallback(async (id: string) => {
    const res = await apiFetch(`/api/recipes/${id}`);
    if (!res.ok) return null;
    return parseRecipeMetaFromGetRecipeResponse(res.data);
  }, []);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [yeastRows, setYeastRows] = useState<EditorYeastRow[]>([]);
  const [yeastAttenuationOverrides, setYeastAttenuationOverrides] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lowViabilityWarning, setLowViabilityWarning] = useState<number | null>(null);

  const [gristRows, setGristRows] = useState<EditorGristRow[]>([]);
  const [hopsRows, setHopsRows] = useState<EditorHopRow[]>([]);
  const [miscRows, setMiscRows] = useState<EditorMiscRow[]>([]);
  const [mash, setMash] = useState<EditorMash | null>(null);

  const [surfaceMath, setSurfaceMath] = useState(false);
  useEffect(() => {
    try {
      const v = sessionStorage.getItem("brewery:surfaceMath:yeast");
      if (v === "1") setSurfaceMath(true);
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem("brewery:surfaceMath:yeast", surfaceMath ? "1" : "0");
    } catch {
      // ignore
    }
  }, [surfaceMath]);

  const canCallAccountScoped = authState.status === "ready" && Boolean(recipeId);

  useEffect(() => {
    if (!canCallAccountScoped || !recipeId) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await apiFetch(`/api/recipes/${recipeId}`);
        if (!res.ok) throw new Error(JSON.stringify(res.data));
        const r = (res.data as { recipe: Recipe }).recipe;
        if (cancelled) return;
        setRecipe(r);

        const extRec = asRecord(r.recipeExtJson);
        const linksRec = asRecord(extRec?.['ingredientLinks']);
        const yeastOverridesRaw = asRecord(extRec?.['yeastAttenuationOverridesPercent']);
        if (yeastOverridesRaw) {
          const out: Record<string, string> = {};
          for (const [k, v] of Object.entries(yeastOverridesRaw)) {
            if (typeof k !== "string") continue;
            if (typeof v !== "number" || !Number.isFinite(v)) continue;
            out[k] = String(v);
          }
          setYeastAttenuationOverrides(out);
        } else {
          setYeastAttenuationOverrides({});
        }

        const yeastPitchRateRaw = asRecord(extRec?.['yeastPitchRateOverrides']);
        const yeastFermentationTempRaw = asRecord(extRec?.['yeastFermentationTempOverrides']);
        const yeastOxygenationRaw = asRecord(extRec?.['yeastOxygenationOverrides']);
        const yeastDiacetylRestRaw = asRecord(extRec?.['yeastDiacetylRestOverrides']);
        const yeastFormatRaw = asRecord(extRec?.['yeastFormatOverrides'] ?? extRec?.['yeastTypeOverrides']);
        const yeastSpeciesRaw = asRecord(extRec?.['yeastSpeciesOverrides']);
        const yeastNeedsPropagationRaw = asRecord(extRec?.['yeastNeedsPropagationOverrides']);
        const yeastCellsPerLRaw = asRecord(extRec?.['yeastCellsPerLOverrides']);
        const yeastCellsPerKGRaw = asRecord(extRec?.['yeastCellsPerKGOverrides']);
        const yeastCellsPerGRaw = asRecord(extRec?.['yeastCellsPerGOverrides']);
        const yeastManualCellCountRaw = asRecord(extRec?.['yeastManualCellCountOverrides']);

        if (!r.beerJsonRecipeJson) {
          throw new Error("Recipe is missing BeerJSON (beerJsonRecipeJson)");
        }
        const s = editorStateFromBeerJson(r.beerJsonRecipeJson);
        const hopsLinks = asRecord(linksRec?.['hops']);
        const yeastLinks = asRecord(linksRec?.['yeast']);
        setGristRows(s.gristRows);
        setHopsRows(
          s.hopsRows.map((row) => ({
            ...row,
            ingredientId: typeof hopsLinks?.[row.id] === "string" ? (hopsLinks[row.id] as string) : null,
          })),
        );
        const baseYeast = mergeYeastAttenuationRangeFromExt(s.yeastRows, r.recipeExtJson);
        setYeastRows(
          baseYeast.map((row) => {
            const pitchRate =
              yeastPitchRateRaw && typeof yeastPitchRateRaw[row.id] === "string"
                ? (yeastPitchRateRaw[row.id] as string)
                : null;
            const fermentationTempC =
              yeastFermentationTempRaw &&
              typeof yeastFermentationTempRaw[row.id] === "number" &&
              Number.isFinite(yeastFermentationTempRaw[row.id])
                ? (yeastFermentationTempRaw[row.id] as number)
                : null;
            const oxygenation =
              yeastOxygenationRaw &&
              (yeastOxygenationRaw[row.id] === "yes" || yeastOxygenationRaw[row.id] === "no")
                ? (yeastOxygenationRaw[row.id] as "yes" | "no")
                : null;
            const diacetylRest =
              yeastDiacetylRestRaw &&
              (yeastDiacetylRestRaw[row.id] === "yes" || yeastDiacetylRestRaw[row.id] === "no")
                ? (yeastDiacetylRestRaw[row.id] as "yes" | "no")
                : null;
            const format =
              yeastFormatRaw &&
              (yeastFormatRaw[row.id] === "dry" || yeastFormatRaw[row.id] === "liquid" || yeastFormatRaw[row.id] === "slurry")
                ? (yeastFormatRaw[row.id] as "dry" | "liquid" | "slurry")
                : null;
            const speciesRaw = yeastSpeciesRaw ? yeastSpeciesRaw[row.id] : null;
            const validSpecies = [
              "saccharomyces_cerevisiae",
              "saccharomyces_pastorianus",
              "brettanomyces",
              "diastaticus",
              "other",
            ] as const;
            const species =
              typeof speciesRaw === "string" && (validSpecies as ReadonlyArray<string>).includes(speciesRaw)
                ? (speciesRaw as (typeof validSpecies)[number])
                : null;
            const needsPropagation =
              yeastNeedsPropagationRaw &&
              (yeastNeedsPropagationRaw[row.id] === "yes" || yeastNeedsPropagationRaw[row.id] === "no")
                ? (yeastNeedsPropagationRaw[row.id] as "yes" | "no")
                : null;
            const cellsPerLOverride =
              yeastCellsPerLRaw &&
              typeof yeastCellsPerLRaw[row.id] === "number" &&
              Number.isFinite(yeastCellsPerLRaw[row.id]) &&
              (yeastCellsPerLRaw[row.id] as number) > 0
                ? (yeastCellsPerLRaw[row.id] as number)
                : null;
            const cellsPerKGFromKG =
              yeastCellsPerKGRaw &&
              typeof yeastCellsPerKGRaw[row.id] === "number" &&
              Number.isFinite(yeastCellsPerKGRaw[row.id]) &&
              (yeastCellsPerKGRaw[row.id] as number) > 0
                ? (yeastCellsPerKGRaw[row.id] as number)
                : null;
            const cellsPerKGFromG =
              yeastCellsPerGRaw &&
              typeof yeastCellsPerGRaw[row.id] === "number" &&
              Number.isFinite(yeastCellsPerGRaw[row.id]) &&
              (yeastCellsPerGRaw[row.id] as number) > 0
                ? (yeastCellsPerGRaw[row.id] as number) * 1000
                : null;
            const cellsPerKGOverride = cellsPerKGFromKG ?? cellsPerKGFromG ?? null;
            const manualRaw =
              yeastManualCellCountRaw &&
              asRecord(yeastManualCellCountRaw[row.id])
                ? (yeastManualCellCountRaw[row.id] as { dilutionFactor?: number; aliveCells?: number; totalCells?: number })
                : null;
            const dilutionFactor =
              manualRaw?.dilutionFactor === 200 || manualRaw?.dilutionFactor === 2000
                ? (manualRaw.dilutionFactor)
                : undefined;
            const aliveCells =
              typeof manualRaw?.aliveCells === "number" && Number.isFinite(manualRaw.aliveCells) && manualRaw.aliveCells > 0
                ? manualRaw.aliveCells
                : undefined;
            const totalCells =
              typeof manualRaw?.totalCells === "number" && Number.isFinite(manualRaw.totalCells) && manualRaw.totalCells > 0
                ? manualRaw.totalCells
                : undefined;
            const manualCellCount =
              dilutionFactor != null && aliveCells != null && totalCells != null
                ? { dilutionFactor, aliveCells, totalCells }
                : undefined;
            return {
              ...row,
              ingredientId: typeof yeastLinks?.[row.id] === "string" ? (yeastLinks[row.id] as string) : null,
              pitchRate: pitchRate ?? undefined,
              fermentationTempC: fermentationTempC ?? undefined,
              oxygenation: oxygenation ?? undefined,
              diacetylRest: diacetylRest ?? undefined,
              format: format ?? undefined,
              species: species ?? undefined,
              needsPropagation: needsPropagation ?? undefined,
              cellsPerLOverride: cellsPerLOverride ?? undefined,
              cellsPerKGOverride: cellsPerKGOverride ?? undefined,
              manualCellCount: manualCellCount ?? undefined,
            };
          }) as EditorYeastRow[],
        );
        setMiscRows(s.miscRows);
        setMash(s.mash);
      } catch (err) {
        if (!cancelled) setLoadError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canCallAccountScoped, recipeId]);

  const addYeastRow = (row?: Partial<EditorYeastRow>) => {
    setYeastRows((prev) => [
      ...prev,
      {
        id: newRowId(),
        ingredientId: null,
        name: "",
        lab: null,
        productId: null,
        attenuationMin: null,
        attenuationMax: null,
        ...row,
      },
    ]);
  };

  const removeYeastRow = (id: string) => {
    setYeastRows((prev) => prev.filter((r) => r.id !== id));
    setYeastAttenuationOverrides((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const yeastPitchRateOverrides = Object.fromEntries(
    yeastRows
      .filter((r) => r.pitchRate != null && String(r.pitchRate).trim())
      .map((r) => [r.id, String(r.pitchRate).trim()]),
  );
  const yeastFermentationTempOverrides = Object.fromEntries(
    yeastRows
      .filter(
        (r) =>
          r.fermentationTempC != null && Number.isFinite(r.fermentationTempC) && r.fermentationTempC >= -10 && r.fermentationTempC <= 50,
      )
      .map((r) => [r.id, r.fermentationTempC as number]),
  );
  const yeastOxygenationOverrides = Object.fromEntries(
    yeastRows
      .filter((r) => r.oxygenation === "yes" || r.oxygenation === "no")
      .map((r) => [r.id, r.oxygenation as "yes" | "no"]),
  );
  const yeastDiacetylRestOverrides = Object.fromEntries(
    yeastRows
      .filter((r) => r.diacetylRest === "yes" || r.diacetylRest === "no")
      .map((r) => [r.id, r.diacetylRest as "yes" | "no"]),
  );
  const yeastFormatOverrides = Object.fromEntries(
    yeastRows
      .filter((r) => r.format === "dry" || r.format === "liquid" || r.format === "slurry")
      .map((r) => [r.id, r.format as "dry" | "liquid" | "slurry"]),
  );
  const yeastSpeciesOverrides = Object.fromEntries(
    yeastRows
      .filter(
        (r) =>
          r.species === "saccharomyces_cerevisiae" ||
          r.species === "saccharomyces_pastorianus" ||
          r.species === "brettanomyces" ||
          r.species === "diastaticus" ||
          r.species === "other",
      )
      .map((r) => [r.id, r.species!]),
  );
  const yeastNeedsPropagationOverrides = Object.fromEntries(
    yeastRows
      .filter((r) => r.needsPropagation === "yes" || r.needsPropagation === "no")
      .map((r) => [r.id, r.needsPropagation as "yes" | "no"]),
  );
  const yeastCellsPerLOverrides = Object.fromEntries(
    yeastRows
      .filter(
        (r) =>
          r.cellsPerLOverride != null && Number.isFinite(r.cellsPerLOverride) && r.cellsPerLOverride > 0,
      )
      .map((r) => [r.id, r.cellsPerLOverride as number]),
  );
  const yeastCellsPerKGOverrides = Object.fromEntries(
    yeastRows
      .filter(
        (r) =>
          r.cellsPerKGOverride != null && Number.isFinite(r.cellsPerKGOverride) && r.cellsPerKGOverride > 0,
      )
      .map((r) => [r.id, r.cellsPerKGOverride as number]),
  );
  const yeastManualCellCountOverrides = Object.fromEntries(
    yeastRows
      .filter(
        (r) =>
          r.manualCellCount != null &&
          (r.manualCellCount.dilutionFactor === 200 || r.manualCellCount.dilutionFactor === 2000) &&
          Number.isFinite(r.manualCellCount.aliveCells) &&
          r.manualCellCount.aliveCells > 0 &&
          Number.isFinite(r.manualCellCount.totalCells) &&
          r.manualCellCount.totalCells > 0 &&
          r.manualCellCount.aliveCells <= r.manualCellCount.totalCells,
      )
      .map((r) => [
        r.id,
        {
          dilutionFactor: r.manualCellCount!.dilutionFactor,
          aliveCells: r.manualCellCount!.aliveCells,
          totalCells: r.manualCellCount!.totalCells,
        },
      ]),
  );

  const updateYeastRow = (id: string, patch: Partial<EditorYeastRow>) =>
    setYeastRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const onAttenuationOverrideChange = (id: string, value: string) =>
    setYeastAttenuationOverrides((prev) => ({ ...prev, [id]: value }));

  const onSave = async () => {
    if (!recipeId || !recipe) return;
    setSaving(true);
    setSaveError(null);
    setSaveStatus(null);
    setLowViabilityWarning(null);
    try {
      const extBaseRec = asRecord(recipe.recipeExtJson);
      const extBaseForSave: Record<string, unknown> = extBaseRec ? { ...extBaseRec } : {};

      const yeastAttenuationOverridesPercent = Object.fromEntries(
        Object.entries(yeastAttenuationOverrides)
          .map(([k, v]) => {
            const trimmed = v.trim();
            if (!trimmed) return null;
            const n = Number(trimmed);
            if (!Number.isFinite(n)) return null;
            return [k, n] as const;
          })
          .filter(Boolean) as Array<readonly [string, number]>,
      );
      if (Object.keys(yeastAttenuationOverridesPercent).length) {
        extBaseForSave['yeastAttenuationOverridesPercent'] = yeastAttenuationOverridesPercent;
      } else {
        delete extBaseForSave['yeastAttenuationOverridesPercent'];
      }
      if (Object.keys(yeastPitchRateOverrides).length) {
        extBaseForSave['yeastPitchRateOverrides'] = yeastPitchRateOverrides;
      } else {
        delete extBaseForSave['yeastPitchRateOverrides'];
      }
      if (Object.keys(yeastFermentationTempOverrides).length) {
        extBaseForSave['yeastFermentationTempOverrides'] = yeastFermentationTempOverrides;
      } else {
        delete extBaseForSave['yeastFermentationTempOverrides'];
      }
      if (Object.keys(yeastOxygenationOverrides).length) {
        extBaseForSave['yeastOxygenationOverrides'] = yeastOxygenationOverrides;
      } else {
        delete extBaseForSave['yeastOxygenationOverrides'];
      }
      if (Object.keys(yeastDiacetylRestOverrides).length) {
        extBaseForSave['yeastDiacetylRestOverrides'] = yeastDiacetylRestOverrides;
      } else {
        delete extBaseForSave['yeastDiacetylRestOverrides'];
      }
      if (Object.keys(yeastFormatOverrides).length) {
        extBaseForSave['yeastFormatOverrides'] = yeastFormatOverrides;
      } else {
        delete extBaseForSave['yeastFormatOverrides'];
      }
      delete extBaseForSave['yeastTypeOverrides'];
      if (Object.keys(yeastSpeciesOverrides).length) {
        extBaseForSave['yeastSpeciesOverrides'] = yeastSpeciesOverrides;
      } else {
        delete extBaseForSave['yeastSpeciesOverrides'];
      }
      if (Object.keys(yeastNeedsPropagationOverrides).length) {
        extBaseForSave['yeastNeedsPropagationOverrides'] = yeastNeedsPropagationOverrides;
      } else {
        delete extBaseForSave['yeastNeedsPropagationOverrides'];
      }
      if (Object.keys(yeastCellsPerLOverrides).length) {
        extBaseForSave['yeastCellsPerLOverrides'] = yeastCellsPerLOverrides;
      } else {
        delete extBaseForSave['yeastCellsPerLOverrides'];
      }
      if (Object.keys(yeastCellsPerKGOverrides).length) {
        extBaseForSave['yeastCellsPerKGOverrides'] = yeastCellsPerKGOverrides;
      } else {
        delete extBaseForSave['yeastCellsPerKGOverrides'];
      }
      if (Object.keys(yeastManualCellCountOverrides).length) {
        extBaseForSave['yeastManualCellCountOverrides'] = yeastManualCellCountOverrides;
      } else {
        delete extBaseForSave['yeastManualCellCountOverrides'];
      }
      delete extBaseForSave['yeastCellsPerGOverrides'];

      const batchSizeLiters =
        typeof extBaseForSave['batchSizeLiters'] === "number" ? extBaseForSave['batchSizeLiters'] : null;
      const brewhouseEfficiencyPercent =
        typeof extBaseForSave['brewhouseEfficiencyPercent'] === "number" ? extBaseForSave['brewhouseEfficiencyPercent'] : null;

      const beerJsonRecipeJson = buildBeerJsonRecipeDocument({
        name: recipe.name ?? "",
        notes: recipe.notes || null,
        gristRows,
        hopsRows,
        yeastRows,
        miscRows,
        mash: mash ?? undefined,
        batchSizeLiters,
        brewhouseEfficiencyPercent,
      });

      const recipeExtJson = buildRecipeExtJsonFromEditorState({
        gristRows,
        hopsRows,
        yeastRows,
        miscRows,
        extBase: extBaseForSave,
      });

      const res = await apiFetch(`/api/recipes/${recipeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: recipe.name,
          styleKey: recipe.styleKey,
          notes: recipe.notes ?? null,
          beerJsonRecipeJson,
          recipeExtJson,
        }),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));

      const reload = await apiFetch(`/api/recipes/${recipeId}`);
      if (!reload.ok) throw new Error(JSON.stringify(reload.data));
      const r = (reload.data as { recipe: Recipe }).recipe;
      setRecipe(r);
      setSaveStatus(t("status.saved"));
      let minViability: number | null = null;
      for (const row of yeastRows) {
        if (
          row.format === "slurry" &&
          row.manualCellCount &&
          row.manualCellCount.totalCells > 0 &&
          Number.isFinite(row.manualCellCount.aliveCells)
        ) {
          const v =
            (row.manualCellCount.aliveCells / row.manualCellCount.totalCells) * 100;
          if (v < 85 && (minViability == null || v < minViability)) minViability = v;
        }
      }
      if (minViability != null) setLowViabilityWarning(minViability);
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <H1 mb="$2">{t("yeastPageTitle")}</H1>
      <RecipeMetaLine
        recipeId={recipeId}
        enabled={authState.status === "ready"}
        loadRecipeMeta={loadRecipeMeta}
      />
      <SurfaceMathToggleRow
        left={
          <SizableText size="$2" fontFamily="$body" mt={0}>
            <Link href={`/recipes/${recipeId}/edit#yeast`}>{t("yeastBackToRecipe")}</Link>
          </SizableText>
        }
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mb="$2"
      />

      {authState.status === "error" ? (
        <ErrorBox>{authState.error}</ErrorBox>
      ) : null}
      {authState.status === "ready" && !canCallAccountScoped ? (
        <ErrorBox>{t("notReadyToLoad")}</ErrorBox>
      ) : null}

      {loading ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}
      {loadError ? (
        <ErrorBox aria-live="polite">{loadError}</ErrorBox>
      ) : null}

      {!loading && !loadError && recipe ? (
          <View className="brew-panel" mt="$3" aria-labelledby="yeast-section-heading">
            <H2 id="yeast-section-heading" mt={0} size="$5" fontFamily="$heading" color="var(--text)">
              {t("yeastSectionHeading")}
            </H2>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb="$3">
            {t("yeastHelp")}
          </SizableText>
          <YeastEditor
            yeastRows={yeastRows}
            yeastAttenuationOverrides={yeastAttenuationOverrides}
            analysis={recipe?.analysis ?? null}
            recipeExtJson={recipe?.recipeExtJson ?? null}
            surfaceMath={surfaceMath}
            readOnly={false}
            recipeId={recipeId}
            onAddRow={addYeastRow}
            onRemoveRow={removeYeastRow}
            onUpdateRow={updateYeastRow}
            onAttenuationOverrideChange={onAttenuationOverrideChange}
            onSave={() => { void onSave(); }}
            canSave={canCallAccountScoped}
            saving={saving}
            saveStatus={saveStatus}
            onDismissSaveStatus={() => setSaveStatus(null)}
            canCallAccountScoped={canCallAccountScoped}
            t={t}
            tAnalysis={tAnalysis}
            tUnits={tUnits}
            locale={locale}
            formatFixed={formatFixed}
            lowViabilityWarning={lowViabilityWarning}
          />
          <ManualCellCountHelpBox
            renderImage={({ assetKey, alt, width, height: _height }) => (
              <img
                src={getMediaPublicPath(assetKey)}
                alt={alt}
                loading="lazy"
                style={{ maxWidth: width, width: "100%", height: "auto" }}
              />
            )}
          />
          {saveError ? (
            <ErrorBox mt="$3">{saveError}</ErrorBox>
          ) : null}
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
            {t("rawMaterialsCtaPrefix")}{" "}
            <Link href="/contributing?topic=raw-materials">{t("rawMaterialsCtaLinkText")}</Link>.
          </SizableText>
          </View>
      ) : null}
    </>
  );
}
