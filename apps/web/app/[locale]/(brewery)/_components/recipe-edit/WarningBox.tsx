"use client";

import type { ReactNode } from "react";

import { MessageBox } from "../../../../_shell/_components/MessageBox";

export interface WarningBoxProps {
  children: ReactNode;
  role?: "status" | "alert";
  "aria-live"?: "polite";
  id?: string;
  mt?: string | number;
  mb?: string | number;
}

export function WarningBox({
  children,
  role = "status",
  "aria-live": ariaLive,
  id,
  mt,
  mb,
}: WarningBoxProps) {
  return (
    <MessageBox
      variant="warning"
      id={id}
      mt={mt}
      mb={mb}
      role={role}
      aria-live={ariaLive}
    >
      {children}
    </MessageBox>
  );
}
