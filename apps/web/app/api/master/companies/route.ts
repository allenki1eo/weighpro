import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const Schema = z.object({
  name: z.string().min(1),
  type: z.enum(['LINT_BUYER', 'WASTE_BUYER']),
  contact: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const type = new URL(req.url).searchParams.get('type')
  const rows = await prisma.company.findMany({
    where: { isActive: true, ...(type ? { type } : {}) },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const row = await prisma.company.create({ data: parsed.data })
  return NextResponse.json(row, { status: 201 })
}
