import { WaterBoilScreenContent } from "../components/water/WaterBoilScreenContent";
import { useWaterBoilScreen } from "../hooks/useWaterBoilScreen";

export function WaterBoilScreen() {
  const model = useWaterBoilScreen();
  return <WaterBoilScreenContent model={model} />;
}
