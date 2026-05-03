import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-zinc-200 bg-zinc-100 text-zinc-800',
        secondary: 'border-zinc-200 bg-zinc-50 text-zinc-600',
        destructive: 'border-red-200 bg-red-100 text-red-800',
        success: 'border-emerald-200 bg-emerald-100 text-emerald-800',
        warning: 'border-amber-200 bg-amber-100 text-amber-800',
        info: 'border-blue-200 bg-blue-100 text-blue-800',
        purple: 'border-purple-200 bg-purple-100 text-purple-800',
        cotton: 'border-yellow-200 bg-yellow-100 text-yellow-800',
        beverage: 'border-sky-200 bg-sky-100 text-sky-800',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
