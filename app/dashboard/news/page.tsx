const NEWS = [
  { tag: 'Featured · Trade Policy', tagColor: '99,102,241', title: 'India–UAE CEPA: Basmati rice zero-duty extended through 2027', body: 'The Comprehensive Economic Partnership Agreement between India and UAE has extended the zero-duty status for Basmati rice exports through December 2027, benefiting exporters shipping via CIF terms.', source: 'APEDA', impact: 'High for Basmati exporters', time: '2 hrs ago', featured: true },
  { tag: 'Currency', tagColor: '59,130,246', title: 'USD/INR at 83.42 — Rupee firms', body: 'RBI intervention steadies the rupee ahead of quarterly review. Exporters advised to monitor LC settlements.', source: 'RBI', time: '2 hrs ago' },
  { tag: 'Shipping', tagColor: '249,115,22', title: 'Jebel Ali Terminal 2 Congestion', body: 'FCL shipments experiencing 3–5 day delays at Jebel Ali Port Terminal 2. Plan departure dates accordingly.', source: 'DP World', time: '5 hrs ago' },
  { tag: 'Compliance', tagColor: '168,85,247', title: 'New Phytosanitary Format — May 2026', body: 'APEDA mandates updated phytosanitary certificate format from 1 May 2026 for all rice exports to UAE.', source: 'APEDA', time: '1 day ago' },
  { tag: 'Trade', tagColor: '34,197,94', title: 'Chennai Port adds 3 new FCL berths', body: 'Chennai Port Authority inaugurates 3 new FCL berths, reducing turnaround time by 30% for exporters.', source: 'Chennai Port', time: '2 days ago' },
  { tag: 'Rates', tagColor: '234,179,8', title: 'Basmati FOB price: $930–960/MT', body: '1121 Steam Basmati prices steady at $930–960 per MT FOB. Demand from Middle East remains strong.', source: 'DGCI&S', time: '3 days ago' },
  { tag: 'Alert', tagColor: '239,68,68', title: 'SGS inspection backlog — 4 day delay', body: 'SGS Bengaluru reporting 4-day inspection backlog. Book slots early to avoid departure delays.', source: 'SGS India', time: '4 days ago' },
]

export default function NewsPage() {
  const [featured, ...rest] = NEWS

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Trade News & Updates</h1>
        <p className="text-sm text-slate-500 mt-1">Stay updated with export regulations, shipping alerts, and currency changes.</p>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'Currency', 'Shipping', 'Trade Policy', 'Compliance'].map((c, i) => (
          <button key={c} className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all"
            style={i === 0
              ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderColor: 'rgba(99,102,241,0.3)' }
              : { background: 'rgba(255,255,255,0.04)', color: '#64748b', borderColor: 'rgba(255,255,255,0.08)' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Featured */}
      <div className="rounded-2xl p-6 space-y-3 border"
        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(99,102,241,0.25)' }}>
        <div className="flex items-start justify-between">
          <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full"
            style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>{featured.tag}</span>
          <span className="text-xs text-slate-600">{featured.time}</span>
        </div>
        <h3 className="text-lg font-bold text-white">{featured.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{featured.body}</p>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>Source: {featured.source}</span><span>·</span><span>Impact: {featured.impact}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-4">
        {rest.map(({ tag, tagColor, title, body, source, time }) => (
          <div key={title} className="rounded-xl p-5 space-y-3 border border-white/7 cursor-pointer transition-all hover:-translate-y-1"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ background: `rgba(${tagColor},0.15)`, color: `rgb(${tagColor})` }}>{tag}</span>
              <span className="text-xs text-slate-600">{time}</span>
            </div>
            <p className="font-semibold text-sm text-white">{title}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
            <p className="text-xs text-slate-700">Source: {source}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
