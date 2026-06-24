import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { usePortfolio } from '../stores/portfolio'
import type { PortfolioItem, StockQuote } from '../types'
import Disclaimer from '../components/Disclaimer'

function PortfolioRow({ item, onRemove }: { item: PortfolioItem; onRemove: () => void }) {
  const { data: q } = useQuery<StockQuote>({
    queryKey: ['quote', item.symbol],
    queryFn: () => axios.get(`/api/stock/quote/${item.symbol}`).then(r => r.data),
  })
  const price = q?.price ?? item.avgCost
  const value = price * item.shares
  const cost = item.avgCost * item.shares
  const pnl = value - cost
  const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0

  return (
    <tr className="border-t border-slate-700">
      <td className="p-3 text-white font-medium">{item.symbol}</td>
      <td className="p-3 text-right text-slate-300">{item.shares.toLocaleString()}</td>
      <td className="p-3 text-right text-slate-300">{item.avgCost.toFixed(2)}</td>
      <td className="p-3 text-right text-white">{price.toFixed(2)}</td>
      <td className="p-3 text-right text-white">฿{value.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
      <td className={`p-3 text-right font-medium ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
      </td>
      <td className="p-3">
        <button onClick={onRemove} className="text-slate-500 hover:text-red-400 text-xs">ลบ</button>
      </td>
    </tr>
  )
}

export default function Portfolio() {
  const { items, add, remove } = usePortfolio()
  const [form, setForm] = useState({ symbol: '', shares: '', avgCost: '' })

  // Fetch all prices for summary calculation
  const { data: prices } = useQuery<Record<string, number>>({
    queryKey: ['portfolio-prices', items.map(i => i.symbol).join(',')],
    queryFn: async () => {
      if (items.length === 0) return {}
      const results = await Promise.all(
        items.map(i => axios.get<StockQuote>(`/api/stock/quote/${i.symbol}`).then(r => ({ sym: i.symbol, price: r.data.price })).catch(() => ({ sym: i.symbol, price: i.avgCost })))
      )
      return Object.fromEntries(results.map(r => [r.sym, r.price]))
    },
    enabled: items.length > 0,
  })

  let totalValue = 0, totalCost = 0
  items.forEach(item => {
    const price = prices?.[item.symbol] ?? item.avgCost
    totalValue += price * item.shares
    totalCost += item.avgCost * item.shares
  })
  const totalPnL = totalValue - totalCost
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.symbol || !form.shares || !form.avgCost) return
    add({ symbol: form.symbol.toUpperCase(), shares: Number(form.shares), avgCost: Number(form.avgCost) })
    setForm({ symbol: '', shares: '', avgCost: '' })
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-white text-2xl font-bold">💼 Portfolio Tracker</h1>

      <form onSubmit={handleAdd} className="bg-slate-800 rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-slate-400 text-xs block mb-1">ชื่อหุ้น</label>
          <input className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 w-28 uppercase"
            value={form.symbol} onChange={e => setForm(s => ({ ...s, symbol: e.target.value.toUpperCase() }))}
            placeholder="PTT" required />
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">จำนวนหุ้น</label>
          <input className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 w-28"
            type="number" value={form.shares} onChange={e => setForm(s => ({ ...s, shares: e.target.value }))}
            placeholder="1000" required min="1" />
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">ต้นทุนเฉลี่ย (บาท)</label>
          <input className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 w-28"
            type="number" value={form.avgCost} onChange={e => setForm(s => ({ ...s, avgCost: e.target.value }))}
            placeholder="35.50" required min="0" step="0.01" />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg">เพิ่ม</button>
      </form>

      {items.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {([
              ['มูลค่าพอร์ต', `฿${totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`, false],
              ['ต้นทุนรวม', `฿${totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`, false],
              ['กำไร/ขาดทุน', `${totalPnL >= 0 ? '+' : ''}฿${totalPnL.toFixed(2)} (${totalPnLPct.toFixed(2)}%)`, true],
            ] as [string, string, boolean][]).map(([label, val, colored]) => (
              <div key={label} className="bg-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs">{label}</div>
                <div className={`text-lg font-bold ${colored ? (totalPnL >= 0 ? 'text-green-400' : 'text-red-400') : 'text-white'}`}>{val}</div>
              </div>
            ))}
          </div>

          <div className="bg-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-700">
                <tr className="text-slate-300 text-xs">
                  {['หุ้น', 'จำนวน', 'ต้นทุน/หุ้น', 'ราคาปัจจุบัน', 'มูลค่า', 'กำไร/ขาดทุน', ''].map(h => (
                    <th key={h} className="p-3 text-right first:text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <PortfolioRow key={item.symbol} item={item} onRemove={() => remove(item.symbol)} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Disclaimer />
    </div>
  )
}
