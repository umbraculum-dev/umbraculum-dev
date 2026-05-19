"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { AuthMeResponse } from "@umbraculum/contracts";
import { parseAuthMeResponse } from "@umbraculum/contracts";
import { SizableText, XStack } from "tamagui";

import { apiFetch } from "../_lib/apiClient";
import { AccessibilityLink } from "./AccessibilityLink";
import { AuthExpiredNotice } from "./AuthExpiredNotice";
import { AppMainNav } from "./AppMainNav";
import { AppTopBar } from "./AppTopBar";
import { AuthStatus } from "./AuthStatus";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LoginLink } from "./LoginLink";
import { LogoutButton } from "./LogoutButton";
import { NavSheet } from "./NavSheet";
import { SwitchAccountLink } from "./SwitchAccountLink";

const AUTH_CHANGED_EVENT = "brewery:auth-changed";
const BRAND_COOKIE = "UI_BRAND";

function writeCookie(name: string, value: string) {
  const maxAgeSeconds = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function setBrand(brandKey: string) {
  writeCookie(BRAND_COOKIE, brandKey);
  document.documentElement.dataset['brand'] = brandKey;
}

export function PrimaryNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

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
          next && next.activeWorkspaceId
            ? (next.workspaces as Array<unknown>).find(
                (w) =>
                  w &&
                  typeof w === "object" &&
                  (w as { id?: unknown }).id === next.activeWorkspaceId,
              ) ?? null
            : null;
        const activeRec = active as { brandKey?: unknown } | null;
        const brandKey =
          activeRec && typeof activeRec.brandKey === "string" && activeRec.brandKey
            ? activeRec.brandKey
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
    me && me.activeWorkspaceId
      ? me.workspaces.find((w) => w.id === me.activeWorkspaceId) ?? null
      : null;

  const showMainNav = authKnown && Boolean(me);

  const mainNavItems = [
    { href: "/", label: t("dashboard"), isActive: isActive("/") },
    { href: "/recipes", label: t("recipes"), isActive: isActive("/recipes") },
    { href: "/equipment", label: t("equipment"), isActive: isActive("/equipment") },
    { href: "/automation", label: t("automation"), isActive: isActive("/automation") },
    { href: "/ai", label: t("ai"), isActive: isActive("/ai") },
    { href: "/about", label: t("about"), isActive: isActive("/about") },
  ];

  return (
    <nav aria-label={t("ariaPrimary")}>
      <AuthExpiredNotice />
      <AppTopBar
        ariaLabel={t("ariaSession")}
        left={
          <>
            <LanguageSwitcher />
            <AccessibilityLink />
          </>
        }
        right={
          <>
            {authKnown && me ? (
              <>
                <LogoutButton
                  disabled={loggingOut}
                  onLogoutStart={() => setLoggingOut(true)}
                  onLogout={() => {
                    setLoggingOut(false);
                    setAuthKnown(true);
                    setAuthError(null);
                    setMe(null);
                  }}
                />
              </>
            ) : authKnown ? (
              <LoginLink />
            ) : null}
          </>
        }
        bottom={
          <>
            {authKnown && me ? (
              <XStack ai="center" gap="$3" flexWrap="wrap" minWidth={0}>
                <AuthStatus me={me} activeWorkspace={active} />
                <SwitchAccountLink />
              </XStack>
            ) : null}
            {process.env.NODE_ENV !== "production" && authError ? (
              <XStack ai="center" minHeight={28}>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                  (auth: {authError})
                </SizableText>
              </XStack>
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
