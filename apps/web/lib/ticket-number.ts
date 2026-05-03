import { prisma } from '@/lib/prisma'

export async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `WB-${year}-`

  const last = await prisma.weighingTicket.findFirst({
    where: { ticketNumber: { startsWith: prefix } },
    orderBy: { createdAt: 'desc' },
    select: { ticketNumber: true },
  })

  let seq = 1
  if (last) {
    const parts = last.ticketNumber.split('-')
    seq = parseInt(parts[2] ?? '0', 10) + 1
  }

  return `${prefix}${String(seq).padStart(6, '0')}`
}
