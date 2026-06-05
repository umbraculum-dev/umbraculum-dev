"use client";

import { FermDataIntegrationPageContent } from "./_components/FermDataIntegrationPageContent";
import { useFermDataIntegrationPage } from "./_hooks/useFermDataIntegrationPage";

export default function FermDataIntegrationPage() {
  const model = useFermDataIntegrationPage();
  return <FermDataIntegrationPageContent model={model} />;
}
