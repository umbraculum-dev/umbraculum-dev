"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, View } from "tamagui";

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
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

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
      window.removeEventListener("pointerdown", onPointerDown, { capture: true } as EventListenerOptions);
    };
  }, [open]);

  return (
    <View
      ref={wrapRef}
      position="relative"
      display="inline-flex"
      alignItems="center"
      suppressHydrationWarning
    >
      <Button
        type="button"
        size={size === "md" ? "$3" : "$2"}
        chromeless
        circular
        bg="color-mix(in srgb, var(--info) 14%, var(--surface-2))"
        borderWidth={1}
        borderColor="color-mix(in srgb, var(--info) 25%, var(--border))"
        suppressHydrationWarning
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={popoverId}
        onPress={() => setOpen((v) => !v)}
      >
        {tUi("fx")}
      </Button>
      {open ? (
        <div
          id={popoverId}
          className="brew-math-popover"
          role="dialog"
          aria-label={title}
        >
          <div className="brew-math-popover-title">{title}</div>
          <div className="brew-math-popover-body">{body}</div>
        </div>
      ) : null}
    </View>
  );
}

