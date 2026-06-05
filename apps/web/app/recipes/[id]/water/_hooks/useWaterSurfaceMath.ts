"use client";

import { useEffect, useState } from "react";

export function useWaterSurfaceMath(storageKey: string) {
  const [surfaceMath, setSurfaceMath] = useState(false);

  useEffect(() => {
    try {
      const v = sessionStorage.getItem(`brewery:surfaceMath:${storageKey}`);
      if (v === "1") setSurfaceMath(true);
    } catch {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      sessionStorage.setItem(`brewery:surfaceMath:${storageKey}`, surfaceMath ? "1" : "0");
    } catch {
      // ignore
    }
  }, [storageKey, surfaceMath]);

  return { surfaceMath, setSurfaceMath };
}
