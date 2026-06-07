"use client";

import { useEffect, useState } from "react";

import { DESKTOP_RAIL_REQUIRED_GUTTER_PX } from "../_lib/recipeEditConstants";

export function useRecipeEditLayout() {
  const [layoutMetrics, setLayoutMetrics] = useState<{
    leftGutterPx: number | null;
    railTopPx: number | null;
  }>({ leftGutterPx: null, railTopPx: null });

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const appShell = document.querySelector(".brew-app-shared-layout");
      const mainEl = document.getElementById("main");
      const leftGutterPx = appShell instanceof HTMLElement ? appShell.getBoundingClientRect().left : null;
      const railTopPx = mainEl instanceof HTMLElement ? Math.max(mainEl.getBoundingClientRect().top, 16) : null;
      setLayoutMetrics({ leftGutterPx, railTopPx });
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    update();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.add("brew-hide-global-bottom-ad");
    return () => {
      document.body.classList.remove("brew-hide-global-bottom-ad");
    };
  }, []);

  const useDesktopRail =
    typeof layoutMetrics.leftGutterPx === "number" &&
    layoutMetrics.leftGutterPx >= DESKTOP_RAIL_REQUIRED_GUTTER_PX;

  return { layoutMetrics, useDesktopRail };
}
