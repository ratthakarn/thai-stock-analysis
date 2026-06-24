import Anthropic from '@anthropic-ai/sdk'
import type { AIAnalysis, NewsItem, FundFlowDay, StockQuote, ChartBar } from '../../src/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_CACHE = `You are an expert Thai stock market analyst. Always respond with valid JSON only — no prose, no markdown fences. Follow the exact schema requested.`

function parseJSON<T>(text: string): T {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Cannot parse JSON from response')
  }
}

async function haikuChat(prompt: string): Promise<string> {
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: [{ type: 'text', text: SYSTEM_CACHE, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  })
  return (msg.content[0] as { text: string }).text
}

async function sonnetChat(prompt: string): Promise<string> {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: [{ type: 'text', text: SYSTEM_CACHE, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  })
  return (msg.content[0] as { text: string }).text
}

export async function analyzeStock(
  quote: StockQuote,
  chartData: ChartBar[],
  news: NewsItem[],
  fundFlow: FundFlowDay[]
): Promise<AIAnalysis> {
  const recent = chartData.slice(-30)
  const latestBar = recent[recent.length - 1]

  // 3 Haiku agents in parallel
  const [techResult, newsResult, fundResult] = await Promise.all([
    haikuChat(`Analyze technical indicators for ${quote.symbol} (${quote.name}):
Price: ${quote.price}, RSI: ${latestBar?.rsi}, MACD: ${latestBar?.macd}, Signal: ${latestBar?.macdSignal}
MA20: ${latestBar?.ma20}, MA50: ${latestBar?.ma50}, MA200: ${latestBar?.ma200}
BB Upper: ${latestBar?.bbUpper}, BB Lower: ${latestBar?.bbLower}
Last 10 closes: ${recent.slice(-10).map(b => b.close).join(', ')}
Return JSON: {"view":"bullish|neutral|bearish","summary":"<2 sentences in Thai>","strength":1-10}`),

    haikuChat(`Analyze news sentiment for ${quote.symbol}:
${news.slice(0, 5).map(n => `- ${n.title} (${n.sentiment})`).join('\n')}
Return JSON: {"view":"bullish|neutral|bearish","summary":"<2 sentences in Thai>","strength":1-10}`),

    haikuChat(`Analyze fund flow for ${quote.symbol}:
Last 5 days: ${fundFlow.slice(-5).map(d => `${d.date}: foreign=${d.foreign}M, inst=${d.institution}M`).join('; ')}
Return JSON: {"view":"bullish|neutral|bearish","summary":"<2 sentences in Thai>","strength":1-10}`),
  ])

  const tech = parseJSON<{ view: string; summary: string; strength: number }>(techResult)
  const newsView = parseJSON<{ view: string; summary: string; strength: number }>(newsResult)
  const fund = parseJSON<{ view: string; summary: string; strength: number }>(fundResult)

  // Sonnet CIO synthesis
  const cioPrompt = `You are the CIO synthesizing 3 analyst views for ${quote.symbol} at price ${quote.price} THB.
Technical analyst (strength ${tech.strength}/10): ${tech.summary}
News analyst (strength ${newsView.strength}/10): ${newsView.summary}
Fund flow analyst (strength ${fund.strength}/10): ${fund.summary}

Return JSON exactly:
{
  "verdict": "STRONG_BUY|BUY|NEUTRAL|SELL|STRONG_SELL",
  "summary": "<3-4 sentences in Thai>",
  "technicalView": "${tech.summary}",
  "newsView": "${newsView.summary}",
  "fundFlowView": "${fund.summary}",
  "buyZone": [lower, upper] or null,
  "sellZone": [lower, upper] or null,
  "target": number or null,
  "stopLoss": number or null
}`

  const cioResult = await sonnetChat(cioPrompt)
  return parseJSON<AIAnalysis>(cioResult)
}

export async function summarizeNews(items: NewsItem[]): Promise<NewsItem[]> {
  const results = await Promise.all(
    items.slice(0, 10).map(async (item) => {
      try {
        const res = await haikuChat(`Summarize this Thai stock news in 1 sentence Thai and classify sentiment:
Title: ${item.title}
Return JSON: {"summary":"<1 sentence>","sentiment":"bullish|neutral|bearish"}`)
        const parsed = parseJSON<{ summary: string; sentiment: 'bullish' | 'neutral' | 'bearish' }>(res)
        return { ...item, summary: parsed.summary, sentiment: parsed.sentiment }
      } catch {
        return item
      }
    })
  )
  return results
}

export async function generateScreenerSummary(symbol: string, score: number, details: string): Promise<string> {
  const res = await haikuChat(`Summarize why ${symbol} scored ${score}/10 in screener:
${details}
Return JSON: {"summary":"<2 sentences Thai>"}`)
  const parsed = parseJSON<{ summary: string }>(res)
  return parsed.summary
}
