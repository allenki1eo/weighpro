import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TicketList } from '@/components/tickets/ticket-list'

async function getTickets(searchParams: Record<string, string>) {
  const status = searchParams.status
  const module_ = searchParams.module
  const plate = searchParams.plate
  const page = parseInt(searchParams.page ?? '1', 10)
  const limit = 25
  const offset = (page - 1) * limit

  const where: Record<string, unknown> = { isDeleted: false }
  if (status) where.status = status
  if (module_) where.module = module_
  if (plate) where.vehicle = { plateNumber: { contains: plate.toUpperCase() } }

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

  return {
    tickets: tickets.map((t: (typeof tickets)[number]) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      module: t.module,
      operationType: t.operationType,
      status: t.status,
      plateNumber: t.vehicle.plateNumber,
      driverName: t.driverName,
      partyName:
        t.cottonPurchase?.village?.name ??
        t.lintBaleSale?.company?.name ??
        t.wasteSale?.company?.name ??
        t.seedDispatch?.village?.name ??
        t.beverageDispatch?.customer?.name ??
        t.rawMaterialIntake?.supplier?.name ??
        t.maltWasteSale?.customer?.name ??
        '—',
      firstWeight: t.firstWeight,
      secondWeight: t.secondWeight,
      netWeight: t.netWeight,
      clerkName: t.clerk.name,
      createdAt: t.createdAt.toISOString(),
      completedAt: t.secondWeightAt?.toISOString() ?? null,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  }
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const session = await getSession()
  const sp = await searchParams
  const data = await getTickets(sp)

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-zinc-900">Weighing Tickets</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{data.total} total tickets</p>
      </div>
      <TicketList initialData={data} userRole={session?.user?.role ?? 'GATE_CLERK'} />
    </div>
  )
}
