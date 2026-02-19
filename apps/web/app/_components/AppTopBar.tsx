"use client";

import type { ReactNode } from "react";

export interface AppTopBarProps {
  left: ReactNode;
  right: ReactNode;
  ariaLabel?: string;
}

export function AppTopBar({ left, right, ariaLabel }: AppTopBarProps) {
  return (
    <div className="navTopBar" aria-label={ariaLabel}>
      <div className="navTopBarLeft">{left}</div>
      <div className="navTopBarRight">{right}</div>
    </div>
  );
}
