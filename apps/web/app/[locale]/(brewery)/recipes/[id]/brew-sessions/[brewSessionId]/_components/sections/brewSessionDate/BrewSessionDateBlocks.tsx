"use client";

import { Button, Input, SizableText, View, XStack, YStack } from "tamagui";

import { ErrorBox, RecipeEditFieldLabel } from "../../../../../../../../../_components/recipe-edit";
import type { BrewSessionDetailPageModel } from "../../../_hooks/useBrewSessionDetailPage";

function padDatePart(n: number) {
  return String(n).padStart(2, "0");
}

function syncDateInputsFromSession(
  scheduledDate: string | null | undefined,
  setDateInputValue: (v: string) => void,
  setTimeInputValue: (v: string) => void,
) {
  if (scheduledDate) {
    const d = new Date(scheduledDate);
    setDateInputValue(`${d.getFullYear()}-${padDatePart(d.getMonth() + 1)}-${padDatePart(d.getDate())}`);
    setTimeInputValue(`${padDatePart(d.getHours())}:${padDatePart(d.getMinutes())}`);
  } else {
    setDateInputValue("");
    setTimeInputValue("");
  }
}

export function BrewSessionDateEditForm({ model }: { model: BrewSessionDetailPageModel }) {
  const {
    t,
    canCall,
    dateInputValue,
    setDateInputValue,
    timeInputValue,
    setTimeInputValue,
    dateSaving,
    dateError,
    setDateEditing,
    session,
    onSaveDate,
    onRemoveDate,
  } = model;

  return (
    <>
      <XStack gap="$2" items="flex-end" flexWrap="wrap">
        <View minW={160}>
          <RecipeEditFieldLabel htmlFor="session-date-picker">{t("dateLabel")}</RecipeEditFieldLabel>
          <Input
            asChild
            size="$3"
            w="100%"
            minW={140}
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
            color="var(--text)"
          >
            <input
              id="session-date-picker"
              type="date"
              value={dateInputValue}
              onChange={(e) => setDateInputValue(e.target.value)}
            />
          </Input>
        </View>
        <View minW={120}>
          <RecipeEditFieldLabel htmlFor="session-time-picker">{t("timeLabel")}</RecipeEditFieldLabel>
          <Input
            asChild
            size="$3"
            w="100%"
            minW={100}
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
            color="var(--text)"
          >
            <input
              id="session-time-picker"
              type="time"
              value={timeInputValue}
              onChange={(e) => setTimeInputValue(e.target.value)}
            />
          </Input>
        </View>
        <XStack gap="$2" items="flex-end" flexWrap="wrap">
          <Button
            onPress={() => void onSaveDate()}
            disabled={!canCall || dateSaving}
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            fontFamily="$body"
          >
            {dateSaving ? t("working") : t("dateSave")}
          </Button>
          <Button
            onPress={() => void onRemoveDate()}
            disabled={!canCall || dateSaving}
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            fontFamily="$body"
          >
            {dateSaving ? t("working") : t("dateRemove")}
          </Button>
          <Button
            onPress={() => {
              setDateEditing(false);
              syncDateInputsFromSession(session?.scheduledDate, setDateInputValue, setTimeInputValue);
            }}
            disabled={dateSaving}
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            fontFamily="$body"
          >
            {t("dateCancel")}
          </Button>
        </XStack>
      </XStack>
      {dateError ? <ErrorBox>{dateError}</ErrorBox> : null}
    </>
  );
}

export function BrewSessionDateDisplayRow({ model }: { model: BrewSessionDetailPageModel }) {
  const {
    t,
    canCall,
    session,
    setDateEditing,
    setDateInputValue,
    setTimeInputValue,
  } = model;

  return (
    <YStack gap="$2" width="100%">
      <XStack gap="$2" items="center" flexWrap="wrap">
        <SizableText size="$3" fontFamily="$body" color="var(--text)" flexShrink={0}>
          {session?.scheduledDate
            ? (() => {
                const d = new Date(session.scheduledDate);
                if (Number.isNaN(d.getTime())) return t("dateNotSet");
                return `${t("dateScheduledLabel")}: ${d.toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}`;
              })()
            : t("dateNotSet")}
        </SizableText>
        <Button
          onPress={() => {
            setDateEditing(true);
            syncDateInputsFromSession(session?.scheduledDate, setDateInputValue, setTimeInputValue);
          }}
          disabled={!canCall}
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
        >
          {session?.scheduledDate ? t("dateEdit") : t("dateAdd")}
        </Button>
      </XStack>
    </YStack>
  );
}
