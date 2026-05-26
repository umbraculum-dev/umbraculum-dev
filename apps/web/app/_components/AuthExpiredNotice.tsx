"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button, SizableText, View, XStack } from "tamagui";

export const AUTH_EXPIRED_EVENT = "brewery:auth-expired";

type AuthExpiredDetail = { next?: string; reason?: string };

function safeDetail(e: Event): AuthExpiredDetail {
  const ce = e as CustomEvent<AuthExpiredDetail>;
  const d = ce?.detail;
  return d && typeof d === "object" ? d : {};
}

function currentPath(): string {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search ?? ""}`;
}

export function AuthExpiredNotice(props: {
  /**
   * If true, the notice is always visible and will redirect automatically.
   * Use this on pages that don’t share the global app shell (e.g. select-workspace).
   */
  forceVisible?: boolean;
  /**
   * Use when you already know what the next path should be.
   */
  nextOverride?: string;
  /**
   * Seconds to wait before redirecting to login.
   */
  redirectAfterSeconds?: number;
}) {
  const t = useTranslations("auth.sessionExpired");
  const locale = useLocale();
  const router = useRouter();

  const redirectAfterSeconds = props.redirectAfterSeconds ?? 10;

  const [visible, setVisible] = useState(Boolean(props.forceVisible));
  const [next, setNext] = useState<string>(props.nextOverride ?? currentPath());
  const [secondsLeft, setSecondsLeft] = useState<number>(redirectAfterSeconds);
  const timerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const dismissRef = useRef<number | null>(null);

  const loginHref = useMemo(() => {
    const safeNext = next || "/";
    return `/${locale}/login?next=${encodeURIComponent(safeNext)}`;
  }, [locale, next]);

  const start = (nextPath: string) => {
    if (timerRef.current != null) return;

    if (typeof window !== "undefined") {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        // ignore
      }
    }

    setNext(nextPath || currentPath());
    setVisible(true);
    setSecondsLeft(redirectAfterSeconds);

    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    if (tickRef.current != null) window.clearInterval(tickRef.current);
    if (dismissRef.current != null) window.clearTimeout(dismissRef.current);

    const startedAt = Date.now();
    tickRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, redirectAfterSeconds - elapsed);
      setSecondsLeft(left);
    }, 250);

    timerRef.current = window.setTimeout(() => {
      router.replace(loginHref);
      dismissRef.current = window.setTimeout(() => {
        setVisible(false);
        if (timerRef.current != null) window.clearTimeout(timerRef.current);
        if (tickRef.current != null) window.clearInterval(tickRef.current);
        timerRef.current = null;
        tickRef.current = null;
      }, 750);
    }, redirectAfterSeconds * 1000);
  };

  useEffect(() => {
    if (props.forceVisible) start(props.nextOverride ?? currentPath());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.forceVisible]);

  useEffect(() => {
    const onExpired = (e: Event) => {
      const d = safeDetail(e);
      start(d.next ?? currentPath());
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
      if (tickRef.current != null) window.clearInterval(tickRef.current);
      if (dismissRef.current != null) window.clearTimeout(dismissRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginHref]);

  if (!visible) return null;

  const onLoginNow = () => {
    router.replace(loginHref);
    if (dismissRef.current != null) window.clearTimeout(dismissRef.current);
    dismissRef.current = window.setTimeout(() => setVisible(false), 250);
  };

  return (
    <View
      role="status"
      aria-live="polite"
      bg="var(--surface)"
      borderWidth={1}
      borderColor="var(--border)"
      rounded="$2"
      p="$3"
      mb="$3"
    >
      <SizableText size="$3" fontWeight="bold" fontFamily="$body">
        {t("title")}
      </SizableText>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1">
        {t("body")}
      </SizableText>

      <XStack gap="$3" ai="center" flexWrap="wrap" mt="$2">
        <Button size="$2" onPress={onLoginNow} bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)">
          {t("cta")}
        </Button>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("countdown", { seconds: secondsLeft })}
        </SizableText>
      </XStack>
    </View>
  );
}

