import type { WeightReading } from "@weighpro/core";

declare global {
  interface Window {
    weighproStation?: {
      getLastReading: () => Promise<WeightReading | null>;
      reconnectScale: () => Promise<WeightReading | null>;
      onScaleReading: (callback: (reading: WeightReading) => void) => () => void;
      onScaleError: (callback: (message: string) => void) => () => void;
    };
  }
}

export {};
