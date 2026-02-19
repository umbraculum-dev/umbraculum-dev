"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "tamagui";

import { apiFetch } from "../_lib/apiClient";

const AUTH_CHANGED_EVENT = "brewery:auth-changed";

export interface LogoutButtonProps {
  disabled?: boolean;
  onLogoutStart: () => void;
  onLogout: () => void;
}

export function LogoutButton({ disabled, onLogoutStart, onLogout }: LogoutButtonProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();

  return (
    <Button
      size="$2"
      px="$2"
      height={28}
      color="var(--text)"
      backgroundColor="transparent"
      borderWidth={0}
      fontFamily="$body"
      hoverStyle={{ textDecoration: "underline" }}
      pressStyle={{ opacity: 0.8 }}
      disabled={disabled}
      onPress={() => {
        onLogoutStart();
        apiFetch("/api/auth/logout", { method: "POST" })
          .catch(() => {})
          .finally(() => {
            onLogout();
            window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
            router.replace(`/${locale}/login`);
          });
      }}
    >
      {disabled ? `${t("logout")}…` : t("logout")}
    </Button>
  );
}
