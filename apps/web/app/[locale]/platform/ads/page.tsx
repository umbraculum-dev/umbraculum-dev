"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { H1, H2, SizableText, View, XStack, YStack } from "tamagui";

import { apiFetch } from "../../../_lib/apiClient";
import { RecipeEditFieldLabel } from "../../../_components/recipe-edit";
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
      <YStack maxWidth={900}>
        <View className="brew-panel">
          <H1 mt={0}>{t("title")}</H1>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}>
            {t("notAuthorized")}
          </SizableText>
        </View>
      </YStack>
    );
  }

  return (
    <YStack gap="$4" maxWidth={900}>
      <View className="brew-panel">
        <H1 mt={0}>{t("title")}</H1>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
          {t("subtitle")}
        </SizableText>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
          {t("hint", { locale })}
        </SizableText>

        {error ? (
          <pre className="brew-error-box brew-mt3" role="alert">
            {error}
          </pre>
        ) : null}

        <YStack mt="$3" gap="$3">
          <div className="brew-grid-2col">
            <div>
              <RecipeEditFieldLabel htmlFor="ad-placement">
                {t("form.placement")}
              </RecipeEditFieldLabel>
              <select
                id="ad-placement"
                value={placement}
                onChange={(e) => setPlacement(e.target.value as Placement)}
                className="brew-recipe-edit-select brew-recipe-edit-select-full"
              >
                {placements.map((p) => (
                  <option key={p.value} value={p.value}>
                    {t(p.labelKey)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <RecipeEditFieldLabel htmlFor="ad-priority">
                {t("form.priority")}
              </RecipeEditFieldLabel>
              <input
                id="ad-priority"
                type="number"
                inputMode="numeric"
                step={1}
                value={String(priority)}
                onChange={(e) => setPriority(e.target.value === "" ? 0 : Number(e.target.value))}
                className="brew-recipe-edit-select brew-recipe-edit-select-full"
              />
            </div>
          </div>

          <div>
            <RecipeEditFieldLabel htmlFor="ad-image-url">
              {t("form.imageUrl")}
            </RecipeEditFieldLabel>
            <input
              id="ad-image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="brew-recipe-edit-select brew-recipe-edit-select-full"
              autoComplete="off"
            />
          </div>

          <div>
            <RecipeEditFieldLabel htmlFor="ad-link-url">
              {t("form.linkUrl")}
            </RecipeEditFieldLabel>
            <input
              id="ad-link-url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="brew-recipe-edit-select brew-recipe-edit-select-full"
              autoComplete="off"
            />
          </div>

          <div>
            <RecipeEditFieldLabel htmlFor="ad-alt-text">
              {t("form.altText")}
            </RecipeEditFieldLabel>
            <input
              id="ad-alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="brew-recipe-edit-select brew-recipe-edit-select-full"
              autoComplete="off"
            />
          </div>

          <label className="brew-radio-label brew-muted">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            {t("form.isActive")}
          </label>

          <XStack gap="$2" justifyContent="flex-end">
            <button type="button" onClick={() => void refresh()} disabled={loading}>
              {loading ? t("refreshing") : t("refresh")}
            </button>
            <button type="button" onClick={() => void onCreate()} disabled={loading}>
              {loading ? t("creating") : t("create")}
            </button>
          </XStack>
        </YStack>
      </View>

      <View className="brew-panel">
        <H2 mt={0}>{t("listTitle")}</H2>

        {!items.length ? (
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
            {t("noAds")}
          </SizableText>
        ) : null}

        {items.length ? (
          <View className="brew-table-wrap">
            <table className="brew-table">
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
                    <td className="brew-table-cell-top">
                      <code>{a.placement}</code>
                    </td>
                    <td className="brew-table-cell-top">
                      <a href={a.imageUrl} target="_blank" rel="noreferrer noopener">
                        {t("table.open")}
                      </a>
                    </td>
                    <td className="brew-table-cell-top">
                      <a href={a.linkUrl} target="_blank" rel="noreferrer noopener">
                        {t("table.open")}
                      </a>
                    </td>
                    <td className="brew-table-cell-top">
                      <label className="brew-radio-label brew-muted">
                        <input
                          type="checkbox"
                          checked={a.isActive}
                          onChange={(e) => void onToggleActive(a.id, e.target.checked)}
                          aria-label={t("table.toggleActiveAria", { id: a.id })}
                        />
                        {a.isActive ? t("table.yes") : t("table.no")}
                      </label>
                    </td>
                    <td className="brew-table-cell-top">
                      <button type="button" onClick={() => void onDelete(a.id)} disabled={loading}>
                        {t("table.delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </View>
        ) : null}
      </View>
    </YStack>
  );
}

