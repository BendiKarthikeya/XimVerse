'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEMO_CONSIGNMENTS, DEMO_PROFILE, DEMO_SOURCE_JSON } from '@/lib/demoData'
import type { Consignment, Profile, InvoiceJson } from '@/types'
import dynamic from 'next/dynamic'

const PDFDownloadBtn = dynamic(
  () => import('@/components/pdf/PDFButtons').then(m => ({ default: m.PDFDownloadBtn })),
  { ssr: false }
)
const PDFPreviewPanel = dynamic(
  () => import('@/components/pdf/PDFButtons').then(m => ({ default: m.PDFPreviewPanel })),
  { ssr: false }
)

const STATUS_STYLES: Record<string, string> = {
  generated: 'background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.3)',
  downloaded: 'background:rgba(99,102,241,0.15);color:#a5b4fc;border:1px solid rgba(99,102,241,0.3)',
  draft: 'background:rgba(234,179,8,0.15);color:#facc15;border:1px solid rgba(234,179,8,0.3)',
}

export default function HistoryPage() {
  const [consignments, setConsignments] = useState<Consignment[]>([])
  const [profile, setProfile] = useState<Partial<Profile>>(DEMO_PROFILE)
  const [preview, setPreview] = useState<{ c: Consignment; tab: 'invoice' | 'packing' } | null>(null)
  const [search, setSearch] = useState('')
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const demo = document.cookie.includes('ximverse-demo=true') ||
      new URLSearchParams(window.location.search).get('demo') === 'true'
    setIsDemo(demo)
    if (demo) { setConsignments(DEMO_CONSIGNMENTS); return }

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('user_id', data.user.id).single()
      if (p) setProfile(p)
      const { data: c } = await supabase
        .from('consignments').select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
      setConsignments(c ?? [])
    })
  }, [])

  const filtered = consignments.filter(c =>
    !search || c.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.consignment_no.toLowerCase().includes(search.toLowerCase())
  )

  const stats = [
    { label: 'Total', val: consignments.length, color: '#fff' },
    { label: 'This Month', val: consignments.filter(c => new Date(c.created_at).getMonth() === new Date().getMonth()).length, color: '#818cf8' },
    { label: 'Total Value', val: `$${(consignments.reduce((a, c) => a + (c.amount ?? 0), 0) / 1000).toFixed(0)}K`, color: '#4ade80' },
    { label: 'Downloaded', val: consignments.filter(c => c.status === 'downloaded').length, color: '#a78bfa' },
  ]

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Consignment History</h1>
          <p className="text-sm text-slate-500 mt-1">All generated export document sets, stored in Supabase.</p>
        </div>
        <input type="text" placeholder="Search by buyer, ID…" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 220 }} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ label, val, color }) => (
          <div key={label} className="rounded-xl p-4 space-y-1 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <table className="w-full text-sm">
          <thead className="border-b border-white/10">
            <tr>
              {['Consignment ID', 'Date', 'Buyer', 'Product', 'Amount', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left py-3.5 px-4 text-slate-500 font-medium text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="py-12 text-center text-slate-600 text-sm">No consignments yet. Create your first one.</td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-4 font-mono text-indigo-400 text-xs">{c.consignment_no}</td>
                <td className="py-3.5 px-4 text-slate-400 text-xs">{new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td className="py-3.5 px-4 text-slate-300 text-xs max-w-[140px] truncate">{c.buyer_name ?? '—'}</td>
                <td className="py-3.5 px-4 text-slate-400 text-xs">{c.product ?? '—'}</td>
                <td className="py-3.5 px-4 text-slate-300 text-xs font-medium">{c.currency} {c.amount?.toLocaleString()}</td>
                <td className="py-3.5 px-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ ...Object.fromEntries((STATUS_STYLES[c.status] ?? '').split(';').filter(Boolean).map(s => s.split(':').map(x => x.trim()) as [string, string])) }}>
                    {c.status}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex gap-3 text-xs">
                    <button onClick={() => setPreview({ c, tab: 'invoice' })}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors">Preview</button>
                    {c.source_json && (
                      <PDFDownloadBtn profile={profile} sourceJson={c.source_json as InvoiceJson}
                        consignmentNo={c.consignment_no} type="invoice" label="↓ Invoice" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => setPreview(null)}>
          <div className="rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col fade-in"
            style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-white">Document Preview</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded"
                  style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>{preview.c.consignment_no}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex rounded-lg p-0.5 text-xs" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  {(['invoice', 'packing'] as const).map(t => (
                    <button key={t} onClick={() => setPreview(p => p ? { ...p, tab: t } : p)}
                      className="px-3 py-1.5 rounded-md transition-all text-xs"
                      style={preview.tab === t
                        ? { background: '#4f46e5', color: '#fff' }
                        : { color: '#94a3b8' }}>
                      {t === 'invoice' ? 'Commercial Invoice' : 'Packing List'}
                    </button>
                  ))}
                </div>
                <button onClick={() => setPreview(null)} className="text-slate-500 hover:text-slate-300 text-xl">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4" style={{ background: 'rgba(15,23,42,0.5)' }}>
              {preview.c.source_json && (
                <PDFPreviewPanel profile={profile} sourceJson={preview.c.source_json as InvoiceJson}
                  consignmentNo={preview.c.consignment_no} type={preview.tab} />
              )}
            </div>
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-xs text-slate-600">{isDemo ? 'Demo mode' : 'Stored in Supabase Storage'}</p>
              <div className="flex gap-3">
                <button onClick={() => setPreview(null)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-slate-300">Close</button>
                {preview.c.source_json && <>
                  <PDFDownloadBtn profile={profile} sourceJson={preview.c.source_json as InvoiceJson}
                    consignmentNo={preview.c.consignment_no} type="invoice" label="↓ Invoice PDF" />
                  <PDFDownloadBtn profile={profile} sourceJson={preview.c.source_json as InvoiceJson}
                    consignmentNo={preview.c.consignment_no} type="packing" label="↓ Packing List PDF" />
                </>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
