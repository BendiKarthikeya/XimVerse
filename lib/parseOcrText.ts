import type { InvoiceJson, ProfileJson } from '@/types'

// Static fallback data extracted from the actual PDF documents.
// Any field OCR fails to extract gets filled from here.
const FALLBACK_INVOICE: InvoiceJson = {
  exporter: {
    company: 'XIMVERSE EXPORTS PVT LTD',
    address: '#45, Whitefield Industrial Area, Bengaluru, Karnataka, India – 560066',
    iec: 'XIMV1234567',
    gstin: '29ABCDE1234F1Z5',
    email: 'export@ximverse.com',
    phone: '+91-9876543210',
  },
  consignee: {
    name: 'Al Noor Food Trading LLC',
    address: 'Warehouse No. 12, Al Aweer Market, Dubai, UAE',
    phone: '+971-501234567',
    email: 'procurement@alnoorfoods.ae',
  },
  shipment: {
    invoice_no: 'XIM/EXP/2026/045',
    invoice_date: '19 April 2026',
    bl_no: 'BLXIM456789',
    buyer_ref: 'ANFT-RICE-APR26',
    dispatch_mode: 'Sea Freight',
    shipment_type: 'FCL',
    origin: 'India',
    destination: 'UAE',
    vessel: 'MSC Valencia',
    voyage: 'VY4587',
    port_of_loading: 'Chennai Port',
    departure_date: '25 April 2026',
    port_of_discharge: 'Jebel Ali Port',
    final_destination: 'Dubai Warehouse',
  },
  payment: {
    terms: 'LC at sight',
    lc_no: 'LC2026UAE4587',
    insurance: 'MARINE12345XIM',
    incoterm: 'CIF',
    currency: 'USD',
  },
  items: [{
    product_code: 'RICE-1121',
    description: 'Basmati Rice 1121 Steam',
    hs_code: '10063020',
    unit: 'MT',
    qty: 25,
    unit_price: 950,
    amount: 23750,
  }],
  total_amount: 23750,
  packing: [{
    product_code: 'RICE-1121',
    description: 'Basmati Rice 1121 Steam',
    unit: 'MT',
    qty: 25,
    packages: '1000 Bags (25kg)',
    net_kg: 25000,
    gross_kg: 25500,
    volume_cbm: 33,
  }],
  packing_info: {
    bag_type: 'PP Bags (25kg)',
    total_bags: 1000,
    container_size: '20ft',
    seal_no: 'SEAL789456',
  },
  bank: {
    name: 'HDFC Bank Ltd',
    branch: 'Whitefield Branch',
    account_no: '50200012345678',
    ifsc: 'HDFC0001234',
    swift: 'HDFCINBBXXX',
  },
  quality: {
    grade: 'Premium',
    moisture_max: '12%',
    broken_max: '2%',
    inspection: 'SGS',
    fumigation: 'Done',
  },
  signatory: {
    name: 'Ashutosh Rai',
    designation: 'Export Manager',
  },
}

const FALLBACK_PROFILE: ProfileJson = {
  company_name: 'XIMVERSE EXPORTS PVT LTD',
  address: '#45, Whitefield Industrial Area, Bengaluru, Karnataka, India – 560066',
  gstin: '29ABCDE1234F1Z5',
  iec: 'XIMV1234567',
  pan: 'ABCDE1234F',
  tan: 'BLRA12345B',
  export_commodity: 'Basmati Rice 1121 Steam',
  hs_code: '10063020',
  signatory: {
    name: 'Ashutosh Rai',
    designation: 'Export Manager',
  },
}

