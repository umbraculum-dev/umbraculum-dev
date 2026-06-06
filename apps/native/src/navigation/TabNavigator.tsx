import React from "react";
import { Text } from "react-native";
import { enableScreens } from "react-native-screens";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import type { RouteId } from "@umbraculum/navigation";

import type { TabParamList } from "./types";
import { DashboardScreen } from "../screens/DashboardScreen";
import { BlockedRouteScreen } from "../screens/BlockedRouteScreen";
import { RecipesListScreen } from "../modules/brewery/screens/RecipesListScreen";

enableScreens();

const Tab = createBottomTabNavigator<TabParamList>();

function makeBlocked(routeId: RouteId) {
  return function Blocked() {
    return <BlockedRouteScreen routeId={routeId} />;
  };
}

export function TabNavigator({ tabLabels }: { tabLabels: { dashboard: string; recipes: string; inventory: string } }) {
  const iconFor = (routeName: keyof TabParamList) => {
    switch (routeName) {
      case "Dashboard":
        return "🏠";
      case "Recipes":
        return "🍺";
      case "Inventory":
        return "📦";
      default:
        return "•";
    }
  };

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        headerTitleStyle: { fontFamily: "System" },
        tabBarStyle: {
          backgroundColor: "#141820",
          borderTopColor: "#2a2f3a",
        },
        tabBarActiveTintColor: "#e7eaf0",
        tabBarInactiveTintColor: "#b7bdc9",
        tabBarIcon: ({ color, size }) => (
          <Text
            style={{ color, fontSize: Math.max(14, Math.min(size, 22)) }}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            {iconFor(route.name)}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: tabLabels.dashboard }} />
      <Tab.Screen name="Recipes" component={RecipesListScreen} options={{ title: tabLabels.recipes }} />
      <Tab.Screen name="Inventory" component={makeBlocked("inventory")} options={{ title: tabLabels.inventory }} />
    </Tab.Navigator>
  );
}
