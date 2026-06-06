"use client";

import { listProductionOrders } from "@umbraculum/api-client/mrp";
import { type ProductionOrder } from "@umbraculum/mrp-contracts";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { H1, SizableText, XStack, YStack } from "tamagui";

import { AskAiLink } from "../../../_shell/_components/AskAiLink";
import { Link } from "../../../../src/i18n/navigation";
import { AsyncExportButton } from "../../../_shell/_components/AsyncExportButton";
import { ErrorBox } from "../../(brewery)/_components/recipe-edit";
import { useRequireAuth } from "../../../_shell/_lib/useRequireAuth";
import { webPlatformApiClient } from "../../../_shell/_lib/webApiClient";
import { ProductionOrderSummary, RefreshButton, SectionCard } from "../_components/MrpReadOnly";

export default function MrpProductionOrdersPage() {
  const t = useTranslations("mrp");
  const tOrders = useTranslations("mrp.productionOrders");
  const tExport = useTranslations("mrp.export");
  const tFields = useTranslations("mrp.fields");
  const tValues = useTranslations("mrp.values");

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready";

  const [orders, setOrders] = useState<readonly ProductionOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!canCall) return;
    setError(null);
    setLoading(true);
    try {
      const client = webPlatformApiClient();
      const data = await listProductionOrders(client);
      setOrders(data.items);
    } catch (err) {
      setError(String(err));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status]);

  const labels = {
    orderNumber: tFields("orderNumber"),
    status: tFields("status"),
    quantity: tFields("quantity"),
    plannedStartAt: tFields("plannedStartAt"),
    dueAt: tFields("dueAt"),
    source: tFields("source"),
    sourceRefId: tFields("sourceRefId"),
    lineCount: tFields("lineCount"),
    debugId: tFields("debugId"),
    unknownDate: tValues("unknownDate"),
    none: tValues("none"),
    canonical: tValues("canonicalMrpRow"),
    brewery: tValues("projectedFromBrewery"),
    projectedFromModule: (module: string) => tValues("projectedFromModule", { module }),
  };

  return (
    <YStack gap="$3">
      <H1>{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("subtitle")}
      </SizableText>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("alphaNote")}
      </SizableText>

      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        <RefreshButton onClick={() => void refresh()} disabled={!canCall || loading}>
          {loading ? t("refreshing") : t("refresh")}
        </RefreshButton>
        <AskAiLink fromRoute="productionOrders" />
        <Link href="/material-requirements">{tOrders("materialRequirements")}</Link>
        <Link href="/capacity">{tOrders("capacityLink")}</Link>
        <Link href="/schedule">{tOrders("scheduleLink")}</Link>
        <AsyncExportButton
          postUrl="/api/mrp/production-orders/render-jobs"
          labelIdle={tExport("productionOrdersCsv")}
          labelWorking={tExport("working")}
          labelReady={tExport("download")}
          labelError={tExport("error")}
          disabled={!canCall}
        />
      </XStack>

      {error ? <ErrorBox>{error}</ErrorBox> : null}

      {loading && orders.length === 0 ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}

      {!loading && orders.length === 0 && !error ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("noProductionOrders")}
        </SizableText>
      ) : null}

      {orders.length > 0 ? (
        <SectionCard headingId="mrp-production-orders-heading" title={tOrders("listTitle")}>
          <ul className="brew-recipe-list">
            {orders.map((order) => (
              <li key={order.id} className="brew-recipe-list-row">
                <YStack gap="$2">
                  <ProductionOrderSummary order={order} labels={labels} />
                  <XStack gap="$3" flexWrap="wrap">
                    <Link href={`/production-orders/${encodeURIComponent(order.id)}`}>
                      {tOrders("openDetail")}
                    </Link>
                  </XStack>
                </YStack>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}
    </YStack>
  );
}
