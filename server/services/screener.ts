import { getAllStocks } from './tradingview'
import { getObject, putObject } from './filebase'
import { generateScreenerSummary } from './claude'
import type { ScreenerResult } from '../../src/types'

const CACHE_KEY = 'screener-results.json'
const CACHE_TTL = 60 * 60 * 1000

interface CachedScreener { data: ScreenerResult[]; ts: number }

export async function runScreener(): Promise<ScreenerResult[]> {
  const cached = await getObject<CachedScreener>(CACHE_KEY)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  const stocks = await getAllStocks()
  const results: ScreenerResult[] = []

  for (const s of stocks) {
    if (!s.price || s.price <= 0) continue

    // Technical score (0-3)
    let tech = 0
    if (s.rsi !== null && s.rsi < 70 && s.rsi > 30) tech++
    if (s.sma20 !== null && s.price > s.sma20) tech++
    if (s.sma50 !== null && s.price > s.sma50) tech++

    // Volume score (0-3)
    let vol = 0
    if (s.relativeVolume > 1.5) vol++
    if (s.relativeVolume > 2.0) vol++
    if (s.volume > 1_000_000) vol++

    // Fund flow score (0-3) — placeholder (no real-time data without scraper)
    const ff = 1

    // Dividend score (0-1)
    const div = (s.dividendYield ?? 0) > 3 ? 1 : 0

    const total = tech + vol + ff + div

    let badge: ScreenerResult['badge'] = null
    if (total >= 8) badge = '🔥 Strong Buy'
    else if (total >= 6) badge = '✅ Watch'

    results.push({
      symbol: s.symbol,
      name: s.name,
      price: s.price,
      changePercent: s.changePercent,
      totalScore: total,
      technicalScore: tech,
      volumeScore: vol,
      fundFlowScore: ff,
      dividendScore: div,
      badge,
      aiSummary: null,
    })
  }

  results.sort((a, b) => b.totalScore - a.totalScore)
  const top20 = results.slice(0, 20)

  // Lazy AI summaries for top 20
  await Promise.all(
    top20.map(async (r, i) => {
      try {
        const details = `Tech:${r.technicalScore}/3 Vol:${r.volumeScore}/3 FF:${r.fundFlowScore}/3 Div:${r.dividendScore}/1`
        top20[i].aiSummary = await generateScreenerSummary(r.symbol, r.totalScore, details)
      } catch {
        top20[i].aiSummary = null
      }
    })
  )

  await putObject(CACHE_KEY, { data: top20, ts: Date.now() } as CachedScreener)
  return top20
}
