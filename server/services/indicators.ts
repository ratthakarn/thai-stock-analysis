import TI from 'technicalindicators'
import type { OHLCVBar, ChartBar } from '../../src/types'

function pad<T>(arr: T[], targetLen: number, fill: T): T[] {
  const padding = Array(Math.max(0, targetLen - arr.length)).fill(fill)
  return [...padding, ...arr]
}

export function computeIndicators(bars: OHLCVBar[]): ChartBar[] {
  const closes = bars.map(b => b.close)
  const highs = bars.map(b => b.high)
  const lows = bars.map(b => b.low)
  const volumes = bars.map(b => b.volume)
  const n = bars.length

  const sma20 = pad(TI.SMA.calculate({ period: 20, values: closes }), n, null as unknown as number)
  const sma50 = pad(TI.SMA.calculate({ period: 50, values: closes }), n, null as unknown as number)
  const sma200 = pad(TI.SMA.calculate({ period: 200, values: closes }), n, null as unknown as number)
  const rsiRaw = pad(TI.RSI.calculate({ period: 14, values: closes }), n, null as unknown as number)
  const macdRaw = TI.MACD.calculate({ values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false })
  const macdPad = pad(macdRaw.map(m => m.MACD ?? null as unknown as number), n, null as unknown as number)
  const macdSigPad = pad(macdRaw.map(m => m.signal ?? null as unknown as number), n, null as unknown as number)

  const bbRaw = TI.BollingerBands.calculate({ period: 20, values: closes, stdDev: 2 })
  const bbUpper = pad(bbRaw.map(b => b.upper), n, null as unknown as number)
  const bbMiddle = pad(bbRaw.map(b => b.middle), n, null as unknown as number)
  const bbLower = pad(bbRaw.map(b => b.lower), n, null as unknown as number)

  const obvRaw = TI.OBV.calculate({ closePrice: closes, volume: volumes })
  const obv = pad(obvRaw, n, null as unknown as number)

  return bars.map((bar, i) => {
    const prev = i > 0 ? bars[i - 1].volume : bar.volume
    const delta = bar.close > (i > 0 ? bars[i - 1].close : bar.close) ? bar.volume : -bar.volume
    return {
      ...bar,
      ma20: sma20[i] ?? null,
      ma50: sma50[i] ?? null,
      ma200: sma200[i] ?? null,
      rsi: rsiRaw[i] ?? null,
      macd: macdPad[i] ?? null,
      macdSignal: macdSigPad[i] ?? null,
      bbUpper: bbUpper[i] ?? null,
      bbMiddle: bbMiddle[i] ?? null,
      bbLower: bbLower[i] ?? null,
      obv: obv[i] ?? null,
      volumeDelta: delta,
    }
  })
}
