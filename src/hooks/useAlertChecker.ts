import { useEffect } from 'react'
import { useAlerts } from '../stores/alerts'
import axios from 'axios'

export function useAlertChecker() {
  const { alerts, trigger } = useAlerts()

  useEffect(() => {
    const check = async () => {
      const active = alerts.filter((a) => !a.triggered)
      if (active.length === 0) return
      const symbols = [...new Set(active.map((a) => a.symbol))]
      await Promise.all(
        symbols.map(async (sym) => {
          try {
            const { data } = await axios.get(`/api/stock/quote/${sym}`)
            const price: number = data.price
            for (const alert of active.filter((a) => a.symbol === sym)) {
              if (alert.targetHigh !== null && price >= alert.targetHigh) {
                trigger(alert.id)
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification(`🔔 ${sym} ถึงราคาเป้าสูง ${alert.targetHigh}`, {
                    body: `ราคาปัจจุบัน: ${price.toFixed(2)} บาท`,
                  })
                }
              }
              if (alert.targetLow !== null && price <= alert.targetLow) {
                trigger(alert.id)
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification(`🔔 ${sym} ถึงราคาเป้าต่ำ ${alert.targetLow}`, {
                    body: `ราคาปัจจุบัน: ${price.toFixed(2)} บาท`,
                  })
                }
              }
            }
          } catch {}
        })
      )
    }

    check()
    const interval = setInterval(check, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [alerts, trigger])
}
