"use client";

import { useEffect, useState } from "react";

type HealthState =
  | { status: "idle" | "loading" }
  | { status: "ok"; data: unknown }
  | { status: "error"; error: string };

export function HealthPanel() {
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
      <h2 style={{ marginTop: 24 }}>API health</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Fetching <code>{apiBase}/health</code> from the browser (via Nginx).
      </p>
      <pre className="codeBlock">
        {JSON.stringify(state, null, 2)}
      </pre>
    </section>
  );
}

