"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type HealthState =
  | { status: "idle" | "loading" }
  | { status: "ok"; data: unknown }
  | { status: "error"; error: string };

export function HealthPanel() {
  const t = useTranslations("health");
  const [state, setState] = useState<HealthState>({ status: "idle" });
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetch(`${apiBase}/health`)
      .then(async (res) => {
        const data = (await res.json()) as unknown;
        if (!cancelled) setState({ status: "ok", data: { httpOk: res.ok, data } });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", error: String(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  return (
    <section>
      <h2 style={{ marginTop: 24 }}>{t("title")}</h2>
      <p className="brew-muted" style={{ marginTop: 0 }}>
        {t("subtitle", { url: `${apiBase}/health` })}
      </p>
      <pre className="brew-code-block">
        {JSON.stringify(state, null, 2)}
      </pre>
    </section>
  );
}

