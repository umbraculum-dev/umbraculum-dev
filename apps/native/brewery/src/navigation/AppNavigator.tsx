import React, { useMemo } from "react";

import { useT } from "@umbraculum/i18n-react";

import { AuthGateNavigator } from "./AuthGateNavigator";
import { RootStackNavigator } from "./RootStackNavigator";

export function AppNavigator() {
  const { t } = useT("nav");

  const tabLabels = useMemo(() => {
    return {
      dashboard: t("dashboard"),
      recipes: t("recipes"),
      inventory: t("inventory"),
    };
  }, [t]);

  return (
    <AuthGateNavigator>
      <RootStackNavigator tabLabels={tabLabels} />
    </AuthGateNavigator>
  );
}
