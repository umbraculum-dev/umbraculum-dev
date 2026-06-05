import React from "react";

import { Screen } from "@umbraculum/ui";

import { WaterHubScreenContent } from "../components/waterHub/WaterHubScreenContent";
import { useNativeWaterHubScreen } from "../hooks/waterHub/useNativeWaterHubScreen";

export function WaterHubScreen() {
  const model = useNativeWaterHubScreen();

  return (
    <Screen>
      <WaterHubScreenContent model={model} />
    </Screen>
  );
}
