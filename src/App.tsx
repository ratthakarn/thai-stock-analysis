import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import StockAnalysis from './pages/StockAnalysis'
import Watchlist from './pages/Watchlist'
import Portfolio from './pages/Portfolio'
import Alerts from './pages/Alerts'
import News from './pages/News'
import FundFlow from './pages/FundFlow'
import Screener from './pages/Screener'
import { useAlertChecker } from './hooks/useAlertChecker'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
})

function AppInner() {
  useAlertChecker()
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stock/:symbol" element={<StockAnalysis />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/news" element={<News />} />
          <Route path="/fundflow" element={<FundFlow />} />
          <Route path="/screener" element={<Screener />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
