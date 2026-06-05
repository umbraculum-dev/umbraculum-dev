"use client";

import { BrewSessionDetailPageContent } from "./_components/BrewSessionDetailPageContent";
import { useBrewSessionDetailPage } from "./_hooks/useBrewSessionDetailPage";

export default function BrewSessionDetailPage() {
  const model = useBrewSessionDetailPage();
  return <BrewSessionDetailPageContent model={model} />;
}
