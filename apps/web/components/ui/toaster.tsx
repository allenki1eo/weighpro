'use client'

import * as React from 'react'
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, useToastListener } from './toast'

type ToastData = { id: string; title: string; description?: string; variant?: 'default' | 'success' | 'destructive' }

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const addToast = React.useCallback((t: ToastData) => {
    setToasts((prev) => [...prev, t])
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 4000)
  }, [])

  useToastListener(addToast)

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast key={t.id} variant={t.variant}>
          <div className="flex-1">
            <ToastTitle>{t.title}</ToastTitle>
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
