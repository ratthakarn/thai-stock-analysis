import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { IndexCard, MarketBreadth, StockQuote } from '../types'
import { useWatchlist } from '../stores/watchlist'
import Disclaimer from '../components/Disclaimer'
import { Link } from 'react-router-dom'

function IndexCard({ idx }: { idx: IndexCard }) {
  const up = idx.changePercent >= 0
  return (
    <div className="bg-slate-800 rounded-xl p-4 flex flex-col gap-1">
      <div className="text-slate-400 text-xs">{idx.name || idx.symbol}</div>
      <div className="text-white text-2xl font-bold">{idx.price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</div>
      <div className={`text-sm font-medium ${up ? 'text-green-400' : 'text-red-400'}`}>
        {up ? '▲' : '▼'} {Math.abs(idx.changePercent).toFixed(2)}%
      </div>
    </div>
  )
}

function BreadthBar({ breadth }: { breadth: MarketBreadth }) {
  const { advancing, declining, unchanged, total } = breadth
  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="text-slate-400 text-xs mb-2">Market Breadth ({total} หุ้น)</div>
      <div className="flex rounded-full overflow-hidden h-4">
        <div className="bg-green-500" style={{ width: `${(advancing / total) * 100}%` }} />
        <div className="bg-slate-500" style={{ width: `${(unchanged / total) * 100}%` }} />
        <div className="bg-red-500" style={{ width: `${(declining / total) * 100}%` }} />
      </div>
      <div className="flex gap-4 mt-2 text-xs">
        <span className="text-green-400">▲ {advancing}</span>
        <span className="text-slate-400">— {unchanged}</span>
        <span className="text-red-400">▼ {declining}</span>
      </div>
    </div>
  )
}

function MoverTable({ stocks, title }: { stocks: StockQuote[]; title: string }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="text-white font-medium mb-3">{title}</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400 text-xs">
            <th className="text-left">หุ้น</th>
            <th className="text-right">ราคา</th>
            <th className="text-right">%เปลี่ยน</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s) => (
            <tr key={s.symbol} className="border-t border-slate-700">
              <td className="py-1">
                <Link to={`/stock/${s.symbol}`} className="text-blue-400 hover:underline">
                  {s.symbol}
                </Link>
                <div className="text-slate-500 text-xs">{s.name}</div>
              </td>
              <td className="text-right text-white">{s.price.toFixed(2)}</td>
              <td className={`text-right font-medium ${s.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Dashboard() {
  const { data: indices } = useQuery<IndexCard[]>({
    queryKey: ['indices'],
    queryFn: () => axios.get('/api/market/indices').then(r => r.data),
    refetchInterval: 60000,
  })
  const { data: breadth } = useQuery<MarketBreadth>({
    queryKey: ['breadth'],
    queryFn: () => axios.get('/api/market/breadth').then(r => r.data),
    refetchInterval: 120000,
  })
  const { data: movers } = useQuery<{ gainers: StockQuote[]; losers: StockQuote[] }>({
    queryKey: ['movers'],
    queryFn: () => axios.get('/api/market/movers').then(r => r.data),
    refetchInterval: 120000,
  })
  const { symbols: watchlist } = useWatchlist()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-white text-2xl font-bold">Dashboard — ตลาดหุ้นไทย (SET)</h1>

      <div className="grid grid-cols-3 gap-4">
        {indices?.map((idx) => <IndexCard key={idx.symbol} idx={idx} />) ?? (
          <div className="col-span-3 text-slate-400">กำลังโหลด...</div>
        )}
      </div>

      {breadth && <BreadthBar breadth={breadth} />}

      <div className="grid grid-cols-2 gap-4">
        {movers && <MoverTable stocks={movers.gainers} title="🔼 Top Gainers" />}
        {movers && <MoverTable stocks={movers.losers} title="🔽 Top Losers" />}
      </div>

      {watchlist.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-white font-medium mb-3">⭐ Watchlist</div>
          <div className="flex flex-wrap gap-2">
            {watchlist.map((sym) => (
              <Link key={sym} to={`/stock/${sym}`} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-full text-sm">
                {sym}
              </Link>
            ))}
          </div>
        </div>
      )}

      <Disclaimer />
    </div>
  )
}
