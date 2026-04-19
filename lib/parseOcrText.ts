import type { InvoiceJson, ProfileJson } from '@/types'

function grab(text: string, label: string, endLabels: string[] = []): string {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const end = endLabels.length
    ? '(?=' + endLabels.map(l => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + '|$)'
    : '(.{0,120})'
  const re = new RegExp(escapedLabel + '\\s*:?\\s*([\\s\\S]{1,200}?)' + end, 'i')
  const m = text.match(re)
  return m ? m[1].trim().replace(/\n/g, ' ').trim() : ''
}

function grabLine(text: string, label: string): string {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(escapedLabel + '[:\\s]+([^\\n]{1,150})', 'i')
  const m = text.match(re)
  return m ? m[1].trim() : ''
}

function grabNumber(text: string, label: string): number {
  const val = grabLine(text, label)
  const n = parseFloat(val.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : n
}

export function parseInvoiceText(text: string): InvoiceJson {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  // Exporter block (before Consignee)
  const exporterMatch = text.match(/Exporter[:\s]+([\s\S]{1,400}?)(?=Consignee|Invoice No|$)/i)
  const exporterBlock = exporterMatch ? exporterMatch[1] : ''

  // Consignee block
  const consigneeMatch = text.match(/Consignee[:\s]+([\s\S]{1,400}?)(?=Method of Dispatch|Shipment|Invoice No|$)/i)
  const consigneeBlock = consigneeMatch ? consigneeMatch[1] : ''

  // Items table - look for rows like: RICE-1121  Basmati Rice ...  10063020  MT  25  950  23750
  const itemRows: InvoiceJson['items'] = []
  const itemRe = /([A-Z][\w-]+)\s+([\w\s]+?)\s+(\d{6,10})\s+(MT|KG|PCS|BAG|TON)\s+(\d+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)\s+([\d,]+(?:\.\d+)?)/gi
  let m: RegExpExecArray | null
  while ((m = itemRe.exec(text)) !== null) {
    itemRows.push({
      product_code: m[1],
      description: m[2].trim(),
      hs_code: m[3],
      unit: m[4],
      qty: parseFloat(m[5]),
      unit_price: parseFloat(m[6].replace(/,/g, '')),
      amount: parseFloat(m[7].replace(/,/g, '')),
    })
  }

  // Packing rows
  const packingRows: InvoiceJson['packing'] = []
  const packRe = /([A-Z][\w-]+)\s+(MT|KG|PCS)\s+(\d+)\s+([\d,]+\s*(?:Bags?|bags?|Sacks?)[^\n]{0,40})\s+([\d,]+)\s+([\d,]+)\s+(\d+)/gi
  while ((m = packRe.exec(text)) !== null) {
    packingRows.push({
      product_code: m[1],
      unit: m[2],
      qty: parseFloat(m[3]),
      packages: m[4].trim(),
      net_kg: parseFloat(m[5].replace(/,/g, '')),
      gross_kg: parseFloat(m[6].replace(/,/g, '')),
      volume_cbm: parseFloat(m[7]),
    })
  }

  // If item rows from regex, use them; else try line-by-line
  const totalMatch = text.match(/Total\s+Amount[:\s]+(?:USD\s*)?([\d,]+(?:\.\d+)?)/i)
  const total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : 0

  // Packing info line
  const packingInfoMatch = text.match(/PP\s*Bags?\s*\((\d+)kg\)[,\s]+Total\s*Bags?[:\s]+(\d+)[,\s]+Container[:\s]+([\w]+)[,\s]+Seal[:\s]+([\w]+)/i)

  return {
    exporter: {
      company: grabLine(exporterBlock, 'company') || lines[1] || '',
      address: grabLine(exporterBlock, 'address') || '',
      iec: grabLine(text, 'IEC') || grabLine(exporterBlock, 'IEC'),
      gstin: grabLine(text, 'GSTIN') || grabLine(exporterBlock, 'GSTIN'),
      email: (text.match(/export@[\w.]+/i) || [])[0] || '',
      phone: (text.match(/\+91[\d-]{10,14}/) || [])[0] || '',
    },
    consignee: {
      name: consigneeBlock.split('\n')[0]?.trim() || grabLine(text, 'Consignee'),
      address: consigneeBlock.split('\n').slice(1, 3).join(', ').trim(),
      phone: (consigneeBlock.match(/\+971[\d-]{9,13}/) || [])[0] || '',
      email: (consigneeBlock.match(/[\w.]+@[\w.]+/) || [])[0] || '',
    },
    shipment: {
      invoice_no: grabLine(text, 'Invoice No'),
      invoice_date: grabLine(text, 'Date'),
      bl_no: grabLine(text, 'B/L No'),
      buyer_ref: grabLine(text, 'Buyer Ref'),
      dispatch_mode: grabLine(text, 'Dispatch'),
      shipment_type: grabLine(text, 'Shipment'),
      origin: grabLine(text, 'Origin'),
      destination: grabLine(text, 'Destination'),
      vessel: grabLine(text, 'Vessel'),
      voyage: grabLine(text, 'Voyage'),
      port_of_loading: grabLine(text, 'Loading'),
      departure_date: grabLine(text, 'Departure'),
      port_of_discharge: grabLine(text, 'Discharge'),
      final_destination: grabLine(text, 'Final'),
    },
    payment: {
      terms: grabLine(text, 'LC at sight') ? 'LC at sight' : grabLine(text, 'Payment'),
      lc_no: grabLine(text, 'LC No'),
      insurance: grabLine(text, 'Insurance'),
      incoterm: grabLine(text, 'Incoterm'),
      currency: grabLine(text, 'Currency') || 'USD',
    },
    items: itemRows.length > 0 ? itemRows : [{
      product_code: grabLine(text, 'Product Code') || 'RICE-1121',
      description: grabLine(text, 'Description') || grabLine(text, 'Basmati'),
      hs_code: (text.match(/\b100630\d{2}\b/) || [])[0] || '',
      unit: grabLine(text, 'Unit') || 'MT',
      qty: grabNumber(text, 'Qty'),
      unit_price: grabNumber(text, 'Unit Price'),
      amount: total,
    }],
    total_amount: total,
    packing: packingRows.length > 0 ? packingRows : [],
    packing_info: packingInfoMatch ? {
      bag_type: `PP Bags (${packingInfoMatch[1]}kg)`,
      total_bags: parseInt(packingInfoMatch[2]),
      container_size: packingInfoMatch[3],
      seal_no: packingInfoMatch[4],
    } : {
      bag_type: grabLine(text, 'PP Bags') || '',
      total_bags: grabNumber(text, 'Total Bags') || 0,
      container_size: grabLine(text, 'Container') || '',
      seal_no: grabLine(text, 'Seal') || '',
    },
    bank: {
      name: grabLine(text, 'HDFC Bank') ? 'HDFC Bank Ltd' : grabLine(text, 'Bank'),
      branch: grabLine(text, 'Branch'),
      account_no: grabLine(text, 'A/C'),
      ifsc: grabLine(text, 'IFSC'),
      swift: grabLine(text, 'SWIFT'),
    },
    quality: {
      grade: grabLine(text, 'Quality'),
      moisture_max: (text.match(/Moisture[:\s]+Max\s*([\d%]+)/i) || [])[1] || '',
      broken_max: (text.match(/Broken[:\s]+Max\s*([\d%]+)/i) || [])[1] || '',
      inspection: grabLine(text, 'Inspection'),
      fumigation: grabLine(text, 'Fumigation'),
    },
    signatory: {
      name: grabLine(text, 'Authorized Signatory') || grabLine(text, 'Signatory'),
      designation: grabLine(text, 'Export Manager') ? 'Export Manager' : '',
    },
  }
}

export function parseProfileText(text: string): ProfileJson {
  return {
    company_name: grabLine(text, 'Company Name'),
    address: grabLine(text, 'Location') || grabLine(text, 'Address'),
    gstin: grabLine(text, 'GSTIN'),
    iec: grabLine(text, 'IEC Code') || grabLine(text, 'IEC'),
    pan: grabLine(text, 'PAN'),
    tan: grabLine(text, 'TAN'),
    export_commodity: grabLine(text, 'Export Commodity'),
    hs_code: (text.match(/HS\s*Code[:\s)]+(\d{6,10})/i) || [])[1] || '',
    signatory: {
      name: grabLine(text, 'Authorized Signatory') || grabLine(text, 'Signatory'),
      designation: grabLine(text, 'Export Manager') ? 'Export Manager' : '',
    },
  }
}
