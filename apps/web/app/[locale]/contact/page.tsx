"use client";

import { useTranslations } from "next-intl";
import { H1, H2, SizableText, View, YStack } from "tamagui";

export default function ContactPage() {
  const t = useTranslations("contact");

  const email = t("emailAddress");
  const subject = t("mailtoSubject");
  const href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

  return (
    <YStack gap="$3">
      <H1 mb="$2">{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>

      <View
        mt="$3"
        bg="var(--surface)"
        borderWidth={1}
        borderColor="var(--border)"
        rounded="$2"
        p="$3"
        aria-labelledby="contact-email-heading"
      >
        <H2 id="contact-email-heading" mt={0}>
          {t("emailHeading")}
        </H2>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
          {t("emailLabel")} <code>{email}</code>
        </SizableText>
        <SizableText size="$2" color="var(--text)" fontFamily="$body" mb={0}>
          <a href={href}>{t("emailCta")}</a>
        </SizableText>
      </View>
    </YStack>
  );
}

