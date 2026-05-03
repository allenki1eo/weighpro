import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { getFirstWeightType, getSecondWeightType, calcNetWeight } from '@weighpro/core'
import { z } from 'zod'

const WeightSchema = z.object({
  weightKg: z.number().positive(),
  reason: z.string().optional(), // required for edits on COMPLETED tickets
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = WeightSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { weightKg } = parsed.data

  const ticket = await prisma.weighingTicket.findUnique({ where: { id, isDeleted: false } })
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const op = ticket.operationType as Parameters<typeof getFirstWeightType>[0]

  if (ticket.status === 'PENDING') {
    // Capture first weight
    const weightType = getFirstWeightType(op)
    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const t = await tx.weighingTicket.update({
        where: { id },
        data: {
          firstWeight: weightKg,
          firstWeightType: weightType,
          firstWeightAt: new Date(),
          status: 'FIRST_WEIGHT_SAVED',
          weighingClerkId: session.user.id,
        },
      })
      await tx.auditLog.create({
        data: {
          ticketId: id,
          userId: session.user.id,
          action: 'CAPTURE_FIRST_WEIGHT',
          newValue: JSON.stringify({ weightKg, weightType }),
        },
      })
      return t
    })
    return NextResponse.json({ status: updated.status, firstWeight: updated.firstWeight })
  }

  if (ticket.status === 'FIRST_WEIGHT_SAVED') {
    // Capture second weight and complete
    const weightType = getSecondWeightType(op)
    const netWeight = calcNetWeight(ticket.firstWeight!, weightKg)

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const t = await tx.weighingTicket.update({
        where: { id },
        data: {
          secondWeight: weightKg,
          secondWeightType: weightType,
          secondWeightAt: new Date(),
          netWeight,
          status: 'COMPLETED',
        },
      })
      await tx.auditLog.create({
        data: {
          ticketId: id,
          userId: session.user.id,
          action: 'CAPTURE_SECOND_WEIGHT',
          newValue: JSON.stringify({ weightKg, weightType, netWeight }),
        },
      })
      return t
    })
    return NextResponse.json({
      status: updated.status,
      secondWeight: updated.secondWeight,
      netWeight: updated.netWeight,
    })
  }

  // Edit on COMPLETED — requires admin + reason + audit log BEFORE update
  if (ticket.status === 'COMPLETED') {
    const role = session.user.role
    if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Only admins can edit completed ticket weights' }, { status: 403 })
    }
    if (!parsed.data.reason) {
      return NextResponse.json({ error: 'Reason is required when editing a completed ticket' }, { status: 400 })
    }

    const isFirst = body.weightField === 'first'
    const oldValue = isFirst ? ticket.firstWeight : ticket.secondWeight
    const first = isFirst ? weightKg : ticket.firstWeight!
    const second = isFirst ? ticket.secondWeight! : weightKg
    const netWeight = calcNetWeight(first, second)

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Audit BEFORE update
      await tx.auditLog.create({
        data: {
          ticketId: id,
          userId: session.user.id,
          action: isFirst ? 'EDIT_FIRST_WEIGHT' : 'EDIT_SECOND_WEIGHT',
          oldValue: String(oldValue),
          newValue: String(weightKg),
          reason: parsed.data.reason,
        },
      })
      await tx.weighingTicket.update({
        where: { id },
        data: isFirst
          ? { firstWeight: weightKg, netWeight }
          : { secondWeight: weightKg, netWeight },
      })
    })
    return NextResponse.json({ ok: true, netWeight })
  }

  return NextResponse.json({ error: 'Ticket is not in a weightable state' }, { status: 400 })
}
