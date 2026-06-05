"use client";

import { EquipmentPageContent } from "./_components/EquipmentPageContent";
import { useEquipmentPage } from "./_hooks/useEquipmentPage";

export default function EquipmentPage() {
  const model = useEquipmentPage();
  return <EquipmentPageContent model={model} />;
}
