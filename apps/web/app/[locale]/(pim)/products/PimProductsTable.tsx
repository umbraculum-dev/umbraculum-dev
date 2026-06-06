"use client";

import { useTranslations } from "next-intl";
import { SizableText, View, XStack, YStack } from "tamagui";

import { Link } from "../../../../src/i18n/navigation";
import type { PimProductsPageModel } from "./usePimProductsPage";

export function PimProductsTable({ model }: { model: PimProductsPageModel }) {
  const tProducts = useTranslations("pim.products");
  const tFields = useTranslations("pim.fields");
  const tValues = useTranslations("pim.values");

  const { loading, error, filtered } = model;

  if (loading && filtered.length === 0) {
    return (
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {tProducts("loading")}
      </SizableText>
    );
  }

  if (!loading && filtered.length === 0 && !error) {
    return (
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {tProducts("noProducts")}
      </SizableText>
    );
  }

  if (filtered.length === 0) return null;

  return (
    <View role="region" aria-labelledby="products-heading">
      <SizableText id="products-heading" size="$4" fontWeight="bold" fontFamily="$heading" mb="$2">
        {tProducts("listTitle")}
      </SizableText>
      <ul className="brew-recipe-list">
        {filtered.map((p) => (
          <li key={p.id} className="brew-recipe-list-row">
            <YStack gap="$1.5">
              <SizableText fontFamily="$body">
                <SizableText fontWeight="bold">{p.sku}</SizableText>
                <SizableText color="var(--text-muted)"> · {p.name}</SizableText>
              </SizableText>
              <XStack gap="$3" flexWrap="wrap">
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                  <SizableText fontWeight="bold">{tFields("status")}:</SizableText> {tValues(p.status)}
                </SizableText>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                  <SizableText fontWeight="bold">{tFields("attributeSet")}:</SizableText>{" "}
                  {p.primaryAttributeSetId ?? tValues("none")}
                </SizableText>
              </XStack>
              <Link href={`/products/${p.id}`}>{tProducts("openDetail")}</Link>
            </YStack>
          </li>
        ))}
      </ul>
    </View>
  );
}
