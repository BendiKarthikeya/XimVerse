'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'login' | 'signup'>(
    searchParams.get('tab') === 'signup' ? 'signup' : 'login'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleAuth() {
    setLoading(true)
    setError('')
    try {
      if (tab === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: firstName, last_name: lastName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        router.push('/onboarding')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard/upload')
      }
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  function handleDemo() {
    document.cookie = 'ximverse-demo=true; path=/; max-age=86400'
    router.push('/dashboard/profile?demo=true')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0f172a' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div style={{ width: 500, height: 500, background: 'radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)', borderRadius: '50%' }} />
        </div>
        <div className="relative z-10">
          <div className="bg-white rounded-lg px-2 py-0.5 inline-block">
            <img src="/logo.png" alt="XimVerse" className="h-12 w-20" />
          </div>
        </div>
        <div className="space-y-6 relative z-10">
          <div>
            <h2 className="text-3xl font-black leading-tight text-white mb-3">
              Export docs in<br /><span className="text-indigo-400">2 minutes flat.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload → OCR → Fill → Download. The fastest way to generate compliant export documentation.
            </p>
          </div>
          <div className="space-y-3">
            {['Commercial Invoice auto-generated', 'Packing List auto-generated', 'OCR-powered data extraction', 'Full consignment history saved'].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(34,197,94,0.2)' }}>
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-700 relative z-10">© 2026 XIMVERSE</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8 fade-in">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>

          <div>
            <div className="mb-6">
              <div className="bg-white rounded-lg px-2 py-0.5 inline-block">
                <img src="/logo.png" alt="XimVerse" className="h-10 w-20" />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
              {(['login', 'signup'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                  style={tab === t
                    ? { background: 'rgba(99,102,241,0.3)', color: '#fff', border: '1px solid rgba(99,102,241,0.5)' }
                    : { color: '#64748b', border: '1px solid transparent' }}>
                  {t === 'login' ? 'Log In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {tab === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">First Name</label>
                      <input type="text" placeholder="Ashutosh" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">Last Name</label>
                      <input type="text" placeholder="Rai" value={lastName} onChange={e => setLastName(e.target.value)} />
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Email address</label>
                <input type="email" placeholder="export@yourcompany.com" value={email} onChange={e => setEmail(e.target.value)} suppressHydrationWarning />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAuth()} />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button onClick={handleAuth} disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {loading ? 'Please wait…' : tab === 'login' ? 'Log In' : 'Create Account'}
              </button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-600">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <button onClick={handleDemo}
                className="w-full py-3 rounded-xl border text-sm text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                ⚡ Continue as Demo User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}
