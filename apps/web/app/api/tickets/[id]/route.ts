import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

const DETAIL_INCLUDE = {
  vehicle: { select: { plateNumber: true, vehicleType: true } },
  clerk: { select: { name: true } },
  weighingClerk: { select: { name: true } },
  deletedBy: { select: { name: true } },
  cottonPurchase: { include: { village: true } },
  lintBaleSale: { include: { company: true } },
  wasteSale: { include: { company: true } },
  seedDispatch: { include: { village: true, obligation: true } },
  beverageDispatch: { include: { customer: true } },
  rawMaterialIntake: { include: { supplier: true } },
  maltWasteSale: { include: { customer: true } },
  auditLogs: {
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' as const },
  },
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ticket = await prisma.weighingTicket.findUnique({
    where: { id, isDeleted: false },
    include: DETAIL_INCLUDE,
  })

  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(ticket)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = session.user.role
  if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const reason = body.reason ?? 'No reason provided'

  const ticket = await prisma.weighingTicket.findUnique({ where: { id } })
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.weighingTicket.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedById: session.user.id,
        deletedAt: new Date(),
        cancelReason: reason,
      },
    })
    await tx.auditLog.create({
      data: {
        ticketId: id,
        userId: session.user.id,
        action: 'DELETE_TICKET',
        reason,
        oldValue: JSON.stringify({ status: ticket.status }),
      },
    })
  })

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const ticket = await prisma.weighingTicket.findUnique({ where: { id, isDeleted: false } })
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Cancel
  if (body.action === 'cancel') {
    if (!['PENDING', 'FIRST_WEIGHT_SAVED'].includes(ticket.status)) {
      return NextResponse.json({ error: 'Cannot cancel a completed ticket' }, { status: 400 })
    }
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.weighingTicket.update({
        where: { id },
        data: { status: 'CANCELLED', cancelReason: body.reason ?? 'Cancelled' },
      })
      await tx.auditLog.create({
        data: {
          ticketId: id,
          userId: session.user.id,
          action: 'CANCEL_TICKET',
          reason: body.reason,
        },
      })
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
