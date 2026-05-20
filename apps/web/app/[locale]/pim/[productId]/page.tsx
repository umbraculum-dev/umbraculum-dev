"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, H1, SizableText, View, XStack, YStack } from "tamagui";
import {
  ProductGetResponseSchema,
  VariantListResponseSchema,
  type Product,
  type Variant,
} from "@umbraculum/pim-contracts";

import { Link } from "../../../../src/i18n/navigation";
import { ErrorBox } from "../../../_components/recipe-edit";
import { apiFetch } from "../../../_lib/apiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";

export default function PimProductDetailPage() {
  const t = useTranslations("pim");
  const tProducts = useTranslations("pim.products");
  const tVariants = useTranslations("pim.variants");
  const tFields = useTranslations("pim.fields");
  const tValues = useTranslations("pim.values");

  const params = useParams<{ productId: string }>();
  const productId = params?.productId ?? "";

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready";

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<readonly Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const refresh = async () => {
    if (!canCall || !productId) return;
    setError(null);
    setNotFound(false);
    setLoading(true);
    try {
      const productRes = await apiFetch(
        `/api/pim/products/${encodeURIComponent(productId)}`,
      );
      if (productRes.status === 404) {
        setProduct(null);
        setVariants([]);
        setNotFound(true);
        return;
      }
      if (!productRes.ok) {
        throw new Error(
          typeof productRes.data === "string"
            ? productRes.data
            : JSON.stringify(productRes.data),
        );
      }
      const parsedProduct = ProductGetResponseSchema.parse(productRes.data);
      setProduct(parsedProduct.item);

      const variantsRes = await apiFetch(
        `/api/pim/products/${encodeURIComponent(productId)}/variants`,
      );
      if (!variantsRes.ok) {
        throw new Error(
          typeof variantsRes.data === "string"
            ? variantsRes.data
            : JSON.stringify(variantsRes.data),
        );
      }
      const parsedVariants = VariantListResponseSchema.parse(variantsRes.data);
      setVariants(parsedVariants.items);
    } catch (err) {
      setError(String(err));
      setProduct(null);
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status, productId]);

  if (notFound) {
    return (
      <YStack gap="$3">
        <Link href="/pim">{tProducts("back")}</Link>
        <SizableText color="var(--text-muted)">{tProducts("notFound")}</SizableText>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      <XStack gap="$3" alignItems="center">
        <Link href="/pim">{tProducts("back")}</Link>
        <Button
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          onPress={() => void refresh()}
          disabled={!canCall || loading}
        >
          {loading ? tProducts("refreshing") : tProducts("refresh")}
        </Button>
      </XStack>

      {product ? (
        <>
          <H1 mb="$2">{product.name}</H1>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
            {tFields("sku")}: {product.sku} · {tFields("status")}: {tValues(product.status)}
          </SizableText>
          {product.description ? (
            <SizableText fontFamily="$body">{product.description}</SizableText>
          ) : null}
        </>
      ) : null}

      {error ? <ErrorBox>{error}</ErrorBox> : null}

      <View role="region" aria-labelledby="variants-heading">
        <SizableText
          id="variants-heading"
          size="$4"
          fontWeight="bold"
          fontFamily="$heading"
          mb="$2"
        >
          {tVariants("title")}
        </SizableText>
        {!loading && variants.length === 0 ? (
          <SizableText size="$2" color="var(--text-muted)">
            {tVariants("noVariants")}
          </SizableText>
        ) : null}
        {variants.length > 0 ? (
          <ul className="brew-recipe-list">
            {variants.map((v) => (
              <li key={v.id} className="brew-recipe-list-row">
                <SizableText fontFamily="$body">
                  <SizableText fontWeight="bold">{v.sku}</SizableText>
                  <SizableText color="var(--text-muted)"> · {v.name}</SizableText>
                </SizableText>
              </li>
            ))}
          </ul>
        ) : null}
      </View>
    </YStack>
  );
}
