"use client";

import { Accordion, Button, H2, SizableText, View, XStack } from "tamagui";

import { ErrorBox } from "../../_components/recipe-edit";
import type { useWaterProfilesPage } from "../_hooks/useWaterProfilesPage";

type Model = ReturnType<typeof useWaterProfilesPage>;

export function WaterProfileListSection(props: { model: Model }) {
  const {
    t,
    profiles,
    allProfiles,
    error,
    admin,
    openSections,
    onToggleVerify,
    onDeleteProfile,
  } = props.model;

  return (
    <Accordion.Item value="table">
      <View className="brew-panel" aria-labelledby="profiles-table-heading">
        <Accordion.Header>
          <Accordion.Trigger unstyled cursor="pointer">
            <XStack alignItems="center" justifyContent="space-between" width="100%">
              <H2 id="profiles-table-heading" mt={0}>
                {t("viewAllTableTitle")}
              </H2>
              <SizableText size="$2" opacity={0.7}>
                {openSections.includes("table") ? "▾" : "▸"}
              </SizableText>
            </XStack>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">
            {profiles ? `${allProfiles.length} profiles loaded.` : "Not loaded yet."}
          </SizableText>

          {error ? (
            <ErrorBox mt="$3">{error}</ErrorBox>
          ) : null}

          <View className="brew-table-wrap" mt="$3">
            <table className="brew-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Scope</th>
                  <th>Status</th>
                  <th align="right">pH</th>
                  <th align="right">Ca</th>
                  <th align="right">Mg</th>
                  <th align="right">Na</th>
                  <th align="right">SO4</th>
                  <th align="right">Cl</th>
                  <th align="right">HCO3</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allProfiles.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 1 ? "brew-table-row-alt" : undefined}>
                    <td>{p.name}</td>
                    <td>
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                        {p.scope}/{p.type}
                      </SizableText>
                    </td>
                    <td>
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                        {p.verificationStatus}
                      </SizableText>
                    </td>
                    <td align="right">
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                        {p.ph == null ? "—" : p.ph.toFixed(2)}
                      </SizableText>
                    </td>
                    <td align="right">{p.calcium}</td>
                    <td align="right">{p.magnesium}</td>
                    <td align="right">{p.sodium}</td>
                    <td align="right">{p.sulfate}</td>
                    <td align="right">{p.chloride}</td>
                    <td align="right">{p.bicarbonate}</td>
                    <td>
                      {admin && p.scope !== "system" ? (
                        <XStack gap="$2" alignItems="center">
                          <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onToggleVerify(p)}>
                            {p.verificationStatus === "verified" ? "Mark unverified" : "Mark verified"}
                          </Button>
                          <Button
                            size="$3"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            onPress={() => void onDeleteProfile(p)}
                            aria-label={`Delete water profile ${p.name}`}
                          >
                            Delete
                          </Button>
                        </XStack>
                      ) : (
                        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                          —
                        </SizableText>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </View>

          {!admin ? (
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}>
              Only <code>owner</code> and <code>brewery_admin</code> can add/verify profiles.
            </SizableText>
          ) : null}
        </Accordion.Content>
      </View>
    </Accordion.Item>
  );
}
