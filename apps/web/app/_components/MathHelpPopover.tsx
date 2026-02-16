"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export function MathHelpPopover(props: {
  title: string;
  body: string;
  ariaLabel: string;
  /** Optional: render small (default) or inline. */
  size?: "sm" | "md";
}) {
  const { title, body, ariaLabel, size = "sm" } = props;
  const popoverId = useId();
  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);

  const className = useMemo(() => {
    const base = "mathFxButton";
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
    <span ref={wrapRef} className="mathFxWrap">
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => setOpen((v) => !v)}
      >
        fx
      </button>
      {open ? (
        <div id={popoverId} className="mathPopover" role="dialog" aria-label={title}>
          <div className="mathPopoverTitle">{title}</div>
          <div className="mathPopoverBody">{body}</div>
        </div>
      ) : null}
    </span>
  );
}

