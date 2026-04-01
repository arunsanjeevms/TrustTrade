import { motion } from 'framer-motion'
import { User, Shield, RefreshCw } from 'lucide-react'

const MotionLi = motion.li

const iconByType = {
  buyer: <User className="h-5 w-5 text-emerald-400" />,
  seller: <Shield className="h-5 w-5 text-indigo-400" />,
  system: <RefreshCw className="h-5 w-5 text-slate-400" />,
}

export default function Timeline({ events }) {
  return (
    <ol className="relative border-l-2 border-indigo-400/20 pl-6">
      {events.map((event, idx) => (
        <MotionLi
          key={event.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.08, duration: 0.4 }}
          className="mb-8 flex items-start gap-4"
        >
          <span className="absolute -left-7 flex items-center justify-center h-8 w-8 rounded-full bg-slate-900 border-2 border-indigo-400/30">
            {iconByType[event.type]}
          </span>
          <div>
            <div className="font-semibold text-slate-100 text-sm">{event.title}</div>
            <div className="text-xs text-slate-400">{event.description}</div>
            <div className="text-xs text-slate-500 mt-1">{event.time}</div>
          </div>
        </MotionLi>
      ))}
    </ol>
  )
}
