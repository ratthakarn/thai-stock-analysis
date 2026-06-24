import 'dotenv/config'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
import app from './app'

const port = Number(process.env.API_PORT ?? 3001)
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
