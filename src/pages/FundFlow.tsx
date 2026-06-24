import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { FundFlowDay } from '../types'
import Disclaimer from '../components/Disclaimer'

export default function FundFlow() {
  const { data, isLoading } = useQuery<FundFlowDay[]>({
    queryKey: ['fundflow'],
    queryFn: () => axios.get('/api/fundflow').then(r => r.data),
    staleTime: 30 * 60 * 1000,
  })

  const last30 = data?.slice(-30) ?? []

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-white text-2xl font-bold">💰 Fund Flow Report</h1>

      {isLoading && <div className="text-slate-400">กำลังโหลดข้อมูล fund flow...</div>}

      {last30.length === 0 && !isLoading && (
        <div className="bg-slate-800 rounded-xl p-6 text-slate-400">
          <p>ยังไม่มีข้อมูล fund flow</p>
          <p className="text-xs mt-2">รัน <code className="bg-slate-700 px-1 rounded">npm run scrape:fundflow</code> บนเครื่อง local เพื่อดึงข้อมูลจาก SET</p>
        </div>
      )}

      {last30.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-white font-medium mb-4">Net Buy/Sell (ล้านบาท) 30 วันล่าสุด</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last30}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <ReferenceLine y={0} stroke="#475569" />
              <Bar dataKey="foreign" name="ต่างชาติ" fill="#60a5fa" />
              <Bar dataKey="institution" name="สถาบัน" fill="#34d399" />
              <Bar dataKey="proprietary" name="บัญชีบริษัท" fill="#f59e0b" />
              <Bar dataKey="individual" name="รายย่อย" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {last30.length > 0 && (
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-700">
              <tr className="text-slate-300 text-xs">
                {['วันที่', 'ต่างชาติ', 'สถาบัน', 'บัญชีบริษัท', 'รายย่อย'].map(h => (
                  <th key={h} className="p-3 text-right first:text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {last30.slice().reverse().map(row => (
                <tr key={row.date} className="border-t border-slate-700">
                  <td className="p-3 text-slate-400">{row.date}</td>
                  {[row.foreign, row.institution, row.proprietary, row.individual].map((v, i) => (
                    <td key={i} className={`p-3 text-right font-medium ${v >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {v >= 0 ? '+' : ''}{v.toFixed(0)}M
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Disclaimer />
    </div>
  )
}
