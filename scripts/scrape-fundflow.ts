import 'dotenv/config'
import { chromium } from 'playwright'
import { putObject, getObject } from '../server/services/filebase.ts'
import type { FundFlowDay } from '../src/types.ts'

async function scrape(): Promise<FundFlowDay[]> {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false,
  })
  const page = await browser.newPage()

  console.log('Opening SET website...')
  await page.goto('https://www.set.or.th/th/market/get-in-the-market/report/investor-type', {
    waitUntil: 'networkidle',
    timeout: 30000,
  })

  console.log('Fetching fund flow data...')
  const raw = await page.evaluate(async () => {
    const res = await fetch('/api/set/market/SET/investor-type-chart?period=5D')
    return res.json()
  })
  await browser.close()

  const arr = Array.isArray(raw) ? raw : raw?.investorTypeChartData
  if (!arr) {
    console.error('Unexpected response:', JSON.stringify(raw).slice(0, 200))
    throw new Error('Cannot parse fund flow response')
  }

  const rows: FundFlowDay[] = arr.map((d: Record<string, unknown>) => ({
    date: String(d.date).slice(0, 10),
    foreign: Number(d.foreign ?? 0) / 1e6,
    institution: Number(d.institution ?? 0) / 1e6,
    proprietary: Number(d.proprietary ?? 0) / 1e6,
    individual: Number(d.individual ?? 0) / 1e6,
  }))

  return rows
}

async function main() {
  console.log('Scraping fund flow from SET...')
  const newData = await scrape()
  console.log(`Got ${newData.length} days:`, newData.map(d => d.date).join(', '))

  const existing = await getObject<FundFlowDay[]>('fundflow-history.json') ?? []
  const merged = [...existing]
  for (const row of newData) {
    const idx = merged.findIndex(r => r.date === row.date)
    if (idx >= 0) merged[idx] = row
    else merged.push(row)
  }
  merged.sort((a, b) => a.date.localeCompare(b.date))
  const last30 = merged.slice(-30)

  await putObject('fundflow-history.json', last30)
  console.log(`✅ Saved ${last30.length} days to Filebase`)
}

main().catch(console.error)
