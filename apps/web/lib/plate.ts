export function normalizePlate(plate: string) {
  return plate.replace(/[^a-z0-9]/gi, "").toUpperCase();
}
