import { WaterSpargeScreenContent } from "../components/water/WaterSpargeScreenContent";
import { useWaterSpargeScreen } from "../hooks/useWaterSpargeScreen";

export function WaterSpargeScreen() {
  const model = useWaterSpargeScreen();
  return <WaterSpargeScreenContent model={model} />;
}
