"use client";

import type { ReactNode } from "react";

import { MessageBox } from "./MessageBox";

export interface ErrorBoxProps {
  children: ReactNode;
  role?: "alert";
  "aria-live"?: "polite";
  id?: string;
  mt?: string | number;
  mb?: string | number;
}

export function ErrorBox({
  children,
  role = "alert",
  "aria-live": ariaLive,
  id,
  mt,
  mb,
}: ErrorBoxProps) {
  return (
    <MessageBox
      variant="error"
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
