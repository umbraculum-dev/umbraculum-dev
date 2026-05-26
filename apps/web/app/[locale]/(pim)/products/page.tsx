"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Button, H1, Input, SizableText, View, XStack, YStack } from "tamagui";
import {
  ProductListResponseSchema,
  type Product,
} from "@umbraculum/pim-contracts";

import { Link } from "../../../../src/i18n/navigation";
import { ErrorBox } from "../../../_components/recipe-edit";
import { apiFetch } from "../../../_lib/apiClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";

/**
 * PIM products list — Week 1 audit shape.
 *
 * URL: `/en/products` (β filesystem-axis; the `(pim)/` route group does
 * not contribute a path segment per RFC-0002 Decision B, and `products`
 * is one of three canonical static sub-segments the PIM module owns:
 * `products`, `categories`, `attribute-sets`. See
 * `docs/design/web-route-group-audit.md` §3.4 + RFC-0006).
 *
 * Previous shape `apps/web/app/[locale]/pim/page.tsx` shipped a
 * URL-axis layout (`/en/pim/*`) that contradicted RFC-0002 Decision B's
 * "no URL prefix change" commitment. The Week 1 audit ([`docs/design/
 * web-route-group-audit.md`](../../../../../../docs/design/web-route-group-audit.md))
 * corrected it: PIM joins automation and brewery on the canonical
 * filesystem-axis β shape.
 *
 * NOTE: no `(pim)/page.tsx` group-root file (Discipline 1 — would
 * collide with `[locale]/page.tsx`). PIM's user-facing entry point is
 * `/en/products`; if a future "PIM dashboard" view is added, it lands
 * as `(pim)/dashboard/page.tsx` (or another static sub-segment), never
 * at the group root.
 */
export default function PimProductsPage() {
  const t = useTranslations("pim");
  const tProducts = useTranslations("pim.products");
  const tFields = useTranslations("pim.fields");
  const tValues = useTranslations("pim.values");

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready";

  const [products, setProducts] = useState<readonly Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
    );
  }, [products, search]);

  const refresh = async () => {
    if (!canCall) return;
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch("/api/pim/products");
      if (!res.ok) {
        throw new Error(
          typeof res.data === "string" ? res.data : JSON.stringify(res.data),
        );
      }
      const parsed = ProductListResponseSchema.parse(res.data);
      setProducts(parsed.items);
    } catch (err) {
      setError(String(err));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status]);

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
          value={search}
          onChangeText={setSearch}
          disabled={!canCall || loading}
        />
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
        <Link href="/categories">{t("categories.title")}</Link>
        <Link href="/attribute-sets">{t("attributeSets.title")}</Link>
      </XStack>

      {error ? <ErrorBox>{error}</ErrorBox> : null}

      {loading && products.length === 0 ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {tProducts("loading")}
        </SizableText>
      ) : null}

      {!loading && filtered.length === 0 && !error ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {tProducts("noProducts")}
        </SizableText>
      ) : null}

      {filtered.length > 0 ? (
        <View role="region" aria-labelledby="products-heading">
          <SizableText
            id="products-heading"
            size="$4"
            fontWeight="bold"
            fontFamily="$heading"
            mb="$2"
          >
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
                      <SizableText fontWeight="bold">{tFields("status")}:</SizableText>{" "}
                      {tValues(p.status)}
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
      ) : null}
    </YStack>
  );
}
