import express from 'express'
import { getQuote, getHistory, getIndexQuote } from './services/yahoo'
import { getMarketBreadth, getTopMovers } from './services/tradingview'
import { computeIndicators } from './services/indicators'
import { analyzeStock, summarizeNews } from './services/claude'
import { fetchNews } from './services/news'
import { getObject } from './services/filebase'
import { runScreener } from './services/screener'
import type { FundFlowDay } from '../src/types'

const app = express()
app.use(express.json())

// --- Market / Dashboard ---
app.get('/api/market/indices', async (_req, res) => {
  try {
    const [set, mai, sethd] = await Promise.all([
      getIndexQuote('^SET.BK'),
      getIndexQuote('^MAI.BK'),
      getIndexQuote('^SETHD.BK'),
    ])
    res.json([set, mai, sethd])
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.get('/api/market/breadth', async (_req, res) => {
  try {
    res.json(await getMarketBreadth())
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.get('/api/market/movers', async (_req, res) => {
  try {
    res.json(await getTopMovers(10))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// --- Stock ---
app.get('/api/stock/quote/:symbol', async (req, res) => {
  try {
    const q = await getQuote(req.params.symbol)
    res.json(q)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.get('/api/stock/history/:symbol', async (req, res) => {
  try {
    const period = (req.query.period as '3mo' | '6mo' | '1y' | '2y') || '1y'
    const bars = await getHistory(req.params.symbol, period)
    const chart = computeIndicators(bars)
    res.json(chart)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.get('/api/stock/news/:symbol', async (req, res) => {
  try {
    const items = await fetchNews(req.params.symbol)
    const withSentiment = await summarizeNews(items)
    res.json(withSentiment)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// --- AI Analysis ---
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { symbol } = req.body
    const [quote, bars, news, fundFlow] = await Promise.all([
      getQuote(symbol),
      getHistory(symbol, '1y').then(computeIndicators),
      fetchNews(symbol),
      getObject<FundFlowDay[]>('fundflow-history.json').then(d => d ?? []),
    ])
    const analysis = await analyzeStock(quote, bars, news, fundFlow)
    res.json(analysis)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// --- Fund Flow ---
app.get('/api/fundflow', async (_req, res) => {
  try {
    const data = await getObject<FundFlowDay[]>('fundflow-history.json')
    res.json(data ?? [])
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// --- Screener ---
app.get('/api/screener', async (_req, res) => {
  try {
    const results = await runScreener()
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// --- Screener cron (Vercel) ---
app.post('/api/cron/screener', async (req, res) => {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    await runScreener()
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

export default app
