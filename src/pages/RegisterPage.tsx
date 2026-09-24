import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, X } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'


const PAPER = 'bg-[#FAF8FB] dark:bg-[#1B1023]'
const INK = 'text-[#2A1A3D] dark:text-[#EEE6F4]'
const INK_SOFT = 'text-[#6B5C7A] dark:text-[#93839F]'
const LINE = 'border-[#E0D7E7] dark:border-[#332140]'
const ACCENT = '#7C2AE8'
const ACCENT_TEXT = 'text-[#7C2AE8] dark:text-[#A868F0]'
const ERROR = 'text-[#B23A5C] dark:text-[#D9628C]'
const ACCENT_BG = 'bg-[#F1E9F5] dark:bg-[#2A1938]'
const ERROR_BORDER = 'border-[#B23A5C] focus:border-[#B23A5C] dark:border-[#D9628C] dark:focus:border-[#D9628C]'

const inputBase = `mt-1.5 block w-full rounded-sm border-2 bg-[#FAF8FB] px-3 py-2 text-sm text-[#2A1A3D] transition-colors placeholder:text-[#93839F] focus:outline-none focus:border-[#7C2AE8] disabled:cursor-not-allowed disabled:bg-[#F3EEF6] disabled:text-[#93839F] dark:bg-[#1B1023] dark:text-[#EEE6F4] dark:focus:border-[#A868F0] dark:disabled:bg-[#170D1F]`

