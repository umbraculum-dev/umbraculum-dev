"use client";

import { useYeastPage } from "./_hooks/useYeastPage";
import { YeastPageContent } from "./_components/YeastPageContent";

export default function YeastPage() {
  const model = useYeastPage();
  return <YeastPageContent model={model} />;
}
