"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, SizableText, View } from "tamagui";

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
      window.removeEventListener("pointerdown", onPointerDown, { capture: true } as any);
    };
  }, [open]);

  return (
    <View
      ref={wrapRef}
      position="relative"
      display="inline-flex"
      alignItems="center"
    >
      <Button
        type="button"
        size={size === "md" ? "$3" : "$2"}
        chromeless
        circular
        bg="color-mix(in srgb, var(--info) 14%, var(--surface-2))"
        borderWidth={1}
        borderColor="color-mix(in srgb, var(--info) 25%, var(--border))"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={popoverId}
        onPress={() => setOpen((v) => !v)}
      >
        {tUi("fx")}
      </Button>
      {open ? (
        <View
          id={popoverId}
          position="absolute"
          top="calc(100% + 6px)"
          left={0}
          zIndex={50}
          width="min(460px, 75vw)"
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$2"
          p="$2.5"
          role="dialog"
          aria-label={title}
          style={{ boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)" }}
        >
          <SizableText size="$2" fontWeight="bold" fontFamily="$body" mb="$1.5" display="block">
            {title}
          </SizableText>
          <SizableText size="$1" fontFamily="$body" color="var(--text)" style={{ whiteSpace: "pre-wrap", lineHeight: 1.35 }}>
            {body}
          </SizableText>
        </View>
      ) : null}
    </View>
  );
}

