"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export function MathHelpPopover(props: {
  title: string;
  body: string;
  ariaLabel: string;
  /** Optional: render small (default) or inline. */
  size?: "sm" | "md";
}) {
  const tUi = useTranslations("ui");
  const { title, body, ariaLabel, size = "sm" } = props;
  const popoverId = useId();
  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);

  const className = useMemo(() => {
    const base = "brew-math-fx-button";
    return size === "md" ? `${base} ${base}--md` : base;
  }, [size]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };

    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown, { capture: true } as any);
    };
  }, [open]);

  return (
    <span ref={wrapRef} className="brew-math-fx-wrap">
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => setOpen((v) => !v)}
      >
        {tUi("fx")}
      </button>
      {open ? (
        <div id={popoverId} className="brew-math-popover" role="dialog" aria-label={title}>
          <div className="brew-math-popover-title">{title}</div>
          <div className="brew-math-popover-body">{body}</div>
        </div>
      ) : null}
    </span>
  );
}

