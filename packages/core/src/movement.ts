export const MOVEMENT_TYPES = [
  "raw_material_receipt",
  "raw_cotton_receipt",
  "finished_goods_dispatch",
  "production_transfer",
  "lint_bale_transfer",
  "packaging_receipt",
  "return_or_empty_movement",
  "manual_weigh",
] as const;

export type MovementType = (typeof MOVEMENT_TYPES)[number];

export function calculateFuelPayable(distanceKm?: number, fuelRatePerKm?: number) {
  if (distanceKm == null || fuelRatePerKm == null) {
    return undefined;
  }

  return distanceKm * fuelRatePerKm;
}

export function requiresFuelSupport(movementType?: string, materialCategory?: string) {
  return movementType === "raw_material_receipt" && materialCategory === "raw_cotton";
}
