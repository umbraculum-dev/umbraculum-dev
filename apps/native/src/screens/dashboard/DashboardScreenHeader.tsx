import React from "react";
import { View } from "react-native";
import type { TranslationValues } from "@umbraculum/i18n-react";
import { Button, Card, Heading, Spinner, Text } from "@umbraculum/ui";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { RootStackParamList, TabParamList } from "../../navigation/types";
import { jsonPreview, type HealthState } from "./dashboardScreenUtils";

type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Dashboard">,
  NativeStackNavigationProp<RootStackParamList>
>;

export function DashboardScreenHeader(props: {
  t: (key: string, params?: TranslationValues) => string;
  tHealth: (key: string, params?: TranslationValues) => string;
  tNav: (key: string) => string;
  baseUrl: string | null;
  healthState: HealthState;
  navigation: DashboardNavigationProp;
}) {
  const { t, tHealth, tNav, baseUrl, healthState, navigation } = props;

  return (
    <>
      <View style={{ gap: 6 }}>
        <Heading fontSize={28}>{t("title")}</Heading>
        <Text fontSize={14} opacity={0.8}>
          {t("subtitle")}
        </Text>
      </View>

      <Card gap="$2" aria-label={tHealth("title")}>
        <Heading fontSize={18}>{tHealth("title")}</Heading>
        <Text fontSize={12} opacity={0.8}>
          {tHealth("subtitle", { url: baseUrl ?? "(missing)" })}
        </Text>

        {healthState.status === "loading" ? (
          <View style={{ paddingVertical: 8 }}>
            <Spinner />
          </View>
        ) : healthState.status === "error" ? (
          <Text color="$red10" fontSize={12}>
            {healthState.errorKey ? tNav(healthState.errorKey) : healthState.error}
          </Text>
        ) : healthState.status === "ok" ? (
          <View style={{ gap: 6 }}>
            <Text fontSize={11} opacity={0.75}>
              {jsonPreview(healthState.health)}
            </Text>
          </View>
        ) : null}
      </Card>

      <Card gap="$2" aria-label={tHealth("appPermissions.title")}>
        <Heading fontSize={18}>{tHealth("appPermissions.title")}</Heading>
        <Text fontSize={12} opacity={0.8}>
          {tHealth("appPermissions.subtitle")}
        </Text>

        {healthState.status === "loading" ? (
          <View style={{ paddingVertical: 8 }}>
            <Spinner />
          </View>
        ) : healthState.status === "error" ? (
          <Text color="$red10" fontSize={12}>
            {healthState.errorKey ? tNav(healthState.errorKey) : healthState.error}
          </Text>
        ) : healthState.status === "ok" ? (
          <View style={{ gap: 6 }}>
            <Text fontSize={12} opacity={0.85}>
              {tHealth("appPermissions.userLabel")}: {(healthState.me as { user?: { email?: unknown } } | null | undefined)?.user?.email ?? "—"}
            </Text>
            <Text fontSize={12} opacity={0.85}>
              {tHealth("appPermissions.activeWorkspaceLabel")}: {(healthState.me as { activeWorkspaceId?: unknown } | null | undefined)?.activeWorkspaceId ?? "—"}
            </Text>
            <Text fontSize={12} opacity={0.85}>
              {tHealth("appPermissions.roleLabel")}: {(healthState.me as { role?: unknown } | null | undefined)?.role ?? tHealth("appPermissions.roleUnknown")}
            </Text>
            <Button
              onPress={() => navigation.navigate("SelectWorkspace")}
              accessibilityRole="button"
              accessibilityLabel={tHealth("appPermissions.selectWorkspaceCta")}
            >
              <Text>{tHealth("appPermissions.selectWorkspaceCta")}</Text>
            </Button>
          </View>
        ) : null}
      </Card>
    </>
  );
}
