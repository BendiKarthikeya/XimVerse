'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEMO_PROFILE } from '@/lib/demoData'
import type { Profile } from '@/types'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>(DEMO_PROFILE)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const demo = document.cookie.includes('ximverse-demo=true') ||
      new URLSearchParams(window.location.search).get('demo') === 'true'
    setIsDemo(demo)
    if (!demo) {
      const supabase = createClient()
      supabase.auth.getUser().then(async ({ data }) => {
        if (!data.user) return
        const { data: p } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single()
        if (p) setProfile(p)
        else setProfile(prev => ({ ...prev, user_id: data.user!.id, email: data.user!.email ?? '' }))
      })
    }
  }, [])

  async function save() {
    setSaving(true)
    if (!isDemo) {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').upsert({ ...profile, user_id: user.id })
      }
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const field = (label: string, key: keyof Profile, placeholder = '') => (
    <div key={key}>
      <label className="text-xs text-slate-500 mb-1.5 block">{label}</label>
      <input type="text" placeholder={placeholder}
        value={(profile[key] as string) ?? ''}
        onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} />
    </div>
  )

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Company Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Profile data auto-fills the Exporter section in every generated document.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Summary card */}
        <div className="rounded-2xl p-6 space-y-5 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-white/10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>X</div>
            <div>
              <p className="font-bold text-white text-sm">{profile.company_name || 'Your Company'}</p>
              <p className="text-xs text-slate-400 mt-0.5">{profile.address?.split(',')[0] || 'Address'}</p>
            </div>
            {isDemo && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                Demo Profile
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            {[
              ['IEC', profile.iec],
              ['GSTIN', profile.gstin],
              ['PAN', profile.pan],
              ['Email', profile.email],
              ['Signatory', profile.signatory_name],
              ['Commodity', profile.export_commodity],
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between text-xs">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-300 font-mono text-right max-w-[160px] truncate">{val || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit form */}
        <div className="col-span-2 rounded-2xl p-6 space-y-5 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <h3 className="font-semibold text-slate-200">Edit Profile Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Company Name', 'company_name', 'XIMVERSE EXPORTS PVT LTD')}
            {field('Email', 'email', 'export@company.com')}
            {field('Phone', 'phone', '+91-9876543210')}
            {field('IEC Code', 'iec', 'XIMV1234567')}
            {field('GSTIN', 'gstin', '29ABCDE1234F1Z5')}
            {field('PAN', 'pan', 'ABCDE1234F')}
            {field('TAN', 'tan', 'BLRA12345B')}
            {field('Export Commodity', 'export_commodity', 'Basmati Rice 1121 Steam')}
            <div className="col-span-2">
              {field('Address', 'address', '#45, Whitefield Industrial Area, Bengaluru...')}
            </div>
            {field('Authorised Signatory', 'signatory_name', 'Ashutosh Rai')}
            {field('Designation', 'signatory_designation', 'Export Manager')}
            {field('Bank Name', 'bank_name', 'HDFC Bank Ltd')}
            {field('Bank Branch', 'bank_branch', 'Whitefield Branch')}
            {field('Account No.', 'bank_account', '50200012345678')}
            {field('IFSC', 'bank_ifsc', 'HDFC0001234')}
            {field('SWIFT', 'bank_swift', 'HDFCINBBXXX')}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button onClick={save} disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-all"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
            {saved && <span className="text-xs text-emerald-400">✓ Saved{isDemo ? ' (demo — not persisted)' : ' to Supabase'}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
