import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { TicketDetail } from '@/components/tickets/ticket-detail'

async function getTicket(id: string) {
  return prisma.weighingTicket.findUnique({
    where: { id, isDeleted: false },
    include: {
      vehicle: true,
      clerk: { select: { name: true, email: true } },
      weighingClerk: { select: { name: true, email: true } },
      cottonPurchase: { include: { village: true } },
      lintBaleSale: { include: { company: true } },
      wasteSale: { include: { company: true } },
      seedDispatch: { include: { village: true, obligation: true } },
      beverageDispatch: { include: { customer: true } },
      rawMaterialIntake: { include: { supplier: true } },
      maltWasteSale: { include: { customer: true } },
      auditLogs: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [session, ticket] = await Promise.all([getSession(), getTicket(id)])

  if (!ticket) notFound()

  // Serialize for client
  const serialized = JSON.parse(JSON.stringify(ticket))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <TicketDetail ticket={serialized} userRole={session?.user?.role ?? 'GATE_CLERK'} />
    </div>
  )
}
