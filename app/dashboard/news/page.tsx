'use client'
import { useEffect, useState } from 'react'

interface Article {
  title: string
  body: string
  source: string
  url: string
  time: string
  tag: string
  tagColor: string
  image: string | null
}

const TABS = [
  { id: 'all',     label: 'All'           },
  { id: 'ocean',   label: 'Ocean Freight' },
  { id: 'air',     label: 'Air Cargo'     },
  { id: 'trade',   label: 'Trade Policy'  },
  { id: 'india',   label: 'India'         },
  { id: 'uae',     label: 'UAE'           },
  { id: 'customs', label: 'Customs & Docs'},
]

export default function NewsPage() {
  const [articles, setArticles]     = useState<Article[]>([])
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState('all')
  const [isFallback, setIsFallback] = useState(false)

  useEffect(() => {
    setLoading(true)
    setArticles([])
    fetch(`/api/news?topic=${activeTab}&page=1`)
      .then(r => r.json())
      .then(data => {
        setArticles(data.articles ?? [])
        setIsFallback(data.fallback ?? false)
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [activeTab])

  const [featured, ...rest] = articles

  return (
    <div className="space-y-6 fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trade News & Updates</h1>
          <p className="text-sm text-slate-500 mt-1">Stay updated with export regulations, shipping alerts, and market intelligence.</p>
        </div>
        {isFallback && (
          <span className="text-xs text-amber-500/70 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg shrink-0">
            Demo data · Live API unavailable
          </span>
        )}
      </div>

      {/* Topic tabs */}
      <div className="flex gap-2 flex-wrap border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all"
            style={tab.id === activeTab
              ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderColor: 'rgba(99,102,241,0.3)' }
              : { background: 'rgba(255,255,255,0.04)', color: '#64748b', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Fetching latest trade news…</p>
        </div>
      )}

      {/* Empty */}
      {!loading && articles.length === 0 && (
        <div className="rounded-xl p-8 border border-white/7 text-center">
          <p className="text-sm text-slate-500">No articles found. Try another tab.</p>
        </div>
      )}

      {/* Featured card */}
      {!loading && featured && (
        <a
          href={featured.url}
          target={featured.url !== '#' ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="block rounded-2xl overflow-hidden border transition-all hover:border-indigo-500/40"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(99,102,241,0.25)' }}
        >
          {featured.image && (
            <img
              src={featured.image}
              alt={featured.title}
              className="w-full h-52 object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <div className="p-6 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <span
                className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full shrink-0"
                style={{ background: `rgba(${featured.tagColor},0.2)`, color: `rgb(${featured.tagColor})` }}
              >
                {featured.tag}
              </span>
              <span className="text-xs text-slate-600">{featured.time}</span>
            </div>
            <h3 className="text-lg font-bold text-white leading-snug">{featured.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{featured.body}</p>
            <p className="text-xs text-slate-600">Source: {featured.source}</p>
          </div>
        </a>
      )}

      {/* Article grid */}
      {!loading && rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((article, i) => (
            <a
              key={`${article.url}-${i}`}
              href={article.url}
              target={article.url !== '#' ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="rounded-xl overflow-hidden border border-white/7 cursor-pointer transition-all hover:-translate-y-1 flex flex-col"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              {article.image ? (
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-36 object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <div className="w-full h-36 flex items-center justify-center" style={{ background: `rgba(${article.tagColor},0.06)` }}>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: `rgba(${article.tagColor},0.4)` }}>{article.tag}</span>
                </div>
              )}
              <div className="p-4 space-y-2 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded shrink-0"
                    style={{ background: `rgba(${article.tagColor},0.15)`, color: `rgb(${article.tagColor})` }}
                  >
                    {article.tag}
                  </span>
                  <span className="text-xs text-slate-600 shrink-0">{article.time}</span>
                </div>
                <p className="font-semibold text-sm text-white leading-snug">{article.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">{article.body}</p>
                <p className="text-xs text-slate-700">Source: {article.source}</p>
              </div>
            </a>
          ))}
        </div>
      )}

    </div>
  )
}
