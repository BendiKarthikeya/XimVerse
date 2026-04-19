'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UserProfilePage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [isDemo, setIsDemo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const demo = document.cookie.includes('ximverse-demo=true') ||
      new URLSearchParams(window.location.search).get('demo') === 'true'
    setIsDemo(demo)
    if (demo) {
      setFirstName('Demo')
      setLastName('User')
      setEmail('demo@ximverse.com')
    } else {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (!data.user) { router.push('/auth'); return }
        setFirstName(data.user.user_metadata?.first_name ?? '')
        setLastName(data.user.user_metadata?.last_name ?? '')
        setEmail(data.user.email ?? '')
      })
    }
  }, [router])

  async function save() {
    if (isDemo) { setSaved(true); setTimeout(() => setSaved(false), 2000); return }
    setSaving(true)
    const supabase = createClient()
    await supabase.auth.updateUser({ data: { first_name: firstName, last_name: lastName } })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 fade-in max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-white">User Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Your personal account details.</p>
      </div>

      <div className="rounded-2xl p-6 space-y-5 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {/* Avatar */}
        <div className="flex items-center gap-4 pb-4 border-b border-white/10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            {firstName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-bold text-white">{[firstName, lastName].filter(Boolean).join(' ') || 'User'}</p>
            <p className="text-xs text-slate-400">{email}</p>
            {isDemo && (
              <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                Demo Account
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">First Name</label>
            <input type="text" placeholder="Ashutosh" value={firstName}
              onChange={e => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Last Name</label>
            <input type="text" placeholder="Rai" value={lastName}
              onChange={e => setLastName(e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-500 mb-1.5 block">Email</label>
            <input type="email" value={email} disabled
              className="opacity-50 cursor-not-allowed" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={save} disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && <span className="text-xs text-emerald-400">✓ Saved{isDemo ? ' (demo — not persisted)' : ''}</span>}
        </div>
      </div>
    </div>
  )
}
