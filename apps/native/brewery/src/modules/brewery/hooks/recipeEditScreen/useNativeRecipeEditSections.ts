import { useState } from "react";

export function useNativeRecipeEditSections() {
  const [openSections, setOpenSections] = useState<string[]>(["basics"]);
  const [openYeastIds, setOpenYeastIds] = useState<string[]>([]);
  const [stylePickerOpen, setStylePickerOpen] = useState(false);

  return {
    openSections,
    setOpenSections,
    openYeastIds,
    setOpenYeastIds,
    stylePickerOpen,
    setStylePickerOpen,
  };
}
