import { NextRequest, NextResponse } from 'next/server'

const g = globalThis as unknown as {
  scaleReading: { weightKg: number; isStable: boolean; raw: string; ts: number } | null
}
if (!g.scaleReading) g.scaleReading = null

export async function GET() {
  const r = g.scaleReading
  if (!r || Date.now() - r.ts > 10_000) {
    return NextResponse.json({ connected: false, weightKg: 0, isStable: false, raw: '' })
  }
  return NextResponse.json({ connected: true, weightKg: r.weightKg, isStable: r.isStable, raw: r.raw })
}

export async function POST(req: NextRequest) {
  const secret = process.env.SCALE_SECRET ?? 'dev-scale-secret'
  const token = req.headers.get('x-scale-token')
  if (token !== secret) return new NextResponse('Unauthorized', { status: 401 })
  const body = await req.json()
  g.scaleReading = { weightKg: body.weightKg, isStable: body.isStable, raw: body.raw ?? '', ts: Date.now() }
  return NextResponse.json({ ok: true })
}
