'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard/profile',  label: 'Profile' },
  { href: '/dashboard/upload',   label: 'Upload Docs' },
  { href: '/dashboard/create',   label: '+ Create Consignment' },
  { href: '/dashboard/history',  label: 'History' },
  { href: '/dashboard/news',     label: 'News & Updates' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const demo = document.cookie.includes('ximverse-demo=true') ||
      new URLSearchParams(window.location.search).get('demo') === 'true'
    setIsDemo(demo)
    if (!demo) {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (!data.user) router.push('/auth')
        else setUserEmail(data.user.email ?? null)
      })
    }
  }, [router])

  async function handleSignOut() {
    document.cookie = 'ximverse-demo=; path=/; max-age=0'
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh' }}>
      <header className="border-b border-white/10 px-6 py-3 flex items-center justify-between sticky top-0 z-20"
        style={{ background: 'rgba(15,23,42,0.96)', backdropFilter: 'blur(14px)' }}>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>X</div>
            <span className="font-bold text-base tracking-tight text-white">XIMVERSE</span>
          </Link>
          <nav className="flex items-center gap-1 ml-4">
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
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'pulse 2s infinite' }} />
            {isDemo ? 'Demo mode' : 'Connected'}
          </div>
          {isDemo ? (
            <span className="text-xs px-2 py-1 rounded-lg border border-indigo-500/30 text-indigo-400"
              style={{ background: 'rgba(99,102,241,0.1)' }}>Demo User</span>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-indigo-300 text-xs font-bold"
                style={{ background: 'rgba(99,102,241,0.3)' }}>
                {userEmail?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <span className="text-sm text-slate-300 max-w-[140px] truncate">{userEmail}</span>
            </div>
          )}
          <button onClick={handleSignOut}
            className="text-xs text-slate-500 hover:text-slate-300 border border-white/10 rounded-lg px-3 py-1.5 transition-all">
            Sign Out
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  )
}
