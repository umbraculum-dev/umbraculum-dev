"use client";

import React, { type ReactNode } from "react";

export function RecipeEditSummary(props: { children: ReactNode }) {
  const { children } = props;
  return (
    <summary className="brew-details-summary" style={{ fontSize: 12 }}>
      {children}
    </summary>
  );
}
