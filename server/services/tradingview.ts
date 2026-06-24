import axios from 'axios'
import https from 'https'
import type { StockQuote, MarketBreadth } from '../../src/types'

const httpsAgent = new https.Agent({ rejectUnauthorized: false })

const TV_URL = 'https://scanner.tradingview.com/thailand/scan'
const COLUMNS = [
  'name', 'description', 'close', 'change', 'change_abs', 'volume',
  'average_volume_10d_calc', 'relative_volume_10d_calc', 'RSI', 'MACD.macd',
  'MACD.signal', 'SMA20', 'SMA50', 'SMA200', 'dividends_yield',
  'price_earnings_ttm', 'market_cap_basic', 'price_book_ratio', 'ROE'
]

const headers = {
  'User-Agent': 'Mozilla/5.0 (compatible; StockApp/1.0)',
  'Origin': 'https://www.tradingview.com',
  'Referer': 'https://www.tradingview.com/',
  'Content-Type': 'application/json',
}

interface TVRow { s: string; d: unknown[] }

function parseRow(row: TVRow): StockQuote {
  // row.d order matches COLUMNS: name, description, close, change, change_abs, volume, ...
  const [, , name, close, change, , volume, avgVol, relVol, rsi, macd, macdSig,
    sma20, sma50, sma200, divYield, pe, mktCap, pbv, roe] = [row.s, ...row.d]
  const symbol = (row.s as string).replace('SET:', '')
  return {
    symbol,
    name: (name as string) || symbol,
    price: Number(close) || 0,
    change: Number(change) || 0,
    changePercent: Number(change) || 0,
    volume: (volume as number) ?? 0,
    avgVolume10d: (avgVol as number) ?? 0,
    relativeVolume: (relVol as number) ?? 1,
    rsi: (rsi as number) ?? null,
    macd: (macd as number) ?? null,
    macdSignal: (macdSig as number) ?? null,
    sma20: (sma20 as number) ?? null,
    sma50: (sma50 as number) ?? null,
    sma200: (sma200 as number) ?? null,
    dividendYield: (divYield as number) ?? null,
    pe: (pe as number) ?? null,
    marketCap: (mktCap as number) ?? null,
    pbv: (pbv as number) ?? null,
    roe: (roe as number) ?? null,
  }
}

let cachedStocks: StockQuote[] = []
let lastFetch = 0
const CACHE_MS = 5 * 60 * 1000

export async function getAllStocks(): Promise<StockQuote[]> {
  if (Date.now() - lastFetch < CACHE_MS && cachedStocks.length > 0) return cachedStocks
  try {
    const { data } = await axios.post(TV_URL, {
      columns: COLUMNS,
      filter: [{ left: 'type', operation: 'equal', right: 'stock' }],
      range: [0, 1500],
      sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' },
    }, { headers, timeout: 15000, httpsAgent })
    cachedStocks = (data.data as TVRow[])
      .filter((r) => !r.s.endsWith('.R'))
      .map(parseRow)
    lastFetch = Date.now()
    return cachedStocks
  } catch (err) {
    console.error('TradingView scan failed:', err)
    return cachedStocks
  }
}

export async function getMarketBreadth(): Promise<MarketBreadth> {
  const stocks = await getAllStocks()
  let advancing = 0, declining = 0, unchanged = 0
  for (const s of stocks) {
    if (s.change > 0) advancing++
    else if (s.change < 0) declining++
    else unchanged++
  }
  return { advancing, declining, unchanged, total: stocks.length }
}

export async function getTopMovers(n = 10) {
  const stocks = await getAllStocks()
  const sorted = [...stocks].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
  return {
    gainers: stocks.filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent).slice(0, n),
    losers: stocks.filter(s => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, n),
  }
}
