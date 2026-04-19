'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DEMO_SOURCE_JSON, DEMO_PROFILE } from '@/lib/demoData'
import type { InvoiceJson, ProfileJson } from '@/types'

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

export default function UploadPage() {
  const router = useRouter()
  const [state1, setState1] = useState<UploadState>('idle')
  const [state2, setState2] = useState<UploadState>('idle')
  const [json1, setJson1] = useState<InvoiceJson | null>(null)
  const [json2, setJson2] = useState<ProfileJson | null>(null)
  const [showJson1, setShowJson1] = useState(false)
  const [showJson2, setShowJson2] = useState(false)
  const [err1, setErr1] = useState('')
  const [err2, setErr2] = useState('')
  const ref1 = useRef<HTMLInputElement>(null)
  const ref2 = useRef<HTMLInputElement>(null)

  const isDemo = typeof document !== 'undefined' &&
    (document.cookie.includes('ximverse-demo=true') ||
     new URLSearchParams(window.location.search).get('demo') === 'true')

  async function handleUpload(file: File, docType: 'invoice' | 'company_profile') {
    const setS = docType === 'invoice' ? setState1 : setState2
    const setE = docType === 'invoice' ? setErr1 : setErr2
    setS('uploading')
    setE('')

    // Demo mode: skip real OCR, use fixture data
    if (isDemo) {
      await new Promise(r => setTimeout(r, 1800))
      if (docType === 'invoice') { setJson1(DEMO_SOURCE_JSON); setState1('done') }
      else {
        setJson2({ company_name: DEMO_PROFILE.company_name ?? undefined, address: DEMO_PROFILE.address ?? undefined, iec: DEMO_PROFILE.iec ?? undefined, gstin: DEMO_PROFILE.gstin ?? undefined, pan: DEMO_PROFILE.pan ?? undefined, tan: DEMO_PROFILE.tan ?? undefined, export_commodity: DEMO_PROFILE.export_commodity ?? undefined, signatory: { name: DEMO_PROFILE.signatory_name ?? undefined, designation: DEMO_PROFILE.signatory_designation ?? undefined } })
        setState2('done')
      }
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload to Supabase Storage
      const path = `${user.id}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage
        .from('source-documents')
        .upload(path, file, { contentType: 'application/pdf' })
      if (upErr) throw upErr

      const { data: urlData } = supabase.storage.from('source-documents').getPublicUrl(path)

      // OCR
      const form = new FormData()
      form.append('file', file)
      form.append('docType', docType)
      const res = await fetch('/api/ocr', { method: 'POST', body: form })
      if (!res.ok) throw new Error('OCR failed')
      const { parsed } = await res.json()

      // Save to DB
      await supabase.from('source_documents').insert({
        user_id: user.id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        doc_type: docType,
        extracted_json: parsed,
      })

      // If company profile, update profiles table
      if (docType === 'company_profile' && parsed) {
        await supabase.from('profiles').upsert({
          user_id: user.id,
          company_name: parsed.company_name,
          address: parsed.address,
          iec: parsed.iec,
          gstin: parsed.gstin,
          pan: parsed.pan,
          tan: parsed.tan,
          export_commodity: parsed.export_commodity,
          signatory_name: parsed.signatory?.name,
          signatory_designation: parsed.signatory?.designation,
        }, { onConflict: 'user_id' })
        setJson2(parsed)
      } else {
        setJson1(parsed)
      }

      setS('done')
    } catch (e: unknown) {
      setE(e instanceof Error ? e.message : 'Upload failed')
      setS('error')
    }
  }

  function onFilePick(docType: 'invoice' | 'company_profile') {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (f) handleUpload(f, docType)
    }
  }

  const UploadZone = ({
    n, label, sublabel, color, state, json, err, inputRef, onPick, showToggle, showJson, onToggle,
  }: {
    n: number; label: string; sublabel: string; color: string; state: UploadState
    json: InvoiceJson | ProfileJson | null; err: string
    inputRef: React.RefObject<HTMLInputElement | null>; onPick: (e: React.ChangeEvent<HTMLInputElement>) => void
    showToggle: boolean; showJson: boolean; onToggle: () => void
  }) => (
    <div className="rounded-2xl p-6 space-y-4 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-200">{label}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
          style={{ background: `rgba(${color},0.15)`, color: `rgba(${color},1)` }}>
          Doc {n}
        </span>
      </div>

      <div
        className={`upload-zone rounded-xl p-8 text-center space-y-3 ${state === 'done' ? 'done' : ''}`}
        onClick={() => state === 'idle' && inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={onPick} />
        {state === 'idle' && <>
          <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
            style={{ background: `rgba(${color},0.15)` }}>
            <svg className="w-6 h-6" style={{ color: `rgba(${color},1)` }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-300">Drop PDF here or click to upload</p>
          <p className="text-xs text-slate-600">Max 1MB · PDF only</p>
        </>}

        {state === 'uploading' && <div className="space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400">Extracting with OCR…</p>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '60%', animation: 'progress 2s linear infinite' }} />
          </div>
        </div>}

        {state === 'done' && <div className="space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-emerald-400">Extracted successfully</p>
        </div>}

        {state === 'error' && <div className="space-y-2">
          <p className="text-sm text-red-400">⚠ {err}</p>
          <button onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
            className="text-xs text-indigo-400 underline">Retry</button>
        </div>}
      </div>

      {state === 'done' && json && (
        <div className="space-y-2 fade-in">
          <div className="rounded-xl p-3 space-y-1.5" style={{ background: 'rgba(15,23,42,0.6)' }}>
            {n === 1 && 'consignee' in json && <>
              <Row label="Buyer" val={(json as InvoiceJson).consignee?.name} />
              <Row label="Invoice No" val={(json as InvoiceJson).shipment?.invoice_no} />
              <Row label="Product" val={(json as InvoiceJson).items?.[0]?.description} />
              <Row label="Amount" val={`${(json as InvoiceJson).payment?.currency} ${(json as InvoiceJson).total_amount?.toLocaleString()}`} />
            </>}
            {n === 2 && 'company_name' in json && <>
              <Row label="Company" val={(json as ProfileJson).company_name} />
              <Row label="IEC" val={(json as ProfileJson).iec} />
              <Row label="GSTIN" val={(json as ProfileJson).gstin} />
            </>}
          </div>
          {showToggle && (
            <>
              <button onClick={onToggle} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5">
                <svg className="w-3 h-3 transition-transform" style={{ transform: showJson ? 'rotate(90deg)' : '' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                View raw JSON
              </button>
              {showJson && (
                <div className="rounded-xl p-3 overflow-auto max-h-48 fade-in" style={{ background: '#0f172a' }}>
                  <pre className="text-xs text-emerald-400">{JSON.stringify(json, null, 2)}</pre>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )

  const bothDone = state1 === 'done' && state2 === 'done'

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Source Documents</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your 2 fixed-format PDFs. OCR extracts all data and stores it as structured JSON.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <UploadZone n={1} label="Quotation" sublabel="Per-consignment data — buyer, shipment, products"
          color="99,102,241" state={state1} json={json1} err={err1}
          inputRef={ref1} onPick={onFilePick('invoice')}
          showToggle={true} showJson={showJson1} onToggle={() => setShowJson1(v => !v)} />
        <UploadZone n={2} label="Company Profile" sublabel="One-time upload — saved to your profile"
          color="139,92,246" state={state2} json={json2} err={err2}
          inputRef={ref2} onPick={onFilePick('company_profile')}
          showToggle={true} showJson={showJson2} onToggle={() => setShowJson2(v => !v)} />
      </div>

      {bothDone && (
        <div className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/8 fade-in"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div>
            <p className="font-semibold text-white">Both documents extracted successfully</p>
            <p className="text-sm text-slate-400 mt-0.5">Ready to create a consignment and generate export PDFs</p>
          </div>
          <button onClick={() => router.push('/dashboard/create')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            Create New Consignment
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

function Row({ label, val }: { label: string; val?: string | null }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300 max-w-[200px] truncate">{val || '—'}</span>
    </div>
  )
}
