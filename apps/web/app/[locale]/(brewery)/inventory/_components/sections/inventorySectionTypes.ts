import type { useInventoryPage } from "../../_hooks/useInventoryPage";

export type InventorySectionModel = ReturnType<typeof useInventoryPage>;

export type InventorySectionProps = {
  model: InventorySectionModel;
};
