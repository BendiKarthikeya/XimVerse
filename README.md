# XIMVERSE

> **India's only self-serve CBEC-format export documentation engine.**
> Fills Commercial Invoice + Packing List from your existing PDFs in under 2 minutes — no CHA, no re-typing.
> Built for the 63M MSMEs the ₹15,000-per-shipment documentation industry doesn't want to automate.
>
> Primary OCR: OCR.space. Fallback: **Tesseract.js + pdf.js (WebAssembly)** — runs in-browser when quota runs out, no API key needed.

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

## 🆚 Why Not [Docparser / Nanonets / ImpEx / generic doc tools]?

| The competition | XIMVERSE |
|-----------------|----------|
| Generic document automation — works for any country, any format | **India-specific** — CBEC format with IEC, GSTIN, Shipping Bill, HS code fields pre-wired |
| LLM-based extraction — expensive per request, hallucinates field values | **Deterministic regex** anchored to fixed labels — free, instant, never hallucinates a bank account number |
| API-dependent OCR — platform goes down, quota runs out, your product breaks | **WebAssembly fallback** (Tesseract.js + pdf.js in-browser) — zero dependency on any external API when it matters |
| Enterprise SaaS priced for freight forwarders | **MSME-first** — free tier, demo user bypass, no signup friction. Built for a first-time exporter in Surat, not a CHA's back office |
| English-only, global market focus | **Tier-2/3 India focus** — Deendayal Port pilot, DPDP Act compliance, FIEO/APEDA partnership roadmap |

---

## 🏰 The Moat — Why XIMVERSE Wins This

**India's ₹28 lakh crore export industry still runs on Excel.**

No hyperbole. Commercial Invoices are typed by hand into Word templates. Packing Lists are copy-pasted from the last shipment. HS codes are looked up in PDFs. Errors cause customs holds that cost ₹2–5 lakh per incident. **There is no AI-powered, self-serve export documentation tool built for Indian MSMEs. Zero.** The incumbents — Customs House Agents, freight forwarders, trade consultants — profit from this complexity and have no incentive to automate it away. We do.

### The wedge: India's agri-commodity SME exporters

XIMVERSE's entry point is **small and mid-sized exporters in India's agri-commodity sector** — rice, spices, pulses — who face three compounding problems:

1. **Manual documentation** — every shipment means retyping the same exporter IEC, GSTIN, and bank details into a fresh Word file
2. **Fragmented workflows** — Commercial Invoice, Packing List, B/L data, and LC terms all live in separate files with no single source of truth
3. **No access to ERPs** — SAP and Oracle cost ₹10–50 lakh to implement; Tally doesn't do export-specific CBEC formats

Unlike generic document tools, XIMVERSE is **purpose-built for export-specific workflows** — Invoice, Packing List, B/L data, LC terms — with pre-mapped templates aligned to DGFT guidelines and real trade practices. This niche is **underserved, highly repetitive, and sticky**: once an exporter's IEC, GSTIN, bank details, and product HS codes are in the system, they never leave.

### Why the moat is real and defensible

| Layer | Why it's hard to copy |
|-------|-----------------------|
| **Undigitized segment, zero competition** | The only "competition" is Excel, WhatsApp-forwarded Word files, and ₹15,000-per-consignment CHAs. No funded startup is targeting this. |
| **Purpose-built for export workflows** | Pre-mapped CBEC templates (Invoice, Packing List, B/L, LC terms) aligned to DGFT — not adapted from a generic doc tool |
| **India-specific compliance formats** | IEC codes, GSTIN validation, Shipping Bill (ICEGATE), DGFT export license fields — a foreign SaaS can't clone this without years of domain work |
| **First-mover relationships** | Deendayal Port Authority pilot, BITS Pilani Startup Hub, FIEO/APEDA pipeline — institutional trust takes years to build and can't be bought |
| **AI roadmap nobody has started** | The regex engine is v1. The AI layer — automatic HS code classification, compliance risk flagging, hallucination-free extraction from any document format — is v2 and nobody has built it for this segment |
| **Government portal integration path** | ICEGATE (customs filing), DGFT (export licenses), FSSAI, MoC — becoming the trusted connector between SMEs and government portals is a decade-long position |

### Expansion path: wedge → ecosystem

```
v1 (now)      Agri-commodity SME exporters (rice, spices, pulses)
              2 documents, CBEC format, deterministic extraction
v2 (Q3 2026)  All MSME commodities, 10-document pack, AI-assisted fill
              Importers + CHAs added as user types
v3 (2027)     API layer for freight forwarders and CHA back-offices (B2B SaaS)
              ICEGATE real-time filing, compliance risk scoring
Platform      1-click complete export pack for every participant:
              exporters → importers → CHAs → freight forwarders →
              inspection agencies → government portals
```

