import React, { useMemo } from "react";
import { enableScreens } from "react-native-screens";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useT } from "@brewery/i18n-react";
import type { RouteId } from "@brewery/navigation";

import { Spinner } from "@brewery/ui";

import { useAuth } from "../auth/AuthProvider";
import { DashboardScreen } from "../screens/DashboardScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { BlockedRouteScreen } from "../screens/BlockedRouteScreen";

enableScreens();

type TabParamList = {
  Dashboard: undefined;
  Recipes: undefined;
  Inventory: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

function makeBlocked(routeId: RouteId) {
  return function Blocked() {
    return <BlockedRouteScreen routeId={routeId} />;
  };
}

export function AppNavigator() {
  const { state } = useAuth();
  const { t } = useT("nav");

  const tabLabels = useMemo(() => {
    return {
      dashboard: t("dashboard"),
      recipes: t("recipes"),
      inventory: t("inventory"),
    };
  }, [t]);

  if (state.status === "loading") return <Spinner />;
  if (state.status === "logged_out") return <LoginScreen />;

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          headerTitleStyle: { fontFamily: "System" },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: tabLabels.dashboard }}
        />
        <Tab.Screen
          name="Recipes"
          component={makeBlocked("recipes")}
          options={{ title: tabLabels.recipes }}
        />
        <Tab.Screen
          name="Inventory"
          component={makeBlocked("inventory")}
          options={{ title: tabLabels.inventory }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

