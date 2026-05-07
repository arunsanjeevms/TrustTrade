import { motion } from 'framer-motion'
import StatusBadge from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'

const MotionDiv = motion.div

const progressByStatus = {
  PENDING_JOIN: 10,
  HOLD: 25,
  SHIPPED: 55,
  DELIVERED: 85,
  COMPLETED: 100,
  CANCELLED: 100,
  DISPUTED: 80,
}

const toneByStatus = {
  PENDING_JOIN: 'bg-slate-400',
  HOLD: 'bg-warning',
  SHIPPED: 'bg-primary',
  DELIVERED: 'bg-success',
  COMPLETED: 'bg-success',
  CANCELLED: 'bg-danger',
  DISPUTED: 'bg-danger',
}

export default function TradeStatusVisual({ status, roomClosed }) {
  const progress = progressByStatus[status] ?? 0
  const tone = toneByStatus[status] ?? 'bg-primary'

  return (
    <div className="min-w-[140px] space-y-1.5 flex flex-col items-start">
      <div className="flex gap-2 items-center">
        <StatusBadge status={status} />
        {roomClosed ? (
          <span className="text-[10px] font-bold tracking-wider rounded-sm bg-slate-800 text-slate-300 px-1.5 py-0.5 uppercase border border-slate-700">Closed</span>
        ) : null}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
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
