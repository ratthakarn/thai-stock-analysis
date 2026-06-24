import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PortfolioItem } from '../types'

interface PortfolioStore {
  items: PortfolioItem[]
  add: (item: Omit<PortfolioItem, 'addedAt'>) => void
  remove: (symbol: string) => void
  update: (symbol: string, shares: number, avgCost: number) => void
}

export const usePortfolio = create<PortfolioStore>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => ({
          items: [
            ...s.items.filter((i) => i.symbol !== item.symbol.toUpperCase()),
            { ...item, symbol: item.symbol.toUpperCase(), addedAt: new Date().toISOString() },
          ],
        })),
      remove: (symbol) => set((s) => ({ items: s.items.filter((i) => i.symbol !== symbol.toUpperCase()) })),
      update: (symbol, shares, avgCost) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.symbol === symbol.toUpperCase() ? { ...i, shares, avgCost } : i
          ),
        })),
    }),
    { name: 'portfolio' }
  )
)
