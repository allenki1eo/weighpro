'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'

interface SettingsFormProps {
  initialValues: Record<string, string>
}

const SETTINGS_CONFIG = [
  { key: 'FUEL_RATE_PER_KM', label: 'Fuel Rate (TZS/km)', description: 'Default fuel compensation rate per km', type: 'number' },
  { key: 'SEED_RATIO', label: 'Seed Ratio', description: 'Seed obligation ratio (e.g. 0.05 = 5%)', type: 'number' },
  { key: 'CURRENT_SEASON', label: 'Current Season', description: 'Active cotton season (e.g. 2025/2026)', type: 'text' },
  { key: 'SCALE_PORT', label: 'Scale Serial Port', description: 'COM port for XK3190 scale (e.g. COM3 or /dev/ttyUSB0)', type: 'text' },
  { key: 'SCALE_BAUD', label: 'Scale Baud Rate', description: 'Serial baud rate (typically 1200)', type: 'number' },
]

export function SettingsForm({ initialValues }: SettingsFormProps) {
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit } = useForm({ defaultValues: initialValues })

  async function onSubmit(data: Record<string, string>) {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast({ title: 'Settings saved', variant: 'success' })
      } else {
        toast({ title: 'Failed to save settings', variant: 'destructive' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Operational Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {SETTINGS_CONFIG.map((s) => (
            <div key={s.key} className="space-y-1.5">
              <Label htmlFor={s.key}>{s.label}</Label>
              <Input
                id={s.key}
                type={s.type}
                step={s.type === 'number' ? 'any' : undefined}
                {...register(s.key)}
              />
              <p className="text-xs text-zinc-400">{s.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Button type="submit" disabled={saving} className="gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Settings
      </Button>
    </form>
  )
}
