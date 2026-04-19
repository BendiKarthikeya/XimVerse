import { NextRequest, NextResponse } from 'next/server'
import { parseInvoiceText, parseProfileText } from '@/lib/parseOcrText'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const docType = formData.get('docType') as string | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld'
    const ocrForm = new FormData()
    ocrForm.append('file', file)
    ocrForm.append('apikey', apiKey)
    ocrForm.append('language', 'eng')
    ocrForm.append('isOverlayRequired', 'false')
    ocrForm.append('detectOrientation', 'true')
    ocrForm.append('scale', 'true')
    ocrForm.append('OCREngine', '2')

    const ocrRes = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: ocrForm,
    })

    if (!ocrRes.ok) {
      return NextResponse.json({ error: 'OCR service unavailable' }, { status: 502 })
    }

    const ocrData = await ocrRes.json()

    if (ocrData.IsErroredOnProcessing) {
      return NextResponse.json({ error: ocrData.ErrorMessage?.[0] ?? 'OCR failed' }, { status: 422 })
    }

    const rawText: string = ocrData.ParsedResults
      ?.map((r: { ParsedText: string }) => r.ParsedText)
      .join('\n') ?? ''

    const parsed = docType === 'company_profile'
      ? parseProfileText(rawText)
      : parseInvoiceText(rawText)

    return NextResponse.json({ rawText, parsed })
  } catch (err) {
    console.error('OCR route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
