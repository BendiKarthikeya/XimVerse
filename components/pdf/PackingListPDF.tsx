import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { InvoiceJson, Profile } from '@/types'

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

export default function PackingListPDF({ profile, sourceJson, consignmentNo }: Props) {
  const s = sourceJson
  const packing = s.packing ?? []
  const totNetKg = packing.reduce((a, p) => a + (p.net_kg ?? 0), 0)
  const totGrossKg = packing.reduce((a, p) => a + (p.gross_kg ?? 0), 0)
  const totVol = packing.reduce((a, p) => a + (p.volume_cbm ?? 0), 0)

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <Text style={S.title}>PACKING LIST</Text>

        {/* Exporter / Header */}
        <View style={[S.table, S.mt]}>
          <View style={S.row}>
            <View style={[S.cellHalf, { minHeight: 56 }]}>
              <Text style={S.bold}>Exporter</Text>
              <Text>{profile.company_name}</Text>
              <Text>{profile.address}</Text>
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
                  <Text style={S.label}>Export Invoice No & Date</Text>
                </View>
                <View style={{ width: '50%', padding: '3 5', borderLeft: '0.5pt solid #000', borderBottom: '0.5pt solid #000' }}>
                  <Text style={S.bold}>{s.shipment?.invoice_no}</Text>
                  <Text>{s.shipment?.invoice_date}</Text>
                </View>
              </View>
              <View style={S.row}>
                <View style={{ width: '50%', padding: '3 5', borderLeft: '0.5pt solid #000' }}>
                  <Text style={S.label}>B/L Number</Text>
                </View>
                <View style={{ width: '50%', padding: '3 5', borderLeft: '0.5pt solid #000' }}>
                  <Text>{s.shipment?.bl_no}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={S.row}>
            <View style={[S.cellHalf, { minHeight: 44 }]}>
              <Text style={S.bold}>Consignee</Text>
              <Text>{s.consignee?.name}</Text>
              <Text>{s.consignee?.address}</Text>
            </View>
            <View style={[S.cellHalf, { minHeight: 44 }]}>
              <Text style={S.bold}>Buyer (If not Consignee)</Text>
              <Text>{s.consignee?.name}</Text>
            </View>
          </View>

          <View style={S.row}>
            <View style={S.cellHalf}><Text><Text style={S.bold}>Method: </Text>{s.shipment?.dispatch_mode}</Text></View>
            <View style={S.cellHalf}><Text><Text style={S.bold}>Shipment: </Text>{s.shipment?.shipment_type}  <Text style={S.bold}>Origin: </Text>{s.shipment?.origin}  <Text style={S.bold}>Dest: </Text>{s.shipment?.destination}</Text></View>
          </View>
          <View style={S.row}>
            <View style={S.cellHalf}><Text><Text style={S.bold}>Vessel: </Text>{s.shipment?.vessel}  <Text style={S.bold}>Voyage: </Text>{s.shipment?.voyage}</Text></View>
            <View style={S.cellHalf}>
              <Text style={S.bold}>Packing Information</Text>
              <Text>{s.packing_info?.bag_type}, {s.packing_info?.total_bags} Bags, {s.packing_info?.container_size}, Seal: {s.packing_info?.seal_no}</Text>
            </View>
          </View>
          <View style={S.row}>
            <View style={S.cellHalf}><Text><Text style={S.bold}>Port of Loading: </Text>{s.shipment?.port_of_loading}  <Text style={S.bold}>Departure: </Text>{s.shipment?.departure_date}</Text></View>
            <View style={S.cellHalf}><Text><Text style={S.bold}>Port of Discharge: </Text>{s.shipment?.port_of_discharge}  <Text style={S.bold}>Final: </Text>{s.shipment?.final_destination}</Text></View>
          </View>
        </View>

        {/* Packing table */}
        <View style={[S.table, S.mt]}>
          <View style={S.row}>
            {['Product Code','Description','Unit Qty','Kind & No of Packages','Net Wt (Kg)','Gross Wt (Kg)','Vol (m³)'].map(h => (
              <View key={h} style={[S.headerCell, { flex: h === 'Description' || h === 'Kind & No of Packages' ? 2 : 1 }]}><Text>{h}</Text></View>
            ))}
          </View>
          {packing.map((p, i) => (
            <View key={i} style={S.row}>
              <View style={S.cell}><Text>{p.product_code}</Text></View>
              <View style={[S.cell, { flex: 2 }]}><Text>{p.description}</Text></View>
              <View style={S.cell}><Text>{p.qty} {p.unit}</Text></View>
              <View style={[S.cell, { flex: 2 }]}><Text>{p.packages}</Text></View>
              <View style={S.cell}><Text>{p.net_kg?.toLocaleString()}</Text></View>
              <View style={S.cell}><Text>{p.gross_kg?.toLocaleString()}</Text></View>
              <View style={S.cell}><Text>{p.volume_cbm}</Text></View>
            </View>
          ))}
          <View style={[S.row, { height: 20 }]}>
            <View style={S.cell}><Text> </Text></View>
          </View>
          {/* Totals */}
          <View style={S.row}>
            <View style={[S.cell, { flex: 3, textAlign: 'right' }]}><Text style={S.label}>Total This Page</Text></View>
            <View style={[S.cell, { flex: 2 }]}><Text>{s.packing_info?.total_bags} Bags</Text></View>
            <View style={S.cell}><Text>{totNetKg.toLocaleString()} kg</Text></View>
            <View style={S.cell}><Text>{totGrossKg.toLocaleString()} kg</Text></View>
            <View style={S.cell}><Text>{totVol} m³</Text></View>
          </View>
          <View style={S.row}>
            <View style={[S.cell, { flex: 3, textAlign: 'right' }]}><Text style={S.label}>Consignment Total</Text></View>
            <View style={[S.cell, { flex: 2 }]}><Text style={S.bold}>{s.packing_info?.total_bags} Bags</Text></View>
            <View style={S.cell}><Text style={S.bold}>{totNetKg.toLocaleString()} kg</Text></View>
            <View style={S.cell}><Text style={S.bold}>{totGrossKg.toLocaleString()} kg</Text></View>
            <View style={S.cell}><Text style={S.bold}>{totVol} m³</Text></View>
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
              <View style={{ padding: '3 5', borderLeft: '0.5pt solid #000', borderBottom: '0.5pt solid #000' }}>
                <Text>Signatory Co: {profile.company_name}</Text>
              </View>
              <View style={{ padding: '3 5', borderLeft: '0.5pt solid #000', borderBottom: '0.5pt solid #000' }}>
                <Text>Authorised: {profile.signatory_name} ({profile.signatory_designation})</Text>
              </View>
              <View style={{ padding: '18 5', borderLeft: '0.5pt solid #000' }}>
                <Text>Signature: ___________________</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
