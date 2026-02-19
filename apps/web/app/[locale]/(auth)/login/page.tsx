"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

import { Link } from "../../../../src/i18n/navigation";
import { apiFetch } from "../../../_lib/apiClient";
import { LocaleSelect } from "../_components/LocaleSelect";

const AUTH_CHANGED_EVENT = "brewery:auth-changed";

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next");

  // Avoid hydration mismatches from password managers injecting DOM pre-hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!mounted) {
    return (
      <section className="panel" style={{ maxWidth: 520 }}>
        <h1 style={{ marginTop: 0 }}>{t("loginTitle")}</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          {t("submitting")}
        </p>
      </section>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, preferredLocale: locale }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));

      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));

      const activeAccountId =
        res.data && typeof res.data === "object" && "activeAccountId" in (res.data as any)
          ? ((res.data as any).activeAccountId as string | null)
          : null;

      if (!activeAccountId) {
        router.replace(`/${locale}/select-account`);
        return;
      }
      router.replace(next && next.startsWith("/") ? next : `/${locale}`);
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="panel" style={{ maxWidth: 520 }}>
      <h1 style={{ marginTop: 0 }}>{t("loginTitle")}</h1>

      <form onSubmit={onSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label className="muted" style={{ display: "block", fontSize: 12 }}>
              {t("emailLabel")}
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 8 }}
              autoComplete="email"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              required
            />
          </div>

          <div>
            <label className="muted" style={{ display: "block", fontSize: 12 }}>
              {t("passwordLabel")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: 8 }}
              autoComplete="current-password"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              required
            />
          </div>

          <LocaleSelect />

          <button type="submit" disabled={submitting}>
            {submitting ? t("submitting") : t("submitLogin")}
          </button>
        </div>
      </form>

      {error ? (
        <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
          {error}
        </pre>
      ) : null}

      <div className="muted" style={{ marginTop: 12 }}>
        <strong>{t("noteTitle")}</strong>
        <div style={{ marginTop: 6 }}>{t("noteBody")}</div>
        <div style={{ marginTop: 8 }}>
          <Link href="/contributing?topic=i18n">{t("helpTranslate")}</Link>
        </div>
      </div>
    </section>
  );
}

