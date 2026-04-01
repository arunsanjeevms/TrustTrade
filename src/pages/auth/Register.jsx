import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Mail, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout, AuthCard, InputField, PasswordInput, GradientButton, FormError, TrustSignals } from '@/components/auth'

const MotionDiv = motion.div

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getErrors(form) {
  const errors = {}

  if (form.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.'
  }

  if (!emailRegex.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  if (!form.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms to continue.'
  }

  return errors
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const errors = useMemo(() => getErrors(form), [form])
  const isValid = Object.keys(errors).length === 0

  const showError = (field) => (touched[field] || submitted ? errors[field] : undefined)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)

    if (!isValid) {
      return
    }

    setIsSubmitting(true)
    window.setTimeout(() => {
      navigate('/auth/login')
    }, 650)
  }

  return (
    <AuthLayout>
      <MotionDiv className="auth-register-flow w-full" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}>
        <AuthCard
          title="Create your account"
          description="Set up your Trust Trade profile and start secure, escrow-protected trading."
          footer={
            <p className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/auth/login" className="font-semibold text-indigo-300 transition-colors hover:text-indigo-200">
                Login
              </Link>
            </p>
          }
        >
          <form className="auth-register-form space-y-4 lg:space-y-5" onSubmit={handleSubmit} noValidate>
            <InputField
              id="fullName"
              label="Full Name"
              icon={User}
              autoComplete="name"
              placeholder="Ari Johnson"
              value={form.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, fullName: true }))}
              error={showError('fullName')}
            />

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

            <div>
              <PasswordInput
                id="password"
                label="Password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                error={showError('password')}
                showStrength
              />
            </div>

            <PasswordInput
              id="confirmPassword"
              label="Confirm Password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
              error={showError('confirmPassword')}
            />

            <div>
              <label className="auth-register-terms group flex cursor-pointer items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-slate-300 transition-all duration-300 hover:border-indigo-300/30 hover:bg-white/10">
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={(event) => updateField('acceptTerms', event.target.checked)}
                  onBlur={() => setTouched((current) => ({ ...current, acceptTerms: true }))}
                  className="peer sr-only"
                />
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border border-white/25 bg-slate-900 text-white transition-all duration-200 peer-checked:scale-105 peer-checked:border-indigo-300 peer-checked:bg-indigo-500">
                  <Check className="h-3 w-3 scale-0 opacity-0 transition-all duration-200 peer-checked:scale-100 peer-checked:opacity-100" />
                </span>
                <span className="leading-5">
                  I agree to the Terms of Service and Privacy Policy.
                </span>
              </label>
              <FormError message={showError('acceptTerms')} />
            </div>

            <GradientButton
              type="submit"
              disabled={!isValid || isSubmitting}
              isLoading={isSubmitting}
              loadingLabel="Creating account..."
              className="gap-2"
            >
              <span className="inline-flex items-center gap-2">
                Create Account
                <ArrowRight className="h-4 w-4" />
              </span>
            </GradientButton>
          </form>

          <TrustSignals />
        </AuthCard>
      </MotionDiv>
    </AuthLayout>
  )
}
