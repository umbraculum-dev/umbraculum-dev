"use client";

import { useTranslations } from "next-intl";
import { Button, H1, Input, SizableText, XStack, YStack } from "tamagui";

import { Link } from "../../../../src/i18n/navigation";
import { ErrorBox } from "../../../_components/recipe-edit";
import { PimProductCreateForm } from "./PimProductCreateForm";
import { PimProductsTable } from "./PimProductsTable";
import { usePimProductsPage } from "./usePimProductsPage";

/**
 * PIM products list — Week 1 audit shape.
 *
 * URL: `/en/products` (β filesystem-axis; the `(pim)/` route group does
 * not contribute a path segment per RFC-0002 Decision B, and `products`
 * is one of three canonical static sub-segments the PIM module owns:
 * `products`, `categories`, `attribute-sets`. See
 * `docs/design/web-route-group-audit.md` §3.4 + RFC-0006).
 */
export default function PimProductsPage() {
  const t = useTranslations("pim");
  const tProducts = useTranslations("pim.products");
  const model = usePimProductsPage();

  return (
    <YStack gap="$3">
      <H1 mb="$2">{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("subtitle")}
      </SizableText>

      <XStack gap="$3" flexWrap="wrap" alignItems="center">
        <Input
          flex={1}
          minWidth={200}
          placeholder={tProducts("searchPlaceholder")}
          value={model.search}
          onChangeText={model.setSearch}
          disabled={!model.canCall || model.loading}
        />
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          onPress={() => void model.refresh()}
          disabled={!model.canCall || model.loading}
        >
          {model.loading ? tProducts("refreshing") : tProducts("refresh")}
        </Button>
        <Link href="/categories">{t("categories.title")}</Link>
        <Link href="/attribute-sets">{t("attributeSets.title")}</Link>
      </XStack>

      <PimProductCreateForm model={model} />

      {model.error ? <ErrorBox>{model.error}</ErrorBox> : null}

      <PimProductsTable model={model} />
    </YStack>
  );
}
