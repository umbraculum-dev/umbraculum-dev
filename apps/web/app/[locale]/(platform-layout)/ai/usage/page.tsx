"use client";

import { AiUsagePageContent } from "./_components/AiUsagePageContent";
import { useAiUsagePage } from "./_hooks/useAiUsagePage";

export default function AiUsagePage() {
  const model = useAiUsagePage();
  return <AiUsagePageContent model={model} />;
}
