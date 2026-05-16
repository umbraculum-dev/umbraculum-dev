"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { AiChatPanel as SharedAiChatPanel } from "@brewery/ui";

import { useAiChat } from "./useAiChat";

/**
 * Web binding for {@link SharedAiChatPanel}.
 *
 * Wires next-intl translations + the upgrade-page navigation callback;
 * everything visual lives in the shared component so web and native
 * stay in lockstep.
 */
export function AiChatPanel() {
  const t = useTranslations("ai");
  const router = useRouter();
  const chat = useAiChat();

  const onOpenUpgrade = useCallback(() => {
    router.push("upgrade");
  }, [router]);

  return <SharedAiChatPanel chat={chat} t={t} onOpenUpgrade={onOpenUpgrade} />;
}