**The wedge is agri-commodity SME exporters.** The platform is the entire Indian cross-border trade ecosystem — a market with no dominant software player, 63 million businesses waiting to be unlocked, and export documentation that has not changed in 30 years.

---

## 🏗️ Tech Stack

### Novel Engineering Decisions

| Decision | Why |
|----------|-----|
| **WebAssembly OCR fallback** | When OCR.space quota is exhausted, we fall back to a client-side WASM pipeline: `pdfjs-dist` renders PDF pages to `<canvas>`, then `Tesseract.js` (WebAssembly) extracts text. Zero server round-trip, zero API key, zero quota. |
| **Regex over LLM** | Trade docs have fixed, labeled fields. Regex is free, instant, and deterministic — no hallucination risk on IEC/GSTIN/bank fields. LLM was prototyped and dropped. |
| **Browser-direct OCR** | OCR.space is called from the browser, not the server. We discovered Vercel's 10s serverless timeout was killing extractions on larger PDFs — moving it client-side eliminated the failure entirely. |
| **Supabase over custom backend** | Auth + DB + storage in one, letting us focus on the pipeline. We evaluated Firebase but chose Supabase for SQL and row-level security on user documents. |

### Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (+ demo user bypass for evaluators) |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| Primary OCR | OCR.space API (browser-direct) |
| Fallback OCR | **Tesseract.js + WebAssembly** (client-side, no API key) |
| PDF Rendering | **pdfjs-dist** (WebAssembly, for Tesseract fallback pipeline) |
| JSON Parsing | Plain JavaScript (regex-based, deterministic) |
| PDF Generation | @react-pdf/renderer |
| Bundling | jszip |
| Deployment | Vercel |

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



Impact

What's visible today is a demo. What we're actually building is infrastructure.

The core insight
Export documents are not paperwork — they are structured information that ports, customs, and logistics systems consume to automate operations. Every delay at an Indian port today is, at its root, a document-handling delay. Fix the document layer and you unlock everything downstream.
Operational impact — turnaround time

Port turnaround time drops when documents arrive clean, validated, and machine-readable.
Customs clearance accelerates because data moves directly between systems instead of being re-keyed.
Fewer manual handoffs means fewer errors, fewer demurrage charges, and faster vessel cycles.

Ease of doing business — unlocking the long tail of exporters
Today, export/import is effectively gated by documentation complexity. A handicraft artisan in Jaipur, a weaver in Varanasi, or a small food processor in Kerala cannot realistically navigate the 30+ document types, multi-agency approvals, and compliance formats required to ship abroad.
Our platform collapses that complexity into a guided, automated workflow — making export accessible to small producers who have always been export-capable but never export-enabled.
Macro-economic flywheel
This is why it matters at a national scale:

More exporters → India's export base diversifies beyond a handful of sectors and large players.
Diversified exports → reduced vulnerability to sector-specific shocks; stronger forex position.
Rising export volume → manufacturing sector expands to meet demand.
Manufacturing growth → job creation across tier-2 and tier-3 cities.
Jobs → disposable income in new hands.
Income → domestic demand for better, more innovative products.
Demand → pressure on manufacturers to innovate and upgrade.
Loop closes — and the economy compounds.

We are solving the bottleneck at step 1 so the rest of the flywheel can actually spin.
Strategic alignment and credibility

Addresses 9 of the 20 "must-have" solutions identified under the India Maritime priority list.
Accepted by DGFT (Directorate General of Foreign Trade), Ministry of Commerce — meaning the approach is validated at the policy level, not just the product level.

Architectural positioning — the "UPI moment" for trade
The analogy we keep coming back to:

PhonePe and Google Pay did not build a payments network. They built the experience layer on top of NPCI's UPI rails.

That is exactly what we are doing for maritime trade.

NLP Marine is the underlying rails — the protocol layer for port and logistics data.
We are the orchestration layer that sits on top — connecting service providers, exporters, customs, and ports into a single automated flow.
Just as UPI unlocked a decade of fintech innovation by abstracting away banking complexity, a clean orchestration layer over MLP Marine can unlock a decade of trade-tech innovation in India.

In one line
We are not digitising documents. We are building the orchestration layer that turns India's maritime trade rails into a platform — so that the next million exporters can plug in, and the economy can compound on top.