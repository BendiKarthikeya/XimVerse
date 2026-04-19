# XIMVERSE

> **Export documentation in minutes, not days.** Upload PDFs → OCR extracts data → templates auto-filled → download customs-ready Commercial Invoice + Packing List.

[![BITS Pilani Startup Hub](https://img.shields.io/badge/Incubated-BITS%20Pilani%20Startup%20Hub-blue)]()
[![Pilot: Deendayal Port](https://img.shields.io/badge/Pilot-Deendayal%20Port-orange)]()
[![Users](https://img.shields.io/badge/Active%20Users-183-green)]()
[![Status](https://img.shields.io/badge/Status-Production%20Pilot-success)]()

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

- **183 active users** across 14 Indian states [EDIT — confirm numbers]
- **Pilot deployment** [EDIT — pick one: "underway" / "scheduled" / "in discussion"] at **Deendayal Port Authority** (Kandla) for real-shipment testing alongside this build
- **Empanelment in progress** with the **Ministry of Ports, Shipping & Waterways** as a service provider [EDIT: replace with exact phrasing you're comfortable defending]
- **Incubated** at **BITS Pilani Startup Hub**
- **Funding** [EDIT — e.g., "pre-seed funded by [investor name]" or "grant-funded via BITS Startup Hub"]
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