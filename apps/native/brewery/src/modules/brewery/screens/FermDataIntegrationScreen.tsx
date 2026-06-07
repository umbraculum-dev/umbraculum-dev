import { Screen } from "@umbraculum/ui";

import { FermDataIntegrationScreenContent } from "../components/fermIntegration/FermDataIntegrationScreenContent";
import { useNativeFermDataIntegrationScreen } from "../hooks/fermIntegration/useNativeFermDataIntegrationScreen";

export function FermDataIntegrationScreen() {
  const model = useNativeFermDataIntegrationScreen();

  return (
    <Screen>
      <FermDataIntegrationScreenContent model={model} />
    </Screen>
  );
}
