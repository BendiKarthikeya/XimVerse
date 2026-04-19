export interface Profile {
  id: string
  user_id: string
  company_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  iec: string | null
  gstin: string | null
  pan: string | null
  tan: string | null
  export_commodity: string | null
  signatory_name: string | null
  signatory_designation: string | null
  bank_name: string | null
  bank_branch: string | null
  bank_account: string | null
  bank_ifsc: string | null
  bank_swift: string | null
  created_at: string
  updated_at: string
}

export interface SourceDocument {
  id: string
  user_id: string
  file_name: string
  file_url: string | null
  doc_type: 'invoice' | 'company_profile'
  extracted_json: InvoiceJson | ProfileJson | null
  created_at: string
}

export interface Consignment {
  id: string
  user_id: string
  consignment_no: string
  buyer_name: string | null
  product: string | null
  quantity: number | null
  unit: string | null
  amount: number | null
  currency: string
  status: 'draft' | 'generated' | 'downloaded'
  source_json: InvoiceJson | null
  created_at: string
  updated_at: string
}

export interface GeneratedFile {
  id: string
  consignment_id: string
  file_type: 'commercial_invoice' | 'packing_list'
  file_url: string | null
  created_at: string
}

// OCR extracted shapes
export interface InvoiceJson {
  exporter?: {
    company?: string
    address?: string
    iec?: string
    gstin?: string
    email?: string
    phone?: string
  }
  consignee?: {
    name?: string
    address?: string
    phone?: string
    email?: string
  }
  shipment?: {
    invoice_no?: string
    invoice_date?: string
    bl_no?: string
    buyer_ref?: string
    dispatch_mode?: string
    shipment_type?: string
    origin?: string
    destination?: string
    vessel?: string
    voyage?: string
    port_of_loading?: string
    departure_date?: string
    port_of_discharge?: string
    final_destination?: string
  }
  payment?: {
    terms?: string
    lc_no?: string
    insurance?: string
    incoterm?: string
    currency?: string
  }
  items?: Array<{
    product_code?: string
    description?: string
    hs_code?: string
    unit?: string
    qty?: number
    unit_price?: number
    amount?: number
  }>
  total_amount?: number
  packing?: Array<{
    product_code?: string
    description?: string
    unit?: string
    qty?: number
    packages?: string
    net_kg?: number
    gross_kg?: number
    volume_cbm?: number
  }>
  packing_info?: {
    bag_type?: string
    total_bags?: number
    container_size?: string
    seal_no?: string
  }
  bank?: {
    name?: string
    branch?: string
    account_no?: string
    ifsc?: string
    swift?: string
  }
  quality?: {
    grade?: string
    moisture_max?: string
    broken_max?: string
    inspection?: string
    fumigation?: string
  }
  signatory?: {
    name?: string
    designation?: string
  }
}

export interface ProfileJson {
  company_name?: string
  address?: string
  gstin?: string
  iec?: string
  pan?: string
  tan?: string
  export_commodity?: string
  hs_code?: string
  signatory?: {
    name?: string
    designation?: string
  }
}
