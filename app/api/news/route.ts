import { NextResponse, NextRequest } from 'next/server'

const NEWS_QUERIES: Record<string, string> = {
  all:     '"export" OR "import" OR "global trade" OR "shipping line" OR "ocean freight" OR "air cargo" OR "customs" OR "logistics" OR "container shipping" OR "trade finance"',
  ocean:   '"ocean freight" OR "container shipping" OR "shipping line" OR "Maersk" OR "MSC" OR "CMA CGM" OR "Hapag-Lloyd" OR "vessel" OR "port congestion" OR "sea freight"',
  air:     '"air cargo" OR "air freight" OR "airway bill" OR "IATA" OR "air export" OR "air import" OR "cargo airline" OR "belly freight"',
  trade:   '"global trade" OR "international trade" OR "trade war" OR "tariff" OR "WTO" OR "FTA" OR "trade agreement" OR "bilateral trade" OR "trade deficit"',
  india:   '"India export" OR "India import" OR "DGFT" OR "Indian exporter" OR "India trade" OR "Make in India" OR "India logistics" OR "Chennai port" OR "JNPT" OR "Mundra port"',
  uae:     '"UAE trade" OR "Dubai trade" OR "Jebel Ali" OR "DP World" OR "Abu Dhabi port" OR "Gulf import" OR "Middle East trade" OR "GCC trade"',
  customs: '"customs clearance" OR "customs duty" OR "HS code" OR "import duty" OR "export compliance" OR "trade compliance" OR "EXIM" OR "Letter of Credit" OR "Bill of Lading"',
}

const TOPIC_META: Record<string, { tag: string; tagColor: string }> = {
  all:     { tag: 'Trade',          tagColor: '100,116,139' },
  ocean:   { tag: 'Ocean Freight',  tagColor: '14,165,233'  },
  air:     { tag: 'Air Cargo',      tagColor: '249,115,22'  },
  trade:   { tag: 'Trade Policy',   tagColor: '99,102,241'  },
  india:   { tag: 'India',          tagColor: '34,197,94'   },
  uae:     { tag: 'UAE',            tagColor: '234,179,8'   },
  customs: { tag: 'Customs & Docs', tagColor: '168,85,247'  },
}

function categorizeFast(title: string, desc: string): { tag: string; tagColor: string } {
  const t = (title + ' ' + desc).toLowerCase()
  if (/ocean|container|shipping line|maersk|msc|cma|hapag|vessel|port congestion|sea freight/.test(t)) return TOPIC_META.ocean
  if (/air cargo|air freight|airway|iata|cargo airline|belly freight/.test(t)) return TOPIC_META.air
  if (/india|dgft|jnpt|mundra|chennai port|make in india/.test(t)) return TOPIC_META.india
  if (/uae|dubai|jebel ali|dp world|gulf import|middle east|gcc/.test(t)) return TOPIC_META.uae
  if (/customs|hs code|import duty|export compliance|letter of credit|bill of lading/.test(t)) return TOPIC_META.customs
  if (/trade war|tariff|wto|fta|trade agreement|trade deficit/.test(t)) return TOPIC_META.trade
  return TOPIC_META.all
}

