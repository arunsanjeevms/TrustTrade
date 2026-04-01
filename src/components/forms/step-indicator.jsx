import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        {steps.map((step, index) => {
          const stepIndex = index + 1
          const isCompleted = stepIndex < currentStep
          const isCurrent = stepIndex === currentStep

          return (
            <div key={step.id} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-2xl border text-sm font-semibold transition-all duration-300 ease-in-out',
                  isCompleted && 'border-success/40 bg-success/20 text-success-foreground',
                  isCurrent && 'border-primary/50 bg-brand-gradient text-white shadow-glow',
                  !isCompleted && !isCurrent && 'border-white/10 bg-white/5 text-muted-foreground',
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepIndex}
              </div>

              <div className="min-w-0">
                <p
                  className={cn(
                    'truncate text-sm font-medium',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.title}
                </p>
              </div>

              {index < steps.length - 1 ? (
                <div className="mx-1 hidden h-px flex-1 bg-white/10 md:block" />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
