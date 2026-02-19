"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Link } from "../../src/i18n/navigation";
import type { AuthMeResponse } from "@brewery/contracts";
import { parseAuthMeResponse } from "@brewery/contracts";
import { Button, Text, XStack } from "tamagui";

import { apiFetch } from "../_lib/apiClient";
import { AppMainNav } from "./AppMainNav";
import { AppTopBar } from "./AppTopBar";
import { NavSheet } from "./NavSheet";

const AUTH_CHANGED_EVENT = "brewery:auth-changed";
const BRAND_COOKIE = "UI_BRAND";

function writeCookie(name: string, value: string) {
  const maxAgeSeconds = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function setBrand(brandKey: string) {
  writeCookie(BRAND_COOKIE, brandKey);
  document.documentElement.dataset.brand = brandKey;
}

export function PrimaryNav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pathnameNoLocale = (() => {
    const p = typeof pathname === "string" ? pathname : "/";
    const parts = p.split("/");
    if (parts.length > 1) parts[1] = "";
    const rebuilt = parts.join("/").replace(/\/{2,}/g, "/");
    return rebuilt === "" ? "/" : rebuilt;
  })();

  const isActive = (href: string) => {
    if (href === "/") return pathnameNoLocale === "/" || pathnameNoLocale === "";
    return pathnameNoLocale === href || pathnameNoLocale.startsWith(`${href}/`);
  };

  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [authKnown, setAuthKnown] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await apiFetch("/api/auth/me");
        if (cancelled) return;
        setAuthKnown(true);
        setAuthError(null);
        if (!res.ok) {
          setMe(null);
          return;
        }
        const next = parseAuthMeResponse(res.data);
        setMe(next);

        const active =
          next && next.activeAccountId
            ? (next.accounts as any[]).find((a) => a && typeof a === "object" && (a as any).id === next.activeAccountId) ?? null
            : null;
        const brandKey =
          active && typeof (active as any).brandKey === "string" && (active as any).brandKey
            ? ((active as any).brandKey as string)
            : "default";

        try {
          setBrand(brandKey);
        } catch {
          // ignore
        }
      } catch {
        if (cancelled) return;
        setAuthKnown(true);
        setAuthError("auth_me_failed");
        setMe(null);
      }
    };

    void check();

    const onAuthChanged = () => void check();
    const onFocus = () => void check();
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname]);

  const active =
    me && me.activeAccountId ? me.accounts.find((a) => a.id === me.activeAccountId) ?? null : null;

  const showMainNav = authKnown && Boolean(me);

  const mainNavItems = [
    { href: "/", label: t("dashboard"), isActive: isActive("/") },
    { href: "/recipes", label: t("recipes"), isActive: isActive("/recipes") },
    { href: "/equipment", label: t("equipment"), isActive: isActive("/equipment") },
    { href: "/about", label: t("about"), isActive: isActive("/about") },
  ];

  return (
    <nav aria-label={t("ariaPrimary")}>
      <AppTopBar
        ariaLabel={t("ariaSession")}
        left={
          <>
            <XStack ai="center" gap="$1">
              <Text as="label" color="var(--text-muted)" fontSize={11}>
                {t("language")}{" "}
                <select
                  value={locale}
                  onChange={(e) => {
                    const next = e.target.value;
                    const parts = (pathname || "/").split("/");
                    if (parts.length > 1) parts[1] = next;
                    const nextPath = parts.join("/") || `/${next}`;
                    const qs = searchParams?.toString();
                    router.push(qs ? `${nextPath}?${qs}` : nextPath);
                  }}
                  style={{ marginLeft: 6 }}
                >
                  <option value="en">EN</option>
                  <option value="it">IT</option>
                </select>
              </Text>
            </XStack>
            <Link href="/accessibility" style={{ display: "contents", textDecoration: "none" }}>
              <XStack
                as="span"
                ai="center"
                px="$1"
                py="$0.5"
                borderRadius="$2"
                borderWidth={1}
                borderColor="color-mix(in srgb, var(--focus-ring) 25%, var(--border))"
                backgroundColor="color-mix(in srgb, var(--focus-ring) 14%, var(--surface-2))"
                color="var(--text)"
                fontSize={11}
                cursor="pointer"
                hoverStyle={{
                  textDecoration: "none",
                  borderColor: "color-mix(in srgb, var(--focus-ring) 25%, var(--border))",
                  backgroundColor: "color-mix(in srgb, var(--focus-ring) 14%, var(--surface-2))",
                }}
                focusStyle={{ outlineWidth: 2, outlineColor: "var(--focus-ring)" }}
              >
                <Text color="var(--text)" fontSize={11}>
                  {t("accessibility")}
                </Text>
              </XStack>
            </Link>
            {authKnown && me ? (
              <>
                <Text color="var(--text-muted)" fontSize={11}>
                  {t("signedInAs")}: <code>{me.user.email}</code>
                </Text>
                <Text color="var(--text-muted)" fontSize={11}>
                  {t("activeAccount")}:{" "}
                  {active ? (
                    <>
                      <code>{active.name}</code>
                      {" "}(<code>{active.id}</code>)
                    </>
                  ) : (
                    <code>{me.activeAccountId ?? "—"}</code>
                  )}
                </Text>
              </>
            ) : null}
            {process.env.NODE_ENV !== "production" && authError ? (
              <Text color="var(--text-muted)" fontSize={11}>
                (auth: {authError})
              </Text>
            ) : null}
          </>
        }
        right={
          <>
            {authKnown && me ? (
              <>
                <Link href="/select-account" style={{ textDecoration: "none" }}>
                  <Text color="var(--text-muted)" fontSize={11} hoverStyle={{ textDecoration: "underline" }}>
                    {t("switchAccount")}
                  </Text>
                </Link>
                <Button
                  size="$1"
                  chromeless
                  fontSize={11}
                  px="$1"
                  py="$0.5"
                  color="var(--text)"
                  backgroundColor="transparent"
                  borderWidth={0}
                  hoverStyle={{ textDecoration: "underline" }}
                  pressStyle={{ opacity: 0.8 }}
                  disabled={loggingOut}
                  onPress={() => {
                    setLoggingOut(true);
                    apiFetch("/api/auth/logout", { method: "POST" })
                      .catch(() => {})
                      .finally(() => {
                        setLoggingOut(false);
                        setAuthKnown(true);
                        setAuthError(null);
                        setMe(null);
                        window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
                        router.replace(`/${locale}/login`);
                      });
                  }}
                >
                  {loggingOut ? `${t("logout")}…` : t("logout")}
                </Button>
              </>
            ) : authKnown ? (
              <Link href="/login" style={{ textDecoration: "none" }}>
                <Text color="var(--info)" fontSize={11} hoverStyle={{ textDecoration: "underline" }}>
                  {t("login")}
                </Text>
              </Link>
            ) : null}
          </>
        }
      />

      {showMainNav ? (
        <NavSheet triggerLabel={t("menu")} ariaLabel={t("ariaPrimary")}>
          <AppMainNav items={mainNavItems} ariaLabel={t("ariaPrimary")} />
        </NavSheet>
      ) : null}
    </nav>
  );
}
