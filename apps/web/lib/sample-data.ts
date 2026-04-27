import type { WeighSessionSummary } from "@weighpro/core";

export const sessions: WeighSessionSummary[] = [
  {
    id: "WB-1048",
    plate: "GX22 FBD",
    customerName: "Blue Coast Drinks",
    product: "Bottled drinks",
    status: "awaiting_second_weight",
    firstWeightKg: 14620,
    lastPlateConfidence: 0.94,
  },
  {
    id: "WB-1049",
    plate: "AB12 CDE",
    customerName: "Northline Stores",
    product: "Crated soft drinks",
    status: "awaiting_first_weight",
    lastPlateConfidence: 0.89,
  },
  {
    id: "WB-1050",
    plate: "KT08 WPR",
    customerName: "Harbour Wholesale",
    product: "Return empties",
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
    customerName: "Blue Coast Drinks",
    vehiclePlate: "GX22 FBD",
    product: "Bottled drinks",
    scheduledAt: "08:30",
  },
  {
    externalNoteId: "REQ-2026-00018",
    customerName: "Northline Stores",
    vehiclePlate: "AB12 CDE",
    product: "Crated soft drinks",
    scheduledAt: "09:15",
  },
];
