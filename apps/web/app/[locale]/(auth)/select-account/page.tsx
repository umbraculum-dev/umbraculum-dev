"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { apiFetch } from "../../../_lib/apiClient";

type AccountListItem = { id: string; name: string; role: string };

const AUTH_CHANGED_EVENT = "brewery:auth-changed";

export default function SelectAccountPage() {
  const locale = useLocale();
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
    <section className="panel" style={{ maxWidth: 720 }}>
      <h1 style={{ marginTop: 0 }}>Select account</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Choose which brewery/account you want to work in.
      </p>

      {loading ? <p className="muted">Loading…</p> : null}

      {error ? (
        <pre className="errorBox" role="alert" style={{ marginTop: 12 }}>
          {error}
        </pre>
      ) : null}

      {!loading && !hasAccounts ? <p className="muted">No accounts found.</p> : null}

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
              <strong>{a.name}</strong> <span className="muted">· {a.role}</span>
              {submittingId === a.id ? <span className="muted"> · Saving…</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

