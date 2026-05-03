import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { fmt } from '@/lib/utils'
import { ROLE_LABELS } from '@weighpro/core'
import type { UserRole } from '@weighpro/core'

export default async function UsersPage() {
  const session = await getSession()
  if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  })

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-800 border-red-200',
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    GATE_CLERK: 'bg-amber-100 text-amber-800 border-amber-200',
    BRIDGE_CLERK: 'bg-blue-100 text-blue-800 border-blue-200',
    MANAGER_COTTON: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    MANAGER_BEVERAGE: 'bg-sky-100 text-sky-800 border-sky-200',
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-zinc-500" />
          <h1 className="text-xl font-bold text-zinc-900">Users</h1>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3 text-zinc-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${roleColors[user.role] ?? ''}`}>
                    {ROLE_LABELS[user.role as UserRole] ?? user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.isActive ? 'success' : 'destructive'} className="text-xs">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{fmt(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
