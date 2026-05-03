'use client'

import { useState, useEffect, useRef } from 'react'
import { Wifi, WifiOff, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isWeightStable } from '@weighpro/core'
import type { ScaleReading } from '@weighpro/core'

interface ScaleDisplayProps {
  onWeightChange?: (kg: number, stable: boolean) => void
}

// Simulate scale readings for web (Electron will override via IPC)
function generateSimulatedReading(target: number, settled: boolean): ScaleReading {
  const noise = settled ? (Math.random() - 0.5) * 0.2 : (Math.random() - 0.5) * 50
  const weight = Math.max(0, target + noise)
  return {
    raw: `ST,GS,  +${weight.toFixed(1).padStart(8, '0')}kg`,
    weightKg: parseFloat(weight.toFixed(1)),
    isStable: settled,
    timestamp: Date.now(),
  }
}

export function ScaleDisplay({ onWeightChange }: ScaleDisplayProps) {
  const [readings, setReadings] = useState<ScaleReading[]>([])
  const [currentWeight, setCurrentWeight] = useState<number>(0)
  const [stable, setStable] = useState(false)
  const [connected, setConnected] = useState(false)
  const [simMode, setSimMode] = useState(true)
  const [simTarget, setSimTarget] = useState(12500)
  const [simSettled, setSimSettled] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Web simulation: tick every 500ms
  useEffect(() => {
    if (!simMode) return
    setConnected(true)

    intervalRef.current = setInterval(() => {
      const reading = generateSimulatedReading(simTarget, simSettled)
      setReadings((prev) => {
        const updated = [...prev.slice(-20), reading]
        const s = isWeightStable(updated)
        setStable(s)
        setCurrentWeight(reading.weightKg)
        onWeightChange?.(reading.weightKg, s)
        return updated
      })
    }, 500)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [simMode, simTarget, simSettled, onWeightChange])

  // Listen for Electron IPC scale data
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    if (!w.__weighpro) return
    setSimMode(false)
    setConnected(true)

    const unsub = w.__weighpro.onScaleReading((reading: ScaleReading) => {
      setReadings((prev) => {
        const updated = [...prev.slice(-20), reading]
        const s = isWeightStable(updated)
        setStable(s)
        setCurrentWeight(reading.weightKg)
        onWeightChange?.(reading.weightKg, s)
        return updated
      })
    })

    return () => unsub?.()
  }, [onWeightChange])

  const displayWeight = currentWeight.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    minimumIntegerDigits: 1,
  })

  const lastRaw = readings[readings.length - 1]?.raw ?? '—'

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Connection status */}
      <div className="flex items-center gap-2 text-xs">
        {connected ? (
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <Wifi className="w-3.5 h-3.5" />
            {simMode ? 'Simulation Mode' : 'Scale Connected'}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-red-500 font-medium">
            <WifiOff className="w-3.5 h-3.5" />
            Scale Disconnected
          </span>
        )}
      </div>

      {/* Stability badge */}
      <div className={cn(
        'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all',
        stable
          ? 'bg-emerald-50 border-emerald-400 text-emerald-700 animate-pulse-green'
          : 'bg-red-50 border-red-300 text-red-600'
      )}>
        <span className={cn('w-2.5 h-2.5 rounded-full', stable ? 'bg-emerald-500' : 'bg-red-500')} />
        {stable ? '● STABLE' : '◌ UNSTABLE'}
      </div>

      {/* Weight readout */}
      <div className={cn(
        'weight-display text-center transition-all',
        stable ? 'text-zinc-900' : 'text-zinc-400'
      )}>
        <span className="text-8xl font-black tabular-nums tracking-tight leading-none">
          {displayWeight.split('.')[0]}
        </span>
        <span className="text-5xl font-black text-zinc-500">.{displayWeight.split('.')[1]}</span>
        <span className="text-3xl font-semibold text-zinc-500 ml-2">kg</span>
      </div>

      {/* Raw data */}
      <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 bg-zinc-900/5 rounded-lg px-3 py-1.5">
        <Activity className="w-3 h-3" />
        <span>{lastRaw}</span>
      </div>

      {/* Simulation controls — dev only */}
      {simMode && (
        <div className="mt-2 w-full max-w-xs space-y-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-semibold text-amber-700">Scale Simulator</p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-amber-700 w-20">Target (kg)</label>
            <input
              type="number"
              value={simTarget}
              onChange={(e) => setSimTarget(Number(e.target.value))}
              className="flex-1 h-7 text-xs px-2 rounded border border-amber-300 bg-white"
            />
          </div>
          <button
            onClick={() => setSimSettled((p) => !p)}
            className={cn(
              'w-full py-1.5 rounded-lg text-xs font-semibold transition-colors',
              simSettled
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-amber-400 text-amber-900 hover:bg-amber-500'
            )}
          >
            {simSettled ? '✓ Settled (click to wobble)' : '⟳ Unsettled (click to settle)'}
          </button>
        </div>
      )}
    </div>
  )
}
