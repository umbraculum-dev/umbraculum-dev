import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useFocusEffect, useNavigation, useRoute, type NavigationProp, type RouteProp } from "@react-navigation/native";

import { createBrewSession, listBrewSessionsForRecipe } from "@umbraculum/api-client/brewery";
import type { BrewSessionListItem } from "@umbraculum/brewery-contracts";
import { useT } from "@umbraculum/i18n-react";
import { Button, Card, Heading, Screen, Text } from "@umbraculum/ui";

import { useAuth, nativePlatformApiClient } from "@umbraculum/native-shell/auth";
import type { RootStackParamList } from "../../../navigation/types";

export function BrewSessionsListScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "BrewSessionsList">>();
  const { t } = useT("recipes.brewSessions");
  const { state } = useAuth();

  const recipeId = route.params?.recipeId ?? "";
  const canCall = state.status === "logged_in";

  const [sessions, setSessions] = useState<BrewSessionListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!canCall || !recipeId) return;
    setError(null);
    setLoading(true);
    try {
      const api = nativePlatformApiClient(state.status === "logged_in" ? state.token : null);
      const parsed = await listBrewSessionsForRecipe(api, recipeId);
      setSessions(parsed.brewSessions);
    } catch (err) {
      setSessions([]);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [canCall, recipeId, state]);

  const createSession = useCallback(async () => {
    if (!canCall || !recipeId) return;
    setCreateError(null);
    setCreating(true);
    try {
      const api = nativePlatformApiClient(state.status === "logged_in" ? state.token : null);
      const { brewSession } = await createBrewSession(api, recipeId);
      navigation.navigate("BrewSessionDetail", { recipeId, brewSessionId: brewSession.id });
    } catch (err) {
      setCreateError(String(err));
    } finally {
      setCreating(false);
    }
  }, [canCall, recipeId, state, navigation]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const empty = useMemo(() => !loading && !error && sessions.length === 0, [loading, error, sessions.length]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Heading fontSize={20} mb="$3">
          {t("listTitle")}
        </Heading>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <Button onPress={() => { void createSession(); }} disabled={!canCall || creating || !recipeId}>
            <Text>{creating ? t("creating") : t("createButton")}</Text>
          </Button>
          <Button onPress={() => void refresh()} disabled={!canCall || loading || !recipeId} background="$background" borderWidth={1}>
            <Text>{loading ? t("loading") : t("refresh")}</Text>
          </Button>
        </View>

        {createError ? (
          <Text fontSize={12} color="$red10" mb="$2">
            {createError}
          </Text>
        ) : null}
        {error ? (
          <Text fontSize={12} color="$red10" mb="$2">
            {error}
          </Text>
        ) : null}
        {empty ? (
          <Card borderWidth={1} borderColor="$borderColor" mb="$2">
            <Text fontSize={12}>{t("empty")}</Text>
          </Card>
        ) : null}

        <View style={{ gap: 12 }}>
          {sessions.map((session) => (
            <Card key={session.id} gap="$2">
              <Heading fontSize={16}>{session.code}</Heading>
              <Text fontSize={12} opacity={0.8}>
                {t("statusLine", { status: session.status })}
              </Text>
              <Button
                onPress={() => navigation.navigate("BrewSessionDetail", { recipeId, brewSessionId: session.id })}
                size="$3"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text>{t("detailTitle")}</Text>
              </Button>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
