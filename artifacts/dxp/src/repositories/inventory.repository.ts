import inventoryData from "../content/inventory.json";

export type InventoryNode = (typeof inventoryData)["nodes"][number];
export type InventoryEdge = (typeof inventoryData)["edges"][number];
export type Inventory = typeof inventoryData;

export function getInventory(): Inventory {
  return inventoryData;
}
