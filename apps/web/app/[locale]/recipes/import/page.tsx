"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Link } from "../../../../src/i18n/navigation";
import { apiFetch } from "../../../_lib/apiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { ImportExportPanel } from "../../../_components/ImportExportPanel";

type ImportFormat = "beerjson" | "beerxml";

type StyleListItem = { key: string; name: string; code: string; sortOrder: number };

type ImportWarning = { code?: unknown; message?: unknown };

export default function RecipesImportPage() {
  const t = useTranslations("recipes.import");
  const c = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const authState = useRequireAuth({ requireActiveAccount: true });
  const canCall = authState.status === "ready";

  const [fileName, setFileName] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const [formatOverride, setFormatOverride] = useState<"" | ImportFormat>("");
  const formatAuto = useMemo<ImportFormat | null>(() => {
    const n = fileName.toLowerCase().trim();
    if (n.endsWith(".xml")) return "beerxml";
    if (n.endsWith(".json")) return "beerjson";
    return null;
  }, [fileName]);
  const format: ImportFormat | null = formatOverride || formatAuto;

  const [styles, setStyles] = useState<StyleListItem[]>([]);
  const [stylesLoading, setStylesLoading] = useState(false);
  const [stylesError, setStylesError] = useState<string | null>(null);
  const [styleKey, setStyleKey] = useState("custom");

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ name: string; notes: string | null; warnings: ImportWarning[] } | null>(null);

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [bulkFileName, setBulkFileName] = useState<string>("");
  const [bulkContent, setBulkContent] = useState<string>("");
  const [bulkFormatOverride, setBulkFormatOverride] = useState<"" | ImportFormat>("");
  const bulkFormatAuto = useMemo<ImportFormat | null>(() => {
    const n = bulkFileName.toLowerCase().trim();
    if (n.endsWith(".xml")) return "beerxml";
    if (n.endsWith(".json")) return "beerjson";
    return null;
  }, [bulkFileName]);
  const bulkFormat: ImportFormat | null = bulkFormatOverride || bulkFormatAuto;

  const [bulkPreviewLoading, setBulkPreviewLoading] = useState(false);
  const [bulkPreviewError, setBulkPreviewError] = useState<string | null>(null);
  const [bulkPreviewItems, setBulkPreviewItems] = useState<any[] | null>(null);

  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkImportError, setBulkImportError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<{ created: any[]; failed: any[] } | null>(null);

  useEffect(() => {
    if (!canCall) return;
    let cancelled = false;
    (async () => {
      setStylesError(null);
      setStylesLoading(true);
      try {
        const res = await apiFetch("/api/styles");
        if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
        const items = (res.data as any)?.styles;
        if (!cancelled) setStyles(Array.isArray(items) ? (items as StyleListItem[]) : []);
      } catch (err) {
        if (!cancelled) {
          setStyles([]);
          setStylesError(String(err));
        }
      } finally {
        if (!cancelled) setStylesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canCall]);

  const onPickFile = async (f: File | null) => {
    setPreview(null);
    setPreviewError(null);
    setImportError(null);
    setContent("");
    setFileName("");
    setFormatOverride("");

    if (!f) return;
    setFileName(f.name || "");

    try {
      const txt = await f.text();
      setContent(txt);
    } catch (err) {
      setPreviewError(String(err));
    }
  };

  const onPickBulkFile = async (f: File | null) => {
    setBulkPreviewItems(null);
    setBulkPreviewError(null);
    setBulkImportError(null);
    setBulkResult(null);
    setBulkContent("");
    setBulkFileName("");
    setBulkFormatOverride("");

    if (!f) return;
    setBulkFileName(f.name || "");

    try {
      const txt = await f.text();
      setBulkContent(txt);
    } catch (err) {
      setBulkPreviewError(String(err));
    }
  };

  const onPreview = async () => {
    if (!canCall) return;
    setPreview(null);
    setPreviewError(null);
    setImportError(null);
    if (!content.trim()) return setPreviewError(t("errors.noContent"));
    if (!format) return setPreviewError(t("errors.unknownFormat"));

    setPreviewLoading(true);
    try {
      const res = await apiFetch("/api/recipes/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, content }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const p = (res.data as any)?.preview ?? null;
      if (!p || typeof p !== "object") throw new Error(t("errors.previewMissing"));
      const name = typeof (p as any).name === "string" ? ((p as any).name as string) : "";
      const notesRaw = (p as any).notes;
      const notes = typeof notesRaw === "string" ? notesRaw : notesRaw === null ? null : null;
      const warningsRaw = (p as any).warnings;
      const warnings = Array.isArray(warningsRaw) ? (warningsRaw as ImportWarning[]) : [];
      setPreview({ name, notes, warnings });
    } catch (err) {
      setPreviewError(String(err));
    } finally {
      setPreviewLoading(false);
    }
  };

  const onBulkPreview = async () => {
    if (!canCall) return;
    setBulkPreviewItems(null);
    setBulkPreviewError(null);
    setBulkImportError(null);
    setBulkResult(null);
    if (!bulkContent.trim()) return setBulkPreviewError(t("errors.noContent"));
    if (!bulkFormat) return setBulkPreviewError(t("errors.unknownFormat"));

    setBulkPreviewLoading(true);
    try {
      const res = await apiFetch("/api/recipes/import/bulk/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: bulkFormat, content: bulkContent }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const items = (res.data as any)?.previewItems;
      if (!Array.isArray(items)) throw new Error(t("errors.previewMissing"));
      setBulkPreviewItems(items);
    } catch (err) {
      setBulkPreviewError(String(err));
    } finally {
      setBulkPreviewLoading(false);
    }
  };

  const onImport = async () => {
    if (!canCall) return;
    setImportError(null);
    if (!content.trim()) return setImportError(t("errors.noContent"));
    if (!format) return setImportError(t("errors.unknownFormat"));
    if (!styleKey.trim()) return setImportError(t("errors.styleRequired"));

    setImporting(true);
    try {
      const res = await apiFetch("/api/recipes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, content, styleKey }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const recipe = (res.data as any)?.recipe ?? null;
      const id = recipe && typeof recipe === "object" && typeof (recipe as any).id === "string" ? ((recipe as any).id as string) : "";
      if (!id) throw new Error(t("errors.importMissingId"));
      router.push(`/${locale}/recipes/${id}/edit`);
    } catch (err) {
      setImportError(String(err));
    } finally {
      setImporting(false);
    }
  };

  const onBulkImport = async () => {
    if (!canCall) return;
    setBulkImportError(null);
    if (!bulkContent.trim()) return setBulkImportError(t("errors.noContent"));
    if (!bulkFormat) return setBulkImportError(t("errors.unknownFormat"));

    setBulkImporting(true);
    try {
      const res = await apiFetch("/api/recipes/import/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: bulkFormat, content: bulkContent }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const created = Array.isArray((res.data as any)?.created) ? ((res.data as any).created as any[]) : [];
      const failed = Array.isArray((res.data as any)?.failed) ? ((res.data as any).failed as any[]) : [];
      setBulkResult({ created, failed });
    } catch (err) {
      setBulkImportError(String(err));
    } finally {
      setBulkImporting(false);
    }
  };

  const canPreview = canCall && Boolean(content.trim()) && Boolean(format) && !previewLoading;
  const canImport = canCall && Boolean(preview) && Boolean(styleKey.trim()) && !importing;
  const formatLabel = format === "beerjson" ? t("formatBeerJson") : format === "beerxml" ? t("formatBeerXml") : "";
  const dash = t("dash");

  const canBulkPreview = canCall && Boolean(bulkContent.trim()) && Boolean(bulkFormat) && !bulkPreviewLoading;
  const canBulkImport = canCall && Boolean(bulkPreviewItems) && !bulkImporting;
  const bulkFormatLabel = bulkFormat === "beerjson" ? t("formatBeerJson") : bulkFormat === "beerxml" ? t("formatBeerXml") : "";

  return (
    <>
      <h1 style={{ marginBottom: 8 }}>{t("title")}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {t("subtitle")}
      </p>

      {authState.status === "loading" ? <p className="muted">{t("loading")}</p> : null}
      {authState.status === "unauthenticated" ? (
        <p className="errorBox" role="alert">
          {t("errors.notAuthenticated")}
        </p>
      ) : null}
      {authState.status === "needs_active_account" ? (
        <p className="errorBox" role="alert">
          {t("errors.noActiveAccount")}
        </p>
      ) : null}

      <section className="panel" aria-labelledby="import-single-heading" style={{ marginTop: 16 }}>
        <h2 id="import-single-heading" style={{ marginTop: 0 }}>
          {t("singleHeading")}
        </h2>
        <p className="muted" style={{ marginTop: 0 }}>
          {t("singleSubtitle")}
        </p>

        <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor="import-file">
          {t("fileLabel")}
        </label>
        <input
          id="import-file"
          type="file"
          accept=".json,.xml,application/json,text/xml,application/xml"
          onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
          disabled={!canCall}
          aria-describedby="import-file-help"
        />
        <p id="import-file-help" className="muted" style={{ margin: "6px 0 0", fontSize: 12 }}>
          {fileName ? t("filePicked", { name: fileName }) : t("fileNotPicked")}
        </p>

        <div style={{ marginTop: 12, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor="import-format">
              {t("formatLabel")}
            </label>
            <select
              id="import-format"
              value={formatOverride}
              onChange={(e) => setFormatOverride(e.target.value as any)}
              disabled={!canCall}
            >
              <option value="">{t("formatAuto")}</option>
              <option value="beerjson">{t("formatBeerJson")}</option>
              <option value="beerxml">{t("formatBeerXml")}</option>
            </select>
            <p className="muted" style={{ margin: "6px 0 0", fontSize: 12 }}>
              {format ? t("formatResolved", { format: formatLabel }) : t("formatNotResolved")}
            </p>
          </div>
          <div>
            <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor="import-style">
              {t("styleLabel")}
            </label>
            <select
              id="import-style"
              value={styleKey}
              onChange={(e) => setStyleKey(e.target.value)}
              disabled={!canCall || stylesLoading || styles.length === 0}
              required
            >
              {styles.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.key === "custom" ? s.name : `${s.code} — ${s.name}`}
                </option>
              ))}
            </select>
            {stylesError ? (
              <p className="muted" style={{ margin: "6px 0 0", fontSize: 12 }}>
                {String(stylesError)}
              </p>
            ) : null}
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={() => void onPreview()} disabled={!canPreview}>
            {previewLoading ? t("previewing") : t("preview")}
          </button>
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setPreviewError(null);
              setImportError(null);
            }}
            disabled={!canCall || (!preview && !previewError && !importError)}
          >
            {t("reset")}
          </button>
          <Link href="/recipes">{t("backToRecipes")}</Link>
          <Link href="/">{c("backToDashboard")}</Link>
        </div>

        {previewError ? (
          <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
            {previewError}
          </pre>
        ) : null}
      </section>

      {preview ? (
        <section className="panel" aria-labelledby="import-preview-heading" style={{ marginTop: 16 }}>
          <h2 id="import-preview-heading" style={{ marginTop: 0 }}>
            {t("previewHeading")}
          </h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ paddingRight: 12 }}>
                    <strong>{t("previewNameLabel")}</strong>
                  </td>
                  <td>
                    <code>{preview.name || dash}</code>
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingRight: 12 }}>
                    <strong>{t("previewNotesLabel")}</strong>
                  </td>
                  <td className="muted">{preview.notes ? preview.notes : dash}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 style={{ marginTop: 16, marginBottom: 6 }}>{t("warningsHeading")}</h3>
          {preview.warnings.length ? (
            <ul style={{ marginTop: 0 }}>
              {preview.warnings.map((w, idx) => (
                <li key={`${String(w?.code ?? "warn")}-${idx}`}>
                  <code>{typeof w?.code === "string" ? w.code : t("unknownWarningCode")}</code>{" "}
                  <span className="muted">{typeof w?.message === "string" ? w.message : ""}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted" style={{ marginTop: 0 }}>
              {t("noWarnings")}
            </p>
          )}

          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => void onImport()} disabled={!canImport}>
              {importing ? t("importing") : t("import")}
            </button>
            {importError ? (
              <span className="muted" aria-live="polite">
                {importError}
              </span>
            ) : null}
          </div>
          {importError ? (
            <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
              {importError}
            </pre>
          ) : null}
        </section>
      ) : null}

      <section className="panel" aria-labelledby="import-bulk-heading" style={{ marginTop: 16 }}>
        <h2 id="import-bulk-heading" style={{ marginTop: 0 }}>
          {t("bulkHeading")}
        </h2>
        <p className="muted" style={{ marginTop: 0 }}>
          {t("bulkSubtitle")}
        </p>

        <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor="bulk-import-file">
          {t("fileLabel")}
        </label>
        <input
          id="bulk-import-file"
          type="file"
          accept=".json,.xml,application/json,text/xml,application/xml"
          onChange={(e) => void onPickBulkFile(e.target.files?.[0] ?? null)}
          disabled={!canCall}
          aria-describedby="bulk-import-file-help"
        />
        <p id="bulk-import-file-help" className="muted" style={{ margin: "6px 0 0", fontSize: 12 }}>
          {bulkFileName ? t("filePicked", { name: bulkFileName }) : t("fileNotPicked")}
        </p>

        <div style={{ marginTop: 12 }}>
          <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor="bulk-import-format">
            {t("formatLabel")}
          </label>
          <select
            id="bulk-import-format"
            value={bulkFormatOverride}
            onChange={(e) => setBulkFormatOverride(e.target.value as any)}
            disabled={!canCall}
          >
            <option value="">{t("formatAuto")}</option>
            <option value="beerjson">{t("formatBeerJson")}</option>
            <option value="beerxml">{t("formatBeerXml")}</option>
          </select>
          <p className="muted" style={{ margin: "6px 0 0", fontSize: 12 }}>
            {bulkFormat ? t("formatResolved", { format: bulkFormatLabel }) : t("formatNotResolved")}
          </p>
        </div>

        <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>
          {t("bulkStyleRule")}
        </p>

        <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={() => void onBulkPreview()} disabled={!canBulkPreview}>
            {bulkPreviewLoading ? t("previewing") : t("preview")}
          </button>
          <button type="button" onClick={() => void onBulkImport()} disabled={!canBulkImport}>
            {bulkImporting ? t("importing") : t("import")}
          </button>
          <button
            type="button"
            onClick={() => {
              setBulkPreviewItems(null);
              setBulkPreviewError(null);
              setBulkImportError(null);
              setBulkResult(null);
            }}
            disabled={!canCall || (!bulkPreviewItems && !bulkPreviewError && !bulkImportError && !bulkResult)}
          >
            {t("reset")}
          </button>
        </div>

        {bulkPreviewError ? (
          <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
            {bulkPreviewError}
          </pre>
        ) : null}
        {bulkImportError ? (
          <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
            {bulkImportError}
          </pre>
        ) : null}

        {bulkPreviewItems ? (
          <div style={{ marginTop: 12 }}>
            <h3 style={{ margin: "0 0 6px" }}>{t("bulkPreviewHeading")}</h3>
            <ul style={{ marginTop: 0 }}>
              {bulkPreviewItems.map((it: any) => (
                <li key={String(it?.index ?? Math.random())} style={{ marginBottom: 8 }}>
                  <div>
                    <strong>{String(it?.name ?? dash)}</strong>{" "}
                    <span className="muted">
                      ({t("resolvedStyleLabel")}:{" "}
                      <code>{String(it?.resolvedStyleCode ?? t("customStyleCode"))}</code>{" "}
                      {String(it?.resolvedStyleName ?? t("customStyleName"))})
                    </span>
                  </div>
                  {Array.isArray(it?.warnings) && it.warnings.length ? (
                    <ul style={{ marginTop: 4 }}>
                      {it.warnings.map((w: any, idx: number) => (
                        <li key={`${String(w?.code ?? "warn")}-${idx}`}>
                          <code>{typeof w?.code === "string" ? w.code : t("unknownWarningCode")}</code>{" "}
                          <span className="muted">{typeof w?.message === "string" ? w.message : ""}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {bulkResult ? (
          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            <div className="fieldBlock fieldBlock--computed">
              <div className="fieldBlockHeader">
                <strong>{t("bulkCreatedHeading")}</strong>
                <span className="muted">
                  {t("bulkCreatedCount", { count: bulkResult.created.length })}
                </span>
              </div>
              {bulkResult.created.length ? (
                <ul style={{ margin: 0 }}>
                  {bulkResult.created.map((x: any) => (
                    <li key={String(x?.recipeId ?? Math.random())}>
                      <Link href={`/recipes/${String(x.recipeId)}/edit`}>{String(x?.name ?? "") || dash}</Link>{" "}
                      <span className="muted">({String(x?.style ?? t("customStyleName"))})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted" style={{ margin: 0 }}>
                  {t("bulkNoneCreated")}
                </p>
              )}
            </div>

            {bulkResult.failed.length ? (
              <pre className="errorBox" role="alert">
                {t("bulkFailedHeading")}\n
                {bulkResult.failed.map((f: any) => `#${String(f?.index ?? "?")}: ${String(f?.name ?? "")} — ${String(f?.error ?? "")}`).join("\n")}
              </pre>
            ) : null}
          </div>
        ) : null}
      </section>

      <div style={{ marginTop: 16 }}>
        <ImportExportPanel headingId="import-export-panel-heading" className="" />
      </div>
    </>
  );
}

