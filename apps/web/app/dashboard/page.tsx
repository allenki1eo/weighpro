import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'
import { LayoutDashboard, TrendingUp, Clock, CheckCircle2, AlertCircle, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { fmt, fmtWeight, STATUS_COLORS, STATUS_LABELS, OP_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await getSession()
  const today = new Date()

  const [
    todayTickets,
    todayCompleted,
    monthAggregate,
    pendingCount,
    awaitingSecondCount,
    recentActivity,
  ] = await Promise.all([
    prisma.weighingTicket.count({
      where: { isDeleted: false, createdAt: { gte: startOfDay(today), lte: endOfDay(today) } },
    }),
    prisma.weighingTicket.count({
      where: {
        isDeleted: false,
        status: 'COMPLETED',
        secondWeightAt: { gte: startOfDay(today), lte: endOfDay(today) },
      },
    }),
    prisma.weighingTicket.aggregate({
      _count: { id: true },
      _sum: { netWeight: true },
      where: {
        isDeleted: false,
        status: 'COMPLETED',
        createdAt: { gte: startOfMonth(today), lte: endOfMonth(today) },
      },
    }),
    prisma.weighingTicket.count({ where: { isDeleted: false, status: 'PENDING' } }),
    prisma.weighingTicket.count({ where: { isDeleted: false, status: 'FIRST_WEIGHT_SAVED' } }),
    prisma.weighingTicket.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        vehicle: { select: { plateNumber: true } },
        clerk: { select: { name: true } },
        cottonPurchase: { include: { village: { select: { name: true } } } },
        beverageDispatch: { include: { customer: { select: { name: true } } } },
        rawMaterialIntake: { include: { supplier: { select: { name: true } } } },
      },
    }),
  ])

  const kpis = [
    { label: "Today's Jobs", value: todayTickets, icon: <Activity className="w-4 h-4" />, color: 'text-zinc-900' },
    { label: 'Completed Today', value: todayCompleted, icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-600' },
    { label: 'Month Tickets', value: monthAggregate._count.id, icon: <TrendingUp className="w-4 h-4" />, color: 'text-blue-600' },
    { label: 'Month Net Weight', value: fmtWeight(monthAggregate._sum.netWeight), icon: <TrendingUp className="w-4 h-4" />, color: 'text-purple-600', isText: true },
    { label: 'Awaiting 1st Weight', value: pendingCount, icon: <Clock className="w-4 h-4" />, color: 'text-amber-600' },
    { label: 'Awaiting 2nd Weight', value: awaitingSecondCount, icon: <AlertCircle className="w-4 h-4" />, color: 'text-purple-600' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <LayoutDashboard className="w-5 h-5 text-zinc-500" />
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500">Welcome back, {session?.user?.name}</p>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-zinc-500">{kpi.label}</p>
                <span className={cn('text-zinc-400', kpi.color)}>{kpi.icon}</span>
              </div>
              <p className={cn('font-bold text-2xl', kpi.color)}>
                {kpi.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/gate"
          className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
        >
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">G</span>
          </div>
          <div>
            <p className="font-semibold text-sm text-amber-900">Gate Terminal</p>
            <p className="text-xs text-amber-600">Register vehicle & create job</p>
          </div>
        </Link>
        <Link
          href="/bridge"
          className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">B</span>
          </div>
          <div>
            <p className="font-semibold text-sm text-blue-900">Bridge Terminal</p>
            <p className="text-xs text-blue-600">Capture weights · {pendingCount + awaitingSecondCount} active</p>
          </div>
        </Link>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            Recent Activity
            <Link href="/tickets" className="text-xs font-normal text-blue-600 hover:underline">View all →</Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-100">
            {recentActivity.map((t) => {
              const partyName =
                t.cottonPurchase?.village?.name ??
                t.beverageDispatch?.customer?.name ??
                t.rawMaterialIntake?.supplier?.name ??
                '—'
              return (
                <Link
                  key={t.id}
                  href={`/tickets/${t.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 transition-colors"
                >
                  <Badge
                    variant={t.module === 'COTTON' ? 'cotton' : 'beverage'}
                    className="text-xs flex-shrink-0"
                  >
                    {t.module}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold">{t.ticketNumber}</span>
                      <span className="font-mono text-sm font-bold tracking-wider">{t.vehicle.plateNumber}</span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{OP_LABELS[t.operationType] ?? t.operationType} · {partyName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={cn('inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium', STATUS_COLORS[t.status])}>
                      {STATUS_LABELS[t.status] ?? t.status}
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5">{fmt(t.createdAt, 'HH:mm')}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
