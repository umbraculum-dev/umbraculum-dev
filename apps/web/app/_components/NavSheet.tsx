"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Sheet, useMedia } from "tamagui";

export interface NavSheetProps {
  children: ReactNode;
  triggerLabel: string;
  ariaLabel?: string;
  triggerVariant?: "hamburger" | "text";
}

function HamburgerIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function NavSheet({ children, triggerLabel, ariaLabel, triggerVariant = "hamburger" }: NavSheetProps) {
  const [open, setOpen] = useState(false);
  const media = useMedia();
  const narrow = media.narrow;

  if (!narrow) {
    return <>{children}</>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={ariaLabel ?? triggerLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="navActionButton"
        style={{ padding: 8, display: "inline-flex", alignItems: "center" }}
      >
        {triggerVariant === "text" ? triggerLabel : <HamburgerIcon />}
      </button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        modal
        snapPoints={[85, 10]}
        dismissOnOverlayPress
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame
          position="relative"
          background="var(--surface)"
          borderColor="var(--border)"
          borderWidth={1}
          borderTopLeftRadius="var(--radius)"
          borderTopRightRadius="var(--radius)"
          padding={16}
          maxHeight="85%"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              padding: 4,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
          <div
            style={{ paddingTop: 24 }}
            onClickCapture={(e) => {
              if (!open) return;
              const target = e.target;
              if (!(target instanceof HTMLElement)) return;
              if (target.closest('[data-navsheet-keep-open="true"]')) return;

              const shouldClose = Boolean(target.closest('a[href], [data-navsheet-close="true"]'));
              if (shouldClose) setOpen(false);
            }}
          >
            {children}
          </div>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
