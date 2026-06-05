"use client";

import { useTranslations } from "next-intl";

import { InventoryPageContent } from "./_components/InventoryPageContent";
import { useInventoryPage } from "./_hooks/useInventoryPage";

export default function InventoryPage() {
  const tCommon = useTranslations("common");
  const model = useInventoryPage();
  return <InventoryPageContent model={model} tCommon={tCommon} />;
}
