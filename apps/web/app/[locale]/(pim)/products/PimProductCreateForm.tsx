"use client";

import { useTranslations } from "next-intl";
import { Input, SizableText, TextArea, XStack, YStack } from "tamagui";

import { ErrorBox } from "../../../_components/recipe-edit";
import type { PimProductsPageModel } from "./usePimProductsPage";

export function PimProductCreateForm({ model }: { model: PimProductsPageModel }) {
  const tProducts = useTranslations("pim.products");
  const tFields = useTranslations("pim.fields");
  const tValues = useTranslations("pim.values");

  const {
    canCall,
    creating,
    createSku,
    setCreateSku,
    createName,
    setCreateName,
    createDescription,
    setCreateDescription,
    createAttributeSetId,
    setCreateAttributeSetId,
    createError,
    createSuccess,
    createProduct,
  } = model;

  return (
    <section
      aria-labelledby="create-product-heading"
      style={{
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "12px",
      }}
    >
      <YStack gap="$3">
        <SizableText id="create-product-heading" size="$4" fontWeight="bold" fontFamily="$heading">
          {tProducts("create")}
        </SizableText>
        <XStack gap="$3" flexWrap="wrap">
          <YStack gap="$1.5" flex={1} minWidth={180}>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {tFields("sku")}
            </SizableText>
            <Input value={createSku} onChangeText={setCreateSku} disabled={!canCall || creating} />
          </YStack>
          <YStack gap="$1.5" flex={1} minWidth={180}>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {tFields("name")}
            </SizableText>
            <Input value={createName} onChangeText={setCreateName} disabled={!canCall || creating} />
          </YStack>
          <YStack gap="$1.5" flex={1} minWidth={180}>
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {tFields("attributeSet")}
            </SizableText>
            <Input
              value={createAttributeSetId}
              onChangeText={setCreateAttributeSetId}
              placeholder={tProducts("attributeSetPlaceholder")}
              disabled={!canCall || creating}
            />
          </YStack>
        </XStack>
        <YStack gap="$1.5">
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
            {tFields("description")}
          </SizableText>
          <TextArea
            value={createDescription}
            onChangeText={setCreateDescription}
            disabled={!canCall || creating}
            minHeight={80}
          />
        </YStack>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {tFields("status")}: {tValues("draft")}
        </SizableText>
        {createError ? <ErrorBox>{createError}</ErrorBox> : null}
        {createSuccess ? (
          <SizableText size="$2" color="var(--success)" fontFamily="$body">
            {tProducts("createSuccess")}
          </SizableText>
        ) : null}
        <button
          type="button"
          style={{
            alignSelf: "flex-start",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--text)",
            cursor: !canCall || creating ? "not-allowed" : "pointer",
            padding: "8px 12px",
          }}
          onClick={() => void createProduct()}
          disabled={!canCall || creating}
        >
          {creating ? tProducts("creating") : tProducts("create")}
        </button>
      </YStack>
    </section>
  );
}
