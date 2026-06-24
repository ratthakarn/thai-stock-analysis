export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  avgVolume10d: number
  relativeVolume: number
  rsi: number | null
  macd: number | null
  macdSignal: number | null
  sma20: number | null
  sma50: number | null
  sma200: number | null
  dividendYield: number | null
  pe: number | null
  marketCap: number | null
  pbv?: number | null
  roe?: number | null
}

export interface OHLCVBar {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface ChartBar extends OHLCVBar {
  ma20: number | null
  ma50: number | null
  ma200: number | null
  rsi: number | null
  macd: number | null
  macdSignal: number | null
  bbUpper: number | null
  bbMiddle: number | null
  bbLower: number | null
  obv: number | null
  volumeDelta: number | null
}

export interface MarketBreadth {
  advancing: number
  declining: number
  unchanged: number
  total: number
}

export interface IndexCard {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export interface FundFlowDay {
  date: string
  foreign: number
  institution: number
  proprietary: number
  individual: number
}

export interface NewsItem {
  title: string
  link: string
  pubDate: string
  source: string
  sentiment: 'bullish' | 'neutral' | 'bearish' | null
  summary: string | null
}

export type Verdict = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL'

export interface AIAnalysis {
  verdict: Verdict
  summary: string
  technicalView: string
  newsView: string
  fundFlowView: string
  buyZone: [number, number] | null
  sellZone: [number, number] | null
  target: number | null
  stopLoss: number | null
}

export interface ScreenerResult {
  symbol: string
  name: string
  price: number
  changePercent: number
  totalScore: number
  technicalScore: number
  volumeScore: number
  fundFlowScore: number
  dividendScore: number
  badge: '🔥 Strong Buy' | '✅ Watch' | null
  aiSummary: string | null
}

export interface WatchlistItem {
  symbol: string
  addedAt: string
}

export interface PortfolioItem {
  symbol: string
  shares: number
  avgCost: number
  addedAt: string
}

export interface PriceAlert {
  id: string
  symbol: string
  targetHigh: number | null
  targetLow: number | null
  triggered: boolean
  createdAt: string
}
