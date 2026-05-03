import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { normalizePlate } from '@/lib/utils'
import { z } from 'zod'

const CreateVehicleSchema = z.object({
  plateNumber: z.string().min(2),
  driverName: z.string().min(1),
  driverPhone: z.string().optional(),
  vehicleType: z.enum(['TRUCK', 'PICKUP']).default('TRUCK'),
  defaultTare: z.number().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.toUpperCase() ?? ''

  if (!q) return NextResponse.json([])

  const vehicles = await prisma.vehicle.findMany({
    where: {
      isActive: true,
      plateNumber: { contains: q },
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    include: {
      tickets: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true },
      },
    },
  })

  return NextResponse.json(
    vehicles.map((v: (typeof vehicles)[number]) => ({
      id: v.id,
      plateNumber: v.plateNumber,
      driverName: v.driverName,
      driverPhone: v.driverPhone,
      defaultTare: v.defaultTare,
      vehicleType: v.vehicleType,
      isActive: v.isActive,
      lastVisit: v.tickets[0]?.createdAt ?? null,
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateVehicleSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const plate = normalizePlate(parsed.data.plateNumber)

  const existing = await prisma.vehicle.findUnique({ where: { plateNumber: plate } })
  if (existing) {
    return NextResponse.json({ error: 'Vehicle with this plate already exists', vehicle: existing }, { status: 409 })
  }

  const vehicle = await prisma.vehicle.create({
    data: { ...parsed.data, plateNumber: plate },
  })

  return NextResponse.json(vehicle, { status: 201 })
}
