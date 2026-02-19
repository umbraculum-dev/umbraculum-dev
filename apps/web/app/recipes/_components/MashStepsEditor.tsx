"use client";

import { Link } from "../../../src/i18n/navigation";
import type { EditorMash, EditorMashStep, EditorMashStepType } from "../_lib/beerjsonRecipe";
import { MASH_STEP_TYPE_OPTIONS, MASH_TEMPLATES, newMashRowId } from "../_lib/beerjsonRecipe";

export type WaterVolumes = { mashLiters: number; spargeLiters: number };

type MashStepsEditorProps = {
  mashRows: EditorMashStep[];
  mashProcedure: { name: string; grainTemperatureC: number } | null;
  waterVolumes: WaterVolumes | null;
  mashWaterBudgetLiters?: number | null;
  firstStepAmountComputed?: number | null;
  hideSpargeFromTypeOptions?: boolean;
  readOnly?: boolean;
  recipeId?: string;
  onUpdateProcedure?: (patch: { name?: string; grainTemperatureC?: number }) => void;
  onUpdateStep?: (id: string, patch: Partial<EditorMashStep>) => void;
  onAddStep?: () => void;
  onDeleteStep?: (id: string) => void;
  onAddFromTemplate?: (templateId: string) => void;
  onSave?: () => void;
  canSave?: boolean;
  saving?: boolean;
  saveStatus?: string | null;
  t: (key: string, values?: Record<string, string | number>) => string;
  tUnits: (key: string) => string;
  locale: string;
  formatFixed: (locale: string, value: number, decimals: number) => string;
};

