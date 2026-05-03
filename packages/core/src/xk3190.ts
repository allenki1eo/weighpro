import type { ScaleReading } from './types.js'

// XK3190-DS1 outputs ASCII strings like: "ST,GS,  +00123.5kg\r\n" or "UN,GS,  +00123.5kg\r\n"
// ST = stable, UN = unstable, GS = gross

const WEIGHT_REGEX = /([SU][T|N]),\w+,\s*[+-]?\s*([\d.]+)\s*kg/i

export function parseXK3190Line(raw: string): ScaleReading | null {
  const match = WEIGHT_REGEX.exec(raw.trim())
  if (!match) return null

  const stabilityCode = match[1].toUpperCase()
  const weightKg = parseFloat(match[2])

  if (isNaN(weightKg)) return null

  return {
    raw: raw.trim(),
    weightKg,
    isStable: stabilityCode === 'ST',
    timestamp: Date.now(),
  }
}

export function isWeightStable(readings: ScaleReading[], windowMs = 2000, maxStdDev = 0.5): boolean {
  if (readings.length < 3) return false
  const now = Date.now()
  const recent = readings.filter((r) => now - r.timestamp <= windowMs && r.isStable)
  if (recent.length < 3) return false

  const weights = recent.map((r) => r.weightKg)
  const mean = weights.reduce((a, b) => a + b, 0) / weights.length
  const variance = weights.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / weights.length
  return Math.sqrt(variance) <= maxStdDev
}
