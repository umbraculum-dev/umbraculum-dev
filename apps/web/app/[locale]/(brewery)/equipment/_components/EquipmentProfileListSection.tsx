"use client";

import { Accordion, Button, SizableText, View, XStack } from "tamagui";

import { BrewAccordionSection } from "../../_components/BrewAccordionSection";
import type { useEquipmentPage } from "../_hooks/useEquipmentPage";

type Model = ReturnType<typeof useEquipmentPage>;

export function EquipmentProfileListSection(props: { model: Model }) {
  const {
    t,
    tUnits,
    profiles,
    canWrite,
    openSections,
    setListSectionOpen,
    beginEdit,
    onDelete,
  } = props.model;

  return (
    <View mt="$3">
      <Accordion
        type="single"
        collapsible
        value={openSections.includes("list") ? "list" : ""}
        onValueChange={(v) => setListSectionOpen(v === "list")}
      >
        <BrewAccordionSection
          value="list"
          headingId="equipment-list-heading"
          title={t("listTitle")}
          open={openSections.includes("list")}
        >
          <View mt="$3">
            {profiles.length ? (
              <View className="brew-table-wrap">
                <table className="brew-table">
                  <thead>
                    <tr>
                      <th align="left">{t("colName")}</th>
                      <th align="left">{t("colKettleVol", { unit: tUnits("L") })}</th>
                      <th align="left">{t("colMashEff")}</th>
                      {canWrite ? <th align="left">{t("colActions")}</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.equipment?.kettle?.kettleVolumeLiters == null ? "—" : p.equipment.kettle.kettleVolumeLiters}</td>
                        <td>{p.equipment?.mash?.mashEfficiencyPercent == null ? "—" : p.equipment.mash.mashEfficiencyPercent}</td>
                        {canWrite ? (
                          <td>
                            <XStack gap="$2" display="inline-flex">
                              <Button
                                size="$3"
                                onPress={() => beginEdit(p)}
                                bg="var(--surface-2)"
                                borderWidth={1}
                                borderColor="var(--border)"
                                color="var(--text)"
                              >
                                {t("edit")}
                              </Button>
                              <Button
                                size="$3"
                                onPress={() => void onDelete(p.id)}
                                bg="var(--surface-2)"
                                borderWidth={1}
                                borderColor="var(--border)"
                                color="var(--text)"
                              >
                                {t("delete")}
                              </Button>
                            </XStack>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </View>
            ) : (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}>
                {t("noProfiles")}
              </SizableText>
            )}
          </View>
        </BrewAccordionSection>
      </Accordion>
    </View>
  );
}
