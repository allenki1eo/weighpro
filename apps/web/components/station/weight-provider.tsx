'use client'
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { isWeightStable } from '@weighpro/core'
import type { ScaleReading } from '@weighpro/core'

interface WeightState {
  weightKg: number
  isStable: boolean
  source: 'electron' | 'api' | 'sim'
  connected: boolean
}

const WeightCtx = createContext<WeightState>({ weightKg: 0, isStable: false, source: 'sim', connected: false })
export const useWeight = () => useContext(WeightCtx)

// Simulator
function simReading(target: number, settled: boolean): ScaleReading {
  const noise = settled ? (Math.random() - 0.5) * 0.3 : (Math.random() - 0.5) * 80
  const w = Math.max(0, parseFloat((target + noise).toFixed(1)))
  return { raw: '', weightKg: w, isStable: settled, timestamp: Date.now() }
}

export function WeightProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WeightState>({ weightKg: 0, isStable: false, source: 'sim', connected: false })
  const buf = useRef<ScaleReading[]>([])
  const [simTarget] = useState(12450)
  const [simSettled, setSimSettled] = useState(false)
  const sourceRef = useRef<'electron' | 'api' | 'sim'>('sim')

  const push = useCallback((r: ScaleReading, src: WeightState['source']) => {
    const next = [...buf.current.slice(-20), r]
    buf.current = next
    setState({ weightKg: r.weightKg, isStable: isWeightStable(next), source: src, connected: true })
  }, [])

  // Electron IPC
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    if (!w.__weighpro) return
    sourceRef.current = 'electron'
    const unsub = w.__weighpro.onScaleReading((r: ScaleReading) => push(r, 'electron'))
    return () => unsub?.()
  }, [push])

  // API polling (when no Electron)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).__weighpro) return
    let active = true
    const poll = async () => {
      if (!active) return
      try {
        const r = await fetch('/api/scale/reading').then((x) => x.json())
        if (r.connected) {
          sourceRef.current = 'api'
          push({ weightKg: r.weightKg, isStable: r.isStable, raw: r.raw, timestamp: Date.now() }, 'api')
        }
      } catch { /* ignore */ }
      if (active) setTimeout(poll, 300)
    }
    poll()
    return () => { active = false }
  }, [push])

  // Simulator (fallback when neither Electron nor API connected)
  useEffect(() => {
    if (sourceRef.current !== 'sim') return
    const id = setInterval(() => {
      if (sourceRef.current !== 'sim') return
      push(simReading(simTarget, simSettled), 'sim')
    }, 500)
    return () => clearInterval(id)
  }, [simTarget, simSettled, push])

  // Expose sim controls to window for dev toggle
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__simSettle = (v: boolean) => setSimSettled(v)
  }, [])

  return <WeightCtx.Provider value={state}>{children}</WeightCtx.Provider>
}
