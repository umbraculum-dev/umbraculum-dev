import type { useRequireAuth } from "../../../../../_lib/useRequireAuth";
import type { useWaterMashAcidification } from "./useWaterMashAcidification";
import type { useWaterMashAdjustment } from "./useWaterMashAdjustment";
import type { useWaterMashGrist } from "./useWaterMashGrist";
import type { useWaterMashPageLoad } from "./useWaterMashPageLoad";
import type { useWaterMashProfiles } from "./useWaterMashProfiles";
import type { useWaterMashSalts } from "./useWaterMashSalts";
import type { useWaterMashSteps } from "./useWaterMashSteps";
import type { useWaterSurfaceMath } from "../../_hooks/useWaterSurfaceMath";

export function buildWaterMashPageReturn(params: {
  locale: string;
  tWater: (key: string) => string;
  t: (key: string) => string;
  tEdit: (key: string) => string;
  tUnits: (key: string) => string;
  tMath: (key: string) => string;
  authState: ReturnType<typeof useRequireAuth>;
  params: { id?: string };
  recipeId: string;
  pageLoad: ReturnType<typeof useWaterMashPageLoad>;
  profilesHook: ReturnType<typeof useWaterMashProfiles>;
  surfaceMath: ReturnType<typeof useWaterSurfaceMath>["surfaceMath"];
  setSurfaceMath: ReturnType<typeof useWaterSurfaceMath>["setSurfaceMath"];
  openMashSections: string[];
  setOpenMashSections: (value: string[]) => void;
  savingError: string | null;
  setSavingError: (value: string | null) => void;
  formatHints: Record<string, { decimals?: number }> | undefined;
  setFormatHints: (hints: Record<string, { decimals?: number }> | undefined) => void;
  fmt: (unitKey: string, value: unknown, fallback: number) => string;
  canCall: boolean;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  adjustment: ReturnType<typeof useWaterMashAdjustment>;
  grist: ReturnType<typeof useWaterMashGrist>;
  acid: ReturnType<typeof useWaterMashAcidification>;
  salts: ReturnType<typeof useWaterMashSalts>;
  steps: ReturnType<typeof useWaterMashSteps>;
}) {
  const {
    locale,
    tWater,
    t,
    tEdit,
    tUnits,
    tMath,
    authState,
    params: routeParams,
    recipeId,
    pageLoad,
    profilesHook,
    surfaceMath,
    setSurfaceMath,
    openMashSections,
    setOpenMashSections,
    savingError,
    setSavingError,
    formatHints,
    setFormatHints,
    fmt,
    canCall,
    saveSettings,
    adjustment,
    grist,
    acid,
    salts,
    steps,
  } = params;

  return {
    locale,
    tWater,
    t,
    tEdit,
    tUnits,
    tMath,
    authState,
    params: routeParams,
    recipeId,
    loadRecipeMeta: pageLoad.loadRecipeMeta,
    me: profilesHook.me,
    profiles: profilesHook.profiles,
    loadingProfiles: profilesHook.loadingProfiles,
    profilesError: profilesHook.profilesError,
    settingsError: pageLoad.settingsError,
    setSettingsError: pageLoad.setSettingsError,
    savingError,
    setSavingError,
    formatHints,
    setFormatHints,
    fmt,
    canCall,
    surfaceMath,
    setSurfaceMath,
    openMashSections,
    setOpenMashSections,
    refreshProfiles: profilesHook.refreshProfiles,
    loadSettings: pageLoad.loadSettings,
    waterVolumes: steps.waterVolumes,
    allProfiles: profilesHook.allProfiles,
    waterProfiles: profilesHook.waterProfiles,
    dilutionProfiles: profilesHook.dilutionProfiles,
    admin: profilesHook.admin,
    saveSettings,
    ...adjustment,
    ...grist,
    ...acid,
    ...salts,
    ...steps,
  };
}
