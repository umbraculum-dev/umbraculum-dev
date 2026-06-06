import { ScrollView } from "react-native";

import { Screen } from "@umbraculum/ui";

import { BrewSessionDetailHeader } from "../components/brewSessionDetail/BrewSessionDetailHeader";
import { BrewSessionDetailHydrometer } from "../components/brewSessionDetail/BrewSessionDetailHydrometer";
import { useBrewSessionDetailScreen } from "../hooks/brewSessionDetail/useBrewSessionDetailScreen";

export function BrewSessionDetailScreen() {
  const model = useBrewSessionDetailScreen();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <BrewSessionDetailHeader model={model} />
        <BrewSessionDetailHydrometer model={model} />
      </ScrollView>
    </Screen>
  );
}
