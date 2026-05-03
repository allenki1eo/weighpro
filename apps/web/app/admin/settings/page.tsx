import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Settings } from 'lucide-react'
import { SettingsForm } from '@/components/admin/settings-form'

export default async function SettingsPage() {
  const session = await getSession()
  if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const settings = await prisma.systemSetting.findMany()
  const map = Object.fromEntries(settings.map((s: (typeof settings)[number]) => [s.key, s.value]))

  return (
    <div className="p-6 max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-zinc-500" />
        <h1 className="text-xl font-bold text-zinc-900">System Settings</h1>
      </div>
      <SettingsForm initialValues={map} />
    </div>
  )
}
