import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const MotionDiv = motion.div

export default function StatusProgressTracker({ statuses, currentStatus }) {
  const currentIndex = Math.max(statuses.indexOf(currentStatus), 0)
  const progress = statuses.length > 1 ? (currentIndex / (statuses.length - 1)) * 100 : 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>Workflow</span>
        <span>
          Step {currentIndex + 1}/{statuses.length}
        </span>
      </div>

      <div className="px-4">
        <div className="relative h-px bg-white/10">
          <MotionDiv
            className="absolute left-0 top-0 h-px bg-brand-gradient"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {statuses.map((status, index) => {
          const completed = index < currentIndex
          const current = index === currentIndex

          return (
            <div key={status} className="space-y-2 text-center">
              <div
                className={cn(
                  'mx-auto grid h-8 w-8 place-items-center rounded-2xl border text-xs font-semibold transition-all duration-300 ease-in-out',
                  completed && 'border-success/40 bg-success/20 text-success-foreground',
                  current && 'border-primary/50 bg-brand-gradient text-white shadow-glow',
                  !completed && !current && 'border-white/10 bg-white/5 text-muted-foreground',
                )}
              >
                {completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </div>
              <p className={cn('text-[11px] font-medium', current ? 'text-foreground' : 'text-muted-foreground')}>
                {status}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
