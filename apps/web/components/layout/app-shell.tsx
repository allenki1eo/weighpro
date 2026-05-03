import { SessionProvider } from '@/components/layout/session-provider'
import { Sidebar } from '@/components/layout/sidebar'

interface AppShellProps {
  children: React.ReactNode
  fullWidth?: boolean
}

export function AppShell({ children, fullWidth = false }: AppShellProps) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className={`flex-1 overflow-auto bg-zinc-50 ${fullWidth ? '' : ''}`}>
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
