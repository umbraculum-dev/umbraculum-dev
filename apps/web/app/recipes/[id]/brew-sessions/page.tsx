"use client";

import { Link, useRouter } from "../../../../src/i18n/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button, H1, SizableText, View, XStack, YStack } from "tamagui";

import { apiFetch } from "../../../_lib/apiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { ErrorBox, MessageBox } from "../../../_components/recipe-edit";

type BrewSessionListItem = {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  startedAt: string | null;
  stoppedAt: string | null;
};

export default function RecipeBrewSessionsPage() {
  const t = useTranslations("recipes.brewSessions");
  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready" && !!authState.me.activeWorkspaceId;

  const router = useRouter();
  const params = useParams() as { id?: string };
  const recipeId = params?.id ?? "";

  const [sessions, setSessions] = useState<BrewSessionListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const refresh = async () => {
    if (!canCall || !recipeId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch(`/api/recipes/${recipeId}/brew-sessions`);
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const list = (res.data as any)?.brewSessions;
      setSessions(Array.isArray(list) ? (list as BrewSessionListItem[]) : []);
    } catch (err) {
      setSessions([]);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCall, recipeId]);

  const onCreate = async () => {
    if (!canCall || !recipeId) return;
    setCreateError(null);
    setCreating(true);
    try {
      const res = await apiFetch(`/api/recipes/${recipeId}/brew-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const id = (res.data as any)?.brewSession?.id;
      if (typeof id !== "string" || !id) throw new Error("Create brew session response is missing brewSession.id");
      router.push(`/recipes/${recipeId}/brew-sessions/${id}`);
    } catch (err) {
      setCreateError(String(err));
    } finally {
      setCreating(false);
    }
  };

  const empty = useMemo(() => !loading && !error && sessions.length === 0, [loading, error, sessions.length]);

  return (
    <YStack gap="$3">
      <H1 mb="$2">{t("listTitle")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        <Link href={`/recipes/${recipeId}/edit`}>{t("backToRecipeEdit")}</Link>
      </SizableText>

      <XStack gap="$3" items="center" flexWrap="wrap">
        <Button
          onPress={onCreate}
          disabled={!canCall || creating || !recipeId}
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
        >
          {creating ? t("creating") : t("createButton")}
        </Button>
        <Button
          onPress={() => void refresh()}
          disabled={!canCall || loading || !recipeId}
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
        >
          {loading ? t("loading") : t("refresh")}
        </Button>
      </XStack>

      {createError ? <ErrorBox>{createError}</ErrorBox> : null}
      {error ? <ErrorBox>{error}</ErrorBox> : null}
      {empty ? <MessageBox variant="success">{t("empty")}</MessageBox> : null}

      {sessions.length ? (
        <YStack gap="$2" mt="$2">
          {sessions.map((s) => (
            <View
              key={s.id}
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              p="$3"
            >
              <YStack gap="$1">
                <SizableText size="$3" fontFamily="$body" color="var(--text)">
                  <Link href={`/recipes/${recipeId}/brew-sessions/${s.id}`}>{s.code}</Link>
                </SizableText>
                <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}>
                  {t("statusLine", { status: s.status })}
                </SizableText>
              </YStack>
            </View>
          ))}
        </YStack>
      ) : null}
    </YStack>
  );
}

