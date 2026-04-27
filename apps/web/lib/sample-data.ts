import type { WeighSessionSummary } from "@weighpro/core";

export const sessions: WeighSessionSummary[] = [
  {
    id: "WB-1048",
    plate: "GX22 FBD",
    customerName: "East African Spirits",
    product: "Finished goods dispatch",
    status: "awaiting_second_weight",
    firstWeightKg: 14620,
    lastPlateConfidence: 0.94,
  },
  {
    id: "WB-1049",
    plate: "AB12 CDE",
    customerName: "GAKI Investment",
    product: "Seed cotton intake",
    status: "awaiting_first_weight",
    lastPlateConfidence: 0.89,
  },
  {
    id: "WB-1050",
    plate: "KT08 WPR",
    customerName: "GAKI Investment",
    product: "Lint bales transfer",
    status: "completed",
    firstWeightKg: 11200,
    secondWeightKg: 16440,
    netWeightKg: 5240,
    lastPlateConfidence: 0.98,
  },
];

export const pendingOrders = [
  {
    externalNoteId: "REQ-2026-00017",
    businessUnit: "East African Spirits",
    movementType: "finished_goods_dispatch",
    customerName: "Blue Coast Distributor",
    vehiclePlate: "GX22 FBD",
    product: "Assorted finished goods",
    scheduledAt: "08:30",
  },
  {
    externalNoteId: "REQ-2026-00018",
    businessUnit: "GAKI Investment",
    movementType: "raw_material_receipt",
    customerName: "Contract farmers group",
    vehiclePlate: "AB12 CDE",
    product: "Seed cotton",
    scheduledAt: "09:15",
  },
];
