'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Printer, XCircle, Loader2, AlertTriangle, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn, fmt, fmtWeight, OP_LABELS, STATUS_LABELS } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import { OPERATION_CONFIGS } from '@weighpro/core'

interface TicketPanelProps {
  ticketId: string
  currentWeight: number
  isStable: boolean
  onWeightSaved: () => void
}

export function TicketPanel({ ticketId, currentWeight, isStable, onWeightSaved }: TicketPanelProps) {
  const [ticket, setTicket] = useState<Record<string, unknown> | null>(null)
  const [saving, setSaving] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    if (!ticketId) return
    fetch(`/api/tickets/${ticketId}`)
      .then((r) => r.json())
      .then(setTicket)
  }, [ticketId])

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    )
  }

  const status = ticket.status as string
  const opType = ticket.operationType as string
  const opConfig = OPERATION_CONFIGS[opType as keyof typeof OPERATION_CONFIGS]
  const firstWeight = ticket.firstWeight as number | null
  const secondWeight = ticket.secondWeight as number | null
  const netWeight = ticket.netWeight as number | null
  const vehicle = ticket.vehicle as Record<string, string>

  const cottonPurchase = ticket.cottonPurchase as Record<string, unknown> | null
  const beverageDispatch = ticket.beverageDispatch as Record<string, unknown> | null
  const rawMaterialIntake = ticket.rawMaterialIntake as Record<string, unknown> | null
  const lintBaleSale = ticket.lintBaleSale as Record<string, unknown> | null
  const wasteSale = ticket.wasteSale as Record<string, unknown> | null
  const seedDispatch = ticket.seedDispatch as Record<string, unknown> | null
  const maltWasteSale = ticket.maltWasteSale as Record<string, unknown> | null

  // Get party name
  const partyName =
    (cottonPurchase?.village as Record<string, string> | null)?.name ??
    (beverageDispatch?.customer as Record<string, string> | null)?.name ??
    (rawMaterialIntake?.supplier as Record<string, string> | null)?.name ??
    (lintBaleSale?.company as Record<string, string> | null)?.name ??
    (wasteSale?.company as Record<string, string> | null)?.name ??
    (seedDispatch?.village as Record<string, string> | null)?.name ??
    (maltWasteSale?.customer as Record<string, string> | null)?.name ??
    '—'

  const canCapture = isStable && (status === 'PENDING' || status === 'FIRST_WEIGHT_SAVED')
  const isFirst = status === 'PENDING'
  const captureLabel = isFirst
    ? `CAPTURE 1ST WEIGHT (${opConfig?.firstWeightType ?? 'GROSS'})`
    : `CAPTURE 2ND WEIGHT (${opConfig?.secondWeightType ?? 'TARE'})`

  async function handleCapture() {
    setSaving(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/weight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weightKg: currentWeight }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error saving weight', description: data.error, variant: 'destructive' })
        return
      }
      const newStatus = data.status
      toast({
        title: newStatus === 'COMPLETED'
          ? `Completed — Net: ${fmtWeight(data.netWeight)}`
          : `1st weight saved: ${fmtWeight(data.firstWeight)}`,
        variant: 'success',
      })
      // Reload ticket
      const updated = await fetch(`/api/tickets/${ticketId}`).then((r) => r.json())
      setTicket(updated)
      onWeightSaved()
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel() {
    if (!cancelReason.trim()) return
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel', reason: cancelReason }),
    })
    if (res.ok) {
      toast({ title: 'Job cancelled', variant: 'default' })
      setCancelOpen(false)
      onWeightSaved()
    }
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Ticket header */}
      <div className="p-4 border-b border-zinc-200 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono font-bold text-base">{ticket.ticketNumber as string}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={ticket.module === 'COTTON' ? 'cotton' : 'beverage'} className="text-xs">
                {ticket.module as string}
              </Badge>
              <Badge
                className={cn(
                  'text-xs',
                  status === 'PENDING' && 'bg-amber-100 text-amber-800 border-amber-200',
                  status === 'FIRST_WEIGHT_SAVED' && 'bg-purple-100 text-purple-800 border-purple-200',
                  status === 'COMPLETED' && 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  status === 'CANCELLED' && 'bg-red-100 text-red-800 border-red-200'
                )}
              >
                {STATUS_LABELS[status] ?? status}
              </Badge>
            </div>
          </div>
          {status !== 'COMPLETED' && status !== 'CANCELLED' && (
            <button
              onClick={() => setCancelOpen(true)}
              className="text-xs text-zinc-400 hover:text-red-500 flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Vehicle & party */}
      <div className="p-4 space-y-3 flex-shrink-0">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">Plate</p>
            <p className="font-bold font-mono tracking-wider">{vehicle?.plateNumber}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">Driver</p>
            <p className="font-medium text-sm">{ticket.driverName as string}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-zinc-400 mb-0.5">Operation</p>
          <p className="text-sm font-medium">{OP_LABELS[opType] ?? opType}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400 mb-0.5">Party</p>
          <p className="text-sm font-semibold text-zinc-800">{partyName}</p>
        </div>

        {/* Cotton purchase details */}
        {cottonPurchase && (
          <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-200 text-xs space-y-0.5">
            {cottonPurchase.cottonGrade ? <p>Grade: <strong>{String(cottonPurchase.cottonGrade)}</strong></p> : null}
            <p>Distance: <strong>{String(cottonPurchase.distanceKm)} km</strong></p>
            <p>Fuel: <strong>TZS {(cottonPurchase.fuelTotal as number).toLocaleString()}</strong></p>
          </div>
        )}

        {/* Material intake details */}
        {rawMaterialIntake && (
          <div className="p-2.5 bg-sky-50 rounded-lg border border-sky-200 text-xs space-y-0.5">
            <p>Material: <strong>{String(rawMaterialIntake.materialType)}</strong></p>
            {rawMaterialIntake.storageLocation ? <p>Storage: <strong>{String(rawMaterialIntake.storageLocation)}</strong></p> : null}
          </div>
        )}
      </div>

      <Separator />

      {/* Weight summary */}
      <div className="p-4 space-y-3 flex-shrink-0">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Weights</p>

        <div className="grid grid-cols-1 gap-2">
          {/* First weight */}
          <div className={cn(
            'p-3 rounded-xl border-2 transition-all',
            firstWeight != null ? 'border-blue-300 bg-blue-50' : 'border-dashed border-zinc-200 bg-zinc-50'
          )}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                1st Weight <span className="text-zinc-400">({opConfig?.firstWeightType})</span>
              </p>
              {firstWeight != null && <p className="text-xs text-zinc-400">{fmt(ticket.firstWeightAt as string)}</p>}
            </div>
            <p className={cn('font-mono font-bold text-xl mt-0.5', firstWeight != null ? 'text-blue-700' : 'text-zinc-300')}>
              {firstWeight != null ? fmtWeight(firstWeight) : '— — — kg'}
            </p>
          </div>

          {/* Second weight */}
          <div className={cn(
            'p-3 rounded-xl border-2 transition-all',
            secondWeight != null ? 'border-purple-300 bg-purple-50' : 'border-dashed border-zinc-200 bg-zinc-50'
          )}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                2nd Weight <span className="text-zinc-400">({opConfig?.secondWeightType})</span>
              </p>
              {secondWeight != null && <p className="text-xs text-zinc-400">{fmt(ticket.secondWeightAt as string)}</p>}
            </div>
            <p className={cn('font-mono font-bold text-xl mt-0.5', secondWeight != null ? 'text-purple-700' : 'text-zinc-300')}>
              {secondWeight != null ? fmtWeight(secondWeight) : '— — — kg'}
            </p>
          </div>

          {/* Net weight */}
          {netWeight != null && (
            <div className="p-3 rounded-xl border-2 border-emerald-400 bg-emerald-50">
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Net Weight
              </p>
              <p className="font-mono font-black text-3xl text-emerald-700 mt-0.5">{fmtWeight(netWeight)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action area */}
      <div className="p-4 space-y-2 flex-shrink-0">
        {canCapture && (
          <>
            {!isStable && (
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Wait for scale to stabilise
              </div>
            )}
            <Button
              onClick={handleCapture}
              disabled={!isStable || saving}
              variant="capture"
              size="xl"
              className="w-full"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Scale className="w-5 h-5" />
              )}
              {saving ? 'Saving…' : captureLabel}
            </Button>
            <p className="text-center text-xs text-zinc-400 font-mono">
              Current: {currentWeight.toLocaleString('en', { minimumFractionDigits: 1 })} kg
            </p>
          </>
        )}

        {status === 'COMPLETED' && (
          <Button variant="outline" className="w-full gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Reprint Receipt
          </Button>
        )}
      </div>

      {/* Cancel dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">This will cancel ticket <strong>{ticket.ticketNumber as string}</strong>. Please provide a reason.</p>
            <div className="space-y-1.5">
              <Label>Reason *</Label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Wrong vehicle, duplicate entry…"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleCancel} disabled={!cancelReason.trim()} className="flex-1">
                Confirm Cancel
              </Button>
              <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep Job</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
