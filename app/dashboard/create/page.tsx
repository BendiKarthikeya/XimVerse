'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateConsignmentNo } from '@/lib/generateConsignmentNo'
import { DEMO_PROFILE, DEMO_SOURCE_JSON } from '@/lib/demoData'
import type { Profile, InvoiceJson } from '@/types'
import dynamic from 'next/dynamic'

const PDFDownloadBtn = dynamic(
  () => import('@/components/pdf/PDFButtons').then(m => ({ default: m.PDFDownloadBtn })),
  { ssr: false }
)
const PDFPreviewPanel = dynamic(
  () => import('@/components/pdf/PDFButtons').then(m => ({ default: m.PDFPreviewPanel })),
  { ssr: false }
)

type Step = 1 | 2 | 3

export default function CreatePage() {
  const [step, setStep] = useState<Step>(1)
  const [profile, setProfile] = useState<Partial<Profile>>(DEMO_PROFILE)
  const [sourceJson, setSourceJson] = useState<InvoiceJson>(DEMO_SOURCE_JSON)
  const [consignmentNo, setConsignmentNo] = useState('XIM-2026-001')
  const [saving, setSaving] = useState(false)
  const [previewTab, setPreviewTab] = useState<'invoice' | 'packing'>('invoice')
  const [isDemo, setIsDemo] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const demo = document.cookie.includes('ximverse-demo=true') ||
      new URLSearchParams(window.location.search).get('demo') === 'true'
    setIsDemo(demo)

    if (!demo) {
      const supabase = createClient()
      supabase.auth.getUser().then(async ({ data }) => {
        if (!data.user) return
        const { data: p } = await supabase.from('profiles').select('*').eq('user_id', data.user.id).single()
        if (p) setProfile(p)
        const { data: docs } = await supabase
          .from('source_documents')
          .select('*')
          .eq('user_id', data.user.id)
          .eq('doc_type', 'invoice')
          .order('created_at', { ascending: false })
          .limit(1)
        if (docs?.[0]?.extracted_json) setSourceJson(docs[0].extracted_json as InvoiceJson)
        const { count } = await supabase
          .from('consignments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', data.user.id)
        setConsignmentNo(generateConsignmentNo(count ?? 0))
      })
    }
  }, [])

  async function generate() {
    setSaving(true)
    if (!isDemo) {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('consignments').insert({
          user_id: user.id,
          consignment_no: consignmentNo,
          buyer_name: sourceJson.consignee?.name,
          product: sourceJson.items?.[0]?.description,
          quantity: sourceJson.items?.[0]?.qty,
          unit: sourceJson.items?.[0]?.unit,
          amount: sourceJson.total_amount,
          currency: sourceJson.payment?.currency ?? 'USD',
          status: 'generated',
          source_json: sourceJson,
        })
      }
    }
    setSaving(false)
    setStep(3)
  }

  function setShipment(key: keyof NonNullable<InvoiceJson['shipment']>, val: string) {
    setSourceJson(j => ({ ...j, shipment: { ...j.shipment, [key]: val } }))
  }
  function setPayment(key: keyof NonNullable<InvoiceJson['payment']>, val: string) {
    setSourceJson(j => ({ ...j, payment: { ...j.payment, [key]: val } }))
  }
  function setConsignee(key: keyof NonNullable<InvoiceJson['consignee']>, val: string) {
    setSourceJson(j => ({ ...j, consignee: { ...j.consignee, [key]: val } }))
  }
  function setItem0(key: keyof NonNullable<InvoiceJson['items']>[0], val: string | number) {
    setSourceJson(j => {
      const items = [...(j.items ?? [{}])]
      items[0] = { ...items[0], [key]: val }
      return { ...j, items }
    })
  }

  // Displays a value or an editable input depending on edit mode
  const Row = ({ label, val, onEdit }: { label: string; val?: string | number | null; onEdit?: (v: string) => void }) => (
    <div className="flex justify-between items-center text-sm gap-4">
      <span className="text-slate-500 flex-none">{label}</span>
      {editing && onEdit ? (
        <input
          type="text"
          value={val ?? ''}
          onChange={e => onEdit(e.target.value)}
          className="flex-1 text-right bg-transparent border-b border-indigo-500/50 text-white focus:outline-none focus:border-indigo-400 placeholder:text-slate-600 py-0.5"
        />
      ) : (
        <span className="text-white max-w-[260px] text-right">{val ?? '—'}</span>
      )}
    </div>
  )

  const SectionHeader = ({ label }: { label: string }) => (
    <h3 className="font-semibold text-slate-200 flex items-center gap-2">
      <span className="w-5 h-5 rounded text-xs flex items-center justify-center font-bold text-white"
        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>✓</span>
      {label}
    </h3>
  )

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Create New Consignment</h1>
        <p className="text-sm text-slate-500 mt-1">Review extracted data, generate documents, then preview and download.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {([1, 2, 3] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={step >= s
                ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }
                : { background: 'rgba(51,65,85,1)', color: '#64748b' }}>
              {step > s ? '✓' : s}
            </div>
            <span className="text-sm" style={{ color: step >= s ? '#fff' : '#64748b', fontWeight: step >= s ? 500 : 400 }}>
              {['Review Data', 'Generating PDFs', 'Preview & Download'][i]}
            </span>
            {i < 2 && <div className="flex-1 h-px mx-2" style={{ background: step > s ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)', width: 48 }} />}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Edit toggle */}
          <div className="flex justify-end">
            <button
              onClick={() => setEditing(e => !e)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-all"
              style={editing
                ? { background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', borderColor: 'rgba(99,102,241,0.4)' }
                : { color: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)', background: 'transparent' }}>
              {editing ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Done Editing
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Details
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left card */}
            <div className="rounded-2xl p-6 space-y-4 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <SectionHeader label="Exporter (from Profile)" />
              <div className="space-y-3">
                <Row label="Company" val={profile.company_name}
                  onEdit={v => setProfile(p => ({ ...p, company_name: v }))} />
                <Row label="IEC" val={profile.iec}
                  onEdit={v => setProfile(p => ({ ...p, iec: v }))} />
                <Row label="GSTIN" val={profile.gstin}
                  onEdit={v => setProfile(p => ({ ...p, gstin: v }))} />
                <Row label="Bank SWIFT" val={profile.bank_swift}
                  onEdit={v => setProfile(p => ({ ...p, bank_swift: v }))} />
              </div>

              <div className="pt-3 border-t border-white/10 space-y-4">
                <SectionHeader label="Consignee (from Doc 1)" />
                <div className="space-y-3">
                  <Row label="Buyer" val={sourceJson.consignee?.name}
                    onEdit={v => setConsignee('name', v)} />
                  <Row label="Address" val={sourceJson.consignee?.address}
                    onEdit={v => setConsignee('address', v)} />
                  <Row label="Email" val={sourceJson.consignee?.email}
                    onEdit={v => setConsignee('email', v)} />
                </div>
              </div>
            </div>

            {/* Right card */}
            <div className="rounded-2xl p-6 space-y-4 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <SectionHeader label="Shipment Details" />
              <div className="space-y-3">
                <Row label="Invoice No" val={sourceJson.shipment?.invoice_no}
                  onEdit={v => setShipment('invoice_no', v)} />
                <Row label="Date" val={sourceJson.shipment?.invoice_date}
                  onEdit={v => setShipment('invoice_date', v)} />
                <Row label="Vessel" val={sourceJson.shipment?.vessel}
                  onEdit={v => setShipment('vessel', v)} />
                <Row label="Voyage" val={sourceJson.shipment?.voyage}
                  onEdit={v => setShipment('voyage', v)} />
                <Row label="Port of Loading" val={sourceJson.shipment?.port_of_loading}
                  onEdit={v => setShipment('port_of_loading', v)} />
                <Row label="Port of Discharge" val={sourceJson.shipment?.port_of_discharge}
                  onEdit={v => setShipment('port_of_discharge', v)} />
                <Row label="Incoterm" val={sourceJson.payment?.incoterm}
                  onEdit={v => setPayment('incoterm', v)} />
                <Row label="Currency" val={sourceJson.payment?.currency}
                  onEdit={v => setPayment('currency', v)} />
                <Row label="LC No" val={sourceJson.payment?.lc_no}
                  onEdit={v => setPayment('lc_no', v)} />
              </div>

              <div className="pt-3 border-t border-white/10 space-y-4">
                <SectionHeader label="Product" />
                <div className="space-y-3">
                  <Row label="Item" val={sourceJson.items?.[0]?.description}
                    onEdit={v => setItem0('description', v)} />
                  <Row label="HS Code" val={sourceJson.items?.[0]?.hs_code}
                    onEdit={v => setItem0('hs_code', v)} />
                  <Row label="Qty" val={sourceJson.items?.[0]?.qty}
                    onEdit={v => setItem0('qty', parseFloat(v) || 0)} />
                  <Row label="Unit" val={sourceJson.items?.[0]?.unit}
                    onEdit={v => setItem0('unit', v)} />
                  <Row label="Unit Price" val={sourceJson.items?.[0]?.unit_price}
                    onEdit={v => setItem0('unit_price', parseFloat(v) || 0)} />
                  <Row label="Total" val={sourceJson.total_amount}
                    onEdit={v => setSourceJson(j => ({ ...j, total_amount: parseFloat(v) || 0 }))} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => { setStep(2); setTimeout(generate, 600) }}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              Generate Documents
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="flex items-center justify-center py-16 fade-in">
          <div className="text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.2)' }}>
              {saving
                ? <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                : <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>}
            </div>
            <div>
              <p className="font-bold text-lg text-white">
                {saving ? 'Generating Documents…' : 'Documents Ready!'}
              </p>
              <p className="text-sm text-slate-400 mt-1">Filling templates and saving to Supabase…</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-5 fade-in">
          <div className="flex gap-2">
            <div className="flex rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
              {(['invoice', 'packing'] as const).map(t => (
                <button key={t} onClick={() => setPreviewTab(t)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={previewTab === t
                    ? { background: 'rgba(99,102,241,0.4)', color: '#fff' }
                    : { color: '#64748b' }}>
                  {t === 'invoice' ? 'Commercial Invoice' : 'Packing List'}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10">
            <PDFPreviewPanel
              profile={profile}
              sourceJson={sourceJson}
              consignmentNo={consignmentNo}
              type={previewTab}
            />
          </div>

          <div className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/8"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div>
              <p className="font-semibold text-white">Consignment {consignmentNo} saved</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Both PDFs ready · {isDemo ? 'Demo mode' : 'Stored in Supabase Storage'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <PDFDownloadBtn profile={profile} sourceJson={sourceJson} consignmentNo={consignmentNo}
                type="invoice" label="↓ Invoice PDF" />
              <PDFDownloadBtn profile={profile} sourceJson={sourceJson} consignmentNo={consignmentNo}
                type="packing" label="↓ Packing List PDF" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
