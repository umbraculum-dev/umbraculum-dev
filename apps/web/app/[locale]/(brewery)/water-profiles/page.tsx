"use client";

import { WaterProfilesPageContent } from "./_components/WaterProfilesPageContent";
import { useWaterProfilesPage } from "./_hooks/useWaterProfilesPage";

export default function WaterProfilesPage() {
  const model = useWaterProfilesPage();
  return <WaterProfilesPageContent model={model} />;
}
