"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "../../../src/i18n/navigation";
import { apiFetch } from "../../_lib/apiClient";
import type { AuthMeResponse } from "../../_lib/useRequireAuth";

type EquipmentProfile = {
  id: string;
  name: string;
  equipment: {
    kettle: {
      kettleLossesLiters: number | null;
      kettleBoilEvaporationRatePercentPerHour: number | null;
      kettleCoolingShrinkagePercent: number | null;
      kettleVolumeLiters: number | null;
      kettleHopsAbsorptionLiters: number | null;
    };
    mash: {
      mashLossesLiters: number | null;
      mashThicknessLPerKg: number | null;
      mashGrainAbsorptionLPerKg: number | null;
      mashWaterLeftoverLiters: number | null;
      mashVolumeLiters: number | null;
      mashEfficiencyPercent: number | null;
    };
    misc: {
      otherLossesLiters: number | null;
    };
  };
};

export default function EquipmentPage() {
  const t = useTranslations("equipment");
  const tNav = useTranslations("nav");

  const [auth, setAuth] = useState<AuthMeResponse | null>(null);
  const [profiles, setProfiles] = useState<EquipmentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createName, setCreateName] = useState("");
  const [createKettleVolumeLiters, setCreateKettleVolumeLiters] = useState<string>("");
  const [createKettleLossesLiters, setCreateKettleLossesLiters] = useState<string>("");
  const [createKettleBoilEvaporationRatePercentPerHour, setCreateKettleBoilEvaporationRatePercentPerHour] = useState<string>("");
  const [createKettleCoolingShrinkagePercent, setCreateKettleCoolingShrinkagePercent] = useState<string>("");
  const [createKettleHopsAbsorptionLiters, setCreateKettleHopsAbsorptionLiters] = useState<string>("");

  const [createMashVolumeLiters, setCreateMashVolumeLiters] = useState<string>("");
  const [createMashEfficiencyPercent, setCreateMashEfficiencyPercent] = useState<string>("");
  const [createMashLossesLiters, setCreateMashLossesLiters] = useState<string>("");
  const [createMashThicknessLPerKg, setCreateMashThicknessLPerKg] = useState<string>("");
  const [createMashGrainAbsorptionLPerKg, setCreateMashGrainAbsorptionLPerKg] = useState<string>("");
  const [createMashWaterLeftoverLiters, setCreateMashWaterLeftoverLiters] = useState<string>("");

  const [createOtherLossesLiters, setCreateOtherLossesLiters] = useState<string>("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, string>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const canWrite = auth != null;

  const refresh = async () => {
    setError(null);
    setLoading(true);
    try {
      const meRes = await apiFetch("/api/auth/me");
      if (!meRes.ok) {
        setAuth(null);
        throw new Error(t("errors.notAuthenticated"));
      }
      setAuth(meRes.data as AuthMeResponse);

      const listRes = await apiFetch("/api/equipment-profiles");
      if (!listRes.ok) throw new Error(JSON.stringify(listRes.data));
      const items = (listRes.data as any)?.profiles;
      setProfiles(Array.isArray(items) ? (items as EquipmentProfile[]) : []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSubmitting(true);
    try {
      const name = createName.trim();
      if (!name) throw new Error(t("errors.nameRequired"));

      const parseNullableNumber = (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) return null;
        const n = Number(trimmed);
        if (!Number.isFinite(n)) return null;
        return n;
      };

      const kettleVolumeLiters = parseNullableNumber(createKettleVolumeLiters);
      if (kettleVolumeLiters != null && kettleVolumeLiters <= 0) throw new Error(t("errors.kettleVolumeMustBePositive"));
      const kettleLossesLiters = parseNullableNumber(createKettleLossesLiters);
      if (kettleLossesLiters != null && kettleLossesLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));
      const kettleBoilEvaporationRatePercentPerHour = parseNullableNumber(createKettleBoilEvaporationRatePercentPerHour);
      if (
        kettleBoilEvaporationRatePercentPerHour != null &&
        (kettleBoilEvaporationRatePercentPerHour < 0 || kettleBoilEvaporationRatePercentPerHour > 100)
      ) {
        throw new Error(t("errors.percentRange"));
      }
      const kettleCoolingShrinkagePercent = parseNullableNumber(createKettleCoolingShrinkagePercent);
      if (kettleCoolingShrinkagePercent != null && (kettleCoolingShrinkagePercent < 0 || kettleCoolingShrinkagePercent > 100)) {
        throw new Error(t("errors.percentRange"));
      }
      const kettleHopsAbsorptionLiters = parseNullableNumber(createKettleHopsAbsorptionLiters);
      if (kettleHopsAbsorptionLiters != null && kettleHopsAbsorptionLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));

      const mashVolumeLiters = parseNullableNumber(createMashVolumeLiters);
      if (mashVolumeLiters != null && mashVolumeLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));
      const mashEfficiencyPercent = parseNullableNumber(createMashEfficiencyPercent);
      if (mashEfficiencyPercent != null && (mashEfficiencyPercent < 0 || mashEfficiencyPercent > 100)) {
        throw new Error(t("errors.mashEfficiencyRange"));
      }
      const mashLossesLiters = parseNullableNumber(createMashLossesLiters);
      if (mashLossesLiters != null && mashLossesLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));
      const mashThicknessLPerKg = parseNullableNumber(createMashThicknessLPerKg);
      if (mashThicknessLPerKg != null && mashThicknessLPerKg < 0) throw new Error(t("errors.lossesMustBeNonNegative"));
      const mashGrainAbsorptionLPerKg = parseNullableNumber(createMashGrainAbsorptionLPerKg);
      if (mashGrainAbsorptionLPerKg != null && mashGrainAbsorptionLPerKg < 0) throw new Error(t("errors.lossesMustBeNonNegative"));
      const mashWaterLeftoverLiters = parseNullableNumber(createMashWaterLeftoverLiters);
      if (mashWaterLeftoverLiters != null && mashWaterLeftoverLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));

      const otherLossesLiters = parseNullableNumber(createOtherLossesLiters);
      if (otherLossesLiters != null && otherLossesLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));

      const res = await apiFetch("/api/equipment-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          kettleVolumeLiters,
          kettleLossesLiters,
          kettleBoilEvaporationRatePercentPerHour,
          kettleCoolingShrinkagePercent,
          kettleHopsAbsorptionLiters,
          mashVolumeLiters,
          mashEfficiencyPercent,
          mashLossesLiters,
          mashThicknessLPerKg,
          mashGrainAbsorptionLPerKg,
          mashWaterLeftoverLiters,
          otherLossesLiters,
        }),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));

      setCreateName("");
      setCreateKettleVolumeLiters("");
      setCreateKettleLossesLiters("");
      setCreateKettleBoilEvaporationRatePercentPerHour("");
      setCreateKettleCoolingShrinkagePercent("");
      setCreateKettleHopsAbsorptionLiters("");
      setCreateMashVolumeLiters("");
      setCreateMashEfficiencyPercent("");
      setCreateMashLossesLiters("");
      setCreateMashThicknessLPerKg("");
      setCreateMashGrainAbsorptionLPerKg("");
      setCreateMashWaterLeftoverLiters("");
      setCreateOtherLossesLiters("");
      await refresh();
    } catch (err) {
      setCreateError(String(err));
    } finally {
      setCreateSubmitting(false);
    }
  };

  const beginEdit = (p: EquipmentProfile) => {
    setEditingId(p.id);
    setEditError(null);
    setEditDraft({
      name: p.name ?? "",
      kettleVolumeLiters: p.equipment?.kettle?.kettleVolumeLiters == null ? "" : String(p.equipment.kettle.kettleVolumeLiters),
      kettleLossesLiters: p.equipment?.kettle?.kettleLossesLiters == null ? "" : String(p.equipment.kettle.kettleLossesLiters),
      kettleBoilEvaporationRatePercentPerHour:
        p.equipment?.kettle?.kettleBoilEvaporationRatePercentPerHour == null
          ? ""
          : String(p.equipment.kettle.kettleBoilEvaporationRatePercentPerHour),
      kettleCoolingShrinkagePercent:
        p.equipment?.kettle?.kettleCoolingShrinkagePercent == null ? "" : String(p.equipment.kettle.kettleCoolingShrinkagePercent),
      kettleHopsAbsorptionLiters:
        p.equipment?.kettle?.kettleHopsAbsorptionLiters == null ? "" : String(p.equipment.kettle.kettleHopsAbsorptionLiters),
      mashVolumeLiters: p.equipment?.mash?.mashVolumeLiters == null ? "" : String(p.equipment.mash.mashVolumeLiters),
      mashEfficiencyPercent: p.equipment?.mash?.mashEfficiencyPercent == null ? "" : String(p.equipment.mash.mashEfficiencyPercent),
      mashLossesLiters: p.equipment?.mash?.mashLossesLiters == null ? "" : String(p.equipment.mash.mashLossesLiters),
      mashThicknessLPerKg: p.equipment?.mash?.mashThicknessLPerKg == null ? "" : String(p.equipment.mash.mashThicknessLPerKg),
      mashGrainAbsorptionLPerKg:
        p.equipment?.mash?.mashGrainAbsorptionLPerKg == null ? "" : String(p.equipment.mash.mashGrainAbsorptionLPerKg),
      mashWaterLeftoverLiters:
        p.equipment?.mash?.mashWaterLeftoverLiters == null ? "" : String(p.equipment.mash.mashWaterLeftoverLiters),
      otherLossesLiters: p.equipment?.misc?.otherLossesLiters == null ? "" : String(p.equipment.misc.otherLossesLiters),
    });
  };

  const parseNullableNumber = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return null;
    return n;
  };

  const onSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const name = (editDraft.name ?? "").trim();
      if (!name) throw new Error(t("errors.nameRequired"));

      const kettleVolumeLiters = parseNullableNumber(editDraft.kettleVolumeLiters ?? "");
      if (kettleVolumeLiters != null && kettleVolumeLiters <= 0) throw new Error(t("errors.kettleVolumeMustBePositive"));

      const mashEfficiencyPercent = parseNullableNumber(editDraft.mashEfficiencyPercent ?? "");
      if (mashEfficiencyPercent != null && (mashEfficiencyPercent < 0 || mashEfficiencyPercent > 100)) {
        throw new Error(t("errors.mashEfficiencyRange"));
      }

      const res = await apiFetch(`/api/equipment-profiles/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          kettleVolumeLiters,
          kettleLossesLiters: parseNullableNumber(editDraft.kettleLossesLiters ?? ""),
          kettleBoilEvaporationRatePercentPerHour: parseNullableNumber(editDraft.kettleBoilEvaporationRatePercentPerHour ?? ""),
          kettleCoolingShrinkagePercent: parseNullableNumber(editDraft.kettleCoolingShrinkagePercent ?? ""),
          kettleHopsAbsorptionLiters: parseNullableNumber(editDraft.kettleHopsAbsorptionLiters ?? ""),
          mashVolumeLiters: parseNullableNumber(editDraft.mashVolumeLiters ?? ""),
          mashEfficiencyPercent,
          mashLossesLiters: parseNullableNumber(editDraft.mashLossesLiters ?? ""),
          mashThicknessLPerKg: parseNullableNumber(editDraft.mashThicknessLPerKg ?? ""),
          mashGrainAbsorptionLPerKg: parseNullableNumber(editDraft.mashGrainAbsorptionLPerKg ?? ""),
          mashWaterLeftoverLiters: parseNullableNumber(editDraft.mashWaterLeftoverLiters ?? ""),
          otherLossesLiters: parseNullableNumber(editDraft.otherLossesLiters ?? ""),
        }),
      });
      if (!res.ok) throw new Error(JSON.stringify(res.data));

      setEditingId(null);
      setEditDraft({});
      await refresh();
    } catch (err) {
      setEditError(String(err));
    } finally {
      setEditSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!id) return;
    setEditError(null);
    setEditSubmitting(true);
    try {
      const res = await apiFetch(`/api/equipment-profiles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(JSON.stringify(res.data));
      if (editingId === id) {
        setEditingId(null);
        setEditDraft({});
      }
      await refresh();
    } catch (err) {
      setEditError(String(err));
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <>
      <h1 style={{ marginBottom: 8 }}>{tNav("equipment")}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {t("subtitle")}
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" onClick={() => void refresh()} disabled={loading}>
          {loading ? t("refreshing") : t("refresh")}
        </button>
        <Link href="/recipes" className="muted" style={{ marginLeft: "auto" }}>
          {t("backToRecipes")}
        </Link>
      </div>

      {error ? (
        <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
          {error}
        </pre>
      ) : null}

      <details className="panel" style={{ marginTop: 16 }}>
        <summary style={{ cursor: "pointer" }}>
          <h2 id="equipment-list" style={{ marginTop: 0, display: "inline" }}>
            {t("listTitle")}
          </h2>
        </summary>
        <div style={{ marginTop: 12 }}>
          {profiles.length ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th align="left">{t("colName")}</th>
                    <th align="left">{t("colKettleVol")}</th>
                    <th align="left">{t("colMashEff")}</th>
                    {canWrite ? <th align="left">{t("colActions")}</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.equipment?.kettle?.kettleVolumeLiters == null ? "—" : p.equipment.kettle.kettleVolumeLiters}</td>
                      <td>{p.equipment?.mash?.mashEfficiencyPercent == null ? "—" : p.equipment.mash.mashEfficiencyPercent}</td>
                      {canWrite ? (
                        <td>
                          <button type="button" onClick={() => beginEdit(p)} style={{ marginRight: 8 }}>
                            {t("edit")}
                          </button>
                          <button type="button" onClick={() => void onDelete(p.id)}>
                            {t("delete")}
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
              {t("noProfiles")}
            </p>
          )}
        </div>
      </details>

      {canWrite && editingId ? (
        <section className="panel" aria-labelledby="equipment-edit" style={{ marginTop: 16 }}>
          <h2 id="equipment-edit" style={{ marginTop: 0 }}>
            {t("editTitle")}
          </h2>
          <form onSubmit={onSaveEdit} aria-describedby={editError ? "equipment-edit-error" : undefined}>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label htmlFor="equip-edit-name" className="muted" style={{ display: "block", fontSize: 12 }}>
                  {t("nameLabel")}
                </label>
                <input
                  id="equip-edit-name"
                  value={editDraft.name ?? ""}
                  onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>

              <fieldset style={{ border: "1px solid var(--panel-border, #ddd)", borderRadius: 8, padding: 12 }}>
                <legend style={{ padding: "0 6px" }}>{t("sectionTitles.kettle")}</legend>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <label htmlFor="equip-edit-kettle-vol" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("kettleVolumeLitersLabel")}
                    </label>
                    <input
                      id="equip-edit-kettle-vol"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={editDraft.kettleVolumeLiters ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, kettleVolumeLiters: e.target.value }))}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-edit-kettle-losses" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("kettleLossesLitersLabel")}
                    </label>
                    <input
                      id="equip-edit-kettle-losses"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={editDraft.kettleLossesLiters ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, kettleLossesLiters: e.target.value }))}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-edit-evap" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("kettleBoilEvaporationRatePercentPerHourLabel")}
                    </label>
                    <input
                      id="equip-edit-evap"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={editDraft.kettleBoilEvaporationRatePercentPerHour ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, kettleBoilEvaporationRatePercentPerHour: e.target.value }))}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-edit-shrink" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("kettleCoolingShrinkagePercentLabel")}
                    </label>
                    <input
                      id="equip-edit-shrink"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={editDraft.kettleCoolingShrinkagePercent ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, kettleCoolingShrinkagePercent: e.target.value }))}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-edit-hops-abs" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("kettleHopsAbsorptionLitersLabel")}
                    </label>
                    <input
                      id="equip-edit-hops-abs"
                      type="number"
                      inputMode="decimal"
                      step={0.001}
                      value={editDraft.kettleHopsAbsorptionLiters ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, kettleHopsAbsorptionLiters: e.target.value }))}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset style={{ border: "1px solid var(--panel-border, #ddd)", borderRadius: 8, padding: 12 }}>
                <legend style={{ padding: "0 6px" }}>{t("sectionTitles.mash")}</legend>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <label htmlFor="equip-edit-mash-vol" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("mashVolumeLitersLabel")}
                    </label>
                    <input
                      id="equip-edit-mash-vol"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={editDraft.mashVolumeLiters ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, mashVolumeLiters: e.target.value }))}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-edit-mash-eff" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("mashEfficiencyPercentLabel")}
                    </label>
                    <input
                      id="equip-edit-mash-eff"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={editDraft.mashEfficiencyPercent ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, mashEfficiencyPercent: e.target.value }))}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-edit-mash-losses" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("mashLossesLitersLabel")}
                    </label>
                    <input
                      id="equip-edit-mash-losses"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={editDraft.mashLossesLiters ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, mashLossesLiters: e.target.value }))}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-edit-thickness" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("mashThicknessLPerKgLabel")}
                    </label>
                    <input
                      id="equip-edit-thickness"
                      type="number"
                      inputMode="decimal"
                      step={0.01}
                      value={editDraft.mashThicknessLPerKg ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, mashThicknessLPerKg: e.target.value }))}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-edit-grain-abs" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("mashGrainAbsorptionLPerKgLabel")}
                    </label>
                    <input
                      id="equip-edit-grain-abs"
                      type="number"
                      inputMode="decimal"
                      step={0.01}
                      value={editDraft.mashGrainAbsorptionLPerKg ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, mashGrainAbsorptionLPerKg: e.target.value }))}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-edit-water-leftover" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("mashWaterLeftoverLitersLabel")}
                    </label>
                    <input
                      id="equip-edit-water-leftover"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={editDraft.mashWaterLeftoverLiters ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, mashWaterLeftoverLiters: e.target.value }))}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset style={{ border: "1px solid var(--panel-border, #ddd)", borderRadius: 8, padding: 12 }}>
                <legend style={{ padding: "0 6px" }}>{t("sectionTitles.misc")}</legend>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <label htmlFor="equip-edit-other-losses" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("otherLossesLitersLabel")}
                    </label>
                    <input
                      id="equip-edit-other-losses"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={editDraft.otherLossesLiters ?? ""}
                      onChange={(e) => setEditDraft((d) => ({ ...d, otherLossesLiters: e.target.value }))}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                </div>
              </fieldset>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
              <button type="submit" disabled={editSubmitting}>
                {editSubmitting ? t("saving") : t("save")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setEditDraft({});
                  setEditError(null);
                }}
                disabled={editSubmitting}
              >
                {t("cancel")}
              </button>
            </div>
            {editError ? (
              <pre id="equipment-edit-error" className="errorBox" role="alert" style={{ marginTop: 12 }}>
                {editError}
              </pre>
            ) : null}
          </form>
        </section>
      ) : null}

      {canWrite ? (
        <details className="panel" style={{ marginTop: 16 }}>
          <summary style={{ cursor: "pointer" }}>
            <h2 id="equipment-create" style={{ marginTop: 0, display: "inline" }}>
              {t("createTitle")}
            </h2>
          </summary>
          <form onSubmit={onCreate} aria-describedby={createError ? "equipment-create-error" : undefined} style={{ marginTop: 12 }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label htmlFor="equip-name" className="muted" style={{ display: "block", fontSize: 12 }}>
                  {t("nameLabel")}
                </label>
                <input
                  id="equip-name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  style={{ width: "100%", padding: 8 }}
                />
              </div>

              <fieldset style={{ border: "1px solid var(--panel-border, #ddd)", borderRadius: 8, padding: 12 }}>
                <legend style={{ padding: "0 6px" }}>{t("sectionTitles.kettle")}</legend>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <label htmlFor="equip-kettle-vol" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("kettleVolumeLitersLabel")}
                    </label>
                    <input
                      id="equip-kettle-vol"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={createKettleVolumeLiters}
                      onChange={(e) => setCreateKettleVolumeLiters(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-kettle-losses" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("kettleLossesLitersLabel")}
                    </label>
                    <input
                      id="equip-kettle-losses"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={createKettleLossesLiters}
                      onChange={(e) => setCreateKettleLossesLiters(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-evap" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("kettleBoilEvaporationRatePercentPerHourLabel")}
                    </label>
                    <input
                      id="equip-evap"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={createKettleBoilEvaporationRatePercentPerHour}
                      onChange={(e) => setCreateKettleBoilEvaporationRatePercentPerHour(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-shrink" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("kettleCoolingShrinkagePercentLabel")}
                    </label>
                    <input
                      id="equip-shrink"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={createKettleCoolingShrinkagePercent}
                      onChange={(e) => setCreateKettleCoolingShrinkagePercent(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-hops-abs" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("kettleHopsAbsorptionLitersLabel")}
                    </label>
                    <input
                      id="equip-hops-abs"
                      type="number"
                      inputMode="decimal"
                      step={0.001}
                      value={createKettleHopsAbsorptionLiters}
                      onChange={(e) => setCreateKettleHopsAbsorptionLiters(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset style={{ border: "1px solid var(--panel-border, #ddd)", borderRadius: 8, padding: 12 }}>
                <legend style={{ padding: "0 6px" }}>{t("sectionTitles.mash")}</legend>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <label htmlFor="equip-mash-vol" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("mashVolumeLitersLabel")}
                    </label>
                    <input
                      id="equip-mash-vol"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={createMashVolumeLiters}
                      onChange={(e) => setCreateMashVolumeLiters(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-mash-eff" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("mashEfficiencyPercentLabel")}
                    </label>
                    <input
                      id="equip-mash-eff"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={createMashEfficiencyPercent}
                      onChange={(e) => setCreateMashEfficiencyPercent(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-mash-losses" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("mashLossesLitersLabel")}
                    </label>
                    <input
                      id="equip-mash-losses"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={createMashLossesLiters}
                      onChange={(e) => setCreateMashLossesLiters(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-mash-thickness" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("mashThicknessLPerKgLabel")}
                    </label>
                    <input
                      id="equip-mash-thickness"
                      type="number"
                      inputMode="decimal"
                      step={0.01}
                      value={createMashThicknessLPerKg}
                      onChange={(e) => setCreateMashThicknessLPerKg(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-grain-abs" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("mashGrainAbsorptionLPerKgLabel")}
                    </label>
                    <input
                      id="equip-grain-abs"
                      type="number"
                      inputMode="decimal"
                      step={0.01}
                      value={createMashGrainAbsorptionLPerKg}
                      onChange={(e) => setCreateMashGrainAbsorptionLPerKg(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="equip-water-leftover" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("mashWaterLeftoverLitersLabel")}
                    </label>
                    <input
                      id="equip-water-leftover"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={createMashWaterLeftoverLiters}
                      onChange={(e) => setCreateMashWaterLeftoverLiters(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset style={{ border: "1px solid var(--panel-border, #ddd)", borderRadius: 8, padding: 12 }}>
                <legend style={{ padding: "0 6px" }}>{t("sectionTitles.misc")}</legend>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <label htmlFor="equip-other-losses" className="muted" style={{ display: "block", fontSize: 12 }}>
                      {t("otherLossesLitersLabel")}
                    </label>
                    <input
                      id="equip-other-losses"
                      type="number"
                      inputMode="decimal"
                      step={0.1}
                      value={createOtherLossesLiters}
                      onChange={(e) => setCreateOtherLossesLiters(e.target.value)}
                      style={{ width: "100%", padding: 8 }}
                    />
                  </div>
                </div>
              </fieldset>
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
              <button type="submit" disabled={createSubmitting}>
                {createSubmitting ? t("creating") : t("create")}
              </button>
            </div>
            {createError ? (
              <pre id="equipment-create-error" className="errorBox" role="alert" style={{ marginTop: 12 }}>
                {createError}
              </pre>
            ) : null}
          </form>
        </details>
      ) : null}
    </>
  );
}

