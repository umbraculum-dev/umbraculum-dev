"use client";

import { WaterMashPageContent } from "./_components/WaterMashPageContent";
import { useWaterMashPage } from "./_hooks/useWaterMashPage";

export default function MashWaterPage() {
  const model = useWaterMashPage();
  return <WaterMashPageContent model={model} />;
}
