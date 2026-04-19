'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

const STEPS = ['Company Details', 'Export & Compliance', 'Bank Details']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      setProfile(p => ({ ...p, email: data.user!.email ?? '' }))
    })
  }, [router])

  function set(key: keyof Profile, value: string) {
    setProfile(p => ({ ...p, [key]: value }))
  }

  function field(label: string, key: keyof Profile, placeholder = '', type = 'text') {
    return (
      <div key={key}>
        <label className="text-xs text-slate-400 mb-1.5 block">{label}</label>
        <input
          type={type}
          placeholder={placeholder}
          value={(profile[key] as string) ?? ''}
          onChange={e => set(key, e.target.value)}
        />
      </div>
    )
  }

  async function finish() {
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error: err } = await supabase.from('profiles').upsert({ ...profile, user_id: user.id })
      if (err) throw err
      router.push('/dashboard/upload')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save profile')
      setSaving(false)
    }
  }

  const steps = [
    /* Step 0 — Company Details */
    <div key={0} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {field('Company Name', 'company_name', 'XIMVERSE EXPORTS PVT LTD')}
        {field('Phone', 'phone', '+91-9876543210')}
      </div>
      {field('Email', 'email', 'export@yourcompany.com', 'email')}
      {field('Registered Address', 'address', '#45, Whitefield Industrial Area, Bengaluru, Karnataka – 560066')}
    </div>,

    /* Step 1 — Export & Compliance */
    <div key={1} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {field('IEC Code', 'iec', 'XIMV1234567')}
        {field('GSTIN', 'gstin', '29ABCDE1234F1Z5')}
        {field('PAN', 'pan', 'ABCDE1234F')}
        {field('TAN', 'tan', 'BLRA12345B')}
        {field('Export Commodity', 'export_commodity', 'Basmati Rice 1121 Steam')}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {field('Authorised Signatory', 'signatory_name', 'Ashutosh Rai')}
        {field('Designation', 'signatory_designation', 'Export Manager')}
      </div>
    </div>,

    /* Step 2 — Bank Details */
    <div key={2} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {field('Bank Name', 'bank_name', 'HDFC Bank Ltd')}
        {field('Branch', 'bank_branch', 'Whitefield Branch')}
        {field('Account No.', 'bank_account', '50200012345678')}
        {field('IFSC Code', 'bank_ifsc', 'HDFC0001234')}
        {field('SWIFT Code', 'bank_swift', 'HDFCINBBXXX')}
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)' }}>
      <div className="w-full max-w-xl space-y-8 fade-in">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-block bg-white rounded-lg px-2 py-0.5 mb-4">
            <img src="/logo.png" alt="XimVerse" className="h-10 w-20" />
          </div>
          <h1 className="text-2xl font-black text-white">Set up your Company Profile</h1>
          <p className="text-sm text-slate-400">
            This fills the Exporter section in every document you generate. You can edit it later.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-none">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={i <= step
                    ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.08)', color: '#64748b' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium transition-colors ${i <= step ? 'text-slate-200' : 'text-slate-600'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px transition-all"
                  style={{ background: i < step ? '#6366f1' : 'rgba(255,255,255,0.08)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-8 border border-white/8 space-y-6"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)' }}>
          <h2 className="font-semibold text-slate-200 text-sm">{STEPS[step]}</h2>
          {steps[step]}

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/auth')}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              ← {step === 0 ? 'Back to sign in' : 'Back'}
            </button>

            <div className="flex items-center gap-3">
              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  Next →
                </button>
              ) : (
                <button
                  onClick={finish}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {saving ? 'Saving…' : 'Save & Go to Dashboard →'}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600">
          Want to skip for now?{' '}
          <Link href="/dashboard/upload" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Go to dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}
