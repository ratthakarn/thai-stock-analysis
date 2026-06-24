import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useWatchlist } from '../stores/watchlist'
import type { StockQuote } from '../types'
import Disclaimer from '../components/Disclaimer'

function WatchlistRow({ symbol, onRemove }: { symbol: string; onRemove: () => void }) {
  const { data: q } = useQuery<StockQuote>({
    queryKey: ['quote', symbol],
    queryFn: () => axios.get(`/api/stock/quote/${symbol}`).then(r => r.data),
  })
  return (
    <tr className="border-t border-slate-700">
      <td className="p-3">
        <Link to={`/stock/${symbol}`} className="text-blue-400 hover:underline font-medium">{symbol}</Link>
        <div className="text-slate-500 text-xs">{q?.name}</div>
      </td>
      <td className="p-3 text-right text-white">{q?.price.toFixed(2) ?? '—'}</td>
      <td className={`p-3 text-right ${(q?.change ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {q ? (q.change >= 0 ? '+' : '') + q.change.toFixed(2) : '—'}
      </td>
      <td className={`p-3 text-right font-medium ${(q?.changePercent ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {q ? (q.changePercent >= 0 ? '+' : '') + q.changePercent.toFixed(2) + '%' : '—'}
      </td>
      <td className="p-3 text-right">
        <button onClick={onRemove} className="text-slate-500 hover:text-red-400 text-xs">ลบ</button>
      </td>
    </tr>
  )
}

export default function Watchlist() {
  const { symbols, remove } = useWatchlist()

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-white text-2xl font-bold">⭐ Watchlist</h1>
      {symbols.length === 0 ? (
        <div className="text-slate-400">ยังไม่มีหุ้นใน watchlist — ไปค้นหาหุ้นที่ต้องการแล้วกด "เพิ่ม Watchlist"</div>
      ) : (
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-700">
              <tr className="text-slate-300 text-xs">
                <th className="text-left p-3">หุ้น</th>
                <th className="text-right p-3">ราคา</th>
                <th className="text-right p-3">เปลี่ยน</th>
                <th className="text-right p-3">%เปลี่ยน</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {symbols.map((sym) => (
                <WatchlistRow key={sym} symbol={sym} onRemove={() => remove(sym)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Disclaimer />
    </div>
  )
}
