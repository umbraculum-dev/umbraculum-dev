"use client";

import { AiSettingsPageContent } from "./_components/AiSettingsPageContent";
import { useAiSettingsPage } from "./_hooks/useAiSettingsPage";

export default function AiSettingsPage() {
  const model = useAiSettingsPage();
  return <AiSettingsPageContent model={model} />;
}
