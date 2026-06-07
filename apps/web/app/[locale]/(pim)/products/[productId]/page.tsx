"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, H1, SizableText, View, XStack, YStack } from "tamagui";
import { ApiClientError } from "@umbraculum/api-client";
import { getProduct, listProductVariants } from "@umbraculum/api-client/pim";
import { type Product, type Variant } from "@umbraculum/pim-contracts";

import { Link } from "../../../../../src/i18n/navigation";
import { ErrorBox } from "../../../../_shared-layout/_components/ErrorBox";
import { useRequireAuth } from "../../../../_shared-layout/_lib/useRequireAuth";
import { webPlatformApiClient } from "../../../../_shared-layout/_lib/webApiClient";

/**
 * PIM product detail — Week 1 audit shape.
 *
 * URL: `/en/products/<productId>`. Previously `/en/pim/<productId>` per
 * the URL-axis layout corrected by the audit ([`docs/design/
 * web-route-group-audit.md`](../../../../../../../docs/design/web-route-group-audit.md)).
 */
export default function PimProductDetailPage() {
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
      const client = webPlatformApiClient();
      const parsedProduct = await getProduct(client, productId);
      setProduct(parsedProduct.item);

      const parsedVariants = await listProductVariants(client, productId);
      setVariants(parsedVariants.items);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setProduct(null);
        setVariants([]);
        setNotFound(true);
        return;
      }
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
        <Link href="/products">{tProducts("back")}</Link>
        <SizableText color="var(--text-muted)">{tProducts("notFound")}</SizableText>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      <XStack gap="$3" alignItems="center">
        <Link href="/products">{tProducts("back")}</Link>
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
