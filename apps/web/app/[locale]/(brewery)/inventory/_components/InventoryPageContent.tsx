"use client";

import { H1, SizableText, YStack } from "tamagui";

import { ErrorBox } from "../../../../_components/recipe-edit";
import { DashboardClient } from "../../../../DashboardClient";
import { Link } from "../../../../../src/i18n/navigation";
import type { useInventoryPage } from "../_hooks/useInventoryPage";
import { InventoryAcidSaltsSection } from "./sections/InventoryAcidSaltsSection";
import { InventoryDetergentsSection } from "./sections/InventoryDetergentsSection";
import { InventoryFermentablesSection } from "./sections/InventoryFermentablesSection";
import { InventoryHopsSection } from "./sections/InventoryHopsSection";
import { InventoryKeggingSection } from "./sections/InventoryKeggingSection";
import { InventorySpecialitiesSection } from "./sections/InventorySpecialitiesSection";

type Model = ReturnType<typeof useInventoryPage>;

export function InventoryPageContent(props: { model: Model; tCommon: (key: string) => string }) {
  const { model: m, tCommon } = props;
  const { t, authState, canCall, loading, error } = m;

  return (
    <YStack gap="$3">
      <H1 mb="$2">{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>
      <Link href="/">
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" as="span">
          {t("backToDashboard")}
        </SizableText>
      </Link>

      {authState.status === "error" ? <ErrorBox>{authState.error}</ErrorBox> : null}
      {error ? <ErrorBox>{error}</ErrorBox> : null}
      {loading ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {tCommon("loading")}
        </SizableText>
      ) : null}

      {canCall && !loading ? (
        <YStack gap="$3">
          <InventoryFermentablesSection model={m} />
          <InventoryHopsSection model={m} />
          <InventorySpecialitiesSection model={m} />
          <InventoryAcidSaltsSection model={m} />
          <InventoryDetergentsSection model={m} />
          <InventoryKeggingSection model={m} />
        </YStack>
      ) : null}

      <DashboardClient />
    </YStack>
  );
}
