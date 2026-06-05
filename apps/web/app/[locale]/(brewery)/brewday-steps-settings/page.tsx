"use client";

import { BrewdayStepsSettingsPageContent } from "./_components/BrewdayStepsSettingsPageContent";
import { useBrewdayStepsSettingsPage } from "./_hooks/useBrewdayStepsSettingsPage";

export default function BrewdayStepsSettingsPage() {
  const model = useBrewdayStepsSettingsPage();
  return <BrewdayStepsSettingsPageContent model={model} />;
}
