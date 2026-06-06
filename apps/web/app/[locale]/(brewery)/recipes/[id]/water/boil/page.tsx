"use client";

import { WaterBoilPageContent } from "./_components/WaterBoilPageContent";
import { useWaterBoilPage } from "./_hooks/useWaterBoilPage";

export default function BoilWaterPage() {
  const model = useWaterBoilPage();
  return <WaterBoilPageContent model={model} />;
}
