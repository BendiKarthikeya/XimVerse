import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { InvoiceJson } from '@/types'
import type { Profile } from '@/types'

const S = StyleSheet.create({
  page: { fontSize: 8, fontFamily: 'Helvetica', padding: 28, color: '#000' },
  title: { fontSize: 13, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 10, letterSpacing: 1 },
  table: { display: 'flex', flexDirection: 'column', border: '1pt solid #000' },
  row: { flexDirection: 'row' },
  cell: { padding: '4 6', border: '0.5pt solid #000', flex: 1, fontSize: 8 },
  cellHalf: { padding: '4 6', border: '0.5pt solid #000', width: '50%', fontSize: 8 },
  bold: { fontFamily: 'Helvetica-Bold' },
  headerCell: { padding: '4 6', border: '0.5pt solid #000', flex: 1, fontSize: 7, backgroundColor: '#000', color: '#fff', fontFamily: 'Helvetica-Bold' },
  label: { color: '#555', fontSize: 7 },
  mt: { marginTop: 3 },
})

interface Props { profile: Partial<Profile>; sourceJson: InvoiceJson; consignmentNo: string }

export default function CommercialInvoicePDF({ profile, sourceJson, consignmentNo }: Props) {
  const s = sourceJson
  const items = s.items ?? []
  const total = s.total_amount ?? 0

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <Text style={S.title}>COMMERCIAL INVOICE</Text>

        {/* Exporter / Header */}
        <View style={[S.table, S.mt]}>
          <View style={S.row}>
            <View style={[S.cellHalf, { minHeight: 60 }]}>
              <Text style={S.bold}>Exporter</Text>
              <Text>{profile.company_name}</Text>
              <Text>{profile.address}</Text>
              <Text>IEC: {profile.iec} | GSTIN: {profile.gstin}</Text>
              <Text>{profile.email} | {profile.phone}</Text>
            </View>
            <View style={{ width: '50%' }}>
              <View style={S.row}>
                <View style={{ width: '50%', padding: '3 5', borderLeft: '0.5pt solid #000', borderBottom: '0.5pt solid #000' }}>
                  <Text style={S.label}>Pages</Text>
                </View>
                <View style={{ width: '50%', padding: '3 5', borderLeft: '0.5pt solid #000', borderBottom: '0.5pt solid #000' }}>
                  <Text>1 of 1</Text>
                </View>
              </View>
              <View style={S.row}>
                <View style={{ width: '50%', padding: '3 5', borderLeft: '0.5pt solid #000', borderBottom: '0.5pt solid #000' }}>
                  <Text style={S.label}>Invoice No & Date</Text>
                </View>
                <View style={{ width: '50%', padding: '3 5', borderLeft: '0.5pt solid #000', borderBottom: '0.5pt solid #000' }}>
                  <Text style={S.bold}>{s.shipment?.invoice_no}</Text>
                  <Text>{s.shipment?.invoice_date}</Text>
                </View>
              </View>
              <View style={S.row}>
                <View style={{ width: '50%', padding: '3 5', borderLeft: '0.5pt solid #000', borderBottom: '0.5pt solid #000' }}>
                  <Text style={S.label}>B/L Number</Text>
                </View>
                <View style={{ width: '50%', padding: '3 5', borderLeft: '0.5pt solid #000', borderBottom: '0.5pt solid #000' }}>
                  <Text>{s.shipment?.bl_no}</Text>
                </View>
              </View>
              <View style={S.row}>
                <View style={{ width: '50%', padding: '3 5', borderLeft: '0.5pt solid #000' }}>
                  <Text style={S.label}>Reference</Text>
                </View>
                <View style={{ width: '50%', padding: '3 5', borderLeft: '0.5pt solid #000' }}>
                  <Text>{consignmentNo}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Consignee row */}
          <View style={S.row}>
            <View style={[S.cellHalf, { minHeight: 48 }]}>
              <Text style={S.bold}>Consignee</Text>
              <Text>{s.consignee?.name}</Text>
              <Text>{s.consignee?.address}</Text>
              <Text>{s.consignee?.phone} | {s.consignee?.email}</Text>
            </View>
            <View style={[S.cellHalf, { minHeight: 48 }]}>
              <Text style={S.bold}>Buyer (If not Consignee)</Text>
              <Text>{s.consignee?.name}</Text>
              <Text>{s.consignee?.address}</Text>
            </View>
          </View>

          {/* Shipment details */}
          <View style={S.row}>
            <View style={S.cellHalf}><Text><Text style={S.bold}>Method: </Text>{s.shipment?.dispatch_mode}</Text></View>
            <View style={S.cellHalf}><Text><Text style={S.bold}>Shipment: </Text>{s.shipment?.shipment_type}  <Text style={S.bold}>Origin: </Text>{s.shipment?.origin}  <Text style={S.bold}>Dest: </Text>{s.shipment?.destination}</Text></View>
          </View>
          <View style={S.row}>
            <View style={S.cellHalf}><Text><Text style={S.bold}>Vessel: </Text>{s.shipment?.vessel}  <Text style={S.bold}>Voyage: </Text>{s.shipment?.voyage}</Text></View>
            <View style={S.cellHalf}><Text><Text style={S.bold}>Payment: </Text>{s.payment?.terms}</Text></View>
          </View>
          <View style={S.row}>
            <View style={S.cellHalf}><Text><Text style={S.bold}>Port of Loading: </Text>{s.shipment?.port_of_loading}  <Text style={S.bold}>Departure: </Text>{s.shipment?.departure_date}</Text></View>
            <View style={S.cellHalf}><Text><Text style={S.bold}>Marine: </Text>{s.payment?.insurance}  <Text style={S.bold}>LC No: </Text>{s.payment?.lc_no}</Text></View>
          </View>
          <View style={S.row}>
            <View style={S.cell}><Text><Text style={S.bold}>Port of Discharge: </Text>{s.shipment?.port_of_discharge}  <Text style={S.bold}>Final Destination: </Text>{s.shipment?.final_destination}</Text></View>
          </View>
        </View>

        {/* Product table */}
        <View style={[S.table, S.mt]}>
          <View style={S.row}>
            {['Product Code','Description','HS Code','Unit Qty','Unit Type','Price','Amount'].map(h => (
              <View key={h} style={[S.headerCell, { flex: h === 'Description' ? 2 : 1 }]}><Text>{h}</Text></View>
            ))}
          </View>
          {items.map((item, i) => (
            <View key={i} style={S.row}>
              <View style={S.cell}><Text>{item.product_code}</Text></View>
              <View style={[S.cell, { flex: 2 }]}><Text>{item.description}</Text></View>
              <View style={S.cell}><Text>{item.hs_code}</Text></View>
              <View style={S.cell}><Text>{item.qty}</Text></View>
              <View style={S.cell}><Text>{item.unit}</Text></View>
              <View style={S.cell}><Text>{s.payment?.currency} {item.unit_price}</Text></View>
              <View style={S.cell}><Text>{s.payment?.currency} {item.amount?.toLocaleString()}</Text></View>
            </View>
          ))}
          {/* Spacer rows */}
          <View style={[S.row, { height: 20 }]}>
            <View style={S.cell}><Text> </Text></View>
          </View>
          {/* Totals */}
          <View style={S.row}>
            <View style={[S.cell, { flex: 5, textAlign: 'right' }]}><Text style={S.label}>Total This Page</Text></View>
            <View style={[S.cell, { flex: 2 }]}><Text style={S.bold}>{s.payment?.currency} {total.toLocaleString()}</Text></View>
          </View>
          <View style={S.row}>
            <View style={[S.cell, { flex: 5, textAlign: 'right' }]}><Text style={S.label}>Consignment Total</Text></View>
            <View style={[S.cell, { flex: 2 }]}><Text style={S.bold}>{s.payment?.currency} {total.toLocaleString()}</Text></View>
          </View>
        </View>

        {/* Footer */}
        <View style={[S.table, S.mt]}>
          <View style={S.row}>
            <View style={[S.cellHalf, { minHeight: 36 }]}>
              <Text style={S.bold}>Additional Info</Text>
              <Text>Quality: {s.quality?.grade} | Moisture: Max {s.quality?.moisture_max} | Broken: Max {s.quality?.broken_max}</Text>
              <Text>Inspection: {s.quality?.inspection} | Fumigation: {s.quality?.fumigation}</Text>
            </View>
            <View style={{ width: '50%' }}>
              <View style={{ padding: '3 5', borderLeft: '0.5pt solid #000', borderBottom: '0.5pt solid #000', flexDirection: 'row' }}>
                <Text style={S.bold}>TOTAL: {s.payment?.currency} {total.toLocaleString()}</Text>
                <Text style={{ marginLeft: 16 }}>Currency: {s.payment?.currency}</Text>
              </View>
              <View style={{ padding: '3 5', borderLeft: '0.5pt solid #000', borderBottom: '0.5pt solid #000' }}>
                <Text>Incoterms® 2020: <Text style={S.bold}>{s.payment?.incoterm}</Text></Text>
              </View>
              <View style={{ padding: '3 5', borderLeft: '0.5pt solid #000', borderBottom: '0.5pt solid #000' }}>
                <Text>Signatory Co: {profile.company_name}</Text>
              </View>
              <View style={{ padding: '3 5', borderLeft: '0.5pt solid #000' }}>
                <Text>Authorised: {profile.signatory_name} ({profile.signatory_designation})</Text>
              </View>
            </View>
          </View>
          <View style={S.row}>
            <View style={[S.cellHalf, { minHeight: 40 }]}>
              <Text style={S.bold}>Bank Details</Text>
              <Text>{profile.bank_name}, {profile.bank_branch}</Text>
              <Text>A/C: {profile.bank_account}</Text>
              <Text>IFSC: {profile.bank_ifsc} | SWIFT: {profile.bank_swift}</Text>
            </View>
            <View style={[S.cellHalf, { minHeight: 40, paddingTop: 20 }]}>
              <Text>Signature: ___________________</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
