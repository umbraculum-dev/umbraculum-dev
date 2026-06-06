import type { useRequireAuth } from "../../../../_lib/useRequireAuth";
import type { useRecipeEditCatalogs } from "./useRecipeEditCatalogs";
import type { useRecipeEditFermentables } from "./useRecipeEditFermentables";
import type { useRecipeEditHops } from "./useRecipeEditHops";
import type { useRecipeEditLayout } from "./useRecipeEditLayout";
import type { useRecipeEditLoad } from "./useRecipeEditLoad";
import type { useRecipeEditMashing } from "./useRecipeEditMashing";
import type { useRecipeEditMisc } from "./useRecipeEditMisc";
import type { useRecipeEditPageI18n } from "./useRecipeEditPageI18n";
import type { useRecipeEditSave } from "./useRecipeEditSave";
import type { useRecipeEditSections } from "./useRecipeEditSections";
import type { useRecipeEditYeast } from "./useRecipeEditYeast";
import type { useRecipeEditAnalysis } from "./useRecipeEditAnalysis";

type AuthState = ReturnType<typeof useRequireAuth>;

export function buildRecipeEditPageReturn(params: {
  i18n: ReturnType<typeof useRecipeEditPageI18n>;
  authState: AuthState;
  loadRecipeMeta: (id: string) => Promise<unknown>;
  layout: ReturnType<typeof useRecipeEditLayout>;
  sections: ReturnType<typeof useRecipeEditSections>;
  catalogs: ReturnType<typeof useRecipeEditCatalogs>;
  canCallAccountScoped: boolean;
  fermentables: ReturnType<typeof useRecipeEditFermentables>;
  hops: ReturnType<typeof useRecipeEditHops>;
  yeast: ReturnType<typeof useRecipeEditYeast>;
  mashing: ReturnType<typeof useRecipeEditMashing>;
  misc: ReturnType<typeof useRecipeEditMisc>;
  load: ReturnType<typeof useRecipeEditLoad>;
  save: ReturnType<typeof useRecipeEditSave>;
  analysisState: ReturnType<typeof useRecipeEditAnalysis>;
  roundTo: (n: number, decimals: number) => number;
}) {
  const {
    i18n,
    authState,
    loadRecipeMeta,
    layout,
    sections,
    catalogs,
    canCallAccountScoped,
    fermentables,
    hops,
    yeast,
    mashing,
    misc,
    load,
    save,
    analysisState,
    roundTo,
  } = params;

  return {
    ...i18n,
    authState,
    loadRecipeMeta,
    layoutMetrics: layout.layoutMetrics,
    useDesktopRail: layout.useDesktopRail,
    roundTo,
    sections: sections.sections,
    openSections: sections.openSections,
    setSectionOpen: sections.setSectionOpen,
    surfaceMath: sections.surfaceMath,
    setSurfaceMath: sections.setSurfaceMath,
    loading: load.loading,
    loadError: load.loadError,
    saving: save.saving,
    saveError: save.saveError,
    saveStatus: save.saveStatus,
    setSaveStatus: save.setSaveStatus,
    recipe: load.recipe,
    analysis: analysisState.analysis,
    versions: load.versions,
    _versionsLoading: load._versionsLoading,
    versionsError: load.versionsError,
    creatingVersion: save.creatingVersion,
    createVersionError: save.createVersionError,
    duplicatingRecipe: save.duplicatingRecipe,
    creatingBrewSession: save.creatingBrewSession,
    brewSessionError: save.brewSessionError,
    brewSessions: save.brewSessions,
    brewSessionsLoading: save.brewSessionsLoading,
    duplicateRecipeError: save.duplicateRecipeError,
    name: load.name,
    setName: load.setName,
    styleKey: load.styleKey,
    setStyleKey: load.setStyleKey,
    notes: load.notes,
    setNotes: load.setNotes,
    gristRows: fermentables.gristRows,
    setGristRows: fermentables.setGristRows,
    hopsRows: hops.hopsRows,
    setHopsRows: hops.setHopsRows,
    yeastRows: yeast.yeastRows,
    setYeastRows: yeast.setYeastRows,
    miscRows: misc.miscRows,
    setMiscRows: misc.setMiscRows,
    mashProcedure: mashing.mashProcedure,
    setMashProcedure: mashing.setMashProcedure,
    mashRows: mashing.mashRows,
    setMashRows: mashing.setMashRows,
    waterSettings: mashing.waterSettings,
    yeastAttenuationOverrides: yeast.yeastAttenuationOverrides,
    setYeastAttenuationOverrides: yeast.setYeastAttenuationOverrides,
    boilTimeMinutes: load.boilTimeMinutes,
    setBoilTimeMinutes: load.setBoilTimeMinutes,
    styles: catalogs.styles,
    stylesLoading: catalogs.stylesLoading,
    stylesError: catalogs.stylesError,
    equipmentProfiles: catalogs.equipmentProfiles,
    equipmentProfilesLoading: catalogs.equipmentProfilesLoading,
    equipmentProfilesError: catalogs.equipmentProfilesError,
    selectedEquipmentProfileId: catalogs.selectedEquipmentProfileId,
    setSelectedEquipmentProfileId: catalogs.setSelectedEquipmentProfileId,
    equipmentApplyError: save.equipmentApplyError,
    equipmentApplying: save.equipmentApplying,
    fermentableQuery: fermentables.fermentableQuery,
    setFermentableQuery: fermentables.setFermentableQuery,
    fermentableResults: fermentables.fermentableResults,
    fermentableSearching: fermentables.fermentableSearching,
    fermentableSearchError: fermentables.fermentableSearchError,
    fermentableAddMessage: fermentables.fermentableAddMessage,
    hopQuery: hops.hopQuery,
    setHopQuery: hops.setHopQuery,
    hopResults: hops.hopResults,
    hopSearching: hops.hopSearching,
    hopSearchError: hops.hopSearchError,
    canCallAccountScoped,
    waterVolumes: mashing.waterVolumes,
    spargeConfigured: mashing.spargeConfigured,
    mashRowsFiltered: mashing.mashRowsFiltered,
    programmedSessions: save.programmedSessions,
    brewingNowSessions: save.brewingNowSessions,
    lastBrewSessions: save.lastBrewSessions,
    spargeStepTempDisplay: mashing.spargeStepTempDisplay,
    spargeMethodLabel: mashing.spargeMethodLabel,
    applyEquipmentProfileToRecipe: save.applyEquipmentProfileToRecipe,
    onSave: save.onSave,
    onCreateAnotherVersion: save.onCreateAnotherVersion,
    onDuplicateRecipe: save.onDuplicateRecipe,
    onBrewRecipe: save.onBrewRecipe,
    addGristRow: fermentables.addGristRow,
    addFermentableFromDb: fermentables.addFermentableFromDb,
    addHopFromDb: hops.addHopFromDb,
    removeGristRow: fermentables.removeGristRow,
    updateGristRow: fermentables.updateGristRow,
    addHopRow: hops.addHopRow,
    removeHopRow: hops.removeHopRow,
    updateHopRow: hops.updateHopRow,
    addMiscRow: misc.addMiscRow,
    removeMiscRow: misc.removeMiscRow,
    updateMiscRow: misc.updateMiscRow,
    onSearchFermentables: fermentables.onSearchFermentables,
    clearFermentableSearchResults: fermentables.clearFermentableSearchResults,
    onSearchHops: hops.onSearchHops,
    clearHopSearchResults: hops.clearHopSearchResults,
    inferMaltClass: fermentables.inferMaltClass,
    isRoastedLike: fermentables.isRoastedLike,
    inferDehuskedFromName: fermentables.inferDehuskedFromName,
    gristTotals: fermentables.gristTotals,
    gristWaterConsistency: misc.gristWaterConsistency,
  };
}
