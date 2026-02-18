"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

export function SurfaceMathToggleRow(props: {
  left: ReactNode;
  rightHint?: ReactNode;
  surfaceMath: boolean;
  onToggle: () => void;
  style?: React.CSSProperties;
}) {
  const tMath = useTranslations("math");
  const { left, rightHint, surfaceMath, onToggle, style } = props;

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", ...style }}>
      {left}
      <div style={{ marginLeft: "auto", display: "inline-flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {rightHint}
        <button type="button" onClick={onToggle}>
          {surfaceMath ? tMath("toggleHide") : tMath("toggleShow")}
        </button>
      </div>
    </div>
  );
}

