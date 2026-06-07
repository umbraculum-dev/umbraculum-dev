"use client";

import { SizableText, View, XStack } from "tamagui";

import { Link } from "../../../src/i18n/navigation";

export function Footer() {
  return (
    <View
      as="footer"
      borderTopWidth={1}
      borderColor="var(--border)"
      mt="$3"
      pt="$3"
      pb="$3"
    >
      <XStack
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap="$3"
      >
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" m={0}>
          Umbraculum
        </SizableText>
        <XStack gap="$3" flexWrap="wrap">
          <Link href="/contact" className="brew-link-contents">
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
              Contact
            </SizableText>
          </Link>
          <Link href="/accessibility" className="brew-link-contents">
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
              Accessibility
            </SizableText>
          </Link>
        </XStack>
      </XStack>
    </View>
  );
}

