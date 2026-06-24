import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WatchlistStore {
  symbols: string[]
  add: (symbol: string) => void
  remove: (symbol: string) => void
  has: (symbol: string) => boolean
}

export const useWatchlist = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      symbols: [],
      add: (symbol) => set((s) => ({ symbols: [...new Set([...s.symbols, symbol.toUpperCase()])] })),
      remove: (symbol) => set((s) => ({ symbols: s.symbols.filter((x) => x !== symbol.toUpperCase()) })),
      has: (symbol) => get().symbols.includes(symbol.toUpperCase()),
    }),
    { name: 'watchlist' }
  )
)
