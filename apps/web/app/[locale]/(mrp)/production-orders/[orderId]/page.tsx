"use client";

import { ProductionOrderDetailContent } from "./_components/ProductionOrderDetailContent";
import { useProductionOrderDetailPage } from "./_hooks/useProductionOrderDetailPage";

export default function MrpProductionOrderDetailPage() {
  const model = useProductionOrderDetailPage();
  return <ProductionOrderDetailContent model={model} />;
}
