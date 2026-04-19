# XIMVERSE — Claude Code Guide

## Product Summary
One-page export documentation web app. Users upload PDFs → OCR extracts data → JSON parsed → templates auto-filled → PDFs downloaded. Hackathon build, prioritize working demo over polish.

---

## Tech Stack
| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (+ "Continue as Demo User" bypass) |
| Database | Supabase PostgreSQL |
| File Storage | Supabase Storage |
| OCR | OCR.space API (free tier) |
| JSON Parsing | Plain JS regex / string manipulation |
| PDF Generation | @react-pdf/renderer (primary), pdf-lib (fallback) |
| Download Bundling | jszip |
| Icons | lucide-react |
| Deployment | Vercel |

---

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OCR_SPACE_API_KEY=
```

---

## Database Schema (Supabase PostgreSQL)

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | = auth.users.id |
| company_name | text | |
| email | text | |
| phone | text | |
| address | text | |
| iec | text | Importer Exporter Code |
| gst | text | GST number |
| created_at | timestamptz | |

### `source_documents`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → profiles | |
| file_name | text | |
| file_url | text | Supabase Storage URL |
| doc_type | text | 'invoice' \| 'company_profile' \| 'other' |
| extracted_json | jsonb | OCR result parsed to JSON |
| created_at | timestamptz | |

### `consignments`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → profiles | |
| consignment_no | text | auto-generated e.g. XIM-2024-001 |
| buyer_name | text | |
| product | text | |
| quantity | numeric | |
| amount | numeric | |
| currency | text | default 'USD' |
| status | text | 'draft' \| 'generated' \| 'downloaded' |
| source_json | jsonb | merged JSON from uploaded docs |
| created_at | timestamptz | |

### `generated_files`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| consignment_id | uuid FK → consignments | |
| file_type | text | 'commercial_invoice' \| 'packing_list' |
| file_url | text | Supabase Storage URL |
| created_at | timestamptz | |

---

## Supabase Storage Buckets
- `source-documents` — uploaded source PDFs (private)
- `generated-pdfs` — generated output PDFs (private)

---

## Project File Structure
```
/app
  layout.tsx              # Root layout, Supabase provider
  page.tsx                # Single dashboard page
  /api
    /ocr/route.ts         # POST: upload PDF → OCR.space → return text
    /parse/route.ts       # POST: raw OCR text → structured JSON
/components
  /dashboard
    ProfileCard.tsx
    UploadSection.tsx
    CreateConsignment.tsx
    ConsignmentHistory.tsx
    NewsSection.tsx
  /pdf
    CommercialInvoice.tsx  # @react-pdf/renderer template
    PackingList.tsx        # @react-pdf/renderer template
  /ui                      # Shared small components
/lib
  supabase.ts              # Supabase client (browser + server)
  ocr.ts                   # OCR.space API wrapper
  parseOcrText.ts          # Regex/NLP text → JSON
  generateConsignmentNo.ts
/types
  index.ts                 # Shared TypeScript types
