export type WeightUnit = "kg" | "t" | "lb";

export type WeighDirection = "inbound" | "outbound";

export type WeighSessionStatus =
  | "awaiting_first_weight"
  | "awaiting_second_weight"
  | "completed"
  | "cancelled";

export interface OrderNote {
  id: string;
  externalNoteId: string;
  customerName: string;
  vehiclePlate: string;
  driverName?: string;
  product: string;
  destination?: string;
  quantity?: number;
  scheduledAt?: string;
  notes?: string;
}

export interface WeightReading {
  raw: string;
  value: number;
  unit: WeightUnit;
  stable: boolean;
  capturedAt: string;
}

export interface WeighSessionSummary {
  id: string;
  plate: string;
  customerName: string;
  product: string;
  status: WeighSessionStatus;
  firstWeightKg?: number;
  secondWeightKg?: number;
  netWeightKg?: number;
  lastPlateConfidence?: number;
}
