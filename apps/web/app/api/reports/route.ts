import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? 'dashboard'

  if (type === 'dashboard') {
    const today = new Date()
    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)

    const [
      todayTickets,
      todayCompleted,
      monthTickets,
      monthNetWeight,
      pendingCount,
      awaitingSecondCount,
      recentActivity,
    ] = await Promise.all([
      prisma.weighingTicket.count({ where: { isDeleted: false, createdAt: { gte: todayStart, lte: todayEnd } } }),
      prisma.weighingTicket.count({ where: { isDeleted: false, status: 'COMPLETED', secondWeightAt: { gte: todayStart, lte: todayEnd } } }),
      prisma.weighingTicket.count({ where: { isDeleted: false, createdAt: { gte: monthStart, lte: monthEnd } } }),
      prisma.weighingTicket.aggregate({
        _sum: { netWeight: true },
        where: { isDeleted: false, status: 'COMPLETED', createdAt: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.weighingTicket.count({ where: { isDeleted: false, status: 'PENDING' } }),
      prisma.weighingTicket.count({ where: { isDeleted: false, status: 'FIRST_WEIGHT_SAVED' } }),
      prisma.weighingTicket.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          vehicle: { select: { plateNumber: true } },
          clerk: { select: { name: true } },
          cottonPurchase: { include: { village: { select: { name: true } } } },
          beverageDispatch: { include: { customer: { select: { name: true } } } },
        },
      }),
    ])

    return NextResponse.json({
      todayTickets,
      todayCompleted,
      monthTickets,
      monthNetWeightKg: monthNetWeight._sum.netWeight ?? 0,
      pendingCount,
      awaitingSecondCount,
      recentActivity: recentActivity.map((t: (typeof recentActivity)[number]) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        plateNumber: t.vehicle.plateNumber,
        operationType: t.operationType,
        status: t.status,
        partyName: t.cottonPurchase?.village?.name ?? t.beverageDispatch?.customer?.name ?? '—',
        createdAt: t.createdAt,
        clerkName: t.clerk.name,
      })),
    })
  }

  return NextResponse.json({ error: 'Unknown report type' }, { status: 400 })
}
