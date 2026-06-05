"use client";

import { useWaterHubPage } from "./_hooks/useWaterHubPage";
import { WaterHubPageContent } from "./_components/WaterHubPageContent";

export default function WaterHubPage() {
  const model = useWaterHubPage();
  return <WaterHubPageContent model={model} />;
}
