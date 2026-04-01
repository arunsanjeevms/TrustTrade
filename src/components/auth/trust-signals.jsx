import { motion } from 'framer-motion'
import { CheckCircle2, LockKeyhole, Shield } from 'lucide-react'

const MotionDiv = motion.div

const signals = [
  {
    id: 'encrypted',
    icon: Shield,
    label: 'Secure encrypted data',
  },
  {
    id: 'kyc',
    icon: CheckCircle2,
    label: 'Verified trading users',
  },
  {
    id: 'escrow',
    icon: LockKeyhole,
    label: 'Escrow protection enabled',
  },
]

export default function TrustSignals() {
  return (
    <div className="auth-trust-signals mt-3 border-t border-white/10 pt-3">
      <div className="flex flex-wrap gap-2">
        {signals.map((item, index) => {
          const Icon = item.icon

          return (
            <MotionDiv
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + index * 0.06, duration: 0.25 }}
              className="auth-signal-item inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] leading-tight text-slate-300/95"
            >
              <span className="grid h-5 w-5 place-items-center rounded-md border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                <Icon className="h-3 w-3" />
              </span>
              <span>{item.label}</span>
            </MotionDiv>
          )
        })}
      </div>
    </div>
  )
}
