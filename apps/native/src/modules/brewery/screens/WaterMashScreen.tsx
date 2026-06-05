import { WaterMashScreenContent } from "../components/water/WaterMashScreenContent";
import { useWaterMashScreen } from "../hooks/useWaterMashScreen";

export function WaterMashScreen() {
  const model = useWaterMashScreen();
  return <WaterMashScreenContent model={model} />;
}
