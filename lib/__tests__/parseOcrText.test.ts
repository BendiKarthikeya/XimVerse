import { describe, it, expect } from 'vitest'
import { parseInvoiceText, parseProfileText } from '../parseOcrText'

// ── parseInvoiceText ────────────────────────────────────────────────────────

describe('parseInvoiceText', () => {
  it('returns fallback data when given empty string', () => {
    const result = parseInvoiceText('')
    expect(result.exporter?.company).toBe('XIMVERSE EXPORTS PVT LTD')
    expect(result.shipment?.origin).toBe('India')
    expect(result.payment?.currency).toBe('USD')
    expect(result.items?.length).toBeGreaterThan(0)
  })

  it('extracts invoice_no from labelled text', () => {
    const text = 'Invoice No: XIM/EXP/2026/099\nDate: 20 April 2026'
    const result = parseInvoiceText(text)
    expect(result.shipment?.invoice_no).toBe('XIM/EXP/2026/099')
  })

  it('extracts invoice date', () => {
    const text = 'Invoice No: TEST-001\nDate: 15 March 2026'
    const result = parseInvoiceText(text)
    expect(result.shipment?.invoice_date).toBe('15 March 2026')
  })

  it('extracts BL number', () => {
    const text = 'B/L No: BLTEST987654'
    const result = parseInvoiceText(text)
    expect(result.shipment?.bl_no).toBe('BLTEST987654')
  })

  it('extracts shipment origin and destination', () => {
    const text = 'Origin: India\nDestination: Singapore'
    const result = parseInvoiceText(text)
    expect(result.shipment?.origin).toBe('India')
    expect(result.shipment?.destination).toBe('Singapore')
  })

  it('extracts total amount from text', () => {
    const text = 'Total Amount: USD 47500'
    const result = parseInvoiceText(text)
    expect(result.total_amount).toBe(47500)
  })

  it('extracts incoterm and currency', () => {
    const text = 'Incoterm: FOB\nCurrency: EUR'
    const result = parseInvoiceText(text)
    expect(result.payment?.incoterm).toBe('FOB')
    expect(result.payment?.currency).toBe('EUR')
  })

  it('extracts LC number', () => {
    const text = 'LC No: LC2026SG9999'
    const result = parseInvoiceText(text)
    expect(result.payment?.lc_no).toBe('LC2026SG9999')
  })

  it('extracts port of loading', () => {
    const text = 'Loading: Nhava Sheva Port'
    const result = parseInvoiceText(text)
    expect(result.shipment?.port_of_loading).toBe('Nhava Sheva Port')
  })

  it('extracts vessel and voyage', () => {
    const text = 'Vessel: MSC Oscar\nVoyage: VY9001'
    const result = parseInvoiceText(text)
    expect(result.shipment?.vessel).toBe('MSC Oscar')
    expect(result.shipment?.voyage).toBe('VY9001')
  })

  it('falls back to fallback items when no item rows match', () => {
    const result = parseInvoiceText('some unstructured text with no table')
    expect(result.items?.[0]?.product_code).toBeDefined()
    expect(result.items?.[0]?.qty).toBeGreaterThan(0)
  })

  it('returns structured object with all top-level keys', () => {
    const result = parseInvoiceText('')
    const keys = ['exporter', 'consignee', 'shipment', 'payment', 'items', 'total_amount', 'packing', 'packing_info', 'bank', 'quality', 'signatory']
    for (const key of keys) {
      expect(result).toHaveProperty(key)
    }
  })
})

// ── parseProfileText ────────────────────────────────────────────────────────

describe('parseProfileText', () => {
  it('returns fallback data when given empty string', () => {
    const result = parseProfileText('')
    expect(result.company_name).toBe('XIMVERSE EXPORTS PVT LTD')
    expect(result.iec).toBe('XIMV1234567')
    expect(result.gstin).toBe('29ABCDE1234F1Z5')
  })

  it('extracts company_name via row-by-row format', () => {
    const text = 'Company Name   ACME EXPORTS LTD\nLocation   Mumbai, India'
    const result = parseProfileText(text)
    expect(result.company_name).toBe('ACME EXPORTS LTD')
  })

  it('extracts IEC code', () => {
    const text = 'IEC Code   ACME9876543'
    const result = parseProfileText(text)
    expect(result.iec).toBe('ACME9876543')
  })

  it('extracts GSTIN', () => {
    const text = 'GSTIN   27AAAAA0000A1Z5'
    const result = parseProfileText(text)
    expect(result.gstin).toBe('27AAAAA0000A1Z5')
  })

  it('extracts PAN and TAN', () => {
    const text = 'PAN   AAAAA9999A\nTAN   MUMX99999X'
    const result = parseProfileText(text)
    expect(result.pan).toBe('AAAAA9999A')
    expect(result.tan).toBe('MUMX99999X')
  })

  it('extracts export commodity and strips HS Code suffix', () => {
    const text = 'Export Commodity   Wheat Flour (HS Code: 11010000)'
    const result = parseProfileText(text)
    expect(result.export_commodity).toBe('Wheat Flour')
  })

  it('extracts HS code from text', () => {
    const text = 'HS Code: 10019900'
    const result = parseProfileText(text)
    expect(result.hs_code).toBe('10019900')
  })

  it('extracts signatory from Authorized Signatory block', () => {
    const text = 'Authorized Signatory\nRajesh Kumar\nExport Manager'
    const result = parseProfileText(text)
    expect(result.signatory?.name).toBe('Rajesh Kumar')
    expect(result.signatory?.designation).toBe('Export Manager')
  })

  it('returns structured object with all top-level keys', () => {
    const result = parseProfileText('')
    const keys = ['company_name', 'address', 'gstin', 'iec', 'pan', 'tan', 'export_commodity', 'hs_code', 'signatory']
    for (const key of keys) {
      expect(result).toHaveProperty(key)
    }
  })
})
