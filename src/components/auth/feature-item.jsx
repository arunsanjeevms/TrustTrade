import { motion } from 'framer-motion'

const MotionDiv = motion.div

export default function FeatureItem({ icon, title, description, delay = 0 }) {
  const ItemIcon = icon

  return (
    <MotionDiv
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="auth-feature-item group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-300 hover:border-indigo-300/30 hover:shadow-[0_0_24px_rgba(99,102,241,0.18)]"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/8 to-violet-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start gap-3">
        <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-full border border-indigo-300/30 bg-indigo-500/12 text-indigo-200">
          <ItemIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-100">{title}</p>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
      </div>
    </MotionDiv>
  )
}
