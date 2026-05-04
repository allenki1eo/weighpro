'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Scale,
  Gauge,
  ClipboardList,
  BarChart3,
  Settings,
  Users,
  LogOut,
  ChevronRight,
  BookOpen,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@weighpro/core'
import type { UserRole } from '@weighpro/core'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: UserRole[]
}

const NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <Gauge className="w-4 h-4" />, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER_COTTON', 'MANAGER_BEVERAGE'] },
  { label: 'Weighing Station', href: '/station', icon: <Scale className="w-4 h-4" />, roles: ['SUPER_ADMIN', 'ADMIN', 'CLERK', 'GATE_CLERK', 'BRIDGE_CLERK', 'MANAGER_COTTON', 'MANAGER_BEVERAGE'] },
  { label: 'Tickets', href: '/tickets', icon: <ClipboardList className="w-4 h-4" />, roles: ['SUPER_ADMIN', 'ADMIN', 'CLERK', 'GATE_CLERK', 'BRIDGE_CLERK', 'MANAGER_COTTON', 'MANAGER_BEVERAGE'] },
  { label: 'Reports', href: '/reports', icon: <BarChart3 className="w-4 h-4" />, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER_COTTON', 'MANAGER_BEVERAGE'] },
  { label: 'Master Data', href: '/admin/master', icon: <BookOpen className="w-4 h-4" />, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Audit Logs', href: '/admin/audit', icon: <Activity className="w-4 h-4" />, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { label: 'Users', href: '/admin/users', icon: <Users className="w-4 h-4" />, roles: ['SUPER_ADMIN'] },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-4 h-4" />, roles: ['SUPER_ADMIN', 'ADMIN'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined

  const visible = NAV.filter((n) => !role || n.roles.includes(role))

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-zinc-950 border-r border-zinc-800">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-zinc-800">
        <div className="flex items-center justify-center w-8 h-8 bg-zinc-800 rounded-lg">
          <Scale className="w-4 h-4 text-zinc-100" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-none">Weighbridge OS</p>
          <p className="text-xs text-zinc-500 mt-0.5 leading-none">Tanzania</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors group',
                active
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              )}
            >
              <span className={cn(active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300')}>
                {item.icon}
              </span>
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-zinc-500" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-zinc-800 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-zinc-900">
          <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-zinc-200">
              {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-200 truncate">{session?.user?.name}</p>
            <p className="text-xs text-zinc-500 truncate">{role ? ROLE_LABELS[role] : ''}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
