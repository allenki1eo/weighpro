'use client'

import Link from 'next/link'
import { ArrowLeft, Printer, CheckCircle2, Clock, User, Truck, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn, fmt, fmtWeight, STATUS_COLORS, STATUS_LABELS, OP_LABELS } from '@/lib/utils'
import { OPERATION_CONFIGS } from '@weighpro/core'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TicketDetail({ ticket, userRole }: { ticket: any; userRole: string }) {
  const opConfig = OPERATION_CONFIGS[ticket.operationType as keyof typeof OPERATION_CONFIGS]

  const partyName =
    ticket.cottonPurchase?.village?.name ??
    ticket.lintBaleSale?.company?.name ??
    ticket.wasteSale?.company?.name ??
    ticket.seedDispatch?.village?.name ??
    ticket.beverageDispatch?.customer?.name ??
    ticket.rawMaterialIntake?.supplier?.name ??
    ticket.maltWasteSale?.customer?.name ??
    '—'

  const steps = [
    {
      label: 'Job Created',
      done: true,
      time: ticket.createdAt,
      who: ticket.clerk?.name,
      icon: <User className="w-3.5 h-3.5" />,
    },
    {
      label: `1st Weight (${opConfig?.firstWeightType ?? 'GROSS'})`,
      done: !!ticket.firstWeight,
      time: ticket.firstWeightAt,
      who: ticket.weighingClerk?.name,
      value: ticket.firstWeight ? fmtWeight(ticket.firstWeight) : null,
      icon: <Scale className="w-3.5 h-3.5" />,
    },
    {
      label: `2nd Weight (${opConfig?.secondWeightType ?? 'TARE'})`,
      done: !!ticket.secondWeight,
      time: ticket.secondWeightAt,
      who: ticket.weighingClerk?.name,
      value: ticket.secondWeight ? fmtWeight(ticket.secondWeight) : null,
      icon: <Scale className="w-3.5 h-3.5" />,
    },
    {
      label: 'Completed',
      done: ticket.status === 'COMPLETED',
      time: ticket.secondWeightAt,
      value: ticket.netWeight ? `Net: ${fmtWeight(ticket.netWeight)}` : null,
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
  ]

  return (
    <div className="space-y-5">
      {/* Back + print */}
      <div className="flex items-center justify-between">
        <Link href="/tickets" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="w-4 h-4" /> Back to Tickets
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
          <Printer className="w-3.5 h-3.5" /> Print
        </Button>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono font-bold text-2xl text-zinc-900">{ticket.ticketNumber}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant={ticket.module === 'COTTON' ? 'cotton' : 'beverage'}>{ticket.module}</Badge>
              <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', STATUS_COLORS[ticket.status])}>
                {STATUS_LABELS[ticket.status] ?? ticket.status}
              </span>
              <span className="text-sm text-zinc-500">{OP_LABELS[ticket.operationType] ?? ticket.operationType}</span>
            </div>
          </div>
          {ticket.netWeight && (
            <div className="text-right">
              <p className="text-xs text-zinc-400">Net Weight</p>
              <p className="font-mono font-black text-3xl text-emerald-700">{fmtWeight(ticket.netWeight)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Vehicle & party */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" /> Vehicle
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-400">Plate</p>
                <p className="font-bold font-mono tracking-wider text-lg">{ticket.vehicle?.plateNumber}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Type</p>
                <p className="font-medium">{ticket.vehicle?.vehicleType}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Driver</p>
                <p className="font-medium">{ticket.driverName}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Phone</p>
                <p className="font-medium">{ticket.driverPhone ?? '—'}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-zinc-400">Party</p>
              <p className="font-semibold text-sm mt-0.5">{partyName}</p>
            </div>
          </div>

          {/* Module-specific details */}
          {ticket.cottonPurchase && (
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
              <h3 className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-3">Cotton Purchase Details</h3>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-xs text-yellow-600">Village</p><p className="font-medium">{ticket.cottonPurchase.village?.name}</p></div>
                <div><p className="text-xs text-yellow-600">Distance</p><p className="font-medium">{ticket.cottonPurchase.distanceKm} km</p></div>
                <div><p className="text-xs text-yellow-600">Fuel Total</p><p className="font-medium">TZS {ticket.cottonPurchase.fuelTotal?.toLocaleString()}</p></div>
                {ticket.cottonPurchase.cottonGrade && <div><p className="text-xs text-yellow-600">Grade</p><p className="font-bold">{ticket.cottonPurchase.cottonGrade}</p></div>}
                {ticket.cottonPurchase.moisturePct && <div><p className="text-xs text-yellow-600">Moisture</p><p className="font-medium">{ticket.cottonPurchase.moisturePct}%</p></div>}
              </div>
            </div>
          )}

          {ticket.rawMaterialIntake && (
            <div className="bg-sky-50 rounded-xl border border-sky-200 p-4">
              <h3 className="text-xs font-semibold text-sky-700 uppercase tracking-wide mb-3">Raw Material Intake</h3>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-xs text-sky-600">Supplier</p><p className="font-medium">{ticket.rawMaterialIntake.supplier?.name}</p></div>
                <div><p className="text-xs text-sky-600">Material</p><p className="font-bold">{ticket.rawMaterialIntake.materialType}</p></div>
                {ticket.rawMaterialIntake.storageLocation && <div><p className="text-xs text-sky-600">Storage</p><p className="font-medium">{ticket.rawMaterialIntake.storageLocation}</p></div>}
              </div>
            </div>
          )}

          {ticket.notes && (
            <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-3">
              <p className="text-xs text-zinc-400 mb-1">Notes</p>
              <p className="text-sm text-zinc-700">{ticket.notes}</p>
            </div>
          )}
        </div>

        {/* Right: Timeline + Weights */}
        <div className="space-y-4">
          {/* Weights */}
          <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" /> Weights
            </h3>
            <div className="space-y-2">
              <div className={cn('p-2.5 rounded-lg border', ticket.firstWeight ? 'border-blue-200 bg-blue-50' : 'border-dashed border-zinc-200')}>
                <p className="text-xs text-zinc-400">1st ({opConfig?.firstWeightType})</p>
                <p className={cn('font-mono font-bold', ticket.firstWeight ? 'text-blue-700' : 'text-zinc-300')}>
                  {fmtWeight(ticket.firstWeight)}
                </p>
                {ticket.firstWeightAt && <p className="text-xs text-zinc-400 mt-0.5">{fmt(ticket.firstWeightAt)}</p>}
              </div>
              <div className={cn('p-2.5 rounded-lg border', ticket.secondWeight ? 'border-purple-200 bg-purple-50' : 'border-dashed border-zinc-200')}>
                <p className="text-xs text-zinc-400">2nd ({opConfig?.secondWeightType})</p>
                <p className={cn('font-mono font-bold', ticket.secondWeight ? 'text-purple-700' : 'text-zinc-300')}>
                  {fmtWeight(ticket.secondWeight)}
                </p>
                {ticket.secondWeightAt && <p className="text-xs text-zinc-400 mt-0.5">{fmt(ticket.secondWeightAt)}</p>}
              </div>
              {ticket.netWeight && (
                <div className="p-2.5 rounded-lg border-2 border-emerald-400 bg-emerald-50">
                  <p className="text-xs text-emerald-600">Net Weight</p>
                  <p className="font-mono font-black text-xl text-emerald-700">{fmtWeight(ticket.netWeight)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Timeline
            </h3>
            <div className="relative">
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-zinc-200" />
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 relative">
                    <div className={cn(
                      'w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10',
                      step.done
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-white border-zinc-300 text-zinc-400'
                    )}>
                      {step.icon}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className={cn('text-xs font-semibold', step.done ? 'text-zinc-800' : 'text-zinc-400')}>{step.label}</p>
                      {step.value && <p className="text-xs font-mono font-bold text-zinc-700">{step.value}</p>}
                      {step.time && <p className="text-xs text-zinc-400">{fmt(step.time)}</p>}
                      {step.who && <p className="text-xs text-zinc-400">{step.who}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit log */}
      {ticket.auditLogs?.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Audit Log</h3>
          <div className="space-y-2">
            {ticket.auditLogs.map((log: Record<string, unknown>, i: number) => (
              <div key={i} className="flex items-start gap-3 text-xs text-zinc-600 py-1.5 border-b border-zinc-100 last:border-0">
                <span className="text-zinc-400 flex-shrink-0 font-mono">{fmt(log.createdAt as string, 'HH:mm dd/MM')}</span>
                <span className="font-semibold text-zinc-700">{(log.user as Record<string, string>)?.name}</span>
                <span className="font-mono text-xs bg-zinc-100 px-1.5 py-0.5 rounded">{log.action as string}</span>
                {log.reason ? <span className="text-zinc-500 italic">{String(log.reason)}</span> : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
