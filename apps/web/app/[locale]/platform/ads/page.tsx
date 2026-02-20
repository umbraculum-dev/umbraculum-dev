"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { apiFetch } from "../../../_lib/apiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";

type Placement =
  | "global_top"
  | "global_bottom"
  | "recipe_edit_after_fermentables"
  | "recipe_edit_after_hops"
  | "recipe_edit_after_yeast";

type PlatformAd = {
  id: string;
  placement: Placement;
  platform: "web";
  imageUrl: string;
  linkUrl: string;
  altText: string;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  priority: number;
  weight: number;
  createdAt: string;
  updatedAt: string;
};

const placements: Array<{ value: Placement; labelKey: string }> = [
  { value: "global_top", labelKey: "placements.globalTop" },
  { value: "global_bottom", labelKey: "placements.globalBottom" },
  { value: "recipe_edit_after_fermentables", labelKey: "placements.recipeEditAfterFermentables" },
  { value: "recipe_edit_after_hops", labelKey: "placements.recipeEditAfterHops" },
  { value: "recipe_edit_after_yeast", labelKey: "placements.recipeEditAfterYeast" },
];

export default function PlatformAdsPage() {
  const locale = useLocale();
  const t = useTranslations("platformAds");
  const auth = useRequireAuth();

  const isPlatformAdmin = auth.status === "ready" ? Boolean((auth.me.user as any)?.isPlatformAdmin) : false;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PlatformAd[]>([]);

  const [placement, setPlacement] = useState<Placement>("global_top");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState(0);

  const canLoad = useMemo(() => auth.status === "ready" && isPlatformAdmin, [auth.status, isPlatformAdmin]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/platform/ads");
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const ads = (res.data as any)?.ads;
      setItems(Array.isArray(ads) ? (ads as PlatformAd[]) : []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canLoad) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad]);

  const onCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/platform/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placement,
          platform: "web",
          imageUrl,
          linkUrl,
          altText,
          isActive,
          priority,
          weight: 1,
          startsAt: null,
          endsAt: null,
        }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      setImageUrl("");
      setLinkUrl("");
      setAltText("");
      setPriority(0);
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const onToggleActive = async (id: string, next: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/platform/ads/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/platform/ads/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      await refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (auth.status === "loading") return <p className="brew-muted">{t("loading")}</p>;
  if (auth.status === "error") return <pre className="brew-error-box" role="alert">{auth.error}</pre>;

  if (!isPlatformAdmin) {
    return (
      <section className="brew-panel" style={{ maxWidth: 900 }}>
        <h1 style={{ marginTop: 0 }}>{t("title")}</h1>
        <p className="brew-muted" style={{ marginBottom: 0 }}>
          {t("notAuthorized")}
        </p>
      </section>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 900 }}>
      <section className="brew-panel">
        <h1 style={{ marginTop: 0 }}>{t("title")}</h1>
        <p className="brew-muted" style={{ marginTop: 0 }}>
          {t("subtitle")}
        </p>
        <p className="brew-muted" style={{ marginTop: 0 }}>
          {t("hint", { locale })}
        </p>

        {error ? (
          <pre className="brew-error-box" role="alert" style={{ marginTop: 12 }}>
            {error}
          </pre>
        ) : null}

        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label className="brew-muted" style={{ display: "block", fontSize: 12 }} htmlFor="ad-placement">
                {t("form.placement")}
              </label>
              <select
                id="ad-placement"
                value={placement}
                onChange={(e) => setPlacement(e.target.value as Placement)}
                style={{ width: "100%", padding: 8 }}
              >
                {placements.map((p) => (
                  <option key={p.value} value={p.value}>
                    {t(p.labelKey)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="brew-muted" style={{ display: "block", fontSize: 12 }} htmlFor="ad-priority">
                {t("form.priority")}
              </label>
              <input
                id="ad-priority"
                type="number"
                inputMode="numeric"
                step={1}
                value={String(priority)}
                onChange={(e) => setPriority(e.target.value === "" ? 0 : Number(e.target.value))}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
          </div>

          <div>
            <label className="brew-muted" style={{ display: "block", fontSize: 12 }} htmlFor="ad-image-url">
              {t("form.imageUrl")}
            </label>
            <input
              id="ad-image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{ width: "100%", padding: 8 }}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="brew-muted" style={{ display: "block", fontSize: 12 }} htmlFor="ad-link-url">
              {t("form.linkUrl")}
            </label>
            <input
              id="ad-link-url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              style={{ width: "100%", padding: 8 }}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="brew-muted" style={{ display: "block", fontSize: 12 }} htmlFor="ad-alt-text">
              {t("form.altText")}
            </label>
            <input
              id="ad-alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              style={{ width: "100%", padding: 8 }}
              autoComplete="off"
            />
          </div>

          <label className="brew-muted" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            {t("form.isActive")}
          </label>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => void refresh()} disabled={loading}>
              {loading ? t("refreshing") : t("refresh")}
            </button>
            <button type="button" onClick={() => void onCreate()} disabled={loading}>
              {loading ? t("creating") : t("create")}
            </button>
          </div>
        </div>
      </section>

      <section className="brew-panel">
        <h2 style={{ marginTop: 0 }}>{t("listTitle")}</h2>

        {!items.length ? <p className="brew-muted">{t("noAds")}</p> : null}

        {items.length ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">{t("table.placement")}</th>
                  <th align="left">{t("table.imageUrl")}</th>
                  <th align="left">{t("table.linkUrl")}</th>
                  <th align="left">{t("table.active")}</th>
                  <th align="left">{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id}>
                    <td style={{ verticalAlign: "top", paddingTop: 8 }}>
                      <code>{a.placement}</code>
                    </td>
                    <td style={{ verticalAlign: "top", paddingTop: 8 }}>
                      <a href={a.imageUrl} target="_blank" rel="noreferrer noopener">
                        {t("table.open")}
                      </a>
                    </td>
                    <td style={{ verticalAlign: "top", paddingTop: 8 }}>
                      <a href={a.linkUrl} target="_blank" rel="noreferrer noopener">
                        {t("table.open")}
                      </a>
                    </td>
                    <td style={{ verticalAlign: "top", paddingTop: 8 }}>
                      <label className="brew-muted" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                        <input
                          type="checkbox"
                          checked={a.isActive}
                          onChange={(e) => void onToggleActive(a.id, e.target.checked)}
                          aria-label={t("table.toggleActiveAria", { id: a.id })}
                        />
                        {a.isActive ? t("table.yes") : t("table.no")}
                      </label>
                    </td>
                    <td style={{ verticalAlign: "top", paddingTop: 8 }}>
                      <button type="button" onClick={() => void onDelete(a.id)} disabled={loading}>
                        {t("table.delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}

