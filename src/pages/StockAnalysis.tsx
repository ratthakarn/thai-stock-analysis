import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import type { ChartBar, StockQuote, AIAnalysis, NewsItem } from '../types'
import { useWatchlist } from '../stores/watchlist'
import Disclaimer from '../components/Disclaimer'

function VerdictBadge({ verdict }: { verdict: string }) {
  const colors: Record<string, string> = {
    STRONG_BUY: 'bg-green-600',
    BUY: 'bg-green-500',
    NEUTRAL: 'bg-yellow-600',
    SELL: 'bg-red-500',
    STRONG_SELL: 'bg-red-700',
  }
  const labels: Record<string, string> = {
    STRONG_BUY: '🚀 Strong Buy',
    BUY: '✅ Buy',
    NEUTRAL: '⚖️ Neutral',
    SELL: '⚠️ Sell',
    STRONG_SELL: '🛑 Strong Sell',
  }
  return (
    <span className={`${colors[verdict] || 'bg-slate-600'} text-white px-3 py-1 rounded-full text-sm font-bold`}>
      {labels[verdict] || verdict}
    </span>
  )
}

export default function StockAnalysis() {
  const { symbol = 'PTT' } = useParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState(symbol)
  const [period, setPeriod] = useState<'3mo' | '6mo' | '1y' | '2y'>('1y')
  const { add, remove, has } = useWatchlist()
  const inWatchlist = has(symbol)

  const { data: quote } = useQuery<StockQuote>({
    queryKey: ['quote', symbol],
    queryFn: () => axios.get(`/api/stock/quote/${symbol}`).then(r => r.data),
  })

  const { data: chart, isLoading: chartLoading } = useQuery<ChartBar[]>({
    queryKey: ['history', symbol, period],
    queryFn: () => axios.get(`/api/stock/history/${symbol}?period=${period}`).then(r => r.data),
  })

  const { data: news } = useQuery<NewsItem[]>({
    queryKey: ['news', symbol],
    queryFn: () => axios.get(`/api/stock/news/${symbol}`).then(r => r.data),
    staleTime: 15 * 60 * 1000,
  })

  const aiMutation = useMutation<AIAnalysis>({
    mutationFn: () => axios.post('/api/ai/analyze', { symbol }).then(r => r.data),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/stock/${search.toUpperCase().trim()}`)
  }

  const sentimentColor = { bullish: 'text-green-400', neutral: 'text-slate-400', bearish: 'text-red-400' }

  return (
    <div className="p-6 space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 flex-1 max-w-xs"
          value={search}
          onChange={e => setSearch(e.target.value.toUpperCase())}
          placeholder="ค้นหาหุ้น เช่น PTT, AOT"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500">
          ค้นหา
        </button>
      </form>

      {quote && (
        <div className="bg-slate-800 rounded-xl p-4 flex flex-wrap gap-4 items-center">
          <div>
            <div className="text-2xl font-bold text-white">{quote.symbol}</div>
            <div className="text-slate-400 text-sm">{quote.name}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{quote.price.toFixed(2)}</div>
            <div className={`text-sm ${quote.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {quote.changePercent >= 0 ? '▲' : '▼'} {Math.abs(quote.changePercent).toFixed(2)}%
            </div>
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => inWatchlist ? remove(symbol) : add(symbol)}
              className={`px-3 py-1 rounded-lg text-sm border ${inWatchlist ? 'border-yellow-500 text-yellow-400' : 'border-slate-600 text-slate-400 hover:border-yellow-500'}`}
            >
              {inWatchlist ? '⭐ ลบ Watchlist' : '☆ เพิ่ม Watchlist'}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4 w-full text-sm mt-2">
            {[
              ['P/E', quote.pe?.toFixed(1) ?? 'N/A'],
              ['P/BV', quote.pbv?.toFixed(2) ?? 'N/A'],
              ['Div Yield', quote.dividendYield ? `${(quote.dividendYield * 100).toFixed(2)}%` : 'N/A'],
              ['Mkt Cap', quote.marketCap ? `${(quote.marketCap / 1e9).toFixed(1)}B` : 'N/A'],
            ].map(([label, val]) => (
              <div key={label}>
                <div className="text-slate-400">{label}</div>
                <div className="text-white font-medium">{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candlestick chart */}
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="flex gap-2 mb-4">
          {(['3mo', '6mo', '1y', '2y'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded text-sm ${period === p ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {p}
            </button>
          ))}
        </div>
        {chartLoading ? (
          <div className="text-slate-400 h-64 flex items-center justify-center">กำลังโหลดกราฟ...</div>
        ) : chart && (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="volume" fill="#334155" yAxisId={1} opacity={0.5} />
              <Line dataKey="close" stroke="#60a5fa" dot={false} strokeWidth={2} />
              <Line dataKey="ma20" stroke="#f59e0b" dot={false} strokeWidth={1} />
              <Line dataKey="ma50" stroke="#10b981" dot={false} strokeWidth={1} />
              <Line dataKey="ma200" stroke="#ef4444" dot={false} strokeWidth={1} />
              <Line dataKey="bbUpper" stroke="#8b5cf6" dot={false} strokeWidth={1} strokeDasharray="4 2" />
              <Line dataKey="bbLower" stroke="#8b5cf6" dot={false} strokeWidth={1} strokeDasharray="4 2" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        <div className="flex gap-4 text-xs mt-2">
          {[['Close', '#60a5fa'], ['MA20', '#f59e0b'], ['MA50', '#10b981'], ['MA200', '#ef4444'], ['BB', '#8b5cf6']].map(([l, c]) => (
            <span key={l} className="flex items-center gap-1">
              <span className="w-3 h-0.5 inline-block" style={{ background: c }} />
              <span className="text-slate-400">{l}</span>
            </span>
          ))}
        </div>
      </div>

      {/* RSI */}
      {chart && (
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-white font-medium mb-2">RSI (14)</div>
          <ResponsiveContainer width="100%" height={100}>
            <ComposedChart data={chart}>
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
              <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" />
              <Line dataKey="rsi" stroke="#a78bfa" dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* MACD */}
      {chart && (
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-white font-medium mb-2">MACD</div>
          <ResponsiveContainer width="100%" height={100}>
            <ComposedChart data={chart}>
              <XAxis dataKey="date" hide />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <ReferenceLine y={0} stroke="#475569" />
              <Line dataKey="macd" stroke="#60a5fa" dot={false} strokeWidth={1.5} />
              <Line dataKey="macdSignal" stroke="#f59e0b" dot={false} strokeWidth={1.5} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* AI Analysis */}
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white font-medium">🤖 AI Multi-Agent Analysis</div>
          <button
            onClick={() => aiMutation.mutate()}
            disabled={aiMutation.isPending}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
          >
            {aiMutation.isPending ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ด้วย AI'}
          </button>
        </div>
        {aiMutation.data && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <VerdictBadge verdict={aiMutation.data.verdict} />
              {aiMutation.data.target && (
                <span className="text-sm text-slate-400">Target: <span className="text-green-400">{aiMutation.data.target}</span></span>
              )}
              {aiMutation.data.stopLoss && (
                <span className="text-sm text-slate-400">Stop Loss: <span className="text-red-400">{aiMutation.data.stopLoss}</span></span>
              )}
            </div>
            <p className="text-slate-300 text-sm">{aiMutation.data.summary}</p>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                ['📈 Technical', aiMutation.data.technicalView],
                ['📰 News', aiMutation.data.newsView],
                ['💰 Fund Flow', aiMutation.data.fundFlowView],
              ].map(([label, text]) => (
                <div key={label} className="bg-slate-700 rounded-lg p-3">
                  <div className="text-slate-300 font-medium mb-1">{label}</div>
                  <div className="text-slate-400">{text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {aiMutation.isError && (
          <div className="text-red-400 text-sm">เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง</div>
        )}
      </div>

      {/* News */}
      {news && news.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-white font-medium mb-3">📰 ข่าวล่าสุด</div>
          <div className="space-y-3">
            {news.map((item, i) => (
              <div key={i} className="border-b border-slate-700 pb-3 last:border-0">
                <a href={item.link} target="_blank" rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-sm font-medium">
                  {item.title}
                </a>
                {item.summary && <p className="text-slate-400 text-xs mt-1">{item.summary}</p>}
                {item.sentiment && (
                  <span className={`text-xs ${sentimentColor[item.sentiment]}`}>
                    {item.sentiment === 'bullish' ? '📈 Bullish' : item.sentiment === 'bearish' ? '📉 Bearish' : '⚖️ Neutral'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  )
}
