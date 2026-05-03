import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth } from 'date-fns'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fmtWeight } from '@/lib/utils'

export default async function ReportsPage() {
  const session = await getSession()
  const today = new Date()

  const [cottonStats, beverageStats, topVehicles] = await Promise.all([
    prisma.weighingTicket.aggregate({
      _count: { id: true },
      _sum: { netWeight: true },
      where: {
        isDeleted: false,
        status: 'COMPLETED',
        module: 'COTTON',
        createdAt: { gte: startOfMonth(today), lte: endOfMonth(today) },
      },
    }),
    prisma.weighingTicket.aggregate({
      _count: { id: true },
      _sum: { netWeight: true },
      where: {
        isDeleted: false,
        status: 'COMPLETED',
        module: 'BEVERAGE',
        createdAt: { gte: startOfMonth(today), lte: endOfMonth(today) },
      },
    }),
    prisma.weighingTicket.groupBy({
      by: ['vehicleId'],
      _count: { id: true },
      _sum: { netWeight: true },
      where: { isDeleted: false, status: 'COMPLETED' },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
  ])

  // Get vehicle plates for top vehicles
  const vehicleIds = topVehicles.map((v) => v.vehicleId)
  const vehicles = await prisma.vehicle.findMany({ where: { id: { in: vehicleIds } }, select: { id: true, plateNumber: true, driverName: true } })
  const vehicleMap = Object.fromEntries(vehicles.map((v) => [v.id, v]))

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-zinc-500" />
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Reports</h1>
          <p className="text-sm text-zinc-500">Month-to-date overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-1.5"><span className="text-yellow-600">🌾</span> Cotton (MTD)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Completed tickets</span>
              <span className="font-bold">{cottonStats._count.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Total net weight</span>
              <span className="font-bold text-yellow-700">{fmtWeight(cottonStats._sum.netWeight)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-1.5"><span className="text-sky-600">🍺</span> Beverage (MTD)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Completed tickets</span>
              <span className="font-bold">{beverageStats._count.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Total net weight</span>
              <span className="font-bold text-sky-700">{fmtWeight(beverageStats._sum.netWeight)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Top Vehicles (All Time)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topVehicles.map((v) => {
              const vehicle = vehicleMap[v.vehicleId]
              return (
                <div key={v.vehicleId} className="flex items-center gap-3 py-2 border-b border-zinc-100 last:border-0">
                  <span className="font-mono font-bold text-sm tracking-wider">{vehicle?.plateNumber ?? '—'}</span>
                  <span className="text-xs text-zinc-500 flex-1">{vehicle?.driverName}</span>
                  <span className="text-xs text-zinc-500">{v._count.id} trips</span>
                  <span className="font-mono font-semibold text-sm text-emerald-700">{fmtWeight(v._sum.netWeight)}</span>
                </div>
              )
            })}
            {topVehicles.length === 0 && <p className="text-sm text-zinc-400 text-center py-4">No completed tickets yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
