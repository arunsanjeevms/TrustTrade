import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import FormError from '@/components/auth/form-error'
import { cn } from '@/lib/utils'

const MotionDiv = motion.div

function getPasswordStrength(password) {
  if (!password) {
    return { label: 'Weak', tone: 'bg-rose-400', width: 0 }
  }

  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 1) {
    return { label: 'Weak', tone: 'bg-rose-400', width: 34 }
  }

  if (score === 2) {
    return { label: 'Medium', tone: 'bg-amber-400', width: 68 }
  }

  return { label: 'Strong', tone: 'bg-emerald-400', width: 100 }
}

export default function PasswordInput({
  id,
  label,
  error,
  className,
  inputClassName,
  showStrength = false,
  ...props
}) {
  const [visible, setVisible] = useState(false)
  const passwordValue = typeof props.value === 'string' ? props.value : ''
  const strength = useMemo(() => getPasswordStrength(passwordValue), [passwordValue])

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id} className="text-sm text-slate-300">
        {label}
      </Label>
      <div className="group/input relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 z-[2] flex items-center text-slate-500 transition-colors duration-300 group-focus-within/input:text-indigo-300">
          <Lock className="h-4 w-4" />
        </span>
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          className={cn(
            'auth-input-control relative z-[1] h-12 rounded-2xl border-white/10 bg-slate-950/50 pl-10 pr-11 text-slate-100 placeholder:text-slate-500 transition-transform duration-200 group-focus-within/input:scale-[1.01] focus-visible:border-indigo-300/35 focus-visible:ring-2 focus-visible:ring-indigo-500/40',
            inputClassName,
          )}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-2 z-[2] my-auto inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={visible ? 'hide' : 'show'}
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.82 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </motion.span>
          </AnimatePresence>
        </button>
        <span className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent transition-all duration-300 group-focus-within/input:border-indigo-300/35 group-focus-within/input:shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_0_20px_rgba(99,102,241,0.2)]" />
      </div>
      <FormError message={error} />

      {showStrength ? (
        <div className="pt-1">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
            <span>Password strength</span>
            <span className="font-semibold text-slate-300">{strength.label}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <MotionDiv
              initial={false}
              animate={{ width: `${strength.width}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={cn('h-full rounded-full', strength.tone)}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
