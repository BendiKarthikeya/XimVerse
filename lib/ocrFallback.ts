// WebAssembly OCR fallback pipeline: PDF → pdf.js (WASM renderer) → canvas → Tesseract.js (WASM OCR) → text
// Activates automatically when OCR.space fails (quota exhausted, timeout, or network error).
// Runs entirely in the browser — zero server round-trip, zero API key.

import { createWorker } from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist'

// Use CDN worker to avoid webpack config for the WASM worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

async function pdfToCanvas(file: File, pageNumber = 1): Promise<HTMLCanvasElement> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
  const page = await pdf.getPage(pageNumber)
  // Scale 2× for better OCR accuracy on small text
  const viewport = page.getViewport({ scale: 2.0 })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  await page.render({ canvas, viewport }).promise
  return canvas
}

export async function extractTextWithWasm(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const canvas = await pdfToCanvas(file)

  const worker = await createWorker('eng', 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100))
      }
    },
  })

  try {
    const { data } = await worker.recognize(canvas)
    return data.text
  } finally {
    await worker.terminate()
  }
}
