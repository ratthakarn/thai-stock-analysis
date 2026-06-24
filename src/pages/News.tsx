import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { NewsItem } from '../types'
import Disclaimer from '../components/Disclaimer'

export default function News() {
  const [symbol, setSymbol] = useState('SET')

  const { data: news, isLoading, refetch } = useQuery<NewsItem[]>({
    queryKey: ['news', symbol],
    queryFn: () => axios.get(`/api/stock/news/${symbol}`).then(r => r.data),
    staleTime: 15 * 60 * 1000,
  })

  const sentimentIcon = { bullish: '📈', neutral: '⚖️', bearish: '📉' }
  const sentimentColor = { bullish: 'text-green-400', neutral: 'text-slate-400', bearish: 'text-red-400' }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-white text-2xl font-bold">📰 ข่าว & Sentiment</h1>

      <div className="flex gap-2">
        <input
          className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 w-48"
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
          placeholder="ชื่อหุ้น เช่น PTT"
        />
        <button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg">โหลดข่าว</button>
      </div>

      {isLoading && <div className="text-slate-400">กำลังโหลดข่าวและวิเคราะห์ sentiment...</div>}

      <div className="space-y-3">
        {news?.map((item, i) => (
          <div key={i} className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <a href={item.link} target="_blank" rel="noopener noreferrer"
                className="text-blue-400 hover:underline font-medium text-sm flex-1">
                {item.title}
              </a>
              {item.sentiment && (
                <span className={`text-sm shrink-0 ${sentimentColor[item.sentiment]}`}>
                  {sentimentIcon[item.sentiment]} {item.sentiment}
                </span>
              )}
            </div>
            {item.summary && <p className="text-slate-400 text-xs mt-2">{item.summary}</p>}
            <div className="text-slate-500 text-xs mt-1">{item.source} · {item.pubDate ? new Date(item.pubDate).toLocaleDateString('th-TH') : ''}</div>
          </div>
        ))}
      </div>

      <Disclaimer />
    </div>
  )
}
