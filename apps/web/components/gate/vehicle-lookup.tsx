'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Truck, Clock, Plus, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn, fmt, normalizePlate } from '@/lib/utils'
import type { VehicleDTO } from '@weighpro/core'

interface VehicleLookupProps {
  onVehicleSelected: (vehicle: VehicleDTO) => void
}

export function VehicleLookup({ onVehicleSelected }: VehicleLookupProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<VehicleDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<VehicleDTO | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newVehicle, setNewVehicle] = useState({ driverName: '', driverPhone: '', vehicleType: 'TRUCK' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/vehicles?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data)
      if (data.length === 0) setShowNewForm(true)
      else setShowNewForm(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(normalizePlate(query)), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, search])

  // Focus on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  function handleSelectVehicle(v: VehicleDTO) {
    setSelected(v)
    setResults([])
    setShowNewForm(false)
    onVehicleSelected(v)
  }

  async function handleCreate() {
    if (!newVehicle.driverName) { setCreateError('Driver name is required'); return }
    setCreating(true)
    setCreateError('')
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plateNumber: normalizePlate(query),
          driverName: newVehicle.driverName,
          driverPhone: newVehicle.driverPhone,
          vehicleType: newVehicle.vehicleType,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409 && data.vehicle) {
          handleSelectVehicle(data.vehicle)
          return
        }
        setCreateError(data.error?.message ?? 'Failed to create vehicle')
        return
      }
      handleSelectVehicle(data)
    } finally {
      setCreating(false)
    }
  }

  function handleReset() {
    setSelected(null)
    setQuery('')
    setResults([])
    setShowNewForm(false)
    setNewVehicle({ driverName: '', driverPhone: '', vehicleType: 'TRUCK' })
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  if (selected) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-lg text-zinc-900 tracking-wider">{selected.plateNumber}</span>
              <Badge variant={selected.vehicleType === 'TRUCK' ? 'default' : 'secondary'} className="text-xs">
                {selected.vehicleType}
              </Badge>
            </div>
            <p className="text-sm text-zinc-700 mt-0.5">{selected.driverName}</p>
            {selected.driverPhone && <p className="text-xs text-zinc-500">{selected.driverPhone}</p>}
            {selected.defaultTare && (
              <p className="text-xs text-zinc-500">Default tare: {selected.defaultTare.toLocaleString()} kg</p>
            )}
            {selected.lastVisit && (
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Last visit: {fmt(selected.lastVisit)}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>Change</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Plate input */}
      <div className="space-y-1.5">
        <Label>Vehicle Registration Plate</Label>
        <div className="relative">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter' && results.length === 1) handleSelectVehicle(results[0]) }}
            placeholder="e.g. T 123 ABC"
            className="pr-10 font-mono text-base uppercase tracking-widest font-semibold"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </span>
        </div>
        <p className="text-xs text-zinc-400">Type plate number — press Enter if single match</p>
      </div>

      {/* Results dropdown */}
      {results.length > 0 && (
        <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm bg-white divide-y divide-zinc-100">
          {results.map((v) => (
            <button
              key={v.id}
              onClick={() => handleSelectVehicle(v)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 text-left transition-colors"
            >
              <Truck className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm tracking-wider font-mono">{v.plateNumber}</span>
                  <Badge variant="secondary" className="text-xs">{v.vehicleType}</Badge>
                </div>
                <p className="text-xs text-zinc-500 truncate">{v.driverName}</p>
              </div>
              {v.lastVisit && (
                <span className="text-xs text-zinc-400 flex-shrink-0">{fmt(v.lastVisit, 'dd MMM')}</span>
              )}
            </button>
          ))}
          <button
            onClick={() => setShowNewForm(true)}
            className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-zinc-50 text-sm text-zinc-500 transition-colors"
          >
            <Plus className="w-4 h-4" /> Register as new vehicle
          </button>
        </div>
      )}

      {/* New vehicle form */}
      {showNewForm && query.length >= 2 && (
        <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Register new vehicle: <span className="font-mono tracking-wider">{normalizePlate(query)}</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Driver Name *</Label>
              <Input
                value={newVehicle.driverName}
                onChange={(e) => setNewVehicle((p) => ({ ...p, driverName: e.target.value }))}
                placeholder="Full name"
                className="h-9 text-sm"
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone</Label>
              <Input
                value={newVehicle.driverPhone}
                onChange={(e) => setNewVehicle((p) => ({ ...p, driverPhone: e.target.value }))}
                placeholder="+255 …"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select
                value={newVehicle.vehicleType}
                onValueChange={(v) => setNewVehicle((p) => ({ ...p, vehicleType: v }))}
              >
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRUCK">Truck</SelectItem>
                  <SelectItem value="PICKUP">Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {createError && <p className="text-xs text-red-600">{createError}</p>}
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={creating} size="sm" variant="success" className="flex-1">
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Register & Use
            </Button>
            <Button onClick={() => setShowNewForm(false)} size="sm" variant="outline">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  )
}
