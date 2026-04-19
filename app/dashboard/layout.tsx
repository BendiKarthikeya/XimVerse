'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard/upload',  label: 'Upload Docs' },
  { href: '/dashboard/create',  label: '+ Create Consignment' },
  { href: '/dashboard/history', label: 'History' },
  { href: '/dashboard/news',    label: 'News & Updates' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [firstName, setFirstName] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const demo = document.cookie.includes('ximverse-demo=true') ||
      new URLSearchParams(window.location.search).get('demo') === 'true'
    if (demo) {
      setFirstName('Demo')
    } else {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (!data.user) router.push('/auth')
        else setFirstName(data.user.user_metadata?.first_name ?? data.user.email?.split('@')[0] ?? 'User')
      })
    }
  }, [router])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    document.cookie = 'ximverse-demo=; path=/; max-age=0'
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh' }}>
      <header className="border-b border-white/10 px-6 py-3 flex items-center sticky top-0 z-20"
        style={{ background: 'rgba(15,23,42,0.96)', backdropFilter: 'blur(14px)' }}>

        {/* Logo — left */}
        <Link href="/" className="flex items-center flex-none">
          <div className="bg-white rounded-lg px-2 py-0.5">
            <img src="/logo.png" alt="XimVerse" className="h-7 w-auto object-contain" />
          </div>
        </Link>

        {/* Nav — centered */}
        <nav className="flex-1 flex items-center justify-center gap-1">
          {NAV.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={active
                  ? { background: 'rgba(99,102,241,0.25)', color: '#fff', border: '1px solid rgba(99,102,241,0.3)' }
                  : { color: '#94a3b8', border: '1px solid transparent' }}>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right — user dropdown */}
        <div className="flex items-center flex-none">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:border-indigo-500/40 transition-all"
              style={{ background: 'rgba(99,102,241,0.1)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-indigo-300 text-xs font-bold"
                style={{ background: 'rgba(99,102,241,0.3)' }}>
                {firstName?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <span className="text-sm text-slate-200 font-medium">{firstName ?? '…'}</span>
              <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 overflow-hidden z-50"
                style={{ background: 'rgba(15,23,42,0.98)', backdropFilter: 'blur(14px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                <Link href="/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Company Profile
                </Link>
                <Link href="/dashboard/user"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  User Profile
                </Link>
                <div className="border-t border-white/8 mx-3" />
                <button
                  onClick={() => { setDropdownOpen(false); handleSignOut() }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-400 hover:text-red-400 hover:bg-white/5 transition-all text-left">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  )
}
