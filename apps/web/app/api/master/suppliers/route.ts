import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const Schema = z.object({
  name: z.string().min(1),
  materialTypes: z.array(z.enum(['RICE', 'MALT', 'BARLEY'])).default([]),
  contact: z.string().optional(),
})

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  return NextResponse.json(
    rows.map((s: (typeof rows)[number]) => ({ ...s, materialTypes: JSON.parse(s.materialTypes) }))
  )
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
  const row = await prisma.supplier.create({
    data: { ...parsed.data, materialTypes: JSON.stringify(parsed.data.materialTypes) },
  })
  return NextResponse.json({ ...row, materialTypes: JSON.parse(row.materialTypes) }, { status: 201 })
}
