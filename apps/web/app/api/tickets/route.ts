import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { generateTicketNumber } from '@/lib/ticket-number'
import { z } from 'zod'

const CreateTicketSchema = z.object({
  vehicleId: z.string(),
  module: z.enum(['COTTON', 'BEVERAGE']),
  operationType: z.enum([
    'COTTON_PURCHASE',
    'COTTON_LINT_SALE',
    'COTTON_WASTE_SALE',
    'COTTON_SEED_DISPATCH',
    'BEVERAGE_DISPATCH',
    'BEVERAGE_RAW_INTAKE',
    'BEVERAGE_WASTE_SALE',
  ]),
  notes: z.string().optional(),
  // Cotton Purchase
  villageId: z.string().optional(),
  distanceKm: z.number().optional(),
  fuelRatePerKm: z.number().default(200),
  fuelTotal: z.number().optional(),
  cottonGrade: z.enum(['A', 'B', 'C']).optional(),
  moisturePct: z.number().optional(),
  deductionKg: z.number().default(0),
  // Lint Sale
  companyId: z.string().optional(),
  baleCount: z.number().default(0),
  contractRef: z.string().optional(),
  // Waste Sale
  wasteType: z.string().optional(),
  pricePerKg: z.number().default(0),
  // Seed Dispatch
  season: z.string().optional(),
  seedQuantityKg: z.number().optional(),
  obligationId: z.string().optional(),
  // Beverage
  customerId: z.string().optional(),
  routeId: z.string().optional(),
  supplierId: z.string().optional(),
  materialType: z.enum(['RICE', 'MALT', 'BARLEY']).optional(),
  storageLocation: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const module_ = searchParams.get('module')
  const plate = searchParams.get('plate')
  const limit = parseInt(searchParams.get('limit') ?? '50', 10)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const where: Record<string, unknown> = { isDeleted: false }
  if (status) where.status = status
  if (module_) where.module = module_
  if (plate) {
    where.vehicle = { plateNumber: { contains: plate.toUpperCase() } }
  }

  const [tickets, total] = await Promise.all([
    prisma.weighingTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        vehicle: { select: { plateNumber: true } },
        clerk: { select: { name: true } },
        cottonPurchase: { include: { village: { select: { name: true } } } },
        lintBaleSale: { include: { company: { select: { name: true } } } },
        wasteSale: { include: { company: { select: { name: true } } } },
        seedDispatch: { include: { village: { select: { name: true } } } },
        beverageDispatch: { include: { customer: { select: { name: true } } } },
        rawMaterialIntake: { include: { supplier: { select: { name: true } } } },
        maltWasteSale: { include: { customer: { select: { name: true } } } },
      },
    }),
    prisma.weighingTicket.count({ where }),
  ])

  const items = tickets.map((t: (typeof tickets)[number]) => ({
    id: t.id,
    ticketNumber: t.ticketNumber,
    module: t.module,
    operationType: t.operationType,
    status: t.status,
    plateNumber: t.vehicle.plateNumber,
    driverName: t.driverName,
    partyName: getPartyName(t),
    firstWeight: t.firstWeight,
    secondWeight: t.secondWeight,
    netWeight: t.netWeight,
    clerkName: t.clerk.name,
    createdAt: t.createdAt,
    completedAt: t.secondWeightAt,
  }))

  return NextResponse.json({ items, total })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateTicketSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const d = parsed.data

  const vehicle = await prisma.vehicle.findUnique({ where: { id: d.vehicleId } })
  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })

  const ticketNumber = await generateTicketNumber()

  const ticket = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const t = await tx.weighingTicket.create({
      data: {
        ticketNumber,
        module: d.module,
        operationType: d.operationType,
        vehicleId: d.vehicleId,
        driverName: vehicle.driverName,
        driverPhone: vehicle.driverPhone,
        clerkId: session.user.id,
        notes: d.notes,
      },
    })

    // Create module-specific record
    if (d.operationType === 'COTTON_PURCHASE' && d.villageId) {
      const fuelTotal = d.fuelTotal ?? (d.distanceKm ?? 0) * (d.fuelRatePerKm ?? 200)
      await tx.cottonPurchase.create({
        data: {
          ticketId: t.id,
          villageId: d.villageId,
          distanceKm: d.distanceKm ?? 0,
          fuelRatePerKm: d.fuelRatePerKm,
          fuelTotal,
          cottonGrade: d.cottonGrade,
          moisturePct: d.moisturePct,
          deductionKg: d.deductionKg,
        },
      })
    }

    if (d.operationType === 'COTTON_LINT_SALE' && d.companyId) {
      await tx.lintBaleSale.create({
        data: {
          ticketId: t.id,
          companyId: d.companyId,
          baleCount: d.baleCount,
          contractRef: d.contractRef,
        },
      })
    }

    if (d.operationType === 'COTTON_WASTE_SALE' && d.companyId) {
      await tx.wasteSale.create({
        data: {
          ticketId: t.id,
          companyId: d.companyId,
          wasteType: d.wasteType,
          pricePerKg: d.pricePerKg,
        },
      })
    }

    if (d.operationType === 'COTTON_SEED_DISPATCH' && d.villageId && d.obligationId) {
      await tx.seedDispatch.create({
        data: {
          ticketId: t.id,
          villageId: d.villageId,
          season: d.season ?? '2025/2026',
          quantityKg: d.seedQuantityKg ?? 0,
          obligationId: d.obligationId,
        },
      })
    }

    if (d.operationType === 'BEVERAGE_DISPATCH' && d.customerId) {
      await tx.beverageDispatch.create({
        data: {
          ticketId: t.id,
          customerId: d.customerId,
          routeId: d.routeId,
        },
      })
    }

    if (d.operationType === 'BEVERAGE_RAW_INTAKE' && d.supplierId && d.materialType) {
      await tx.rawMaterialIntake.create({
        data: {
          ticketId: t.id,
          supplierId: d.supplierId,
          materialType: d.materialType,
          storageLocation: d.storageLocation,
        },
      })
    }

    if (d.operationType === 'BEVERAGE_WASTE_SALE' && d.customerId) {
      await tx.maltWasteSale.create({
        data: { ticketId: t.id, customerId: d.customerId },
      })
    }

    await tx.auditLog.create({
      data: {
        ticketId: t.id,
        userId: session.user.id,
        action: 'CREATE_JOB',
        newValue: JSON.stringify({ ticketNumber, operationType: d.operationType }),
      },
    })

    return t
  })

  return NextResponse.json({ id: ticket.id, ticketNumber: ticket.ticketNumber }, { status: 201 })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPartyName(t: any): string {
  return (
    t.cottonPurchase?.village?.name ??
    t.lintBaleSale?.company?.name ??
    t.wasteSale?.company?.name ??
    t.seedDispatch?.village?.name ??
    t.beverageDispatch?.customer?.name ??
    t.rawMaterialIntake?.supplier?.name ??
    t.maltWasteSale?.customer?.name ??
    '—'
  )
}
