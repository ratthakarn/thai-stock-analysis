import express from 'express'

const app = express()
app.use(express.json())

// Test: can we load individual services?
app.get('/api/debug', async (_req, res) => {
  const results: Record<string, string> = {}
  const mods = [
    ['axios', 'axios'],
    ['yahoo', '../server/services/yahoo.js'],
    ['tradingview', '../server/services/tradingview.js'],
    ['indicators', '../server/services/indicators.js'],
    ['filebase', '../server/services/filebase.js'],
    ['news', '../server/services/news.js'],
    ['claude', '../server/services/claude.js'],
    ['screener', '../server/services/screener.js'],
  ]
  for (const [name, path] of mods) {
    try {
      await import(path)
      results[name] = 'ok'
    } catch (e: unknown) {
      results[name] = (e as Error).message
    }
  }
  res.json(results)
})

app.get('/api/market/breadth', (_req, res) => res.json({ advancing: 0, declining: 0, unchanged: 0, total: 0, note: 'debug mode' }))
app.get('/api/stock/quote/:symbol', (req, res) => res.json({ symbol: req.params.symbol, note: 'debug mode' }))

export default app
