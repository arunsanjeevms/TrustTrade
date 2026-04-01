import { motion } from 'framer-motion'
import { Activity, FileCheck2, LockKeyhole, ShieldCheck } from 'lucide-react'
import FeatureItem from '@/components/auth/feature-item'

const MotionDiv = motion.div
const MotionSection = motion.section

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: 'Escrow Protection',
    description: 'Funds stay protected until delivery is confirmed.',
  },
  {
    icon: Activity,
    title: 'Live Tracking',
    description: 'Track milestones from payment to release in real time.',
  },
  {
    icon: FileCheck2,
    title: 'Dispute-Ready Records',
    description: 'Evidence logs stay organized for fair resolution.',
  },
]

export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-[100dvh] overflow-hidden bg-slate-950 text-slate-100">
      <MotionDiv
        className="absolute inset-0 bg-[linear-gradient(125deg,#020617_0%,#1e1b4b_36%,#312e81_62%,#1d4ed8_100%)]"
        style={{ backgroundSize: '180% 180%' }}
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:radial-gradient(rgba(255,255,255,0.9)_0.55px,transparent_0.55px)] [background-size:3px_3px]" />
      <MotionDiv
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl"
        animate={{ y: [0, 24, 0], opacity: [0.34, 0.56, 0.34] }}
        transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <MotionDiv
        className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl"
        animate={{ y: [0, -18, 0], x: [0, -14, 0], opacity: [0.28, 0.5, 0.28] }}
        transition={{ duration: 8.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <MotionDiv
        className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.24, 0.45, 0.24] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 grid min-h-[100dvh] w-full grid-cols-1 overflow-y-auto lg:h-[100dvh] lg:grid-cols-2 lg:overflow-hidden">
        <MotionSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: 'easeOut' }}
          className="relative h-full overflow-hidden border-b border-white/10 px-4 py-5 sm:px-6 sm:py-6 lg:border-b-0 lg:border-r lg:px-8 lg:py-6"
        >
          <div className="auth-left-shell relative z-10 flex h-full max-h-[92dvh] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_rgba(2,6,23,0.35)] backdrop-blur-2xl sm:p-5 lg:p-6">
            <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[linear-gradient(140deg,rgba(129,140,248,0.18),rgba(255,255,255,0)_42%,rgba(59,130,246,0.14))]" />
            <div className="pointer-events-none absolute inset-[1px] rounded-[27px] border border-white/8" />
            <div className="pointer-events-none absolute -top-20 right-8 h-40 w-64 rounded-full bg-indigo-200/12 blur-3xl" />

            <div className="relative space-y-4">
              <div className="relative inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-900/55 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/70 to-violet-500/70 text-white shadow-[0_0_24px_rgba(99,102,241,0.45)]">
                  <LockKeyhole className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-200/90">Fintech Escrow Suite</p>
                  <p className="bg-gradient-to-r from-indigo-200 via-violet-200 to-blue-200 bg-clip-text text-base font-bold text-transparent">Trust Trade</p>
                </div>
              </div>

              <h2 className="auth-left-heading max-w-lg text-2xl font-semibold leading-tight sm:text-3xl">
                <span className="bg-gradient-to-r from-indigo-200 via-violet-200 to-blue-200 bg-clip-text text-transparent">
                  Secure. Transparent. Trusted Trading.
                </span>
              </h2>

              <p className="auth-left-description max-w-md text-sm text-slate-300">
                High-trust peer trading with escrow safeguards and transparent transaction visibility.
              </p>
            </div>

            <div className="auth-left-features relative mt-4 hidden gap-2.5 lg:grid">
              {trustFeatures.map((feature, index) => (
                <FeatureItem
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={0.16 + index * 0.08}
                />
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.06 }}
          className="auth-right-panel relative flex h-full items-center justify-center overflow-hidden px-4 py-6 sm:px-6 sm:py-6 lg:px-8 lg:py-6"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.2),transparent_58%)]" />
          <div className="flex h-full w-full items-center justify-center">
            <div className="auth-form-shell w-full max-w-md max-h-[92dvh] overflow-hidden">
              {children}
            </div>
          </div>
        </MotionSection>
      </div>
    </div>
  )
}
