import {Link} from "../../../../../../../../src/i18n/navigation";
import {Button, SizableText, View, XStack} from "tamagui";

import {BrewSelect} from "../../../../../_components/BrewSelect";
import {ErrorBox, RecipeEditField, RecipeEditSection} from "../../../../../_components/recipe-edit";
import type {RecipeEditPageModel} from "../../_hooks/useRecipeEditPage";

export function RecipeEditEquipmentSection({ model }: { model: RecipeEditPageModel }) {
  const {
    t,
    tEquip,
    openSections,
    setSectionOpen,
    equipmentProfilesLoading,
    equipmentProfiles,
    equipmentProfilesError,
    selectedEquipmentProfileId,
    setSelectedEquipmentProfileId,
    equipmentApplyError,
    equipmentApplying,
    applyEquipmentProfileToRecipe
  } = model;

  return (
          <RecipeEditSection
            spaced
            id="equipment"
            headingId="equipment-heading"
            label={t("sections.equipment")}
            open={openSections['equipment']}
            onOpenChange={(open) => setSectionOpen("equipment", open)}
          >
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              {tEquip("help")}
            </SizableText>

            {equipmentProfilesError ? (
              <ErrorBox>{equipmentProfilesError}</ErrorBox>
            ) : null}

            <XStack gap="$3" mt="$3" flexWrap="wrap" items="flex-end">
              <View flex={1} minW={200}>
                <RecipeEditField id="equipment-profile" label={tEquip("profileLabel")}>
                  <BrewSelect
                    id="equipment-profile"
                    value={selectedEquipmentProfileId}
                    onValueChange={setSelectedEquipmentProfileId}
                    options={[
                      { value: "", label: tEquip("noneOption") },
                      ...equipmentProfiles.map((p) => ({ value: p.id, label: p.name })),
                    ]}
                    disabled={equipmentProfilesLoading}
                    width="full"
                  />
                </RecipeEditField>
              </View>
              <Button
                onPress={() => void applyEquipmentProfileToRecipe("apply")}
                disabled={!selectedEquipmentProfileId || equipmentApplying}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {equipmentApplying ? tEquip("working") : tEquip("apply")}
              </Button>
              <Button
                onPress={() => void applyEquipmentProfileToRecipe("reload")}
                disabled={!selectedEquipmentProfileId || equipmentApplying}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {equipmentApplying ? tEquip("working") : tEquip("reload")}
              </Button>
            </XStack>

            {equipmentApplyError ? (
              <ErrorBox mt="$3">{equipmentApplyError}</ErrorBox>
            ) : null}

            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}>
              {tEquip("manageTemplatesText")} <Link href="/equipment">{tEquip("manageTemplatesLinkText")}</Link>.
            </SizableText>
          </RecipeEditSection>
  );
}
