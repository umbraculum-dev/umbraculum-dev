"use client";

import { useTranslations } from "next-intl";
import type { AuthMeResponse } from "@brewery/contracts";
import { SizableText, XStack } from "tamagui";

import { CodeInline } from "./CodeInline";

export interface AuthStatusProps {
  me: AuthMeResponse;
  activeAccount: { id: string; name: string } | null;
}

export function AuthStatus({ me, activeAccount }: AuthStatusProps) {
  const t = useTranslations("nav");

  return (
    <XStack ai="center" gap="$2" flexWrap="wrap" minHeight={28}>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("signedInAs")}: <CodeInline>{me.user.email}</CodeInline>
      </SizableText>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("activeAccount")}:{" "}
        {activeAccount ? (
          activeAccount.name
        ) : (
          <CodeInline>{me.activeAccountId ?? "—"}</CodeInline>
        )}
      </SizableText>
    </XStack>
  );
}
