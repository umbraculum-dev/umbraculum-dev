import React from "react";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, type NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./types";
import { TabNavigator } from "./TabNavigator";
import { AboutScreen } from "../screens/AboutScreen";
import { AiScreen } from "../screens/AiScreen";
import { BrewdayStepsSettingsScreen } from "../modules/brewery/screens/BrewdayStepsSettingsScreen";
import { BrewSessionDetailScreen } from "../modules/brewery/screens/BrewSessionDetailScreen";
import { BrewSessionsListScreen } from "../modules/brewery/screens/BrewSessionsListScreen";
import { ContributingScreen } from "../screens/ContributingScreen";
import { EquipmentScreen } from "../modules/brewery/screens/EquipmentScreen";
import { FermDataIntegrationScreen } from "../modules/brewery/screens/FermDataIntegrationScreen";
import { WaterBoilScreen } from "../modules/brewery/screens/WaterBoilScreen";
import { WaterHubScreen } from "../modules/brewery/screens/WaterHubScreen";
import { WaterMashScreen } from "../modules/brewery/screens/WaterMashScreen";
import { WaterProfilesScreen } from "../modules/brewery/screens/WaterProfilesScreen";
import { WaterSpargeScreen } from "../modules/brewery/screens/WaterSpargeScreen";
import { YeastScreen } from "../modules/brewery/screens/YeastScreen";
import { RecipeEditScreen } from "../modules/brewery/screens/RecipeEditScreen";
import { SelectWorkspaceScreen } from "../screens/SelectWorkspaceScreen";

const RootStack = createNativeStackNavigator<RootStackParamList>();

const stackHeaderOptions = {
  headerShown: true as const,
  headerTitle: "",
  headerBackTitle: "Back",
  headerStyle: { backgroundColor: "#141820" },
  headerTintColor: "#e7eaf0",
};

export function RootStackNavigator(props: {
  tabLabels: { dashboard: string; recipes: string; inventory: string };
}) {
  return (
    <NavigationContainer theme={DarkTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Tabs">{() => <TabNavigator tabLabels={props.tabLabels} />}</RootStack.Screen>
        <RootStack.Screen name="SelectWorkspace">
          {({ navigation }: NativeStackScreenProps<RootStackParamList, "SelectWorkspace">) => (
            <SelectWorkspaceScreen onDone={() => navigation.goBack()} />
          )}
        </RootStack.Screen>
        <RootStack.Screen name="RecipeEdit" component={RecipeEditScreen} options={stackHeaderOptions} />
        <RootStack.Screen name="BrewSessionsList" component={BrewSessionsListScreen} options={stackHeaderOptions} />
        <RootStack.Screen name="BrewSessionDetail" component={BrewSessionDetailScreen} options={stackHeaderOptions} />
        <RootStack.Screen
          name="Ai"
          component={AiScreen}
          options={{ ...stackHeaderOptions, headerTitle: "AI" }}
        />
        <RootStack.Screen
          name="About"
          component={AboutScreen}
          options={{ ...stackHeaderOptions, headerTitle: "About" }}
        />
        <RootStack.Screen name="Contributing" component={ContributingScreen} options={stackHeaderOptions} />
        <RootStack.Screen name="Equipment" component={EquipmentScreen} options={stackHeaderOptions} />
        <RootStack.Screen name="BrewdayStepsSettings" component={BrewdayStepsSettingsScreen} options={stackHeaderOptions} />
        <RootStack.Screen name="FermDataIntegration" component={FermDataIntegrationScreen} options={stackHeaderOptions} />
        <RootStack.Screen
          name="WaterProfiles"
          component={WaterProfilesScreen}
          options={{ ...stackHeaderOptions, headerTitle: "Water profiles" }}
        />
        <RootStack.Screen name="WaterHub" component={WaterHubScreen} options={stackHeaderOptions} />
        <RootStack.Screen name="WaterMash" component={WaterMashScreen} options={stackHeaderOptions} />
        <RootStack.Screen name="WaterSparge" component={WaterSpargeScreen} options={stackHeaderOptions} />
        <RootStack.Screen name="WaterBoil" component={WaterBoilScreen} options={stackHeaderOptions} />
        <RootStack.Screen name="RecipeYeast" component={YeastScreen} options={stackHeaderOptions} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
