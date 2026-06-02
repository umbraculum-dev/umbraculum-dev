"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button, H1, SizableText, YStack } from "tamagui";
import { listCategories } from "@umbraculum/api-client/pim";
import { type CategoryTreeNode } from "@umbraculum/pim-contracts";

import { Link } from "../../../../src/i18n/navigation";
import { ErrorBox } from "../../../_components/recipe-edit";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { webPlatformApiClient } from "../../../_lib/webApiClient";

/**
 * PIM categories — Week 1 audit shape.
 *
 * URL: `/en/categories`. Previously `/en/pim/categories` per the
 * URL-axis layout corrected by the audit ([`docs/design/
 * web-route-group-audit.md`](../../../../../../docs/design/web-route-group-audit.md)).
 * `categories` is one of three canonical static sub-segments the PIM
 * module owns via `registerWebModule({ ownedUrlSegments })`.
 */
function CategoryTree({ nodes, depth }: { nodes: readonly CategoryTreeNode[]; depth: number }) {
  if (nodes.length === 0) return null;
  return (
    <ul className="brew-recipe-list" style={{ marginLeft: depth > 0 ? 16 : 0 }}>
      {nodes.map((node) => (
        <li key={node.id} className="brew-recipe-list-row">
          <SizableText fontFamily="$body">
            <SizableText fontWeight="bold">{node.code}</SizableText>
            <SizableText color="var(--text-muted)"> · {node.label}</SizableText>
          </SizableText>
          <CategoryTree nodes={node.children} depth={depth + 1} />
        </li>
      ))}
    </ul>
  );
}

export default function PimCategoriesPage() {
  const t = useTranslations("pim");
  const tCategories = useTranslations("pim.categories");

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready";

  const [tree, setTree] = useState<readonly CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!canCall) return;
    setError(null);
    setLoading(true);
    try {
      const client = webPlatformApiClient();
      const data = await listCategories(client);
      setTree(data.tree);
    } catch (err) {
      setError(String(err));
      setTree([]);
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
      <Link href="/products">{tCategories("back")}</Link>
      <H1 mb="$2">{tCategories("title")}</H1>
      <Button
        size="$3"
        bg="var(--surface-2)"
        borderWidth={1}
        borderColor="var(--border)"
        color="var(--text)"
        onPress={() => void refresh()}
        disabled={!canCall || loading}
      >
        {loading ? t("products.refreshing") : t("products.refresh")}
      </Button>
      {error ? <ErrorBox>{error}</ErrorBox> : null}
      {!loading && tree.length === 0 && !error ? (
        <SizableText size="$2" color="var(--text-muted)">
          {tCategories("noCategories")}
        </SizableText>
      ) : null}
      <CategoryTree nodes={tree} depth={0} />
    </YStack>
  );
}
