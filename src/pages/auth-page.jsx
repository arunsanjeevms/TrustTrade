import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const MotionSection = motion.section

const highlights = [
  'Escrow-locked payments to prevent fraud.',
  'Real-time delivery and status verification.',
  'Audit-friendly trade logs for every room.',
]

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const isRegister = mode === 'register'

  const validate = () => {
    const nextErrors = {}

    if (isRegister && form.name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters.'
    }

    if (!form.email.includes('@')) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = (event) => {
    event.preventDefault()
    if (!validate()) {
      return
    }
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <MotionSection
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative hidden overflow-hidden border-r border-white/10 lg:flex"
      >
        <div className="absolute inset-0 bg-mesh-radial opacity-95" />
        <div className="relative z-10 m-8 flex w-full flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/45 p-10 backdrop-blur-2xl">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trust Trade
            </div>
            <h1 className="mt-6 max-w-lg text-balance text-4xl font-bold text-white xl:text-5xl">
              Trade high-value products with confidence.
            </h1>
            <p className="mt-4 max-w-xl text-slate-300">
              Built for modern peer-to-peer commerce with secure escrow, shipment proof, and room-based workflows.
            </p>
          </div>

          <div className="space-y-4">
            {highlights.map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
              >
                <Sparkles className="mt-0.5 h-4 w-4 text-indigo-300" />
                <p className="text-sm text-slate-200">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut', delay: 0.04 }}
        className="flex items-center justify-center px-4 py-10"
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{isRegister ? 'Create your account' : 'Welcome back'}</CardTitle>
            <CardDescription>
              {isRegister ? 'Start trading in secure, escrow-backed rooms.' : 'Sign in to continue managing your trades.'}
            </CardDescription>

            <div className="mt-4 grid grid-cols-2 rounded-lg bg-slate-900/70 p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={cn(
                  'rounded-2xl px-3 py-2 text-sm font-semibold transition-all duration-300 ease-in-out',
                  !isRegister ? 'bg-indigo-500/20 text-indigo-100' : 'text-slate-400 hover:text-slate-200',
                )}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={cn(
                  'rounded-2xl px-3 py-2 text-sm font-semibold transition-all duration-300 ease-in-out',
                  isRegister ? 'bg-indigo-500/20 text-indigo-100' : 'text-slate-400 hover:text-slate-200',
                )}
              >
                Register
              </button>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              {isRegister ? (
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    placeholder="Ari Johnson"
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                  />
                  {errors.name ? <p className="text-xs text-red-300">{errors.name}</p> : null}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@trusttrade.app"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                />
                {errors.email ? <p className="text-xs text-red-300">{errors.email}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter secure password"
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                />
                {errors.password ? <p className="text-xs text-red-300">{errors.password}</p> : null}
              </div>

              <Button type="submit" className="w-full">
                {isRegister ? 'Create Account' : 'Sign In'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/65 p-4 text-sm text-slate-300">
              <div className="mb-2 flex items-center gap-2 text-slate-200">
                <LockKeyhole className="h-4 w-4 text-indigo-300" />
                Secure by design
              </div>
              <p>All trade operations are escrow-protected and linked to verifiable user identities.</p>
            </div>

            <p className="mt-5 text-center text-sm text-slate-400">
              Continue as guest?{' '}
              <Link to="/" className="font-semibold text-indigo-300 hover:text-indigo-200">
                View dashboard
              </Link>
            </p>
          </CardContent>
        </Card>
      </MotionSection>
    </div>
  )
}
