import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-transparent text-sm font-semibold transition-all duration-300 ease-in-out ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-brand-gradient text-white shadow-glow hover:-translate-y-0.5 hover:brightness-110',
        primary: 'bg-brand-gradient text-white shadow-glow hover:-translate-y-0.5 hover:brightness-110',
        secondary: 'border-white/10 bg-white/5 text-foreground hover:-translate-y-0.5 hover:bg-white/10',
        outline: 'border-white/10 bg-white/5 text-foreground hover:-translate-y-0.5 hover:bg-white/10',
        ghost: 'text-muted-foreground hover:-translate-y-0.5 hover:bg-white/10 hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        destructive: 'bg-danger text-danger-foreground shadow-lg shadow-red-950/30 hover:-translate-y-0.5',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button }
