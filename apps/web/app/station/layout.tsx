import { SessionProvider } from '@/components/layout/session-provider'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function StationLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  return (
    <SessionProvider>
      <div className="h-screen overflow-hidden bg-zinc-950 text-white">
        {children}
      </div>
    </SessionProvider>
  )
}
