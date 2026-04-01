import { motion } from 'framer-motion'
import StatusBadge from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'

const MotionDiv = motion.div

const progressByStatus = {
  HOLD: 25,
  SHIPPED: 55,
  DELIVERED: 85,
  COMPLETED: 100,
  CANCELLED: 100,
}

const toneByStatus = {
  HOLD: 'bg-warning',
  SHIPPED: 'bg-primary',
  DELIVERED: 'bg-success',
  COMPLETED: 'bg-success',
  CANCELLED: 'bg-danger',
}

export default function TradeStatusVisual({ status }) {
  const progress = progressByStatus[status] ?? 0
  const tone = toneByStatus[status] ?? 'bg-primary'

  return (
    <div className="min-w-[140px] space-y-1.5">
      <StatusBadge status={status} />
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <MotionDiv
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn('h-full rounded-full', tone)}
        />
      </div>
    </div>
  )
}
