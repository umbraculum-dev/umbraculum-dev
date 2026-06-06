import { Button, SizableText, View, XStack, YStack } from "tamagui";

import { ErrorBox, WarningBox } from "../../../../../../../../../_components/recipe-edit";

import { formatDateTime } from "../../../_lib/brewSessionDetailUi";

import type { BrewSessionSummaryActionsModel } from "./brewSessionSummaryTypes";

export function BrewSessionSummaryActionsBlock({ model }: { model: BrewSessionSummaryActionsModel }) {
  const {
    t,
    locale,
    canCall,
    session,
    sessionActionWorking,
    sessionActionError,
    onSessionAction,
    onStopSession,
    canDeleteSession,
    deleteConfirmShown,
    setDeleteConfirmShown,
    deleting,
    deleteError,
    setDeleteError,
    onDeleteSession,
    stoppedBy,
  } = model;

  if (!session) return null;

  return (
    <>
      <XStack gap="$2" items="center" flexWrap="wrap" mt="$3">
        {session.status === "draft" || session.status === "paused" ? (
          <Button
            onPress={() => void onSessionAction("start")}
            disabled={!canCall || sessionActionWorking != null}
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            fontFamily="$body"
          >
            {sessionActionWorking === "start"
              ? t("working")
              : session.status === "paused"
                ? t("resumeSession")
                : t("startSession")}
          </Button>
        ) : null}
        {session.status === "running" ? (
          <Button
            onPress={() => void onSessionAction("pause")}
            disabled={!canCall || sessionActionWorking != null}
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            fontFamily="$body"
          >
            {sessionActionWorking === "pause" ? t("working") : t("pauseSession")}
          </Button>
        ) : null}
        {session.startedAt != null && session.status !== "stopped" ? (
          <Button
            onPress={() => void onStopSession("manual")}
            disabled={!canCall || sessionActionWorking != null}
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            fontFamily="$body"
          >
            {sessionActionWorking === "stop" ? t("working") : t("stopSession")}
          </Button>
        ) : null}

        <Button
          onPress={() => {
            if (!canDeleteSession) {
              setDeleteConfirmShown(false);
              setDeleteError(t("deleteSessionStopBeforeDelete"));
              return;
            }
            setDeleteError(null);
            setDeleteConfirmShown((v) => !v);
          }}
          disabled={!canCall || deleting}
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
        >
          {t("deleteSessionButton")}
        </Button>
      </XStack>

      {sessionActionError ? <ErrorBox mt="$2">{sessionActionError}</ErrorBox> : null}
      {deleteError ? <ErrorBox mt="$2">{deleteError}</ErrorBox> : null}
      {session.status === "stopped" && session.stoppedAt ? (
        <View
          w="100%"
          mt="$2"
          p="$2"
          bg="color-mix(in srgb, var(--success) 14%, var(--surface))"
          borderWidth={1}
          borderColor="color-mix(in srgb, var(--success) 40%, var(--border))"
          rounded="$2"
        >
          <SizableText size="$2" fontFamily="$body" color="var(--text)" mt={0}>
            {stoppedBy === "auto"
              ? t("sessionAutoFinishedAtLine", { at: formatDateTime(locale, session.stoppedAt) })
              : t("sessionManualFinishedAtLine", { at: formatDateTime(locale, session.stoppedAt) })}
          </SizableText>
        </View>
      ) : null}

      {deleteConfirmShown ? (
        <WarningBox mt="$2">
          <YStack gap="$2">
            <SizableText size="$2" fontFamily="$body" color="var(--text)">
              {t("deleteSessionConfirm")}
            </SizableText>
            <XStack gap="$2" items="center" flexWrap="wrap">
              <Button
                onPress={() => void onDeleteSession()}
                disabled={!canCall || deleting}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {deleting ? t("deleting") : t("confirmDelete")}
              </Button>
              <Button
                onPress={() => setDeleteConfirmShown(false)}
                disabled={deleting}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {t("cancelDelete")}
              </Button>
            </XStack>
          </YStack>
        </WarningBox>
      ) : null}
    </>
  );
}
