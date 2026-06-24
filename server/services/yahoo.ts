import YahooFinance from 'yahoo-finance2'

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

export async function getQuote(symbol: string) {
  const yfSymbol = symbol.endsWith('.BK') ? symbol : `${symbol}.BK`
  const result = await yf.quote(yfSymbol)
  if (!result) throw new Error(`No data for ${yfSymbol}`)
  return {
    symbol,
    name: result.longName || result.shortName || symbol,
    price: result.regularMarketPrice ?? 0,
    change: result.regularMarketChange ?? 0,
    changePercent: result.regularMarketChangePercent ?? 0,
    volume: result.regularMarketVolume ?? 0,
    avgVolume10d: result.averageDailyVolume10Day ?? 0,
    relativeVolume: result.averageDailyVolume10Day
      ? (result.regularMarketVolume ?? 0) / result.averageDailyVolume10Day
      : 1,
    dividendYield: result.dividendYield ?? null,
    pe: result.trailingPE ?? null,
    marketCap: result.marketCap ?? null,
    pbv: result.priceToBook ?? null,
    rsi: null,
    macd: null,
    macdSignal: null,
    sma20: null,
    sma50: null,
    sma200: null,
    roe: null,
  }
}

export async function getHistory(symbol: string, period: '3mo' | '6mo' | '1y' | '2y' = '1y') {
  const yfSymbol = symbol.endsWith('.BK') ? symbol : `${symbol}.BK`
  const result = await yf.historical(yfSymbol, { period1: getPeriodStart(period), interval: '1d' })
  return result.map((bar) => ({
    date: bar.date.toISOString().split('T')[0],
    open: bar.open ?? 0,
    high: bar.high ?? 0,
    low: bar.low ?? 0,
    close: bar.close ?? 0,
    volume: bar.volume ?? 0,
  }))
}

export async function getIndexQuote(indexSymbol: string) {
  const result = await yf.quote(indexSymbol)
  if (!result) throw new Error(`No data for ${indexSymbol}`)
  return {
    symbol: indexSymbol,
    name: result.longName || result.shortName || indexSymbol,
    price: result.regularMarketPrice ?? 0,
    change: result.regularMarketChange ?? 0,
    changePercent: result.regularMarketChangePercent ?? 0,
  }
}

function getPeriodStart(period: string): string {
  const now = new Date()
  const map: Record<string, number> = { '3mo': 90, '6mo': 180, '1y': 365, '2y': 730 }
  now.setDate(now.getDate() - (map[period] ?? 365))
  return now.toISOString().split('T')[0]
}
