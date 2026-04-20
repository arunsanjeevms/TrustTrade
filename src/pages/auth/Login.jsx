import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout, AuthCard, InputField, PasswordInput, GradientButton, FormError, TrustSignals } from '@/components/auth'
import { loginUser } from '@/services/auth'

const MotionDiv = motion.div

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getErrors(form) {
  const errors = {}

  if (!emailRegex.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  return errors
}

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const errors = useMemo(() => getErrors(form), [form])
  const isValid = Object.keys(errors).length === 0

  const showError = (field) => (touched[field] || submitted ? errors[field] : undefined)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setSubmitError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitted(true)
    setSubmitError('')

    if (!isValid) {
      return
    }

    setIsSubmitting(true)
    try {
      await loginUser({
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to sign in right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <MotionDiv className="auth-login-flow w-full" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}>
        <AuthCard
          title="Welcome back"
          description="Sign in to manage secure trades, escrow flow, and real-time room updates."
          footer={
            <p className="text-center text-sm text-slate-400">
              Don&apos;t have an account?{' '}
              <Link to="/auth/register" className="font-semibold text-indigo-300 transition-colors hover:text-indigo-200">
                Register
              </Link>
            </p>
          }
        >
          <form className="auth-login-form space-y-4 lg:space-y-5" onSubmit={handleSubmit} noValidate>
            <InputField
              id="email"
              label="Email"
              type="email"
              icon={Mail}
              autoComplete="email"
              placeholder="you@trusttrade.app"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, email: true }))}
              error={showError('email')}
            />

            <PasswordInput
              id="password"
              label="Password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              error={showError('password')}
            />

            <div className="-mt-1 flex justify-end pr-0.5">
              <Link to="/auth/login" className="text-xs font-medium text-indigo-300 transition-colors hover:text-indigo-200">
                Forgot password?
              </Link>
            </div>

            <GradientButton
              type="submit"
              disabled={!isValid || isSubmitting}
              isLoading={isSubmitting}
              loadingLabel="Signing in..."
              className="gap-2"
            >
              <span className="inline-flex items-center gap-2">
                Login
                <ArrowRight className="h-4 w-4" />
              </span>
            </GradientButton>

            <FormError message={submitError} />
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-[0.14em] text-slate-500">
                <span className="bg-slate-950/65 px-3">OR CONTINUE WITH</span>
              </div>
            </div>

            <div className="mt-3">
              <GradientButton variant="ghost" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Google
              </GradientButton>
            </div>
          </div>

          <TrustSignals />
        </AuthCard>
      </MotionDiv>
    </AuthLayout>
  )
}
