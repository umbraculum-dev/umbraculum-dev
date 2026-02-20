"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { apiFetch } from "../../../_lib/apiClient";

type AccountListItem = { id: string; name: string; role: string; brandKey?: string | null };

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

export default function SelectAccountPage() {
  const locale = useLocale();
  const t = useTranslations("auth.selectAccount");
  const router = useRouter();

  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await apiFetch("/api/auth/me");
        if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
        const list = (res.data as any)?.accounts;
        const items: AccountListItem[] = Array.isArray(list) ? list : [];
        if (!cancelled) setAccounts(items);
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasAccounts = useMemo(() => accounts.length > 0, [accounts.length]);

  const onPick = async (accountId: string) => {
    setSubmittingId(accountId);
    setError(null);
    try {
      const picked = accounts.find((a) => a.id === accountId) ?? null;
      const brandKey = (picked?.brandKey && typeof picked.brandKey === "string" ? picked.brandKey : "default") ?? "default";
      setBrand(brandKey);

      const res = await apiFetch("/api/auth/active-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
      router.replace(`/${locale}`);
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <section className="brew-panel" style={{ maxWidth: 720 }}>
      <h1 style={{ marginTop: 0 }}>{t("title")}</h1>
      <p className="brew-muted" style={{ marginTop: 0 }}>
        {t("subtitle")}
      </p>

      {loading ? <p className="brew-muted">{t("loading")}</p> : null}

      {error ? (
        <pre className="brew-error-box" role="alert" style={{ marginTop: 12 }}>
          {error}
        </pre>
      ) : null}

      {!loading && !hasAccounts ? <p className="brew-muted">{t("noAccountsFound")}</p> : null}

      {hasAccounts ? (
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {accounts.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => void onPick(a.id)}
              disabled={Boolean(submittingId)}
              style={{ textAlign: "left" }}
            >
              <strong>{a.name}</strong> <span className="brew-muted">· {a.role}</span>
              {submittingId === a.id ? <span className="brew-muted"> · Saving…</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

