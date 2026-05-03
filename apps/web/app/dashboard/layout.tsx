import { SessionProvider } from '@/components/layout/session-provider'
import { Sidebar } from '@/components/layout/sidebar'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-zinc-50">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
