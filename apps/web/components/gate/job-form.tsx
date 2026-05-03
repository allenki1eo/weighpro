'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Printer, Save, X, Wheat, Beer, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { OPERATION_CONFIGS } from '@weighpro/core'
import type { VehicleDTO, VillageDTO, CompanyDTO, CustomerDTO, SupplierDTO } from '@weighpro/core'
import { toast } from '@/components/ui/toast'

const schema = z.object({
  module: z.enum(['COTTON', 'BEVERAGE']),
  operationType: z.string().min(1),
  villageId: z.string().optional(),
  companyId: z.string().optional(),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  materialType: z.enum(['RICE', 'MALT', 'BARLEY']).optional(),
  distanceKm: z.coerce.number().optional(),
  fuelRatePerKm: z.coerce.number().default(200),
  cottonGrade: z.enum(['A', 'B', 'C']).optional(),
  moisturePct: z.coerce.number().optional(),
  baleCount: z.coerce.number().optional(),
  contractRef: z.string().optional(),
  storageLocation: z.string().optional(),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const COTTON_OPS = [
  { value: 'COTTON_PURCHASE', label: 'Cotton Purchase', icon: '🌾' },
  { value: 'COTTON_LINT_SALE', label: 'Lint Sale', icon: '🏭' },
  { value: 'COTTON_WASTE_SALE', label: 'Waste Sale', icon: '♻️' },
  { value: 'COTTON_SEED_DISPATCH', label: 'Seed Dispatch', icon: '🌱' },
]

const BEVERAGE_OPS = [
  { value: 'BEVERAGE_DISPATCH', label: 'Beverage Dispatch', icon: '🍺' },
  { value: 'BEVERAGE_RAW_INTAKE', label: 'Raw Material Intake', icon: '🌾' },
  { value: 'BEVERAGE_WASTE_SALE', label: 'Waste Sale', icon: '♻️' },
]

interface JobFormProps {
  vehicle: VehicleDTO
  onJobCreated: (ticketId: string, ticketNumber: string) => void
  onClear: () => void
}

export function JobForm({ vehicle, onJobCreated, onClear }: JobFormProps) {
  const [villages, setVillages] = useState<VillageDTO[]>([])
  const [companies, setCompanies] = useState<CompanyDTO[]>([])
  const [customers, setCustomers] = useState<CustomerDTO[]>([])
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([])
  const [fuelOverride, setFuelOverride] = useState(false)
  const [fuelOverrideReason, setFuelOverrideReason] = useState('')

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { module: 'COTTON', fuelRatePerKm: 200 },
  })

  const module = watch('module')
  const operationType = watch('operationType')
  const villageId = watch('villageId')
  const distanceKm = watch('distanceKm')
  const fuelRatePerKm = watch('fuelRatePerKm')

  const ops = module === 'COTTON' ? COTTON_OPS : BEVERAGE_OPS
  const opConfig = operationType ? OPERATION_CONFIGS[operationType as keyof typeof OPERATION_CONFIGS] : null

  const fuelTotal = (distanceKm ?? 0) * (fuelRatePerKm ?? 200)

  // Load master data
  useEffect(() => {
    Promise.all([
      fetch('/api/master/villages').then((r) => r.json()),
      fetch('/api/master/companies').then((r) => r.json()),
      fetch('/api/master/customers').then((r) => r.json()),
      fetch('/api/master/suppliers').then((r) => r.json()),
    ]).then(([v, c, cu, s]) => {
      setVillages(v)
      setCompanies(c)
      setCustomers(cu)
      setSuppliers(s)
    })
  }, [])

  // Auto-fill distance when village selected
  useEffect(() => {
    if (!villageId) return
    const village = villages.find((v) => v.id === villageId)
    if (village) setValue('distanceKm', village.distanceKm)
  }, [villageId, villages, setValue])

  // Reset operation when module changes
  useEffect(() => {
    setValue('operationType', '')
  }, [module, setValue])

  async function onSubmit(data: FormData) {
    const payload: Record<string, unknown> = {
      vehicleId: vehicle.id,
      module: data.module,
      operationType: data.operationType,
      notes: data.notes,
    }

    if (data.operationType === 'COTTON_PURCHASE') {
      payload.villageId = data.villageId
      payload.distanceKm = data.distanceKm
      payload.fuelRatePerKm = data.fuelRatePerKm
      payload.fuelTotal = fuelTotal
      payload.cottonGrade = data.cottonGrade
      payload.moisturePct = data.moisturePct
    } else if (data.operationType === 'COTTON_LINT_SALE') {
      payload.companyId = data.companyId
      payload.baleCount = data.baleCount ?? 0
      payload.contractRef = data.contractRef
    } else if (data.operationType === 'COTTON_WASTE_SALE') {
      payload.companyId = data.companyId
    } else if (data.operationType === 'COTTON_SEED_DISPATCH') {
      payload.villageId = data.villageId
    } else if (data.operationType === 'BEVERAGE_DISPATCH') {
      payload.customerId = data.customerId
    } else if (data.operationType === 'BEVERAGE_RAW_INTAKE') {
      payload.supplierId = data.supplierId
      payload.materialType = data.materialType
      payload.storageLocation = data.storageLocation
    } else if (data.operationType === 'BEVERAGE_WASTE_SALE') {
      payload.customerId = data.customerId
    }

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) {
        toast({ title: 'Error creating job', description: result.error ?? 'Unknown error', variant: 'destructive' })
        return
      }
      toast({ title: `Job created: ${result.ticketNumber}`, variant: 'success' })
      onJobCreated(result.id, result.ticketNumber)
    } catch {
      toast({ title: 'Network error', variant: 'destructive' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Module toggle */}
      <div className="space-y-1.5">
        <Label>Module</Label>
        <Controller
          name="module"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'COTTON', label: 'Cotton', Icon: Wheat, color: 'bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100' },
                { value: 'BEVERAGE', label: 'Beverage', Icon: Beer, color: 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100' },
              ].map(({ value, label, Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => field.onChange(value)}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all',
                    field.value === value
                      ? value === 'COTTON' ? 'bg-yellow-500 border-yellow-500 text-white' : 'bg-sky-500 border-sky-500 text-white'
                      : cn('border-zinc-200 text-zinc-500 bg-white hover:border-zinc-300', color)
                  )}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      {/* Operation selector */}
      <div className="space-y-1.5">
        <Label>Operation</Label>
        <Controller
          name="operationType"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2">
              {ops.map((op) => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => field.onChange(op.value)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-all',
                    field.value === op.value
                      ? 'bg-zinc-900 border-zinc-900 text-white font-medium'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50'
                  )}
                >
                  <span className="text-base">{op.icon}</span>
                  <span className="leading-tight">{op.label}</span>
                </button>
              ))}
            </div>
          )}
        />
        {errors.operationType && <p className="text-xs text-red-600">Select an operation</p>}
      </div>

      {/* Dynamic party + context fields */}
      {opConfig && (
        <div className="space-y-4 border-t border-zinc-100 pt-4">
          {/* Village selector */}
          {(operationType === 'COTTON_PURCHASE' || operationType === 'COTTON_SEED_DISPATCH') && (
            <div className="space-y-1.5">
              <Label>Village *</Label>
              <Controller
                name="villageId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select village…" /></SelectTrigger>
                    <SelectContent>
                      {villages.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} <span className="text-zinc-400 ml-1">({v.distanceKm} km)</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Cotton Purchase details */}
          {operationType === 'COTTON_PURCHASE' && (
            <>
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Fuel Calculation</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Distance (km)</Label>
                    <Input {...register('distanceKm')} type="number" className="h-8 text-sm" placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Rate (TZS/km)</Label>
                    <Input
                      {...register('fuelRatePerKm')}
                      type="number"
                      className={cn('h-8 text-sm', !fuelOverride && 'bg-zinc-100 text-zinc-500')}
                      readOnly={!fuelOverride}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Total (TZS)</Label>
                    <div className="h-8 flex items-center px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-sm">
                      {fuelTotal.toLocaleString()}
                    </div>
                  </div>
                </div>
                {!fuelOverride ? (
                  <button type="button" onClick={() => setFuelOverride(true)} className="text-xs text-blue-600 hover:underline">
                    Override fuel rate
                  </button>
                ) : (
                  <div className="space-y-1">
                    <Label className="text-xs text-amber-700">Override reason *</Label>
                    <Input
                      value={fuelOverrideReason}
                      onChange={(e) => setFuelOverrideReason(e.target.value)}
                      placeholder="Reason for rate change…"
                      className="h-8 text-sm border-amber-300"
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Cotton Grade</Label>
                  <Controller
                    name="cottonGrade"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Select grade…" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Grade A</SelectItem>
                          <SelectItem value="B">Grade B</SelectItem>
                          <SelectItem value="C">Grade C</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Moisture %</Label>
                  <Input {...register('moisturePct')} type="number" step="0.1" placeholder="e.g. 12.5" />
                </div>
              </div>
            </>
          )}

          {/* Lint Sale */}
          {operationType === 'COTTON_LINT_SALE' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Buyer Company *</Label>
                <Controller name="companyId" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select company…" /></SelectTrigger>
                    <SelectContent>
                      {companies.filter((c) => c.type === 'LINT_BUYER').map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Bale Count</Label>
                  <Input {...register('baleCount')} type="number" placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>Contract Ref</Label>
                  <Input {...register('contractRef')} placeholder="Optional" />
                </div>
              </div>
            </div>
          )}

          {/* Waste Sale (Cotton or Beverage) */}
          {(operationType === 'COTTON_WASTE_SALE') && (
            <div className="space-y-1.5">
              <Label>Buyer Company *</Label>
              <Controller name="companyId" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select company…" /></SelectTrigger>
                  <SelectContent>
                    {companies.filter((c) => c.type === 'WASTE_BUYER').map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </div>
          )}

          {/* Beverage Dispatch */}
          {operationType === 'BEVERAGE_DISPATCH' && (
            <div className="space-y-1.5">
              <Label>Customer *</Label>
              <Controller name="customerId" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select customer…" /></SelectTrigger>
                  <SelectContent>
                    {customers.filter((c) => c.type === 'BEVERAGE_CUSTOMER').map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </div>
          )}

          {/* Beverage Waste Sale */}
          {operationType === 'BEVERAGE_WASTE_SALE' && (
            <div className="space-y-1.5">
              <Label>Customer *</Label>
              <Controller name="customerId" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select customer…" /></SelectTrigger>
                  <SelectContent>
                    {customers.filter((c) => c.type === 'CATTLE_FARMER').map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </div>
          )}

          {/* Raw Material Intake */}
          {operationType === 'BEVERAGE_RAW_INTAKE' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Supplier *</Label>
                <Controller name="supplierId" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Material Type *</Label>
                  <Controller name="materialType" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RICE">Rice</SelectItem>
                        <SelectItem value="MALT">Malt</SelectItem>
                        <SelectItem value="BARLEY">Barley</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="space-y-1.5">
                  <Label>Storage Location</Label>
                  <Input {...register('storageLocation')} placeholder="e.g. Bay 3A" />
                </div>
              </div>
            </div>
          )}

          {/* Flow indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              1st weight: <strong>{opConfig.firstWeightType}</strong>
              {' → '}
              2nd weight: <strong>{opConfig.secondWeightType}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <Label>Notes (optional)</Label>
        <Input {...register('notes')} placeholder="Any special instructions…" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-zinc-100">
        <Button type="submit" variant="success" className="flex-1 gap-2" disabled={isSubmitting || !operationType}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Create Job
        </Button>
        <Button type="button" variant="outline" onClick={onClear} className="gap-1.5">
          <X className="w-4 h-4" /> Clear
        </Button>
      </div>
    </form>
  )
}
