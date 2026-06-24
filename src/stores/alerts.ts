import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PriceAlert } from '../types'

interface AlertStore {
  alerts: PriceAlert[]
  add: (alert: Omit<PriceAlert, 'id' | 'triggered' | 'createdAt'>) => void
  remove: (id: string) => void
  trigger: (id: string) => void
}

export const useAlerts = create<AlertStore>()(
  persist(
    (set) => ({
      alerts: [],
      add: (alert) =>
        set((s) => ({
          alerts: [
            ...s.alerts,
            {
              ...alert,
              id: Math.random().toString(36).slice(2),
              triggered: false,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      remove: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
      trigger: (id) =>
        set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, triggered: true } : a)) })),
    }),
    { name: 'price-alerts' }
  )
)
