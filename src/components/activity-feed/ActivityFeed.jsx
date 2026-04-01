import { motion } from 'framer-motion'
import { RefreshCw, Mail, AlertTriangle } from 'lucide-react'

const MotionLi = motion.li

const iconByType = {
  trade: <RefreshCw className="h-5 w-5 text-indigo-400" />,
  message: <Mail className="h-5 w-5 text-emerald-400" />,
  system: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
}

export default function ActivityFeed({ events }) {
  return (
    <ul className="divide-y divide-white/10 bg-slate-900/60 rounded-2xl border border-white/10">
      {events.map((event, idx) => (
        <MotionLi
          key={event.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.07, duration: 0.35 }}
          className="flex items-center gap-3 p-4"
        >
          {iconByType[event.type]}
          <div className="flex-1">
            <div className="font-medium text-slate-100 text-sm">{event.title}</div>
            <div className="text-xs text-slate-400">{event.body}</div>
            <div className="text-xs text-slate-500 mt-1">{event.time}</div>
          </div>
        </MotionLi>
      ))}
    </ul>
  )
}
