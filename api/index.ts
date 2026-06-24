import express from 'express'
import * as yahoo from '../server/services/yahoo.js'
import * as tradingview from '../server/services/tradingview.js'

const app = express()
app.use(express.json())

app.get('/api/debug', (_req, res) => {
  res.json({ yahoo: typeof yahoo, tradingview: typeof tradingview })
})

export default app
