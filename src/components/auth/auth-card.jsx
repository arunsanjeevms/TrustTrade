import { motion } from 'framer-motion'

const MotionCard = motion.article

export default function AuthCard({ title, description, children, footer }) {
  return (
    <MotionCard
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      whileHover={{ y: -2 }}
      className="auth-card-shell group relative w-full max-w-md max-h-[92dvh] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-[0_24px_64px_rgba(2,6,23,0.52),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:p-5"
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(140deg,rgba(129,140,248,0.2),rgba(255,255,255,0)_42%,rgba(59,130,246,0.12))]" />
      <div className="pointer-events-none absolute inset-[1px] rounded-2xl border border-white/10" />
      <div className="pointer-events-none absolute -top-28 left-8 h-40 w-64 rounded-full bg-indigo-300/14 blur-3xl transition-opacity duration-500 group-hover:opacity-90" />

      <div className="relative z-10">
        <header className="auth-card-header">
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </header>

        <div className="auth-card-stack mt-4 space-y-4">{children}</div>

        {footer ? <footer className="auth-card-footer mt-3">{footer}</footer> : null}
      </div>
    </MotionCard>
  )
}