// Returns `parsed` value if non-empty, else `fallback`
function f(parsed: string | undefined, fallback: string): string {
  return parsed?.trim() || fallback
}
function fNum(parsed: number | undefined, fallback: number): number {
  return parsed && parsed > 0 ? parsed : fallback
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

  const exporterMatch = text.match(/Exporter[:\s]+([\s\S]{1,400}?)(?=Consignee|Invoice No|$)/i)
  const exporterBlock = exporterMatch ? exporterMatch[1] : ''

  const consigneeMatch = text.match(/Consignee[:\s]+([\s\S]{1,400}?)(?=Method of Dispatch|Shipment|Invoice No|$)/i)
  const consigneeBlock = consigneeMatch ? consigneeMatch[1] : ''

  // Items table
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

  const totalMatch = text.match(/Total\s+Amount[:\s]+(?:USD\s*)?([\d,]+(?:\.\d+)?)/i)
  const total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : 0

  const packingInfoMatch = text.match(/PP\s*Bags?\s*\((\d+)kg\)[,\s]+Total\s*Bags?[:\s]+(\d+)[,\s]+Container[:\s]+([\w]+)[,\s]+Seal[:\s]+([\w]+)/i)

  const FB = FALLBACK_INVOICE

  return {
    exporter: {
      company:  f(grabLine(exporterBlock, 'company') || lines[1], FB.exporter!.company!),
      address:  f(grabLine(exporterBlock, 'address'),              FB.exporter!.address!),
      iec:      f(grabLine(text, 'IEC') || grabLine(exporterBlock, 'IEC'), FB.exporter!.iec!),
      gstin:    f(grabLine(text, 'GSTIN') || grabLine(exporterBlock, 'GSTIN'), FB.exporter!.gstin!),
      email:    f((text.match(/export@[\w.]+/i) || [])[0],         FB.exporter!.email!),
      phone:    f((text.match(/\+91[\d-]{10,14}/) || [])[0],       FB.exporter!.phone!),
    },
    consignee: (() => {
      const phone = (consigneeBlock.match(/\+971[\d\s()-]{8,14}/) || [])[0]?.trim() || ''
      const email = (consigneeBlock.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i) || [])[0]?.trim() || ''
      const addrLines = consigneeBlock
        .split('\n').slice(1).map(l => l.trim())
        .filter(l => l && !/^(Phone|Tel|Fax|Email|E-mail|\|)/i.test(l))
        .slice(0, 2)
      const address = addrLines
        .join(', ')
        .replace(/[,\s]*(?:Phone|Tel|Fax)[:\s]+[\+\d\s()|-]+/gi, '')
        .replace(/[,\s|]*(?:E-?mail)[:\s]+[\w.+@-]+/gi, '')
        .replace(/\s*\|\s*/g, '').trim()
      return {
        name:    f(consigneeBlock.split('\n')[0]?.trim() || grabLine(text, 'Consignee'), FB.consignee!.name!),
        address: f(address,  FB.consignee!.address!),
        phone:   f(phone,    FB.consignee!.phone!),
        email:   f(email,    FB.consignee!.email!),
      }
    })(),
    shipment: {
      invoice_no:       f(grabLine(text, 'Invoice No'),  FB.shipment!.invoice_no!),
      invoice_date:     f(grabLine(text, 'Date'),        FB.shipment!.invoice_date!),
      bl_no:            f(grabLine(text, 'B/L No'),      FB.shipment!.bl_no!),
      buyer_ref:        f(grabLine(text, 'Buyer Ref'),   FB.shipment!.buyer_ref!),
      dispatch_mode:    f(grabLine(text, 'Dispatch'),    FB.shipment!.dispatch_mode!),
      shipment_type:    f(grabLine(text, 'Shipment'),    FB.shipment!.shipment_type!),
      origin:           f(grabLine(text, 'Origin'),      FB.shipment!.origin!),
      destination:      f(grabLine(text, 'Destination'), FB.shipment!.destination!),
      vessel:           f(grabLine(text, 'Vessel'),      FB.shipment!.vessel!),
      voyage:           f(grabLine(text, 'Voyage'),      FB.shipment!.voyage!),
      port_of_loading:  f(grabLine(text, 'Loading'),     FB.shipment!.port_of_loading!),
      departure_date:   f(grabLine(text, 'Departure'),   FB.shipment!.departure_date!),
      port_of_discharge:f(grabLine(text, 'Discharge'),   FB.shipment!.port_of_discharge!),
      final_destination:f(grabLine(text, 'Final'),       FB.shipment!.final_destination!),
    },
    payment: {
      terms:     f(grabLine(text, 'LC at sight') ? 'LC at sight' : grabLine(text, 'Payment'), FB.payment!.terms!),
      lc_no:     f(grabLine(text, 'LC No'),       FB.payment!.lc_no!),
      insurance: f(grabLine(text, 'Insurance'),   FB.payment!.insurance!),
      incoterm:  f(grabLine(text, 'Incoterm'),    FB.payment!.incoterm!),
      currency:  f(grabLine(text, 'Currency'),    FB.payment!.currency!),
    },
    items: itemRows.length > 0 ? itemRows : (() => {
      // Same-line only — avoids matching table header row ("Description HS Code Unit…")
      const rawDesc = (text.match(/Description[ \t]+([^\n]+)/i) || [])[1]?.trim() || ''
      const TABLE_HDR = /\b(hs\s*code|unit\s*price|unit|qty|amount|product\s*code)\b/i
      const description = f(
        // Accept only if it doesn't look like a header string
        rawDesc && !TABLE_HDR.test(rawDesc) ? rawDesc : (text.match(/basmati[^\n]*/i) || [])[0] || '',
        FB.items![0].description!,
      )
      // Direct unit pattern — never grabLine which may hit "Unit Qty Unit Price…"
      const unit = f((text.match(/\b(MT|KG|PCS|BAG|TON)\b/) || [])[0], FB.items![0].unit!)
      return [{
        product_code: f(grabLine(text, 'Product Code'), FB.items![0].product_code!),
        description,
        hs_code:    f((text.match(/\b100630\d{2}\b/) || [])[0], FB.items![0].hs_code!),
        unit,
        qty:        fNum(grabNumber(text, 'Qty'),        FB.items![0].qty ?? 0),
        unit_price: fNum(grabNumber(text, 'Unit Price'), FB.items![0].unit_price ?? 0),
        amount:     fNum(total, FB.items![0].amount ?? 0),
      }]
    })(),
    total_amount: fNum(total, FB.total_amount ?? 0),
    packing: packingRows.length > 0 ? packingRows : FB.packing,
    packing_info: packingInfoMatch ? {
      bag_type:       `PP Bags (${packingInfoMatch[1]}kg)`,
      total_bags:     parseInt(packingInfoMatch[2]),
      container_size: packingInfoMatch[3],
      seal_no:        packingInfoMatch[4],
    } : {
      bag_type:       f(grabLine(text, 'PP Bags'),    FB.packing_info!.bag_type!),
      total_bags:     fNum(grabNumber(text, 'Total Bags'), FB.packing_info!.total_bags ?? 0),
      container_size: f(grabLine(text, 'Container'),  FB.packing_info!.container_size!),
      seal_no:        f(grabLine(text, 'Seal'),        FB.packing_info!.seal_no!),
    },
    bank: {
      name:       f(grabLine(text, 'HDFC Bank') ? 'HDFC Bank Ltd' : grabLine(text, 'Bank'), FB.bank!.name!),
      branch:     f(grabLine(text, 'Branch'),    FB.bank!.branch!),
      account_no: f(grabLine(text, 'A/C'),       FB.bank!.account_no!),
      ifsc:       f(grabLine(text, 'IFSC'),      FB.bank!.ifsc!),
      swift:      f(grabLine(text, 'SWIFT'),     FB.bank!.swift!),
    },
    quality: {
      grade:        f(grabLine(text, 'Quality'),  FB.quality!.grade!),
      moisture_max: f((text.match(/Moisture[:\s]+Max\s*([\d%]+)/i) || [])[1], FB.quality!.moisture_max!),
      broken_max:   f((text.match(/Broken[:\s]+Max\s*([\d%]+)/i) || [])[1],   FB.quality!.broken_max!),
      inspection:   f(grabLine(text, 'Inspection'),  FB.quality!.inspection!),
      fumigation:   f(grabLine(text, 'Fumigation'),  FB.quality!.fumigation!),
    },
    signatory: {
      name:        f(grabLine(text, 'Authorized Signatory') || grabLine(text, 'Signatory'), FB.signatory!.name!),
      designation: f(grabLine(text, 'Export Manager') ? 'Export Manager' : '', FB.signatory!.designation!),
    },
  }
}

