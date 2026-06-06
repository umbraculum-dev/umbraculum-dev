"use client";

import { useTranslations } from "next-intl";
import { Button, Checkbox, Input, SizableText, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../(brewery)/_components/BrewSelect";
import { RecipeEditFieldLabel } from "../../../(brewery)/_components/recipe-edit";
import type { Placement } from "../_lib/platformAdsTypes";
import { placements } from "../_lib/platformAdsTypes";

type PlatformAdFormProps = {
  loading: boolean;
  placement: Placement;
  setPlacement: (placement: Placement) => void;
  imageUrl: string;
  setImageUrl: (imageUrl: string) => void;
  linkUrl: string;
  setLinkUrl: (linkUrl: string) => void;
  altText: string;
  setAltText: (altText: string) => void;
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
  priority: number;
  setPriority: (priority: number) => void;
  refresh: () => Promise<void>;
  onCreate: () => Promise<void>;
};

export function PlatformAdForm({
  loading,
  placement,
  setPlacement,
  imageUrl,
  setImageUrl,
  linkUrl,
  setLinkUrl,
  altText,
  setAltText,
  isActive,
  setIsActive,
  priority,
  setPriority,
  refresh,
  onCreate,
}: PlatformAdFormProps) {
  const t = useTranslations("platformAds");

  return (
    <YStack mt="$3" gap="$3">
      <XStack gap="$3" flexWrap="wrap" ai="flex-end">
        <View flex={1} minWidth={200}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="ad-placement">
            {t("form.placement")}
          </RecipeEditFieldLabel>
          <BrewSelect
            id="ad-placement"
            value={placement}
            onValueChange={(v) => setPlacement(v as Placement)}
            options={placements.map((p) => ({ value: p.value, label: t(p.labelKey) }))}
            width="full"
          />
          </YStack>
        </View>
        <View flex={1} minWidth={200}>
          <YStack gap="$1.5">
            <RecipeEditFieldLabel htmlFor="ad-priority">
            {t("form.priority")}
          </RecipeEditFieldLabel>
          <Input
            id="ad-priority"
            keyboardType="numeric"
            value={String(priority)}
            onChangeText={(text) => setPriority(text === "" ? 0 : Number(text))}
            size="$3"
            w="100%"
            bg="var(--surface)"
            borderWidth={1}
            borderColor="var(--border)"
            rounded="$2"
            fontFamily="$body"
          />
          </YStack>
        </View>
      </XStack>

      <YStack gap="$1.5">
        <RecipeEditFieldLabel htmlFor="ad-image-url">
          {t("form.imageUrl")}
        </RecipeEditFieldLabel>
        <Input
          id="ad-image-url"
          value={imageUrl}
          onChangeText={setImageUrl}
          size="$3"
          w="100%"
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$2"
          fontFamily="$body"
          autoComplete="off"
        />
      </YStack>

      <YStack gap="$1.5">
        <RecipeEditFieldLabel htmlFor="ad-link-url">
          {t("form.linkUrl")}
        </RecipeEditFieldLabel>
        <Input
          id="ad-link-url"
          value={linkUrl}
          onChangeText={setLinkUrl}
          size="$3"
          w="100%"
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$2"
          fontFamily="$body"
          autoComplete="off"
        />
      </YStack>

      <YStack gap="$1.5">
        <RecipeEditFieldLabel htmlFor="ad-alt-text">
          {t("form.altText")}
        </RecipeEditFieldLabel>
        <Input
          id="ad-alt-text"
          value={altText}
          onChangeText={setAltText}
          size="$3"
          w="100%"
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$2"
          fontFamily="$body"
          autoComplete="off"
        />
      </YStack>

      <XStack gap="$2" alignItems="center" className="brew-muted">
        <Checkbox
          id="ad-is-active"
          checked={isActive}
          onCheckedChange={(c) => setIsActive(c === true)}
          aria-label={t("form.isActive")}
          size="$2"
          native
        >
          <Checkbox.Indicator />
        </Checkbox>
        <SizableText as="label" htmlFor="ad-is-active" size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("form.isActive")}
        </SizableText>
      </XStack>

      <XStack gap="$2" justifyContent="flex-end">
        <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void refresh()} disabled={loading}>
          {loading ? t("refreshing") : t("refresh")}
        </Button>
        <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCreate()} disabled={loading}>
          {loading ? t("creating") : t("create")}
        </Button>
      </XStack>
    </YStack>
  );
}
