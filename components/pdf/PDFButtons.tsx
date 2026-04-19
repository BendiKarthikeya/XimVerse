'use client'

import dynamic from 'next/dynamic'
import type { Profile, InvoiceJson } from '@/types'

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(m => ({ default: m.PDFDownloadLink })),
  { ssr: false, loading: () => <span className="text-xs text-slate-500">Loading…</span> }
)
const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then(m => ({ default: m.PDFViewer })),
  { ssr: false, loading: () => <div className="text-xs text-slate-500">Loading preview…</div> }
)

const CommercialInvoicePDF = dynamic(() => import('./CommercialInvoicePDF'), { ssr: false })
const PackingListPDF = dynamic(() => import('./PackingListPDF'), { ssr: false })

interface Props {
  profile: Partial<Profile>
  sourceJson: InvoiceJson
  consignmentNo: string
  mode: 'download-invoice' | 'download-packing' | 'download-zip' | 'preview-invoice' | 'preview-packing'
}

export function PDFDownloadBtn({ profile, sourceJson, consignmentNo, type, label }: {
  profile: Partial<Profile>; sourceJson: InvoiceJson; consignmentNo: string
  type: 'invoice' | 'packing'; label: string
}) {
  const doc = type === 'invoice'
    ? <CommercialInvoicePDF profile={profile} sourceJson={sourceJson} consignmentNo={consignmentNo} />
    : <PackingListPDF profile={profile} sourceJson={sourceJson} consignmentNo={consignmentNo} />

  const fileName = type === 'invoice'
    ? `${consignmentNo}-commercial-invoice.pdf`
    : `${consignmentNo}-packing-list.pdf`

  return (
    <PDFDownloadLink document={doc} fileName={fileName}>
      {({ loading }) => (
        <button disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          {loading ? 'Preparing…' : label}
        </button>
      )}
    </PDFDownloadLink>
  )
}

export function PDFPreviewPanel({ profile, sourceJson, consignmentNo, type }: {
  profile: Partial<Profile>; sourceJson: InvoiceJson; consignmentNo: string; type: 'invoice' | 'packing'
}) {
  const doc = type === 'invoice'
    ? <CommercialInvoicePDF profile={profile} sourceJson={sourceJson} consignmentNo={consignmentNo} />
    : <PackingListPDF profile={profile} sourceJson={sourceJson} consignmentNo={consignmentNo} />

  return (
    <PDFViewer width="100%" height={520} showToolbar={false}>
      {doc}
    </PDFViewer>
  )
}
