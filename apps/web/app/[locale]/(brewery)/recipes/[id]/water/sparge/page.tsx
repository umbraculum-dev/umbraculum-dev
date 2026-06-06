"use client";

import { WaterSpargePageContent } from "./_components/WaterSpargePageContent";
import { useWaterSpargePage } from "./_hooks/useWaterSpargePage";

export default function SpargeWaterPage() {
  const model = useWaterSpargePage();
  return <WaterSpargePageContent model={model} />;
}
