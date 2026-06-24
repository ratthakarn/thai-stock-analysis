import express from 'express'
import * as yahoo from '../server/services/yahoo.js'
import * as tradingview from '../server/services/tradingview.js'
import * as filebase from '../server/services/filebase.js'
import * as claude from '../server/services/claude.js'
import * as indicators from '../server/services/indicators.js'
import * as news from '../server/services/news.js'
import * as screener from '../server/services/screener.js'

const app = express()
app.use(express.json())

app.get('/api/debug', (_req, res) => {
  res.json({
    yahoo: typeof yahoo,
    tradingview: typeof tradingview,
    filebase: typeof filebase,
    claude: typeof claude,
    indicators: typeof indicators,
    news: typeof news,
    screener: typeof screener,
  })
})

export default app
