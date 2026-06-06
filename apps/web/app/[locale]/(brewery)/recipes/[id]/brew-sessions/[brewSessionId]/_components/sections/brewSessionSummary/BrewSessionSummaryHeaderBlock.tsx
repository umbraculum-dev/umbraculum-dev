import { SizableText } from "tamagui";

import { CodeInline } from "../../../../../../../../../_components/CodeInline";

import type { BrewSessionSummaryHeaderModel } from "./brewSessionSummaryTypes";

export function BrewSessionSummaryHeaderBlock({ model }: { model: BrewSessionSummaryHeaderModel }) {
  const { t, session, recipe } = model;

  if (!session || !recipe) return null;

  return (
    <>
      <SizableText size="$3" fontFamily="$body" color="var(--text)">
        {t("sessionCode")}: <CodeInline>{session.code}</CodeInline>
      </SizableText>
      <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}>
        {t("recipeLine", { name: recipe.name, version: String(recipe.version).padStart(2, "0") })}
      </SizableText>
      <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}>
        {t("statusLine", { status: session.status })}
      </SizableText>
    </>
  );
}
