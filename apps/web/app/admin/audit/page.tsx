import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Activity } from 'lucide-react'
import { fmt } from '@/lib/utils'
import Link from 'next/link'

export default async function AuditPage() {
  const session = await getSession()
  if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      ticket: { select: { ticketNumber: true, id: true } },
    },
  })

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-zinc-500" />
        <h1 className="text-xl font-bold text-zinc-900">Audit Logs</h1>
      </div>
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Time</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Action</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Ticket</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {logs.map((log: (typeof logs)[number]) => (
              <tr key={log.id} className="hover:bg-zinc-50">
                <td className="px-4 py-2.5 text-xs text-zinc-400 font-mono">{fmt(log.createdAt, 'dd/MM HH:mm')}</td>
                <td className="px-4 py-2.5">
                  <p className="font-medium text-xs">{log.user.name}</p>
                  <p className="text-xs text-zinc-400">{log.user.email}</p>
                </td>
                <td className="px-4 py-2.5">
                  <span className="font-mono text-xs bg-zinc-100 px-2 py-0.5 rounded">{log.action}</span>
                </td>
                <td className="px-4 py-2.5">
                  {log.ticket ? (
                    <Link href={`/tickets/${log.ticket.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                      {log.ticket.ticketNumber}
                    </Link>
                  ) : '—'}
                </td>
                <td className="px-4 py-2.5 text-xs text-zinc-500 italic max-w-[200px] truncate">{log.reason ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
