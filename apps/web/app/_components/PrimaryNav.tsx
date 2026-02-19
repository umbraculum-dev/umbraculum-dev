"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Link } from "../../src/i18n/navigation";
import type { AuthMeResponse } from "@brewery/contracts";
import { parseAuthMeResponse } from "@brewery/contracts";

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
            <label className="muted" style={{ fontSize: 11 }}>
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
            </label>
            <Link href="/accessibility" className="navActionButton">
              {t("accessibility")}
            </Link>
            {authKnown && me ? (
              <>
                <span className="muted">
                  {t("signedInAs")}: <code>{me.user.email}</code>
                </span>
                <span className="muted">
                  {t("activeAccount")}:{" "}
                  {active ? (
                    <>
                      <code>{active.name}</code>
                      <span className="muted">{" "}(</span>
                      <code>{active.id}</code>
                      <span className="muted">)</span>
                    </>
                  ) : (
                    <code>{me.activeAccountId ?? "—"}</code>
                  )}
                </span>
              </>
            ) : null}
            {process.env.NODE_ENV !== "production" && authError ? (
              <span className="muted">(auth: {authError})</span>
            ) : null}
          </>
        }
        right={
          <>
            {authKnown && me ? (
              <>
                <Link href="/select-account" className="muted">
                  {t("switchAccount")}
                </Link>
                <button
                  type="button"
                  onClick={() => {
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
                  disabled={loggingOut}
                >
                  {loggingOut ? `${t("logout")}…` : t("logout")}
                </button>
              </>
            ) : authKnown ? (
              <Link href="/login">{t("login")}</Link>
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
