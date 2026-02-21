"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button, Checkbox, H1, H2, Input, SizableText, View, XStack, YStack } from "tamagui";

import { apiFetch } from "../../../_lib/apiClient";
import { BrewSelect } from "../../../_components/BrewSelect";
import { ErrorBox, RecipeEditFieldLabel } from "../../../_components/recipe-edit";
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

  if (auth.status === "loading") return <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{t("loading")}</SizableText>;
  if (auth.status === "error") return <ErrorBox>{auth.error}</ErrorBox>;

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
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5">
          {t("globalBottomNote")}
        </SizableText>

        {error ? (
          <ErrorBox mt="$3">{error}</ErrorBox>
        ) : null}

        <YStack mt="$3" gap="$3">
          <XStack gap="$3" flexWrap="wrap" ai="flex-end">
            <View flex={1} minWidth={200}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="ad-placement">
                {t("form.placement")}
              </RecipeEditFieldLabel>
              <BrewSelect
                id="ad-placement"
                value={placement}
                onValueChange={(v) => setPlacement(v as Placement)}
                options={placements.map((p) => ({ value: p.value, label: t(p.labelKey) }))}
                width="full"
              />
              </YStack>
            </View>
            <View flex={1} minWidth={200}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="ad-priority">
                {t("form.priority")}
              </RecipeEditFieldLabel>
              <Input
                id="ad-priority"
                keyboardType="numeric"
                value={String(priority)}
                onChangeText={(text) => setPriority(text === "" ? 0 : Number(text))}
                size="$3"
                w="100%"
                bg="var(--surface)"
                borderWidth={1}
                borderColor="var(--border)"
                rounded="$2"
                fontFamily="$body"
              />
              </YStack>
            </View>
          </XStack>

          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="ad-image-url">
              {t("form.imageUrl")}
            </RecipeEditFieldLabel>
            <Input
              id="ad-image-url"
              value={imageUrl}
              onChangeText={setImageUrl}
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
              autoComplete="off"
            />
          </YStack>

          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="ad-link-url">
              {t("form.linkUrl")}
            </RecipeEditFieldLabel>
            <Input
              id="ad-link-url"
              value={linkUrl}
              onChangeText={setLinkUrl}
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
              autoComplete="off"
            />
          </YStack>

          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="ad-alt-text">
              {t("form.altText")}
            </RecipeEditFieldLabel>
            <Input
              id="ad-alt-text"
              value={altText}
              onChangeText={setAltText}
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
              autoComplete="off"
            />
          </YStack>

          <XStack gap="$2" alignItems="center" className="brew-muted">
            <Checkbox
              id="ad-is-active"
              checked={isActive}
              onCheckedChange={(c) => setIsActive(c === true)}
              aria-label={t("form.isActive")}
              size="$2"
              native
            >
              <Checkbox.Indicator />
            </Checkbox>
            <SizableText as="label" htmlFor="ad-is-active" size="$2" color="var(--text-muted)" fontFamily="$body">
              {t("form.isActive")}
            </SizableText>
          </XStack>

          <XStack gap="$2" justifyContent="flex-end">
            <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void refresh()} disabled={loading}>
              {loading ? t("refreshing") : t("refresh")}
            </Button>
            <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCreate()} disabled={loading}>
              {loading ? t("creating") : t("create")}
            </Button>
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
                      <XStack gap="$2" alignItems="center" className="brew-muted">
                        <Checkbox
                          id={`ad-toggle-active-${a.id}`}
                          checked={a.isActive}
                          onCheckedChange={(c) => void onToggleActive(a.id, c === true)}
                          aria-label={t("table.toggleActiveAria", { id: a.id })}
                          size="$2"
                          native
                        >
                          <Checkbox.Indicator />
                        </Checkbox>
                        <SizableText as="label" htmlFor={`ad-toggle-active-${a.id}`} size="$2" color="var(--text-muted)" fontFamily="$body">
                          {a.isActive ? t("table.yes") : t("table.no")}
                        </SizableText>
                      </XStack>
                    </td>
                    <td className="brew-table-cell-top">
                      <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onDelete(a.id)} disabled={loading}>
                        {t("table.delete")}
                      </Button>
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