```

---

## Core Workflows

### 1. Upload & OCR
1. User uploads PDF in `UploadSection`
2. File uploaded to Supabase Storage `source-documents`
3. `/api/ocr` sends file to OCR.space, returns raw text
4. `/api/parse` converts text → structured JSON
5. JSON saved to `source_documents.extracted_json`

### 2. Create Consignment
1. User clicks "+ Create New Consignment"
2. System reads latest `extracted_json` from source_documents
3. Merges with profile data
4. Creates row in `consignments` table
5. Renders `CommercialInvoice` + `PackingList` PDFs
6. PDFs saved to Supabase Storage `generated-pdfs`
7. URLs saved to `generated_files`

### 3. Download
1. User clicks Download in history table
2. Both PDFs fetched from Supabase Storage
3. Bundled into ZIP via jszip
4. Browser download triggered

---

## Auth Strategy
- Real: Supabase email/password auth
- Demo bypass: "Continue as Demo User" button → uses a fixed demo UUID, skips auth entirely
- All DB queries use `user_id` filter; demo user has seeded profile data

---

## Fixed Document Formats

Users always upload exactly these two PDF types. The format is fixed, so the regex parser is precise.

### Doc 1 — Commercial Invoice & Packing List (`doc_type: 'invoice'`)
Uploaded per consignment. Contains all shipment-specific data.

Parsed JSON shape:
```json
{
  "exporter": {
    "company": "XIMVERSE EXPORTS PVT LTD",
    "address": "#45, Whitefield Industrial Area, Bengaluru, Karnataka, India – 560066",
    "iec": "XIMV1234567",
    "gstin": "29ABCDE1234F1Z5",
    "email": "export@ximverse.com",
    "phone": "+91-9876543210"
  },
  "consignee": {
    "name": "Al Noor Food Trading LLC",
    "address": "Warehouse No. 12, Al Aweer Market, Dubai, UAE",
    "phone": "+971-501234567",
    "email": "procurement@alnoorfoods.ae"
  },
  "shipment": {
    "invoice_no": "XIM/EXP/2026/045",
    "invoice_date": "19 April 2026",
    "bl_no": "BLXIM456789",
    "buyer_ref": "ANFT-RICE-APR26",
    "dispatch_mode": "Sea Freight",
    "shipment_type": "FCL",
    "origin": "India",
    "destination": "UAE",
    "vessel": "MSC Valencia",
    "voyage": "VY4587",
    "port_of_loading": "Chennai Port",
    "departure_date": "25 April 2026",
    "port_of_discharge": "Jebel Ali Port",
    "final_destination": "Dubai Warehouse"
  },
  "payment": {
    "terms": "LC at sight",
    "lc_no": "LC2026UAE4587",
    "insurance": "MARINE12345XIM",
    "incoterm": "CIF",
    "currency": "USD"
  },
  "items": [
    {
      "product_code": "RICE-1121",
      "description": "Basmati Rice 1121 Steam",
      "hs_code": "10063020",
      "unit": "MT",
      "qty": 25,
      "unit_price": 950,
      "amount": 23750
    }
  ],
  "total_amount": 23750,
  "packing": [
    {
      "product_code": "RICE-1121",
      "unit": "MT",
      "qty": 25,
      "packages": "1000 Bags (25kg)",
      "net_kg": 25000,
      "gross_kg": 25500,
      "volume_cbm": 33
    }
  ],
  "packing_info": {
    "bag_type": "PP Bags (25kg)",
    "total_bags": 1000,
    "container_size": "20ft",
    "seal_no": "SEAL789456"
  },
  "bank": {
    "name": "HDFC Bank Ltd",
    "branch": "Whitefield Branch",
    "account_no": "50200012345678",
    "ifsc": "HDFC0001234",
    "swift": "HDFCINBBXXX"
  },
  "quality": {
    "grade": "Premium",
    "moisture_max": "12%",
    "broken_max": "2%",
    "inspection": "SGS",
    "fumigation": "Done"
  },
  "signatory": {
    "name": "Ashutosh Rai",
    "designation": "Export Manager"
  }
}
```

### Doc 2 — Company Profile (`doc_type: 'company_profile'`)
Uploaded once. Populates the `profiles` table. Re-used across all consignments.

Parsed JSON shape:
```json
{
  "company_name": "XIMVERSE EXPORTS PVT LTD",
  "address": "#45, Whitefield Industrial Area, Bengaluru, Karnataka, India – 560066",
  "gstin": "29ABCDE1234F1Z5",
  "iec": "XIMV1234567",
  "pan": "ABCDE1234F",
  "tan": "BLRA12345B",
  "export_commodity": "Basmati Rice 1121 Steam",
  "hs_code": "10063020",
  "signatory": {
    "name": "Ashutosh Rai",
    "designation": "Export Manager"
  }
}
```

### Data Ownership Rules
- Doc 2 JSON → saved to `profiles` table (once; re-upload overwrites)
- Doc 1 JSON → saved to `source_documents.extracted_json`; `consignee`, `shipment`, `payment`, `items`, `packing` fields drive the `consignments` row
- Exporter block in Doc 1 is cross-referenced with `profiles` — not stored separately
- `consignments.source_json` stores the full merged Doc 1 JSON for PDF rendering

### Regex Anchor Labels (fixed in this format)
Parser targets these exact label strings:
```
"Exporter:" / "Consignee:" / "Invoice No:" / "Date:" / "B/L No:" / "Buyer Ref:"
"Dispatch:" / "Shipment:" / "Origin:" / "Destination:" / "Vessel:" / "Voyage:"
"Loading:" / "Departure:" / "Discharge:" / "Final:"
"LC at sight" / "LC No:" / "Insurance:" / "Incoterm:" / "Currency:"
"Total Amount:" / "Packing Info:" / "Bank Details:"
"Company Name" / "Location" / "GSTIN" / "IEC Code" / "PAN" / "TAN" / "Export Commodity"
```

---

## Output PDF Templates — Exact Field Mapping

Both output templates are fixed-layout bordered tables (recreated pixel-accurately with @react-pdf/renderer). Data is pulled from `profiles` + `consignments.source_json` at render time.

### Commercial Invoice

| Template Cell | Data Source |
|---|---|
| Exporter | `profiles`: company_name, address, iec, gstin, email, phone |
| Pages | hardcoded "1 of 1" |
| Invoice Number & Date | `source_json.shipment.invoice_no` + `invoice_date` |
| Bill of Lading Number | `source_json.shipment.bl_no` |
| Reference | `consignments.consignment_no` |
| Buyer Reference | `source_json.shipment.buyer_ref` |
| Consignee | `source_json.consignee.name` + `address` |
| Buyer (If not Consignee) | same as Consignee |
| Method of Dispatch | `source_json.shipment.dispatch_mode` |
| Type of Shipment | `source_json.shipment.shipment_type` |
| Country Of Origin of Goods | `source_json.shipment.origin` |
| Country of Final Destination | `source_json.shipment.destination` |
| Vessel / Aircraft | `source_json.shipment.vessel` |
| Voyage No | `source_json.shipment.voyage` |
| Terms / Method of Payment | `source_json.payment.terms` |
| Port of Loading | `source_json.shipment.port_of_loading` |
| Date of Departure | `source_json.shipment.departure_date` |
| Port of Discharge | `source_json.shipment.port_of_discharge` |
| Final Destination | `source_json.shipment.final_destination` |
| Marine Cover Policy No | `source_json.payment.insurance` |
| Letter Of Credit No | `source_json.payment.lc_no` |
| Product table rows | `source_json.items[]`: product_code, description, hs_code, unit_qty, unit_type, price, amount |
| Total This Page / Consignment Total | sum of `source_json.items[].amount` |
| Additional Info | `source_json.quality`: grade, moisture_max, broken_max, inspection, fumigation |
| TOTAL | `consignments.amount` |
| Incoterms® 2020 | `source_json.payment.incoterm` |
| Currency | `source_json.payment.currency` |
| Signatory Company | `profiles.company_name` |
| Name of Authorized Signatory | `source_json.signatory.name` + `designation` |
| Bank Details | `source_json.bank`: name, branch, account_no, ifsc, swift |
| Signature | blank (signed manually) |

### Packing List

| Template Cell | Data Source |
|---|---|
| Exporter | `profiles`: company_name, address |
| Pages | hardcoded "1 of 1" |
| Export Invoice Number & Date | `source_json.shipment.invoice_no` + `invoice_date` |
| Bill of Lading Number | `source_json.shipment.bl_no` |
| Reference | `consignments.consignment_no` |
| Buyer Reference | `source_json.shipment.buyer_ref` |
| Consignee | `source_json.consignee.name` + `address` |
| Buyer (If not Consignee) | same as Consignee |
| Method of Dispatch | `source_json.shipment.dispatch_mode` |
| Type of Shipment | `source_json.shipment.shipment_type` |
| Country Of Origin of Goods | `source_json.shipment.origin` |
| Country of Final Destination | `source_json.shipment.destination` |
| Vessel / Aircraft | `source_json.shipment.vessel` |
| Voyage No | `source_json.shipment.voyage` |
| Packing Information cell | `source_json.packing_info`: bag_type, total_bags, container_size, seal_no |
| Port of Loading | `source_json.shipment.port_of_loading` |
| Date of Departure | `source_json.shipment.departure_date` |
| Port of Discharge | `source_json.shipment.port_of_discharge` |
| Final Destination | `source_json.shipment.final_destination` |
| Product table rows | `source_json.packing[]`: product_code, description, unit_qty, packages, net_kg, gross_kg, volume_cbm |
| Total This Page / Consignment Total | sum of packages / weights |
| Additional Info | `source_json.quality`: grade, moisture_max, broken_max, inspection, fumigation |
| Signatory Company | `profiles.company_name` |
| Name of Authorized Signatory | `source_json.signatory.name` + `designation` |
| Signature | blank (signed manually) |

### Rendering Notes
- Both templates use `@react-pdf/renderer` with `dynamic import + ssr: false`
- Layout is a bordered table grid — use `<View>` with `border` styles, no HTML tables
- Preview: render in-browser using `<PDFViewer>` (full-page modal or panel)
- Download: use `<PDFDownloadLink>` or `pdf().toBlob()` → trigger anchor download
- ZIP bundling: both PDFs → `jszip` → single `.zip` download

---

## Development Commands
```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run type-check   # TypeScript check without emit
```

---

## Implementation Order
1. Supabase schema — run migrations, create buckets
2. Next.js project scaffold — install all deps
3. Supabase client + auth (demo bypass)
4. Profile section — read/write profiles table
5. Upload section — Storage upload + OCR API route
6. JSON parser — regex extraction from OCR text
7. Create Consignment flow — DB write + PDF render
8. PDF templates (Commercial Invoice + Packing List)
9. Consignment history table + download ZIP
10. News section (static mock data)
11. Polish UI, deploy to Vercel

---

## Key Constraints
- OCR.space free tier: 500 requests/month, max 1MB per file
- @react-pdf/renderer must render client-side (use dynamic import with ssr: false)
- Supabase free tier: 500MB DB, 1GB storage — fine for demo
- All PDF generation happens in browser, not server
