'use client'

import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import CommercialInvoicePDF from './CommercialInvoicePDF'
import PackingListPDF from './PackingListPDF'
import type { Profile, InvoiceJson } from '@/types'

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