const MOCK_ARTICLES = [
  { title: "India's Basmati Rice Exports Hit Record High in 2026", description: "India exported over 5 million tonnes of basmati rice in FY2026, driven by strong demand from Gulf nations including UAE, Saudi Arabia, and Kuwait.", url: '#', publishedAt: new Date().toISOString(), source: { name: 'Trade Today' } },
  { title: "UAE Tightens Food Import Regulations for 2026", description: "The UAE Ministry of Climate Change has updated food safety standards for imported grains, requiring enhanced fumigation certificates from all exporters.", url: '#', publishedAt: new Date().toISOString(), source: { name: 'Gulf Trade News' } },
  { title: "Jebel Ali Port Remains World's 9th Busiest Container Port", description: "DP World's flagship Jebel Ali port handled over 14 million TEUs in 2025, cementing its position as the Middle East's primary logistics hub.", url: '#', publishedAt: new Date().toISOString(), source: { name: 'Port Technology' } },
  { title: "India–UAE CEPA Boosts Bilateral Trade to $85 Billion", description: "The Comprehensive Economic Partnership Agreement has significantly reduced tariffs on agricultural commodities and textiles, benefiting Indian exporters.", url: '#', publishedAt: new Date().toISOString(), source: { name: 'Economic Times' } },
  { title: "Global Freight Rates Stabilize After Red Sea Disruptions", description: "Container shipping rates on Asia-Europe and India-Gulf routes have normalized following earlier disruptions, benefiting exporters with cost predictability.", url: '#', publishedAt: new Date().toISOString(), source: { name: 'Freight Waves' } },
  { title: "Chennai Port Upgrades FCL Handling Capacity by 30%", description: "Chennai Port Trust completes infrastructure expansion adding three new berths, significantly reducing vessel turnaround time for FCL exports.", url: '#', publishedAt: new Date().toISOString(), source: { name: 'Shipping Herald' } },
]

function formatTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const hrs = Math.floor(diffMs / 3_600_000)
  if (hrs < 1) return 'Just now'
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

type RawArticle = {
  title?: string
  description?: string
  url?: string
  publishedAt?: string
  source?: { name?: string }
  urlToImage?: string | null
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.NEWS_API_KEY
  const { searchParams } = new URL(req.url)
  const topic = searchParams.get('topic') || 'all'
  const page  = parseInt(searchParams.get('page') || '1')
  const query = NEWS_QUERIES[topic] || NEWS_QUERIES.all
  const meta  = TOPIC_META[topic] || TOPIC_META.all

  try {
    if (!apiKey) throw new Error('NEWS_API_KEY not set')

    const base = `https://newsapi.org/v2/everything?language=en&sortBy=publishedAt&apiKey=${apiKey}`
    const reqs: Promise<{ status: string; message?: string; code?: string; articles?: RawArticle[] }>[] = [
      fetch(`${base}&q=${encodeURIComponent(query)}&pageSize=20&page=${page}`, { cache: 'no-store' }).then(r => r.json()),
    ]

    // Pull extra ocean articles on the "all" first page for richer results
    if (topic === 'all' && page === 1) {
      reqs.push(fetch(`${base}&q=${encodeURIComponent(NEWS_QUERIES.ocean)}&pageSize=10&page=1`, { cache: 'no-store' }).then(r => r.json()))
    }

    const [res1, res2] = await Promise.all(reqs)

    if (res1.status !== 'ok') throw new Error(res1.message || res1.code || 'NewsAPI error')

    let raw: RawArticle[] = [...(res1.articles ?? []), ...(res2?.articles ?? [])]

    // Deduplicate by title
    const seen = new Set<string>()
    raw = raw.filter(a => {
      if (!a.title || seen.has(a.title) || a.title === '[Removed]') return false
      seen.add(a.title)
      return true
    })

    const articles = raw.slice(0, 20).map(a => ({
      title:  a.title!,
      body:   a.description ?? '',
      source: a.source?.name ?? 'News',
      url:    a.url ?? '#',
      time:   formatTime(a.publishedAt ?? ''),
      image:  a.urlToImage ?? null,
      ...(topic === 'all' ? categorizeFast(a.title!, a.description ?? '') : meta),
    }))

    return NextResponse.json({ articles, total: articles.length, page })

  } catch (err) {
    console.error('[news] API error — serving fallback:', err instanceof Error ? err.message : err)

    const fallback = MOCK_ARTICLES.map(a => ({
      title:  a.title,
      body:   a.description,
      source: a.source.name,
      url:    a.url,
      time:   'Just now',
      ...(topic === 'all' ? categorizeFast(a.title, a.description) : meta),
    }))

    return NextResponse.json({ articles: fallback, total: fallback.length, page, fallback: true })
  }
}
