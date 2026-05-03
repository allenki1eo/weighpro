'use client'

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitive.Provider
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn('fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2', className)}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & { variant?: 'default' | 'success' | 'destructive' }
>(({ className, variant = 'default', ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      'group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all',
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out',
      variant === 'default' && 'border-zinc-200 bg-white text-zinc-900',
      variant === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
      variant === 'destructive' && 'border-red-200 bg-red-50 text-red-900',
      className
    )}
    {...props}
  />
))
Toast.displayName = ToastPrimitive.Root.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description ref={ref} className={cn('text-sm opacity-80', className)} {...props} />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn('rounded-sm opacity-70 hover:opacity-100 focus:outline-none', className)}
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
))
ToastClose.displayName = ToastPrimitive.Close.displayName

// Simple hook
type ToastData = { id: string; title: string; description?: string; variant?: 'default' | 'success' | 'destructive' }

const toastListeners: ((t: ToastData) => void)[] = []

export function toast(data: Omit<ToastData, 'id'>) {
  const id = Math.random().toString(36).slice(2)
  toastListeners.forEach((l) => l({ ...data, id }))
}

export function useToastListener(cb: (t: ToastData) => void) {
  React.useEffect(() => {
    toastListeners.push(cb)
    return () => {
      const i = toastListeners.indexOf(cb)
      if (i > -1) toastListeners.splice(i, 1)
    }
  }, [cb])
}

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose }
