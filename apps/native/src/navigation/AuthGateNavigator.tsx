import React from "react";

import { Spinner } from "@umbraculum/ui";

import { useAuth } from "../auth/AuthProvider";
import { LoginScreen } from "../screens/LoginScreen";

export function AuthGateNavigator(props: { children: React.ReactNode }) {
  const { state } = useAuth();

  if (state.status === "loading") return <Spinner />;
  if (state.status === "logged_out") return <LoginScreen />;

  return <>{props.children}</>;
}
