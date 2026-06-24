import express from 'express'
import * as yahoo from '../server/services/yahoo.js'
import * as tradingview from '../server/services/tradingview.js'
import * as filebase from '../server/services/filebase.js'
import * as claude from '../server/services/claude.js'

const app = express()
app.use(express.json())

app.get('/api/debug', (_req, res) => {
  res.json({
    yahoo: typeof yahoo,
    tradingview: typeof tradingview,
    filebase: typeof filebase,
    claude: typeof claude,
  })
})

export default app
