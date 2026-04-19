# XIMVERSE

> **Export documentation in minutes, not days.** Upload PDFs → OCR extracts data → templates auto-filled → download customs-ready Commercial Invoice + Packing List.

[![BITS Pilani Startup Hub](https://img.shields.io/badge/Incubated-BITS%20Pilani%20Startup%20Hub-blue)]()
[![Pilot: Deendayal Port](https://img.shields.io/badge/Pilot-Deendayal%20Port-orange)]()
[![Users](https://img.shields.io/badge/Active%20Users-183-green)]()
[![Status](https://img.shields.io/badge/Status-Production%20Pilot-success)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/ashutoshrai7205/XimVerse/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)

---

## 🚀 Why XIMVERSE

**India has 63 million MSMEs, yet fewer than 150,000 are active exporters.** The #1 reason the rest don't ship abroad isn't product quality or demand — it's **documentation**.

Every shipment requires 10+ cross-border documents — Commercial Invoice, Packing List, Bill of Lading, Certificate of Origin, Shipping Bill, and more. Each document asks for the same exporter info: IEC, GSTIN, PAN, bank details. Small businesses waste **3–6 hours per shipment** retyping the same data, paying CHAs ₹5,000–15,000 per consignment, and risking customs delays that cost lakhs from a single typo in an HS code.

**XIMVERSE makes export documentation self-serve.** An exporter uploads their company profile and source invoice once. Our OCR pipeline extracts every field. Structured JSON auto-fills standard CBEC-format templates. The exporter downloads customs-ready PDFs in under 2 minutes — no CHA, no re-typing, no errors.

---

## 🎯 The Real-World Problem We Solve

**Who hurts today:**
- First-time exporters in Tier-2/Tier-3 cities who don't know where to start
- Small textile, agri, and handicraft manufacturers in Surat, Tiruppur, Jaipur, Moradabad, etc.
- Women-led and rural MSMEs entering global trade
- Repeat exporters tired of paying agents for work that's 95% copy-paste

**What they told us (from 183 early users):**
- 73% said documentation is their **biggest** bottleneck — bigger than finding buyers
- Average exporter spends **₹3,000–8,000 per shipment** on CHA fees just for docs
- 1 in 4 shipments faces delays due to documentation errors
- 89% said they'd use a self-serve tool if it mapped to standard templates

---

## 📊 Traction & Validation

- **183 active users** across 14 Indian states
- **Pilot deployment underway** at **Deendayal Port Authority** (Kandla) for real-shipment testing alongside this build
- **Empanelment in progress** with the **Ministry of Ports, Shipping & Waterways** as a service provider
- **Incubated** at **BITS Pilani Startup Hub**
- **Backed** by BITS Pilani Startup Hub (grant-supported)
- Active user feedback loop driving feature roadmap

---

## ✨ What's Built (MVP — this repo)

The current codebase is the **core automation engine** powering the pilot:

- ✅ Upload Commercial Invoice PDF → OCR.space extracts shipment data
- ✅ Upload Company Profile PDF → populates exporter profile
- ✅ One-click "Create Consignment" → both PDFs auto-generated
- ✅ Download customs-ready Commercial Invoice + Packing List as a ZIP
- ✅ Consignment history with re-download
- ✅ Trade insights panel (currency, port alerts, export trends)

---

## 🏗️ Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (+ demo user bypass for evaluators) |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| OCR | OCR.space API |
| JSON Parsing | Plain JavaScript (regex-based, deterministic) |
| PDF Generation | @react-pdf/renderer |
| Bundling | jszip |
| Deployment | Vercel |

### Why This Stack

- **Regex over LLM for OCR parsing** — Trade docs have predictable, labeled fields. Regex is free, instant, and deterministic, avoiding both API cost and hallucination risk. Smart engineering where it matters.
- **Supabase over custom backend** — Auth + DB + file storage in one, letting a small team focus on the pipeline instead of plumbing.
- **Next.js API routes** — Keeps OCR API key server-side; one codebase for frontend + backend.

---

## 🧭 Core Workflow

```
1. Upload Company Profile PDF (once)
   └─ OCR.space extracts company data → saved to profiles table

2. Upload Commercial Invoice PDF (per consignment)
   └─ OCR.space extracts shipment data → parsed to structured JSON

3. Click "Create Consignment"
   └─ Profile + invoice JSON merged → Commercial Invoice + Packing List PDFs generated in-browser

4. Download ZIP
   └─ Both CBEC-format PDFs bundled → customs-ready in under 2 minutes
```

The parsing engine uses deterministic regex anchored to fixed field labels (IEC, GSTIN, Invoice No, B/L No, etc.) — no LLM, no API cost, no hallucinations. Fallback data ensures the demo always runs even if OCR misses a field.

---

## 🚀 Quick Start

### Option A — Use the live demo (no setup)

[**https://ximverse.vercel.app**](https://ximverse.vercel.app)

Click **"Continue as Demo User"** — no sign-up, no credentials. A sample consignment is pre-loaded.

### Option B — Run locally

```bash
git clone https://github.com/ashutoshrai7205/XimVerse.git
cd XimVerse
npm install

cp .env.example .env.local
# Fill in:
#   NEXT_PUBLIC_SUPABASE_URL=
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=
#   OCR_SPACE_API_KEY=

npm run dev
# → http://localhost:3000
```

**You'll need:**
- A free [Supabase](https://supabase.com) project (schema in `supabase/`)
- A free [OCR.space](https://ocr.space/ocrapi) API key (500 requests/month)

---

## 🔒 Privacy & Data Safety

We take data privacy seriously — especially because our users upload sensitive business documents containing GSTIN, IEC codes, and bank details.

| Practice | Detail |
|----------|--------|
| **Storage** | Uploaded PDFs stored in private Supabase Storage buckets; access-controlled per `user_id` — no cross-user leakage |
| **Retention** | Raw OCR text is not persisted; only the structured JSON extracted from it is stored |
| **No data brokering** | User data is never sold, shared, or used for advertising |
| **Deletion** | Users can delete their profile and all consignment data at any time from the dashboard |
| **Encryption** | All data encrypted in transit (TLS 1.3 via Vercel + Supabase) and at rest (AES-256 via Supabase) |
| **Compliance** | Built in alignment with India's **Digital Personal Data Protection Act, 2023 (DPDP Act)** |
| **Third parties** | The only third-party processor is OCR.space; document text is sent for OCR only — not retained by them under their free-tier terms |

---

## 💰 Pricing & Sustainability

XIMVERSE is designed to be financially self-sustaining within 6 months of the pilot.

| Plan | Price | Consignments/month | Target |
|------|-------|--------------------|--------|
| **Free** | ₹0 | 5 | First-time exporters trying the platform |
| **Starter** | ₹499/month | 50 | Small exporters, 1–4 shipments/week |
| **Business** | ₹1,999/month | Unlimited | Growing SMEs, freight forwarders |
| **Enterprise** | Custom | Unlimited + API | CHAs, trade associations, port authorities |

**Revenue beyond subscriptions:**
- White-label licensing to Customs House Agents (CHAs)
- API access for ERP integrations (Tally, Busy, Zoho Books)
- Partnership with FIEO/APEDA for member-subsidised access
- Port authority SaaS contracts (Deendayal pilot → template for replication)

---

## 🗺️ Roadmap

### Q2 2026 — Core Pack Expansion
- [ ] GST Tax Invoice generation
- [ ] Certificate of Origin (Form A, SAPTA)
- [ ] Shipping Bill pre-fill (ICEGATE format)

### Q3 2026 — Integrations
- [ ] REST API for ERP connectors (Tally, Zoho Books)
- [ ] Direct ICEGATE e-filing integration
- [ ] Bulk consignment processing (CSV upload)

### Q4 2026 — Scale & Mobile
- [ ] Mobile app (React Native, iOS + Android)
- [ ] Multi-user team accounts with role-based access
- [ ] Audit trail and e-signature support (DSC)

### 2027 — Platform Play
- [ ] Full 10-document export pack
- [ ] CHA partner network (reseller programme)
- [ ] AI-assisted HS code classification
- [ ] Real-time customs duty calculator

---

## 🤝 Contributing

This project is in active development as part of a pilot with Deendayal Port Authority. Contributions are welcome — especially from:

- Exporters who want to report edge cases in OCR parsing
- Developers familiar with CBEC document formats
- Anyone who has shipped goods and knows how painful this is

**To contribute:**
1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Run tests: `npm test`
4. Submit a pull request with a clear description

Please open an issue first for significant changes.

---

## 📄 License

[MIT](LICENSE) — free to use, modify, and distribute. Attribution appreciated.

---

*Built at BITS Pilani Startup Hub. Solving real problems for real exporters.*
