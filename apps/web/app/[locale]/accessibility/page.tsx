"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { H1, SizableText, View, YStack } from "tamagui";

import { BrewSelect } from "../../_components/BrewSelect";
import { ErrorBox, RecipeEditFieldLabel } from "../../_components/recipe-edit";
import { fetchAuthMe } from "../../_lib/fetchAuthMe.js";
import { webPlatformApiClient } from "../../_lib/webApiClient";
import { ApiClientError, patchAuthPreferences } from "@umbraculum/api-client";

type UiThemeKey = "default" | "hc_dark" | "hc_light";
type UiFontScaleKey = "sm" | "md" | "lg" | "xl";
type UiDensityKey = "comfortable" | "compact";

const COOKIE_THEME = "UI_THEME";
const COOKIE_FONT = "UI_FONT_SCALE";
const COOKIE_DENSITY = "UI_DENSITY";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${name}=`));
  if (!value) return null;
  const idx = value.indexOf("=");
  return idx >= 0 ? decodeURIComponent(value.slice(idx + 1)) : null;
}

function writeCookie(name: string, value: string) {
  const maxAgeSeconds = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function setHtmlDataset(key: "theme" | "density" | "fontScale", value: string) {
  document.documentElement.dataset[key] = value;
}

function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

export default function AccessibilityPage() {
  const t = useTranslations("accessibility");
  const locale = useLocale();

  const allowedTheme = useMemo(() => ["default", "hc_dark", "hc_light"] as const, []);
  const allowedFont = useMemo(() => ["sm", "md", "lg", "xl"] as const, []);
  const allowedDensity = useMemo(() => ["comfortable", "compact"] as const, []);

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [theme, setTheme] = useState<UiThemeKey>("default");
  const [fontScale, setFontScale] = useState<UiFontScaleKey>("md");
  const [density, setDensity] = useState<UiDensityKey>("comfortable");

  // Load from cookies first (works logged out). If logged in, hydrate from profile when cookies are missing/outdated.
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const cTheme = oneOf(readCookie(COOKIE_THEME), allowedTheme, "default");
        const cFont = oneOf(readCookie(COOKIE_FONT), allowedFont, "md");
        const cDensity = oneOf(readCookie(COOKIE_DENSITY), allowedDensity, "comfortable");

        setTheme(cTheme);
        setFontScale(cFont);
        setDensity(cDensity);
        setHtmlDataset("theme", cTheme);
        setHtmlDataset("fontScale", cFont);
        setHtmlDataset("density", cDensity);

        // Try to load server-side preferences (if authenticated).
        const res = await fetchAuthMe();
        if (!res.ok) {
          if (!cancelled) setLoaded(true);
          return;
        }
        const u: Record<string, unknown> = res.data.user ?? {};
        const pTheme = oneOf(u['preferredTheme'], allowedTheme, cTheme);
        const pFont = oneOf(u['preferredFontScale'], allowedFont, cFont);
        const pDensity = oneOf(u['preferredDensity'], allowedDensity, cDensity);

        // If cookies differ, prefer profile and sync cookies + DOM.
        if (pTheme !== cTheme || pFont !== cFont || pDensity !== cDensity) {
          writeCookie(COOKIE_THEME, pTheme);
          writeCookie(COOKIE_FONT, pFont);
          writeCookie(COOKIE_DENSITY, pDensity);
          setHtmlDataset("theme", pTheme);
          setHtmlDataset("fontScale", pFont);
          setHtmlDataset("density", pDensity);
          setTheme(pTheme);
          setFontScale(pFont);
          setDensity(pDensity);
        }
        if (!cancelled) setLoaded(true);
      } catch (e) {
        if (!cancelled) {
          setError(String(e));
          setLoaded(true);
        }
      }
    };
    void init();
    return () => {
      cancelled = true;
    };
  }, [allowedDensity, allowedFont, allowedTheme]);

  const applyAndPersist = async (next: { theme: UiThemeKey; fontScale: UiFontScaleKey; density: UiDensityKey }) => {
    setError(null);

    // Always: persist to cookie + apply immediately
    writeCookie(COOKIE_THEME, next.theme);
    writeCookie(COOKIE_FONT, next.fontScale);
    writeCookie(COOKIE_DENSITY, next.density);
    setHtmlDataset("theme", next.theme);
    setHtmlDataset("fontScale", next.fontScale);
    setHtmlDataset("density", next.density);

    setTheme(next.theme);
    setFontScale(next.fontScale);
    setDensity(next.density);

    // If logged in, also persist to DB. (If logged out, PATCH will 401 and we ignore.)
    setSaving(true);
    try {
      await patchAuthPreferences(webPlatformApiClient(), {
        preferredTheme: next.theme,
        preferredFontScale: next.fontScale,
        preferredDensity: next.density,
      });
    } catch (e) {
      if (e instanceof ApiClientError && e.status === 401) return;
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      <View bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3" maxW={720}>
        <H1 mt={0}>{t("title")}</H1>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
          {t("subtitle")}
        </SizableText>

        {!loaded ? (
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" aria-live="polite">
            {t("loading")}
          </SizableText>
        ) : (
          <YStack gap="$3">
            <YStack gap="$1.5">
              <RecipeEditFieldLabel htmlFor="ui-theme">{t("themePreset")}</RecipeEditFieldLabel>
              <BrewSelect
                id="ui-theme"
                value={theme}
                onValueChange={(v) => {
                  void applyAndPersist({
                    theme: oneOf(v, allowedTheme, "default"),
                    fontScale,
                    density,
                  });
                }}
                options={[
                  { value: "default", label: t("theme.default") },
                  { value: "hc_dark", label: t("theme.hcDark") },
                  { value: "hc_light", label: t("theme.hcLight") },
                ]}
                width="full"
              />
            </YStack>

            <YStack gap="$1.5">
              <RecipeEditFieldLabel htmlFor="ui-font-scale">{t("fontScale")}</RecipeEditFieldLabel>
              <BrewSelect
                id="ui-font-scale"
                value={fontScale}
                onValueChange={(v) => {
                  void applyAndPersist({
                    theme,
                    fontScale: oneOf(v, allowedFont, "md"),
                    density,
                  });
                }}
                options={[
                  { value: "sm", label: t("font.sm") },
                  { value: "md", label: t("font.md") },
                  { value: "lg", label: t("font.lg") },
                  { value: "xl", label: t("font.xl") },
                ]}
                width="full"
              />
            </YStack>

            <YStack gap="$1.5">
              <RecipeEditFieldLabel htmlFor="ui-density">{t("density")}</RecipeEditFieldLabel>
              <BrewSelect
                id="ui-density"
                value={density}
                onValueChange={(v) => {
                  void applyAndPersist({
                    theme,
                    fontScale,
                    density: oneOf(v, allowedDensity, "comfortable"),
                  });
                }}
                options={[
                  { value: "comfortable", label: t("densityOptions.comfortable") },
                  { value: "compact", label: t("densityOptions.compact") },
                ]}
                width="full"
              />
            </YStack>

            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {saving ? t("saving") : t("savingHint")}
            </SizableText>

            {error ? <ErrorBox>{error}</ErrorBox> : null}

            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {t("note", { locale })}
            </SizableText>
          </YStack>
        )}
      </View>
    </View>
  );
}

