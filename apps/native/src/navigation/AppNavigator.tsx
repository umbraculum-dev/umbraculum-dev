import React, { useMemo } from "react";
import { enableScreens } from "react-native-screens";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useT } from "@brewery/i18n-react";
import type { RouteId } from "@brewery/navigation";

import { Spinner } from "@brewery/ui";

import { useAuth } from "../auth/AuthProvider";
import { DashboardScreen } from "../screens/DashboardScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { BlockedRouteScreen } from "../screens/BlockedRouteScreen";
import { RecipeEditScreen } from "../screens/RecipeEditScreen";
import { RecipesListScreen } from "../screens/RecipesListScreen";
import { SelectWorkspaceScreen } from "../screens/SelectWorkspaceScreen";

enableScreens();

type TabParamList = {
  Dashboard: undefined;
  Recipes: undefined;
  Inventory: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

type RootStackParamList = {
  Tabs: undefined;
  SelectWorkspace: undefined;
  RecipeEdit: { recipeId: string };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

function makeBlocked(routeId: RouteId) {
  return function Blocked() {
    return <BlockedRouteScreen routeId={routeId} />;
  };
}

function TabsNavigator({ tabLabels }: { tabLabels: { dashboard: string; recipes: string; inventory: string } }) {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        headerTitleStyle: { fontFamily: "System" },
        tabBarStyle: {
          backgroundColor: "#141820",
          borderTopColor: "#2a2f3a",
        },
        tabBarActiveTintColor: "#e7eaf0",
        tabBarInactiveTintColor: "#b7bdc9",
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: tabLabels.dashboard }} />
      <Tab.Screen name="Recipes" component={RecipesListScreen} options={{ title: tabLabels.recipes }} />
      <Tab.Screen name="Inventory" component={makeBlocked("inventory")} options={{ title: tabLabels.inventory }} />
    </Tab.Navigator>
  );
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
    <NavigationContainer theme={DarkTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Tabs">{() => <TabsNavigator tabLabels={tabLabels} />}</RootStack.Screen>
        <RootStack.Screen name="SelectWorkspace">
          {({ navigation }) => <SelectWorkspaceScreen onDone={() => navigation.goBack()} />}
        </RootStack.Screen>
        <RootStack.Screen
          name="RecipeEdit"
          component={RecipeEditScreen}
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#141820" },
            headerTintColor: "#e7eaf0",
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

