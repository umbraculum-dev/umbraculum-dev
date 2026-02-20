"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { H2, SizableText, View } from "tamagui";

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
    <View
      bg="var(--surface)"
      borderWidth={1}
      borderColor="var(--border)"
      rounded="$2"
      p="$3"
    >
      <H2 mt="$4">{t("title")}</H2>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle", { url: `${apiBase}/health` })}
      </SizableText>
      <View
        bg="var(--surface-2)"
        borderWidth={1}
        borderColor="var(--border)"
        rounded="$2"
        p="$3"
        overflow="auto"
      >
        <SizableText size="$2" fontFamily="$mono" whiteSpace="pre-wrap">
          {JSON.stringify(state, null, 2)}
        </SizableText>
      </View>
    </View>
  );
}

