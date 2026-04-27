import type { WeightReading, WeightUnit } from "./types";

export interface ParseWeightOptions {
  defaultUnit?: WeightUnit;
  stableTokens?: string[];
}

const DEFAULT_STABLE_TOKENS = ["ST", "STA", "STABLE", "S "];

export function parseXk3190Frame(
  frame: string,
  options: ParseWeightOptions = {},
): WeightReading | null {
  const raw = frame.trim();

  if (!raw) {
    return null;
  }

  const unitMatch = raw.match(/\b(kg|lb|t)\b/i) ?? raw.match(/(kg|lb|t)$/i);
  const unit = (unitMatch?.[1]?.toLowerCase() as WeightUnit | undefined) ?? options.defaultUnit ?? "kg";
  const numericMatch = raw.match(/[+-]?\d+(?:\.\d+)?/);

  if (!numericMatch) {
    return null;
  }

  const value = Number(numericMatch[0]);

  if (!Number.isFinite(value)) {
    return null;
  }

  const upper = raw.toUpperCase();
  const stableTokens = options.stableTokens ?? DEFAULT_STABLE_TOKENS;
  const stable = stableTokens.some((token) => upper.includes(token)) || !upper.includes("US");

  return {
    raw,
    value,
    unit,
    stable,
    capturedAt: new Date().toISOString(),
  };
}

export function convertToKg(value: number, unit: WeightUnit) {
  switch (unit) {
    case "kg":
      return value;
    case "t":
      return value * 1000;
    case "lb":
      return value * 0.45359237;
  }
}
