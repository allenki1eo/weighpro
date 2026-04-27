import type { WeighSessionStatus } from "./types";

export function calculateNetWeightKg(firstWeightKg?: number, secondWeightKg?: number) {
  if (firstWeightKg == null || secondWeightKg == null) {
    return undefined;
  }

  return Math.abs(secondWeightKg - firstWeightKg);
}

export function nextSessionStatus(
  status: WeighSessionStatus,
  hasFirstWeight: boolean,
  hasSecondWeight: boolean,
): WeighSessionStatus {
  if (status === "cancelled") {
    return status;
  }

  if (hasFirstWeight && hasSecondWeight) {
    return "completed";
  }

  if (hasFirstWeight) {
    return "awaiting_second_weight";
  }

  return "awaiting_first_weight";
}

export function normalizePlate(plate: string) {
  return plate.replace(/[^a-z0-9]/gi, "").toUpperCase();
}
