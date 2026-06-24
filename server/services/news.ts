import Parser from 'rss-parser'
import type { NewsItem } from '../../src/types'

const parser = new Parser()

export async function fetchNews(symbol: string): Promise<NewsItem[]> {
  const query = encodeURIComponent(`${symbol} หุ้น SET ตลาดหลักทรัพย์`)
  const url = `https://news.google.com/rss/search?q=${query}&hl=th&gl=TH&ceid=TH:th`
  try {
    const feed = await parser.parseURL(url)
    return feed.items.slice(0, 15).map((item) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || '',
      source: item.creator || 'Google News',
      sentiment: null,
      summary: null,
    }))
  } catch {
    return []
  }
}
