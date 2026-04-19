# Changelog

All notable pivots, rewrites, and adaptations are documented here. We follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.4.0] — 2026-04-19 — WebAssembly OCR Fallback

### Problem
During the pilot with 183 users we discovered that heavy upload periods burn through OCR.space's 500 req/month free-tier quota well before month-end — leaving users with no extraction path.

### Pivot
We added a fully client-side WebAssembly fallback pipeline: **PDF → pdf.js (WASM renderer) → canvas → Tesseract.js (WASM OCR) → text**. Zero API key, zero server round-trip, zero quota. The primary OCR.space path is tried first; if it fails for any reason the WASM pipeline kicks in automatically.

### Also Added
- GitHub Actions CI (type-check + 21 unit tests + build on every push)
- 21 unit tests for the OCR parsing engine
- MIT License, Privacy & Safety section, Pricing & Roadmap in README

---

## [0.3.0] — 2026-04-15 — Pivot: Server → Browser-Direct OCR

### Problem
The initial OCR pipeline routed uploads through a Next.js API route → OCR.space. This hit Vercel's **10-second serverless timeout** on PDFs larger than ~500 KB, silently killing the extraction and returning a 504.

### Pivot
We moved the OCR.space call entirely to the browser. The file is uploaded to Supabase Storage, then the browser calls `api.ocr.space/parse/image` directly with a `multipart/form-data` request. This eliminated the timeout completely and reduced server load — the API route was deleted, no backend change on OCR.space's end needed.

**Commit:** `fix: call OCR.space directly from browser to bypass Vercel 10s timeout`

---

## [0.2.0] — 2026-04-12 — Pivot: LLM → Deterministic Regex Parser

### Problem
Early prototype used an LLM (prompt-based) to extract structured JSON from OCR text. During testing we found:
- Hallucinated field values on short or noisy OCR output
- Added ~2s latency per extraction
- Added API cost per consignment ($0.01–0.04/request at scale)

### Pivot
We rewrote the parser as a **deterministic regex engine** (`lib/parseOcrText.ts`) anchored to the fixed label strings in our two document formats (`Invoice No:`, `B/L No:`, `GSTIN:`, etc.). Since our document format is fixed (same two PDFs every time), regex is:
- Free
- Instant
- Deterministic — same input always gives same output
- Safe — no hallucination risk for IEC/GSTIN/bank fields

Static fallback data ensures the demo always runs even if OCR misses a field.

---

## [0.1.0] — 2026-04-10 — Initial MVP

### Built
- Upload PDF → OCR.space → structured JSON → auto-fill templates pipeline
- Commercial Invoice + Packing List PDF generation with `@react-pdf/renderer`
- Supabase Auth + "Continue as Demo User" bypass for evaluator access
- Consignment history + ZIP download via jszip
- Trade insights news panel
- Demo deployed: [https://ximverse.vercel.app](https://ximverse.vercel.app)
