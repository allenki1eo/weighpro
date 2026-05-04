import type { OperationType, WeightType } from './types'

export function getFirstWeightType(op: OperationType): WeightType {
  const grossFirst: OperationType[] = [
    'COTTON_PURCHASE',
    'COTTON_WASTE_SALE',
    'COTTON_SEED_DISPATCH',
    'BEVERAGE_RAW_INTAKE',
    'BEVERAGE_WASTE_SALE',
  ]
  return grossFirst.includes(op) ? 'GROSS' : 'TARE'
}

export function getSecondWeightType(op: OperationType): WeightType {
  return getFirstWeightType(op) === 'GROSS' ? 'TARE' : 'GROSS'
}

export function calcNetWeight(first: number, second: number): number {
  return Math.abs(first - second)
}

export function calcFuelTotal(distanceKm: number, ratePerKm: number): number {
  return distanceKm * ratePerKm
}

export function generateTicketNumber(sequence: number): string {
  const year = new Date().getFullYear()
  const padded = String(sequence).padStart(6, '0')
  return `WB-${year}-${padded}`
}
