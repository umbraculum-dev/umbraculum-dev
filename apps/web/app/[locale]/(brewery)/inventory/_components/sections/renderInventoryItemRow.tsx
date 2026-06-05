import { InventoryItemCard } from "../InventoryItemCard";
import type { InventorySectionModel } from "./inventorySectionTypes";
import type { InventoryItem } from "../../_lib/inventoryTypes";

export function renderInventoryItemRow(model: InventorySectionModel, it: InventoryItem) {
  const { qtyDraft, setQtyDraft, updateQuantity, removeItem, canCall, t, unitLabel } = model;
  return (
    <InventoryItemCard
      key={it.id}
      item={it}
      qtyDraft={qtyDraft}
      setQtyDraft={setQtyDraft}
      updateQuantity={updateQuantity}
      removeItem={removeItem}
      canCall={canCall}
      t={t}
      unitLabel={unitLabel}
    />
  );
}
