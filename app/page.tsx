import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between sticky top-0 z-20"
        style={{ background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(14px)' }}>
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg px-2 py-0.5">
            <img src="/logo.png" alt="XimVerse" className="h-10 w-20" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth?tab=login"
            className="text-sm text-slate-300 hover:text-white px-4 py-2 rounded-lg border border-white/10 hover:border-white/25 transition-all">
            Log In
          </Link>
          <Link href="/auth?tab=signup"
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-28 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div style={{ width: 600, height: 600, background: 'radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)', borderRadius: '50%' }} />
        </div>
        <div className="space-y-6 max-w-3xl mx-auto relative z-10 fade-in">
          <span className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border"
            style={{ background: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
            Hackathon Build · Export Documentation Suite
          </span>
          <h1 className="text-5xl font-black leading-tight tracking-tight text-white">
            Upload Docs →<br />
            <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Auto Fill Templates
            </span><br />
            → Download PDFs
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Stop typing export data repeatedly. Upload your 2 PDFs, OCR extracts everything,
            and get your Commercial Invoice + Packing List in under 2 minutes.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link href="/auth?tab=signup"
              className="px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 40px rgba(99,102,241,0.3)' }}>
              Start for Free →
            </Link>
            <Link href="/dashboard/profile?demo=true"
              className="px-6 py-3 rounded-xl border text-sm text-slate-300 hover:text-white transition-all"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              Continue as Demo User
            </Link>
          </div>
          <p className="text-xs text-slate-600">No credit card required · Works with any Indian exporter document</p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-8 py-12 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-white mb-12">
          How it works in <span className="text-indigo-400">4 steps</span>
        </h2>
        <div className="grid grid-cols-4 gap-6">
          {[
            { step: '1', color: 'rgba(99,102,241,0.2)', textColor: '#818cf8', title: 'Upload 2 PDFs', desc: 'Commercial Invoice + Company Profile' },
            { step: '2', color: 'rgba(139,92,246,0.2)', textColor: '#a78bfa', title: 'OCR Extraction', desc: 'OCR.space reads and structures all data' },
            { step: '3', color: 'rgba(6,182,212,0.2)', textColor: '#67e8f9', title: 'JSON → Templates', desc: 'Auto-fills both document templates' },
            { step: '4', color: 'rgba(34,197,94,0.2)', textColor: '#4ade80', title: 'Download PDFs', desc: 'ZIP with Invoice + Packing List' },
          ].map(({ step, color, textColor, title, desc }) => (
            <div key={step} className="rounded-2xl p-6 text-center space-y-3 border border-white/7 transition-all hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="w-8 h-8 rounded-full mx-auto flex items-center justify-center text-sm font-bold"
                style={{ background: color, color: textColor }}>{step}</div>
              <p className="font-semibold text-sm text-white">{title}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-8 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-3 gap-5">
          {[
            { icon: '⚡', title: 'Under 2 Minutes', desc: 'From upload to downloadable PDFs. No typing, no errors.' },
            { icon: '🎯', title: 'Fixed Format Accuracy', desc: 'Regex parser tuned to your exact document format.' },
            { icon: '📦', title: 'Full History', desc: 'All consignments saved in Supabase. Re-download anytime.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-2xl p-6 space-y-3 border border-white/7 transition-all hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl">{icon}</div>
              <p className="font-semibold text-white">{title}</p>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 px-8 py-6 text-center text-xs text-slate-600">
        © 2026 XIMVERSE · Built for Hackathon · Powered by Supabase + OCR.space + React PDF
      </footer>
    </div>
  )
}
