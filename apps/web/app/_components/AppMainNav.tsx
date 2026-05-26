"use client";

import { Link } from "../../src/i18n/navigation";
import { SizableText, useMedia, XStack } from "tamagui";

export interface AppMainNavItem {
  href: string;
  label: string;
  isActive?: boolean;
}

export interface AppMainNavProps {
  items: AppMainNavItem[];
  ariaLabel?: string;
}

export function AppMainNav({ items, ariaLabel }: AppMainNavProps) {
  const media = useMedia();
  const minWidth = media.mobile ? 140 : 160;

  return (
    <nav aria-label={ariaLabel}>
      <XStack
        flexWrap="wrap"
        gap={media.mobile ? "$1.5" : "$2"}
        width="100%"
        p="$2"
        mt="$2"
        mb="$2"
        borderWidth={1}
        borderColor="var(--border)"
        borderRadius="var(--radius)"
        backgroundColor="color-mix(in srgb, var(--surface-2) 25%, var(--surface))"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.isActive ? "page" : undefined}
            className="brew-link-contents"
          >
            <XStack
              flex={1}
              minWidth={minWidth}
              ai="center"
              jc="center"
              p="$2.5"
              borderRadius="$2"
              borderWidth={1}
              borderColor={item.isActive ? "color-mix(in srgb, var(--info) 35%, var(--border))" : "color-mix(in srgb, var(--border) 85%, var(--info))"}
              backgroundColor={item.isActive ? "color-mix(in srgb, var(--info) 18%, var(--surface-2))" : "color-mix(in srgb, var(--surface-2) 60%, var(--surface))"}
              color="var(--text)"
              textDecoration="none"
              cursor="pointer"
              hoverStyle={{
                textDecoration: "none",
                background: "color-mix(in srgb, var(--info) 12%, var(--surface-2))",
                borderColor: "color-mix(in srgb, var(--info) 28%, var(--border))",
              }}
              focusStyle={{ outlineWidth: 2, outlineColor: "var(--focus-ring)" }}
            >
              <SizableText
                size="$3"
                color="var(--text)"
                fontWeight={item.isActive ? "600" : "400"}
                fontFamily="$body"
              >
                {item.label}
              </SizableText>
            </XStack>
          </Link>
        ))}
      </XStack>
    </nav>
  );
}
