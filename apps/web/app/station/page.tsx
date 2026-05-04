'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { signOut, useSession } from 'next-auth/react'
import {
  Scale,
  Plus,
  LogOut,
  Wifi,
  WifiOff,
  Monitor,
  ChevronRight,
  ChevronLeft,
  Truck,
  Search,
  X,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn, fmtWeight, timeAgo, OP_LABELS } from '@/lib/utils'
import { OPERATION_CONFIGS, ROLE_LABELS } from '@weighpro/core'
import type { OperationType, VehicleDTO, VillageDTO, CompanyDTO, CustomerDTO, SupplierDTO } from '@weighpro/core'
import { WeightProvider, useWeight } from '@/components/station/weight-provider'

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkspaceMode =
  | { type: 'idle' }
  | {
      type: 'new_job'
      step: 'vehicle' | 'operation' | 'details'
      vehicle?: VehicleDTO
      module?: 'COTTON' | 'BEVERAGE'
      opType?: OperationType
    }
  | {
      type: 'weighing'
      ticketId: string
      ticketNumber: string
      plateNumber: string
      opType: OperationType
      driverName: string
      partyName: string
    }

interface QueueTicket {
  id: string
  ticketNumber: string
  plateNumber: string
  driverName: string
  partyName: string
  operationType: OperationType
  status: 'PENDING' | 'FIRST_WEIGHT_SAVED'
  firstWeight?: number | null
  createdAt: string
}

