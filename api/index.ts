import express from 'express'
import * as screener from '../server/services/screener.js'

const app = express()
app.use(express.json())

app.get('/api/debug', (_req, res) => {
  res.json({ screener: typeof screener, keys: Object.keys(screener) })
})

export default app
