export type WeightUnit = "kg" | "t" | "lb";

export interface WeightReading {
  raw: string;
  value: number;
  unit: WeightUnit;
  stable: boolean;
  capturedAt: string;
}
