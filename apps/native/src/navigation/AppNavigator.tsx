import React, { useMemo } from "react";
import { Text } from "react-native";
import { enableScreens } from "react-native-screens";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useT } from "@brewery/i18n-react";
import type { RouteId } from "@brewery/navigation";

import { Spinner } from "@brewery/ui";

import type { RootStackParamList, TabParamList } from "./types";
import { useAuth } from "../auth/AuthProvider";
import { AboutScreen } from "../screens/AboutScreen";
import { AiScreen } from "../screens/AiScreen";
import { BrewdayStepsSettingsScreen } from "../screens/BrewdayStepsSettingsScreen";
import { BrewSessionDetailScreen } from "../screens/BrewSessionDetailScreen";
import { BrewSessionsListScreen } from "../screens/BrewSessionsListScreen";
import { ContributingScreen } from "../screens/ContributingScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { EquipmentScreen } from "../screens/EquipmentScreen";
import { FermDataIntegrationScreen } from "../screens/FermDataIntegrationScreen";
import { WaterBoilScreen } from "../screens/WaterBoilScreen";
import { WaterHubScreen } from "../screens/WaterHubScreen";
import { WaterMashScreen } from "../screens/WaterMashScreen";
import { WaterProfilesScreen } from "../screens/WaterProfilesScreen";
import { WaterSpargeScreen } from "../screens/WaterSpargeScreen";
import { YeastScreen } from "../screens/YeastScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { BlockedRouteScreen } from "../screens/BlockedRouteScreen";
import { RecipeEditScreen } from "../screens/RecipeEditScreen";
import { RecipesListScreen } from "../screens/RecipesListScreen";
import { SelectWorkspaceScreen } from "../screens/SelectWorkspaceScreen";

enableScreens();

const Tab = createBottomTabNavigator<TabParamList>();

const RootStack = createNativeStackNavigator<RootStackParamList>();

function makeBlocked(routeId: RouteId) {
  return function Blocked() {
    return <BlockedRouteScreen routeId={routeId} />;
  };
}

function TabsNavigator({ tabLabels }: { tabLabels: { dashboard: string; recipes: string; inventory: string } }) {
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
        <RootStack.Screen
          name="BrewSessionsList"
          component={BrewSessionsListScreen}
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#141820" },
            headerTintColor: "#e7eaf0",
          }}
        />
        <RootStack.Screen
          name="BrewSessionDetail"
          component={BrewSessionDetailScreen}
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#141820" },
            headerTintColor: "#e7eaf0",
          }}
        />
        <RootStack.Screen
          name="Ai"
          component={AiScreen}
          options={{
            headerShown: true,
            headerTitle: "AI",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#141820" },
            headerTintColor: "#e7eaf0",
          }}
        />
        <RootStack.Screen
          name="About"
          component={AboutScreen}
          options={{
            headerShown: true,
            headerTitle: "About",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#141820" },
            headerTintColor: "#e7eaf0",
          }}
        />
        <RootStack.Screen
          name="Contributing"
          component={ContributingScreen}
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#141820" },
            headerTintColor: "#e7eaf0",
          }}
        />
        <RootStack.Screen
          name="Equipment"
          component={EquipmentScreen}
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#141820" },
            headerTintColor: "#e7eaf0",
          }}
        />
        <RootStack.Screen
          name="BrewdayStepsSettings"
          component={BrewdayStepsSettingsScreen}
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#141820" },
            headerTintColor: "#e7eaf0",
          }}
        />
        <RootStack.Screen
          name="FermDataIntegration"
          component={FermDataIntegrationScreen}
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#141820" },
            headerTintColor: "#e7eaf0",
          }}
        />
        <RootStack.Screen
          name="WaterProfiles"
          component={WaterProfilesScreen}
          options={{
            headerShown: true,
            headerTitle: "Water profiles",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#141820" },
            headerTintColor: "#e7eaf0",
          }}
        />
        <RootStack.Screen
          name="WaterHub"
          component={WaterHubScreen}
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#141820" },
            headerTintColor: "#e7eaf0",
          }}
        />
        <RootStack.Screen
          name="WaterMash"
          component={WaterMashScreen}
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#141820" },
            headerTintColor: "#e7eaf0",
          }}
        />
        <RootStack.Screen
          name="WaterSparge"
          component={WaterSpargeScreen}
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#141820" },
            headerTintColor: "#e7eaf0",
          }}
        />
        <RootStack.Screen
          name="WaterBoil"
          component={WaterBoilScreen}
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: "#141820" },
            headerTintColor: "#e7eaf0",
          }}
        />
        <RootStack.Screen
          name="RecipeYeast"
          component={YeastScreen}
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

