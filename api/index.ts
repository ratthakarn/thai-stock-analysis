import express from 'express'
import * as yahoo from '../server/services/yahoo.js'
import * as tradingview from '../server/services/tradingview.js'
import * as filebase from '../server/services/filebase.js'
import * as claude from '../server/services/claude.js'
import * as indicators from '../server/services/indicators.js'
import * as news from '../server/services/news.js'

const app = express()
app.use(express.json())

app.get('/api/debug', (_req, res) => {
  res.json({ indicators: typeof indicators, news: typeof news })
})

export default app