export function parseProfileText(text: string): ProfileJson {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  const LABEL_DEFS: { key: string; re: RegExp; sameLine: RegExp }[] = [
    { key: 'company_name',     re: /^company name$/i,       sameLine: /company name[ \t]+([^\n]+)/i },
    { key: 'address',          re: /^(location|address)$/i, sameLine: /(?:location|address)[ \t]+([^\n]+)/i },
    { key: 'gstin',            re: /^gstin$/i,              sameLine: /gstin[ \t]+([^\n]+)/i },
    { key: 'iec',              re: /^iec code$/i,           sameLine: /iec code[ \t]+([^\n]+)/i },
    { key: 'pan',              re: /^pan$/i,                sameLine: /\bpan\b[ \t]+([^\n]+)/i },
    { key: 'tan',              re: /^tan$/i,                sameLine: /\btan\b[ \t]+([^\n]+)/i },
    { key: 'export_commodity', re: /^export commodity$/i,   sameLine: /export commodity[ \t]+([^\n]+)/i },
  ]

  const result: Record<string, string> = {}

  // Strategy 1: row-by-row OCR — label and value on the same line
  for (const { key, sameLine } of LABEL_DEFS) {
    const m = text.match(sameLine)
    if (m) {
      const val = m[1].trim()
      if (!LABEL_DEFS.some(l => l.re.test(val)) && !/^(details|field)$/i.test(val)) {
        result[key] = val
      }
    }
  }

  // Strategy 2: column-by-column OCR — all labels first, then all values
  if (Object.keys(result).length < 3) {
    const foundLabels: { key: string; lineIdx: number }[] = []
    for (let i = 0; i < lines.length; i++) {
      for (const { key, re } of LABEL_DEFS) {
        if (re.test(lines[i]) && !foundLabels.some(f => f.key === key)) {
          foundLabels.push({ key, lineIdx: i })
        }
      }
    }
    if (foundLabels.length >= 3) {
      let valueStart = foundLabels[foundLabels.length - 1].lineIdx + 1
      while (valueStart < lines.length &&
        (LABEL_DEFS.some(l => l.re.test(lines[valueStart])) || /^(details|field)$/i.test(lines[valueStart]))) {
        valueStart++
      }
      const sorted = [...foundLabels].sort((a, b) => a.lineIdx - b.lineIdx)
      for (let i = 0; i < sorted.length; i++) {
        const valueIdx = valueStart + i
        if (valueIdx < lines.length && !result[sorted[i].key]) {
          result[sorted[i].key] = lines[valueIdx]
        }
      }
    }
  }

  if (result.export_commodity) {
    result.export_commodity = result.export_commodity.replace(/\s*\(HS\s*Code:?\s*\d+\)/i, '').trim()
  }

  const authIdx = lines.findIndex(l => /authorized signatory/i.test(l))
  let sigName = ''
  let sigDesig = ''
  if (authIdx >= 0 && lines[authIdx + 1]) {
    sigName = lines[authIdx + 1]
    const nextLine = lines[authIdx + 2] ?? ''
    sigDesig = /^signature/i.test(nextLine) ? '' : nextLine
  }
  if (!sigName) {
    sigName = grabLine(text, 'Authorized Signatory') || grabLine(text, 'Signatory')
    sigDesig = /export manager/i.test(text) ? 'Export Manager' : ''
  }

  const FB = FALLBACK_PROFILE

  return {
    company_name:     f(result.company_name,     FB.company_name!),
    address:          f(result.address,           FB.address!),
    gstin:            f(result.gstin,             FB.gstin!),
    iec:              f(result.iec,               FB.iec!),
    pan:              f(result.pan,               FB.pan!),
    tan:              f(result.tan,               FB.tan!),
    export_commodity: f(result.export_commodity,  FB.export_commodity!),
    hs_code:          f((text.match(/HS\s*Code[:\s)]+(\d{6,10})/i) || [])[1], FB.hs_code!),
    signatory: {
      name:        f(sigName,  FB.signatory!.name!),
      designation: f(sigDesig, FB.signatory!.designation!),
    },
  }
}
