"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Link } from "../../src/i18n/navigation";
import { apiFetch } from "../_lib/apiClient";
import type { AuthMeResponse } from "../_lib/useRequireAuth";

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
        const next = res.data as AuthMeResponse;
        setMe(next);

        const active =
          next && next.activeAccountId
            ? (next.accounts as any[]).find((a) => a && typeof a === "object" && (a as any).id === next.activeAccountId) ?? null
            : null;
        const brandKey =
          active && typeof (active as any).brandKey === "string" && (active as any).brandKey
            ? ((active as any).brandKey as string)
            : "default";

        // Best-effort: keep cookie + <html data-brand> in sync so SSR doesn't flash after refresh.
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

    // Keep nav state accurate after login/logout, tab focus, or client-side navigation.
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

  return (
    <nav aria-label={t("ariaPrimary")}>
      <div className="navTopBar" aria-label={t("ariaSession")}>
        <div className="navTopBarLeft">
          <label className="muted" style={{ fontSize: 11 }}>
            {t("language")}{" "}
            <select
              value={locale}
              onChange={(e) => {
                const next = e.target.value;
                const parts = (pathname || "/").split("/");
                // pathname includes locale prefix: /en/...
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
        </div>
        <div className="navTopBarRight">
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
        </div>
      </div>

      {showMainNav ? (
        <ul className="navList">
          <li>
            <Link href="/" aria-current={isActive("/") ? "page" : undefined}>
              {t("dashboard")}
            </Link>
          </li>
          <li>
            <Link href="/recipes" aria-current={isActive("/recipes") ? "page" : undefined}>
              {t("recipes")}
            </Link>
          </li>
          <li>
            <Link href="/equipment" aria-current={isActive("/equipment") ? "page" : undefined}>
              {t("equipment")}
            </Link>
          </li>
          <li>
            <Link href="/about" aria-current={isActive("/about") ? "page" : undefined}>
              {t("about")}
            </Link>
          </li>
        </ul>
      ) : null}
    </nav>
  );
}