export function MashStepsEditor({
  mashRows,
  mashProcedure,
  waterVolumes,
  mashWaterBudgetLiters = null,
  firstStepAmountComputed = null,
  hideSpargeFromTypeOptions = false,
  readOnly = false,
  recipeId = "",
  onUpdateProcedure,
  onUpdateStep,
  onAddStep,
  onDeleteStep,
  onAddFromTemplate,
  onSave,
  canSave = false,
  saving = false,
  saveStatus = null,
  t,
  tUnits,
  locale,
  formatFixed,
}: MashStepsEditorProps) {
  if (readOnly) {
    const readonlyCellStyle = {
      padding: 8,
      background: "var(--surface-2)",
      borderRadius: "var(--radius)",
      border: "1px solid var(--border)",
    } as const;
    const gridCols =
      "auto minmax(80px, 100px) minmax(80px, 100px) minmax(60px, 80px) minmax(50px, 70px) minmax(80px, 120px) minmax(50px, 70px) minmax(120px, 140px)";
    return (
      <div>
        {mashRows.length > 0 ? (
          <>
            <p className="muted" style={{ marginTop: 0, marginBottom: 8 }}>
              {mashProcedure?.name ?? "Mash"} · {t("mashingGrainTemp")}: {mashProcedure?.grainTemperatureC ?? 20} °C
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              {mashRows.map((r, idx) => {
                const isSpargeStep = r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
                const amountDisplay = isSpargeStep && waterVolumes
                  ? formatFixed(locale, waterVolumes.spargeLiters, 2)
                  : r.amountL != null && Number.isFinite(r.amountL)
                    ? formatFixed(locale, r.amountL, 2)
                    : "—";
                return (
                  <div key={r.id} className="ingredientCard" style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "grid",
                        gap: 12,
                        alignItems: "end",
                        gridTemplateColumns: gridCols,
                      }}
                    >
                      <div style={{ alignSelf: "center", fontWeight: 500 }}>{idx + 1}</div>
                      <div>
                        <label className="muted ingredientCardLabel" style={{ display: "block", fontSize: 12 }}>
                          {t("mashingStepName")}
                        </label>
                        <div style={readonlyCellStyle}>{r.name}</div>
                      </div>
                      <div>
                        <label className="muted ingredientCardLabel" style={{ display: "block", fontSize: 12 }}>
                          {t("mashingStepType")}
                        </label>
                        <div style={readonlyCellStyle}>{r.type}</div>
                      </div>
                      <div>
                        <label className="muted ingredientCardLabel" style={{ display: "block", fontSize: 12 }}>
                          {t("mashingStepTemp", { unit: "°C" })}
                        </label>
                        <div style={readonlyCellStyle}>{r.stepTemperatureC}</div>
                      </div>
                      <div>
                        <label className="muted ingredientCardLabel" style={{ display: "block", fontSize: 12 }}>
                          {t("mashingStepTime", { unit: "min" })}
                        </label>
                        <div style={readonlyCellStyle}>{r.stepTimeMin}</div>
                      </div>
                      <div>
                        <label className="muted ingredientCardLabel" style={{ display: "block", fontSize: 12 }}>
                          {t("mashingStepAmount", { unit: "L" })}
                        </label>
                        <div style={readonlyCellStyle}>
                          {amountDisplay !== "—" ? (
                            <>
                              <code>{amountDisplay}</code> {tUnits("L")}
                            </>
                          ) : (
                            "—"
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="muted ingredientCardLabel" style={{ display: "block", fontSize: 12 }}>
                          {t("mashingStepRamp", { unit: "min" })}
                        </label>
                        <div style={readonlyCellStyle}>{r.rampTimeMin != null ? r.rampTimeMin : "—"}</div>
                      </div>
                      <div>
                        <label className="muted ingredientCardLabel" style={{ display: "block", fontSize: 12 }}>
                          {idx > 0 ? t("mashingDeduceFromMashIn") : "\u00a0"}
                        </label>
                        <div style={readonlyCellStyle}>
                          {idx > 0 ? (r.deduceFromMashIn === true ? "Yes" : "—") : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {recipeId ? (
              <p style={{ marginTop: 12, marginBottom: 0 }}>
                <Link href={`/recipes/${recipeId}/water/mash#mash-steps`}>
                  {t("mashingEditInMashPage")}
                </Link>
              </p>
            ) : null}
          </>
        ) : (
          <p className="muted" style={{ marginTop: 0, marginBottom: 0 }}>
            {t("mashingEmpty")}
            {recipeId ? (
              <> {" · "}
                <Link href={`/recipes/${recipeId}/water/mash#mash-steps`}>
                  {t("mashingEditInMashPage")}
                </Link>
              </>
            ) : null}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mashStepsEditor" style={{ textAlign: "left", width: "100%" }}>
      {mashWaterBudgetLiters != null && !readOnly ? (
        <div className="muted" style={{ marginTop: 0, marginBottom: 12 }}>
          <p style={{ marginTop: 0, marginBottom: 8 }}>{t("mashStepsWaterBudgetNote")}</p>
          <p style={{ marginTop: 0, marginBottom: 8 }}>{t("mashStepsMashInAlwaysPresentNote")}</p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>{t("mashStepsTypeFallbackNote")}</p>
        </div>
      ) : null}
      {mashRows.length > 0 ? (
        <>
          <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div>
              <label className="muted" style={{ display: "block", fontSize: 12 }}>
                {t("mashingProcedureName")}
              </label>
              <div style={{ padding: 8, background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)", width: 200, textAlign: "left" }}>
                {mashProcedure?.name ?? "Mash"}
              </div>
            </div>
            <div>
              <label className="muted" style={{ display: "block", fontSize: 12 }} htmlFor="mash-grain-temp">
                {t("mashingGrainTemp")}
              </label>
              <input
                id="mash-grain-temp"
                type="number"
                value={mashProcedure?.grainTemperatureC ?? 20}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onUpdateProcedure?.({
                    ...(mashProcedure ?? { name: "Mash", grainTemperatureC: 20 }),
                    grainTemperatureC: Number.isFinite(v) ? v : 20,
                  });
                }}
                min={-20}
                max={100}
                step={1}
                style={{ width: 80, padding: 8 }}
              />
              °C
            </div>
          </div>
          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {mashRows.map((r, idx) => {
                  const isSpargeStep = r.type === "sparge" && r.name.trim().toLowerCase() === "sparge";
                  return (
                    <tr key={r.id}>
                      <td colSpan={8} style={{ paddingTop: idx === 0 ? 0 : 12, verticalAlign: "top" }}>
                        <div className="ingredientCard">
                          <div
                            style={{
                              display: "grid",
                              gap: 12,
                              alignItems: "start",
                              justifyContent: "start",
                              width: "100%",
                              gridTemplateColumns:
                                "auto minmax(100px, 140px) minmax(100px, 140px) minmax(60px, 80px) minmax(50px, 70px) minmax(80px, 120px) minmax(50px, 70px) minmax(140px, 180px) auto",
                            }}
                          >
                            <div style={{ alignSelf: "start", fontWeight: 500, paddingTop: 28 }}>{idx + 1}</div>
                            <div style={{ minWidth: 0, width: "100%" }}>
                              <label className="muted ingredientCardLabel" htmlFor={isSpargeStep || (idx === 0 && firstStepAmountComputed != null) ? undefined : `mash-step-name-${r.id}`}>
                                {t("mashingStepName")}
                              </label>
                              {isSpargeStep ? (
                                <div style={{ padding: 8, background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)", textAlign: "left", width: "100%" }}>
                                  Sparge
                                </div>
                              ) : idx === 0 && firstStepAmountComputed != null ? (
                                <div style={{ padding: 8, background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)", textAlign: "left", width: "100%" }}>
                                  {r.name || "Mash In"}
                                </div>
                              ) : (
                                <input
                                  id={`mash-step-name-${r.id}`}
                                  type="text"
                                  value={r.name}
                                  onChange={(e) => onUpdateStep?.(r.id, { name: e.target.value })}
                                  placeholder={t("mashingStepName")}
                                  style={{ width: "100%", padding: 8, textAlign: "left" }}
                                />
                              )}
                            </div>
                            <div style={{ minWidth: 0, width: "100%" }}>
                              <label className="muted ingredientCardLabel" htmlFor={isSpargeStep ? undefined : `mash-step-type-${r.id}`}>
                                {t("mashingStepType")}
                              </label>
                              {isSpargeStep ? (
                                <div style={{ padding: 8, background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)", textAlign: "left", width: "100%" }}>
                                  Sparge
                                </div>
                              ) : (
                                <select
                                  id={`mash-step-type-${r.id}`}
                                  value={r.type}
                                  onChange={(e) => onUpdateStep?.(r.id, { type: e.target.value as EditorMashStepType })}
                                  style={{ width: "100%", padding: 8, textAlign: "left" }}
                                >
                                  {(hideSpargeFromTypeOptions
                                    ? MASH_STEP_TYPE_OPTIONS.filter((o) => o.value !== "sparge")
                                    : MASH_STEP_TYPE_OPTIONS
                                  ).map((o) => (
                                    <option key={o.value} value={o.value}>
                                      {o.label}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                            <div style={{ minWidth: 0, width: "100%" }}>
                              <label className="muted ingredientCardLabel" htmlFor={`mash-step-temp-${r.id}`}>
                                {t("mashingStepTemp", { unit: "°C" })}
                              </label>
                              <input
                                id={`mash-step-temp-${r.id}`}
                                type="number"
                                value={r.stepTemperatureC}
                                onChange={(e) => onUpdateStep?.(r.id, { stepTemperatureC: Number(e.target.value) || 0 })}
                                min={0}
                                max={100}
                                step={0.5}
                                style={{ width: "100%", padding: 8, textAlign: "left" }}
                              />
                            </div>
                            <div style={{ minWidth: 0, width: "100%" }}>
                              <label className="muted ingredientCardLabel" htmlFor={`mash-step-time-${r.id}`}>
                                {t("mashingStepTime", { unit: "min" })}
                              </label>
                              <input
                                id={`mash-step-time-${r.id}`}
                                type="number"
                                value={r.stepTimeMin}
                                onChange={(e) =>
                                  onUpdateStep?.(r.id, { stepTimeMin: Math.max(0, Number(e.target.value) || 0) })
                                }
                                min={0}
                                max={300}
                                step={1}
                                style={{ width: "100%", padding: 8, textAlign: "left" }}
                              />
                            </div>
                            <div style={{ minWidth: 0, width: "100%" }}>
                              {idx === 0 && r.type === "infusion" && waterVolumes && firstStepAmountComputed == null ? (
                                <span className="muted" style={{ display: "block", fontSize: 11, marginBottom: 4 }}>
                                  {t("mashingFirstStepSuggested", { amount: formatFixed(locale, waterVolumes.mashLiters, 2), unit: tUnits("L") })}
                                </span>
                              ) : null}
                              <label className="muted ingredientCardLabel" htmlFor={isSpargeStep || (idx === 0 && firstStepAmountComputed != null) ? undefined : `mash-step-amount-${r.id}`}>
                                {t("mashingStepAmount", { unit: "L" })}
                              </label>
                              {isSpargeStep ? (
                                <>
                                  <div style={{ padding: 8, background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)", textAlign: "left", width: "100%" }}>
                                    {waterVolumes ? (
                                      <><code>{formatFixed(locale, waterVolumes.spargeLiters, 2)}</code> {tUnits("L")}</>
                                    ) : (
                                      <span className="muted">{t("mashingSpargeStepAmountUnavailable")}</span>
                                    )}
                                  </div>
                                  {waterVolumes ? (
                                    <span className="muted" style={{ display: "block", fontSize: 11, marginTop: 4 }}>
                                      {t("mashingSpargeStepAmountSource")}
                                    </span>
                                  ) : null}
                                </>
                              ) : idx === 0 && firstStepAmountComputed != null ? (
                                <div style={{ padding: 8, background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)", textAlign: "left", width: "100%" }}>
                                  <code>{formatFixed(locale, firstStepAmountComputed, 2)}</code> {tUnits("L")}
                                </div>
                              ) : (
                                <input
                                  id={`mash-step-amount-${r.id}`}
                                  type="number"
                                  value={r.amountL ?? ""}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    onUpdateStep?.(r.id, {
                                      amountL: v === "" ? null : Math.max(0, Number(v) || 0),
                                    });
                                  }}
                                  placeholder="—"
                                  min={0}
                                  step={0.1}
                                  style={{ width: "100%", padding: 8, textAlign: "left" }}
                                  disabled={idx > 0 && r.deduceFromMashIn !== true}
                                />
                              )}
                            </div>
                            <div style={{ minWidth: 0, width: "100%" }}>
                              <label className="muted ingredientCardLabel" htmlFor={`mash-step-ramp-${r.id}`}>
                                {t("mashingStepRamp", { unit: "min" })}
                              </label>
                              <input
                                id={`mash-step-ramp-${r.id}`}
                                type="number"
                                value={r.rampTimeMin ?? ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  onUpdateStep?.(r.id, {
                                    rampTimeMin: v === "" ? null : Math.max(0, Number(v) || 0),
                                  });
                                }}
                                placeholder="—"
                                min={0}
                                step={1}
                                style={{ width: "100%", padding: 8, textAlign: "left" }}
                              />
                            </div>
                            {idx > 0 ? (
                              <div style={{ alignSelf: "start", paddingTop: 28 }}>
                                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                                  <input
                                    type="checkbox"
                                    checked={r.deduceFromMashIn === true}
                                    onChange={(e) =>
                                      onUpdateStep?.(r.id, {
                                        deduceFromMashIn: e.target.checked,
                                        ...(e.target.checked ? {} : { amountL: 0 }),
                                      })
                                    }
                                    aria-label={t("mashingDeduceFromMashIn")}
                                  />
                                  <span className="muted">{t("mashingDeduceFromMashIn")}</span>
                                </label>
                              </div>
                            ) : (
                              <div />
                            )}
                            {idx > 0 ? (
                              <div style={{ alignSelf: "start" }}>
                                <button
                                  type="button"
                                  onClick={() => onDeleteStep?.(r.id)}
                                  aria-label={t("mashingDeleteStep")}
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div />
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="muted">{t("mashingEmpty")}</p>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" onClick={onAddStep}>
          {t("mashingAddStep")}
        </button>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span className="muted">{t("mashingAddFromTemplate")}:</span>
          {MASH_TEMPLATES.filter((tpl) => tpl.id !== "sparge").map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onAddFromTemplate?.(tpl.id)}
              style={{ fontSize: 12 }}
            >
              {t(tpl.labelKey)}
            </button>
          ))}
        </div>
      </div>
      {onSave ? (
        <div style={{ marginTop: 12 }}>
          <button type="button" onClick={onSave} disabled={!canSave || saving}>
            {saving ? "Saving…" : t("mashingSaveMashSteps")}
          </button>
          {recipeId ? (
            <p style={{ marginTop: 12, marginBottom: 0 }}>
              <Link href={`/recipes/${recipeId}/edit#mashing`}>{t("mashStepsSeeRecapLink")}</Link>
            </p>
          ) : null}
        </div>
      ) : null}
      {saveStatus ? (
        <span className="muted" aria-live="polite" style={{ display: "block", marginTop: 8 }}>
          {saveStatus}
        </span>
      ) : null}
    </div>
  );
}
