# XimVerse

Export documentation automation web app. Upload PDFs → OCR extracts data → templates auto-filled → download Commercial Invoice + Packing List as ZIP.

## Tech Stack

- **Framework** — Next.js 14 (App Router), TypeScript
- **Styling** — Tailwind CSS
- **Auth** — Supabase Auth (+ demo user bypass)
- **Database / Storage** — Supabase PostgreSQL + Supabase Storage
- **OCR** — OCR.space API
- **PDF Generation** — @react-pdf/renderer
- **Download Bundling** — jszip
- **Deployment** — Vercel

## Getting Started

### 1. Clone & install

```bash
git clone <repo-url>
cd XimVerse
npm install
```

### 2. Set environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OCR_SPACE_API_KEY=your-ocr-space-key
```

### 3. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run type-check   # TypeScript check without emit
```

## Project Structure

```
/app                 # Next.js App Router (pages + API routes)
  /api/ocr           # PDF → OCR.space → raw text
  /api/parse         # Raw text → structured JSON
/components
  /dashboard         # ProfileCard, UploadSection, CreateConsignment, etc.
  /pdf               # CommercialInvoice + PackingList PDF templates
/lib                 # Supabase client, OCR wrapper, JSON parser
/types               # Shared TypeScript types
```

## Core Workflow

1. Upload Commercial Invoice PDF → OCR extracts shipment data
2. Upload Company Profile PDF → populates your exporter profile
3. Click "Create Consignment" → PDFs auto-generated
4. Download both PDFs as a single ZIP
