import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Link } from 'react-router-dom'
import type { ScreenerResult } from '../types'
import Disclaimer from '../components/Disclaimer'

export default function Screener() {
  const { data, isLoading, refetch } = useQuery<ScreenerResult[]>({
    queryKey: ['screener'],
    queryFn: () => axios.get('/api/screener').then(r => r.data),
    staleTime: 60 * 60 * 1000,
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">🔎 Smart Screener</h1>
        <button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">
          รีเฟรช (cache 1 ชม.)
        </button>
      </div>

      <div className="text-slate-400 text-xs">
        Scoring: Technical 0-3 + Volume 0-3 + Fund Flow 0-3 + Dividend 0-1 = เต็ม 10
      </div>

      {isLoading && (
        <div className="text-slate-400 flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          กำลังสแกนหุ้น SET ทั้งตลาด... (อาจใช้เวลา 30-60 วินาที)
        </div>
      )}

      {data && (
        <div className="space-y-3">
          {data.map((result, i) => (
            <div key={result.symbol} className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-start gap-4">
                <div className="text-slate-500 text-sm w-6 text-right">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/stock/${result.symbol}`} className="text-blue-400 hover:underline font-bold text-lg">
                      {result.symbol}
                    </Link>
                    <span className="text-slate-400 text-sm">{result.name}</span>
                    {result.badge && <span className="text-xs font-medium">{result.badge}</span>}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-slate-400">
                    <span>ราคา <span className="text-white">{result.price.toFixed(2)}</span></span>
                    <span className={result.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {result.changePercent >= 0 ? '+' : ''}{result.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  {result.aiSummary && <p className="text-slate-400 text-xs mt-2">{result.aiSummary}</p>}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold text-white">{result.totalScore}</div>
                  <div className="text-slate-500 text-xs">/ 10</div>
                  <div className="flex gap-1 mt-1 text-xs">
                    <span className="bg-blue-900 text-blue-300 px-1 rounded">T:{result.technicalScore}</span>
                    <span className="bg-green-900 text-green-300 px-1 rounded">V:{result.volumeScore}</span>
                    <span className="bg-yellow-900 text-yellow-300 px-1 rounded">F:{result.fundFlowScore}</span>
                    <span className="bg-purple-900 text-purple-300 px-1 rounded">D:{result.dividendScore}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Disclaimer />
    </div>
  )
}
