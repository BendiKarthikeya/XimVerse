import { NextRequest, NextResponse } from 'next/server'
import { parseInvoiceText, parseProfileText } from '@/lib/parseOcrText'

export async function GET() {
  const apiKey = process.env.OCR_SPACE_API_KEY
  if (!apiKey || apiKey === 'helloworld') {
    return NextResponse.json({ ok: false, error: 'OCR_SPACE_API_KEY not set or using fallback' })
  }
  // Ping OCR.space with a tiny 1x1 white PNG (base64) to verify key works
  const form = new FormData()
  form.append('apikey', apiKey)
  form.append('base64Image', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==')
  form.append('language', 'eng')
  form.append('OCREngine', '2')
  const res = await fetch('https://api.ocr.space/parse/image', { method: 'POST', body: form })
  const data = await res.json()
  return NextResponse.json({
    ok: !data.IsErroredOnProcessing,
    httpStatus: res.status,
    ocrExitCode: data.OCRExitCode,
    errors: data.ErrorMessage ?? null,
  })
}

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
      const body = await ocrRes.text().catch(() => '')
      console.error(`OCR HTTP ${ocrRes.status}:`, body)
      return NextResponse.json({ error: 'OCR service unavailable', status: ocrRes.status, detail: body }, { status: 502 })
    }

    const ocrData = await ocrRes.json()
    console.log('OCR response:', JSON.stringify({ exitCode: ocrData.OCRExitCode, errored: ocrData.IsErroredOnProcessing, errors: ocrData.ErrorMessage }))

    if (ocrData.IsErroredOnProcessing) {
      return NextResponse.json({ error: ocrData.ErrorMessage?.[0] ?? 'OCR failed', ocrExitCode: ocrData.OCRExitCode }, { status: 422 })
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
