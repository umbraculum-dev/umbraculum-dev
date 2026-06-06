"use client";

import { useState } from "react";

export function useRecipeEditAnalysis() {
  const [analysis, setAnalysis] = useState<unknown>(null);
  return { analysis, setAnalysis };
}
