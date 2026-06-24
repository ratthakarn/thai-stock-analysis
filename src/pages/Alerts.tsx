import { useState, useEffect } from 'react'
import { useAlerts } from '../stores/alerts'
import Disclaimer from '../components/Disclaimer'

export default function Alerts() {
  const { alerts, add, remove } = useAlerts()
  const [form, setForm] = useState({ symbol: '', targetHigh: '', targetLow: '' })
  const [notifGranted, setNotifGranted] = useState(false)

  useEffect(() => {
    if ('Notification' in window) {
      setNotifGranted(Notification.permission === 'granted')
    }
  }, [])

  const requestNotif = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission()
      setNotifGranted(perm === 'granted')
    }
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.symbol) return
    add({
      symbol: form.symbol.toUpperCase(),
      targetHigh: form.targetHigh ? Number(form.targetHigh) : null,
      targetLow: form.targetLow ? Number(form.targetLow) : null,
    })
    setForm({ symbol: '', targetHigh: '', targetLow: '' })
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-white text-2xl font-bold">🔔 Price Alerts</h1>

      {!notifGranted && (
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4 flex items-center justify-between">
          <span className="text-yellow-300 text-sm">เปิด Web Notification เพื่อรับแจ้งเตือนราคา</span>
          <button onClick={requestNotif} className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm">
            เปิดใช้งาน
          </button>
        </div>
      )}

      <form onSubmit={handleAdd} className="bg-slate-800 rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-slate-400 text-xs block mb-1">หุ้น</label>
          <input className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 w-24 uppercase"
            value={form.symbol} onChange={e => setForm(s => ({ ...s, symbol: e.target.value.toUpperCase() }))}
            placeholder="PTT" required />
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">ราคาเป้าบน (บาท)</label>
          <input className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 w-32"
            type="number" step="0.01" value={form.targetHigh}
            onChange={e => setForm(s => ({ ...s, targetHigh: e.target.value }))}
            placeholder="ไม่กำหนด" />
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">ราคาเป้าล่าง (บาท)</label>
          <input className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 w-32"
            type="number" step="0.01" value={form.targetLow}
            onChange={e => setForm(s => ({ ...s, targetLow: e.target.value }))}
            placeholder="ไม่กำหนด" />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg">ตั้ง Alert</button>
      </form>

      <div className="space-y-2">
        {alerts.length === 0 && <div className="text-slate-400">ยังไม่มี alert — เพิ่มด้านบน</div>}
        {alerts.map(a => (
          <div key={a.id} className={`bg-slate-800 rounded-xl p-4 flex items-center gap-4 ${a.triggered ? 'opacity-50' : ''}`}>
            <div className="font-bold text-white text-lg">{a.symbol}</div>
            {a.targetHigh && <span className="text-green-400 text-sm">⬆ {a.targetHigh}</span>}
            {a.targetLow && <span className="text-red-400 text-sm">⬇ {a.targetLow}</span>}
            {a.triggered && <span className="text-yellow-400 text-xs ml-auto">✅ แจ้งเตือนแล้ว</span>}
            <button onClick={() => remove(a.id)} className="text-slate-500 hover:text-red-400 text-xs ml-auto">ลบ</button>
          </div>
        ))}
      </div>

      <Disclaimer />
    </div>
  )
}