interface TicketDetail {
  id: string
  ticketNumber: string
  plateNumber: string
  driverName: string
  partyName: string
  operationType: OperationType
  module: 'COTTON' | 'BEVERAGE'
  status: string
  firstWeight?: number | null
  secondWeight?: number | null
  netWeight?: number | null
  firstWeightType?: string | null
  secondWeightType?: string | null
  firstWeightAt?: string | null
  secondWeightAt?: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

// ─── Weight Display ───────────────────────────────────────────────────────────

function WeightDisplay({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const { weightKg, isStable, source, connected } = useWeight()

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <div className={cn('w-1.5 h-1.5 rounded-full', isStable ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse')} />
        <span className={cn('font-mono text-sm font-semibold tabular-nums', isStable ? 'text-emerald-400' : 'text-amber-400')}>
          {weightKg.toFixed(1)} kg
        </span>
        <span className="text-zinc-600 text-xs">
          {source === 'electron' ? <Monitor className="w-3 h-3" /> : source === 'api' ? <Wifi className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
        </span>
        {!connected && <WifiOff className="w-3 h-3 text-zinc-600" />}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn(
        'font-mono font-bold tabular-nums leading-none transition-colors duration-300',
        'text-8xl',
        isStable ? 'text-emerald-400' : 'text-amber-400'
      )}>
        {weightKg.toFixed(1)}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-zinc-500 font-medium text-lg">kg</span>
        <div className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
          isStable
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        )}>
          <div className={cn('w-1.5 h-1.5 rounded-full', isStable ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse')} />
          {isStable ? 'STABLE' : 'SETTLING'}
        </div>
        <span className="text-zinc-600 text-xs flex items-center gap-1">
          {source === 'electron' ? <><Monitor className="w-3 h-3" /> Electron</> :
           source === 'api' ? <><Wifi className="w-3 h-3" /> API</> :
           <><Activity className="w-3 h-3" /> Simulator</>}
        </span>
      </div>
    </div>
  )
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────

function TopBar({ onNewJob }: { onNewJob: () => void }) {
  const { data: session } = useSession()
  const role = session?.user?.role

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 bg-zinc-800 rounded-md">
          <Scale className="w-4 h-4 text-zinc-300" />
        </div>
        <div>
          <span className="text-sm font-semibold text-white">WeighPro</span>
          <span className="text-xs text-zinc-500 ml-2">Weighing Station</span>
        </div>
      </div>

      {/* Center: live weight compact */}
      <div className="flex items-center gap-4">
        <WeightDisplay size="sm" />
      </div>

      {/* Right: user + actions */}
      <div className="flex items-center gap-3">
        <Button variant="default" size="sm" onClick={onNewJob} className="h-7 text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          New Job
        </Button>
        <Separator orientation="vertical" className="h-5 bg-zinc-700" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-zinc-200">
              {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-zinc-200 leading-none">{session?.user?.name}</p>
            <p className="text-xs text-zinc-500 leading-none mt-0.5">
              {role ? ROLE_LABELS[role] : ''}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-zinc-500 hover:text-zinc-300 transition-colors ml-1"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Queue Panel ──────────────────────────────────────────────────────────────

function QueuePanel({
  mode,
  onSelectTicket,
  onNewJob,
}: {
  mode: WorkspaceMode
  onSelectTicket: (t: QueueTicket) => void
  onNewJob: () => void
}) {
  const [pending, setPending] = useState<QueueTicket[]>([])
  const [firstDone, setFirstDone] = useState<QueueTicket[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [r1, r2] = await Promise.all([
        fetch('/api/tickets?status=PENDING&limit=30').then((r) => r.json()),
        fetch('/api/tickets?status=FIRST_WEIGHT_SAVED&limit=30').then((r) => r.json()),
      ])
      setPending(r1.items ?? [])
      setFirstDone(r2.items ?? [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 10_000)
    return () => clearInterval(id)
  }, [load])

  const activeId = mode.type === 'weighing' ? mode.ticketId : null

  function QueueItem({ ticket, color }: { ticket: QueueTicket; color: 'amber' | 'purple' }) {
    const isActive = ticket.id === activeId
    return (
      <button
        onClick={() => onSelectTicket(ticket)}
        className={cn(
          'w-full text-left px-3 py-2.5 rounded-lg border transition-all',
          isActive
            ? color === 'amber'
              ? 'bg-amber-500/20 border-amber-500/50'
              : 'bg-purple-500/20 border-purple-500/50'
            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80'
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono font-bold text-zinc-300">{ticket.plateNumber}</span>
          <div className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            color === 'amber' ? 'bg-amber-400' : 'bg-purple-400'
          )} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">{OP_LABELS[ticket.operationType] ?? ticket.operationType}</span>
          <span className="text-xs text-zinc-600">{timeAgo(ticket.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-zinc-600 truncate max-w-[100px]">{ticket.partyName}</span>
          <span className="text-xs font-mono text-zinc-600">{ticket.ticketNumber}</span>
        </div>
      </button>
    )
  }

  const total = pending.length + firstDone.length

  return (
    <div className="w-56 flex-shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Queue</span>
          {total > 0 && (
            <span className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full font-mono">{total}</span>
          )}
        </div>
        <button onClick={load} className="text-zinc-600 hover:text-zinc-400 transition-colors" title="Refresh">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 text-zinc-600 animate-spin" />
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <CheckCircle2 className="w-5 h-5 text-zinc-700" />
            <span className="text-xs text-zinc-600">Queue is empty</span>
          </div>
        ) : (
          <>
            {firstDone.length > 0 && (
              <>
                <div className="px-1 pb-1">
                  <span className="text-xs text-purple-500 font-medium uppercase tracking-wider">2nd Weight Needed</span>
                </div>
                {firstDone.map((t) => <QueueItem key={t.id} ticket={t} color="purple" />)}
              </>
            )}
            {pending.length > 0 && (
              <>
                {firstDone.length > 0 && <div className="pt-1" />}
                <div className="px-1 pb-1">
                  <span className="text-xs text-amber-500 font-medium uppercase tracking-wider">1st Weight Needed</span>
                </div>
                {pending.map((t) => <QueueItem key={t.id} ticket={t} color="amber" />)}
              </>
            )}
          </>
        )}
      </div>

      {/* Footer: New Job */}
      <div className="p-2 border-t border-zinc-800 flex-shrink-0">
        <Button onClick={onNewJob} variant="default" size="sm" className="w-full gap-1.5 h-8 text-xs">
          <Plus className="w-3.5 h-3.5" />
          New Job
        </Button>
      </div>
    </div>
  )
}

// ─── Idle View ────────────────────────────────────────────────────────────────

function IdleView({ onNewJob }: { onNewJob: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8">
      {/* Scale display preview */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-zinc-700 text-xs uppercase tracking-widest font-medium">Live Scale Reading</div>
        <WeightDisplay size="lg" />
      </div>

      <Separator className="w-48 bg-zinc-800" />

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-zinc-500 text-sm">Select a job from the queue or start a new one</p>
        <Button onClick={onNewJob} size="xl" className="gap-2 px-8">
          <Plus className="w-5 h-5" />
          New Weighing Job
        </Button>
      </div>
    </div>
  )
}

// ─── New Job Wizard ───────────────────────────────────────────────────────────

function NewJobWizard({
  onCancel,
  onCreated,
}: {
  onCancel: () => void
  onCreated: (ticketId: string, ticketNumber: string, plateNumber: string, opType: OperationType, driverName: string, partyName: string) => void
}) {
  const [step, setStep] = useState<'vehicle' | 'operation' | 'details'>('vehicle')
  const [vehicle, setVehicle] = useState<VehicleDTO | null>(null)
  const [module, setModule] = useState<'COTTON' | 'BEVERAGE'>('COTTON')
  const [opType, setOpType] = useState<OperationType | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Wizard header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-zinc-800 flex-shrink-0">
        <button onClick={onCancel} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <X className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-zinc-300">New Job</span>
        <div className="flex items-center gap-1.5 ml-2">
          {(['vehicle', 'operation', 'details'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                step === s ? 'bg-zinc-100 text-zinc-900' :
                (i < (['vehicle', 'operation', 'details'] as const).indexOf(step))
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-800 text-zinc-500'
              )}>
                {i < (['vehicle', 'operation', 'details'] as const).indexOf(step) ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  i + 1
                )}
              </div>
              <span className={cn('text-xs', step === s ? 'text-zinc-300' : 'text-zinc-600')}>
                {s === 'vehicle' ? 'Vehicle' : s === 'operation' ? 'Operation' : 'Details'}
              </span>
              {i < 2 && <ChevronRight className="w-3 h-3 text-zinc-700" />}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto">
        {step === 'vehicle' && (
          <VehicleStep
            onNext={(v) => { setVehicle(v); setStep('operation') }}
          />
        )}
        {step === 'operation' && vehicle && (
          <OperationStep
            vehicle={vehicle}
            module={module}
            onModuleChange={setModule}
            onNext={(op) => { setOpType(op); setStep('details') }}
            onBack={() => setStep('vehicle')}
          />
        )}
        {step === 'details' && vehicle && opType && (
          <DetailsStep
            vehicle={vehicle}
            module={module}
            opType={opType}
            submitting={submitting}
            error={error}
            onBack={() => setStep('operation')}
            onSubmit={async (payload) => {
              setSubmitting(true)
              setError('')
              try {
                const res = await fetch('/api/tickets', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    vehicleId: vehicle.id,
                    module,
                    operationType: opType,
                    ...payload,
                  }),
                })
                if (!res.ok) {
                  const d = await res.json().catch(() => ({}))
                  setError(d.error ?? 'Failed to create ticket')
                  return
                }
                const ticket = await res.json()
                // party name from payload
                const partyName = payload._partyName ?? ''
                onCreated(ticket.id, ticket.ticketNumber, vehicle.plateNumber, opType, vehicle.driverName, partyName)
              } catch {
                setError('Network error. Please try again.')
              } finally {
                setSubmitting(false)
              }
            }}
          />
        )}
      </div>
    </div>
  )
}

// Step 1: Vehicle
function VehicleStep({ onNext }: { onNext: (v: VehicleDTO) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<VehicleDTO[]>([])
  const [searching, setSearching] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const debouncedQ = useDebounce(query, 300)

  // Register form state
  const [regPlate, setRegPlate] = useState('')
  const [regDriver, setRegDriver] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regType, setRegType] = useState<'TRUCK' | 'PICKUP'>('TRUCK')
  const [regTare, setRegTare] = useState('')
  const [regSubmitting, setRegSubmitting] = useState(false)
  const [regError, setRegError] = useState('')

  useEffect(() => {
    if (!debouncedQ.trim()) { setResults([]); return }
    setSearching(true)
    fetch(`/api/vehicles?q=${encodeURIComponent(debouncedQ)}`)
      .then((r) => r.json())
      .then((d) => setResults(Array.isArray(d) ? d : []))
      .catch(() => setResults([]))
      .finally(() => setSearching(false))
  }, [debouncedQ])

  async function handleRegister() {
    if (!regPlate.trim() || !regDriver.trim()) return
    setRegSubmitting(true)
    setRegError('')
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plateNumber: regPlate.trim().toUpperCase(),
          driverName: regDriver.trim(),
          driverPhone: regPhone.trim() || undefined,
          vehicleType: regType,
          defaultTare: regTare ? parseFloat(regTare) : undefined,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setRegError(d.error ?? 'Registration failed')
        return
      }
      const v = await res.json()
      onNext(v)
    } catch {
      setRegError('Network error')
    } finally {
      setRegSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-5 max-w-lg">
      <div>
        <h2 className="text-base font-semibold text-white mb-1">Search Vehicle</h2>
        <p className="text-xs text-zinc-500">Enter plate number to search, or register a new vehicle</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          placeholder="e.g. T123 ABC"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
          autoFocus
        />
        {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 animate-spin" />}
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((v) => (
            <button
              key={v.id}
              onClick={() => onNext(v)}
              className="w-full text-left px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg hover:border-zinc-500 hover:bg-zinc-800 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" />
                  <span className="font-mono font-bold text-white">{v.plateNumber}</span>
                  <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-400 border-zinc-700">{v.vehicleType}</Badge>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
              </div>
              <div className="mt-1 pl-6.5">
                <span className="text-xs text-zinc-500">{v.driverName}</span>
                {v.lastVisit && <span className="text-xs text-zinc-600 ml-3">Last: {timeAgo(v.lastVisit)}</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {query && results.length === 0 && !searching && (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <AlertCircle className="w-3.5 h-3.5" />
          No vehicle found for &quot;{query}&quot;
        </div>
      )}

      <Separator className="bg-zinc-800" />

      <div>
        <button
          onClick={() => setShowRegister(!showRegister)}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Register New Vehicle
          <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', showRegister && 'rotate-90')} />
        </button>

        {showRegister && (
          <div className="mt-4 p-4 bg-zinc-900 border border-zinc-700 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-zinc-400">Plate Number *</Label>
                <Input
                  placeholder="T123 ABC"
                  value={regPlate}
                  onChange={(e) => setRegPlate(e.target.value.toUpperCase())}
                  className="bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-600 font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-zinc-400">Vehicle Type</Label>
                <Select value={regType} onValueChange={(v) => setRegType(v as 'TRUCK' | 'PICKUP')}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="TRUCK" className="text-white">Truck</SelectItem>
                    <SelectItem value="PICKUP" className="text-white">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Driver Name *</Label>
              <Input
                placeholder="Full name"
                value={regDriver}
                onChange={(e) => setRegDriver(e.target.value)}
                className="bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-zinc-400">Driver Phone</Label>
                <Input
                  placeholder="+255..."
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-600"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-zinc-400">Default Tare (kg)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={regTare}
                  onChange={(e) => setRegTare(e.target.value)}
                  className="bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-600"
                />
              </div>
            </div>
            {regError && (
              <div className="flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                {regError}
              </div>
            )}
            <Button
              onClick={handleRegister}
              disabled={!regPlate.trim() || !regDriver.trim() || regSubmitting}
              size="sm"
              className="w-full"
            >
              {regSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Register &amp; Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Step 2: Operation
function OperationStep({
  vehicle,
  module,
  onModuleChange,
  onNext,
  onBack,
}: {
  vehicle: VehicleDTO
  module: 'COTTON' | 'BEVERAGE'
  onModuleChange: (m: 'COTTON' | 'BEVERAGE') => void
  onNext: (op: OperationType) => void
  onBack: () => void
}) {
  const ops = Object.values(OPERATION_CONFIGS).filter((c) => c.module === module)

  return (
    <div className="p-6 space-y-5 max-w-lg">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-base font-semibold text-white mb-0.5">Select Operation</h2>
          <p className="text-xs text-zinc-500">
            Vehicle: <span className="font-mono text-zinc-300">{vehicle.plateNumber}</span>
            <span className="mx-1.5 text-zinc-700">·</span>
            <span className="text-zinc-400">{vehicle.driverName}</span>
          </p>
        </div>
      </div>

      {/* Module toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => onModuleChange('COTTON')}
          className={cn(
            'flex-1 py-2 rounded-lg text-sm font-medium border transition-all',
            module === 'COTTON'
              ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
              : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-600'
          )}
        >
          Cotton
        </button>
        <button
          onClick={() => onModuleChange('BEVERAGE')}
          className={cn(
            'flex-1 py-2 rounded-lg text-sm font-medium border transition-all',
            module === 'BEVERAGE'
              ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
              : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-600'
          )}
        >
          Beverage
        </button>
      </div>

      {/* Operation cards */}
      <div className="grid grid-cols-2 gap-2">
        {ops.map((op) => (
          <button
            key={op.operationType}
            onClick={() => onNext(op.operationType)}
            className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg hover:border-zinc-500 hover:bg-zinc-800 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">{op.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
            </div>
            <div className="flex gap-1.5">
              <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">{op.firstWeightType}</span>
              <span className="text-xs text-zinc-600">→</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">{op.secondWeightType}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Step 3: Details
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DetailsPayload = Record<string, any>

function DetailsStep({
  vehicle,
  module,
  opType,
  submitting,
  error,
  onBack,
  onSubmit,
}: {
  vehicle: VehicleDTO
  module: 'COTTON' | 'BEVERAGE'
  opType: OperationType
  submitting: boolean
  error: string
  onBack: () => void
  onSubmit: (payload: DetailsPayload) => void
}) {
  const cfg = OPERATION_CONFIGS[opType]

  // Master data
  const [villages, setVillages] = useState<VillageDTO[]>([])
  const [companies, setCompanies] = useState<CompanyDTO[]>([])
  const [customers, setCustomers] = useState<CustomerDTO[]>([])
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([])
  const [masterLoading, setMasterLoading] = useState(true)

  // Form fields
  const [villageId, setVillageId] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [notes, setNotes] = useState('')
  const [baleCount, setBaleCount] = useState('')
  const [contractRef, setContractRef] = useState('')
  const [cottonGrade, setCottonGrade] = useState<'A' | 'B' | 'C' | ''>('')
  const [moisturePct, setMoisturePct] = useState('')
  const [pricePerKg, setPricePerKg] = useState('')
  const [materialType, setMaterialType] = useState<'RICE' | 'MALT' | 'BARLEY' | ''>('')
  const [season, setSeason] = useState('2025/2026')

  useEffect(() => {
    setMasterLoading(true)
    const fetches: Promise<void>[] = []
    if (cfg.partyType === 'village') {
      fetches.push(
        fetch('/api/master/villages').then((r) => r.json()).then(setVillages).catch(() => {})
      )
    } else if (cfg.partyType === 'company_lint') {
      fetches.push(
        fetch('/api/master/companies?type=LINT_BUYER').then((r) => r.json()).then(setCompanies).catch(() => {})
      )
    } else if (cfg.partyType === 'company_waste') {
      fetches.push(
        fetch('/api/master/companies?type=WASTE_BUYER').then((r) => r.json()).then(setCompanies).catch(() => {})
      )
    } else if (cfg.partyType === 'customer_beverage') {
      fetches.push(
        fetch('/api/master/customers?type=BEVERAGE_CUSTOMER').then((r) => r.json()).then(setCustomers).catch(() => {})
      )
    } else if (cfg.partyType === 'customer_cattle') {
      fetches.push(
        fetch('/api/master/customers?type=CATTLE_FARMER').then((r) => r.json()).then(setCustomers).catch(() => {})
      )
    } else if (cfg.partyType === 'supplier') {
      fetches.push(
        fetch('/api/master/suppliers').then((r) => r.json()).then(setSuppliers).catch(() => {})
      )
    }
    Promise.all(fetches).finally(() => setMasterLoading(false))
  }, [cfg.partyType])

  function getPartyName(): string {
    if (cfg.partyType === 'village') return villages.find((v) => v.id === villageId)?.name ?? ''
    if (cfg.partyType === 'company_lint' || cfg.partyType === 'company_waste') return companies.find((c) => c.id === companyId)?.name ?? ''
    if (cfg.partyType === 'customer_beverage' || cfg.partyType === 'customer_cattle') return customers.find((c) => c.id === customerId)?.name ?? ''
    if (cfg.partyType === 'supplier') return suppliers.find((s) => s.id === supplierId)?.name ?? ''
    return ''
  }

  function isValid(): boolean {
    if (masterLoading) return false
    if (cfg.partyType === 'village' && !villageId) return false
    if ((cfg.partyType === 'company_lint' || cfg.partyType === 'company_waste') && !companyId) return false
    if ((cfg.partyType === 'customer_beverage' || cfg.partyType === 'customer_cattle') && !customerId) return false
    if (cfg.partyType === 'supplier' && !supplierId) return false
    if (opType === 'BEVERAGE_RAW_INTAKE' && !materialType) return false
    return true
  }

  function buildPayload(): DetailsPayload {
    const base: DetailsPayload = { notes: notes || undefined, _partyName: getPartyName() }
    if (opType === 'COTTON_PURCHASE') {
      const v = villages.find((x) => x.id === villageId)
      Object.assign(base, {
        villageId,
        distanceKm: v?.distanceKm ?? 0,
        cottonGrade: cottonGrade || undefined,
        moisturePct: moisturePct ? parseFloat(moisturePct) : undefined,
      })
    } else if (opType === 'COTTON_LINT_SALE') {
      Object.assign(base, {
        companyId,
        baleCount: baleCount ? parseInt(baleCount) : 0,
        contractRef: contractRef || undefined,
      })
    } else if (opType === 'COTTON_WASTE_SALE') {
      Object.assign(base, {
        companyId,
        pricePerKg: pricePerKg ? parseFloat(pricePerKg) : 0,
      })
    } else if (opType === 'COTTON_SEED_DISPATCH') {
      const v = villages.find((x) => x.id === villageId)
      Object.assign(base, {
        villageId,
        distanceKm: v?.distanceKm ?? 0,
        season,
      })
    } else if (opType === 'BEVERAGE_DISPATCH') {
      Object.assign(base, { customerId })
    } else if (opType === 'BEVERAGE_RAW_INTAKE') {
      Object.assign(base, { supplierId, materialType })
    } else if (opType === 'BEVERAGE_WASTE_SALE') {
      Object.assign(base, {
        customerId,
        pricePerKg: pricePerKg ? parseFloat(pricePerKg) : 0,
      })
    }
    return base
  }

  const selectCls = 'bg-zinc-950 border-zinc-700 text-white'
  const inputCls = 'bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-600'

  return (
    <div className="p-6 space-y-5 max-w-lg">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-base font-semibold text-white mb-0.5">{cfg.label} — Details</h2>
          <p className="text-xs text-zinc-500">
            <span className="font-mono text-zinc-300">{vehicle.plateNumber}</span>
            <span className="mx-1.5 text-zinc-700">·</span>
            <span className="text-zinc-400">{vehicle.driverName}</span>
          </p>
        </div>
      </div>

      {masterLoading ? (
        <div className="flex items-center gap-2 text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading master data…</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Party selector */}
          {cfg.partyType === 'village' && (
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Village *</Label>
              <Select value={villageId} onValueChange={setVillageId}>
                <SelectTrigger className={selectCls}>
                  <SelectValue placeholder="Select village…" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {villages.map((v) => (
                    <SelectItem key={v.id} value={v.id} className="text-white">
                      {v.name} <span className="text-zinc-500 ml-1">({v.distanceKm} km)</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(cfg.partyType === 'company_lint' || cfg.partyType === 'company_waste') && (
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Company *</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className={selectCls}>
                  <SelectValue placeholder="Select company…" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-white">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(cfg.partyType === 'customer_beverage' || cfg.partyType === 'customer_cattle') && (
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger className={selectCls}>
                  <SelectValue placeholder="Select customer…" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-white">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {cfg.partyType === 'supplier' && (
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Supplier *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className={selectCls}>
                  <SelectValue placeholder="Select supplier…" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-white">{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Op-specific fields */}
          {opType === 'COTTON_PURCHASE' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-zinc-400">Cotton Grade</Label>
                <Select value={cottonGrade} onValueChange={(v) => setCottonGrade(v as 'A' | 'B' | 'C')}>
                  <SelectTrigger className={selectCls}>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="A" className="text-white">Grade A</SelectItem>
                    <SelectItem value="B" className="text-white">Grade B</SelectItem>
                    <SelectItem value="C" className="text-white">Grade C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-zinc-400">Moisture %</Label>
                <Input type="number" step="0.1" min="0" max="100" placeholder="0.0" value={moisturePct} onChange={(e) => setMoisturePct(e.target.value)} className={inputCls} />
              </div>
            </div>
          )}

          {opType === 'COTTON_LINT_SALE' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-zinc-400">Bale Count</Label>
                <Input type="number" min="0" placeholder="0" value={baleCount} onChange={(e) => setBaleCount(e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-zinc-400">Contract Ref</Label>
                <Input placeholder="—" value={contractRef} onChange={(e) => setContractRef(e.target.value)} className={inputCls} />
              </div>
            </div>
          )}

          {(opType === 'COTTON_WASTE_SALE' || opType === 'BEVERAGE_WASTE_SALE') && (
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Price per kg (TZS)</Label>
              <Input type="number" min="0" placeholder="0" value={pricePerKg} onChange={(e) => setPricePerKg(e.target.value)} className={inputCls} />
            </div>
          )}

          {opType === 'COTTON_SEED_DISPATCH' && (
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Season</Label>
              <Input placeholder="2025/2026" value={season} onChange={(e) => setSeason(e.target.value)} className={inputCls} />
            </div>
          )}

          {opType === 'BEVERAGE_RAW_INTAKE' && (
            <div className="space-y-1">
              <Label className="text-xs text-zinc-400">Material Type *</Label>
              <Select value={materialType} onValueChange={(v) => setMaterialType(v as 'RICE' | 'MALT' | 'BARLEY')}>
                <SelectTrigger className={selectCls}>
                  <SelectValue placeholder="Select material…" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="RICE" className="text-white">Rice</SelectItem>
                  <SelectItem value="MALT" className="text-white">Malt</SelectItem>
                  <SelectItem value="BARLEY" className="text-white">Barley</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <Label className="text-xs text-zinc-400">Notes (optional)</Label>
            <Input placeholder="Any additional notes…" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            onClick={() => onSubmit(buildPayload())}
            disabled={!isValid() || submitting}
            size="lg"
            className="w-full gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Create Job &amp; Start Weighing
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Weigh Panel ──────────────────────────────────────────────────────────────

function WeighPanel({
  ticketId,
  ticketNumber,
  plateNumber,
  opType,
  driverName,
  partyName,
  onCancel,
  onComplete,
}: {
  ticketId: string
  ticketNumber: string
  plateNumber: string
  opType: OperationType
  driverName: string
  partyName: string
  onCancel: () => void
  onComplete: () => void
}) {
  const { weightKg, isStable } = useWeight()
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [capturing, setCapturing] = useState(false)
  const [captureError, setCaptureError] = useState('')
  const captureWeight = useRef(weightKg)

  // Keep capture weight ref in sync when stable
  useEffect(() => {
    if (isStable) captureWeight.current = weightKg
  }, [weightKg, isStable])

  const loadTicket = useCallback(async () => {
    try {
      const r = await fetch(`/api/tickets/${ticketId}`)
      if (r.ok) {
        const d = await r.json()
        setTicket({
          id: d.id,
          ticketNumber: d.ticketNumber,
          plateNumber: d.vehicle?.plateNumber ?? plateNumber,
          driverName: d.driverName,
          partyName,
          operationType: d.operationType as OperationType,
          module: d.module,
          status: d.status,
          firstWeight: d.firstWeight,
          secondWeight: d.secondWeight,
          netWeight: d.netWeight,
          firstWeightType: d.firstWeightType,
          secondWeightType: d.secondWeightType,
          firstWeightAt: d.firstWeightAt,
          secondWeightAt: d.secondWeightAt,
        })
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [ticketId, plateNumber, partyName])

  useEffect(() => { loadTicket() }, [loadTicket])

  async function capture() {
    if (!isStable || capturing) return
    setCapturing(true)
    setCaptureError('')
    const w = captureWeight.current
    try {
      const res = await fetch(`/api/tickets/${ticketId}/weight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weightKg: w }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setCaptureError(d.error ?? 'Failed to capture weight')
        return
      }
      const result = await res.json()
      if (result.status === 'COMPLETED') {
        await loadTicket()
        setTimeout(onComplete, 1200)
      } else {
        await loadTicket()
      }
    } catch {
      setCaptureError('Network error. Please try again.')
    } finally {
      setCapturing(false)
    }
  }

  const cfg = OPERATION_CONFIGS[opType]
  const isCompleted = ticket?.status === 'COMPLETED'
  const isPending = !ticket || ticket.status === 'PENDING'

  // Which weight are we capturing?
  const captureLabel = isPending
    ? `Capture ${cfg.firstWeightType} Weight`
    : ticket?.status === 'FIRST_WEIGHT_SAVED'
    ? `Capture ${cfg.secondWeightType} Weight`
    : null

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Ticket header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-base font-bold text-white">{plateNumber}</span>
              <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-400 border-zinc-700 font-mono">
                {ticketNumber}
              </Badge>
              <Badge
                variant={cfg.module === 'COTTON' ? 'cotton' : 'beverage'}
                className="text-xs"
              >
                {OP_LABELS[opType] ?? opType}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-zinc-500">{driverName}</span>
              {partyName && <>
                <span className="text-zinc-700">·</span>
                <span className="text-xs text-zinc-500">{partyName}</span>
              </>}
            </div>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-zinc-600 hover:text-zinc-400 transition-colors p-1.5 hover:bg-zinc-800 rounded-lg"
          title="Close — return to queue"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main weighing area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 overflow-y-auto">
        {loading ? (
          <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
        ) : isCompleted ? (
          /* Completed state */
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            <div>
              <p className="text-lg font-semibold text-emerald-400">Ticket Completed</p>
              <p className="text-sm text-zinc-500 mt-1">Net weight: {fmtWeight(ticket?.netWeight)}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Big weight display */}
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="text-xs text-zinc-600 uppercase tracking-widest font-medium mb-1">
                {captureLabel?.replace('Capture ', '') ?? 'Scale Reading'}
              </div>
              <WeightDisplay size="lg" />
            </div>

            {/* Weight cards */}
            {(ticket?.firstWeight != null || ticket?.secondWeight != null) && (
              <div className="flex gap-3 w-full max-w-xs">
                <div className={cn(
                  'flex-1 p-3 rounded-lg border',
                  ticket?.firstWeight != null
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-zinc-900 border-zinc-800'
                )}>
                  <div className="text-xs text-zinc-500 mb-1">{cfg.firstWeightType}</div>
                  <div className={cn('font-mono text-sm font-bold', ticket?.firstWeight != null ? 'text-emerald-400' : 'text-zinc-600')}>
                    {ticket?.firstWeight != null ? fmtWeight(ticket.firstWeight) : '—'}
                  </div>
                  {ticket?.firstWeightAt && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-zinc-600" />
                      <span className="text-xs text-zinc-600">{timeAgo(ticket.firstWeightAt)}</span>
                    </div>
                  )}
                </div>
                <div className={cn(
                  'flex-1 p-3 rounded-lg border',
                  ticket?.secondWeight != null
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-zinc-900 border-zinc-800'
                )}>
                  <div className="text-xs text-zinc-500 mb-1">{cfg.secondWeightType}</div>
                  <div className={cn('font-mono text-sm font-bold', ticket?.secondWeight != null ? 'text-emerald-400' : 'text-zinc-600')}>
                    {ticket?.secondWeight != null ? fmtWeight(ticket.secondWeight) : '—'}
                  </div>
                  {ticket?.secondWeightAt && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-zinc-600" />
                      <span className="text-xs text-zinc-600">{timeAgo(ticket.secondWeightAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Capture button */}
            {captureLabel && (
              <div className="w-full max-w-xs space-y-2">
                <button
                  onClick={capture}
                  disabled={!isStable || capturing}
                  className={cn(
                    'w-full py-4 rounded-xl font-bold text-base transition-all duration-300 border-2',
                    'flex items-center justify-center gap-2',
                    isStable && !capturing
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-[0.98] cursor-pointer'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
                  )}
                >
                  {capturing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Capturing…</>
                  ) : isStable ? (
                    <>{captureLabel} — {weightKg.toFixed(1)} kg</>
                  ) : (
                    <>Waiting for stable reading…</>
                  )}
                </button>

                {captureError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {captureError}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Station Page (main) ──────────────────────────────────────────────────────

function StationContent() {
  const [mode, setMode] = useState<WorkspaceMode>({ type: 'idle' })

  function handleSelectTicket(t: QueueTicket) {
    setMode({
      type: 'weighing',
      ticketId: t.id,
      ticketNumber: t.ticketNumber,
      plateNumber: t.plateNumber,
      opType: t.operationType,
      driverName: t.driverName,
      partyName: t.partyName,
    })
  }

  function handleNewJob() {
    setMode({ type: 'new_job', step: 'vehicle' })
  }

  function handleJobCreated(
    ticketId: string,
    ticketNumber: string,
    plateNumber: string,
    opType: OperationType,
    driverName: string,
    partyName: string
  ) {
    setMode({ type: 'weighing', ticketId, ticketNumber, plateNumber, opType, driverName, partyName })
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-zinc-950 text-white">
      <TopBar onNewJob={handleNewJob} />

      <div className="flex-1 flex overflow-hidden min-h-0">
        <QueuePanel
          mode={mode}
          onSelectTicket={handleSelectTicket}
          onNewJob={handleNewJob}
        />

        {/* Main workspace */}
        <div className="flex-1 flex overflow-hidden">
          {mode.type === 'idle' && <IdleView onNewJob={handleNewJob} />}

          {mode.type === 'new_job' && (
            <NewJobWizard
              onCancel={() => setMode({ type: 'idle' })}
              onCreated={handleJobCreated}
            />
          )}

          {mode.type === 'weighing' && (
            <WeighPanel
              ticketId={mode.ticketId}
              ticketNumber={mode.ticketNumber}
              plateNumber={mode.plateNumber}
              opType={mode.opType}
              driverName={mode.driverName}
              partyName={mode.partyName}
              onCancel={() => setMode({ type: 'idle' })}
              onComplete={() => setMode({ type: 'idle' })}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function StationPage() {
  return (
    <WeightProvider>
      <StationContent />
    </WeightProvider>
  )
}
