# Security Policy

## Scope

XIMVERSE handles sensitive Indian business data — GSTIN, IEC codes, PAN, bank account numbers, and commercial invoices. We take security seriously.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email: export@ximverse.com with subject: `[SECURITY] <brief description>`

We will acknowledge within 48 hours and aim to patch within 7 days for critical issues.

## What We Protect

| Data | Protection |
|------|-----------|
| Uploaded PDFs | Private Supabase Storage buckets; row-level security per `user_id` |
| Extracted JSON (IEC, GSTIN, bank details) | Stored in PostgreSQL with RLS — users can only read their own rows |
| OCR text | Not persisted — discarded after structured JSON is extracted |
| Auth tokens | Managed by Supabase Auth; never stored in localStorage |
| API keys | `OCR_SPACE_API_KEY` is server-side only; never exposed to browser |

## Known Limitations (Free Tier)

- OCR.space receives document text for processing. We use their API under their privacy terms. For maximum privacy, the WebAssembly fallback (Tesseract.js) can be configured as the primary engine — it runs entirely in-browser with no third-party data transfer.
- Supabase free tier is used; data is hosted in the default AWS region.

## Compliance

We are building toward alignment with:
- India's **Digital Personal Data Protection Act, 2023 (DPDP Act)**
- **ISO 27001** principles for data handling

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (main branch) | ✅ |
| Older commits | Not supported |
