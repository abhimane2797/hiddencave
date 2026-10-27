import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Gamepad2,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Inputs'
import { Field } from '@/components/ui/Inputs'
import { Card } from '@/components/ui/Card'
import { cx } from '@/lib/utils'
import { useAuth } from '@/store/auth'

const PARTICLE_COUNT = 12

const particleVariants = {
  animate: {
    y: [0, -20, 0],
    x: [0, 15, -15, 0],
    opacity: [0.4, 0.9, 0.4],
    scale: [1, 1.3, 1],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setError('')
    const result = login(username.trim(), password)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-ink-950">
      {/* Animated background layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(59,125,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,125,255,0.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Aurora glows - smaller on mobile */}
        <div className="absolute top-[-15%] left-[-15%] w-[320px] h-[320px] md:w-[480px] md:h-[480px] bg-brand-500/20 rounded-full blur-[100px] md:blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-15%] right-[-15%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-violet-500/15 rounded-full blur-[100px] md:blur-[120px] animate-pulse"
          style={{ animationDelay: '2s' }}
        />
        <div className="absolute top-[35%] left-[55%] w-[240px] h-[240px] md:w-[300px] md:h-[300px] bg-cyan-500/10 rounded-full blur-[80px] md:blur-[100px]" />

        {/* Floating gaming particles */}
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
          const delay = i * 0.4
          const dur = 5 + i * 0.9
          const left = 10 + (i * 37) % 80
          const top = 15 + (i * 53) % 70
          const hue = [220, 260, 190, 280][i % 4]
          const size = 5 + (i % 8)
          return (
            <motion.div
              key={i}
              className="absolute rounded-full blur-sm pointer-events-none"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: `hsla(${hue}, 70%, 60%, 0.55)`,
                boxShadow: `0 0 20px hsla(${hue}, 70%, 60%)`,
              }}
              initial={{ y: 0, x: 0, opacity: 0 }}
              animate={{
                y: [0, -30, 40, -20, 0],
                x: [0, 20, -15, 25, 0],
                opacity: [0, 0.7, 0.5, 0.8, 0],
                rotate: [0, 90, 180, 270, 360],
                transition: {
                  duration: dur,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay,
                },
              }}
            />
          )
        })}
      </div>

      {/* Hero gaming image band */}
      <div className="absolute top-0 left-0 w-full h-[28%] md:h-[32%] z-0 overflow-hidden opacity-60">
        <img
          src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"
          alt="Gaming setup"
          className="w-full h-full object-cover object-center opacity-50 grayscale-[0.35] contrast-125 brightness-90"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
      </div>

      {/* Center card */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full sm:max-w-[420px] md:max-w-[460px]"
        >
          <Card glow={false} className="bg-ink-900/80 backdrop-blur-2xl border border-white/12 p-6 sm:p-8 shadow-card">
            <div className="flex flex-col items-center gap-2 mb-6 sm:mb-8">
              <span className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-brand-500/20 to-violet-500/20 shadow-[0_0_25px_rgba(59,125,255,0.35)]">
                <Gamepad2 size={30} className="text-white drop-shadow-[0_0_12px_rgba(59,125,255,0.6)]" />
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Hidden Cave
              </h1>
              <p className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.2em] text-brand-300">
                Gaming Zone
              </p>
            </div>

            <p className="mb-6 sm:mb-8 text-center text-sm text-slate-400">
              Sign in to manage your gaming zone
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <Field
                label="Username"
                required
                className="relative"
                error={submitted && !username.trim() ? 'Enter your username' : undefined}
              >
                <Input
                  autoComplete="username"
                  autoFocus
                  placeholder="hiddencave"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-left pl-10 text-base sm:text-sm"
                />
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              </Field>

              <Field
                label="Password"
                required
                className="relative"
                error={submitted && !password ? 'Enter your password' : undefined}
              >
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="cave@123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-left pl-10 text-base sm:text-sm"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              </Field>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2.5 text-xs sm:text-sm font-medium text-rose-300">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2 sm:mt-0"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="flex items-center gap-2">
                      Signing in...
                    </span>
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-slate-500">
              <ShieldCheck size={11} className="text-brand-400/60" />
              <span>Demo credentials pre-configured</span>
            </div>
            <p className="mt-3 sm:mt-4 text-center text-[10px] sm:text-[11px] text-slate-600 uppercase tracking-wider">
              Hidden Cave · Rajarampuri, Kolhapur
            </p>
          </Card>

          <div className="mt-4 sm:mt-6 flex flex-col items-center gap-2 text-[10px] sm:text-xs text-slate-500">
            <p>New to Hidden Cave?</p>
            <Link to="/" className="text-brand-300 hover:text-brand-200 underline underline-offset-2 font-medium">
              Visit public gallery
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Decorative bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[480px] h-[240px] md:w-[600px] md:h-[300px] bg-brand-500/10 rounded-full blur-[120px] md:blur-[140px] pointer-events-none" />
    </div>
  )
}
