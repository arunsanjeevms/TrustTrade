import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const MotionButton = motion.button

const variantClasses = {
  primary:
    'text-white bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_100%)] shadow-[0_10px_35px_rgba(79,70,229,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]',
  ghost:
    'border border-white/15 bg-white/5 text-slate-200 hover:border-indigo-300/45 hover:bg-white/10 hover:text-white hover:shadow-[0_0_18px_rgba(99,102,241,0.2)]',
}

export default function GradientButton({
  className,
  variant = 'primary',
  type = 'button',
  isLoading = false,
  loadingLabel,
  children,
  disabled,
  ...props
}) {
  return (
    <MotionButton
      type={type}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex h-12 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-55',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel || 'Please wait...'}
        </span>
      ) : (
        children
      )}
    </MotionButton>
  )
}