export function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [interestsInput, setInterestsInput] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  const addInterest = () => {
    const trimmed = interestsInput.trim()
    if (trimmed && !interests.includes(trimmed) && interests.length < 10) {
      setInterests([...interests, trimmed])
    }
    setInterestsInput('')
  }

  const removeInterest = (idx: number) => {
    setInterests(interests.filter((_, i) => i !== idx))
  }

  const handleInterestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addInterest()
    }
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Name is required'
    if (!email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = 'Enter a valid email address'
    if (!password) next.password = 'Password is required'
    else if (password.length < 6)
      next.password = 'Password must be at least 6 characters'
    if (!confirmPassword) next.confirmPassword = 'Please confirm your password'
    else if (confirmPassword !== password)
      next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await register(name.trim(), email.trim(), password, interests)
    //   toast('Account created successfully!', 'success')
      navigate('/')
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Registration failed. Please try again.'
    //   toast(msg, 'error')
      setErrors((prev) => ({ ...prev, form: msg }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  return (
    <div className={`min-h-screen ${PAPER} flex items-center justify-center px-4 py-12`}>
      <div className="w-full max-w-md">
        <div className="text-center">
          <span
            className="inline-flex h-12 w-12 items-center justify-center border-2 text-sm font-bold leading-none tracking-[-0.02em]"
            style={{ borderColor: ACCENT, color: ACCENT }}
          >
            TM
          </span>
          <h1 className={`mt-5 text-2xl font-bold tracking-[-0.02em] ${INK}`}>
            Create account
          </h1>
          <p className={`mt-1 font-mono text-[12px] tracking-wide ${INK_SOFT}`}>
            sign up to start managing your projects
          </p>
        </div>

        <div className={`mt-8 rounded-sm border-2 ${LINE} ${PAPER} p-6 shadow-lg`}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-5">
              <div>
                <label
                  htmlFor="name"
                  className={`block text-sm font-medium ${INK}`}
                >
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    clearError('name')
                  }}
                  disabled={isSubmitting}
                  className={`${inputBase} ${errors.name ? ERROR_BORDER : LINE}`}
                  placeholder="Jane Doe"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p
                    id="name-error"
                    className={`mt-1.5 font-mono text-[12px] tracking-wide ${ERROR}`}
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium ${INK}`}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearError('email')
                  }}
                  disabled={isSubmitting}
                  className={`${inputBase} ${errors.email ? ERROR_BORDER : LINE}`}
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className={`mt-1.5 font-mono text-[12px] tracking-wide ${ERROR}`}
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className={`block text-sm font-medium ${INK}`}
                  >
                    Password
                  </label>
                  {errors.password && (
                    <p
                      id="password-error"
                      className={`font-mono text-[12px] tracking-wide ${ERROR}`}
                    >
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      clearError('password')
                    }}
                    disabled={isSubmitting}
                    className={`${inputBase} pr-10 ${errors.password ? ERROR_BORDER : LINE}`}
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    aria-describedby="password-error"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 ${INK_SOFT} hover:${INK}`}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className={`mt-1 font-mono text-[11px] tracking-wide ${INK_SOFT}`}>
                  at least 6 characters
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="confirm-password"
                    className={`block text-sm font-medium ${INK}`}
                  >
                    Confirm password
                  </label>
                  {errors.confirmPassword && (
                    <p
                      id="confirm-error"
                      className={`font-mono text-[12px] tracking-wide ${ERROR}`}
                    >
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
                <div className="relative mt-1.5">
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      clearError('confirmPassword')
                    }}
                    disabled={isSubmitting}
                    className={`${inputBase} pr-10 ${errors.confirmPassword ? ERROR_BORDER : LINE}`}
                    placeholder="••••••••"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby="confirm-error"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 ${INK_SOFT} hover:${INK}`}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="interests"
                  className={`block text-sm font-medium ${INK}`}
                >
                  Interests <span className={`text-xs ${INK_SOFT}`}>(optional)</span>
                </label>
                <div
                  className={`mt-1.5 flex flex-wrap items-center gap-1.5 rounded-sm border-2 ${LINE} ${ACCENT_BG} min-h-[42px] p-2`}
                >
                  {interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[11px] font-medium tracking-wide ${ACCENT_TEXT}`}
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(idx)}
                        className={`rounded p-0.5 hover:${INK}`}
                        aria-label={`Remove ${interest}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    id="interests"
                    type="text"
                    value={interestsInput}
                    onChange={(e) => setInterestsInput(e.target.value)}
                    onKeyDown={handleInterestKeyDown}
                    onBlur={addInterest}
                    disabled={isSubmitting || interests.length >= 10}
                    className="flex-1 border-0 bg-transparent px-1 text-sm text-[#2A1A3D] outline-none placeholder:text-[#93839F] dark:text-[#EEE6F4] dark:placeholder:text-[#93839F]"
                    placeholder={
                      interests.length >= 10
                        ? 'max reached'
                        : interests.length === 0
                          ? 'Type and press enter to add…'
                          : 'Add more…'
                    }
                  />
                </div>
                <p className={`mt-1 font-mono text-[11px] tracking-wide ${INK_SOFT}`}>
                  separate interests with commas or press Enter
                </p>
              </div>
            </div>

            {errors.form && (
              <div className="mt-3 rounded-sm border-2 border-[#B23A5C] bg-[#FBEFF2] px-3 py-2 dark:border-[#D9628C] dark:bg-[#2A1420]">
                <p className={`font-mono text-[12px] tracking-wide ${ERROR}`}>
                  {errors.form}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-sm border-2 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#6B22C9] hover:bg-[#6B22C9] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ borderColor: ACCENT, backgroundColor: ACCENT }}
            >
              {isSubmitting && <Loader2 className="-ml-1 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className={`mt-5 flex items-center justify-between border-t-2 ${LINE} pt-4`}>
            <span className={`font-mono text-[11px] tracking-wide ${INK_SOFT}`}>
              already have an account?
            </span>
            <Link
              to="/login"
              className={`inline-flex items-center gap-1 font-mono text-[11px] font-medium tracking-wide hover:underline ${ACCENT_TEXT}`}
            >
              Sign in
            </Link>
          </div>
        </div>

        <p className={`mt-5 text-center font-mono text-[11px] tracking-wide ${INK_SOFT}`}>
          by continuing, you agree to the{' '}
          <span className={ACCENT_TEXT}>terms of service</span> and{' '}
          <span className={ACCENT_TEXT}>privacy policy</span>
        </p>
      </div>
    </div>
  )
}
