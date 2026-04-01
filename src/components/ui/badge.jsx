import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-2xl border px-2.5 py-1 text-xs font-semibold tracking-wide transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: 'border-indigo-300/30 bg-indigo-500/15 text-indigo-200',
        secondary: 'border-white/10 bg-white/5 text-muted-foreground',
        success: 'border-success/40 bg-success/20 text-success-foreground',
        warning: 'border-warning/40 bg-warning/20 text-warning-foreground',
        danger: 'border-danger/40 bg-danger/20 text-danger-foreground',
        hold: 'border-warning/40 bg-warning/20 text-warning-foreground',
        shipped: 'border-primary/35 bg-primary/20 text-primary-foreground',
        delivered: 'border-success/40 bg-success/20 text-success-foreground',
        cancelled: 'border-danger/40 bg-danger/20 text-danger-foreground',
        outline: 'border-white/20 text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge }
