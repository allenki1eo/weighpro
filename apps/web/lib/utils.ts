import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(date: string | Date | null | undefined, pattern = 'dd MMM yyyy, HH:mm'): string {
  if (!date) return '—'
  return format(new Date(date), pattern)
}

export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function fmtWeight(kg: number | null | undefined): string {
  if (kg == null) return '—'
  return kg.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg'
}

export function fmtCurrency(amount: number | null | undefined, currency = 'TZS'): string {
  if (amount == null) return '—'
  return `${currency} ${amount.toLocaleString('en-US')}`
}

export function normalizePlate(plate: string): string {
  return plate.trim().toUpperCase().replace(/\s+/g, ' ')
}

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  FIRST_WEIGHT_SAVED: 'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
}

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  FIRST_WEIGHT_SAVED: 'Awaiting 2nd Weight',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const OP_LABELS: Record<string, string> = {
  COTTON_PURCHASE: 'Cotton Purchase',
  COTTON_LINT_SALE: 'Lint Sale',
  COTTON_WASTE_SALE: 'Waste Sale',
  COTTON_SEED_DISPATCH: 'Seed Dispatch',
  BEVERAGE_DISPATCH: 'Beverage Dispatch',
  BEVERAGE_RAW_INTAKE: 'Raw Intake',
  BEVERAGE_WASTE_SALE: 'Waste Sale',
}

export const MODULE_COLORS: Record<string, string> = {
  COTTON: 'bg-yellow-100 text-yellow-800',
  BEVERAGE: 'bg-sky-100 text-sky-800',
}
